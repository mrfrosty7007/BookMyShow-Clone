import express from 'express';
import { createBooking, getMyBookings, getBookingById } from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * All booking endpoints are protected and require JWT authentication
 */
router.post('/create', protect, createBooking);
router.get('/me', protect, getMyBookings);
router.get('/:id', protect, getBookingById);

export default router;
