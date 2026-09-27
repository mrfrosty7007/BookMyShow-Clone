import PropTypes from 'prop-types';
import { Users, UserCheck, Clock, TrendingUp, Activity } from 'lucide-react';

/**
 * AttendanceCard Component
 * Displays live auditorium entry metrics, check-in velocity, and occupancy progress
 */
export const AttendanceCard = ({
  title = 'Live Attendance',
  checkedIn = 0,
  totalBookings = 0,
  occupancy = 0,
  entryRate = '8 entries / 15m',
  showTitle = null,
  screenName = null,
}) => {
  const remaining = Math.max(0, totalBookings - checkedIn);
  const percentage =
    totalBookings > 0
      ? Math.min(100, Math.round((checkedIn / totalBookings) * 100))
      : occupancy || 0;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#0b1120]/80 border border-gray-800/80 p-5 backdrop-blur-xl shadow-xl shadow-black/40 group hover:border-cyan-500/40 transition-all duration-300">
      {/* Background cyber glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-full blur-2xl pointer-events-none group-hover:from-cyan-500/20 transition-all" />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-200 tracking-wide">{title}</h3>
            {(showTitle || screenName) && (
              <p className="text-xs text-gray-400 truncate max-w-[200px]">
                {showTitle} {screenName ? `• ${screenName}` : ''}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-medium text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-ping" />
          <span>Active Gate</span>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {/* Checked In */}
        <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800/60">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Checked In</span>
          </div>
          <p className="text-xl font-bold text-gray-100 font-mono">{checkedIn}</p>
        </div>

        {/* Remaining */}
        <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800/60">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Remaining</span>
          </div>
          <p className="text-xl font-bold text-gray-100 font-mono">{remaining}</p>
        </div>

        {/* Occupancy */}
        <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800/60">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>Occupancy</span>
          </div>
          <p className="text-xl font-bold text-cyan-400 font-mono">{percentage}%</p>
        </div>

        {/* Entry Rate */}
        <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800/60">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
            <span>Entry Rate</span>
          </div>
          <p className="text-xs font-semibold text-gray-200 mt-1 truncate">{entryRate}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between items-center text-xs text-gray-400 mb-1.5">
          <span>Capacity Check-in Progress</span>
          <span className="font-mono text-gray-300">
            {checkedIn} / {totalBookings > 0 ? totalBookings : checkedIn + remaining} tickets
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-gray-800/80 overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(6,182,212,0.6)]"
            style={{ width: `${Math.max(4, Math.min(100, percentage))}%` }}
          />
        </div>
      </div>
    </div>
  );
};

AttendanceCard.propTypes = {
  title: PropTypes.string,
  checkedIn: PropTypes.number,
  totalBookings: PropTypes.number,
  occupancy: PropTypes.number,
  entryRate: PropTypes.string,
  showTitle: PropTypes.string,
  screenName: PropTypes.string,
};

export default AttendanceCard;
