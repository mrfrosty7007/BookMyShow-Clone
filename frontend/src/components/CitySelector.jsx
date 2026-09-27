import { useState, useEffect, useRef } from 'react';
import { MapPin, ChevronDown, Check } from 'lucide-react';
import { getCities } from '../services/api.js';

/**
 * City Selector Dropdown Component
 * Fetches available theater cities from backend and allows user to switch cities
 */
export const CitySelector = ({ selectedCity, onSelectCity, includeAllOption = true }) => {
  const [cities, setCities] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const loadCities = async () => {
      try {
        const res = await getCities();
        if (isMounted && res.success && Array.isArray(res.cities)) {
          setCities(res.cities);
          // Set initial city if none selected
          if (!selectedCity && res.cities.length > 0 && !includeAllOption) {
            onSelectCity?.(res.cities[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load cities:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadCities();
    return () => {
      isMounted = false;
    };
  }, [includeAllOption, onSelectCity, selectedCity]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (city) => {
    onSelectCity?.(city);
    setIsOpen(false);
  };

  const displayText = selectedCity || (includeAllOption ? 'All Cities' : 'Select City');

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={loading}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-900/90 hover:bg-gray-850 border border-gray-800 hover:border-gray-700 text-sm font-medium text-gray-200 hover:text-white transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#f84464]/50"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <MapPin className="w-4 h-4 text-[#f84464]" />
        <span className="font-semibold truncate max-w-[120px]">{displayText}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 sm:left-0 mt-2 w-48 rounded-xl bg-[#111624] border border-gray-800 shadow-2xl shadow-black/80 py-1.5 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-800/80">
            Select Your City
          </div>

          <div className="max-h-60 overflow-y-auto py-1">
            {includeAllOption && (
              <button
                type="button"
                onClick={() => handleSelect('')}
                className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-gray-800/60 transition-colors ${
                  !selectedCity ? 'text-[#f84464] font-semibold bg-gray-800/30' : 'text-gray-300'
                }`}
              >
                <span>All Cities</span>
                {!selectedCity && <Check className="w-4 h-4 text-[#f84464]" />}
              </button>
            )}

            {cities.map((city) => {
              const isSelected = selectedCity === city;
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => handleSelect(city)}
                  className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-gray-800/60 transition-colors ${
                    isSelected ? 'text-[#f84464] font-semibold bg-gray-800/30' : 'text-gray-300'
                  }`}
                >
                  <span>{city}</span>
                  {isSelected && <Check className="w-4 h-4 text-[#f84464]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CitySelector;
