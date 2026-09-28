import mongoose from 'mongoose';
import Theater from '../models/Theater.js';

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
 * @desc    Get all active theaters with optional city filtering
 * @route   GET /api/theaters?city=Bengaluru
 * @access  Public
 */
export const getTheaters = async (req, res) => {
  try {
    const query = { isActive: true };

    if (req.query.city && req.query.city.trim()) {
      const sanitizedCity = escapeRegex(req.query.city.trim());
      query.city = { $regex: new RegExp(`^${sanitizedCity}$`, 'i') };
    }

    const theaters = await Theater.find(query).sort({ name: 1 }).lean();

    return res.status(200).json({
      success: true,
      count: theaters.length,
      theaters,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get all unique cities with active theaters
 * @route   GET /api/theaters/cities
 * @access  Public
 */
export const getCities = async (_req, res) => {
  try {
    const cities = await Theater.distinct('city', { isActive: true });
    cities.sort((a, b) => a.localeCompare(b));

    return res.status(200).json({
      success: true,
      cities,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get a single active theater by ID
 * @route   GET /api/theaters/:id
 * @access  Public
 */
export const getTheaterById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Theater not found',
      });
    }

    const theater = await Theater.findById(id).lean();

    if (!theater || !theater.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Theater not found',
      });
    }

    return res.status(200).json({
      success: true,
      theater,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Create a new theater
 * @route   POST /api/theaters
 * @access  Public (or Admin in future)
 */
export const createTheater = async (req, res) => {
  try {
    const theater = await Theater.create(req.body);

    return res.status(201).json({
      success: true,
      theater,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Update a theater by ID
 * @route   PUT /api/theaters/:id
 * @access  Public (or Admin in future)
 */
export const updateTheater = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Theater not found',
      });
    }

    const theater = await Theater.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!theater) {
      return res.status(404).json({
        success: false,
        message: 'Theater not found',
      });
    }

    return res.status(200).json({
      success: true,
      theater,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Soft delete (deactivate) a theater by ID
 * @route   DELETE /api/theaters/:id
 * @access  Public (or Admin in future)
 */
export const deleteTheater = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Theater not found',
      });
    }

    const theater = await Theater.findById(id);

    if (!theater) {
      return res.status(404).json({
        success: false,
        message: 'Theater not found',
      });
    }

    theater.isActive = false;
    await theater.save();

    return res.status(200).json({
      success: true,
      message: 'Theater deactivated successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
