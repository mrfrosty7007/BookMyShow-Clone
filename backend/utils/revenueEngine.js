import Booking from '../models/Booking.js';
import mongoose from 'mongoose';

/**
 * Builds base match query for bookings considering global executive filters
 *
 * @param {object} filters
 * @param {Date|string} [filters.startDate]
 * @param {Date|string} [filters.endDate]
 * @param {string} [filters.movieId]
 * @param {string} [filters.theaterId]
 * @param {string} [filters.city]
 * @param {number|string} [filters.screen]
 * @returns {object} MongoDB match stage query
 */
export const buildBookingFilter = (filters = {}) => {
  const match = {
    paymentStatus: { $in: ['completed', 'refunded'] },
    status: { $in: ['Confirmed', 'Checked-In', 'Refunded'] },
  };

  if (filters.startDate || filters.endDate) {
    match.createdAt = {};
    if (filters.startDate) {
      match.createdAt.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      match.createdAt.$lte = end;
    }
  }

  if (filters.movieId && mongoose.Types.ObjectId.isValid(filters.movieId)) {
    match.movie = new mongoose.Types.ObjectId(filters.movieId);
  }

  if (filters.theaterId && mongoose.Types.ObjectId.isValid(filters.theaterId)) {
    match.theater = new mongoose.Types.ObjectId(filters.theaterId);
  }

  if (filters.screen) {
    match.screen = Number(filters.screen);
  }

  return match;
};

/**
 * Calculates high-level executive revenue metrics and growth comparisons
 *
 * @param {object} filters
 * @returns {Promise<object>}
 */
export const calculateRevenueMetrics = async (filters = {}) => {
  const match = buildBookingFilter(filters);

  // 1. Current Period Aggregation
  const [currentMetrics] = await Booking.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        grossRevenue: {
          $sum: {
            $cond: [{ $in: ['$status', ['Confirmed', 'Checked-In']] }, '$totalAmount', 0],
          },
        },
        netRevenue: {
          $sum: {
            $cond: [
              { $in: ['$status', ['Confirmed', 'Checked-In']] },
              '$totalAmount',
              { $subtract: ['$totalAmount', { $ifNull: ['$refund.amount', 0] }] },
            ],
          },
        },
        refundedRevenue: {
          $sum: { $ifNull: ['$refund.amount', 0] },
        },
        totalBookings: { $sum: 1 },
        confirmedBookings: {
          $sum: { $cond: [{ $in: ['$status', ['Confirmed', 'Checked-In']] }, 1, 0] },
        },
        totalTicketsSold: {
          $sum: {
            $cond: [
              { $in: ['$status', ['Confirmed', 'Checked-In']] },
              { $size: { $ifNull: ['$seats', []] } },
              0,
            ],
          },
        },
      },
    },
  ]);

  const grossRevenue = currentMetrics?.grossRevenue || 0;
  const netRevenue = currentMetrics?.netRevenue || 0;
  const refundedRevenue = currentMetrics?.refundedRevenue || 0;
  const totalBookings = currentMetrics?.totalBookings || 0;
  const confirmedBookings = currentMetrics?.confirmedBookings || 0;
  const totalTicketsSold = currentMetrics?.totalTicketsSold || 0;
  const averageOrderValue =
    confirmedBookings > 0 ? Math.round(grossRevenue / confirmedBookings) : 0;
  const averageTicketPrice = totalTicketsSold > 0 ? Math.round(grossRevenue / totalTicketsSold) : 0;

  // 2. Today's Revenue
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const [todayMetrics] = await Booking.aggregate([
    {
      $match: {
        ...match,
        createdAt: { $gte: todayStart, $lt: todayEnd },
      },
    },
    {
      $group: {
        _id: null,
        todayRevenue: {
          $sum: {
            $cond: [{ $in: ['$status', ['Confirmed', 'Checked-In']] }, '$totalAmount', 0],
          },
        },
        todayTickets: {
          $sum: {
            $cond: [
              { $in: ['$status', ['Confirmed', 'Checked-In']] },
              { $size: { $ifNull: ['$seats', []] } },
              0,
            ],
          },
        },
        todayBookings: { $sum: 1 },
      },
    },
  ]);

  const todayRevenue = todayMetrics?.todayRevenue || 0;
  const todayTickets = todayMetrics?.todayTickets || 0;
  const todayBookings = todayMetrics?.todayBookings || 0;

  // 3. Comparison with Previous Equivalent Period (for growth calculation)
  const now = new Date();
  const rangeDuration =
    filters.startDate && filters.endDate
      ? new Date(filters.endDate).getTime() - new Date(filters.startDate).getTime()
      : 30 * 24 * 60 * 60 * 1000; // default 30 days

  const priorEnd = filters.startDate
    ? new Date(filters.startDate)
    : new Date(now.getTime() - rangeDuration);
  const priorStart = new Date(priorEnd.getTime() - rangeDuration);

  const [priorMetrics] = await Booking.aggregate([
    {
      $match: {
        ...match,
        createdAt: { $gte: priorStart, $lt: priorEnd },
      },
    },
    {
      $group: {
        _id: null,
        priorRevenue: {
          $sum: {
            $cond: [{ $in: ['$status', ['Confirmed', 'Checked-In']] }, '$totalAmount', 0],
          },
        },
        priorTickets: {
          $sum: {
            $cond: [
              { $in: ['$status', ['Confirmed', 'Checked-In']] },
              { $size: { $ifNull: ['$seats', []] } },
              0,
            ],
          },
        },
      },
    },
  ]);

  const priorRevenue = priorMetrics?.priorRevenue || 0;
  const revenueGrowthPercent =
    priorRevenue > 0
      ? Number((((grossRevenue - priorRevenue) / priorRevenue) * 100).toFixed(1))
      : grossRevenue > 0
        ? 100
        : 0;

  return {
    grossRevenue,
    netRevenue,
    refundedRevenue,
    todayRevenue,
    todayTickets,
    todayBookings,
    totalBookings,
    confirmedBookings,
    totalTicketsSold,
    averageOrderValue,
    averageTicketPrice,
    priorRevenue,
    revenueGrowthPercent,
  };
};

/**
 * Generates aggregated time-series data for interactive charts
 *
 * @param {object} filters
 * @param {'daily'|'weekly'|'monthly'} [timeframe='daily']
 * @returns {Promise<Array<object>>}
 */
export const calculateRevenueTimeSeries = async (filters = {}, timeframe = 'daily') => {
  const match = buildBookingFilter(filters);

  let dateFormat = '%Y-%m-%d';
  if (timeframe === 'weekly') {
    dateFormat = '%Y-W%V';
  } else if (timeframe === 'monthly') {
    dateFormat = '%Y-%m';
  }

  const series = await Booking.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
        grossRevenue: {
          $sum: {
            $cond: [{ $in: ['$status', ['Confirmed', 'Checked-In']] }, '$totalAmount', 0],
          },
        },
        refundedAmount: { $sum: { $ifNull: ['$refund.amount', 0] } },
        ticketsSold: {
          $sum: {
            $cond: [
              { $in: ['$status', ['Confirmed', 'Checked-In']] },
              { $size: { $ifNull: ['$seats', []] } },
              0,
            ],
          },
        },
        bookingsCount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        date: '$_id',
        revenue: '$grossRevenue',
        netRevenue: { $subtract: ['$grossRevenue', '$refundedAmount'] },
        refundedAmount: '$refundedAmount',
        ticketsSold: '$ticketsSold',
        bookingsCount: '$bookingsCount',
        averageOrderValue: {
          $cond: [
            { $gt: ['$bookingsCount', 0] },
            { $round: [{ $divide: ['$grossRevenue', '$bookingsCount'] }, 0] },
            0,
          ],
        },
      },
    },
    { $sort: { date: 1 } },
  ]);

  return series;
};

export default {
  buildBookingFilter,
  calculateRevenueMetrics,
  calculateRevenueTimeSeries,
};
