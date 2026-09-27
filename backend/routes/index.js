import express from 'express';
import healthRouter from './health.js';
import authRouter from './auth.js';

const router = express.Router();

/**
 * Centralized API router registration
 */
router.use('/health', healthRouter);
router.use('/auth', authRouter);

export default router;
