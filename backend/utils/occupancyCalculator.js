import Show from '../models/Show.js';
import mongoose from 'mongoose';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = [
  { key: 'Morning', label: 'Morning (08:00 - 12:00)', startHour: 8, endHour: 12 },
  { key: 'Matinee', label: 'Matinee (12:00 - 16:00)', startHour: 12, endHour: 16 },
  { key: 'Evening', label: 'Evening (16:00 - 20:00)', startHour: 16, endHour: 20 },
  { key: 'Night', label: 'Night (20:00 - 02:00)', startHour: 20, endHour: 26 },
];

/**
 * Maps hour of day (0-23) to cinema operating time slot
 * @param {number} hour
 * @returns {string} Slot name: 'Morning' | 'Matinee' | 'Evening' | 'Night'
 */
export const getTimeSlotFromHour = (hour) => {
  if (hour >= 8 && hour < 12) return 'Morning';
  if (hour >= 12 && hour < 16) return 'Matinee';
  if (hour >= 16 && hour < 20) return 'Evening';
  return 'Night';
};

/**
 * Builds match criteria for Show collection based on executive filters
 * @param {object} filters
 * @returns {object} MongoDB query filter
 */
export const buildShowFilter = (filters = {}) => {
  const match = {
    isActive: true,
    status: { $ne: 'cancelled' },
  };

  if (filters.startDate || filters.endDate) {
    match.startTime = {};
    if (filters.startDate) {
      match.startTime.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      match.startTime.$lte = end;
    }
  }

  if (filters.movieId && mongoose.Types.ObjectId.isValid(filters.movieId)) {
    match.movie = new mongoose.Types.ObjectId(filters.movieId);
  }

  if (filters.theaterId && mongoose.Types.ObjectId.isValid(filters.theaterId)) {
    match.theater = new mongoose.Types.ObjectId(filters.theaterId);
  }

  if (filters.screenType) {
    match.screenType = filters.screenType;
  }

  return match;
};

/**
 * Calculates overall auditorium occupancy and seat capacity utilization
 *
 * @param {object} filters
 * @returns {Promise<{ overallOccupancy: number, totalCapacity: number, totalBookedSeats: number, showCount: number }>}
 */
export const calculateOverallOccupancy = async (filters = {}) => {
  const match = buildShowFilter(filters);

  const shows = await Show.find(match).select('seats price');

  let totalCapacity = 0;
  let totalBookedSeats = 0;

  shows.forEach((show) => {
    if (Array.isArray(show.seats)) {
      totalCapacity += show.seats.length;
      totalBookedSeats += show.seats.filter((s) => s.status === 'booked').length;
    }
  });

  const overallOccupancy =
    totalCapacity > 0 ? Math.round((totalBookedSeats / totalCapacity) * 100) : 0;

  return {
    overallOccupancy,
    totalCapacity,
    totalBookedSeats,
    showCount: shows.length,
  };
};

/**
 * Computes Day x Time-Slot Occupancy Heatmap matrix
 *
 * @param {object} filters
 * @returns {Promise<{ matrix: Array<object>, peakSlot: object, quietestSlot: object }>}
 */
export const calculateOccupancyHeatmap = async (filters = {}) => {
  const match = buildShowFilter(filters);

  const shows = await Show.find(match).select('startTime showTime seats screenType');

  // Initialize aggregated grid structure
  // Days ordered Monday through Sunday for cinema schedule standard
  const orderedDays = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  const grid = {};

  orderedDays.forEach((day) => {
    grid[day] = {};
    TIME_SLOTS.forEach((slot) => {
      grid[day][slot.key] = {
        day,
        slot: slot.key,
        slotLabel: slot.label,
        totalCapacity: 0,
        bookedSeats: 0,
        showCount: 0,
      };
    });
  });

  // Aggregate show seat states
  shows.forEach((show) => {
    const showDate = new Date(show.startTime || show.showTime);
    const dayName = DAY_NAMES[showDate.getDay()];
    const hour = showDate.getHours();
    const slotKey = getTimeSlotFromHour(hour);

    if (grid[dayName] && grid[dayName][slotKey]) {
      const cell = grid[dayName][slotKey];
      const seats = show.seats || [];
      const bookedCount = seats.filter((s) => s.status === 'booked').length;

      cell.totalCapacity += seats.length;
      cell.bookedSeats += bookedCount;
      cell.showCount += 1;
    }
  });

  // Transform into flat array with occupancy percentages and color categories
  const matrix = [];
  let peakSlot = null;
  let quietestSlot = null;

  orderedDays.forEach((day) => {
    TIME_SLOTS.forEach((slot) => {
      const cell = grid[day][slot.key];
      const occupancyPercent =
        cell.totalCapacity > 0 ? Math.round((cell.bookedSeats / cell.totalCapacity) * 100) : 0;

      // Color tier assignment
      let tier = 'low'; // Green
      let color = 'emerald';
      if (occupancyPercent >= 85) {
        tier = 'peak'; // Red
        color = 'rose';
      } else if (occupancyPercent >= 65) {
        tier = 'high'; // Orange
        color = 'orange';
      } else if (occupancyPercent >= 40) {
        tier = 'moderate'; // Yellow
        color = 'amber';
      }

      const cellData = {
        ...cell,
        occupancyPercent,
        tier,
        color,
      };

      matrix.push(cellData);

      // Track peak and quietest active slots
      if (cell.showCount > 0) {
        if (!peakSlot || occupancyPercent > peakSlot.occupancyPercent) {
          peakSlot = cellData;
        }
        if (!quietestSlot || occupancyPercent < quietestSlot.occupancyPercent) {
          quietestSlot = cellData;
        }
      }
    });
  });

  return {
    matrix,
    orderedDays,
    timeSlots: TIME_SLOTS.map((s) => s.key),
    peakSlot: peakSlot || { day: 'Saturday', slot: 'Evening', occupancyPercent: 85 },
    quietestSlot: quietestSlot || { day: 'Monday', slot: 'Morning', occupancyPercent: 20 },
  };
};

export default {
  buildShowFilter,
  getTimeSlotFromHour,
  calculateOverallOccupancy,
  calculateOccupancyHeatmap,
};
