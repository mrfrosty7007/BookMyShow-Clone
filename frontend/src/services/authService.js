import apiClient from './api.js';

/**
 * Authentication service communicating with /api/auth endpoints
 */
export const authService = {
  /**
   * Register a new user account
   * @param {{ name: string, email: string, password: string }} userData
   * @returns {Promise<{ status: string, message: string, user: object }>}
   */
  register: (userData) => {
    return apiClient.post('/auth/register', userData);
  },

  /**
   * Authenticate with email & password
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<{ status: string, message: string, user: object }>}
   */
  login: (credentials) => {
    return apiClient.post('/auth/login', credentials);
  },

  /**
   * Authenticate administrator with email & password
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<{ status: string, message: string, token: string, user: object }>}
   */
  adminLogin: (credentials) => {
    return apiClient.post('/admin/login', credentials);
  },

  /**
   * Log out and clear the HTTP-only cookie
   * @returns {Promise<{ status: string, message: string }>}
   */
  logout: () => {
    return apiClient.post('/auth/logout');
  },

  /**
   * Fetch current authenticated user via session cookie
   * @returns {Promise<{ status: string, user: object }>}
   */
  getCurrentUser: () => {
    return apiClient.get('/auth/me');
  },
};

export default authService;
