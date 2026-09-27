import express from 'express';
import healthRouter from './health.js';
import authRouter from './auth.js';
import movieRouter from './movieRoutes.js';
import theaterRouter from './theaterRoutes.js';
import showRouter from './showRoutes.js';
import bookingRouter from './bookingRoutes.js';
import adminRouter from './adminRoutes.js';

const router = express.Router();

/**
 * Centralized API router registration
 */
router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/movies', movieRouter);
router.use('/theaters', theaterRouter);
router.use('/shows', showRouter);
router.use('/bookings', bookingRouter);
router.use('/admin', adminRouter);

export default router;
