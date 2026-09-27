import { Router } from 'express';
import { adminLogin, getAdminProfile, getAdminDashboard } from '../controllers/adminController.js';
import { adminAuth } from '../middleware/adminAuth.js';
import adminMovieRoutes from './adminMovieRoutes.js';
import adminTheaterRoutes from './adminTheaterRoutes.js';
import adminShowRoutes from './adminShowRoutes.js';

const router = Router();

/**
 * @route   POST /api/admin/login
 * @desc    Authenticate admin user & get JWT token
 * @access  Public
 */
router.post('/login', adminLogin);

/**
 * @route   GET /api/admin/profile
 * @desc    Get current authenticated admin user profile
 * @access  Private (Admin only)
 */
router.get('/profile', adminAuth, getAdminProfile);

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get live aggregation statistics for Admin Dashboard
 * @access  Private (Admin only)
 */
router.get('/dashboard', adminAuth, getAdminDashboard);

/**
 * Movie Management Routes - Phase 4.2
 * Mounts /api/admin/movies
 */
router.use('/movies', adminMovieRoutes);

/**
 * Theater Management Routes - Phase 4.3
 * Mounts /api/admin/theaters
 */
router.use('/theaters', adminTheaterRoutes);

/**
 * Show Scheduling & Conflict Detection Routes - Phase 4.4
 * Mounts /api/admin/shows
 */
router.use('/shows', adminShowRoutes);

export default router;
