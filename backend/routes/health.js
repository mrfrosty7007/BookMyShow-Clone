import express from 'express';

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    API Health check endpoint
 * @access  Public
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'BookMyShow Clone API running',
  });
});

export default router;
