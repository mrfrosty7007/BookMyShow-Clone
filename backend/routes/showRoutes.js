import express from 'express';
import {
  getShows,
  getShowsByMovie,
  getShowById,
  createShow,
  updateShow,
  deleteShow,
} from '../controllers/showController.js';

const router = express.Router();

/**
 * @route   GET /api/shows
 * @desc    Get all active shows with optional filters (movie, theater, city, date)
 * @access  Public
 */
router.get('/', getShows);

/**
 * @route   GET /api/shows/movie/:movieId
 * @desc    Get all active shows for a specific movie
 * @access  Public
 * @note    Must be declared BEFORE /:id to prevent route shadowing
 */
router.get('/movie/:movieId', getShowsByMovie);

/**
 * @route   GET /api/shows/:id
 * @desc    Get a single show by ID with populated movie and theater
 * @access  Public
 */
router.get('/:id', getShowById);

/**
 * @route   POST /api/shows
 * @desc    Create a new show with automatic 100-seat layout
 * @access  Public
 */
router.post('/', createShow);

/**
 * @route   PUT /api/shows/:id
 * @desc    Update show details
 * @access  Public
 */
router.put('/:id', updateShow);

/**
 * @route   DELETE /api/shows/:id
 * @desc    Soft delete (deactivate) a show
 * @access  Public
 */
router.delete('/:id', deleteShow);

export default router;
