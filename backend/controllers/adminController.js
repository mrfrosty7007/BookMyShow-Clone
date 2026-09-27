import User from '../models/User.js';
import Movie from '../models/Movie.js';
import Theater from '../models/Theater.js';
import Show from '../models/Show.js';
import Booking from '../models/Booking.js';
import { generateTokenAndSetCookie } from '../utils/generateToken.js';

/**
 * @desc    Authenticate admin user & set token cookie
 * @route   POST /api/admin/login
 * @access  Public
 */
export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide both email and password',
      });
    }

    // Find user including hidden password field
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password credentials',
      });
    }

    // Enforce admin role
    if (user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You do not have administrator privileges.',
      });
    }

    // Generate JWT and set HTTP-only cookie
    const token = generateTokenAndSetCookie(res, user._id);

    return res.status(200).json({
      status: 'ok',
      message: 'Administrator authenticated successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current authenticated admin profile
 * @route   GET /api/admin/profile
 * @access  Private (Admin only)
 */
export const getAdminProfile = async (req, res, next) => {
  try {
    return res.status(200).json({
      status: 'ok',
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get live aggregation statistics for Admin Dashboard
 * @route   GET /api/admin/dashboard
 * @access  Private (Admin only)
 */
export const getAdminDashboard = async (req, res, next) => {
  try {
    // 1. Parallel execution for high-performance aggregate counts
    const [
      totalUsers,
      totalMovies,
      totalTheaters,
      totalShows,
      totalBookings,
      revenueAggregation,
      seatsBookedAggregation,
      recentBookings,
      topMoviesAggregation,
    ] = await Promise.all([
      User.countDocuments({}),
      Movie.countDocuments({ isActive: true }),
      Theater.countDocuments({ isActive: true }),
      Show.countDocuments({ isActive: true }),
      Booking.countDocuments({}),

      // Aggregate revenue
      Booking.aggregate([
        { $match: { paymentStatus: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),

      // Aggregate seats booked
      Booking.aggregate([{ $group: { _id: null, totalSeats: { $sum: { $size: '$seats' } } } }]),

      // Fetch 8 most recent bookings with relations
      Booking.find({})
        .sort({ createdAt: -1 })
        .limit(8)
        .populate('movie', 'title poster genre duration')
        .populate('theater', 'name city')
        .populate('user', 'name email'),

      // Top movies by revenue and ticket volume
      Booking.aggregate([
        { $match: { paymentStatus: 'completed' } },
        {
          $group: {
            _id: '$movie',
            bookingCount: { $sum: 1 },
            totalRevenue: { $sum: '$totalAmount' },
            totalSeats: { $sum: { $size: '$seats' } },
          },
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'movies',
            localField: '_id',
            foreignField: '_id',
            as: 'movieDetails',
          },
        },
        { $unwind: { path: '$movieDetails', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            title: { $ifNull: ['$movieDetails.title', 'Archived Movie'] },
            poster: { $ifNull: ['$movieDetails.poster', ''] },
            genre: { $ifNull: ['$movieDetails.genre', []] },
            bookingCount: 1,
            totalRevenue: 1,
            totalSeats: 1,
          },
        },
      ]),
    ]);

    const totalRevenue = revenueAggregation[0]?.total || 0;
    const totalSeatsBooked = seatsBookedAggregation[0]?.totalSeats || 0;

    return res.status(200).json({
      status: 'ok',
      data: {
        metrics: {
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalBookings,
          totalMovies,
          totalTheaters,
          totalShows,
          totalUsers,
          totalSeatsBooked,
        },
        recentBookings,
        topMovies: topMoviesAggregation,
      },
    });
  } catch (error) {
    next(error);
  }
};
