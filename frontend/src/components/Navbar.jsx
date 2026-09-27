import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Film, Menu, X, Radio, ArrowRight } from 'lucide-react';
import { useApiHealth } from '../hooks/useApiHealth.js';

/**
 * Reusable, Mobile-Responsive Navigation Bar
 */
export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isConnected, loading } = useApiHealth();

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
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
                Phase 0 • Foundation
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            <NavLink to="/" className={navLinkClasses} end>
              Home
            </NavLink>
            <NavLink to="/login" className={navLinkClasses}>
              Login
            </NavLink>
            <NavLink to="/register" className={navLinkClasses}>
              Register
            </NavLink>
          </nav>

          {/* Desktop Right Actions: API Status & CTA */}
          <div className="hidden md:flex items-center gap-4">
            {/* Live API Status indicator */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
                loading
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                  : isConnected
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
              }`}
              title={
                loading
                  ? 'Checking backend connection...'
                  : isConnected
                    ? 'Backend connected and responding at /api/health'
                    : 'Backend offline or unreachable'
              }
            >
              <Radio
                className={`w-3.5 h-3.5 ${
                  loading
                    ? 'animate-spin text-amber-400'
                    : isConnected
                      ? 'animate-pulse text-emerald-400'
                      : 'text-rose-400'
                }`}
              />
              <span>
                {loading ? 'Checking API...' : isConnected ? 'API Online' : 'API Offline'}
              </span>
            </div>

            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#f84464] to-[#e03150] text-white text-sm font-semibold hover:opacity-95 shadow-md shadow-[#f84464]/20 hover:shadow-lg hover:shadow-[#f84464]/30 transition-all duration-200 group"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            {/* Minimal Status Dot */}
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                loading
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
            <NavLink to="/login" onClick={closeMobileMenu} className={mobileNavLinkClasses}>
              Login
            </NavLink>
            <NavLink to="/register" onClick={closeMobileMenu} className={mobileNavLinkClasses}>
              Register
            </NavLink>
          </nav>

          <div className="pt-3 border-t border-gray-800/80 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs px-2 text-gray-400">
              <span>Backend Status</span>
              <span
                className={`font-semibold flex items-center gap-1.5 ${
                  isConnected ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-emerald-400' : 'bg-rose-400'
                  }`}
                />
                {isConnected ? 'Connected (/api/health)' : 'Offline'}
              </span>
            </div>

            <Link
              to="/login"
              onClick={closeMobileMenu}
              className="w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-[#f84464] to-[#e03150] text-white text-sm font-semibold shadow-md shadow-[#f84464]/20"
            >
              Sign In to Preview
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
