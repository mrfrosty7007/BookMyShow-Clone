/**
 * Catch-all middleware for 404 Not Found routes
 */
export const notFoundHandler = (req, res, _next) => {
  res.status(404).json({
    status: 'error',
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
  });
};
