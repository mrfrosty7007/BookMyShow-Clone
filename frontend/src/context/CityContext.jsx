import { createContext, useState, useCallback, useMemo } from 'react';

export const CityContext = createContext(null);

const STORAGE_KEY = 'selectedCity';

/**
 * City Provider managing global selected city state and localStorage persistence
 */
export const CityProvider = ({ children }) => {
  const [selectedCity, setSelectedCityState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || '';
    } catch {
      return '';
    }
  });

  const setSelectedCity = useCallback((city) => {
    const normalized = typeof city === 'string' ? city.trim() : '';
    setSelectedCityState(normalized);
    try {
      if (normalized) {
        localStorage.setItem(STORAGE_KEY, normalized);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore storage access errors in private browsing/sandboxed environments
    }
  }, []);

  const value = useMemo(
    () => ({
      selectedCity,
      setSelectedCity,
      selectCity: setSelectedCity,
    }),
    [selectedCity, setSelectedCity]
  );

  return <CityContext.Provider value={value}>{children}</CityContext.Provider>;
};

export default CityContext;
