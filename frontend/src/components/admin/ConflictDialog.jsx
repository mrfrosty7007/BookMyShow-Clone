import PropTypes from 'prop-types';
import { AlertTriangle, Clock, Film, ArrowRight, X } from 'lucide-react';

/**
 * ConflictDialog Component
 * Displays prominent cyber-themed warning when an auditorium scheduling conflict is detected,
 * and offers a 1-click "Use Suggested Next Slot" auto-adjustment.
 */
export const ConflictDialog = ({ isOpen, onClose, conflictData, onUseSuggested }) => {
  if (!isOpen || !conflictData) return null;

  const {
    message = 'Screen already occupied during requested time range.',
    conflict,
    suggestedTimeString,
    suggestedNextAvailableTime,
  } = conflictData;

  const handleUseSuggested = () => {
    if (suggestedNextAvailableTime && onUseSuggested) {
      onUseSuggested(suggestedNextAvailableTime);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-rose-500/40 bg-slate-900 p-6 shadow-2xl shadow-rose-500/20">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Warning Icon & Heading */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide">⚠ Screen Conflict</h3>
            <p className="text-xs text-rose-400/90 font-medium">Overlapping Schedule Detected</p>
          </div>
        </div>

        {/* Conflict Details Card */}
        <div className="rounded-xl border border-rose-500/20 bg-rose-950/10 p-4 mb-4 space-y-2">
          <p className="text-sm text-slate-200 font-medium leading-relaxed">{message}</p>

          {conflict && (
            <div className="mt-3 pt-3 border-t border-rose-500/10 flex flex-col gap-1.5 text-xs text-slate-400">
              {conflict.movieTitle && (
                <div className="flex items-center gap-2 text-slate-300">
                  <Film className="h-3.5 w-3.5 text-rose-400" />
                  <span className="font-semibold">{conflict.movieTitle}</span>
                </div>
              )}
              {conflict.screenName && (
                <div className="text-slate-400">
                  Auditorium: <span className="text-white font-medium">{conflict.screenName}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Next Suggested Slot Card */}
        {suggestedTimeString && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 mb-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-400" />
                <span className="text-xs text-emerald-300 font-semibold uppercase tracking-wider">
                  Suggested Next Available Slot
                </span>
              </div>
              <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full">
                Ready
              </span>
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-white flex items-center gap-2">
              <span>{suggestedTimeString}</span>
              <span className="text-xs text-slate-400 font-normal">
                (after movie runtime & cleaning buffer)
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Adjust Manually
          </button>

          {suggestedTimeString && (
            <button
              type="button"
              onClick={handleUseSuggested}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:from-emerald-400 hover:to-teal-400 transition-all font-bold"
            >
              <span>Use Suggested Slot</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

ConflictDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  conflictData: PropTypes.object,
  onUseSuggested: PropTypes.func,
};

export default ConflictDialog;
