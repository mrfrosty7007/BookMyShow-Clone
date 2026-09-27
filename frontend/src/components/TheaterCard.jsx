import { MapPin, Clock, Calendar, Monitor, Sparkles } from 'lucide-react';

/**
 * Format datetime into readable string
 */
const formatShowDateTime = (dateStr, fallbackTime, fallbackDate) => {
  if (fallbackTime && fallbackDate) {
    return { time: fallbackTime, date: fallbackDate };
  }
  if (!dateStr) return { time: 'N/A', date: 'N/A' };

  const d = new Date(dateStr);
  const time = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const date = d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return { time, date };
};

/**
 * TheaterCard Component
 * Displays venue info, schedule, screen, and pricing
 */
export const TheaterCard = ({ theater, showTime, time, date, price, screen }) => {
  if (!theater) return null;

  const theaterName = theater?.name || 'Cinema Hall';
  const city = theater?.city || '';
  const address = theater?.address || '';
  const facilities = theater?.facilities || [];
  const { time: displayTime, date: displayDate } = formatShowDateTime(showTime, time, date);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gray-900/90 border border-gray-800/90 hover:border-gray-700/80 transition-all duration-300 p-5 sm:p-6 shadow-xl shadow-black/40">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute top-0 right-0 w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        {/* Left: Theater Details */}
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
              <MapPin className="w-4 h-4" />
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {theaterName}
            </h3>

            {city && (
              <span className="px-2.5 py-0.5 rounded-md bg-gray-800/80 border border-gray-700 text-xs font-semibold text-gray-300">
                {city}
              </span>
            )}
          </div>

          {address && (
            <p className="text-xs text-gray-400 pl-10 max-w-xl line-clamp-1 leading-relaxed">
              {address}
            </p>
          )}

          {/* Screen & Facilities Tags */}
          <div className="flex flex-wrap items-center gap-2 pl-10 pt-1 text-xs">
            {screen && (
              <span className="flex items-center gap-1 text-cyan-400 bg-cyan-950/40 border border-cyan-800/50 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                <Monitor className="w-3 h-3" /> Screen {screen}
              </span>
            )}

            {facilities.map((facility) => (
              <span
                key={facility}
                className="px-2 py-0.5 rounded-md bg-gray-800/60 border border-gray-700/50 text-gray-400 text-[11px]"
              >
                {facility}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Showtime & Price */}
        <div className="flex flex-wrap md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-gray-800/80">
          <div className="flex items-center gap-2 text-left md:text-right">
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 md:hidden">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center md:justify-end gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400 hidden md:inline" />
                {displayTime}
              </div>
              <div className="text-xs text-gray-400 flex items-center md:justify-end gap-1">
                <Calendar className="w-3 h-3 text-gray-400" />
                {displayDate}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-black text-emerald-400 tracking-tight">₹{price}</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider flex items-center justify-end gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              Ticket Price
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TheaterCard;
