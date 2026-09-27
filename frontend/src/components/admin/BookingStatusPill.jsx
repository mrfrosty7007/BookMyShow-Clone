import PropTypes from 'prop-types';
import { CheckCircle2, Clock, RotateCcw, XCircle, AlertTriangle, QrCode } from 'lucide-react';

const STATUS_CONFIGS = {
  Confirmed: {
    label: 'Confirmed',
    color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    dot: 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]',
    icon: CheckCircle2,
  },
  'Checked-In': {
    label: 'Checked In',
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]',
    icon: QrCode,
  },
  Refunded: {
    label: 'Refunded',
    color: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    dot: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]',
    icon: RotateCcw,
  },
  Cancelled: {
    label: 'Cancelled',
    color: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    dot: 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]',
    icon: XCircle,
  },
  Pending: {
    label: 'Pending',
    color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    dot: 'bg-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.8)] animate-pulse',
    icon: Clock,
  },
  Expired: {
    label: 'Expired',
    color: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
    dot: 'bg-gray-400',
    icon: AlertTriangle,
  },
};

/**
 * BookingStatusPill Component
 * Renders glowing cyberpunk badges for booking lifecycle statuses
 */
export const BookingStatusPill = ({ status, size = 'sm' }) => {
  const config = STATUS_CONFIGS[status] || STATUS_CONFIGS['Confirmed'];
  const Icon = config.icon;

  const sizeClasses =
    size === 'lg'
      ? 'px-3 py-1.5 text-xs gap-2'
      : size === 'md'
        ? 'px-2.5 py-1 text-xs gap-1.5'
        : 'px-2 py-0.5 text-[11px] gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border backdrop-blur-sm transition-all ${config.color} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <Icon className={size === 'lg' ? 'w-3.5 h-3.5' : 'w-3 h-3'} />
      <span>{config.label}</span>
    </span>
  );
};

BookingStatusPill.propTypes = {
  status: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

export default BookingStatusPill;
