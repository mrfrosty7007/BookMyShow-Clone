import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Film, X, Download } from 'lucide-react';
import { getMyBookings } from '../services/api.js';
import { useFetch } from '../hooks/useFetch.js';
import { TicketCard } from '../components/TicketCard.jsx';
import { QRCodeTicket } from '../components/QRCodeTicket.jsx';
import { downloadTicketPDF } from '../utils/pdfGenerator.js';
import { Loader } from '../components/Loader.jsx';
import { EmptyState } from '../components/EmptyState.jsx';

/**
 * MyBookings Page - Phase 3.3
 * Displays user's chronological booking history with QR pass preview,
 * e-ticket PDF generation, and persistence from MongoDB Atlas.
 */
export const MyBookings = () => {
  const navigate = useNavigate();
  const [selectedTicket, setSelectedTicket] = useState(null);

  const { data, loading, error } = useFetch(getMyBookings);

  if (loading) {
    return (
      <div className="min-h-[80vh] bg-[#0b0f19] flex items-center justify-center px-4">
        <Loader message="Loading your cinema booking history..." size="lg" />
      </div>
    );
  }

  const bookings = data?.bookings || [];

  return (
    <div className="relative min-h-screen bg-[#0b0f19] text-gray-100 pb-20 overflow-hidden">
      {/* Cyber ambient glow accents */}
      <div className="pointer-events-none fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] overflow-hidden -z-10 opacity-30">
        <div className="absolute -top-10 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-10 right-1/4 w-80 h-80 bg-[#f84464]/10 rounded-full blur-[160px]" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <Ticket className="w-4 h-4" />
              <span>User Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              My Bookings & E-Tickets
            </h1>
            <p className="text-xs text-gray-400">
              View your active cinema passes, show QR codes at the gate, or download PDF tickets.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-bold transition-colors cursor-pointer border border-gray-700/60"
          >
            <Film className="w-3.5 h-3.5 text-cyan-400" />
            <span>Browse Movies</span>
          </button>
        </div>

        {/* Error or Empty State */}
        {error ? (
          <div className="py-12">
            <EmptyState
              title="Error Loading Bookings"
              description={error}
              actionLabel="Try Again"
              onAction={() => window.location.reload()}
            />
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-16">
            <EmptyState
              title="No Bookings Yet"
              description="You have not booked any movie tickets yet. Discover trending blockbusters in your city and pick the best seats!"
              actionLabel="Explore Movies"
              onAction={() => navigate('/')}
            />
          </div>
        ) : (
          /* Chronological List of Bookings */
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-gray-400 px-1 font-semibold">
              <span>
                {bookings.length} {bookings.length === 1 ? 'Booking' : 'Bookings'} Found
              </span>
              <span>Sorted by Newest First</span>
            </div>

            <div className="space-y-4">
              {bookings.map((booking) => (
                <TicketCard
                  key={booking._id || booking.bookingId}
                  booking={booking}
                  onViewTicket={(b) => setSelectedTicket(b)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* QR Ticket Inspection Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm rounded-3xl bg-[#0f172a] border border-cyan-500/30 p-6 shadow-2xl shadow-cyan-950/60 text-center space-y-4 animate-scale-in">
            <button
              type="button"
              onClick={() => setSelectedTicket(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-base font-black text-white tracking-tight">
                {selectedTicket.movie?.title}
              </h3>
              <p className="text-xs text-gray-400">
                {selectedTicket.theater?.name} • Screen {selectedTicket.show?.screen || 1}
              </p>
            </div>

            <QRCodeTicket booking={selectedTicket} size={160} />

            <div className="flex items-center justify-between text-xs text-left p-3 rounded-xl bg-gray-900 border border-gray-800">
              <div>
                <span className="text-gray-400 text-[10px] uppercase block">Seats</span>
                <span className="text-cyan-300 font-bold font-mono">
                  {selectedTicket.seats?.join(', ')}
                </span>
              </div>
              <div className="text-right">
                <span className="text-gray-400 text-[10px] uppercase block">Paid</span>
                <span className="text-emerald-400 font-bold font-mono">
                  ₹{selectedTicket.totalAmount?.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => downloadTicketPDF(selectedTicket)}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-gray-950 font-black text-xs uppercase tracking-wider shadow-md hover:shadow-cyan-400/40 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
