import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Show from '../models/Show.js';
import SeatLock from '../models/SeatLock.js';
import { getIO } from '../socket/index.js';

// Tier price map based on auditorium layout
const getSeatPrice = (seatNumber) => {
  const row = seatNumber.charAt(0).toUpperCase();
  if (['A', 'B'].includes(row)) return 400; // VIP
  if (['C', 'D', 'E', 'F'].includes(row)) return 300; // Premium
  return 200; // Regular
};

/**
 * @desc    Create a new booking and finalize seat reservations
 * @route   POST /api/bookings/create
 * @access  Private (Authenticated users only)
 */
export const createBooking = async (req, res) => {
  try {
    const { showId, seats, paymentMethod = 'Simulation (UPI/Card)' } = req.body;
    const userId = req.user._id;

    if (!showId || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking data. showId and at least one seat are required.',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(showId)) {
      return res.status(404).json({
        success: false,
        message: 'Show not found',
      });
    }

    const show = await Show.findById(showId).populate('movie').populate('theater');
    if (!show || !show.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Show not found or is no longer active',
      });
    }

    // 1. Verify none of the requested seats are already permanently booked
    const alreadyBooked = show.seats?.filter(
      (s) => seats.includes(s.seatNumber) && s.status === 'booked'
    );
    if (alreadyBooked && alreadyBooked.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Seats ${alreadyBooked.map((s) => s.seatNumber).join(', ')} have already been permanently booked.`,
      });
    }

    // 2. Verify seat locks: ensure seats aren't actively held by another user
    const otherUserLocks = await SeatLock.find({
      showId,
      seatNumber: { $in: seats },
      userId: { $ne: userId.toString() },
      expiresAt: { $gt: new Date() },
    });

    if (otherUserLocks.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Seats ${otherUserLocks.map((l) => l.seatNumber).join(', ')} are currently reserved by another customer.`,
      });
    }

    // 3. Calculate financial totals server-side for integrity
    const subtotal = seats.reduce((sum, seatNumber) => sum + getSeatPrice(seatNumber), 0);
    const convenienceFee = 30; // Fixed ₹30
    const gst = Number((convenienceFee * 0.18).toFixed(2)); // ₹5.40
    const totalAmount = Number((subtotal + convenienceFee + gst).toFixed(2));

    // 4. Generate unique readable booking reference (e.g. BMS2026-X9K3)
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const bookingId = `BMS${Date.now().toString(36).toUpperCase()}${randomSuffix}`;

    const resolvedShowTime = show.showTime || show.startTime;
    const showDateObj = resolvedShowTime ? new Date(resolvedShowTime) : new Date();

    // 5. Generate secure QR token string with ISO showTime and IST fallback
    const qrData = {
      bookingId,
      movie: show.movie?.title || 'Cinema Movie',
      theater: show.theater?.name || 'Multiplex Cinema',
      screen: show.screen || 1,
      seats,
      showTime: resolvedShowTime ? new Date(resolvedShowTime).toISOString() : null,
      date: showDateObj.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }),
      time: showDateObj.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
      totalAmount,
    };
    const qrToken = JSON.stringify(qrData);

    // 6. Convert seats in Show model to permanently booked
    seats.forEach((seatNumber) => {
      const existingSeat = show.seats?.find((s) => s.seatNumber === seatNumber);
      if (existingSeat) {
        existingSeat.status = 'booked';
      } else {
        show.seats.push({
          seatNumber,
          row: seatNumber.charAt(0),
          status: 'booked',
        });
      }
    });
    await show.save();

    // 7. Delete temporary seat locks for these seats
    await SeatLock.deleteMany({
      showId,
      seatNumber: { $in: seats },
    });

    // 8. Create immutable Booking record with full show snapshot
    const booking = await Booking.create({
      user: userId,
      show: show._id,
      movie: show.movie._id,
      theater: show.theater._id,
      showTime: resolvedShowTime,
      screen: show.screen || 1,
      movieTitle: show.movie?.title || 'Cinema Movie',
      theaterName: show.theater?.name || 'Multiplex Cinema',
      seats,
      subtotal,
      convenienceFee,
      gst,
      totalAmount,
      bookingId,
      qrToken,
      paymentStatus: 'completed',
      paymentMethod,
    });

    // 9. Broadcast permanent booking confirmation via Socket.IO to show room
    try {
      const io = getIO();
      io.to(`show_${showId}`).emit('booking-confirmed', {
        showId: showId.toString(),
        bookedSeats: seats,
        userId: userId.toString(),
      });
    } catch {
      // Socket instance might not be initialized during isolated unit tests
    }

    // Populate references before returning
    const populatedBooking = await Booking.findById(booking._id)
      .populate('movie')
      .populate('theater')
      .populate('show')
      .populate('user', 'name email');

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: populatedBooking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get all bookings for the authenticated user (newest first)
 * @route   GET /api/bookings/me
 * @access  Private
 */
export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user._id;

    const bookings = await Booking.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('movie')
      .populate('theater')
      .populate('show');

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get booking details by ID or bookingId with authorization check
 * @route   GET /api/bookings/:id
 * @access  Private
 */
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { bookingId: id };

    const booking = await Booking.findOne(query)
      .populate('movie')
      .populate('theater')
      .populate('show')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Authorization: User can only access their own bookings (unless admin)
    const isOwner = booking.user?._id?.toString() === userId.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this booking ticket',
      });
    }

    return res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
