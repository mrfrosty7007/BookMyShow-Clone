import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Film, Menu, X, Radio, ArrowRight, LogOut, User as UserIcon } from 'lucide-react';
import { useApiHealth } from '../hooks/useApiHealth.js';
import { useAuth } from '../hooks/useAuth.js';

/**
 * Reusable, Mobile-Responsive Navigation Bar with Phase 1 Auth Integration
 */
export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isConnected, loading: apiLoading } = useApiHealth();
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

  const navLinkClasses = ({ isActive }) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'text-white bg-[#f84464]/20 border border-[#f84464]/40 shadow-sm'
        : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
    }`;

  const mobileNavLinkClasses = ({ isActive }) =>
    `block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
      isActive
        ? 'text-white bg-[#f84464]/20 border border-[#f84464]/40'
        : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
    }`;

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#0b0f19]/85 border-b border-gray-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <Link
            to="/"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f84464] rounded-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#f84464] to-[#ff6b8b] flex items-center justify-center text-white shadow-lg shadow-[#f84464]/25 group-hover:scale-105 transition-transform duration-200">
              <Film className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-heading">
                  book<span className="text-[#f84464]">my</span>show
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700/60">
                  Clone
                </span>
              </div>
              <span className="text-[10px] tracking-wider text-gray-400 -mt-1 font-sans">
                Phase 1 • Auth Active
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            <NavLink to="/" className={navLinkClasses} end>
              Home
            </NavLink>

            {user ? (
              <NavLink to="/profile" className={navLinkClasses}>
                Profile
              </NavLink>
            ) : (
              <>
                <NavLink to="/login" className={navLinkClasses}>
                  Login
                </NavLink>
                <NavLink to="/register" className={navLinkClasses}>
                  Register
                </NavLink>
              </>
            )}
          </nav>

          {/* Desktop Right Actions: API Status & User Session / Auth CTA */}
          <div className="hidden md:flex items-center gap-4">
            {/* Live API Status indicator */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
                apiLoading
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                  : isConnected
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
              }`}
              title={isConnected ? 'Backend & MongoDB Atlas online' : 'Backend offline'}
            >
              <Radio
                className={`w-3.5 h-3.5 ${
                  apiLoading
                    ? 'animate-spin text-amber-400'
                    : isConnected
                      ? 'animate-pulse text-emerald-400'
                      : 'text-rose-400'
                }`}
              />
              <span>{apiLoading ? 'Checking...' : isConnected ? 'API Online' : 'API Offline'}</span>
            </div>

            {/* Authenticated vs Guest Actions */}
            {authLoading ? (
              <div className="w-20 h-8 rounded-xl bg-gray-800/60 animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-800/80 hover:bg-gray-800 border border-gray-700/80 text-gray-200 text-sm font-semibold transition-all group"
                >
                  <div className="w-6 h-6 rounded-lg bg-[#f84464] text-white flex items-center justify-center text-xs font-bold">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="max-w-[120px] truncate">{user.name}</span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-gray-800/80 border border-gray-800 transition-colors"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#f84464] to-[#e03150] text-white text-sm font-semibold hover:opacity-95 shadow-md shadow-[#f84464]/20 hover:shadow-lg hover:shadow-[#f84464]/30 transition-all duration-200 group"
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                apiLoading
                  ? 'bg-amber-400 animate-pulse'
                  : isConnected
                    ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                    : 'bg-rose-400'
              }`}
              title={isConnected ? 'API Online' : 'API Offline'}
            />

            <button
              type="button"
              onClick={toggleMobileMenu}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/80 border border-gray-800 focus:outline-none focus:ring-2 focus:ring-[#f84464]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gray-800/80 bg-[#0b0f19]/95 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-3 transition-all">
          <nav className="flex flex-col space-y-1">
            <NavLink to="/" onClick={closeMobileMenu} className={mobileNavLinkClasses} end>
              Home
            </NavLink>

            {user ? (
              <NavLink to="/profile" onClick={closeMobileMenu} className={mobileNavLinkClasses}>
                Profile ({user.name})
              </NavLink>
            ) : (
              <>
                <NavLink to="/login" onClick={closeMobileMenu} className={mobileNavLinkClasses}>
                  Login
                </NavLink>
                <NavLink to="/register" onClick={closeMobileMenu} className={mobileNavLinkClasses}>
                  Register
                </NavLink>
              </>
            )}
          </nav>

          <div className="pt-3 border-t border-gray-800/80 flex flex-col gap-3">
            {user ? (
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-[#f84464]" />
                  <span className="text-sm font-semibold text-gray-200">{user.name}</span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs text-rose-400 hover:underline flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={closeMobileMenu}
                className="w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-[#f84464] to-[#e03150] text-white text-sm font-semibold shadow-md shadow-[#f84464]/20"
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
