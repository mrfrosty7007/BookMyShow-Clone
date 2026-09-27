import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  X,
  Calendar,
  Clock,
  Film,
  Building2,
  MonitorPlay,
  Sparkles,
  Tag,
  AlertTriangle,
  CheckCircle2,
  Repeat,
  Grid,
} from 'lucide-react';
import { PricingPreview } from './PricingPreview.jsx';
import { checkShowConflict } from '../../services/api.js';

const QUICK_PRICES = [150, 200, 250, 350, 500];

const DEFAULT_TIME_SLOTS = ['10:00', '13:30', '17:00', '20:30'];

/**
 * Format Date into 12-hour AM/PM string
 */
const formatTimeStr = (dateVal) => {
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
 * ShowModal Component
 * Comprehensive scheduling modal supporting single shows, recurring schedules, and bulk time slots
 */
export const ShowModal = ({
  isOpen,
  onClose,
  showToEdit,
  theaters = [],
  movies = [],
  defaultTheaterId,
  defaultScreenId,
  defaultDate,
  defaultTime,
  onSubmit,
  onBulkSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <ShowModalForm
      key={showToEdit?._id || 'new-show-modal'}
      onClose={onClose}
      showToEdit={showToEdit}
      theaters={theaters}
      movies={movies}
      defaultTheaterId={defaultTheaterId}
      defaultScreenId={defaultScreenId}
      defaultDate={defaultDate}
      defaultTime={defaultTime}
      onSubmit={onSubmit}
      onBulkSubmit={onBulkSubmit}
    />
  );
};

ShowModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  showToEdit: PropTypes.object,
  theaters: PropTypes.array,
  movies: PropTypes.array,
  defaultTheaterId: PropTypes.string,
  defaultScreenId: PropTypes.string,
  defaultDate: PropTypes.string,
  defaultTime: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  onBulkSubmit: PropTypes.func,
};

const ShowModalForm = ({
  onClose,
  showToEdit,
  theaters,
  movies,
  defaultTheaterId,
  defaultScreenId,
  defaultDate,
  defaultTime,
  onSubmit,
  onBulkSubmit,
}) => {
  // Mode: 'single' | 'recurring' | 'bulk'
  const [scheduleMode, setScheduleMode] = useState('single');

  // Form inputs
  const [selectedMovieId, setSelectedMovieId] = useState(
    showToEdit?.movie?._id || showToEdit?.movie || movies[0]?._id || ''
  );
  const [selectedTheaterId, setSelectedTheaterId] = useState(
    showToEdit?.theater?._id || showToEdit?.theater || defaultTheaterId || theaters[0]?._id || ''
  );

  const selectedTheater = useMemo(() => {
    return theaters.find((t) => t._id === selectedTheaterId) || theaters[0];
  }, [theaters, selectedTheaterId]);

  const screens = useMemo(() => selectedTheater?.screens || [], [selectedTheater]);

  const [selectedScreenId, setSelectedScreenId] = useState(() => {
    if (showToEdit?.screenId) return showToEdit.screenId;
    if (defaultScreenId) return defaultScreenId;
    return screens[0]?._id || '';
  });

  const selectedScreen = useMemo(() => {
    return screens.find((s) => s._id === selectedScreenId) || screens[0];
  }, [screens, selectedScreenId]);

  // Date and Time
  const [date, setDate] = useState(() => {
    if (showToEdit?.startTime || showToEdit?.showTime) {
      return new Date(showToEdit.startTime || showToEdit.showTime).toISOString().split('T')[0];
    }
    return defaultDate || new Date().toISOString().split('T')[0];
  });

  const [startTimeStr, setStartTimeStr] = useState(() => {
    if (showToEdit?.startTime || showToEdit?.showTime) {
      const d = new Date(showToEdit.startTime || showToEdit.showTime);
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }
    return defaultTime || '18:00';
  });

  const [basePrice, setBasePrice] = useState(showToEdit?.price || 200);
  const [trailerBuffer, setTrailerBuffer] = useState(showToEdit?.trailerBuffer || 15);
  const [cleaningBuffer, setCleaningBuffer] = useState(showToEdit?.cleaningBuffer || 20);

  // Recurring options
  const [recurringType, setRecurringType] = useState('weekly');
  const [recurringCount, setRecurringCount] = useState(4);

  // Bulk time slots
  const [bulkSlots, setBulkSlots] = useState(DEFAULT_TIME_SLOTS);
  const [customSlotInput, setCustomSlotInput] = useState('');

  // Conflict Pre-flight state
  const [conflictState, setConflictState] = useState({
    checking: false,
    hasConflict: false,
    message: null,
    suggestedTime: null,
  });

  const selectedMovie = useMemo(() => {
    return movies.find((m) => m._id === selectedMovieId) || movies[0];
  }, [movies, selectedMovieId]);

  // Auto-calculated End Time
  const calculatedTimes = useMemo(() => {
    if (!date || !startTimeStr) return { start: null, end: null, totalMinutes: 155 };

    const [hours, minutes] = startTimeStr.split(':').map(Number);
    const start = new Date(date);
    start.setHours(hours || 0, minutes || 0, 0, 0);

    const movieDuration = selectedMovie?.duration || 120;
    const totalMinutes = movieDuration + Number(trailerBuffer || 15) + Number(cleaningBuffer || 20);
    const end = new Date(start.getTime() + totalMinutes * 60 * 1000);

    return {
      start,
      end,
      totalMinutes,
      movieDuration,
    };
  }, [date, startTimeStr, selectedMovie, trailerBuffer, cleaningBuffer]);

  // Pre-flight conflict check debounced
  useEffect(() => {
    if (!selectedTheaterId || !calculatedTimes.start || scheduleMode !== 'single') {
      return;
    }

    let isMounted = true;
    const timer = setTimeout(async () => {
      try {
        setConflictState((prev) => ({ ...prev, checking: true }));
        const response = await checkShowConflict({
          theaterId: selectedTheaterId,
          screenId: selectedScreen?._id,
          screen: 1,
          startTime: calculatedTimes.start.toISOString(),
          duration: calculatedTimes.movieDuration,
          trailerBuffer: Number(trailerBuffer),
          cleaningBuffer: Number(cleaningBuffer),
          excludeShowId: showToEdit?._id,
        });

        if (!isMounted) return;

        const data = response.data;
        if (data.hasConflict) {
          setConflictState({
            checking: false,
            hasConflict: true,
            message: data.message,
            suggestedTime: data.suggestedTimeString,
            suggestedNextAvailableTime: data.suggestedNextAvailableTime,
          });
        } else {
          setConflictState({
            checking: false,
            hasConflict: false,
            message: null,
            suggestedTime: null,
          });
        }
      } catch {
        if (isMounted) {
          setConflictState((prev) => ({ ...prev, checking: false }));
        }
      }
    }, 400);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [
    selectedTheaterId,
    calculatedTimes,
    selectedScreen,
    trailerBuffer,
    cleaningBuffer,
    showToEdit,
    scheduleMode,
  ]);

  // Add custom bulk slot
  const handleAddBulkSlot = () => {
    if (!customSlotInput || !customSlotInput.includes(':')) return;
    if (!bulkSlots.includes(customSlotInput)) {
      setBulkSlots((prev) => [...prev, customSlotInput].sort());
      setCustomSlotInput('');
    }
  };

  const handleRemoveBulkSlot = (slot) => {
    setBulkSlots((prev) => prev.filter((s) => s !== slot));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (scheduleMode === 'bulk') {
      if (onBulkSubmit) {
        onBulkSubmit({
          movie: selectedMovieId,
          theater: selectedTheaterId,
          screenId: selectedScreen?._id,
          screen: 1,
          date,
          timeSlots: bulkSlots,
          price: Number(basePrice),
          trailerBuffer: Number(trailerBuffer),
          cleaningBuffer: Number(cleaningBuffer),
        });
      }
      return;
    }

    const payload = {
      movie: selectedMovieId,
      theater: selectedTheaterId,
      screenId: selectedScreen?._id,
      screen: 1,
      startTime: calculatedTimes.start.toISOString(),
      price: Number(basePrice),
      trailerBuffer: Number(trailerBuffer),
      cleaningBuffer: Number(cleaningBuffer),
    };

    if (scheduleMode === 'recurring') {
      payload.recurring = {
        type: recurringType,
        count: Number(recurringCount),
      };
    }

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-400 border border-cyan-500/20">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">
                {showToEdit ? 'Modify Show Schedule' : 'Cinema Show Operations Scheduler'}
              </h3>
              <p className="text-xs text-slate-400">
                Automatic Conflict Checking • Cleaning Buffers • Dynamic Pricing
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Schedule Mode Selector (Only for new shows) */}
        {!showToEdit && (
          <div className="flex border-b border-slate-800 px-6 bg-slate-950/40">
            <button
              type="button"
              onClick={() => setScheduleMode('single')}
              className={`flex items-center gap-2 border-b-2 py-3 px-4 text-xs font-semibold transition-all ${
                scheduleMode === 'single'
                  ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="h-4 w-4" />
              <span>Single Show</span>
            </button>

            <button
              type="button"
              onClick={() => setScheduleMode('recurring')}
              className={`flex items-center gap-2 border-b-2 py-3 px-4 text-xs font-semibold transition-all ${
                scheduleMode === 'recurring'
                  ? 'border-purple-400 text-purple-400 bg-purple-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Repeat className="h-4 w-4" />
              <span>Recurring Schedule</span>
            </button>

            <button
              type="button"
              onClick={() => setScheduleMode('bulk')}
              className={`flex items-center gap-2 border-b-2 py-3 px-4 text-xs font-semibold transition-all ${
                scheduleMode === 'bulk'
                  ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Grid className="h-4 w-4" />
              <span>Bulk Day Slots</span>
            </button>
          </div>
        )}

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Row 1: Movie Selection with Poster Preview */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Film className="h-4 w-4 text-cyan-400" /> Select Movie
              </label>
              <select
                value={selectedMovieId}
                onChange={(e) => setSelectedMovieId(e.target.value)}
                disabled={Boolean(showToEdit)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
              >
                {movies.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.title} ({m.duration || 120}m • {m.genre || 'Action'} • Rating:{' '}
                    {m.rating || '8.5'})
                  </option>
                ))}
              </select>
            </div>

            {selectedMovie?.poster && (
              <div className="hidden md:flex h-14 w-11 overflow-hidden rounded-lg border border-slate-700 bg-slate-800">
                <img
                  src={selectedMovie.poster}
                  alt={selectedMovie.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Row 2: Theater and Screen Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-cyan-400" /> Multiplex Theater
              </label>
              <select
                value={selectedTheaterId}
                onChange={(e) => {
                  setSelectedTheaterId(e.target.value);
                  const t = theaters.find((item) => item._id === e.target.value);
                  if (t?.screens?.length > 0) setSelectedScreenId(t.screens[0]._id);
                }}
                disabled={Boolean(showToEdit)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
              >
                {theaters.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name} ({t.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MonitorPlay className="h-4 w-4 text-cyan-400" /> Auditorium Screen
              </label>
              <select
                value={selectedScreenId}
                onChange={(e) => setSelectedScreenId(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
              >
                {screens.map((s, idx) => (
                  <option key={s._id || idx} value={s._id}>
                    {s.name} — [{s.type || 'Standard'}] ({s.capacity || 100} Seats)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Date and Time / Buffers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-cyan-400" /> Show Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
              />
            </div>

            {scheduleMode !== 'bulk' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-cyan-400" /> Start Time
                </label>
                <input
                  type="time"
                  value={startTimeStr}
                  onChange={(e) => setStartTimeStr(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
                />
              </div>
            )}
          </div>

          {/* Buffer Configuration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Trailers & Commercials (Minutes)
              </label>
              <input
                type="number"
                min="0"
                max="45"
                value={trailerBuffer}
                onChange={(e) => setTrailerBuffer(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Auditorium Cleaning Buffer (Minutes)
              </label>
              <input
                type="number"
                min="10"
                max="60"
                value={cleaningBuffer}
                onChange={(e) => setCleaningBuffer(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm text-white"
              />
            </div>
          </div>

          {/* Automatic Runtime & End Time Calculator Banner */}
          {scheduleMode !== 'bulk' && calculatedTimes.start && (
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-cyan-500/20 p-2 text-cyan-400">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Calculated Occupancy Runtime</div>
                  <div className="text-sm font-semibold text-white">
                    Movie ({calculatedTimes.movieDuration}m) + Trailers ({trailerBuffer}m) +
                    Cleaning ({cleaningBuffer}m) ={' '}
                    <span className="text-cyan-400 font-mono font-bold">
                      {calculatedTimes.totalMinutes} min
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-slate-900/80 px-3 py-1.5 border border-cyan-500/20 text-center">
                <div className="text-[10px] text-slate-400 uppercase">Calculated End Time</div>
                <div className="font-mono text-base font-bold text-cyan-300">
                  {formatTimeStr(calculatedTimes.end)}
                </div>
              </div>
            </div>
          )}

          {/* Conflict Live Indicator */}
          {scheduleMode === 'single' && (
            <div className="flex items-center justify-between text-xs px-1">
              <div className="flex items-center gap-2">
                {conflictState.checking ? (
                  <span className="text-slate-400 animate-pulse">
                    Checking screen availability...
                  </span>
                ) : conflictState.hasConflict ? (
                  <span className="text-rose-400 font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4" />
                    Conflict Detected: {conflictState.message}
                  </span>
                ) : (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    Screen Slot Available
                  </span>
                )}
              </div>

              {conflictState.suggestedTime && (
                <button
                  type="button"
                  onClick={() => {
                    if (conflictState.suggestedNextAvailableTime) {
                      const d = new Date(conflictState.suggestedNextAvailableTime);
                      setStartTimeStr(
                        `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
                      );
                    }
                  }}
                  className="text-xs text-emerald-400 hover:underline font-bold"
                >
                  Use Suggested: {conflictState.suggestedTime}
                </button>
              )}
            </div>
          )}

          {/* Recurring Schedule Configuration */}
          {scheduleMode === 'recurring' && (
            <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-4 space-y-3">
              <div className="flex items-center gap-2 text-purple-300 text-sm font-semibold">
                <Repeat className="h-4 w-4" /> Recurring Pattern
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-300 mb-1 block">Frequency</label>
                  <select
                    value={recurringType}
                    onChange={(e) => setRecurringType(e.target.value)}
                    className="w-full rounded-xl border border-purple-500/30 bg-slate-800 px-3 py-2 text-sm text-white"
                  >
                    <option value="daily">Daily (Consecutive Days)</option>
                    <option value="weekdays">Weekdays (Mon – Fri)</option>
                    <option value="weekends">Weekends (Sat – Sun)</option>
                    <option value="weekly">Weekly (Same Day Each Week)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 mb-1 block">Number of Occurrences</label>
                  <input
                    type="number"
                    min="2"
                    max="16"
                    value={recurringCount}
                    onChange={(e) => setRecurringCount(e.target.value)}
                    className="w-full rounded-xl border border-purple-500/30 bg-slate-800 px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bulk Daily Time Slots Configuration */}
          {scheduleMode === 'bulk' && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-300 text-sm font-semibold">
                  <Grid className="h-4 w-4" /> Multi-Slot Day Schedule
                </div>
                <span className="text-xs text-slate-400">{bulkSlots.length} slots configured</span>
              </div>

              {/* Chips */}
              <div className="flex flex-wrap gap-2">
                {bulkSlots.map((slot) => (
                  <span
                    key={slot}
                    className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-900/40 px-3 py-1.5 text-xs font-mono font-bold text-emerald-300"
                  >
                    {slot}
                    <button
                      type="button"
                      onClick={() => handleRemoveBulkSlot(slot)}
                      className="text-emerald-400 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Add custom slot */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="time"
                  value={customSlotInput}
                  onChange={(e) => setCustomSlotInput(e.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={handleAddBulkSlot}
                  className="rounded-lg bg-emerald-600/80 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                >
                  Add Time Slot
                </button>
              </div>
            </div>
          )}

          {/* Base Price & Quick Chips */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="h-4 w-4 text-cyan-400" /> Base Ticket Price (₹)
              </label>
              <span className="text-xs text-slate-400">Quick Select:</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-3 text-slate-400 font-mono">₹</span>
                <input
                  type="number"
                  min="50"
                  max="2000"
                  step="10"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/80 pl-8 pr-4 py-3 text-sm font-mono text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-bold"
                />
              </div>

              <div className="flex items-center gap-1.5">
                {QUICK_PRICES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setBasePrice(p)}
                    className={`rounded-lg px-2.5 py-2 text-xs font-mono font-semibold transition-all ${
                      Number(basePrice) === p
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    ₹{p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Pricing Breakdown Preview */}
          <PricingPreview
            basePrice={basePrice}
            time={startTimeStr}
            screenType={selectedScreen?.type || 'Standard'}
          />

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:from-cyan-400 hover:to-blue-500 transition-all"
            >
              <Sparkles className="h-4 w-4" />
              <span>
                {showToEdit
                  ? 'Update Show'
                  : scheduleMode === 'recurring'
                    ? `Schedule ${recurringCount} Recurring Shows`
                    : scheduleMode === 'bulk'
                      ? `Bulk Schedule ${bulkSlots.length} Shows`
                      : 'Schedule Show'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

ShowModalForm.propTypes = {
  onClose: PropTypes.func.isRequired,
  showToEdit: PropTypes.object,
  theaters: PropTypes.array.isRequired,
  movies: PropTypes.array.isRequired,
  defaultTheaterId: PropTypes.string,
  defaultScreenId: PropTypes.string,
  defaultDate: PropTypes.string,
  defaultTime: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  onBulkSubmit: PropTypes.func,
};

export default ShowModal;
