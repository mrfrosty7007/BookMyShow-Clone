import { useContext } from 'react';
import { CityContext } from '../context/CityContext.jsx';

/**
 * Custom hook to access global city selection context
 * @returns {{ selectedCity: string, setSelectedCity: (city: string) => void, selectCity: (city: string) => void }}
 */
export const useCity = () => {
  const context = useContext(CityContext);
  if (!context) {
    return {
      selectedCity: '',
      setSelectedCity: () => {},
      selectCity: () => {},
    };
  }
  return context;
};

export default useCity;
