import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  X,
  RotateCcw,
  AlertTriangle,
  Sliders,
  CheckCircle,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import { refundBooking } from '../../services/api.js';

/**
 * RefundDialog Component
 * Operational modal for issuing time-tiered cinema refunds and restoring seat inventory
 */
export const RefundDialog = ({ isOpen, onClose, booking, onRefundSuccess }) => {
  const [isOverride, setIsOverride] = useState(false);
  const [overridePercent, setOverridePercent] = useState(100);
  const [reason, setReason] = useState('Customer requested ticket cancellation');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [dialogOpenTime] = useState(() => Date.now());

  // Compute time difference and standard policy tier
  const policyCalculation = useMemo(() => {
    if (!booking) return { policyPercent: 0, hoursUntilShow: 0 };

    const showTimeStr = booking.show?.startTime || booking.show?.showTime;
    if (!showTimeStr) return { policyPercent: 75, hoursUntilShow: 12 };

    const showTime = new Date(showTimeStr).getTime();
    const diffHours = (showTime - dialogOpenTime) / (1000 * 60 * 60);

    let policyPercent = 0;
    if (diffHours >= 24) policyPercent = 100;
    else if (diffHours >= 6) policyPercent = 75;
    else if (diffHours >= 1) policyPercent = 50;
    else policyPercent = 0;

    return {
      policyPercent,
      hoursUntilShow: Math.max(0, Number(diffHours.toFixed(1))),
    };
  }, [booking, dialogOpenTime]);

  if (!isOpen || !booking) return null;

  const totalAmount = Number(booking.totalAmount || 0);
  const activePercentage = isOverride ? overridePercent : policyCalculation.policyPercent;
  const calculatedRefund = Math.round((totalAmount * activePercentage) / 100);
  const calculatedDeduction = totalAmount - calculatedRefund;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        reason: reason.trim(),
        overridePercent: isOverride ? overridePercent : undefined,
      };

      const result = await refundBooking(booking._id || booking.bookingId, payload);
      if (onRefundSuccess) {
        onRefundSuccess(result);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to process refund.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0b1120] border border-gray-800 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden">
        {/* Glow Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800/80 bg-gray-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-100">Issue Booking Refund</h3>
              <p className="text-xs text-gray-400 font-mono">ID: {booking.bookingId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Refund Matrix Display */}
          <div className="rounded-xl bg-gray-900/60 border border-gray-800 p-4 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">Movie & Screen:</span>
              <span className="font-semibold text-gray-200">
                {booking.movie?.title || 'Cinema Ticket'} • {booking.theater?.name || 'Multiplex'}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">Show Timing:</span>
              <span className="text-gray-300">
                {policyCalculation.hoursUntilShow > 0
                  ? `${policyCalculation.hoursUntilShow}h until showtime`
                  : 'Show starting soon / in progress'}
              </span>
            </div>

            <div className="h-px bg-gray-800/80 my-2" />

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-black/40 border border-gray-800/60">
                <span className="block text-[11px] text-gray-400">Ticket Amount</span>
                <span className="text-sm font-bold text-gray-100 font-mono">₹{totalAmount}</span>
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-gray-800/60">
                <span className="block text-[11px] text-gray-400">Policy Tier</span>
                <span className="text-sm font-bold text-cyan-400 font-mono">
                  {activePercentage}%
                </span>
              </div>
              <div className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/30">
                <span className="block text-[11px] text-emerald-400">Refund Amount</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  ₹{calculatedRefund}
                </span>
              </div>
            </div>

            {calculatedDeduction > 0 && (
              <p className="text-[11px] text-amber-400/90 text-center">
                Cancellation deduction: ₹{calculatedDeduction} retained per cinema policy.
              </p>
            )}
          </div>

          {/* Seat Restoration Notice */}
          <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-xs text-gray-300 flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-cyan-300">Automatic Seat Restoration</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Processing this refund will automatically release seats{' '}
                <strong className="text-cyan-400">
                  {booking.seats?.map((s) => (typeof s === 'string' ? s : s.seatNumber)).join(', ')}
                </strong>{' '}
                back to available inventory for customer booking.
              </p>
            </div>
          </div>

          {/* Admin Override Toggle */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <label
                htmlFor="overrideToggle"
                className="flex items-center gap-2 text-xs font-semibold text-gray-300 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Admin Policy Override</span>
              </label>
              <input
                id="overrideToggle"
                type="checkbox"
                checked={isOverride}
                onChange={(e) => setIsOverride(e.target.checked)}
                className="w-4 h-4 rounded bg-gray-900 border-gray-700 text-cyan-500 focus:ring-cyan-500/30 cursor-pointer"
              />
            </div>

            {isOverride && (
              <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-2.5 animate-in slide-in-from-top-2 duration-150">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-300">Custom Refund Percentage:</span>
                  <span className="font-mono font-bold text-cyan-400">{overridePercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={overridePercent}
                  onChange={(e) => setOverridePercent(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-[10px] text-gray-500">
                  <span>0% (No refund)</span>
                  <span>50%</span>
                  <span>100% (Full override)</span>
                </div>
              </div>
            )}
          </div>

          {/* Reason Input */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
              <span>Reason / Audit Note:</span>
              <HelpCircle className="w-3.5 h-3.5 text-gray-500" />
            </label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Customer cancelled via support, medical emergency"
              className="w-full px-3.5 py-2.5 bg-gray-900/80 border border-gray-800 rounded-xl text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800/80">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-black font-semibold text-xs transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Confirm Refund (₹{calculatedRefund})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

RefundDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  booking: PropTypes.object,
  onRefundSuccess: PropTypes.func,
};

export default RefundDialog;
