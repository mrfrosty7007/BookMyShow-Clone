import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Clock, Plus, MonitorPlay, Film, TrendingUp } from 'lucide-react';

const TIMELINE_START_HOUR = 8; // 8:00 AM
const TIMELINE_END_HOUR = 26; // 2:00 AM next day (26:00)
const TOTAL_TIMELINE_MINUTES = (TIMELINE_END_HOUR - TIMELINE_START_HOUR) * 60; // 18 hours * 60 = 1080 minutes

const HOUR_MARKERS = [
  '8 AM',
  '9 AM',
  '10 AM',
  '11 AM',
  '12 PM',
  '1 PM',
  '2 PM',
  '3 PM',
  '4 PM',
  '5 PM',
  '6 PM',
  '7 PM',
  '8 PM',
  '9 PM',
  '10 PM',
  '11 PM',
  '12 AM',
  '1 AM',
  '2 AM',
];

const SCREEN_TYPE_STYLES = {
  IMAX: 'from-cyan-600/80 to-blue-600/80 border-cyan-400/50 text-cyan-200',
  'IMAX 3D': 'from-cyan-600/80 to-blue-600/80 border-cyan-400/50 text-cyan-200',
  '4DX': 'from-purple-600/80 to-pink-600/80 border-purple-400/50 text-purple-200',
  'Dolby Atmos': 'from-blue-600/80 to-indigo-600/80 border-blue-400/50 text-blue-200',
  'Gold Class': 'from-amber-600/80 to-orange-600/80 border-amber-400/50 text-amber-200',
  Standard: 'from-slate-700/90 to-slate-800/90 border-slate-600/50 text-slate-200',
  ScreenX: 'from-emerald-600/80 to-teal-600/80 border-emerald-400/50 text-emerald-200',
  Laser: 'from-cyan-700/80 to-emerald-700/80 border-cyan-400/50 text-cyan-200',
  'ICE Immersive': 'from-sky-600/80 to-blue-600/80 border-sky-400/50 text-sky-200',
};

const formatTimeShort = (dateVal) => {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * TimelineScheduler Component
 * Visual horizontal operations scheduler showing auditoriums as rows and shows as colored blocks
 */
export const TimelineScheduler = ({ theater, date, shows = [], onSelectShow, onAddShowAtTime }) => {
  const [hoveredShow, setHoveredShow] = useState(null);

  // Group shows by screen
  const screens = useMemo(() => {
    if (theater?.screens && theater.screens.length > 0) {
      return theater.screens;
    }
    // Fallback if theater has no screens defined
    return [
      { _id: 'screen-1', name: 'Screen 1', type: 'IMAX', capacity: 100 },
      { _id: 'screen-2', name: 'Screen 2', type: 'Dolby Atmos', capacity: 100 },
      { _id: 'screen-3', name: 'Screen 3', type: 'Standard', capacity: 100 },
    ];
  }, [theater]);

  // Current time position indicator if viewing today
  const isToday = useMemo(() => {
    if (!date) return true;
    const todayStr = new Date().toISOString().split('T')[0];
    return date === todayStr;
  }, [date]);

  const currentTimeLeftPercent = useMemo(() => {
    if (!isToday) return null;
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    let adjustedHour = hours;
    if (adjustedHour < TIMELINE_START_HOUR && adjustedHour < 4) {
      adjustedHour += 24; // Past midnight hours (0, 1, 2)
    }

    if (adjustedHour < TIMELINE_START_HOUR || adjustedHour > TIMELINE_END_HOUR) {
      return null;
    }

    const currentTotalMinutes = (adjustedHour - TIMELINE_START_HOUR) * 60 + minutes;
    return Math.min(100, Math.max(0, (currentTotalMinutes / TOTAL_TIMELINE_MINUTES) * 100));
  }, [isToday]);

  /**
   * Calculate block position on the timeline
   */
  const calculateShowPosition = (show) => {
    const start = new Date(show.startTime || show.showTime);
    const end = new Date(show.endTime || new Date(start.getTime() + 150 * 60 * 1000));

    let startHours = start.getHours();
    let startMinutes = start.getMinutes();

    if (startHours < TIMELINE_START_HOUR && startHours < 4) {
      startHours += 24;
    }

    let endHours = end.getHours();
    let endMinutes = end.getMinutes();
    if (endHours < TIMELINE_START_HOUR && endHours < 4) {
      endHours += 24;
    }

    const startTotalMinutes = (startHours - TIMELINE_START_HOUR) * 60 + startMinutes;
    const endTotalMinutes = (endHours - TIMELINE_START_HOUR) * 60 + endMinutes;
    const durationMinutes = Math.max(30, endTotalMinutes - startTotalMinutes);

    const leftPercent = Math.max(0, (startTotalMinutes / TOTAL_TIMELINE_MINUTES) * 100);
    const widthPercent = Math.min(
      100 - leftPercent,
      (durationMinutes / TOTAL_TIMELINE_MINUTES) * 100
    );

    return {
      left: `${leftPercent}%`,
      width: `${Math.max(widthPercent, 3.5)}%`,
    };
  };

  /**
   * Handle clicking on an empty slot in a screen track
   */
  const handleTrackClick = (e, screen, screenIndex) => {
    if (e.target.closest('.show-block')) return; // Ignore if clicked on a show block

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const clickedMinutes = percentage * TOTAL_TIMELINE_MINUTES;

    const totalHours = TIMELINE_START_HOUR + Math.floor(clickedMinutes / 60);
    const remainderMinutes = Math.floor((clickedMinutes % 60) / 15) * 15; // Snap to 15 min

    const finalHour = totalHours >= 24 ? totalHours - 24 : totalHours;
    const timeStr = `${String(finalHour).padStart(2, '0')}:${String(remainderMinutes).padStart(2, '0')}`;

    if (onAddShowAtTime) {
      onAddShowAtTime({
        screenId: screen._id,
        screenNumber: screenIndex + 1,
        screenName: screen.name,
        screenType: screen.type,
        time: timeStr,
      });
    }
  };

  return (
    <div className="relative rounded-2xl border border-slate-800 bg-slate-900/95 shadow-2xl backdrop-blur-xl overflow-hidden">
      {/* Timeline Controls Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/60">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-400 border border-cyan-500/20">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">
              {theater?.name || 'Multiplex'} — Auditorium Timeline
            </h3>
            <p className="text-xs text-slate-400">
              {screens.length} Screens Configured • {shows.length} Scheduled Shows
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" />
            <span className="text-slate-400">Scheduled</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">Live Now</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            <span className="text-slate-400">Cancelled</span>
          </div>
        </div>
      </div>

      {/* Main Scrollable Timeline Area */}
      <div className="overflow-x-auto">
        <div className="min-w-[1100px] select-none">
          {/* Timeline Hours Header */}
          <div className="grid grid-cols-[200px_1fr] border-b border-slate-800 bg-slate-950/80 sticky top-0 z-20">
            <div className="p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-r border-slate-800 flex items-center justify-between">
              <span>Auditorium</span>
              <span className="text-[10px] text-slate-500">18H Grid</span>
            </div>

            <div className="relative flex justify-between px-2 py-3 text-[11px] font-mono text-slate-400">
              {HOUR_MARKERS.map((hour, idx) => (
                <div
                  key={idx}
                  className="flex-1 text-center border-l border-slate-800/80 first:border-l-0"
                >
                  {hour}
                </div>
              ))}
            </div>
          </div>

          {/* Screen Rows */}
          <div className="divide-y divide-slate-800/70">
            {screens.map((screen, screenIndex) => {
              // Find shows assigned to this screen
              const screenShows = shows.filter((sh) => {
                if (sh.screenId && screen._id) {
                  return sh.screenId.toString() === screen._id.toString();
                }
                return Number(sh.screen) === screenIndex + 1;
              });

              return (
                <div
                  key={screen._id || screenIndex}
                  className="grid grid-cols-[200px_1fr] group/row transition-colors hover:bg-slate-800/20"
                >
                  {/* Left Column: Screen Meta */}
                  <div className="p-4 border-r border-slate-800 bg-slate-900/40 flex flex-col justify-center">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white group-hover/row:text-cyan-400 transition-colors">
                        {screen.name || `Screen ${screenIndex + 1}`}
                      </span>
                      <span className="text-[10px] rounded bg-slate-800 px-1.5 py-0.5 text-cyan-300 font-mono border border-slate-700">
                        {screen.type || 'Standard'}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                      <span>{screen.capacity || 100} Seats</span>
                      <span className="text-[11px] text-slate-400">{screenShows.length} shows</span>
                    </div>
                  </div>

                  {/* Right Track: Show Blocks */}
                  <div
                    onClick={(e) => handleTrackClick(e, screen, screenIndex)}
                    className="relative h-24 p-2 bg-slate-950/30 cursor-crosshair group/track"
                  >
                    {/* Hour grid vertical lines */}
                    <div className="absolute inset-0 flex justify-between pointer-events-none">
                      {HOUR_MARKERS.map((_, idx) => (
                        <div
                          key={idx}
                          className="flex-1 border-l border-slate-800/40 first:border-l-0"
                        />
                      ))}
                    </div>

                    {/* Current Time Indicator Red Vertical Line */}
                    {currentTimeLeftPercent !== null && (
                      <div
                        className="absolute top-0 bottom-0 z-30 pointer-events-none flex flex-col items-center"
                        style={{ left: `${currentTimeLeftPercent}%` }}
                      >
                        <div className="h-2 w-2 rounded-full bg-rose-500 shadow-lg shadow-rose-500/80 animate-ping" />
                        <div className="w-[2px] h-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                      </div>
                    )}

                    {/* Render Scheduled Shows on this Screen */}
                    {screenShows.map((show) => {
                      const pos = calculateShowPosition(show);
                      const isLive = show.status === 'live';
                      const isCancelled = show.status === 'cancelled';
                      const screenType = show.screenType || screen.type || 'Standard';
                      const colorStyle =
                        SCREEN_TYPE_STYLES[screenType] || SCREEN_TYPE_STYLES.Standard;

                      const occupancyPct =
                        show.occupancy?.percentage ??
                        (show.seats?.length > 0
                          ? Math.round(
                              ((show.seats.filter((s) => s.status === 'booked').length || 0) /
                                show.seats.length) *
                                100
                            )
                          : 0);

                      return (
                        <div
                          key={show._id}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSelectShow) onSelectShow(show);
                          }}
                          onMouseEnter={() => setHoveredShow(show)}
                          onMouseLeave={() => setHoveredShow(null)}
                          style={{ left: pos.left, width: pos.width }}
                          className={`show-block absolute top-2 bottom-2 rounded-xl border p-2 shadow-lg transition-all duration-200 cursor-pointer overflow-hidden z-10 bg-gradient-to-r ${colorStyle} ${
                            isLive
                              ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-900 animate-pulse'
                              : ''
                          } ${
                            isCancelled
                              ? 'opacity-40 grayscale border-rose-500/50 line-through'
                              : 'hover:scale-[1.02] hover:z-20 hover:shadow-cyan-500/25'
                          }`}
                        >
                          <div className="flex h-full flex-col justify-between overflow-hidden">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-xs truncate text-white drop-shadow-sm">
                                {show.movie?.title || 'Movie'}
                              </span>
                              {isLive && (
                                <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400 animate-ping" />
                              )}
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-white/90 font-mono">
                              <span className="truncate">
                                {formatTimeShort(show.startTime || show.showTime)} –{' '}
                                {formatTimeShort(show.endTime)}
                              </span>
                              <span className="rounded bg-black/40 px-1 py-0.2 font-semibold">
                                {occupancyPct}%
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Empty Track Click Hint on Hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/track:opacity-40 transition-opacity pointer-events-none">
                      <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 bg-slate-900/80 px-2 py-1 rounded-md border border-slate-700">
                        <Plus className="h-3 w-3" /> Click anywhere to schedule show here
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hover Floating Details Card */}
      {hoveredShow && (
        <div className="border-t border-slate-800 bg-slate-950/90 px-6 py-3 flex items-center justify-between text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Film className="h-4 w-4 text-cyan-400" />
              <span className="font-bold text-white text-sm">{hoveredShow.movie?.title}</span>
              <span className="text-slate-400">({hoveredShow.movieDuration || 120} min)</span>
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <MonitorPlay className="h-3.5 w-3.5 text-blue-400" />
              <span>{hoveredShow.screenName}</span>
              <span className="text-slate-600">•</span>
              <span className="text-cyan-400 font-mono">{hoveredShow.screenType}</span>
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <Clock className="h-3.5 w-3.5 text-purple-400" />
              <span className="font-mono text-white">
                {formatTimeShort(hoveredShow.startTime)} – {formatTimeShort(hoveredShow.endTime)}
              </span>
              <span className="text-slate-400">
                (Trailers: {hoveredShow.trailerBuffer || 15}m, Clean:{' '}
                {hoveredShow.cleaningBuffer || 20}m)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 font-mono">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{hoveredShow.occupancy?.percentage || 0}% Booked</span>
            </div>
            <div className="text-cyan-400 font-bold">Base: ₹{hoveredShow.price}</div>
          </div>
        </div>
      )}
    </div>
  );
};

TimelineScheduler.propTypes = {
  theater: PropTypes.object,
  date: PropTypes.string,
  shows: PropTypes.array,
  onSelectShow: PropTypes.func,
  onAddShowAtTime: PropTypes.func,
};

export default TimelineScheduler;
