import mongoose from 'mongoose';
import Show from '../models/Show.js';
import Movie from '../models/Movie.js';
import Theater from '../models/Theater.js';
import { checkScreenConflict, formatTimeStr } from '../utils/showConflictChecker.js';
import { calculateShowPricing } from '../utils/pricingEngine.js';
import { generateSeatInventory } from '../utils/seatInventoryGenerator.js';

const escapeRegex = (text) => {
  if (typeof text !== 'string') return '';
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Calculates start and end boundaries for a given date string or Date object
 */
const getDateRange = (dateParam) => {
  if (!dateParam) return null;
  const parts = dateParam.toString().trim().split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts.map(Number);
    const start = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    const end = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
    return { start, end };
  }
  const parsed = new Date(dateParam);
  if (!isNaN(parsed.getTime())) {
    const start = new Date(parsed);
    start.setHours(0, 0, 0, 0);
    const end = new Date(parsed);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }
  return null;
};

/**
 * @desc    Get all shows for Admin Console with KPIs, filtering, and timeline mode
 * @route   GET /api/admin/shows
 * @access  Private (Admin only)
 */
export const getAdminShows = async (req, res) => {
  try {
    const {
      theater,
      screen,
      movie,
      date,
      status,
      search,
      timeline,
      page = 1,
      limit = 20,
    } = req.query;

    const query = { isActive: true };

    if (theater && mongoose.Types.ObjectId.isValid(theater)) {
      query.theater = theater;
    }

    if (screen) {
      if (mongoose.Types.ObjectId.isValid(screen)) {
        query.screenId = screen;
      } else if (!isNaN(Number(screen))) {
        query.screen = Number(screen);
      }
    }

    if (movie && mongoose.Types.ObjectId.isValid(movie)) {
      query.movie = movie;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (date) {
      const range = getDateRange(date);
      if (range) {
        query.startTime = { $gte: range.start, $lte: range.end };
      }
    }

    // Search by movie title if search keyword provided
    if (search && search.trim()) {
      const matchingMovies = await Movie.find({
        title: { $regex: escapeRegex(search.trim()), $options: 'i' },
      }).select('_id');
      const movieIds = matchingMovies.map((m) => m._id);
      query.movie = { $in: movieIds };
    }

    // If timeline view requested, return unpaginated matching shows for the theater & date
    if (timeline === 'true') {
      const shows = await Show.find(query)
        .populate('movie', 'title poster duration genre rating')
        .populate('theater', 'name city screens')
        .sort({ startTime: 1 });

      return res.status(200).json({
        success: true,
        count: shows.length,
        shows,
      });
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const [shows, total] = await Promise.all([
      Show.find(query)
        .populate('movie', 'title poster duration genre rating')
        .populate('theater', 'name city screens')
        .sort({ startTime: -1 })
        .skip(skip)
        .limit(limitNum),
      Show.countDocuments(query),
    ]);

    // Compute Executive Operational KPIs
    const now = new Date();
    const todayRange = getDateRange(now.toISOString().split('T')[0]);

    const [
      totalActiveShows,
      todayShowsCount,
      liveShowsCount,
      scheduledShowsCount,
      cancelledShowsCount,
      allActiveForStats,
    ] = await Promise.all([
      Show.countDocuments({ isActive: true }),
      todayRange
        ? Show.countDocuments({
            isActive: true,
            startTime: { $gte: todayRange.start, $lte: todayRange.end },
            status: { $ne: 'cancelled' },
          })
        : 0,
      Show.countDocuments({
        isActive: true,
        status: { $ne: 'cancelled' },
        startTime: { $lte: now },
        endTime: { $gte: now },
      }),
      Show.countDocuments({
        isActive: true,
        status: 'scheduled',
        startTime: { $gt: now },
      }),
      Show.countDocuments({
        status: 'cancelled',
      }),
      Show.find({ isActive: true, status: { $ne: 'cancelled' } }).select('seats price'),
    ]);

    let totalOccupancySum = 0;
    let totalRevenue = 0;
    let showsWithSeats = 0;

    allActiveForStats.forEach((sh) => {
      const seats = sh.seats || [];
      if (seats.length > 0) {
        const booked = seats.filter((s) => s.status === 'booked');
        totalOccupancySum += (booked.length / seats.length) * 100;
        showsWithSeats++;
        totalRevenue += booked.reduce((sum, s) => sum + (s.price || sh.price || 200), 0);
      }
    });

    const avgOccupancy = showsWithSeats > 0 ? Math.round(totalOccupancySum / showsWithSeats) : 0;

    const kpis = {
      totalShows: totalActiveShows,
      todayShows: todayShowsCount,
      liveShows: liveShowsCount,
      scheduledShows: scheduledShowsCount,
      cancelledShows: cancelledShowsCount,
      avgOccupancy,
      totalRevenue: Math.round(totalRevenue),
    };

    return res.status(200).json({
      success: true,
      count: shows.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      shows,
      kpis,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get single show details by ID
 * @route   GET /api/admin/shows/:id
 * @access  Private (Admin only)
 */
export const getAdminShowById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: 'Invalid show ID' });
    }

    const show = await Show.findById(id).populate('movie').populate('theater');

    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    return res.status(200).json({
      success: true,
      show,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Create a new show with conflict check, auto runtime/buffer calculation, pricing, and seat inventory
 * @route   POST /api/admin/shows
 * @access  Private (Admin only)
 */
export const createShow = async (req, res) => {
  try {
    const {
      movie: movieId,
      theater: theaterId,
      screen: screenInput,
      screenId,
      startTime: startTimeInput,
      price = 200,
      trailerBuffer = 15,
      cleaningBuffer = 20,
      recurring,
    } = req.body;

    if (!movieId || !theaterId || !startTimeInput) {
      return res.status(400).json({
        success: false,
        message: 'Movie, Theater, and Start Time are required fields.',
      });
    }

    const [movie, theater] = await Promise.all([
      Movie.findById(movieId),
      Theater.findById(theaterId),
    ]);

    if (!movie || !movie.isActive) {
      return res.status(404).json({ success: false, message: 'Movie not found or inactive.' });
    }

    if (!theater || !theater.isActive) {
      return res.status(404).json({ success: false, message: 'Theater not found or inactive.' });
    }

    // Locate the target screen inside the theater
    let screenObj = null;
    let screenNumber = 1;

    if (screenId && theater.screens?.length > 0) {
      screenObj = theater.screens.id(screenId);
      const index = theater.screens.findIndex((s) => s._id.toString() === screenId.toString());
      screenNumber = index >= 0 ? index + 1 : 1;
    } else if (screenInput && theater.screens?.length > 0) {
      screenNumber = Number(screenInput) || 1;
      screenObj = theater.screens[screenNumber - 1] || theater.screens[0];
    } else if (theater.screens?.length > 0) {
      screenObj = theater.screens[0];
      screenNumber = 1;
    }

    const screenName = screenObj?.name || `Screen ${screenNumber}`;
    const screenType = screenObj?.type || 'Standard';
    const movieDuration = movie.duration || 120;
    const totalMinutes = movieDuration + Number(trailerBuffer || 15) + Number(cleaningBuffer || 20);

    const baseStart = new Date(startTimeInput);
    if (isNaN(baseStart.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid start time format.' });
    }

    // Helper to build dates for recurring shows
    const scheduleDates = [];
    if (recurring && recurring.count > 1) {
      const count = Math.min(Number(recurring.count), 24); // Cap at 24 occurrences
      const type = recurring.type || 'daily';

      let currentDate = new Date(baseStart);
      let occurrences = 0;

      while (occurrences < count) {
        if (type === 'daily') {
          scheduleDates.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 1);
          occurrences++;
        } else if (type === 'weekdays') {
          const day = currentDate.getDay();
          if (day >= 1 && day <= 5) {
            scheduleDates.push(new Date(currentDate));
            occurrences++;
          }
          currentDate.setDate(currentDate.getDate() + 1);
        } else if (type === 'weekends') {
          const day = currentDate.getDay();
          if (day === 0 || day === 6) {
            scheduleDates.push(new Date(currentDate));
            occurrences++;
          }
          currentDate.setDate(currentDate.getDate() + 1);
        } else if (type === 'weekly') {
          scheduleDates.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 7);
          occurrences++;
        } else {
          scheduleDates.push(new Date(currentDate));
          occurrences++;
        }
      }
    } else {
      scheduleDates.push(baseStart);
    }

    // 1. Conflict Check across all occurrences
    for (const start of scheduleDates) {
      const end = new Date(start.getTime() + totalMinutes * 60 * 1000);
      const conflict = await checkScreenConflict({
        theaterId,
        screen: screenNumber,
        screenId: screenObj?._id,
        startTime: start,
        endTime: end,
      });

      if (conflict.hasConflict) {
        return res.status(409).json({
          success: false,
          message: conflict.message,
          conflict: conflict.conflict,
          suggestedNextAvailableTime: conflict.suggestedNextAvailableTime,
          suggestedTimeString: conflict.suggestedTimeString,
          conflictingDate: start.toISOString().split('T')[0],
        });
      }
    }

    // 2. Generate and Save Shows
    const recurringGroupId =
      scheduleDates.length > 1
        ? `REC_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`
        : null;

    const createdShows = [];

    for (const start of scheduleDates) {
      const end = new Date(start.getTime() + totalMinutes * 60 * 1000);
      const pricingSnapshot = calculateShowPricing(price, start, screenType);
      const seats = generateSeatInventory(screenObj, pricingSnapshot, price);

      const show = await Show.create({
        movie: movieId,
        theater: theaterId,
        screen: screenNumber,
        screenId: screenObj?._id || null,
        screenName,
        screenType,
        showTime: start,
        startTime: start,
        endTime: end,
        movieDuration,
        trailerBuffer: Number(trailerBuffer || 15),
        cleaningBuffer: Number(cleaningBuffer || 20),
        price: Number(price),
        pricingSnapshot,
        recurringGroupId,
        status: 'scheduled',
        seats,
      });

      createdShows.push(show);
    }

    return res.status(201).json({
      success: true,
      message: `Successfully scheduled ${createdShows.length} show(s).`,
      count: createdShows.length,
      shows: createdShows,
      show: createdShows[0], // Direct access convenience for single creates
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Bulk Scheduler: Create multiple show slots for a screen in a day
 * @route   POST /api/admin/shows/bulk
 * @access  Private (Admin only)
 */
export const bulkCreateShows = async (req, res) => {
  try {
    const {
      movie: movieId,
      theater: theaterId,
      screen: screenInput,
      screenId,
      date,
      timeSlots = [],
      price = 200,
      trailerBuffer = 15,
      cleaningBuffer = 20,
    } = req.body;

    if (!movieId || !theaterId || !date || !Array.isArray(timeSlots) || timeSlots.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Movie, Theater, Date, and an array of timeSlots are required.',
      });
    }

    const [movie, theater] = await Promise.all([
      Movie.findById(movieId),
      Theater.findById(theaterId),
    ]);

    if (!movie || !movie.isActive) {
      return res.status(404).json({ success: false, message: 'Movie not found or inactive.' });
    }

    if (!theater || !theater.isActive) {
      return res.status(404).json({ success: false, message: 'Theater not found or inactive.' });
    }

    let screenObj = null;
    let screenNumber = 1;

    if (screenId && theater.screens?.length > 0) {
      screenObj = theater.screens.id(screenId);
      const index = theater.screens.findIndex((s) => s._id.toString() === screenId.toString());
      screenNumber = index >= 0 ? index + 1 : 1;
    } else if (screenInput && theater.screens?.length > 0) {
      screenNumber = Number(screenInput) || 1;
      screenObj = theater.screens[screenNumber - 1] || theater.screens[0];
    } else if (theater.screens?.length > 0) {
      screenObj = theater.screens[0];
      screenNumber = 1;
    }

    const screenName = screenObj?.name || `Screen ${screenNumber}`;
    const screenType = screenObj?.type || 'Standard';
    const movieDuration = movie.duration || 120;
    const totalMinutes = movieDuration + Number(trailerBuffer || 15) + Number(cleaningBuffer || 20);

    const createdShows = [];
    const skippedSlots = [];

    for (const slotStr of timeSlots) {
      const [hours, minutes] = slotStr.split(':').map(Number);
      const dateParts = date.split('-').map(Number);
      // Construct time in Indian cinema timezone (+05:30) to prevent 5.5 hour UTC shifts
      const padH = String(hours).padStart(2, '0');
      const padM = String(minutes).padStart(2, '0');
      const start = new Date(`${date}T${padH}:${padM}:00+05:30`);
      const validStart = !isNaN(start.getTime())
        ? start
        : new Date(dateParts[0], dateParts[1] - 1, dateParts[2], hours, minutes, 0);
      const end = new Date(validStart.getTime() + totalMinutes * 60 * 1000);

      // Check conflict
      const conflict = await checkScreenConflict({
        theaterId,
        screen: screenNumber,
        screenId: screenObj?._id,
        startTime: validStart,
        endTime: end,
      });

      if (conflict.hasConflict) {
        skippedSlots.push({
          slot: slotStr,
          reason: conflict.message,
          suggestedTime: conflict.suggestedTimeString,
        });
        continue;
      }

      const pricingSnapshot = calculateShowPricing(price, validStart, screenType);
      const seats = generateSeatInventory(screenObj, pricingSnapshot, price);

      const show = await Show.create({
        movie: movieId,
        theater: theaterId,
        screen: screenNumber,
        screenId: screenObj?._id || null,
        screenName,
        screenType,
        showTime: validStart,
        startTime: validStart,
        endTime: end,
        movieDuration,
        trailerBuffer: Number(trailerBuffer || 15),
        cleaningBuffer: Number(cleaningBuffer || 20),
        price: Number(price),
        pricingSnapshot,
        status: 'scheduled',
        seats,
      });

      createdShows.push(show);
    }

    return res.status(201).json({
      success: true,
      message: `Bulk scheduled ${createdShows.length} show(s). Skipped ${skippedSlots.length} slot(s).`,
      count: createdShows.length,
      shows: createdShows,
      skippedSlots,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Quick Pre-flight conflict check endpoint for frontend reactive validation
 * @route   POST /api/admin/shows/check-conflict
 * @access  Private (Admin only)
 */
export const checkConflictEndpoint = async (req, res) => {
  try {
    const {
      theaterId,
      screen,
      screenId,
      startTime,
      duration = 120,
      trailerBuffer = 15,
      cleaningBuffer = 20,
      excludeShowId,
    } = req.body;

    if (!theaterId || !startTime) {
      return res
        .status(400)
        .json({ success: false, message: 'theaterId and startTime are required' });
    }

    const start = new Date(startTime);
    const totalMinutes = Number(duration) + Number(trailerBuffer) + Number(cleaningBuffer);
    const end = new Date(start.getTime() + totalMinutes * 60 * 1000);

    const result = await checkScreenConflict({
      theaterId,
      screen: Number(screen) || 1,
      screenId,
      startTime: start,
      endTime: end,
      excludeShowId,
    });

    return res.status(200).json({
      success: true,
      ...result,
      calculatedEndTime: end,
      calculatedEndTimeStr: formatTimeStr(end),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Update show details with conflict re-validation
 * @route   PUT /api/admin/shows/:id
 * @access  Private (Admin only)
 */
export const updateShow = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: 'Invalid show ID' });
    }

    const show = await Show.findById(id);
    if (!show || !show.isActive) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    const {
      startTime: startTimeInput,
      price,
      status,
      screen: screenInput,
      screenId,
      trailerBuffer,
      cleaningBuffer,
    } = req.body;

    const start = startTimeInput ? new Date(startTimeInput) : show.startTime;
    const tBuffer = trailerBuffer !== undefined ? Number(trailerBuffer) : show.trailerBuffer;
    const cBuffer = cleaningBuffer !== undefined ? Number(cleaningBuffer) : show.cleaningBuffer;
    const totalMinutes = show.movieDuration + tBuffer + cBuffer;
    const end = new Date(start.getTime() + totalMinutes * 60 * 1000);

    const screenNum = screenInput !== undefined ? Number(screenInput) : show.screen;
    const sId = screenId !== undefined ? screenId : show.screenId;

    // Check conflict if timing or screen changed
    if (startTimeInput || screenInput || screenId) {
      const conflict = await checkScreenConflict({
        theaterId: show.theater,
        screen: screenNum,
        screenId: sId,
        startTime: start,
        endTime: end,
        excludeShowId: show._id,
      });

      if (conflict.hasConflict) {
        return res.status(409).json({
          success: false,
          message: conflict.message,
          conflict: conflict.conflict,
          suggestedNextAvailableTime: conflict.suggestedNextAvailableTime,
          suggestedTimeString: conflict.suggestedTimeString,
        });
      }
    }

    show.startTime = start;
    show.showTime = start;
    show.endTime = end;
    show.screen = screenNum;
    show.screenId = sId;
    show.trailerBuffer = tBuffer;
    show.cleaningBuffer = cBuffer;

    if (price !== undefined) {
      show.price = Number(price);
      show.pricingSnapshot = calculateShowPricing(price, start, show.screenType);
    }

    if (status && ['scheduled', 'live', 'completed', 'cancelled'].includes(status)) {
      show.status = status;
    }

    await show.save();

    return res.status(200).json({
      success: true,
      message: 'Show updated successfully',
      show,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Cancel a show (frees up screen slot for conflicts and hides from customer booking)
 * @route   PATCH /api/admin/shows/:id/cancel
 * @access  Private (Admin only)
 */
export const cancelShow = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: 'Invalid show ID' });
    }

    const show = await Show.findById(id);
    if (!show || !show.isActive) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    show.status = 'cancelled';
    await show.save();

    return res.status(200).json({
      success: true,
      message: 'Show successfully cancelled. Screen is now available for new scheduling.',
      show,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Soft-delete a show
 * @route   DELETE /api/admin/shows/:id
 * @access  Private (Admin only)
 */
export const deleteShow = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: 'Invalid show ID' });
    }

    const show = await Show.findById(id);
    if (!show || !show.isActive) {
      return res.status(404).json({ success: false, message: 'Show not found or already deleted' });
    }

    show.isActive = false;
    show.deletedAt = new Date();
    await show.save();

    return res.status(200).json({
      success: true,
      message: 'Show deleted successfully.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  getAdminShows,
  getAdminShowById,
  createShow,
  bulkCreateShows,
  checkConflictEndpoint,
  updateShow,
  cancelShow,
  deleteShow,
};
