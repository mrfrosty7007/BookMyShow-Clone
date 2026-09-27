import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api.js';

/**
 * Custom hook to monitor API health status
 */
export const useApiHealth = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refetch = useCallback(() => {
    setLoading(true);
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let ignore = false;

    const checkHealth = async () => {
      try {
        const res = await apiService.getHealth();
        if (!ignore) {
          setData(res);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || 'Unable to connect to BookMyShow backend');
          setData(null);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    checkHealth();

    return () => {
      ignore = true;
    };
  }, [refreshTrigger]);

  return {
    data,
    loading,
    error,
    isConnected: data?.status === 'ok',
    refetch,
  };
};

export default useApiHealth;
