import { MapPin, Monitor, Armchair } from 'lucide-react';

/**
 * Format ISO datetime into readable show time (e.g. 10:00 AM)
 */
const formatShowTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Format date into short format (e.g. Mon, Nov 20)
 */
const formatShowDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Show Card Component for Movie Details Page
 */
export const ShowCard = ({ show }) => {
  if (!show) return null;

  const { theater, screen, showTime, price } = show;
  const theaterName = theater?.name || 'Cinema Hall';
  const theaterCity = theater?.city || '';
  const facilities = theater?.facilities || [];

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 rounded-2xl bg-gray-900/70 border border-gray-800 hover:border-gray-700/80 transition-all duration-200 gap-4 shadow-sm">
      {/* Theater & Screen Info */}
      <div className="space-y-1.5 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="text-base font-bold text-white tracking-tight">{theaterName}</h4>
          {theaterCity && (
            <span className="flex items-center gap-1 text-xs text-gray-400 bg-gray-800/60 px-2 py-0.5 rounded-md border border-gray-700/50">
              <MapPin className="w-3 h-3 text-[#f84464]" />
              {theaterCity}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Monitor className="w-3.5 h-3.5 text-gray-400" />
            Screen {screen}
          </span>

          {facilities.length > 0 && (
            <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] text-gray-400">
              • {facilities.slice(0, 3).join(', ')}
            </span>
          )}
        </div>
      </div>

      {/* Show Time, Pricing & Action */}
      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 sm:gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-800/80">
        <div className="text-left sm:text-right">
          <div className="text-lg font-black text-white tracking-tight">
            {formatShowTime(showTime)}
          </div>
          <div className="text-xs text-gray-400">{formatShowDate(showTime)}</div>
        </div>

        <div className="text-right">
          <div className="text-base font-black text-emerald-400">₹{price}</div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wider">Base Price</div>
        </div>

        {/* Action Button: Disabled styling for Phase 2, interactive in Phase 3 */}
        <div className="relative group">
          <button
            type="button"
            disabled
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gray-800/80 text-gray-400 border border-gray-700/50 text-xs font-bold cursor-not-allowed transition-all opacity-85"
            title="Interactive seat selection unlocks in Phase 3"
          >
            <Armchair className="w-3.5 h-3.5" />
            <span>Select Seats</span>
          </button>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 hidden group-hover:block whitespace-nowrap text-[10px] font-semibold text-[#f84464] bg-black/90 px-2 py-0.5 rounded border border-gray-800">
            Booking opens in Phase 3
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowCard;
