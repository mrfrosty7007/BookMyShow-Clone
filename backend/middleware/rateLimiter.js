import rateLimit from 'express-rate-limit';

/**
 * Rate limiter specifically for login attempts
 * Limits each IP to 5 requests per 15-minute window
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Maximum 5 attempts per windowMs
  standardHeaders: true, // Return standard `RateLimit-*` headers
  legacyHeaders: false, // Disable legacy `X-RateLimit-*` headers
  statusCode: 429,
  message: {
    status: 'error',
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
  handler: (_req, res, _next, options) => {
    res.status(options.statusCode).json(options.message);
  },
});

export default loginRateLimiter;
