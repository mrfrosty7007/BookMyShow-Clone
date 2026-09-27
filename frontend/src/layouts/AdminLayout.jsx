import { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Film,
  Building2,
  Calendar,
  Ticket,
  Users,
  ShieldCheck,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';

const NAV_ITEMS = [
  {
    name: 'Dashboard',
    path: '/admin/dashboard',
    icon: LayoutDashboard,
    badge: 'Live',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  {
    name: 'Movies',
    path: '/admin/movies',
    icon: Film,
    badge: 'Live',
    badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  },
  {
    name: 'Theaters',
    path: '/admin/theaters',
    icon: Building2,
    badge: 'Live',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  {
    name: 'Shows',
    path: '/admin/shows',
    icon: Calendar,
    badge: 'Live',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  },
  {
    name: 'Bookings',
    path: '/admin/bookings',
    icon: Ticket,
    badge: 'P4.5',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
  {
    name: 'Users',
    path: '/admin/users',
    icon: Users,
    badge: null,
  },
];

/**
 * AdminLayout Component
 * High-performance executive console layout with responsive cyber navigation,
 * real-time system status indicators, and administrative shortcuts.
 */
export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-gray-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Top Administrative Bar */}
      <header className="sticky top-0 z-40 bg-[#0b1120]/90 backdrop-blur-md border-b border-gray-800/80 px-4 sm:px-6 py-3.5">
        <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
          {/* Logo & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-300 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to="/admin/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 p-0.5 shadow-lg shadow-cyan-600/30 group-hover:shadow-cyan-500/50 transition-all">
                <div className="w-full h-full bg-[#0b1120] rounded-[10px] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-white text-base tracking-tight">BookMyShow</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                    Console
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 font-mono">Platform Admin v4.1</span>
              </div>
            </Link>
          </div>

          {/* Right Header Utilities */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Live System Indicator */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Engine Connected</span>
            </div>

            {/* Admin Profile Chip */}
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-gray-900/80 border border-gray-800">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-xs font-bold text-gray-950">
                {user?.name ? user.name[0].toUpperCase() : 'A'}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-gray-200 leading-tight">
                  {user?.name || 'Administrator'}
                </span>
                <span className="text-[10px] text-cyan-400 font-mono">{user?.email}</span>
              </div>
            </div>

            {/* Return to Storefront */}
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-cyan-400 text-xs font-bold transition-all"
              title="Return to Customer Storefront"
            >
              <span>Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 hover:text-white transition-colors cursor-pointer"
              title="Sign Out from Admin Console"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Workspace with Sidebar */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 border-r border-gray-800/80 bg-[#0b1120]/40 p-4 space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 px-3">
              Management Modules
            </span>
            <nav className="space-y-1.5 pt-2">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-950/50'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60 border border-transparent'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Quick System Diagnostics Widget */}
          <div className="mt-auto p-3.5 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-gray-400">
              <span>Environment</span>
              <span className="text-cyan-400 font-mono font-bold">Production</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-gray-400">
              <span>DB Cluster</span>
              <span className="text-emerald-400 font-mono font-bold">Atlas Sharded</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-gray-400">
              <span>Socket Room</span>
              <span className="text-purple-400 font-mono font-bold">Active</span>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex">
            <div className="w-72 bg-[#0b1120] border-r border-gray-800 h-full p-5 flex flex-col justify-between animate-slide-in-right">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-gray-800">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-cyan-400" />
                    <span className="font-bold text-sm text-white">Admin Console</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <nav className="space-y-2">
                  {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                            isActive
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                              : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                          }`
                        }
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" />
                          <span>{item.name}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                      </NavLink>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 font-bold text-xs uppercase tracking-wider"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out of Console</span>
                </button>
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
