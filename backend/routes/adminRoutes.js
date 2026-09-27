import { Router } from 'express';
import { adminLogin, getAdminProfile, getAdminDashboard } from '../controllers/adminController.js';
import { adminAuth } from '../middleware/adminAuth.js';
import adminMovieRoutes from './adminMovieRoutes.js';

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

export default router;
