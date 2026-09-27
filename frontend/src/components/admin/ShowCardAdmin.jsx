import PropTypes from 'prop-types';
import { Clock, Film, Building2, MonitorPlay, TrendingUp, Edit2, Ban, Trash2 } from 'lucide-react';

const STATUS_CONFIG = {
  scheduled: {
    label: 'Scheduled',
    color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    dot: 'bg-cyan-400',
  },
  live: {
    label: 'Live Now',
    color:
      'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-emerald-500/20 shadow-sm',
    dot: 'bg-emerald-400 animate-pulse',
  },
  completed: {
    label: 'Completed',
    color: 'bg-slate-800 text-slate-400 border-slate-700',
    dot: 'bg-slate-500',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-rose-500/10 text-rose-400 border-rose-500/30 line-through',
    dot: 'bg-rose-500',
  },
};

/**
 * Format Date into 12-hour AM/PM time
 */
const formatTime = (dateVal) => {
  if (!dateVal) return '--:--';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '--:--';
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Format Date into short date e.g. "Sep 29, 2026"
 */
const formatDate = (dateVal) => {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * ShowCardAdmin Component
 * Operations card for cinema administration displaying live occupancy, timings, and actions
 */
export const ShowCardAdmin = ({ show, onEdit, onCancel, onDelete }) => {
  if (!show) return null;

  const movie = show.movie || {};
  const theater = show.theater || {};
  const statusInfo = STATUS_CONFIG[show.status] || STATUS_CONFIG.scheduled;

  // Occupancy stats
  const totalSeats = show.occupancy?.totalSeats ?? (show.seats?.length || 0);
  const bookedSeats =
    show.occupancy?.bookedSeats ?? (show.seats?.filter((s) => s.status === 'booked').length || 0);
  const occupancyPercentage =
    show.occupancy?.percentage ??
    (totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0);

  // Revenue stats
  const revenueTotal =
    show.revenue?.total ??
    (show.seats
      ?.filter((s) => s.status === 'booked')
      .reduce((sum, s) => sum + (s.price || show.price || 200), 0) ||
      0);

  const screenName = show.screenName || `Screen ${show.screen || 1}`;
  const screenType = show.screenType || 'Standard';

  return (
    <div className="group relative rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl transition-all duration-300 hover:border-cyan-500/40 hover:shadow-cyan-500/10 flex flex-col justify-between">
      {/* Top Details Header */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Movie Poster Thumbnail */}
            <div className="h-16 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-slate-700/60 bg-slate-800">
              {movie.poster ? (
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-500">
                  <Film className="h-5 w-5" />
                </div>
              )}
            </div>

            <div>
              <h4 className="font-bold text-base text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                {movie.title || 'Untitled Movie'}
              </h4>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" />
                  {theater.name || 'Multiplex'}
                </span>
                {theater.city && <span className="text-slate-500">• {theater.city}</span>}
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusInfo.color}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot}`} />
            {statusInfo.label}
          </span>
        </div>

        {/* Screen & Timing Ribbon */}
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-800/40 p-3 border border-slate-700/30">
          <div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <MonitorPlay className="h-3 w-3 text-cyan-400" /> Auditorium
            </div>
            <div className="text-sm font-semibold text-white mt-0.5 flex items-center gap-1.5">
              <span>{screenName}</span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded font-mono">
                {screenType}
              </span>
            </div>
          </div>

          <div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <Clock className="h-3 w-3 text-purple-400" /> Show Time
            </div>
            <div className="text-sm font-semibold text-white mt-0.5 font-mono">
              {formatTime(show.startTime || show.showTime)} – {formatTime(show.endTime)}
            </div>
          </div>
        </div>

        {/* Buffer Breakdown Chip */}
        <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between px-1">
          <span>{formatDate(show.startTime || show.showTime)}</span>
          <span className="text-slate-400">
            Movie: {show.movieDuration || 120}m + Buffers:{' '}
            {(show.trailerBuffer || 15) + (show.cleaningBuffer || 20)}m
          </span>
        </div>

        {/* Occupancy Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-400" /> Occupancy
            </span>
            <span className="font-mono text-slate-300 font-semibold">
              {bookedSeats} / {totalSeats} ({occupancyPercentage}%)
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                occupancyPercentage >= 80
                  ? 'bg-rose-500'
                  : occupancyPercentage >= 50
                    ? 'bg-amber-400'
                    : 'bg-cyan-500'
              }`}
              style={{ width: `${occupancyPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card Footer: Financials and Actions */}
      <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
        <div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Revenue</div>
          <div className="text-base font-bold font-mono text-emerald-400 flex items-center gap-1">
            <span>₹{revenueTotal.toLocaleString()}</span>
            <span className="text-[11px] text-slate-400 font-normal">(₹{show.price} Base)</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onEdit && (
            <button
              onClick={() => onEdit(show)}
              title="Edit Show"
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-cyan-400 transition-colors"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          )}

          {show.status !== 'cancelled' && onCancel && (
            <button
              onClick={() => onCancel(show)}
              title="Cancel Show"
              className="rounded-lg p-2 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
            >
              <Ban className="h-4 w-4" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(show)}
              title="Delete Show"
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

ShowCardAdmin.propTypes = {
  show: PropTypes.object.isRequired,
  onEdit: PropTypes.func,
  onCancel: PropTypes.func,
  onDelete: PropTypes.func,
};

export default ShowCardAdmin;
