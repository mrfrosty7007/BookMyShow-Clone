import mongoose from 'mongoose';
import Show from '../models/Show.js';
import Movie from '../models/Movie.js';
import Theater from '../models/Theater.js';
import SeatLock from '../models/SeatLock.js';

/**
 * Helper to safely escape special regular expression characters from user input
 * @param {string} text - User input string to escape
 * @returns {string} - Escaped string safe for RegExp compilation
 */
const escapeRegex = (text) => {
  if (typeof text !== 'string') return '';
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Generates standard 100-seat theater layout (Rows A–J, Seats 1–10)
 * @returns {Array<{seatNumber: string, row: string, status: string}>}
 */
export const generateSeatLayout = () => {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const seatsPerRow = 10;
  const layout = [];

  for (const row of rows) {
    for (let num = 1; num <= seatsPerRow; num++) {
      layout.push({
        seatNumber: `${row}${num}`,
        row,
        status: 'available',
      });
    }
  }

  return layout;
};

/**
 * @desc    Get all active shows with optional filters (movie, theater, city, date)
 * @route   GET /api/shows
 * @access  Public
 */
export const getShows = async (req, res) => {
  try {
    const query = { isActive: true, status: { $ne: 'cancelled' } };

    if (req.query.movie) {
      if (!mongoose.Types.ObjectId.isValid(req.query.movie)) {
        return res.status(404).json({ success: false, message: 'Invalid movie ID' });
      }
      query.movie = req.query.movie;
    }

    if (req.query.theater) {
      if (!mongoose.Types.ObjectId.isValid(req.query.theater)) {
        return res.status(404).json({ success: false, message: 'Invalid theater ID' });
      }
      query.theater = req.query.theater;
    }

    if (req.query.city && req.query.city.trim()) {
      const sanitizedCity = escapeRegex(req.query.city.trim());
      const theatersInCity = await Theater.find({
        city: { $regex: new RegExp(`^${sanitizedCity}$`, 'i') },
        isActive: true,
      })
        .select('_id')
        .lean();

      const theaterIds = theatersInCity.map((t) => t._id);

      if (query.theater) {
        if (!theaterIds.some((id) => id.toString() === query.theater.toString())) {
          return res.status(200).json({ success: true, count: 0, shows: [] });
        }
      } else {
        query.theater = { $in: theaterIds };
      }
    }

    if (req.query.date) {
      const [year, month, day] = req.query.date.trim().split('-').map(Number);
      if (year && month && day) {
        const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
        const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
        query.showTime = { $gte: startOfDay, $lte: endOfDay };
      } else {
        const parsed = new Date(req.query.date.trim());
        if (!isNaN(parsed.getTime())) {
          const startOfDay = new Date(parsed);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(parsed);
          endOfDay.setHours(23, 59, 59, 999);
          query.showTime = { $gte: startOfDay, $lte: endOfDay };
        }
      }
    }

    const shows = await Show.find(query)
      .populate('movie')
      .populate('theater')
      .sort({ showTime: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: shows.length,
      shows,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get a single show by ID with populated movie and theater
 * @route   GET /api/shows/:id
 * @access  Public
 */
export const getShowById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Show not found',
      });
    }

    const show = await Show.findById(id).populate('movie').populate('theater').lean();

    if (!show || !show.isActive || show.status === 'cancelled') {
      return res.status(404).json({
        success: false,
        message: 'Show not found or has been cancelled',
      });
    }

    const targetShowTime = show.showTime || show.startTime;
    const showDate = new Date(targetShowTime);
    const time = showDate.toLocaleTimeString('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    const date = showDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    const showObj = show;

    // Standardized 10x12 auditorium categorized seat layout for Phase 3.1
    const seatLayout = {
      rows: 10,
      columns: 12,
      categories: {
        VIP: {
          name: 'VIP',
          rows: ['A', 'B'],
          price: 400,
        },
        Premium: {
          name: 'Premium',
          rows: ['C', 'D', 'E', 'F'],
          price: 300,
        },
        Regular: {
          name: 'Regular',
          rows: ['G', 'H', 'I', 'J'],
          price: 200,
        },
      },
    };

    // Extract booked seats from DB or use realistic seed
    const defaultMockBooked = ['A3', 'A4', 'B8', 'C5', 'C6', 'D9', 'F2', 'H7', 'J11'];
    const bookedInDb = Array.isArray(show.seats)
      ? show.seats.filter((s) => s.status === 'booked').map((s) => s.seatNumber)
      : [];
    const bookedSeats = bookedInDb.length > 0 ? bookedInDb : defaultMockBooked;

    // Phase 3.2: Query active unexpired seat locks for this show
    const activeLocks = await SeatLock.find({
      showId: id,
      expiresAt: { $gt: new Date() },
    }).lean();

    const lockedSeats = activeLocks.map((lock) => ({
      seatNumber: lock.seatNumber,
      userId: lock.userId,
      expiresIn: Math.max(0, Math.floor((lock.expiresAt.getTime() - Date.now()) / 1000)),
    }));

    return res.status(200).json({
      success: true,
      _id: show._id,
      time,
      date,
      price: show.price,
      screen: show.screen,
      movie: show.movie,
      theater: show.theater,
      seats: show.seats,
      seatLayout,
      bookedSeats,
      lockedSeats,
      show: {
        ...showObj,
        time,
        date,
        seatLayout,
        bookedSeats,
        lockedSeats,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Create a new show with automatic 100-seat layout generation
 * @route   POST /api/shows
 * @access  Public (or Admin/Partner in future)
 */
export const createShow = async (req, res) => {
  try {
    const { movie: movieId, theater: theaterId, screen, showTime, price } = req.body;

    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(404).json({
        success: false,
        message: 'Invalid movie ID',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(theaterId)) {
      return res.status(404).json({
        success: false,
        message: 'Invalid theater ID',
      });
    }

    const movie = await Movie.findById(movieId);
    if (!movie || !movie.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found or inactive',
      });
    }

    const theater = await Theater.findById(theaterId);
    if (!theater || !theater.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Theater not found or inactive',
      });
    }

    const seats = generateSeatLayout();

    const show = await Show.create({
      movie: movieId,
      theater: theaterId,
      screen,
      showTime,
      price,
      seats,
    });

    await show.populate(['movie', 'theater']);

    return res.status(201).json({
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
 * @desc    Update show details (showTime, price, screen) without overwriting seats
 * @route   PUT /api/shows/:id
 * @access  Public (or Admin/Partner in future)
 */
export const updateShow = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Show not found',
      });
    }

    const { showTime, price, screen } = req.body;
    const updateData = {};
    if (showTime !== undefined) updateData.showTime = showTime;
    if (price !== undefined) updateData.price = price;
    if (screen !== undefined) updateData.screen = screen;

    const show = await Show.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('movie')
      .populate('theater');

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found',
      });
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
 * @desc    Soft delete (deactivate) a show by ID
 * @route   DELETE /api/shows/:id
 * @access  Public (or Admin/Partner in future)
 */
export const deleteShow = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Show not found',
      });
    }

    const show = await Show.findById(id);

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found',
      });
    }

    show.isActive = false;
    await show.save();

    return res.status(200).json({
      success: true,
      message: 'Show deactivated successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get active shows for a specific movie, ordered by showtime
 * @route   GET /api/shows/movie/:movieId
 * @access  Public
 */
export const getShowsByMovie = async (req, res) => {
  try {
    const { movieId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(404).json({
        success: false,
        message: 'Invalid movie ID',
      });
    }

    const shows = await Show.find({ movie: movieId, isActive: true, status: { $ne: 'cancelled' } })
      .populate('movie')
      .populate('theater')
      .sort({ showTime: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: shows.length,
      shows,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
