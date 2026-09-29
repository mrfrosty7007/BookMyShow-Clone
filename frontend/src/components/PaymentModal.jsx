import { useState } from 'react';
import {
  CreditCard,
  Smartphone,
  Building,
  ShieldCheck,
  X,
  CheckCircle2,
  Lock,
  Loader2,
  Calendar,
  Clock,
  MapPin,
  Ticket,
} from 'lucide-react';

const PAYMENT_METHODS = [
  {
    id: 'UPI',
    name: 'UPI (Instant Pay)',
    description: 'Google Pay, PhonePe, Paytm, BHIM UPI',
    icon: Smartphone,
    popular: true,
  },
  {
    id: 'Card',
    name: 'Credit / Debit Card',
    description: 'Visa, MasterCard, RuPay, Diners',
    icon: CreditCard,
  },
  {
    id: 'NetBanking',
    name: 'Net Banking',
    description: 'All Indian major banks supported',
    icon: Building,
  },
];

/**
 * PaymentModal Component
 * BookMyShow-style payment simulation modal with multi-stage progress animation,
 * breakdown recap, payment method selector, and secure mock processing.
 */
export const PaymentModal = ({ isOpen, onClose, show, selectedSeats = [], onPaymentSuccess }) => {
  const [selectedMethod, setSelectedMethod] = useState('UPI');
  const [stage, setStage] = useState('idle'); // 'idle' | 'processing' | 'verifying' | 'generating' | 'success'
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState(null);

  // Financial calculations
  const subtotal = selectedSeats.reduce((sum, s) => sum + (s.price || 0), 0);
  const convenienceFee = selectedSeats.length > 0 ? 30 : 0;
  const gst = selectedSeats.length > 0 ? 5.4 : 0;
  const totalAmount = (subtotal + convenienceFee + gst).toFixed(2);

  const movie = show?.movie;
  const theater = show?.theater;

  // Modal dismiss handler
  const handleClose = () => {
    setStage('idle');
    setProgress(0);
    setErrorMsg(null);
    onClose();
  };

  if (!isOpen) return null;

  const handlePayNow = async () => {
    setErrorMsg(null);
    setStage('processing');
    setProgress(20);

    // Stage 1: Processing Payment
    setTimeout(() => {
      setStage('verifying');
      setProgress(60);
    }, 900);

    // Stage 2: Verifying with Banking Gateway
    setTimeout(() => {
      setStage('generating');
      setProgress(90);
    }, 1800);

    // Stage 3: Confirming Ticket Reservation
    setTimeout(async () => {
      try {
        setProgress(100);
        await onPaymentSuccess(selectedMethod);
        setStage('success');
      } catch (err) {
        setStage('idle');
        setProgress(0);
        setErrorMsg(err.message || 'Payment simulation failed. Please try again.');
      }
    }, 2500);
  };

  const isProcessing = stage !== 'idle' && stage !== 'success';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0f172a] border border-cyan-500/30 p-5 sm:p-7 shadow-2xl shadow-cyan-950/50 text-gray-100 my-8 animate-scale-in">
        {/* Close Button */}
        {!isProcessing && (
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-800">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white tracking-tight">Complete Payment</h3>
            <p className="text-xs text-gray-400">Secure 256-bit Encrypted Checkout Simulation</p>
          </div>
        </div>

        {/* Multi-Stage Payment Simulation Progress View */}
        {isProcessing ? (
          <div className="py-12 px-4 flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin flex items-center justify-center" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-lg font-black text-white tracking-tight">
                {stage === 'processing' && 'Processing Payment...'}
                {stage === 'verifying' && 'Verifying with Banking Gateway...'}
                {stage === 'generating' && 'Finalizing Seats & Generating E-Ticket...'}
              </h4>
              <p className="text-xs text-gray-400 max-w-xs mx-auto">
                Please do not refresh or close this window while we verify your seat reservation.
              </p>
            </div>

            {/* Glowing Cyber Progress Bar */}
            <div className="w-full max-w-sm space-y-1.5">
              <div className="w-full h-2.5 bg-gray-950 rounded-full overflow-hidden border border-gray-800 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-700 shadow-sm shadow-cyan-400/50"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-cyan-400 font-semibold px-1">
                <span>STAGE: {stage.toUpperCase()}</span>
                <span>{progress}%</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5 pt-4">
            {/* Error Message */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <X className="w-4 h-4 flex-shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Movie & Showtime Recap Card */}
            <div className="rounded-2xl bg-gray-900/80 border border-gray-800 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-16 rounded-lg overflow-hidden bg-gray-950 border border-gray-800 flex-shrink-0">
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
                <div className="flex-1 space-y-0.5">
                  <h4 className="text-sm font-bold text-white leading-snug">{movie?.title}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    <span>{theater?.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {(() => {
                        const raw = show?.showTime || show?.startTime;
                        const d = raw ? new Date(raw) : null;
                        return d && !isNaN(d.getTime())
                          ? d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                          : show?.date || 'Today';
                      })()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      {(() => {
                        const raw = show?.showTime || show?.startTime;
                        const d = raw ? new Date(raw) : null;
                        return d && !isNaN(d.getTime())
                          ? d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
                          : show?.time || 'Scheduled';
                      })()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Selected Seats Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-800/80">
                <span className="text-[11px] text-gray-400 flex items-center gap-1 font-semibold mr-1">
                  <Ticket className="w-3 h-3 text-emerald-400" />
                  Seats:
                </span>
                {selectedSeats.map((seat) => (
                  <span
                    key={seat.id}
                    className="px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-bold font-mono"
                  >
                    {seat.id}
                  </span>
                ))}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
                Select Simulated Payment Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {PAYMENT_METHODS.map((pm) => {
                  const Icon = pm.icon;
                  const isSelected = selectedMethod === pm.id;

                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setSelectedMethod(pm.id)}
                      className={`relative flex flex-col items-center sm:items-start p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-950/50 border-cyan-400 shadow-md shadow-cyan-500/20 text-white'
                          : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:border-gray-700'
                      }`}
                    >
                      {pm.popular && (
                        <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-full bg-emerald-500 text-[9px] font-black text-gray-950 uppercase tracking-wide">
                          Fast
                        </span>
                      )}
                      <div className="flex items-center gap-2 mb-1">
                        <Icon
                          className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-gray-400'}`}
                        />
                        <span className="text-xs font-bold">{pm.id}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 leading-tight hidden sm:block">
                        {pm.description.slice(0, 24)}...
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Financial Line-Item Breakdown */}
            <div className="rounded-2xl bg-gray-900/40 border border-gray-800/80 p-3.5 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-300">
                <span>Tickets ({selectedSeats.length} seats)</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Convenience Fee (Fixed)</span>
                <span>₹{convenienceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Integrated GST (18%)</span>
                <span>₹{gst.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-gray-800 flex justify-between items-baseline font-bold">
                <span className="text-white text-sm">Total Payable</span>
                <span className="text-xl font-black text-emerald-400 tracking-tight">
                  ₹{totalAmount}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="w-1/3 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handlePayNow}
                className="w-2/3 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-gray-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/30 hover:shadow-cyan-400/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border border-cyan-300/40"
              >
                <CheckCircle2 className="w-4 h-4 text-gray-950" />
                <span>Pay ₹{totalAmount}</span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Simulated Payment Gateway • No real card details required</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
