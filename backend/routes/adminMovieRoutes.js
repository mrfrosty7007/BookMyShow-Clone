import { Router } from 'express';
import {
  createMovie,
  getAdminMovies,
  updateMovie,
  deleteMovie,
  restoreMovie,
  toggleFeatured,
} from '../controllers/movieAdminController.js';
import { adminAuth } from '../middleware/adminAuth.js';
import { uploadMovieFiles } from '../middleware/uploadMovie.js';

const router = Router();

// Protect all admin movie routes with adminAuth
router.use(adminAuth);

/**
 * @route   GET /api/admin/movies
 * @desc    List all movies for admin with search, filter, and pagination
 */
router.get('/', getAdminMovies);

/**
 * @route   POST /api/admin/movies
 * @desc    Create a new movie with optional poster and backdrop uploads
 */
router.post('/', uploadMovieFiles, createMovie);

/**
 * @route   PUT /api/admin/movies/:id
 * @desc    Update movie metadata and/or replace images
 */
router.put('/:id', uploadMovieFiles, updateMovie);

/**
 * @route   PATCH /api/admin/movies/:id/restore
 * @desc    Restore a soft-deleted movie to active status
 */
router.patch('/:id/restore', restoreMovie);

/**
 * @route   PATCH /api/admin/movies/:id/featured
 * @desc    Toggle movie featured status
 */
router.patch('/:id/featured', toggleFeatured);

/**
 * @route   DELETE /api/admin/movies/:id
 * @desc    Soft delete a movie (isActive: false, deletedAt: Date)
 */
router.delete('/:id', deleteMovie);

export default router;
