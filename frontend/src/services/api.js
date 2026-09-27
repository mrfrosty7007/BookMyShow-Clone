import { APP_CONFIG } from '../utils/constants.js';

/**
 * Base fetch wrapper with error handling
 */
const request = async (endpoint, options = {}) => {
  const url = `${APP_CONFIG.apiBaseUrl}${endpoint}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`[API Error] Request failed for ${url}:`, error.message);
    throw error;
  }
};

/**
 * API Service methods
 */
export const apiService = {
  /**
   * Health check query
   * @returns {Promise<{ status: string, message: string }>}
   */
  getHealth: async () => {
    return await request('/health');
  },
};

export default apiService;
