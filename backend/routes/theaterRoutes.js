import express from 'express';
import {
  getTheaters,
  getCities,
  getTheaterById,
  createTheater,
  updateTheater,
  deleteTheater,
} from '../controllers/theaterController.js';

const router = express.Router();

/**
 * @route   GET /api/theaters
 * @desc    Get all active theaters (optional query: ?city=Bengaluru)
 * @access  Public
 */
router.get('/', getTheaters);

/**
 * @route   GET /api/theaters/cities
 * @desc    Get all unique cities with active theaters
 * @access  Public
 * @note    Must be declared BEFORE /:id to prevent route shadowing
 */
router.get('/cities', getCities);

/**
 * @route   GET /api/theaters/:id
 * @desc    Get a single theater by ID
 * @access  Public
 */
router.get('/:id', getTheaterById);

/**
 * @route   POST /api/theaters
 * @desc    Create a new theater
 * @access  Public
 */
router.post('/', createTheater);

/**
 * @route   PUT /api/theaters/:id
 * @desc    Update theater details
 * @access  Public
 */
router.put('/:id', updateTheater);

/**
 * @route   DELETE /api/theaters/:id
 * @desc    Soft delete (deactivate) a theater
 * @access  Public
 */
router.delete('/:id', deleteTheater);

export default router;
