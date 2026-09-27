import { Router } from 'express';
import { adminAuth } from '../middleware/adminAuth.js';
import {
  getOverviewAnalytics,
  getRevenueAnalytics,
  getOccupancyAnalytics,
  getMovieAnalytics,
  getTheaterAnalytics,
  getTimeSlotAnalytics,
  getRefundAnalytics,
  exportReport,
} from '../controllers/analyticsController.js';

const router = Router();

// Protect all analytics routes with admin authentication
router.use(adminAuth);

/**
 * @route   GET /api/admin/analytics/overview
 * @desc    Get executive summary KPIs and automated business insights
 * @access  Private (Admin)
 */
router.get('/overview', getOverviewAnalytics);

/**
 * @route   GET /api/admin/analytics/revenue
 * @desc    Get revenue intelligence time-series (daily, weekly, monthly)
 * @access  Private (Admin)
 */
router.get('/revenue', getRevenueAnalytics);

/**
 * @route   GET /api/admin/analytics/occupancy
 * @desc    Get 7-day x 4-slot occupancy matrix heatmap & capacity metrics
 * @access  Private (Admin)
 */
router.get('/occupancy', getOccupancyAnalytics);

/**
 * @route   GET /api/admin/analytics/movies
 * @desc    Get top movies ranking by gross revenue, tickets, and occupancy
 * @access  Private (Admin)
 */
router.get('/movies', getMovieAnalytics);

/**
 * @route   GET /api/admin/analytics/theaters
 * @desc    Get screen format utilization (IMAX, Dolby, Standard, Gold Class)
 * @access  Private (Admin)
 */
router.get('/theaters', getTheaterAnalytics);

/**
 * @route   GET /api/admin/analytics/timeslots
 * @desc    Get time slot demand analysis (Morning, Matinee, Evening, Night)
 * @access  Private (Admin)
 */
router.get('/timeslots', getTimeSlotAnalytics);

/**
 * @route   GET /api/admin/analytics/refunds
 * @desc    Get refund rates, breakdown by reason, and timeline trend
 * @access  Private (Admin)
 */
router.get('/refunds', getRefundAnalytics);

/**
 * @route   GET /api/admin/analytics/export
 * @desc    Export analytics report in CSV or structured JSON format
 * @access  Private (Admin)
 */
router.get('/export', exportReport);

export default router;
