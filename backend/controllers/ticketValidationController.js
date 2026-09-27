import { verifyQRTicket, extractBookingId } from '../utils/qrVerifier.js';
import AuditLog from '../models/AuditLog.js';

/**
 * Validate a QR ticket presentation at cinema gate
 * @route   POST /api/admin/tickets/validate
 * @access  Private (Admin / Staff)
 */
export const validateTicket = async (req, res, next) => {
  try {
    const {
      qrPayload,
      bookingId,
      gate = 'Gate 1',
      device = 'Handheld Scanner',
      targetShowId,
    } = req.body;
    const rawInput = qrPayload || bookingId;

    if (!rawInput) {
      return res.status(400).json({
        success: false,
        result: 'Denied',
        code: 'MISSING_PAYLOAD',
        message: 'QR code payload or booking ID is required for validation.',
      });
    }

    const verification = await verifyQRTicket(rawInput, targetShowId);
    const staffActor = {
      id: req.user?._id,
      name: req.user?.name || 'Staff User',
      email: req.user?.email || 'staff@bookmyshow.com',
      role: req.user?.role || 'admin',
    };

    // If verification succeeded: Mark booking as Checked-In
    if (verification.valid) {
      const booking = verification.booking;

      const checkedInAt = new Date();
      booking.status = 'Checked-In';
      booking.checkedInAt = checkedInAt;
      booking.checkedInBy = {
        userId: staffActor.id,
        staffId: staffActor.id,
        name: staffActor.name,
        staffName: staffActor.name,
        role: staffActor.role,
        gate,
        device,
      };

      // Append to scanHistory
      booking.scanHistory.push({
        scannedAt: checkedInAt,
        scannedBy: staffActor.name,
        gate,
        device,
        result: 'Valid',
        message: 'Entry Approved',
      });

      // Append to auditTrail
      booking.auditTrail.push({
        action: 'TICKET_VALIDATED',
        actor: staffActor.name,
        timestamp: checkedInAt,
        details: { gate, device, result: 'Valid' },
      });

      await booking.save();

      // Log to AuditLog collection
      await AuditLog.logAction({
        actor: staffActor,
        booking: booking._id,
        action: 'TICKET_VALIDATED',
        metadata: {
          gate,
          device,
          bookingId: booking.bookingId,
          movieTitle: booking.movie?.title,
          seats: booking.seats?.map((s) => (typeof s === 'string' ? s : s.seatNumber)),
          customerName: booking.user?.name,
          customerEmail: booking.user?.email,
        },
      });

      return res.status(200).json({
        success: true,
        result: 'Valid',
        message: 'Entry Approved',
        code: 'VALID',
        booking: {
          _id: booking._id,
          bookingId: booking.bookingId,
          movieTitle: booking.movie?.title,
          poster: booking.movie?.poster,
          duration: booking.movie?.duration,
          theaterName: booking.theater?.name,
          showDate: booking.show?.showDate,
          showTime: booking.show?.showTime,
          seats: booking.seats,
          totalAmount: booking.totalAmount,
          customerName: booking.user?.name,
          customerEmail: booking.user?.email,
          customerPhone: booking.user?.phone,
          status: booking.status,
          checkedInAt: booking.checkedInAt,
          checkedInBy: booking.checkedInBy,
        },
      });
    }

    // Verification FAILED
    const failedBooking = verification.booking;
    const scanTime = new Date();

    if (failedBooking) {
      // Record failed scan attempt on booking record for security auditing
      failedBooking.scanHistory.push({
        scannedAt: scanTime,
        scannedBy: staffActor.name,
        gate,
        device,
        result: verification.result,
        message: verification.message,
      });

      await failedBooking.save();

      const auditAction =
        verification.code === 'ALREADY_USED' ? 'DUPLICATE_SCAN_REJECTED' : 'ENTRY_DENIED';

      await AuditLog.logAction({
        actor: staffActor,
        booking: failedBooking._id,
        action: auditAction,
        metadata: {
          gate,
          device,
          code: verification.code,
          reason: verification.message,
          bookingId: failedBooking.bookingId,
          movieTitle: failedBooking.movie?.title,
          customerName: failedBooking.user?.name,
        },
      });
    } else {
      // Booking not found at all
      await AuditLog.logAction({
        actor: staffActor,
        action: 'ENTRY_DENIED',
        metadata: {
          gate,
          device,
          code: verification.code,
          reason: verification.message,
          rawInput: extractBookingId(rawInput),
        },
      });
    }

    // Determine status code
    let statusCode = 400;
    if (verification.code === 'ALREADY_USED') {
      statusCode = 409; // Conflict (Duplicate entry)
    } else if (verification.code === 'NOT_FOUND') {
      statusCode = 404;
    }

    return res.status(statusCode).json({
      success: false,
      result: verification.result,
      code: verification.code,
      message: verification.message,
      booking: failedBooking
        ? {
            _id: failedBooking._id,
            bookingId: failedBooking.bookingId,
            movieTitle: failedBooking.movie?.title,
            status: failedBooking.status,
            checkedInAt: failedBooking.checkedInAt,
            checkedInBy: failedBooking.checkedInBy,
            seats: failedBooking.seats,
            customerName: failedBooking.user?.name,
          }
        : null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve scan history and live kiosk telemetry
 * @route   GET /api/admin/tickets/history
 * @access  Private (Admin / Staff)
 */
export const getScanHistory = async (req, res, next) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const parsedPage = Math.max(1, parseInt(page, 10));
    const skip = (parsedPage - 1) * parsedLimit;

    const actionFilter = {
      action: {
        $in: ['TICKET_VALIDATED', 'DUPLICATE_SCAN_REJECTED', 'ENTRY_DENIED', 'MANUAL_CHECKIN'],
      },
    };

    const [logs, totalCount] = await Promise.all([
      AuditLog.find(actionFilter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parsedLimit)
        .populate({
          path: 'booking',
          select: 'bookingId movie theater show seats status totalAmount',
          populate: [
            { path: 'movie', select: 'title poster' },
            { path: 'theater', select: 'name' },
          ],
        }),
      AuditLog.countDocuments(actionFilter),
    ]);

    // Quick operational scan statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [scansToday, approvedToday, duplicatesToday, deniedToday] = await Promise.all([
      AuditLog.countDocuments({
        ...actionFilter,
        timestamp: { $gte: today },
      }),
      AuditLog.countDocuments({
        action: { $in: ['TICKET_VALIDATED', 'MANUAL_CHECKIN'] },
        timestamp: { $gte: today },
      }),
      AuditLog.countDocuments({
        action: 'DUPLICATE_SCAN_REJECTED',
        timestamp: { $gte: today },
      }),
      AuditLog.countDocuments({
        action: 'ENTRY_DENIED',
        timestamp: { $gte: today },
      }),
    ]);

    res.status(200).json({
      success: true,
      logs,
      pagination: {
        total: totalCount,
        page: parsedPage,
        limit: parsedLimit,
        pages: Math.ceil(totalCount / parsedLimit),
      },
      stats: {
        scansToday,
        approvedToday,
        duplicatesToday,
        deniedToday,
      },
    });
  } catch (error) {
    next(error);
  }
};
