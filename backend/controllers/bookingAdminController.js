import Booking from '../models/Booking.js';
import Show from '../models/Show.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { calculateRefund } from '../utils/refundCalculator.js';
import { recoverExpiredSeatLocks } from '../utils/seatLockRecovery.js';

/**
 * Get all bookings with filtering, search, pagination, and KPI metrics
 * @route   GET /api/admin/bookings
 * @access  Private (Admin / Staff)
 */
export const getAdminBookings = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      date = '',
      movieId = '',
      theaterId = '',
      screen = '',
      showId = '',
      paymentStatus = '',
      status = '',
      attendanceStatus = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const parsedPage = Math.max(1, parseInt(page, 10));
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (parsedPage - 1) * parsedLimit;

    // Build query filter
    const query = {};

    // 1. Text & Identifier Search
    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');

      // Search users matching name, email, or phone
      const matchingUsers = await User.find({
        $or: [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }],
      }).select('_id');

      const userIds = matchingUsers.map((u) => u._id);

      query.$or = [{ bookingId: searchRegex }, { user: { $in: userIds } }];
    }

    // 2. Movie filter
    if (movieId) {
      query.movie = movieId;
    }

    // 3. Theater filter
    if (theaterId) {
      query.theater = theaterId;
    }

    // 4. Screen filter
    if (screen) {
      query.screen = Number(screen);
    }

    // 5. Show filter
    if (showId) {
      query.show = showId;
    }

    // 5. Payment Status filter
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    // 6. Booking / Attendance Status filter
    const targetStatus = status || attendanceStatus;
    if (targetStatus) {
      query.status = targetStatus;
    }

    // 7. Date filter (Show date or booking creation date)
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      query.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    // Sort order
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    // Fetch paginated bookings and total count
    const [bookings, totalBookings] = await Promise.all([
      Booking.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parsedLimit)
        .populate('user', 'name email phone')
        .populate('movie', 'title poster duration genre rating')
        .populate('theater', 'name city screens')
        .populate('show', 'showTime startTime screen screenName screenType price'),
      Booking.countDocuments(query),
    ]);

    // Compute Executive Dashboard KPIs
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      todayBookings,
      checkInsToday,
      totalCheckIns,
      pendingEntriesToday,
      refundRecords,
      revenueAggregation,
    ] = await Promise.all([
      // Bookings made today
      Booking.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),

      // Check-ins executed today
      Booking.countDocuments({
        status: 'Checked-In',
        checkedInAt: { $gte: today, $lt: tomorrow },
      }),

      // All-time check-ins
      Booking.countDocuments({ status: 'Checked-In' }),

      // Pending entries (Confirmed bookings awaiting entry)
      Booking.countDocuments({ status: 'Confirmed' }),

      // Refunds count and total
      Booking.aggregate([
        { $match: { status: 'Refunded' } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            totalRefunded: { $sum: '$refund.amount' },
          },
        },
      ]),

      // Total revenue from confirmed and checked-in bookings
      Booking.aggregate([
        { $match: { status: { $in: ['Confirmed', 'Checked-In'] } } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
          },
        },
      ]),
    ]);

    const refundStat = refundRecords[0] || { count: 0, totalRefunded: 0 };
    const totalRevenue = revenueAggregation[0]?.totalRevenue || 0;

    // Calculate approximate overall seat occupancy from active shows
    const activeShows = await Show.find({ isActive: true, status: { $ne: 'cancelled' } }).limit(50);
    let totalSeatsAcrossShows = 0;
    let bookedSeatsAcrossShows = 0;

    activeShows.forEach((s) => {
      if (Array.isArray(s.seats)) {
        totalSeatsAcrossShows += s.seats.length;
        bookedSeatsAcrossShows += s.seats.filter((st) => st.status === 'booked').length;
      }
    });

    const occupancyRate =
      totalSeatsAcrossShows > 0
        ? Math.round((bookedSeatsAcrossShows / totalSeatsAcrossShows) * 100)
        : 0;

    res.status(200).json({
      success: true,
      bookings,
      pagination: {
        total: totalBookings,
        page: parsedPage,
        limit: parsedLimit,
        pages: Math.ceil(totalBookings / parsedLimit),
      },
      kpis: {
        todayBookings,
        checkIns: checkInsToday,
        totalCheckIns,
        pendingEntries: pendingEntriesToday,
        refundsCount: refundStat.count,
        refundsAmount: refundStat.totalRefunded,
        revenue: totalRevenue,
        occupancy: occupancyRate,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve single booking by ID with complete audit history and scan logs
 * @route   GET /api/admin/bookings/:id
 * @access  Private (Admin / Staff)
 */
export const getAdminBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let query = { bookingId: id };
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      query = { $or: [{ _id: id }, { bookingId: id }] };
    }

    const booking = await Booking.findOne(query)
      .populate('user', 'name email phone')
      .populate('movie', 'title poster duration genre rating releaseDate')
      .populate('theater', 'name city screens address')
      .populate('show');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `Booking not found with identifier "${id}"`,
      });
    }

    // Retrieve related audit logs
    const auditLogs = await AuditLog.find({ booking: booking._id }).sort({ timestamp: 1 });

    res.status(200).json({
      success: true,
      booking,
      auditLogs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Manual check-in of a booking by theater staff
 * @route   PATCH /api/admin/bookings/:id/check-in
 * @access  Private (Admin / Staff)
 */
export const checkInBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { gate = 'Staff Desk', device = 'Admin Operations Console' } = req.body;

    let query = { bookingId: id };
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      query = { $or: [{ _id: id }, { bookingId: id }] };
    }

    const booking = await Booking.findOne(query)
      .populate('user', 'name email phone')
      .populate('movie', 'title')
      .populate('show');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `Booking not found with identifier "${id}"`,
      });
    }

    // 1. Duplicate check-in protection
    if (booking.status === 'Checked-In' || booking.checkedInAt) {
      const formattedTime = new Date(booking.checkedInAt).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      return res.status(409).json({
        success: false,
        result: 'Already Used',
        code: 'ALREADY_USED',
        message: `Duplicate Entry — Ticket was already scanned/checked-in at ${formattedTime}.`,
        booking,
      });
    }

    // 2. Status Validation
    if (booking.status === 'Cancelled' || booking.status === 'Refunded') {
      return res.status(400).json({
        success: false,
        result: 'Denied',
        message: `Cannot check in a ${booking.status.toLowerCase()} booking.`,
      });
    }

    if (booking.paymentStatus !== 'completed') {
      return res.status(400).json({
        success: false,
        result: 'Denied',
        message: `Cannot check in booking with payment status "${booking.paymentStatus}".`,
      });
    }

    const checkedInAt = new Date();
    const staffActor = {
      id: req.user?._id,
      name: req.user?.name || 'Staff User',
      email: req.user?.email || 'staff@bookmyshow.com',
      role: req.user?.role || 'admin',
    };

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

    booking.scanHistory.push({
      scannedAt: checkedInAt,
      scannedBy: staffActor.name,
      gate,
      device,
      result: 'Valid',
      message: 'Manual Staff Check-In',
    });

    booking.auditTrail.push({
      action: 'MANUAL_CHECKIN',
      actor: staffActor.name,
      timestamp: checkedInAt,
      details: { gate, device },
    });

    await booking.save();

    await AuditLog.logAction({
      actor: staffActor,
      booking: booking._id,
      action: 'MANUAL_CHECKIN',
      metadata: {
        gate,
        device,
        bookingId: booking.bookingId,
        movieTitle: booking.movie?.title,
        customerName: booking.user?.name,
      },
    });

    res.status(200).json({
      success: true,
      result: 'Valid',
      message: 'Manual Check-in Successful',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Process a booking refund, calculate time-tiered policy, and restore seat inventory
 * @route   PATCH /api/admin/bookings/:id/refund
 * @access  Private (Admin / Staff)
 */
export const processRefund = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      reason = 'Customer requested cancellation',
      overridePercent,
      overrideAmount,
    } = req.body;

    let query = { bookingId: id };
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      query = { $or: [{ _id: id }, { bookingId: id }] };
    }

    const booking = await Booking.findOne(query)
      .populate('user', 'name email')
      .populate('movie', 'title')
      .populate('show');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `Booking not found with identifier "${id}"`,
      });
    }

    // 1. Guard against double refunds
    if (booking.status === 'Refunded' || booking.paymentStatus === 'refunded') {
      return res.status(400).json({
        success: false,
        message: 'This booking has already been refunded.',
      });
    }

    // 2. Ensure payment was completed initially
    if (booking.paymentStatus !== 'completed') {
      return res.status(400).json({
        success: false,
        message: `Cannot refund a booking with payment status "${booking.paymentStatus}".`,
      });
    }

    // 3. Compute refund amount using time-tiered policy engine
    const showStartTime =
      booking.show?.startTime ||
      booking.show?.showTime ||
      new Date(Date.now() + 25 * 60 * 60 * 1000); // fallback to >24h if missing

    const calculation = calculateRefund({
      totalAmount: booking.totalAmount,
      showStartTime,
      overridePercentage: overridePercent !== undefined ? Number(overridePercent) : null,
      overrideAmount: overrideAmount !== undefined ? Number(overrideAmount) : null,
      overrideReason: reason,
    });

    const staffActor = {
      id: req.user?._id,
      name: req.user?.name || 'Admin User',
      email: req.user?.email || 'admin@bookmyshow.com',
      role: req.user?.role || 'admin',
    };

    const now = new Date();

    // 4. Update booking record
    booking.status = 'Refunded';
    booking.paymentStatus = 'refunded';
    booking.refund = {
      amount: calculation.refundableAmount,
      percentage: calculation.applicablePercentage,
      policyApplied: calculation.isOverride
        ? `Manual Override (${calculation.applicablePercentage}%)`
        : `${calculation.policyPercentage}% Policy`,
      reason,
      isOverridden: calculation.isOverride,
      processedAt: now,
      processedBy: staffActor.id,
    };

    booking.auditTrail.push({
      action: 'REFUND_PROCESSED',
      actor: staffActor.name,
      timestamp: now,
      details: {
        refundAmount: calculation.refundableAmount,
        originalAmount: calculation.originalAmount,
        percentage: calculation.applicablePercentage,
        isOverride: calculation.isOverride,
        reason,
      },
    });

    await booking.save();

    // 5. Restore seat inventory in Show model
    let restoredSeatCount = 0;
    if (booking.show && booking.show._id) {
      const showDoc = await Show.findById(booking.show._id);
      if (showDoc && Array.isArray(showDoc.seats)) {
        const bookedSeatNumbers = booking.seats.map((s) =>
          typeof s === 'string' ? s : s.seatNumber
        );
        showDoc.seats.forEach((seat) => {
          if (bookedSeatNumbers.includes(seat.seatNumber) && seat.status === 'booked') {
            seat.status = 'available';
            restoredSeatCount++;
          }
        });

        await showDoc.save();
      }
    }

    // 6. Create AuditLog entries
    await AuditLog.logAction({
      actor: staffActor,
      booking: booking._id,
      action: 'REFUND_PROCESSED',
      metadata: {
        bookingId: booking.bookingId,
        refundAmount: calculation.refundableAmount,
        originalAmount: calculation.originalAmount,
        deductionAmount: calculation.deductionAmount,
        applicablePercentage: calculation.applicablePercentage,
        isOverride: calculation.isOverride,
        reason,
      },
    });

    if (restoredSeatCount > 0) {
      await AuditLog.logAction({
        actor: staffActor,
        booking: booking._id,
        action: 'SEATS_RESTORED',
        metadata: {
          bookingId: booking.bookingId,
          showId: booking.show?._id,
          restoredSeatCount,
          seats: booking.seats.map((s) => (typeof s === 'string' ? s : s.seatNumber)),
        },
      });
    }

    res.status(200).json({
      success: true,
      message: `Refund of ₹${calculation.refundableAmount} processed successfully.`,
      refund: booking.refund,
      restoredSeatCount,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Trigger seat-lock recovery to clean up expired or abandoned holds
 * @route   POST /api/admin/seatlocks/recover
 * @access  Private (Admin / Staff)
 */
export const recoverSeatLocksEndpoint = async (req, res, next) => {
  try {
    const actor = {
      id: req.user?._id,
      name: req.user?.name || 'Admin User',
      email: req.user?.email || 'admin@bookmyshow.com',
      role: req.user?.role || 'admin',
    };

    const recoveryResult = await recoverExpiredSeatLocks(actor);

    res.status(200).json({
      success: true,
      message: `Recovered ${recoveryResult.expiredLocksRemoved} expired seat lock(s) across ${recoveryResult.affectedShowsCount} show(s).`,
      result: recoveryResult,
    });
  } catch (error) {
    next(error);
  }
};
