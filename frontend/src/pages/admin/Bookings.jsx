import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Ticket,
  Search,
  DollarSign,
  UserCheck,
  RotateCcw,
  Clock,
  Users,
  QrCode,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import {
  getAdminBookings,
  getMovies,
  getTheaters,
  checkInBooking,
  recoverSeatLocks,
} from '../../services/api.js';
import { BookingStatusPill } from '../../components/admin/BookingStatusPill.jsx';
import { AttendanceCard } from '../../components/admin/AttendanceCard.jsx';
import { BookingDetailsDrawer } from '../../components/admin/BookingDetailsDrawer.jsx';
import { RefundDialog } from '../../components/admin/RefundDialog.jsx';

/**
 * Bookings Page
 * Central executive console for cinema booking operations, attendance tracking,
 * refund processing, seat inventory recovery, and customer ticket auditing.
 */
export const Bookings = () => {
  const navigate = useNavigate();

  // Primary Data States
  const [bookings, setBookings] = useState([]);
  const [kpis, setKpis] = useState({
    todayBookings: 0,
    checkIns: 0,
    totalCheckIns: 0,
    pendingEntries: 0,
    refundsCount: 0,
    refundsAmount: 0,
    revenue: 0,
    occupancy: 0,
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Filter dropdown data
  const [movieOptions, setMovieOptions] = useState([]);
  const [theaterOptions, setTheaterOptions] = useState([]);

  // Active Filters
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [movieFilter, setMovieFilter] = useState('');
  const [theaterFilter, setTheaterFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');

  // Modals & Drawers
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [refundBookingTarget, setRefundBookingTarget] = useState(null);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [isRecoveringLocks, setIsRecoveringLocks] = useState(false);

  // Trigger refetch counter
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch filter dropdown options on mount
  useEffect(() => {
    let isMounted = true;
    const fetchOptions = async () => {
      try {
        const [moviesRes, theatersRes] = await Promise.all([getMovies(), getTheaters()]);
        if (isMounted) {
          setMovieOptions(moviesRes.movies || []);
          setTheaterOptions(theatersRes.theaters || []);
        }
      } catch (err) {
        console.error('Error fetching filter options:', err);
      }
    };
    fetchOptions();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch bookings list and KPIs
  useEffect(() => {
    let isMounted = true;

    const loadBookings = async () => {
      try {
        const params = {
          page: pagination.page,
          limit: pagination.limit,
          search: search.trim() || undefined,
          date: dateFilter || undefined,
          movieId: movieFilter || undefined,
          theaterId: theaterFilter || undefined,
          status: statusFilter || undefined,
          paymentStatus: paymentFilter || undefined,
        };

        const response = await getAdminBookings(params);
        if (!isMounted) return;

        setBookings(response.bookings || []);
        if (response.kpis) setKpis(response.kpis);
        if (response.pagination) setPagination(response.pagination);
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to fetch bookings.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadBookings();

    return () => {
      isMounted = false;
    };
  }, [
    pagination.page,
    pagination.limit,
    search,
    dateFilter,
    movieFilter,
    theaterFilter,
    statusFilter,
    paymentFilter,
    refreshTrigger,
  ]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Quick manual check-in from table action
  const handleQuickCheckIn = async (booking) => {
    try {
      await checkInBooking(booking._id || booking.bookingId, {
        gate: 'Admin Table Quick Action',
        device: 'Operations Dashboard',
      });
      showToast(`Ticket ${booking.bookingId} checked in successfully!`);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      showToast(`Check-in error: ${err.message}`);
    }
  };

  // Recover abandoned seat locks
  const handleRecoverSeatLocks = async () => {
    setIsRecoveringLocks(true);
    try {
      const res = await recoverSeatLocks();
      showToast(res.message || 'Expired seat locks recovered.');
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      showToast(`Recovery error: ${err.message}`);
    } finally {
      setIsRecoveringLocks(false);
    }
  };

  const openDrawerForBooking = (id) => {
    setSelectedBookingId(id);
    setIsDrawerOpen(true);
  };

  const openRefundModal = (booking) => {
    setRefundBookingTarget(booking);
    setIsRefundModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-gray-900 border border-cyan-500/40 text-cyan-300 shadow-2xl shadow-cyan-900/40 flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-5 h-5 text-cyan-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-100 flex items-center gap-2.5">
            <Ticket className="w-6 h-6 text-cyan-400" />
            <span>Booking Operations & Telemetry</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Real-time cinema reservation monitoring, gate admission, refunds, and attendance
            auditing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Seat Lock Recovery Trigger */}
          <button
            onClick={handleRecoverSeatLocks}
            disabled={isRecoveringLocks}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 text-xs font-medium text-gray-300 transition-all disabled:opacity-50"
            title="Clean up abandoned temporary seat holds"
          >
            <RotateCcw
              className={`w-3.5 h-3.5 text-amber-400 ${isRecoveringLocks ? 'animate-spin' : ''}`}
            />
            <span>Recover Seat-Locks</span>
          </button>

          {/* Launch Kiosk Scanner */}
          <button
            onClick={() => navigate('/admin/scanner')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs transition-all shadow-lg shadow-cyan-500/20"
          >
            <QrCode className="w-4 h-4" />
            <span>Launch Entry Scanner</span>
          </button>

          {/* Refresh */}
          <button
            onClick={() => setRefreshTrigger((prev) => prev + 1)}
            className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-cyan-400 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Today's Bookings */}
        <div className="p-4 rounded-2xl bg-[#0b1120] border border-gray-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>Today&apos;s Bookings</span>
            <Ticket className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-xl font-bold font-mono text-gray-100">{kpis.todayBookings}</p>
          <span className="text-[10px] text-gray-500">Live 24h count</span>
        </div>

        {/* Check-ins */}
        <div className="p-4 rounded-2xl bg-[#0b1120] border border-gray-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>Check-Ins</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold font-mono text-emerald-400">{kpis.checkIns}</p>
          <span className="text-[10px] text-gray-500">{kpis.totalCheckIns} all-time</span>
        </div>

        {/* Pending Entries */}
        <div className="p-4 rounded-2xl bg-[#0b1120] border border-gray-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>Pending Entries</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-bold font-mono text-amber-400">{kpis.pendingEntries}</p>
          <span className="text-[10px] text-gray-500">Awaiting admission</span>
        </div>

        {/* Refunds */}
        <div className="p-4 rounded-2xl bg-[#0b1120] border border-gray-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>Refunds</span>
            <RotateCcw className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-xl font-bold font-mono text-rose-400">
            {kpis.refundsCount}{' '}
            <span className="text-xs text-gray-500 font-normal">(₹{kpis.refundsAmount})</span>
          </p>
          <span className="text-[10px] text-gray-500">Restored seats</span>
        </div>

        {/* Total Revenue */}
        <div className="p-4 rounded-2xl bg-[#0b1120] border border-gray-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>Gross Revenue</span>
            <DollarSign className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-xl font-bold font-mono text-cyan-400">₹{kpis.revenue}</p>
          <span className="text-[10px] text-gray-500">Completed orders</span>
        </div>

        {/* Occupancy Rate */}
        <div className="p-4 rounded-2xl bg-[#0b1120] border border-gray-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>Occupancy</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-xl font-bold font-mono text-purple-400">{kpis.occupancy}%</p>
          <span className="text-[10px] text-gray-500">Active auditoriums</span>
        </div>
      </div>

      {/* Attendance & Kiosk Quick Overview */}
      <AttendanceCard
        title="Live Gate Admission Telemetry"
        checkedIn={kpis.checkIns}
        totalBookings={kpis.checkIns + kpis.pendingEntries}
        occupancy={kpis.occupancy}
        entryRate={`${kpis.checkIns} validated today`}
      />

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-2xl bg-[#0b1120] border border-gray-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Universal Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Booking ID, customer email, phone..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Date Picker */}
          <div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Movie Filter */}
          <div>
            <select
              value={movieFilter}
              onChange={(e) => setMovieFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
            >
              <option value="">All Movies</option>
              {movieOptions.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>

          {/* Theater Filter */}
          <div>
            <select
              value={theaterFilter}
              onChange={(e) => setTheaterFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
            >
              <option value="">All Theaters</option>
              {theaterOptions.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Checked-In">Checked-In</option>
              <option value="Refunded">Refunded</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Pending">Pending</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>

        {/* Active Filter Clear Helper */}
        {(search ||
          dateFilter ||
          movieFilter ||
          theaterFilter ||
          statusFilter ||
          paymentFilter) && (
          <div className="flex items-center justify-between pt-1 text-xs text-gray-400">
            <span>Filtered results active</span>
            <button
              onClick={() => {
                setSearch('');
                setDateFilter('');
                setMovieFilter('');
                setTheaterFilter('');
                setStatusFilter('');
                setPaymentFilter('');
              }}
              className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Bookings Table */}
      <div className="rounded-2xl bg-[#0b1120] border border-gray-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-900/60 border-b border-gray-800 text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Booking ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Movie & Theater</th>
                <th className="py-3.5 px-4">Show Time</th>
                <th className="py-3.5 px-4">Seats</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                      <span>Loading cinema bookings...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-rose-400">
                    {error}
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-16 text-center text-gray-500">
                    No bookings found matching the current query criteria.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => {
                  const seatList = booking.seats
                    ?.map((s) => (typeof s === 'string' ? s : s.seatNumber))
                    .join(', ');

                  return (
                    <tr key={booking._id} className="hover:bg-gray-900/30 transition-colors group">
                      {/* Booking ID */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => openDrawerForBooking(booking.bookingId || booking._id)}
                          className="font-mono font-bold text-cyan-400 hover:text-cyan-300 text-left transition-colors flex items-center gap-1.5"
                        >
                          <span>{booking.bookingId}</span>
                          <Eye className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                        <span className="text-[10px] text-gray-500 block">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-gray-200">{booking.user?.name || 'Guest'}</p>
                        <p className="text-[11px] text-gray-400">{booking.user?.email || 'N/A'}</p>
                      </td>

                      {/* Movie & Theater */}
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-gray-200 truncate max-w-[180px]">
                          {booking.movie?.title || 'Film'}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate max-w-[180px]">
                          {booking.theater?.name} • Screen{' '}
                          {booking.screen || booking.show?.screen || 1}
                        </p>
                      </td>

                      {/* Show Time */}
                      <td className="py-3.5 px-4 text-gray-300 whitespace-nowrap">
                        {booking.show?.showTime ? (
                          <>
                            <span className="block font-medium">
                              {new Date(booking.show.showTime).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            <span className="text-[10px] text-gray-500">
                              {new Date(booking.show.showTime).toLocaleDateString()}
                            </span>
                          </>
                        ) : (
                          'N/A'
                        )}
                      </td>

                      {/* Seats */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded bg-gray-900 border border-gray-800 font-mono text-[11px] text-cyan-300">
                          {seatList || '—'}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-200">
                        ₹{booking.totalAmount}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <BookingStatusPill status={booking.status} size="sm" />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {booking.status === 'Confirmed' && (
                            <button
                              onClick={() => handleQuickCheckIn(booking)}
                              className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
                              title="Quick Check-In"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {booking.status !== 'Refunded' && booking.status !== 'Cancelled' && (
                            <button
                              onClick={() => openRefundModal(booking)}
                              className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors"
                              title="Process Refund"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => openDrawerForBooking(booking.bookingId || booking._id)}
                            className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
                            title="Inspect Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800 bg-gray-900/40 text-xs text-gray-400">
          <span>
            Showing {bookings.length} of {pagination.total} booking(s)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))
              }
              disabled={pagination.page <= 1 || isLoading}
              className="p-1.5 rounded-lg bg-gray-900 border border-gray-800 hover:border-gray-700 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-gray-300">
              Page {pagination.page} of {pagination.pages || 1}
            </span>
            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  page: Math.min(prev.pages || 1, prev.page + 1),
                }))
              }
              disabled={pagination.page >= (pagination.pages || 1) || isLoading}
              className="p-1.5 rounded-lg bg-gray-900 border border-gray-800 hover:border-gray-700 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Integrated Inspector Drawer */}
      <BookingDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        bookingId={selectedBookingId}
        onBookingUpdated={() => setRefreshTrigger((prev) => prev + 1)}
        onOpenRefund={(b) => {
          setIsDrawerOpen(false);
          openRefundModal(b);
        }}
      />

      {/* Integrated Refund Dialog Modal */}
      <RefundDialog
        isOpen={isRefundModalOpen}
        onClose={() => {
          setIsRefundModalOpen(false);
          setRefundBookingTarget(null);
        }}
        booking={refundBookingTarget}
        onRefundSuccess={(res) => {
          showToast(res.message || 'Refund successfully processed.');
          setRefreshTrigger((prev) => prev + 1);
        }}
      />
    </div>
  );
};

export default Bookings;
