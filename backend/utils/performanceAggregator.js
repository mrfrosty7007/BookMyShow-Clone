import Booking from '../models/Booking.js';
import Show from '../models/Show.js';
import Movie from '../models/Movie.js';
import Theater from '../models/Theater.js';
import { buildBookingFilter } from './revenueEngine.js';
import { buildShowFilter, getTimeSlotFromHour } from './occupancyCalculator.js';

/**
 * Aggregates movie performance rankings (Top 10)
 *
 * @param {object} filters
 * @param {number} [limit=10]
 * @returns {Promise<Array<object>>}
 */
export const getMoviePerformance = async (filters = {}, limit = 10) => {
  const bookingMatch = buildBookingFilter(filters);

  // Group confirmed bookings by movie
  const movieAgg = await Booking.aggregate([
    { $match: bookingMatch },
    {
      $group: {
        _id: '$movie',
        revenue: {
          $sum: {
            $cond: [{ $in: ['$status', ['Confirmed', 'Checked-In']] }, '$totalAmount', 0],
          },
        },
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
    { $sort: { revenue: -1 } },
    { $limit: limit },
  ]);

  if (movieAgg.length === 0) {
    // If no bookings yet, return active movies with 0 metrics
    const sampleMovies = await Movie.find({})
      .limit(limit)
      .select('title poster genre rating duration');
    return sampleMovies.map((m) => ({
      movieId: m._id,
      title: m.title,
      poster: m.poster,
      genre: m.genre,
      rating: m.rating,
      revenue: 0,
      ticketsSold: 0,
      bookingsCount: 0,
      averageOccupancy: 0,
      showCount: 0,
    }));
  }

  // Populate movie details and show statistics
  const movieIds = movieAgg.map((m) => m._id);
  const [movieDocs, showStats] = await Promise.all([
    Movie.find({ _id: { $in: movieIds } }).select('title poster genre rating duration releaseDate'),
    Show.aggregate([
      {
        $match: {
          movie: { $in: movieIds },
          isActive: true,
          status: { $ne: 'cancelled' },
        },
      },
      {
        $project: {
          movie: 1,
          capacity: { $size: { $ifNull: ['$seats', []] } },
          booked: {
            $size: {
              $filter: {
                input: { $ifNull: ['$seats', []] },
                as: 'seat',
                cond: { $eq: ['$$seat.status', 'booked'] },
              },
            },
          },
        },
      },
      {
        $group: {
          _id: '$movie',
          showCount: { $sum: 1 },
          totalCapacity: { $sum: '$capacity' },
          totalBooked: { $sum: '$booked' },
        },
      },
    ]),
  ]);

  const movieMap = new Map(movieDocs.map((doc) => [doc._id.toString(), doc]));
  const showMap = new Map(showStats.map((s) => [s._id.toString(), s]));

  return movieAgg.map((agg) => {
    const mDoc = movieMap.get(agg._id.toString());
    const sStat = showMap.get(agg._id.toString()) || {
      showCount: 0,
      totalCapacity: 0,
      totalBooked: 0,
    };

    const avgOccupancy =
      sStat.totalCapacity > 0 ? Math.round((sStat.totalBooked / sStat.totalCapacity) * 100) : 0;

    return {
      movieId: agg._id,
      title: mDoc?.title || 'Unknown Title',
      poster: mDoc?.poster || '',
      genre: mDoc?.genre || [],
      rating: mDoc?.rating || 8.0,
      revenue: agg.revenue,
      ticketsSold: agg.ticketsSold,
      bookingsCount: agg.bookingsCount,
      averageOccupancy: avgOccupancy,
      showCount: sStat.showCount,
    };
  });
};

/**
 * Aggregates theater and screen format utilization
 *
 * @param {object} filters
 * @returns {Promise<object>}
 */
export const getTheaterUtilization = async (filters = {}) => {
  const showMatch = buildShowFilter(filters);

  // 1. Screen Type Format breakdown (IMAX, Dolby Atmos, 4DX, Standard, Gold Class, etc.)
  const screenTypeAgg = await Show.aggregate([
    { $match: showMatch },
    {
      $project: {
        screenType: { $ifNull: ['$screenType', 'Standard'] },
        price: 1,
        capacity: { $size: { $ifNull: ['$seats', []] } },
        booked: {
          $size: {
            $filter: {
              input: { $ifNull: ['$seats', []] },
              as: 'seat',
              cond: { $eq: ['$$seat.status', 'booked'] },
            },
          },
        },
      },
    },
    {
      $group: {
        _id: '$screenType',
        showCount: { $sum: 1 },
        totalCapacity: { $sum: '$capacity' },
        totalBooked: { $sum: '$booked' },
        averageTicketPrice: { $avg: '$price' },
      },
    },
    {
      $project: {
        _id: 0,
        screenType: '$_id',
        showCount: 1,
        totalCapacity: 1,
        totalBooked: 1,
        occupancyPercent: {
          $cond: [
            { $gt: ['$totalCapacity', 0] },
            { $round: [{ $multiply: [{ $divide: ['$totalBooked', '$totalCapacity'] }, 100] }, 0] },
            0,
          ],
        },
        estimatedRevenue: {
          $round: [{ $multiply: ['$totalBooked', '$averageTicketPrice'] }, 0],
        },
      },
    },
    { $sort: { estimatedRevenue: -1 } },
  ]);

  // 2. Individual Multiplex Performance
  const theaterDocs = await Theater.find({ isActive: true }).select('name city screens');
  const theaterMap = new Map(theaterDocs.map((t) => [t._id.toString(), t]));

  const theaterAgg = await Show.aggregate([
    { $match: showMatch },
    {
      $project: {
        theater: 1,
        screen: 1,
        price: 1,
        capacity: { $size: { $ifNull: ['$seats', []] } },
        booked: {
          $size: {
            $filter: {
              input: { $ifNull: ['$seats', []] },
              as: 'seat',
              cond: { $eq: ['$$seat.status', 'booked'] },
            },
          },
        },
      },
    },
    {
      $group: {
        _id: '$theater',
        showCount: { $sum: 1 },
        totalCapacity: { $sum: '$capacity' },
        totalBooked: { $sum: '$booked' },
        estimatedRevenue: {
          $sum: { $multiply: ['$booked', { $ifNull: ['$price', 250] }] },
        },
      },
    },
    { $sort: { estimatedRevenue: -1 } },
  ]);

  const theaterRankings = theaterAgg.map((agg) => {
    const tDoc = theaterMap.get(agg._id.toString());
    const screenCount = tDoc?.screens?.length || 1;
    const occupancyPercent =
      agg.totalCapacity > 0 ? Math.round((agg.totalBooked / agg.totalCapacity) * 100) : 0;
    const revenuePerScreen =
      screenCount > 0 ? Math.round(agg.estimatedRevenue / screenCount) : agg.estimatedRevenue;

    return {
      theaterId: agg._id,
      name: tDoc?.name || 'Multiplex Cinema',
      city: tDoc?.city || 'Metro',
      screenCount,
      showCount: agg.showCount,
      totalCapacity: agg.totalCapacity,
      totalBooked: agg.totalBooked,
      occupancyPercent,
      estimatedRevenue: agg.estimatedRevenue,
      revenuePerScreen,
    };
  });

  return {
    screenFormats: screenTypeAgg,
    theaters: theaterRankings,
  };
};

/**
 * Aggregates Time Slot Demand (Morning, Matinee, Evening, Night)
 *
 * @param {object} filters
 * @returns {Promise<Array<object>>}
 */
export const getTimeSlotDemand = async (filters = {}) => {
  const showMatch = buildShowFilter(filters);

  const shows = await Show.find(showMatch).select('startTime showTime seats price');

  const slots = {
    Morning: {
      slot: 'Morning',
      label: '08:00 - 12:00',
      bookings: 0,
      revenue: 0,
      capacity: 0,
      shows: 0,
    },
    Matinee: {
      slot: 'Matinee',
      label: '12:00 - 16:00',
      bookings: 0,
      revenue: 0,
      capacity: 0,
      shows: 0,
    },
    Evening: {
      slot: 'Evening',
      label: '16:00 - 20:00',
      bookings: 0,
      revenue: 0,
      capacity: 0,
      shows: 0,
    },
    Night: {
      slot: 'Night',
      label: '20:00 - 02:00',
      bookings: 0,
      revenue: 0,
      capacity: 0,
      shows: 0,
    },
  };

  shows.forEach((show) => {
    const time = new Date(show.startTime || show.showTime);
    const hour = time.getHours();
    const slotKey = getTimeSlotFromHour(hour);

    const s = slots[slotKey] || slots['Evening'];
    const seats = show.seats || [];
    const bookedCount = seats.filter((st) => st.status === 'booked').length;
    const price = show.price || 250;

    s.shows += 1;
    s.capacity += seats.length;
    s.bookings += bookedCount;
    s.revenue += bookedCount * price;
  });

  return Object.values(slots).map((slot) => ({
    ...slot,
    occupancyPercent: slot.capacity > 0 ? Math.round((slot.bookings / slot.capacity) * 100) : 0,
  }));
};

/**
 * Computes Customer Entry & Conversion Funnel
 * Stages: Created Bookings -> Paid Transactions -> Gate Checked-In
 *
 * @param {object} filters
 * @returns {Promise<object>}
 */
export const getEntryConversion = async (filters = {}) => {
  const match = {};

  if (filters.startDate || filters.endDate) {
    match.createdAt = {};
    if (filters.startDate) match.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      match.createdAt.$lte = end;
    }
  }

  const [funnel] = await Booking.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalCreated: { $sum: 1 },
        paidConfirmed: {
          $sum: { $cond: [{ $in: ['$status', ['Confirmed', 'Checked-In']] }, 1, 0] },
        },
        checkedIn: {
          $sum: { $cond: [{ $eq: ['$status', 'Checked-In'] }, 1, 0] },
        },
        refunded: {
          $sum: { $cond: [{ $eq: ['$status', 'Refunded'] }, 1, 0] },
        },
      },
    },
  ]);

  const totalCreated = funnel?.totalCreated || 0;
  const paidConfirmed = funnel?.paidConfirmed || 0;
  const checkedIn = funnel?.checkedIn || 0;
  const refunded = funnel?.refunded || 0;

  const paymentConversion =
    totalCreated > 0 ? Number(((paidConfirmed / totalCreated) * 100).toFixed(1)) : 100;

  const admissionConversion =
    paidConfirmed > 0 ? Number(((checkedIn / paidConfirmed) * 100).toFixed(1)) : 0;

  return {
    stages: [
      { name: 'Booked', count: totalCreated, conversionRate: 100, dropoff: 0 },
      {
        name: 'Paid & Confirmed',
        count: paidConfirmed,
        conversionRate: paymentConversion,
        dropoff: Math.max(0, totalCreated - paidConfirmed),
      },
      {
        name: 'Gate Checked-In',
        count: checkedIn,
        conversionRate: admissionConversion,
        dropoff: Math.max(0, paidConfirmed - checkedIn),
      },
    ],
    totalCreated,
    paidConfirmed,
    checkedIn,
    refunded,
    paymentConversionRate: paymentConversion,
    admissionConversionRate: admissionConversion,
  };
};

/**
 * Computes Refund Intelligence & Operational Trend
 *
 * @param {object} filters
 * @returns {Promise<object>}
 */
export const getRefundIntelligence = async (filters = {}) => {
  const match = { status: 'Refunded' };

  if (filters.startDate || filters.endDate) {
    match.createdAt = {};
    if (filters.startDate) match.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      match.createdAt.$lte = end;
    }
  }

  // 1. Group by Reason / Policy
  const reasonsAgg = await Booking.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $ifNull: ['$refund.reason', 'Standard Cancellation'] },
        count: { $sum: 1 },
        totalAmount: { $sum: { $ifNull: ['$refund.amount', 0] } },
      },
    },
    { $sort: { count: -1 } },
  ]);

  // 2. Timeline Trend
  const timelineAgg = await Booking.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: { $ifNull: ['$refund.processedAt', '$updatedAt'] },
          },
        },
        count: { $sum: 1 },
        amount: { $sum: { $ifNull: ['$refund.amount', 0] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // 3. Overall Refund Ratio vs Total Completed Bookings
  const [totalCompleted, totalRefunded] = await Promise.all([
    Booking.countDocuments({ status: { $in: ['Confirmed', 'Checked-In', 'Refunded'] } }),
    Booking.countDocuments(match),
  ]);

  const refundRatePercent =
    totalCompleted > 0 ? Number(((totalRefunded / totalCompleted) * 100).toFixed(1)) : 0;

  return {
    refundCount: totalRefunded,
    refundRatePercent,
    reasons: reasonsAgg.map((r) => ({
      reason: r._id,
      count: r.count,
      amount: r.totalAmount,
    })),
    timeline: timelineAgg.map((t) => ({
      date: t._id,
      count: t.count,
      amount: t.amount,
    })),
  };
};

/**
 * Dynamically synthesizes automated Executive Insights from aggregated business data
 *
 * @param {object} params
 * @returns {Array<object>} Synthesized insight bullet points
 */
export const generateExecutiveInsights = ({
  revenue = {},
  occupancy = {},
  movies = [],
  theaters = {},
  timeslots = [],
  conversion = {},
  refunds = {},
}) => {
  const insights = [];

  // Insight 0: Overall Seat Occupancy Health
  if (occupancy?.overallOccupancy !== undefined && occupancy.overallOccupancy > 0) {
    insights.push({
      type: occupancy.overallOccupancy >= 70 ? 'peak' : 'positive',
      category: 'Occupancy',
      text: `Auditorium seat utilization is pacing at ${occupancy.overallOccupancy}% across active multiplex screens.`,
      metric: `${occupancy.overallOccupancy}% Capacity`,
    });
  }

  // Insight 1: Premium Screen Format Alpha (e.g. IMAX performance)
  const imaxFormat = theaters.screenFormats?.find((f) => f.screenType === 'IMAX');
  const standardFormat = theaters.screenFormats?.find((f) => f.screenType === 'Standard');
  if (imaxFormat && standardFormat && imaxFormat.occupancyPercent > 0) {
    const diff = imaxFormat.occupancyPercent - standardFormat.occupancyPercent;
    if (diff > 0) {
      insights.push({
        type: 'growth',
        category: 'Formats',
        text: `IMAX screens generated ${diff}% higher auditorium occupancy than Standard screens.`,
        metric: `+${diff}% Occupancy`,
      });
    }
  }

  // Insight 2: Peak Time Slot Driver
  const topSlot = timeslots.reduce(
    (max, s) => (s.occupancyPercent > (max?.occupancyPercent || 0) ? s : max),
    null
  );
  if (topSlot && topSlot.occupancyPercent > 0) {
    insights.push({
      type: 'peak',
      category: 'Scheduling',
      text: `${topSlot.slot} shows reached peak customer demand with ${topSlot.occupancyPercent}% seat occupancy.`,
      metric: `${topSlot.occupancyPercent}% Peak`,
    });
  }

  // Insight 3: Box Office Leader
  const topMovie = movies[0];
  if (topMovie && topMovie.revenue > 0) {
    insights.push({
      type: 'driver',
      category: 'Box Office',
      text: `"${topMovie.title}" is the leading revenue driver, contributing ₹${topMovie.revenue.toLocaleString()} across ${topMovie.showCount} shows.`,
      metric: `Top Movie`,
    });
  }

  // Insight 4: Gate Check-in Rate
  if (conversion.admissionConversionRate !== undefined) {
    const admissionRate = conversion.admissionConversionRate;
    insights.push({
      type: admissionRate >= 90 ? 'positive' : 'warning',
      category: 'Operations',
      text: `Customer gate admission rate is operating at ${admissionRate}%, indicating smooth cinema entry.`,
      metric: `${admissionRate}% Check-In`,
    });
  }

  // Insight 5: Revenue Growth Velocity
  if (revenue.revenueGrowthPercent !== undefined && revenue.revenueGrowthPercent !== 0) {
    const isPos = revenue.revenueGrowthPercent > 0;
    insights.push({
      type: isPos ? 'growth' : 'warning',
      category: 'Revenue',
      text: `Gross box office revenue is ${isPos ? 'up' : 'down'} ${Math.abs(revenue.revenueGrowthPercent)}% compared to the previous period.`,
      metric: `${isPos ? '+' : ''}${revenue.revenueGrowthPercent}%`,
    });
  }

  // Insight 6: Refund Health
  if (refunds.refundRatePercent !== undefined) {
    insights.push({
      type: refunds.refundRatePercent < 5 ? 'positive' : 'warning',
      category: 'Risk',
      text: `Ticket refund rate is contained at ${refunds.refundRatePercent}%, safely within the target threshold of <5%.`,
      metric: `${refunds.refundRatePercent}% Rate`,
    });
  }

  return insights;
};

export default {
  getMoviePerformance,
  getTheaterUtilization,
  getTimeSlotDemand,
  getEntryConversion,
  getRefundIntelligence,
  generateExecutiveInsights,
};
