import { useState } from 'react';
import PropTypes from 'prop-types';
import { Grid, Flame, Moon, Sparkles } from 'lucide-react';

const TIME_SLOTS = [
  { key: 'Morning', label: 'Morning', time: '08:00 - 12:00' },
  { key: 'Matinee', label: 'Matinee', time: '12:00 - 16:00' },
  { key: 'Evening', label: 'Evening', time: '16:00 - 20:00' },
  { key: 'Night', label: 'Night', time: '20:00 - 02:00' },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const OccupancyHeatmap = ({
  matrix = [],
  peakSlot = null,
  quietestSlot = null,
  overall: _overall = {},
  loading = false,
}) => {
  const [selectedCell, setSelectedCell] = useState(null);

  // Fast cell lookup map: "Monday_Evening" -> cellData
  const cellMap = new Map();
  matrix.forEach((c) => {
    cellMap.set(`${c.day}_${c.slot}`, c);
  });

  const getCellColorClass = (cell) => {
    if (!cell || cell.showCount === 0) {
      return 'bg-gray-900/40 border-gray-800 text-gray-600 hover:border-gray-700';
    }
    const occ = cell.occupancyPercent;
    if (occ >= 85) {
      return 'bg-rose-600/30 border-rose-500/60 text-rose-300 shadow-sm shadow-rose-600/20 hover:bg-rose-600/40 hover:scale-105';
    }
    if (occ >= 65) {
      return 'bg-orange-500/25 border-orange-500/50 text-orange-300 hover:bg-orange-500/35 hover:scale-105';
    }
    if (occ >= 40) {
      return 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30 hover:scale-105';
    }
    return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 hover:scale-105';
  };

  return (
    <div className="rounded-2xl bg-[#0d1527]/90 backdrop-blur-md border border-gray-800 p-5 shadow-xl flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Grid className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white tracking-wide">
              Occupancy Heatmap Matrix
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
              7D × 4 Diurnal Slots
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Seat utilization density mapped across days of week and diurnal showtime windows
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-gray-400 bg-gray-950/60 px-3 py-1.5 rounded-xl border border-gray-800">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/40 border border-emerald-500/70" />
            &lt;40%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/40 border border-amber-500/70" />
            40-64%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-orange-500/40 border border-orange-500/70" />
            65-84%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500/60 border border-rose-500/90" />
            85%+
          </span>
        </div>
      </div>

      {/* Heatmap Grid */}
      {loading ? (
        <div className="h-64 flex items-center justify-center bg-gray-950/40 rounded-xl animate-pulse text-xs text-gray-500">
          Compiling capacity heatmap...
        </div>
      ) : (
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[580px]">
            {/* Column Headers: Time Slots */}
            <div className="grid grid-cols-5 gap-2 mb-2">
              <div className="text-xs font-mono font-medium text-gray-500 p-2 text-right">
                Day / Slot
              </div>
              {TIME_SLOTS.map((slot) => (
                <div
                  key={slot.key}
                  className="rounded-lg bg-gray-900/60 border border-gray-800 p-2 text-center"
                >
                  <div className="text-xs font-semibold text-gray-200">{slot.label}</div>
                  <div className="text-[10px] font-mono text-gray-500">{slot.time}</div>
                </div>
              ))}
            </div>

            {/* Matrix Rows (Days) */}
            <div className="space-y-2">
              {DAYS.map((day) => (
                <div key={day} className="grid grid-cols-5 gap-2 items-center">
                  {/* Day Label */}
                  <div className="text-xs font-medium text-gray-300 text-right pr-2 font-mono">
                    {day}
                  </div>

                  {/* 4 Diurnal Slots */}
                  {TIME_SLOTS.map((slot) => {
                    const cellKey = `${day}_${slot.key}`;
                    const cell = cellMap.get(cellKey) || {
                      day,
                      slot: slot.key,
                      occupancyPercent: 0,
                      totalCapacity: 0,
                      bookedSeats: 0,
                      showCount: 0,
                    };
                    const isSelected = selectedCell?.day === day && selectedCell?.slot === slot.key;

                    return (
                      <button
                        key={slot.key}
                        type="button"
                        onClick={() => setSelectedCell(cell)}
                        className={`h-12 rounded-xl border p-2 flex flex-col items-center justify-center transition-all duration-200 relative ${getCellColorClass(
                          cell
                        )} ${isSelected ? 'ring-2 ring-cyan-400 scale-105' : ''}`}
                        title={`${day} ${slot.label}: ${cell.occupancyPercent}% (${cell.bookedSeats}/${cell.totalCapacity} seats, ${cell.showCount} shows)`}
                      >
                        <span className="text-xs font-mono font-bold">
                          {cell.showCount > 0 ? `${cell.occupancyPercent}%` : '—'}
                        </span>
                        <span className="text-[9px] font-mono opacity-80">
                          {cell.showCount > 0 ? `${cell.bookedSeats} seats` : '0 shows'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Selected Cell Detail or Peak / Quietest Banner */}
      <div className="mt-4 pt-3 border-t border-gray-800/80">
        {selectedCell ? (
          <div className="rounded-xl bg-cyan-950/30 border border-cyan-500/30 p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-white">
                {selectedCell.day} • {selectedCell.slot} Window
              </span>
            </div>
            <div className="flex items-center gap-4 font-mono text-gray-300">
              <span>
                Occupancy: <strong className="text-cyan-300">{selectedCell.occupancyPercent}%</strong>
              </span>
              <span>
                Booked: <strong className="text-white">{selectedCell.bookedSeats}</strong> / {selectedCell.totalCapacity}
              </span>
              <span>
                Scheduled Shows: <strong className="text-purple-300">{selectedCell.showCount}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedCell(null)}
              className="text-[11px] text-gray-400 hover:text-white underline"
            >
              Reset inspection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl bg-gray-900/60 border border-rose-500/30 p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-rose-500/20 text-rose-400">
                  <Flame className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-mono block">
                    Peak Congestion Window
                  </span>
                  <span className="font-semibold text-white">
                    {peakSlot ? `${peakSlot.day} ${peakSlot.slot}` : 'N/A'}
                  </span>
                </div>
              </div>
              <span className="font-mono font-bold text-rose-400 text-sm">
                {peakSlot ? `${peakSlot.occupancyPercent}%` : '0%'}
              </span>
            </div>

            <div className="rounded-xl bg-gray-900/60 border border-emerald-500/30 p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-400">
                  <Moon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-mono block">
                    Quietest / Promotion Window
                  </span>
                  <span className="font-semibold text-white">
                    {quietestSlot ? `${quietestSlot.day} ${quietestSlot.slot}` : 'N/A'}
                  </span>
                </div>
              </div>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                {quietestSlot ? `${quietestSlot.occupancyPercent}%` : '0%'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

OccupancyHeatmap.propTypes = {
  matrix: PropTypes.arrayOf(
    PropTypes.shape({
      day: PropTypes.string.isRequired,
      slot: PropTypes.string.isRequired,
      occupancyPercent: PropTypes.number.isRequired,
      totalCapacity: PropTypes.number,
      bookedSeats: PropTypes.number,
      showCount: PropTypes.number,
    })
  ),
  peakSlot: PropTypes.shape({
    day: PropTypes.string,
    slot: PropTypes.string,
    occupancyPercent: PropTypes.number,
  }),
  quietestSlot: PropTypes.shape({
    day: PropTypes.string,
    slot: PropTypes.string,
    occupancyPercent: PropTypes.number,
  }),
  overall: PropTypes.object,
  loading: PropTypes.bool,
};

export default OccupancyHeatmap;
