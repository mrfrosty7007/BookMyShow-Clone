import express from 'express';
import {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
} from '../controllers/movieController.js';

const router = express.Router();

/**
 * @route   GET /api/movies
 * @desc    Get all active movies
 * @access  Public
 */
router.get('/', getMovies);

/**
 * @route   GET /api/movies/:id
 * @desc    Get a single movie by ID
 * @access  Public
 */
router.get('/:id', getMovieById);

/**
 * @route   POST /api/movies
 * @desc    Create a new movie
 * @access  Public
 */
router.post('/', createMovie);

/**
 * @route   PUT /api/movies/:id
 * @desc    Update movie details
 * @access  Public
 */
router.put('/:id', updateMovie);

/**
 * @route   DELETE /api/movies/:id
 * @desc    Soft delete (deactivate) a movie
 * @access  Public
 */
router.delete('/:id', deleteMovie);

export default router;
