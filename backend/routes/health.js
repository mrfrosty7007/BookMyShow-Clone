import express from 'express';

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    API Health check endpoint suitable for Railway/Render monitors
 * @access  Public
 */
router.get('/', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'BookMyShow Clone API',
    environment: process.env.NODE_ENV || 'development',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

export default router;
