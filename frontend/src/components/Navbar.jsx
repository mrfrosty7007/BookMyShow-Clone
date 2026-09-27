import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Film, Menu, X, Search, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { CitySelector } from './CitySelector.jsx';

/**
 * Modern BookMyShow-style Sticky Navigation Bar
 */
export const Navbar = ({ selectedCity, onSelectCity }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout, loading: authLoading } = useAuth();

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    closeMobileMenu();
    await logout();
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#0b0f19]/90 border-b border-gray-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Left: Brand Logo */}
          <Link
            to="/"
            onClick={closeMobileMenu}
            className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f84464] rounded-lg flex-shrink-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#f84464] to-[#ff6b8b] flex items-center justify-center text-white shadow-lg shadow-[#f84464]/25 group-hover:scale-105 transition-transform duration-200">
              <Film className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  book<span className="text-[#f84464]">my</span>show
                </span>
                <span className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700/60 hidden sm:inline-block">
                  Clone
                </span>
              </div>
            </div>
          </Link>

          {/* Center: Search Bar (Desktop UI Only) */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for Movies, Theaters, Events..."
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-gray-900/90 border border-gray-800 text-gray-200 placeholder-gray-400 focus:outline-none focus:border-[#f84464] focus:ring-1 focus:ring-[#f84464] transition-all"
              />
            </div>
          </div>

          {/* Right Actions: City Selector & Auth CTA */}
          <div className="hidden md:flex items-center gap-3.5">
            {/* City Selector */}
            <CitySelector selectedCity={selectedCity} onSelectCity={onSelectCity} />

            {/* Navigation links */}
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'text-[#f84464]' : 'text-gray-300 hover:text-white'
                }`
              }
              end
            >
              Movies
            </NavLink>

            {user && (
              <NavLink
                to="/my-bookings"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'text-[#f84464]' : 'text-gray-300 hover:text-white'
                  }`
                }
              >
                My Bookings
              </NavLink>
            )}

            {user?.role === 'admin' && (
              <NavLink
                to="/admin/dashboard"
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 hover:bg-cyan-900/60 transition-all flex items-center gap-1.5 shadow-sm shadow-cyan-500/20"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Admin Console</span>
              </NavLink>
            )}

            {/* Auth Button or User profile */}
            {authLoading ? (
              <div className="w-20 h-9 rounded-xl bg-gray-800/60 animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-800/80 hover:bg-gray-800 border border-gray-700/80 text-gray-200 text-sm font-semibold transition-all"
                >
                  <div className="w-6 h-6 rounded-lg bg-[#f84464] text-white flex items-center justify-center text-xs font-bold">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="max-w-[100px] truncate">{user.name}</span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-gray-800 border border-gray-800 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#f84464] to-[#e03150] text-white text-sm font-semibold hover:opacity-95 shadow-md shadow-[#f84464]/20 transition-all duration-200"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Right: City Selector & Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <CitySelector selectedCity={selectedCity} onSelectCity={onSelectCity} />

            <button
              type="button"
              onClick={toggleMobileMenu}
              aria-label="Toggle navigation menu"
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movies..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-gray-900 border border-gray-800 text-gray-200 placeholder-gray-400 focus:outline-none focus:border-[#f84464]"
            />
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gray-800/80 bg-[#0b0f19]/95 backdrop-blur-2xl px-4 pt-2 pb-5 space-y-3">
          <nav className="flex flex-col space-y-1">
            <NavLink
              to="/"
              onClick={closeMobileMenu}
              className="px-3 py-2 rounded-lg text-sm font-medium text-gray-200 hover:bg-gray-800"
            >
              Explore Movies
            </NavLink>

            {user ? (
              <>
                {user.role === 'admin' && (
                  <NavLink
                    to="/admin/dashboard"
                    onClick={closeMobileMenu}
                    className="px-3 py-2 rounded-lg text-sm font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    <span>Admin Console</span>
                  </NavLink>
                )}
                <NavLink
                  to="/my-bookings"
                  onClick={closeMobileMenu}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-gray-200 hover:bg-gray-800"
                >
                  My Bookings
                </NavLink>
                <NavLink
                  to="/profile"
                  onClick={closeMobileMenu}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-gray-200 hover:bg-gray-800"
                >
                  Profile ({user.name})
                </NavLink>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  onClick={closeMobileMenu}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-gray-200 hover:bg-gray-800"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  onClick={closeMobileMenu}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-gray-200 hover:bg-gray-800"
                >
                  Register
                </NavLink>
              </>
            )}
          </nav>

          <div className="pt-2 border-t border-gray-800 flex justify-between items-center">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <span className="text-xs text-gray-400">Logged in as {user.name}</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs text-rose-400 hover:underline flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={closeMobileMenu}
                className="w-full text-center py-2 rounded-xl bg-gradient-to-r from-[#f84464] to-[#e03150] text-white text-xs font-bold"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
