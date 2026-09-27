import axios from 'axios';
import { APP_CONFIG } from '../utils/constants.js';

/**
 * Centralized Axios instance with HTTP-only cookie support
 */
export const apiClient = axios.create({
  baseURL: APP_CONFIG.apiBaseUrl,
  withCredentials: true, // Crucial for sending and receiving HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Response interceptor for consistent error extraction
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customMessage =
      error.response?.data?.message || error.message || 'An unexpected network error occurred';
    return Promise.reject(new Error(customMessage));
  }
);

/**
 * General API methods preserving Phase 0 compatibility
 */
export const apiService = {
  getHealth: () => apiClient.get('/health'),
};

export default apiClient;
