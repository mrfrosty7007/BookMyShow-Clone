import express from 'express';
import healthRouter from './health.js';

const router = express.Router();

/**
 * Centralized API router registration
 * Future routers (auth, movies, theatres, bookings) will be mounted here
 */
router.use('/health', healthRouter);

export default router;
