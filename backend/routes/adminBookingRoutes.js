import { Router } from 'express';
import {
  getAdminBookings,
  getAdminBookingById,
  checkInBooking,
  processRefund,
} from '../controllers/bookingAdminController.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = Router();

// All booking operations require admin/staff authorization
router.use(adminAuth);

/**
 * @route   GET /api/admin/bookings
 * @desc    Get all bookings with filters, search, pagination, and KPI metrics
 * @access  Private (Admin / Staff)
 */
router.get('/', getAdminBookings);

/**
 * @route   GET /api/admin/bookings/:id
 * @desc    Get detailed booking information with audit logs and scan history
 * @access  Private (Admin / Staff)
 */
router.get('/:id', getAdminBookingById);

/**
 * @route   PATCH /api/admin/bookings/:id/check-in
 * @desc    Manual check-in of a customer ticket
 * @access  Private (Admin / Staff)
 */
router.patch('/:id/check-in', checkInBooking);

/**
 * @route   PATCH /api/admin/bookings/:id/refund
 * @desc    Process time-tiered refund and restore seat inventory
 * @access  Private (Admin / Staff)
 */
router.patch('/:id/refund', processRefund);

export default router;
