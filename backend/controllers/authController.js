import { validationResult } from 'express-validator';
import User from '../models/User.js';
import { generateTokenAndSetCookie, clearTokenCookie } from '../utils/generateToken.js';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        status: 'error',
        message: 'A user with this email address already exists',
      });
    }

    // Create user (password is automatically hashed via Mongoose pre-save hook)
    // Security Hardening: Enforce role 'user' unconditionally for public registration
    const user = await User.create({
      name,
      email,
      password,
      role: 'user',
    });

    // Generate JWT and attach as HTTP-only cookie
    const token = generateTokenAndSetCookie(res, user._id);

    return res.status(201).json({
      status: 'ok',
      message: 'Account registered successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token cookie
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Retrieve user including the password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password credentials',
      });
    }

    // Generate JWT and attach as HTTP-only cookie
    const token = generateTokenAndSetCookie(res, user._id);

    return res.status(200).json({
      status: 'ok',
      message: 'Logged in successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Log out current user & clear JWT cookie
 * @route   POST /api/auth/logout
 * @access  Public
 */
export const logoutUser = (_req, res) => {
  clearTokenCookie(res);
  return res.status(200).json({
    status: 'ok',
    message: 'Logged out successfully',
  });
};

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/auth/me
 * @access  Private (Requires JWT cookie)
 */
export const getCurrentUser = (req, res) => {
  return res.status(200).json({
    status: 'ok',
    user: req.user,
  });
};
