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
 * Movie API Services
 */
export const getMovies = () => apiClient.get('/movies');
export const getMovie = (id) => apiClient.get(`/movies/${id}`);

/**
 * Theater & City API Services
 */
export const getCities = () => apiClient.get('/theaters/cities');
export const getTheaters = (filters = {}) => apiClient.get('/theaters', { params: filters });

/**
 * Show API Services
 */
export const getShowsByMovie = (movieId) => apiClient.get(`/shows/movie/${movieId}`);
export const getShows = (filters = {}) => apiClient.get('/shows', { params: filters });

/**
 * General API methods preserving Phase 0 compatibility
 */
export const apiService = {
  getHealth: () => apiClient.get('/health'),
  getMovies,
  getMovie,
  getCities,
  getShowsByMovie,
  getShows,
};

export default apiClient;
