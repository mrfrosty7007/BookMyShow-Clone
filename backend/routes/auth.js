import express from 'express';
import { body } from 'express-validator';
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { loginRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * Validation rules for registration
 */
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 60 })
    .withMessage('Name cannot exceed 60 characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
];

/**
 * Validation rules for login
 */
const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user account
 * @access  Public
 */
router.post('/register', registerValidation, registerUser);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and set JWT cookie
 * @access  Public
 */
router.post('/login', loginRateLimiter, loginValidation, loginUser);

/**
 * @route   POST /api/auth/logout
 * @desc    Clear JWT cookie and logout
 * @access  Public
 */
router.post('/logout', logoutUser);

/**
 * @route   GET /api/auth/me
 * @desc    Get currently logged in user details
 * @access  Private
 */
router.get('/me', protect, getCurrentUser);

export default router;
