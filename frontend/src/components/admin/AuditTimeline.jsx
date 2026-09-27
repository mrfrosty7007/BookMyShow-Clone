import PropTypes from 'prop-types';
import {
  Clock,
  CheckCircle,
  CreditCard,
  QrCode,
  RotateCcw,
  ShieldAlert,
  UserCheck,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

const ACTION_ICONS = {
  BOOKING_CREATED: { icon: Clock, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  PAYMENT_COMPLETED: {
    icon: CreditCard,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  },
  TICKET_VALIDATED: {
    icon: QrCode,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  },
  MANUAL_CHECKIN: {
    icon: UserCheck,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  },
  DUPLICATE_SCAN_REJECTED: {
    icon: ShieldAlert,
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  },
  ENTRY_DENIED: { icon: AlertCircle, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  REFUND_PROCESSED: {
    icon: RotateCcw,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  },
  SEATS_RESTORED: {
    icon: CheckCircle,
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  },
  SEAT_LOCKS_RECOVERED: {
    icon: RotateCcw,
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  },
};

const formatActionTitle = (action) => {
  if (!action) return 'System Event';
  return action
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * AuditTimeline Component
 * Renders chronological booking audit events and staff scan operations
 */
export const AuditTimeline = ({ events = [] }) => {
  if (!events || events.length === 0) {
    return (
      <div className="py-6 text-center text-gray-500 text-sm">
        No audit events recorded for this ticket yet.
      </div>
    );
  }

  // Sort events chronologically (oldest to newest)
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.timestamp || a.scannedAt || 0) - new Date(b.timestamp || b.scannedAt || 0)
  );

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500/40 before:via-gray-800 before:to-gray-800/20">
      {sortedEvents.map((evt, idx) => {
        const actionKey =
          evt.action || (evt.result === 'Valid' ? 'TICKET_VALIDATED' : 'ENTRY_DENIED');
        const config = ACTION_ICONS[actionKey] || {
          icon: Clock,
          color: 'text-gray-400 bg-gray-800 border-gray-700',
        };
        const Icon = config.icon;
        const eventDate = new Date(evt.timestamp || evt.scannedAt || 0);

        const formattedTime = eventDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        });

        const formattedDate = eventDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });

        const actorName =
          typeof evt.actor === 'string' ? evt.actor : evt.actor?.name || evt.scannedBy || 'System';

        return (
          <div key={idx} className="relative group">
            {/* Timeline Node Point */}
            <div
              className={`absolute -left-6 top-1 w-5 h-5 rounded-full border flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${config.color}`}
            >
              <Icon className="w-2.5 h-2.5" />
            </div>

            {/* Event Body */}
            <div className="bg-gray-900/40 border border-gray-800/80 rounded-xl p-3.5 hover:border-gray-700/80 transition-all">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-semibold text-gray-200 tracking-wide">
                  {formatActionTitle(actionKey)}
                </span>
                <span className="text-[11px] font-mono text-cyan-400/90 bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-800/30">
                  {formattedTime} • {formattedDate}
                </span>
              </div>

              {/* Actor & Details */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                <span>By:</span>
                <span className="font-medium text-gray-300 bg-gray-800/60 px-1.5 py-0.5 rounded text-[11px]">
                  {actorName}
                </span>

                {(evt.details?.gate || evt.gate || evt.metadata?.gate) && (
                  <>
                    <span className="text-gray-600">•</span>
                    <span className="text-cyan-400 text-[11px]">
                      {evt.details?.gate || evt.gate || evt.metadata?.gate}
                    </span>
                  </>
                )}

                {(evt.details?.device || evt.device || evt.metadata?.device) && (
                  <>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-400 text-[11px]">
                      {evt.details?.device || evt.device || evt.metadata?.device}
                    </span>
                  </>
                )}
              </div>

              {/* Specific metadata / reason */}
              {(evt.details?.reason || evt.message || evt.metadata?.reason) && (
                <div className="mt-2 text-xs text-gray-300 bg-black/30 p-2 rounded border border-gray-800/50 flex items-start gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-500 shrink-0 mt-0.5" />
                  <span className="italic">
                    {evt.details?.reason || evt.message || evt.metadata?.reason}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

AuditTimeline.propTypes = {
  events: PropTypes.array,
};

export default AuditTimeline;
