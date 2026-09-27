import { Router } from 'express';
import { adminLogin, getAdminProfile, getAdminDashboard } from '../controllers/adminController.js';
import { adminAuth } from '../middleware/adminAuth.js';
import adminMovieRoutes from './adminMovieRoutes.js';
import adminTheaterRoutes from './adminTheaterRoutes.js';
import adminShowRoutes from './adminShowRoutes.js';
import adminBookingRoutes from './adminBookingRoutes.js';
import ticketValidationRoutes from './ticketValidationRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import { recoverSeatLocksEndpoint } from '../controllers/bookingAdminController.js';

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

/**
 * Booking Operations Routes - Phase 4.5
 * Mounts /api/admin/bookings
 */
router.use('/bookings', adminBookingRoutes);

/**
 * Ticket QR Validation Routes - Phase 4.5
 * Mounts /api/admin/tickets
 */
router.use('/tickets', ticketValidationRoutes);

/**
 * Seat Lock Recovery Engine - Phase 4.5
 * Mounts /api/admin/seatlocks/recover
 */
router.post('/seatlocks/recover', adminAuth, recoverSeatLocksEndpoint);

/**
 * Executive Analytics & Business Intelligence - Phase 4.6
 * Mounts /api/admin/analytics
 */
router.use('/analytics', analyticsRoutes);

export default router;
