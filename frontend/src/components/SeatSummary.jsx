import { Armchair, Trash2, ArrowRight, ShieldCheck, Ticket, Clock } from 'lucide-react';

const CONVENIENCE_FEE = 30; // Fixed ₹30
const GST_RATE = 0.18; // 18% GST on convenience fee

/**
 * Format remaining seconds into MM:SS format
 */
const formatTime = (seconds) => {
  if (seconds <= 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

/**
 * SeatSummary Component
 * Sticky booking sidebar calculating live subtotal, convenience fee, GST,
 * and final payable amount with seat tags and checkout CTA.
 */
export const SeatSummary = ({
  selectedSeats = [],
  onClearSelection,
  onRemoveSeat,
  onContinuePayment,
  maxSeats = 10,
  countdownSeconds = 0,
}) => {
  const seatCount = selectedSeats.length;

  // Calculate financials
  const subtotal = selectedSeats.reduce((sum, seat) => sum + (seat.price || 0), 0);
  const convenienceFee = seatCount > 0 ? CONVENIENCE_FEE : 0;
  const gst = seatCount > 0 ? Number((convenienceFee * GST_RATE).toFixed(2)) : 0;
  const finalPayable = seatCount > 0 ? (subtotal + convenienceFee + gst).toFixed(2) : '0.00';

  // Group seats by category for itemized breakdown
  const categoryGroups = selectedSeats.reduce((acc, seat) => {
    const cat = seat.category || 'Regular';
    if (!acc[cat]) {
      acc[cat] = { count: 0, price: seat.price || 0, seats: [] };
    }
    acc[cat].count += 1;
    acc[cat].seats.push(seat.id);
    return acc;
  }, {});

  return (
    <div className="w-full rounded-2xl bg-gray-900/90 border border-gray-800/90 shadow-2xl shadow-black/60 p-5 sm:p-6 backdrop-blur-xl flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Ticket className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Booking Summary</h3>
            <p className="text-[11px] text-gray-400">
              {seatCount} of {maxSeats} max seats selected
            </p>
          </div>
        </div>

        {seatCount > 0 && (
          <button
            type="button"
            onClick={onClearSelection}
            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-medium transition-colors cursor-pointer"
            title="Clear all selected seats"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Phase 3.2 Live 5-minute Countdown Timer */}
      {seatCount > 0 && countdownSeconds > 0 && (
        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 shadow-sm animate-pulse">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider">Seats Reserved</span>
          </div>
          <span className="text-sm font-black font-mono tracking-widest text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded-md border border-amber-500/40">
            {formatTime(countdownSeconds)}
          </span>
        </div>
      )}

      {/* Selected Seats Badges */}
      {seatCount > 0 ? (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-gray-300 flex items-center justify-between">
            <span>Selected Seats ({seatCount})</span>
            <span className="text-cyan-400 font-bold">Max 10</span>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
            {selectedSeats.map((seat) => (
              <span
                key={seat.id}
                className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-bold shadow-sm"
              >
                <span>{seat.id}</span>
                <span className="text-[10px] text-cyan-400/70 font-normal">({seat.category})</span>
                {onRemoveSeat && (
                  <button
                    type="button"
                    onClick={() => onRemoveSeat(seat.id)}
                    className="text-cyan-400 hover:text-red-400 ml-0.5"
                    aria-label={`Remove seat ${seat.id}`}
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>

          {/* Tier Categorized Summary Lines */}
          <div className="pt-2 border-t border-gray-800/80 space-y-1.5 text-xs text-gray-300">
            {Object.entries(categoryGroups).map(([catName, group]) => (
              <div key={catName} className="flex justify-between items-center">
                <span>
                  {catName} ({group.count} × ₹{group.price})
                </span>
                <span className="font-semibold text-white">₹{group.count * group.price}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="py-6 flex flex-col items-center justify-center text-center text-gray-400 space-y-2 rounded-xl bg-gray-950/40 border border-dashed border-gray-800 p-4">
          <Armchair className="w-8 h-8 text-gray-600 animate-pulse" />
          <p className="text-xs font-medium text-gray-400">No seats selected yet</p>
          <p className="text-[11px] text-gray-500 max-w-[200px]">
            Click on available seats on the auditorium map to reserve
          </p>
        </div>
      )}

      {/* Financial Price Breakdown */}
      <div className="pt-3 border-t border-gray-800/90 space-y-2 text-xs">
        <div className="flex justify-between items-center text-gray-300">
          <span>Ticket Subtotal</span>
          <span className="font-bold text-white">₹{subtotal}</span>
        </div>

        <div className="flex justify-between items-center text-gray-400">
          <span>Convenience Fee (Fixed)</span>
          <span>₹{convenienceFee}</span>
        </div>

        <div className="flex justify-between items-center text-gray-400">
          <span>Integrated GST (18%)</span>
          <span>₹{gst.toFixed(2)}</span>
        </div>

        <div className="pt-2 border-t border-gray-800 flex justify-between items-baseline">
          <div>
            <div className="text-sm font-black text-white">Total Amount</div>
            <div className="text-[10px] text-gray-400">Inclusive of all taxes</div>
          </div>
          <div className="text-2xl font-black text-emerald-400 tracking-tight">₹{finalPayable}</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2">
        <button
          type="button"
          disabled={seatCount === 0}
          onClick={onContinuePayment}
          className={`w-full py-3.5 px-4 rounded-xl font-black text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
            seatCount > 0
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-gray-950 shadow-lg shadow-cyan-500/40 hover:shadow-cyan-400/60 hover:scale-[1.02] active:scale-[0.98] cursor-pointer border border-cyan-300/40'
              : 'bg-gray-800 text-gray-500 border border-gray-700/50 cursor-not-allowed opacity-60'
          }`}
        >
          <span>Continue to Payment</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-gray-400">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Safe & Secure 256-bit Encrypted Checkout</span>
        </div>
      </div>
    </div>
  );
};

export default SeatSummary;
