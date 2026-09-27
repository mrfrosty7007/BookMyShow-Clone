import mongoose from 'mongoose';
import Movie from '../models/Movie.js';

/**
 * Helper to normalize string or array inputs (e.g. from multipart form data)
 */
const parseArrayField = (field) => {
  if (Array.isArray(field)) return field;
  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // not JSON, split by comma
    }
    return field
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
};

/**
 * @desc    Create a new movie (Admin)
 * @route   POST /api/admin/movies
 * @access  Private (Admin)
 */
export const createMovie = async (req, res, next) => {
  try {
    const {
      title,
      description,
      genre,
      language,
      duration,
      releaseDate,
      rating,
      certificate,
      trailer,
      featured,
    } = req.body;

    // Handle uploaded files or fallback to text URLs
    let poster = req.body.poster || '';
    let backdrop = req.body.backdrop || req.body.banner || '';

    if (req.files?.poster?.[0]) {
      poster = `/uploads/movies/${req.files.poster[0].filename}`;
    }
    if (req.files?.backdrop?.[0]) {
      backdrop = `/uploads/movies/${req.files.backdrop[0].filename}`;
    } else if (req.files?.banner?.[0]) {
      backdrop = `/uploads/movies/${req.files.banner[0].filename}`;
    }

    if (!title || !description || !poster) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and poster are required.',
      });
    }

    const durationNum = Number(duration);
    if (!duration || isNaN(durationNum) || durationNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Duration must be a positive number of minutes.',
      });
    }

    const parsedRating = rating !== undefined && rating !== '' ? Number(rating) : 0;
    if (isNaN(parsedRating) || parsedRating < 0 || parsedRating > 10) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be a number between 0 and 10.',
      });
    }

    const movie = await Movie.create({
      title: title.trim(),
      description: description.trim(),
      poster: poster.trim(),
      backdrop: backdrop.trim(),
      banner: backdrop.trim(),
      duration: durationNum,
      releaseDate: releaseDate ? new Date(releaseDate) : new Date(),
      rating: parsedRating,
      certificate: certificate || 'U/A',
      genre: parseArrayField(genre),
      language: parseArrayField(language).length > 0 ? parseArrayField(language) : ['English'],
      trailer: trailer ? trailer.trim() : '',
      featured: featured === true || featured === 'true',
      isActive: true,
      deletedAt: null,
    });

    return res.status(201).json({
      success: true,
      message: 'Movie created successfully',
      movie,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all movies for admin table with search, filter, and pagination
 * @route   GET /api/admin/movies
 * @access  Private (Admin)
 */
export const getAdminMovies = async (req, res, next) => {
  try {
    const {
      search,
      genre,
      status = 'all', // 'all' | 'active' | 'inactive'
      featured,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = {};

    // Status filter
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    // Search by title or description
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    // Genre filter
    if (genre && genre !== 'all') {
      query.genre = { $in: [new RegExp(genre.trim(), 'i')] };
    }

    // Featured filter
    if (featured !== undefined && featured !== '') {
      query.featured = featured === 'true';
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [total, movies] = await Promise.all([
      Movie.countDocuments(query),
      Movie.find(query).sort(sortOptions).skip(skip).limit(limitNum),
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    return res.status(200).json({
      success: true,
      movies,
      pagination: {
        page: pageNum,
        totalPages,
        total,
        limit: limitNum,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update movie details and images (Admin)
 * @route   PUT /api/admin/movies/:id
 * @access  Private (Admin)
 */
export const updateMovie = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Invalid movie ID',
      });
    }

    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    const {
      title,
      description,
      genre,
      language,
      duration,
      releaseDate,
      rating,
      certificate,
      trailer,
      featured,
      isActive,
    } = req.body;

    if (title) movie.title = title.trim();
    if (description) movie.description = description.trim();
    if (genre !== undefined) movie.genre = parseArrayField(genre);
    if (language !== undefined) movie.language = parseArrayField(language);

    if (duration !== undefined) {
      const dur = Number(duration);
      if (isNaN(dur) || dur <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Duration must be a positive number',
        });
      }
      movie.duration = dur;
    }

    if (releaseDate) movie.releaseDate = new Date(releaseDate);

    if (rating !== undefined && rating !== '') {
      const parsedRating = Number(rating);
      if (isNaN(parsedRating) || parsedRating < 0 || parsedRating > 10) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 0 and 10',
        });
      }
      movie.rating = parsedRating;
    }

    if (certificate) movie.certificate = certificate;
    if (trailer !== undefined) movie.trailer = trailer.trim();
    if (featured !== undefined) movie.featured = featured === true || featured === 'true';
    if (isActive !== undefined) movie.isActive = isActive === true || isActive === 'true';

    // Image file uploads or updated URL strings
    if (req.files?.poster?.[0]) {
      movie.poster = `/uploads/movies/${req.files.poster[0].filename}`;
    } else if (req.body.poster) {
      movie.poster = req.body.poster.trim();
    }

    if (req.files?.backdrop?.[0]) {
      movie.backdrop = `/uploads/movies/${req.files.backdrop[0].filename}`;
      movie.banner = movie.backdrop;
    } else if (req.files?.banner?.[0]) {
      movie.backdrop = `/uploads/movies/${req.files.banner[0].filename}`;
      movie.banner = movie.backdrop;
    } else if (req.body.backdrop) {
      movie.backdrop = req.body.backdrop.trim();
      movie.banner = movie.backdrop;
    } else if (req.body.banner) {
      movie.banner = req.body.banner.trim();
      movie.backdrop = movie.banner;
    }

    await movie.save();

    return res.status(200).json({
      success: true,
      message: 'Movie updated successfully',
      movie,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Soft delete a movie (sets isActive: false, deletedAt: Date)
 * @route   DELETE /api/admin/movies/:id
 * @access  Private (Admin)
 */
export const deleteMovie = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Invalid movie ID',
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
    movie.deletedAt = new Date();
    await movie.save();

    return res.status(200).json({
      success: true,
      message: `Movie "${movie.title}" has been hidden from storefront`,
      movie,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Restore a soft-deleted movie (sets isActive: true, deletedAt: null)
 * @route   PATCH /api/admin/movies/:id/restore
 * @access  Private (Admin)
 */
export const restoreMovie = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Invalid movie ID',
      });
    }

    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    movie.isActive = true;
    movie.deletedAt = null;
    await movie.save();

    return res.status(200).json({
      success: true,
      message: `Movie "${movie.title}" has been restored to storefront`,
      movie,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle featured status for movie hero banner prominence
 * @route   PATCH /api/admin/movies/:id/featured
 * @access  Private (Admin)
 */
export const toggleFeatured = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Invalid movie ID',
      });
    }

    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    movie.featured = !movie.featured;
    await movie.save();

    return res.status(200).json({
      success: true,
      message: `Movie "${movie.title}" marked as ${movie.featured ? 'featured' : 'standard'}`,
      movie,
    });
  } catch (error) {
    next(error);
  }
};
