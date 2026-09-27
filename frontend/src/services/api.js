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
    const err = new Error(customMessage);
    err.response = error.response;
    err.data = error.response?.data;
    err.status = error.response?.status;
    return Promise.reject(err);
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
export const getShow = (id) => apiClient.get(`/shows/${id}`);

/**
 * Booking API Services - Phase 3.3
 */
export const createBooking = (bookingData) => apiClient.post('/bookings/create', bookingData);
export const getMyBookings = () => apiClient.get('/bookings/me');
export const getBooking = (id) => apiClient.get(`/bookings/${id}`);

/**
 * Admin API Services - Phase 4.1
 */
export const adminLogin = (credentials) => apiClient.post('/admin/login', credentials);
export const getAdminProfile = () => apiClient.get('/admin/profile');
export const getAdminDashboard = () => apiClient.get('/admin/dashboard');

/**
 * Movie Management API Services - Phase 4.2
 */
export const getAdminMovies = (params = {}) => apiClient.get('/admin/movies', { params });
export const createMovie = (movieData) => {
  const isFormData = typeof FormData !== 'undefined' && movieData instanceof FormData;
  return apiClient.post('/admin/movies', movieData, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
};
export const updateMovie = (id, movieData) => {
  const isFormData = typeof FormData !== 'undefined' && movieData instanceof FormData;
  return apiClient.put(`/admin/movies/${id}`, movieData, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
};
export const deleteMovie = (id) => apiClient.delete(`/admin/movies/${id}`);
export const restoreMovie = (id) => apiClient.patch(`/admin/movies/${id}/restore`);
export const toggleFeatured = (id) => apiClient.patch(`/admin/movies/${id}/featured`);

/**
 * Theater & Screen Management API Services - Phase 4.3
 */
export const getAdminTheaters = (params = {}) => apiClient.get('/admin/theaters', { params });
export const createTheater = (theaterData) => apiClient.post('/admin/theaters', theaterData);
export const updateTheater = (id, theaterData) =>
  apiClient.put(`/admin/theaters/${id}`, theaterData);
export const deleteTheater = (id) => apiClient.delete(`/admin/theaters/${id}`);
export const restoreTheater = (id) => apiClient.patch(`/admin/theaters/${id}/restore`);

export const addScreen = (theaterId, screenData) =>
  apiClient.post(`/admin/theaters/${theaterId}/screens`, screenData);
export const updateScreen = (theaterId, screenId, screenData) =>
  apiClient.put(`/admin/theaters/${theaterId}/screens/${screenId}`, screenData);
export const deleteScreen = (theaterId, screenId) =>
  apiClient.delete(`/admin/theaters/${theaterId}/screens/${screenId}`);
export const duplicateScreen = (theaterId, screenId) =>
  apiClient.post(`/admin/theaters/${theaterId}/screens/${screenId}/duplicate`);

/**
 * Show Scheduling & Conflict Detection API Services - Phase 4.4
 */
export const getAdminShows = (params = {}) => apiClient.get('/admin/shows', { params });
export const getAdminShowById = (id) => apiClient.get(`/admin/shows/${id}`);
export const createAdminShow = (showData) => apiClient.post('/admin/shows', showData);
export const updateAdminShow = (id, showData) => apiClient.put(`/admin/shows/${id}`, showData);
export const deleteAdminShow = (id) => apiClient.delete(`/admin/shows/${id}`);
export const cancelAdminShow = (id) => apiClient.patch(`/admin/shows/${id}/cancel`);
export const checkShowConflict = (conflictData) =>
  apiClient.post('/admin/shows/check-conflict', conflictData);
export const bulkCreateShows = (bulkData) => apiClient.post('/admin/shows/bulk', bulkData);

/**
 * Booking Operations & Ticket Validation API Services - Phase 4.5
 */
export const getAdminBookings = (params = {}) => apiClient.get('/admin/bookings', { params });
export const getAdminBookingById = (id) => apiClient.get(`/admin/bookings/${id}`);
export const checkInBooking = (id, data = {}) =>
  apiClient.patch(`/admin/bookings/${id}/check-in`, data);
export const refundBooking = (id, data = {}) =>
  apiClient.patch(`/admin/bookings/${id}/refund`, data);
export const validateTicket = (scanData) => apiClient.post('/admin/tickets/validate', scanData);
export const getTicketScanHistory = (params = {}) =>
  apiClient.get('/admin/tickets/history', { params });
export const recoverSeatLocks = () => apiClient.post('/admin/seatlocks/recover');

/**
 * Executive Analytics & Business Intelligence API Services - Phase 4.6
 */
export const getAnalyticsOverview = (params = {}) =>
  apiClient.get('/admin/analytics/overview', { params });
export const getAnalyticsRevenue = (params = {}) =>
  apiClient.get('/admin/analytics/revenue', { params });
export const getAnalyticsOccupancy = (params = {}) =>
  apiClient.get('/admin/analytics/occupancy', { params });
export const getAnalyticsMovies = (params = {}) =>
  apiClient.get('/admin/analytics/movies', { params });
export const getAnalyticsTheaters = (params = {}) =>
  apiClient.get('/admin/analytics/theaters', { params });
export const getAnalyticsTimeSlots = (params = {}) =>
  apiClient.get('/admin/analytics/timeslots', { params });
export const getAnalyticsRefunds = (params = {}) =>
  apiClient.get('/admin/analytics/refunds', { params });
export const exportAnalyticsReport = (params = {}) => {
  if (params.format === 'csv') {
    return apiClient.get('/admin/analytics/export', {
      params,
      responseType: 'blob',
    });
  }
  return apiClient.get('/admin/analytics/export', { params });
};

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
  getShow,
  createBooking,
  getMyBookings,
  getBooking,
  getAdminBookings,
  validateTicket,
  getAnalyticsOverview,
  getAnalyticsRevenue,
  getAnalyticsOccupancy,
  getAnalyticsMovies,
  getAnalyticsTheaters,
  getAnalyticsTimeSlots,
  getAnalyticsRefunds,
  exportAnalyticsReport,
};

export default apiClient;
