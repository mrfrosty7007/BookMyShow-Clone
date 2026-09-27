import { useState } from 'react';
import {
  Film,
  Plus,
  Copy,
  Trash2,
  Sliders,
  Armchair,
  Layers,
  Sparkles,
  Crown,
  Accessibility,
  Loader2,
} from 'lucide-react';

/**
 * ScreenManager Component
 * Multiplex Screen listing with direct access to Visual Seat Layout Builder,
 * 1-click screen duplication, and deletion.
 */
export const ScreenManager = ({
  theater,
  onEditScreen,
  onAddScreen,
  onDuplicateScreen,
  onDeleteScreen,
  actionLoading = false,
}) => {
  const [deletingScreenId, setDeletingScreenId] = useState(null);
  const [duplicatingScreenId, setDuplicatingScreenId] = useState(null);

  if (!theater) return null;

  const screens = Array.isArray(theater.screens) ? theater.screens : [];

  const handleDuplicate = async (screen) => {
    setDuplicatingScreenId(screen._id);
    try {
      await onDuplicateScreen(theater._id, screen._id);
    } finally {
      setDuplicatingScreenId(null);
    }
  };

  const handleDelete = async (screen) => {
    if (
      !window.confirm(
        `Delete screen "${screen.name}" from ${theater.name}? This will remove its seat layout.`
      )
    ) {
      return;
    }
    setDeletingScreenId(screen._id);
    try {
      await onDeleteScreen(theater._id, screen._id);
    } finally {
      setDeletingScreenId(null);
    }
  };

  return (
    <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-gray-950/70 border border-gray-800/80 mt-3 animate-fade-in">
      {/* Screens Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white tracking-tight">
              Auditorium Screens ({screens.length})
            </h4>
            <p className="text-[11px] text-gray-400">
              Manage multi-screen auditoriums, independent visual seat layouts, and capacities
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onAddScreen(theater)}
          disabled={actionLoading}
          className="px-3.5 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/40 hover:bg-cyan-500/25 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto shadow-sm shadow-cyan-950/40"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Screen</span>
        </button>
      </div>

      {/* Screen Cards Grid */}
      {screens.length === 0 ? (
        <div className="py-8 text-center rounded-xl bg-gray-900/40 border border-dashed border-gray-800 space-y-2">
          <Armchair className="w-8 h-8 text-gray-600 mx-auto" />
          <p className="text-xs text-gray-400 font-medium">
            No screens configured for this multiplex yet.
          </p>
          <button
            type="button"
            onClick={() => onAddScreen(theater)}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 cursor-pointer"
          >
            + Create First Screen
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {screens.map((screen) => {
            const rowCount = screen.seatLayout?.rows?.length || 0;
            const capacity = screen.capacity || 0;

            // Breakdown counts
            let standardCount = 0;
            let premiumCount = 0;
            let vipCount = 0;
            let accessibleCount = 0;

            if (screen.seatLayout?.seats?.length) {
              screen.seatLayout.seats.forEach((s) => {
                if (s.tier === 'VIP') vipCount++;
                else if (s.tier === 'Premium') premiumCount++;
                else if (s.tier === 'Accessible' || s.isAccessible) accessibleCount++;
                else standardCount++;
              });
            } else if (screen.seatLayout?.rows?.length) {
              screen.seatLayout.rows.forEach((r) => {
                if (r.vip) vipCount += r.seats;
                else if (r.premium) premiumCount += r.seats;
                else if (r.wheelchair) accessibleCount += r.seats;
                else standardCount += r.seats;
              });
            }

            return (
              <div
                key={screen._id}
                className="group relative rounded-2xl bg-gray-900/90 border border-gray-800 hover:border-cyan-500/40 p-4 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-950/20 flex flex-col justify-between space-y-3"
              >
                {/* Screen Header */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="text-sm font-black text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                      {screen.name}
                    </h5>
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] font-black uppercase tracking-wider flex-shrink-0">
                      {screen.type || 'Standard'}
                    </span>
                  </div>

                  {/* Quick Capacity & Rows Metrics */}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1 font-semibold text-gray-200">
                      <Armchair className="w-3.5 h-3.5 text-cyan-400" />
                      {capacity} Seats
                    </span>
                    <span className="flex items-center gap-1 text-gray-400">
                      <Layers className="w-3.5 h-3.5 text-gray-500" />
                      {rowCount} Rows
                    </span>
                  </div>

                  {/* Tier Distribution Chips */}
                  <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2.5 border-t border-gray-800/80 text-[10px]">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700">
                      ○ {standardCount}
                    </span>
                    {premiumCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-950/50 text-amber-300 border border-amber-500/30 flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5 fill-amber-300" />
                        {premiumCount}
                      </span>
                    )}
                    {vipCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-purple-950/50 text-purple-300 border border-purple-500/30 flex items-center gap-0.5">
                        <Crown className="w-2.5 h-2.5" />
                        {vipCount}
                      </span>
                    )}
                    {accessibleCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950/50 text-emerald-300 border border-emerald-500/30 flex items-center gap-0.5">
                        <Accessibility className="w-2.5 h-2.5" />
                        {accessibleCount}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-1.5 pt-3 border-t border-gray-800/80">
                  <button
                    type="button"
                    onClick={() => onEditScreen(theater, screen)}
                    disabled={actionLoading}
                    className="flex-1 px-2.5 py-1.5 rounded-xl bg-gray-800/80 hover:bg-cyan-500/20 hover:border-cyan-500/40 border border-gray-700 text-xs font-semibold text-gray-200 hover:text-cyan-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    title="Open Visual Seat Layout Builder"
                  >
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Edit Layout</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDuplicate(screen)}
                    disabled={actionLoading || duplicatingScreenId === screen._id}
                    className="p-1.5 rounded-xl bg-gray-800/80 hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-white transition-all cursor-pointer"
                    title="1-Click Duplicate Screen Layout"
                  >
                    {duplicatingScreenId === screen._id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(screen)}
                    disabled={actionLoading || deletingScreenId === screen._id}
                    className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:text-rose-200 transition-all cursor-pointer"
                    title="Delete Screen"
                  >
                    {deletingScreenId === screen._id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ScreenManager;
