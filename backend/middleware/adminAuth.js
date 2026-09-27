import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Admin Authentication & Authorization Middleware
 * Verifies JWT token from HTTP-only cookie or Authorization: Bearer header,
 * loads user, and verifies that role is 'admin'.
 */
export const adminAuth = async (req, res, next) => {
  let token = req.cookies?.jwt;

  // Also support Authorization header: Bearer <token>
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Not authorized, no authentication token found',
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'bookmyshow_jwt_secret_dev_fallback_key';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'The user belonging to this token no longer exists',
      });
    }

    // Role-based authorization check
    if (user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Forbidden. Administrator privileges required.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication session expired, please log in again',
      });
    }

    return res.status(401).json({
      status: 'error',
      message: 'Not authorized, token verification failed',
    });
  }
};

export default adminAuth;
