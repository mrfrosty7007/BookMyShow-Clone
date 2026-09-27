import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Ticket,
  Film,
  Building2,
  Calendar,
  Users,
  RefreshCw,
  CheckCircle2,
  Layers,
  Sparkles,
} from 'lucide-react';
import { getAdminDashboard } from '../../services/api.js';
import { Loader } from '../../components/Loader.jsx';
import { EmptyState } from '../../components/EmptyState.jsx';

/**
 * AdminDashboard Page
 * Live executive console showing real-time statistics cards, recent transaction logs,
 * top performing theatrical releases, and operational shortcuts.
 */
export const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      try {
        const res = await getAdminDashboard();
        if (isMounted && res?.data) {
          setDashboardData(res.data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load executive statistics.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await getAdminDashboard();
      if (res?.data) {
        setDashboardData(res.data);
        setError(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to refresh statistics.');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader message="Compiling executive platform analytics..." size="lg" />
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="py-12">
        <EmptyState
          title="Analytics Unavailable"
          description={error || 'Unable to retrieve dashboard metrics from the API service.'}
          actionLabel="Try Again"
          onAction={handleRefresh}
        />
      </div>
    );
  }

  const { metrics = {}, recentBookings = [], topMovies = [] } = dashboardData;

  const STATS_CARDS = [
    {
      title: 'Total Revenue',
      value: `₹${Number(metrics.totalRevenue || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      subtitle: 'Gross ticket sales across all venues',
      icon: TrendingUp,
      accent: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30',
      pill: 'Real-time',
      pillColor: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40',
    },
    {
      title: 'Total Bookings',
      value: metrics.totalBookings ?? 0,
      subtitle: `${metrics.totalSeatsBooked ?? 0} total seats confirmed`,
      icon: Ticket,
      accent: 'from-cyan-500/20 to-blue-500/10 text-cyan-400 border-cyan-500/30',
      pill: '+Live',
      pillColor: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40',
    },
    {
      title: 'Active Movies',
      value: metrics.totalMovies ?? 0,
      subtitle: 'Active titles in theatrical distribution',
      icon: Film,
      accent: 'from-purple-500/20 to-pink-500/10 text-purple-400 border-purple-500/30',
      pill: 'Catalog',
      pillColor: 'bg-purple-950/60 text-purple-300 border-purple-500/40',
    },
    {
      title: 'Theaters & Screens',
      value: metrics.totalTheaters ?? 0,
      subtitle: 'Verified cinema multiplexes',
      icon: Building2,
      accent: 'from-blue-500/20 to-indigo-500/10 text-blue-400 border-blue-500/30',
      pill: 'Venues',
      pillColor: 'bg-blue-950/60 text-blue-300 border-blue-500/40',
    },
    {
      title: 'Scheduled Shows',
      value: metrics.totalShows ?? 0,
      subtitle: 'Showtimes with dynamic seat mapping',
      icon: Calendar,
      accent: 'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30',
      pill: 'Active',
      pillColor: 'bg-amber-950/60 text-amber-300 border-amber-500/40',
    },
    {
      title: 'Registered Users',
      value: metrics.totalUsers ?? 0,
      subtitle: 'Customer accounts in database',
      icon: Users,
      accent: 'from-rose-500/20 to-red-500/10 text-rose-400 border-rose-500/30',
      pill: 'Audience',
      pillColor: 'bg-rose-950/60 text-rose-300 border-rose-500/40',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Welcome & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Executive Dashboard
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono font-bold">
              v4.1
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Real-time aggregate analytics, theatrical distribution, and customer bookings
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-900 border border-gray-800 hover:border-cyan-500/40 text-gray-300 hover:text-cyan-300 text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            title="Refresh Real-time Metrics"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-cyan-400' : ''}`}
            />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Live Data'}</span>
          </button>
        </div>
      </div>

      {/* 6 Grid Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {STATS_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`relative rounded-2xl bg-gradient-to-br ${card.accent} border p-5 sm:p-6 shadow-xl backdrop-blur-sm transition-all hover:scale-[1.01]`}
            >
              <div className="flex items-center justify-between pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  {card.title}
                </span>
                <span
                  className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border ${card.pillColor}`}
                >
                  {card.pill}
                </span>
              </div>

              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
                  {card.value}
                </span>
                <div className="p-2.5 rounded-xl bg-gray-950/60 border border-gray-800 text-current">
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <p className="text-[11px] text-gray-400 mt-2 font-medium">{card.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Action Shortcuts Banner */}
      <div className="rounded-2xl bg-gray-900/60 border border-gray-800 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Console Shortcuts
            </h4>
            <p className="text-[11px] text-gray-400">
              Jump straight into platform management workflows
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/movies"
            className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-bold text-gray-200 hover:text-cyan-300 transition-colors inline-flex items-center gap-1.5"
          >
            <Film className="w-3.5 h-3.5" />
            <span>Manage Catalog</span>
          </Link>
          <Link
            to="/admin/theaters"
            className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-bold text-gray-200 hover:text-blue-300 transition-colors inline-flex items-center gap-1.5"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Theaters & Screens</span>
          </Link>
          <Link
            to="/admin/shows"
            className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-bold text-gray-200 hover:text-purple-300 transition-colors inline-flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Manage Shows</span>
          </Link>
          <Link
            to="/admin/bookings"
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-gray-950 font-bold text-xs shadow-md shadow-cyan-500/20 hover:scale-[1.02] transition-all inline-flex items-center gap-1.5"
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Audit All Bookings</span>
          </Link>
        </div>
      </div>

      {/* Main Two-Column Layout: Recent Transactions + Top Releases */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Bookings Table */}
        <div className="lg:col-span-2 rounded-2xl bg-[#0b1120]/80 border border-gray-800 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Recent Customer Bookings
              </h3>
            </div>
            <span className="text-xs text-gray-400 font-mono">
              Last {recentBookings.length} transactions
            </span>
          </div>

          {recentBookings.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-500">
              No transactions recorded yet. Bookings will populate here in real-time.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 text-[11px] font-bold uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Booking ID</th>
                    <th className="pb-3 font-semibold">Movie</th>
                    <th className="pb-3 font-semibold">Auditorium</th>
                    <th className="pb-3 font-semibold">Seats</th>
                    <th className="pb-3 font-semibold">Total Paid</th>
                    <th className="pb-3 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {recentBookings.map((b) => (
                    <tr key={b._id} className="hover:bg-gray-800/30 transition-colors">
                      {/* Booking ID & User */}
                      <td className="py-3.5 pr-3 font-mono font-bold text-cyan-400">
                        <div className="flex flex-col">
                          <span>{b.bookingId}</span>
                          <span className="text-[10px] text-gray-500 font-sans font-normal">
                            {b.user?.name || b.user?.email || 'Guest User'}
                          </span>
                        </div>
                      </td>

                      {/* Movie with poster */}
                      <td className="py-3.5 pr-3">
                        <div className="flex items-center gap-2.5">
                          {b.movie?.poster && (
                            <img
                              src={b.movie.poster}
                              alt={b.movie.title}
                              className="w-7 h-10 object-cover rounded shadow-sm flex-shrink-0"
                            />
                          )}
                          <span className="font-semibold text-white line-clamp-1 max-w-[140px]">
                            {b.movie?.title || 'Unknown Title'}
                          </span>
                        </div>
                      </td>

                      {/* Theater */}
                      <td className="py-3.5 pr-3 text-gray-300 font-medium">
                        <div className="flex flex-col">
                          <span className="line-clamp-1 max-w-[130px]">
                            {b.theater?.name || 'Multiplex'}
                          </span>
                          <span className="text-[10px] text-gray-500">{b.theater?.city}</span>
                        </div>
                      </td>

                      {/* Seats */}
                      <td className="py-3.5 pr-3 font-mono">
                        <div className="flex flex-wrap gap-1 max-w-[110px]">
                          {b.seats?.map((seat) => (
                            <span
                              key={seat}
                              className="px-1.5 py-0.5 rounded bg-gray-800 text-[10px] text-cyan-300 font-bold"
                            >
                              {seat}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 pr-3 font-mono font-bold text-emerald-400">
                        ₹{Number(b.totalAmount || 0).toFixed(2)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>{b.paymentStatus || 'Completed'}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right 1 Col: Top Performing Movies & System Health */}
        <div className="space-y-6">
          {/* Top Releases */}
          <div className="rounded-2xl bg-[#0b1120]/80 border border-gray-800 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Top Releases
                </h3>
              </div>
              <span className="text-[11px] text-gray-400">By Gross Volume</span>
            </div>

            {topMovies.length === 0 ? (
              <p className="text-xs text-gray-500 py-4 text-center">
                Top grossing movies will calculate as ticket reservations occur.
              </p>
            ) : (
              <div className="space-y-3.5">
                {topMovies.map((m, idx) => (
                  <div
                    key={m._id || idx}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-gray-900/60 border border-gray-800/80 hover:border-purple-500/30 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 text-center font-mono font-black text-xs text-gray-500">
                        #{idx + 1}
                      </span>
                      {m.poster && (
                        <img
                          src={m.poster}
                          alt={m.title}
                          className="w-8 h-11 object-cover rounded shadow"
                        />
                      )}
                      <div>
                        <h4 className="text-xs font-bold text-white line-clamp-1 max-w-[130px]">
                          {m.title}
                        </h4>
                        <p className="text-[10px] text-gray-400 font-mono">
                          {m.totalSeats || 0} tickets sold
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-black text-emerald-400">
                        ₹{Number(m.totalRevenue || 0).toLocaleString()}
                      </span>
                      <span className="block text-[9px] text-gray-500 uppercase tracking-wider font-semibold">
                        Gross
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Engine & Cluster Health Card */}
          <div className="rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-950/90 border border-gray-800 p-5 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Infrastructure Telemetry</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-gray-800">
                <span className="text-gray-400">Database Engine</span>
                <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  MongoDB Atlas
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-gray-800">
                <span className="text-gray-400">Seat Sync Engine</span>
                <span className="text-cyan-400 font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Socket.IO Active
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-gray-800">
                <span className="text-gray-400">Access Security</span>
                <span className="text-purple-400 font-mono font-bold">Role-Based JWT</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-400">Current Node</span>
                <span className="text-gray-300 font-mono text-[11px]">Primary Core 5000</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
