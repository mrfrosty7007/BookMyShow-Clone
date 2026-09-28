import mongoose from 'mongoose';
import Movie from '../models/Movie.js';
import Theater from '../models/Theater.js';
import Show from '../models/Show.js';

const escapeRegex = (text) => {
  if (typeof text !== 'string') return '';
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * @desc    Get all active movies sorted by newest release date, optionally filtered by city
 * @route   GET /api/movies?city=Bengaluru
 * @access  Public
 */
export const getMovies = async (req, res) => {
  try {
    const query = { isActive: true };

    if (req.query.city && req.query.city.trim()) {
      const sanitizedCity = escapeRegex(req.query.city.trim());
      const theatersInCity = await Theater.find({
        city: { $regex: new RegExp(`^${sanitizedCity}$`, 'i') },
        isActive: true,
      })
        .select('_id')
        .lean();

      const theaterIds = theatersInCity.map((t) => t._id);

      const movieIdsInCity = await Show.distinct('movie', {
        theater: { $in: theaterIds },
        isActive: true,
        status: { $ne: 'cancelled' },
      });

      query._id = { $in: movieIdsInCity };
    }

    const movies = await Movie.find(query).sort({ releaseDate: -1 }).lean();

    return res.status(200).json({
      success: true,
      count: movies.length,
      movies,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get a single active movie by ID
 * @route   GET /api/movies/:id
 * @access  Public
 */
export const getMovieById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    const movie = await Movie.findById(id).lean();

    if (!movie || !movie.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    return res.status(200).json({
      success: true,
      movie,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Create a new movie
 * @route   POST /api/movies
 * @access  Public (or Admin in future)
 */
export const createMovie = async (req, res) => {
  try {
    const movie = await Movie.create(req.body);

    return res.status(201).json({
      success: true,
      movie,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Update movie details by ID
 * @route   PUT /api/movies/:id
 * @access  Public (or Admin in future)
 */
export const updateMovie = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    const movie = await Movie.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    return res.status(200).json({
      success: true,
      movie,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Soft delete (deactivate) a movie by ID
 * @route   DELETE /api/movies/:id
 * @access  Public (or Admin in future)
 */
export const deleteMovie = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    const movie = await Movie.findById(id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    movie.isActive = false;
    await movie.save();

    return res.status(200).json({
      success: true,
      message: 'Movie deactivated successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
