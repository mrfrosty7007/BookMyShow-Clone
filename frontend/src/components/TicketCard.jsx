import { Calendar, Clock, MapPin, Ticket, Download, QrCode } from 'lucide-react';
import { downloadTicketPDF } from '../utils/pdfGenerator.js';

/**
 * TicketCard Component
 * Displays individual booking record in My Bookings list
 * with cinema perforated ticket aesthetic and PDF download action.
 */
export const TicketCard = ({ booking, onViewTicket }) => {
  if (!booking) return null;

  const { bookingId, movie, theater, show, seats = [], totalAmount = 0, createdAt } = booking;

  let qrData = null;
  if (booking?.qrToken) {
    try {
      qrData = typeof booking.qrToken === 'string' ? JSON.parse(booking.qrToken) : booking.qrToken;
    } catch {
      qrData = null;
    }
  }

  const movieTitle = movie?.title || booking?.movieTitle || qrData?.movie || 'Cinema Movie';
  const poster = movie?.poster;
  const theaterName = theater?.name || booking?.theaterName || qrData?.theater || 'Multiplex Cinema';
  const theaterCity = theater?.city || '';
  const screen = show?.screen || booking?.screen || qrData?.screen || 1;

  const rawShowTime = show?.showTime || show?.startTime || booking?.showTime || qrData?.showTime;
  const dateObj = rawShowTime ? new Date(rawShowTime) : null;
  const isValidDate = dateObj && !isNaN(dateObj.getTime());

  const showDate = isValidDate
    ? dateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : (booking?.date || qrData?.date || 'Upcoming');

  const showTime = isValidDate
    ? dateObj.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : (booking?.time || qrData?.time || 'Scheduled');

  const bookingDate = createdAt
    ? new Date(createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const handleDownload = (e) => {
    e.stopPropagation();
    downloadTicketPDF(booking);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900/95 via-gray-900/85 to-[#0f172a]/90 border border-gray-800/90 shadow-xl shadow-black/40 hover:border-gray-700/80 transition-all duration-300 p-5 sm:p-6 backdrop-blur-xl group">
      {/* Subtle Cyan Corner Glow on hover */}
      <div className="pointer-events-none absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/5 group-hover:bg-cyan-500/15 rounded-full blur-2xl transition-all" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        {/* Left: Movie Poster & Details */}
        <div className="flex items-start sm:items-center gap-4 flex-1">
          <div className="w-16 sm:w-20 aspect-[2/3] rounded-xl overflow-hidden bg-gray-950 border border-gray-800 flex-shrink-0 shadow-md">
            <img
              src={poster}
              alt={movieTitle}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60';
              }}
            />
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] font-black tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded-md">
                {bookingId}
              </span>
              {bookingDate && (
                <span className="text-[11px] text-gray-400">Booked on {bookingDate}</span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-black text-white tracking-tight leading-snug">
              {movieTitle}
            </h3>

            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-300">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                {theaterName} {theaterCity ? `• ${theaterCity}` : ''}
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-cyan-300 font-semibold">Screen {screen}</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 pt-0.5">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                {showDate}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {showTime}
              </span>
            </div>

            {/* Confirmed Seats Badges */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-gray-400 flex items-center gap-1 font-semibold mr-1">
                <Ticket className="w-3 h-3 text-emerald-400" />
                Seats:
              </span>
              {seats.map((seatNum) => (
                <span
                  key={seatNum}
                  className="px-2 py-0.5 rounded-md bg-gray-800/90 border border-gray-700 text-gray-200 text-xs font-bold font-mono"
                >
                  {seatNum}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Amount & Actions */}
        <div className="flex flex-wrap md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-gray-800/80">
          <div className="text-left md:text-right">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
              Total Paid
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 tracking-tight">
              ₹{totalAmount.toFixed(2)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onViewTicket && (
              <button
                type="button"
                onClick={() => onViewTicket(booking)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-bold transition-colors cursor-pointer border border-gray-700/60"
              >
                <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                <span>View QR</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-gray-950 text-xs font-black uppercase tracking-wider shadow-md shadow-cyan-500/20 hover:shadow-cyan-400/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF Ticket</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
