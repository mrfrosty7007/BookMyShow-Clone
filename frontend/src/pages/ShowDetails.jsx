import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  AlertCircle,
  X,
  Armchair,
  CheckCircle2,
  Clock,
  Lock,
  Ticket,
  AlertTriangle,
} from 'lucide-react';
import { getShow, createBooking } from '../services/api.js';
import { useFetch } from '../hooks/useFetch.js';
import { useAuth } from '../hooks/useAuth.js';
import {
  getSocket,
  joinShow,
  lockSeat,
  unlockSeat,
  getClientSessionId,
} from '../services/socket.js';
import { ShowHeader } from '../components/ShowHeader.jsx';
import { TheaterCard } from '../components/TheaterCard.jsx';
import { ScreenIndicator } from '../components/ScreenIndicator.jsx';
import { SeatLegend } from '../components/SeatLegend.jsx';
import { SeatGrid } from '../components/SeatGrid.jsx';
import { SeatSummary } from '../components/SeatSummary.jsx';
import { PaymentModal } from '../components/PaymentModal.jsx';
import { Loader } from '../components/Loader.jsx';
import { EmptyState } from '../components/EmptyState.jsx';

const MAX_SELECTABLE_SEATS = 10;

/**
 * Format remaining seconds into MM:SS format
 */
const formatTimer = (seconds) => {
  if (seconds <= 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

/**
 * ShowDetails Page - Phase 3.2 Real-time Enabled
 * Integrates live Socket.IO seat locking, 5-minute reservation timer,
 * real-time availability across sessions, and instant booking confirmation.
 */
export const ShowDetails = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Distinct identifier per session/user
  const currentUserId = useMemo(() => {
    return user?._id || getClientSessionId();
  }, [user]);

  // Fetch show details
  const { data, loading, error } = useFetch(() => getShow(showId), showId);

  // Real-time seat tracking states
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [lockedByOthers, setLockedByOthers] = useState([]);
  const [liveBookedSeats, setLiveBookedSeats] = useState([]);
  const [countdownSeconds, setCountdownSeconds] = useState(0);
  const [limitWarning, setLimitWarning] = useState(null);
  const [bookingResult, setBookingResult] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Derive permanently booked seats from initial fetch + live bookings
  const permanentlyBooked = useMemo(() => {
    const fromApi = Array.isArray(data?.bookedSeats) ? data.bookedSeats : [];
    return Array.from(new Set([...fromApi, ...liveBookedSeats]));
  }, [data, liveBookedSeats]);

  // Toast notification helper
  const addToast = useCallback((message, type = 'info') => {
    const id = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev.slice(-4), { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Connect Socket.IO and register real-time event listeners
  useEffect(() => {
    if (!showId) return;

    const socket = getSocket(currentUserId);

    // Join show room
    joinShow(showId);

    // 1. Initial locks received upon joining room
    const handleInitialLocks = ({ lockedSeats = [] }) => {
      const others = lockedSeats.filter((l) => l.userId !== currentUserId).map((l) => l.seatNumber);
      setLockedByOthers(others);
    };

    // 2. Someone locked a seat
    const handleSeatLocked = ({ seatNumber, userId, expiresIn }) => {
      if (userId === currentUserId) {
        setCountdownSeconds((prev) => (prev > 0 ? prev : expiresIn || 300));
        addToast(`Seat ${seatNumber} reserved for 5 minutes.`, 'success');
      } else {
        setLockedByOthers((prev) => Array.from(new Set([...prev, seatNumber])));
        setSelectedSeats((prev) => prev.filter((s) => s.id !== seatNumber));
        addToast(`Another customer locked seat ${seatNumber}.`, 'warning');
      }
    };

    // 3. Someone unlocked a seat
    const handleSeatUnlocked = ({ seatNumber, userId, reason }) => {
      if (userId === currentUserId) {
        setSelectedSeats((prev) => prev.filter((s) => s.id !== seatNumber));
        if (reason === 'expired') {
          addToast(`Reservation expired for seat ${seatNumber}.`, 'warning');
        }
      } else {
        setLockedByOthers((prev) => prev.filter((sn) => sn !== seatNumber));
      }
    };

    // 4. Booking confirmed permanently
    const handleBookingConfirmed = ({ bookedSeats = [], userId }) => {
      setLiveBookedSeats((prev) => Array.from(new Set([...prev, ...bookedSeats])));
      setLockedByOthers((prev) => prev.filter((sn) => !bookedSeats.includes(sn)));

      if (userId !== currentUserId) {
        setSelectedSeats((prev) => prev.filter((s) => !bookedSeats.includes(s.id)));
        addToast(`Seats ${bookedSeats.join(', ')} were permanently booked.`, 'info');
      }
    };

    // 5. Booking success for current user
    const handleBookingSuccess = (payload) => {
      setBookingResult(payload);
      setSelectedSeats([]);
      setCountdownSeconds(0);
      addToast(`Booking Confirmed! Reference: ${payload.bookingId}`, 'success');
    };

    // 6. Booking failed
    const handleBookingFailed = ({ reason }) => {
      addToast(reason || 'Booking confirmation failed', 'error');
    };

    // 7. Lock failed
    const handleLockFailed = ({ seatNumber, reason }) => {
      setSelectedSeats((prev) => prev.filter((s) => s.id !== seatNumber));
      addToast(reason || `Lock failed for seat ${seatNumber}`, 'error');
    };

    socket.on('initial-locks', handleInitialLocks);
    socket.on('seat-locked', handleSeatLocked);
    socket.on('seat-unlocked', handleSeatUnlocked);
    socket.on('booking-confirmed', handleBookingConfirmed);
    socket.on('booking-success', handleBookingSuccess);
    socket.on('booking-failed', handleBookingFailed);
    socket.on('lock-failed', handleLockFailed);

    return () => {
      socket.off('initial-locks', handleInitialLocks);
      socket.off('seat-locked', handleSeatLocked);
      socket.off('seat-unlocked', handleSeatUnlocked);
      socket.off('booking-confirmed', handleBookingConfirmed);
      socket.off('booking-success', handleBookingSuccess);
      socket.off('booking-failed', handleBookingFailed);
      socket.off('lock-failed', handleLockFailed);
    };
  }, [showId, currentUserId, addToast]);

  // Live 5-minute countdown timer effect
  useEffect(() => {
    if (selectedSeats.length === 0 || countdownSeconds <= 0) return;

    const timer = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-release all held locks
          selectedSeats.forEach((seat) => {
            unlockSeat(showId, seat.id);
          });
          setSelectedSeats([]);
          addToast(
            'Your 5-minute seat reservation has expired. Please select seats again.',
            'warning'
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedSeats, countdownSeconds, showId, addToast]);

  if (loading) {
    return (
      <div className="min-h-[80vh] bg-[#0b0f19] flex items-center justify-center px-4">
        <Loader message="Loading auditorium layout and showtime details..." size="lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[80vh] bg-[#0b0f19] flex items-center justify-center px-4 py-16">
        <EmptyState
          title="Show Not Found"
          description={
            error || 'The requested showtime is unavailable, expired, or has been removed.'
          }
          actionLabel="Browse Movies"
          onAction={() => navigate('/')}
        />
      </div>
    );
  }

  const show = data?.show || data;
  const movie = show?.movie || data?.movie;
  const theater = show?.theater || data?.theater;
  const seatLayout = show?.seatLayout || data?.seatLayout;

  const backdropImage = movie?.banner || movie?.poster;

  // Toggle seat selection with real-time socket lock
  const handleToggleSeat = (seat) => {
    setLimitWarning(null);

    const isAlreadySelected = selectedSeats.some((s) => s.id === seat.id);

    if (isAlreadySelected) {
      // Release lock
      unlockSeat(showId, seat.id);
      setSelectedSeats((prev) => prev.filter((s) => s.id !== seat.id));
      addToast(`Seat ${seat.id} released.`, 'info');
    } else {
      // Check limits
      if (selectedSeats.length >= MAX_SELECTABLE_SEATS) {
        setLimitWarning(`You can select a maximum of ${MAX_SELECTABLE_SEATS} seats per booking.`);
        return;
      }
      if (lockedByOthers.includes(seat.id) || permanentlyBooked.includes(seat.id)) {
        addToast(`Seat ${seat.id} is no longer available.`, 'warning');
        return;
      }

      // Request 5-minute lock via socket
      lockSeat(showId, seat.id);
      setSelectedSeats((prev) => [...prev, seat]);
    }
  };

  // Remove individual seat
  const handleRemoveSeat = (seatId) => {
    unlockSeat(showId, seatId);
    setSelectedSeats((prev) => prev.filter((s) => s.id !== seatId));
    addToast(`Seat ${seatId} released.`, 'info');
  };

  // Clear all selected seats
  const handleClearSelection = () => {
    selectedSeats.forEach((s) => {
      unlockSeat(showId, s.id);
    });
    setSelectedSeats([]);
    setCountdownSeconds(0);
    setLimitWarning(null);
    addToast('All selected seats have been released.', 'info');
  };

  // Max limit callback from grid
  const handleMaxLimitReached = (limit) => {
    setLimitWarning(`Maximum of ${limit} seats allowed per booking.`);
  };

  // Continue to Payment: check authentication and open payment simulation modal
  const handleContinuePayment = () => {
    if (selectedSeats.length === 0) return;
    if (!user) {
      addToast('Please sign in to proceed with booking payment.', 'warning');
      setTimeout(() => {
        navigate('/login', { state: { from: `/show/${showId}` } });
      }, 1000);
      return;
    }
    setPaymentModalOpen(true);
  };

  // Payment simulation confirmed: execute backend booking creation
  const handlePaymentSuccess = async (paymentMethod) => {
    const seatIds = selectedSeats.map((s) => s.id);
    const res = await createBooking({
      showId,
      seats: seatIds,
      paymentMethod,
    });

    if (res?.booking?.bookingId) {
      setSelectedSeats([]);
      setCountdownSeconds(0);
      try {
        window.sessionStorage.removeItem(`bms_seats_${showId}`);
      } catch {
        // ignore
      }
      setPaymentModalOpen(false);
      addToast('Payment successful! Booking confirmed.', 'success');
      navigate(`/booking/confirmation/${res.booking.bookingId}`);
    } else {
      throw new Error(res?.message || 'Failed to complete booking. Please try again.');
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0b0f19] text-gray-100 pb-20 overflow-hidden">
      {/* Cinematic Ambient Backdrop */}
      {backdropImage && (
        <div className="absolute top-0 left-0 right-0 h-[480px] overflow-hidden -z-10 opacity-20 pointer-events-none">
          <img
            src={backdropImage}
            alt={movie?.title || 'Backdrop'}
            className="w-full h-full object-cover object-center filter blur-xl scale-110 transform"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b0f19]/30 via-[#0b0f19]/80 to-[#0b0f19]" />
        </div>
      )}

      {/* Cyber ambient glow accents */}
      <div className="pointer-events-none fixed top-24 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] overflow-hidden -z-10 opacity-30">
        <div className="absolute -top-20 left-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-[140px]" />
        <div className="absolute -top-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[160px]" />
      </div>

      {/* Real-time Floating Toast Notifications */}
      <div className="fixed top-20 right-4 sm:right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          let bgClass = 'bg-gray-900/95 border-gray-700 text-gray-200';
          let icon = <Clock className="w-4 h-4 text-cyan-400" />;

          if (toast.type === 'success') {
            bgClass = 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200';
            icon = <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
          } else if (toast.type === 'warning') {
            bgClass = 'bg-amber-950/90 border-amber-500/40 text-amber-200';
            icon = <AlertTriangle className="w-4 h-4 text-amber-400" />;
          } else if (toast.type === 'error') {
            bgClass = 'bg-red-950/90 border-red-500/40 text-red-200';
            icon = <AlertCircle className="w-4 h-4 text-red-400" />;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md text-xs font-semibold animate-slide-in-down transition-all ${bgClass}`}
            >
              <div className="flex items-center gap-2">
                {icon}
                <span>{toast.message}</span>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="opacity-70 hover:opacity-100 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6 sm:space-y-8">
        {/* Navigation & Breadcrumbs */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to={movie?._id ? `/movie/${movie._id}` : '/'}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-cyan-400 transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to {movie?.title ? movie.title : 'Movie'}</span>
          </Link>

          <div className="flex items-center gap-3">
            {/* Live Socket Status */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Sync Active
            </div>

            {/* Live Countdown Banner in Navigation */}
            {countdownSeconds > 0 && selectedSeats.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-950/50 border border-amber-500/40 px-3 py-1 rounded-full animate-pulse">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Reserved: {formatTimer(countdownSeconds)}</span>
              </div>
            )}
          </div>
        </div>

        {/* 1. Show Header Component */}
        <ShowHeader movie={movie} />

        {/* 2. Theater Details Card */}
        <TheaterCard
          theater={theater}
          showTime={show?.showTime}
          time={show?.time}
          date={show?.date}
          price={show?.price}
          screen={show?.screen}
        />

        {/* Limit Warning Alert Banner */}
        {limitWarning && (
          <div className="rounded-xl bg-amber-500/15 border border-amber-500/30 p-4 text-amber-300 text-xs sm:text-sm font-medium flex items-center justify-between shadow-lg backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-400" />
              <span>{limitWarning}</span>
            </div>
            <button
              type="button"
              onClick={() => setLimitWarning(null)}
              className="text-amber-400 hover:text-white p-1 rounded-lg hover:bg-amber-500/20"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 3. Auditorium & Seat Selection Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Screen Indicator, Seat Grid, and Legend */}
          <div className="lg:col-span-8 flex flex-col items-center rounded-2xl bg-gradient-to-b from-gray-900/80 via-gray-900/60 to-[#0c1220]/90 border border-gray-800/80 p-4 sm:p-7 shadow-xl shadow-black/50 backdrop-blur-xl">
            {/* Auditorium Title */}
            <div className="w-full flex items-center justify-between pb-2 border-b border-gray-800/80">
              <div className="flex items-center gap-2">
                <Armchair className="w-4 h-4 text-cyan-400" />
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Auditorium Layout
                </h2>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400 font-semibold">
                {lockedByOthers.length > 0 && (
                  <span className="flex items-center gap-1 text-amber-400">
                    <Lock className="w-3 h-3" /> {lockedByOthers.length} Locked
                  </span>
                )}
                <span>
                  Screen {show?.screen || 1} • {120 - permanentlyBooked.length} Available
                </span>
              </div>
            </div>

            {/* Screen Indicator */}
            <ScreenIndicator />

            {/* Interactive Seat Grid with Live Locks */}
            <SeatGrid
              categories={seatLayout?.categories}
              bookedSeats={permanentlyBooked}
              selectedSeats={selectedSeats}
              lockedByOthers={lockedByOthers}
              onToggleSeat={handleToggleSeat}
              maxSeats={MAX_SELECTABLE_SEATS}
              onMaxLimitReached={handleMaxLimitReached}
            />

            {/* Seat State & Category Legend */}
            <div className="w-full mt-8">
              <SeatLegend categories={seatLayout?.categories} />
            </div>
          </div>

          {/* Right Column: Sticky Booking Summary Panel */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <SeatSummary
              selectedSeats={selectedSeats}
              onClearSelection={handleClearSelection}
              onRemoveSeat={handleRemoveSeat}
              onContinuePayment={handleContinuePayment}
              maxSeats={MAX_SELECTABLE_SEATS}
              countdownSeconds={countdownSeconds}
            />
          </div>
        </div>
      </div>

      {/* Phase 3.2 Booking Success Confirmation Modal */}
      {bookingResult && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0f172a] border border-emerald-500/40 p-6 sm:p-8 shadow-2xl shadow-emerald-500/20 text-center space-y-5 animate-scale-in">
            {/* Success Icon */}
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                Booking Confirmed
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">
                Tickets Reserved!
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Booking Reference ID:{' '}
                <strong className="text-cyan-400 font-mono text-sm">
                  {bookingResult.bookingId}
                </strong>
              </p>
            </div>

            {/* Ticket Card Details */}
            <div className="rounded-2xl bg-gray-900/90 border border-gray-800 p-4 sm:p-5 text-left space-y-3">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-800">
                <Ticket className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-white">{movie?.title}</h4>
                  <p className="text-xs text-gray-400">
                    {theater?.name} • Screen {show?.screen}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-400">Show Date & Time</span>
                  <p className="text-white font-semibold">
                    {show?.date} • {show?.time}
                  </p>
                </div>

                <div>
                  <span className="text-gray-400">Confirmed Seats</span>
                  <p className="text-emerald-400 font-bold text-sm">
                    {bookingResult.bookedSeats.join(', ')}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setBookingResult(null)}
                className="flex-1 py-3.5 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Close Summary
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/30 hover:scale-[1.02] transition-all cursor-pointer"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Phase 3.3 Payment Simulation Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        show={show}
        selectedSeats={selectedSeats}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default ShowDetails;
