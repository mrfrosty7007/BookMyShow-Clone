import jwt from 'jsonwebtoken';

/**
 * Generate a 7-day JWT token and attach it as an HTTP-only cookie
 * @param {import('express').Response} res
 * @param {string} userId
 * @returns {string} The signed JWT token
 */
export const generateTokenAndSetCookie = (res, userId) => {
  const secret = process.env.JWT_SECRET || 'bookmyshow_jwt_secret_dev_fallback_key';

  const token = jwt.sign({ userId }, secret, {
    expiresIn: '7d',
  });

  const cookieOptions = {
    httpOnly: true, // Prevents client-side scripts from reading the cookie (mitigates XSS)
    secure: process.env.NODE_ENV === 'production', // Use HTTPS only in production
    sameSite: 'lax', // CSRF mitigation with standard navigation compatibility
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/',
  };

  res.cookie('jwt', token, cookieOptions);

  return token;
};

/**
 * Clear the authentication cookie on logout
 * @param {import('express').Response} res
 */
export const clearTokenCookie = (res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
};

export default generateTokenAndSetCookie;
