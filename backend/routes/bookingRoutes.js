import express from 'express';
import { createBooking, getMyBookings, getBookingById } from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * All booking endpoints are protected and require JWT authentication
 */
// Support both canonical and alias endpoints for robust client compatibility
router.post('/', protect, createBooking);
router.post('/create', protect, createBooking);
router.get('/', protect, getMyBookings);
router.get('/me', protect, getMyBookings);
router.get('/my-bookings', protect, getMyBookings);
router.get('/:id', protect, getBookingById);

export default router;
