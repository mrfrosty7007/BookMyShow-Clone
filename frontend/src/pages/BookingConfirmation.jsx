import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Download,
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Film,
  Sparkles,
} from 'lucide-react';
import { getBooking } from '../services/api.js';
import { useFetch } from '../hooks/useFetch.js';
import { QRCodeTicket } from '../components/QRCodeTicket.jsx';
import { downloadTicketPDF } from '../utils/pdfGenerator.js';
import { Loader } from '../components/Loader.jsx';
import { EmptyState } from '../components/EmptyState.jsx';

/**
 * BookingConfirmation Page - Phase 3.3
 * Celebratory confirmation screen featuring authenticated QR pass,
 * booking metadata, and instant PDF ticket generation.
 */
export const BookingConfirmation = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const { data, loading, error } = useFetch(() => getBooking(bookingId), bookingId);

  if (loading) {
    return (
      <div className="min-h-[80vh] bg-[#0b0f19] flex items-center justify-center px-4">
        <Loader message="Retrieving your confirmed e-ticket..." size="lg" />
      </div>
    );
  }

  const booking = data?.booking;

  if (error || !booking) {
    return (
      <div className="min-h-[80vh] bg-[#0b0f19] flex items-center justify-center px-4 py-16">
        <EmptyState
          title="Booking Not Found"
          description={
            error ||
            'The requested booking reference could not be found or you do not have permission to view it.'
          }
          actionLabel="View My Bookings"
          onAction={() => navigate('/my-bookings')}
        />
      </div>
    );
  }

  const { movie, theater, show, seats = [], totalAmount = 0 } = booking;

  const showDate = show?.showTime
    ? new Date(show.showTime).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Today';

  const showTime = show?.showTime
    ? new Date(show.showTime).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : '7:30 PM';

  const backdropImage = movie?.banner || movie?.poster;

  const handleDownload = () => {
    downloadTicketPDF(booking);
  };

  return (
    <div className="relative min-h-screen bg-[#0b0f19] text-gray-100 pb-20 overflow-hidden">
      {/* Cinematic Ambient Backdrop */}
      {backdropImage && (
        <div className="absolute top-0 left-0 right-0 h-[480px] overflow-hidden -z-10 opacity-20 pointer-events-none">
          <img
            src={backdropImage}
            alt={movie?.title || 'Backdrop'}
            className="w-full h-full object-cover object-center filter blur-2xl scale-110 transform"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b0f19]/20 via-[#0b0f19]/80 to-[#0b0f19]" />
        </div>
      )}

      {/* Cyber radiant glows */}
      <div className="pointer-events-none fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] overflow-hidden -z-10 opacity-35">
        <div className="absolute -top-10 left-1/3 w-96 h-96 bg-emerald-500/15 rounded-full blur-[140px]" />
        <div className="absolute top-10 right-1/4 w-80 h-80 bg-cyan-500/15 rounded-full blur-[160px]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 space-y-8">
        {/* Success Header with Glowing Check Badge */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-emerald-500/15 border-2 border-emerald-400 text-emerald-400 shadow-xl shadow-emerald-500/30 animate-bounce">
            <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Payment Successful • Confirmed</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Tickets Confirmed!
            </h1>
            <p className="text-xs sm:text-sm text-gray-400">
              We have booked your seats and sent your electronic pass. Please present the QR code at
              the cinema gate.
            </p>
          </div>
        </div>

        {/* Master Cinema Ticket Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-gray-900/90 via-gray-900/80 to-[#0c1220]/95 border border-cyan-500/30 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl p-6 sm:p-8">
          {/* Subtle Glowing Accents */}
          <div className="pointer-events-none absolute -top-16 -right-16 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl" />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
            {/* Left: Movie & Showtime Information */}
            <div className="md:col-span-7 space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-20 sm:w-24 aspect-[2/3] rounded-xl overflow-hidden bg-gray-950 border border-gray-800 shadow-lg flex-shrink-0">
                  <img
                    src={movie?.poster}
                    alt={movie?.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60';
                    }}
                  />
                </div>

                <div className="space-y-1.5 flex-1">
                  <span className="font-mono text-xs font-black tracking-widest text-cyan-400 bg-cyan-950/70 border border-cyan-700/60 px-2.5 py-0.5 rounded-md">
                    {booking.bookingId}
                  </span>

                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                    {movie?.title}
                  </h2>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-300">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      {theater?.name}
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="text-cyan-300 font-semibold">Screen {show?.screen || 1}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {showDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      {showTime}
                    </span>
                  </div>
                </div>
              </div>

              {/* Seats & Booking Value Grid */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-800/80">
                <div className="p-3 rounded-xl bg-gray-950/50 border border-gray-800">
                  <span className="text-[11px] text-gray-400 uppercase tracking-wider block font-semibold">
                    Seats ({seats.length})
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {seats.map((sn) => (
                      <span
                        key={sn}
                        className="px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold"
                      >
                        {sn}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gray-950/50 border border-gray-800">
                  <span className="text-[11px] text-gray-400 uppercase tracking-wider block font-semibold">
                    Total Amount
                  </span>
                  <div className="text-xl font-black text-emerald-400 tracking-tight mt-0.5">
                    ₹{totalAmount.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Authenticated QR Pass */}
            <div className="md:col-span-5 flex flex-col items-center justify-center pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-gray-800/80 md:pl-8">
              <QRCodeTicket booking={booking} size={150} />
            </div>
          </div>

          {/* Action Button Bar */}
          <div className="mt-8 pt-6 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleDownload}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-gray-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/30 hover:shadow-cyan-400/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border border-cyan-300/40"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF Ticket</span>
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link
                to="/my-bookings"
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-xs uppercase tracking-wider transition-colors text-center cursor-pointer border border-gray-700/60 flex items-center justify-center gap-2"
              >
                <Ticket className="w-4 h-4 text-cyan-400" />
                <span>My Bookings</span>
              </Link>

              <Link
                to="/"
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white font-semibold text-xs tracking-wider transition-colors text-center cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Film className="w-4 h-4" />
                <span>Browse More</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
