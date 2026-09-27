import { useState, useEffect, useCallback } from 'react';

/**
 * Reusable custom hook for asynchronous data fetching
 *
 * @param {Function} fetchFn - Async function returning data promise
 * @param {string|number|null} trigger - Optional dependency key triggering refetch
 * @returns {{ data: any, loading: boolean, error: string | null, refetch: Function }}
 */
export const useFetch = (fetchFn, trigger = '') => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadIndex, setReloadIndex] = useState(0);

  const refetch = useCallback(() => {
    setLoading(true);
    setReloadIndex((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let ignore = false;

    fetchFn()
      .then((res) => {
        if (!ignore) {
          setData(res);
          setError(null);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message || 'Failed to fetch data');
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger, reloadIndex]);

  return { data, loading, error, refetch };
};

export default useFetch;
