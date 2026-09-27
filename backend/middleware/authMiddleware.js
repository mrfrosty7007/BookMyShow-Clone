import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Authentication Middleware:
 * Reads JWT token from HTTP-only cookie, verifies it, and attaches the User object to req.user.
 */
export const protect = async (req, res, next) => {
  let token = req.cookies?.jwt;

  // Also check Authorization header: Bearer <token>
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

/**
 * Optional Role-based authorization middleware
 * @param  {...string} roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `User role '${req.user?.role || 'unknown'}' is not authorized to access this route`,
      });
    }
    next();
  };
};

export { adminAuth } from './adminAuth.js';
export default protect;
