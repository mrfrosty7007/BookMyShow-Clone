import { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Search,
  Building2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Film,
  AlertCircle,
  CheckCircle2,
  Layers,
  Grid,
} from 'lucide-react';
import {
  getAdminShows,
  createAdminShow,
  updateAdminShow,
  deleteAdminShow,
  cancelAdminShow,
  bulkCreateShows,
  getAdminTheaters,
  getMovies,
} from '../../services/api.js';
import { ShowCardAdmin } from '../../components/admin/ShowCardAdmin.jsx';
import { TimelineScheduler } from '../../components/admin/TimelineScheduler.jsx';
import { ShowModal } from '../../components/admin/ShowModal.jsx';
import { ConflictDialog } from '../../components/admin/ConflictDialog.jsx';

/**
 * Format Date to YYYY-MM-DD
 */
const formatDateParam = (dateObj) => {
  const d = dateObj instanceof Date ? dateObj : new Date(dateObj);
  return d.toISOString().split('T')[0];
};

/**
 * Format readable date for header (e.g. "Tuesday, Sep 29, 2026")
 */
const formatReadableDate = (dateStr) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Shows Page - Executive Show Operations & Scheduling Console
 */
export const Shows = () => {
  // Master dependencies
  const [theaters, setTheaters] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loadingDependencies, setLoadingDependencies] = useState(true);

  // Filters & View State
  const [selectedTheaterId, setSelectedTheaterId] = useState('');
  const [selectedScreenId, setSelectedScreenId] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => formatDateParam(new Date()));
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' | 'grid'

  // Shows data & KPIs
  const [shows, setShows] = useState([]);
  const [kpis, setKpis] = useState({
    totalShows: 0,
    todayShows: 0,
    liveShows: 0,
    scheduledShows: 0,
    cancelledShows: 0,
    avgOccupancy: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Modals & Action State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToEdit, setShowToEdit] = useState(null);
  const [modalPreFill, setModalPreFill] = useState({
    screenId: '',
    time: '18:00',
  });

  // Conflict Dialog State
  const [conflictDialog, setConflictDialog] = useState({
    isOpen: false,
    data: null,
  });

  // Confirm delete / cancel
  // Confirm delete / cancel
  const [actionConfirm, setActionConfirm] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Show Toast Helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  // Load active Theaters and active Movies
  useEffect(() => {
    let isMounted = true;

    const loadDependencies = async () => {
      try {
        const [theatersRes, moviesRes] = await Promise.all([
          getAdminTheaters({ limit: 100 }),
          getMovies({ limit: 100 }),
        ]);

        if (!isMounted) return;

        const tList = theatersRes.data.theaters || [];
        const mList = moviesRes.data.movies || [];

        setTheaters(tList);
        setMovies(mList);

        if (tList.length > 0) {
          setSelectedTheaterId((prev) => prev || tList[0]._id);
        }
      } catch {
        if (isMounted) {
          showToast('Failed to load theaters or movies', 'error');
        }
      } finally {
        if (isMounted) {
          setLoadingDependencies(false);
        }
      }
    };

    loadDependencies();

    return () => {
      isMounted = false;
    };
  }, []);

  // Selected theater object
  const currentTheater = useMemo(() => {
    return theaters.find((t) => t._id === selectedTheaterId) || theaters[0];
  }, [theaters, selectedTheaterId]);

  // Load Shows for currently selected filters
  useEffect(() => {
    if (!selectedTheaterId && viewMode === 'timeline') return;

    let isMounted = true;

    const fetchShowsData = async () => {
      try {
        const params = {
          theater: selectedTheaterId || undefined,
          screen: selectedScreenId || undefined,
          date: selectedDate || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          search: searchQuery.trim() || undefined,
          timeline: viewMode === 'timeline' ? 'true' : 'false',
          limit: viewMode === 'timeline' ? 200 : 30,
        };

        const response = await getAdminShows(params);
        if (!isMounted) return;

        const data = response.data;
        setShows(data.shows || []);
        if (data.kpis) {
          setKpis(data.kpis);
        }
      } catch {
        if (isMounted) {
          showToast('Failed to load shows', 'error');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchShowsData();

    return () => {
      isMounted = false;
    };
  }, [
    selectedTheaterId,
    selectedScreenId,
    selectedDate,
    statusFilter,
    searchQuery,
    viewMode,
    refreshTrigger,
  ]);

  // Date Navigation handlers
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(formatDateParam(d));
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(formatDateParam(d));
  };

  const handleToday = () => {
    setSelectedDate(formatDateParam(new Date()));
  };

  // Create or Update Show
  const handleSaveShow = async (payload) => {
    try {
      if (showToEdit) {
        await updateAdminShow(showToEdit._id, payload);
        showToast('Show updated successfully');
      } else {
        await createAdminShow(payload);
        showToast(
          payload.recurring
            ? 'Recurring shows scheduled successfully'
            : 'Show scheduled successfully'
        );
      }
      setIsModalOpen(false);
      setShowToEdit(null);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      if (err.response?.status === 409 && err.response?.data?.conflict) {
        // Trigger Screen Conflict Dialog
        setConflictDialog({
          isOpen: true,
          data: err.response.data,
        });
      } else {
        showToast(err.response?.data?.message || 'Failed to schedule show', 'error');
      }
    }
  };

  // Bulk Create Shows
  const handleBulkSubmit = async (payload) => {
    try {
      const res = await bulkCreateShows(payload);
      showToast(`Bulk scheduled ${res.data.count} shows successfully`);
      setIsModalOpen(false);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      showToast(err.response?.data?.message || 'Bulk scheduling failed', 'error');
    }
  };

  // Cancel Show
  const handleCancelShow = async (show) => {
    try {
      await cancelAdminShow(show._id);
      showToast(`Show for "${show.movie?.title}" marked as cancelled`);
      setActionConfirm(null);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel show', 'error');
    }
  };

  // Delete Show
  const handleDeleteShow = async (show) => {
    try {
      await deleteAdminShow(show._id);
      showToast('Show deleted successfully');
      setActionConfirm(null);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete show', 'error');
    }
  };

  // Add show from timeline slot click
  const handleAddShowAtTime = ({ screenId, time }) => {
    setShowToEdit(null);
    setModalPreFill({ screenId, time });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border p-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-300 ${
            toast.type === 'error'
              ? 'border-rose-500/30 bg-rose-950/90 text-rose-200 shadow-rose-500/20'
              : 'border-emerald-500/30 bg-emerald-950/90 text-emerald-200 shadow-emerald-500/20'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="h-5 w-5 text-rose-400" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          )}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Show Scheduling Engine
            </span>
            <span className="rounded-full bg-purple-500/20 border border-purple-500/30 px-3 py-0.5 text-xs font-mono font-bold text-purple-300">
              Operations Console
            </span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Cinema schedule timeline, dynamic conflict resolution, cleaning buffers & live seat
            inventory
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setShowToEdit(null);
              setModalPreFill({ screenId: '', time: '18:00' });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:from-cyan-400 hover:to-blue-500 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Schedule Show</span>
          </button>
        </div>
      </div>

      {/* Executive Operational KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-cyan-400" /> Total Active Shows
          </span>
          <div className="mt-1 text-2xl font-bold font-mono text-white">{kpis.totalShows}</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-blue-400" /> Today&apos;s Shows
          </span>
          <div className="mt-1 text-2xl font-bold font-mono text-blue-400">{kpis.todayShows}</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Live Now
          </span>
          <div className="mt-1 text-2xl font-bold font-mono text-emerald-400">{kpis.liveShows}</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-purple-400" /> Scheduled
          </span>
          <div className="mt-1 text-2xl font-bold font-mono text-purple-400">
            {kpis.scheduledShows}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-amber-400" /> Avg Occupancy
          </span>
          <div className="mt-1 text-2xl font-bold font-mono text-amber-400">
            {kpis.avgOccupancy}%
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5 text-emerald-400" /> Total Revenue
          </span>
          <div className="mt-1 text-2xl font-bold font-mono text-emerald-400">
            ₹{kpis.totalRevenue?.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Main Operations Control Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Multiplex Selector */}
          <div className="flex items-center gap-2 min-w-[240px]">
            <Building2 className="h-4 w-4 text-cyan-400" />
            <select
              value={selectedTheaterId}
              onChange={(e) => {
                setSelectedTheaterId(e.target.value);
                setSelectedScreenId('');
              }}
              className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-semibold text-white focus:border-cyan-500 focus:outline-none"
            >
              {theaters.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} ({t.city})
                </option>
              ))}
            </select>
          </div>

          {/* Date Navigator Bar */}
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-800/80 p-1">
            <button
              onClick={handlePrevDay}
              title="Previous Day"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              onClick={handleToday}
              className="rounded-lg px-2.5 py-1 text-xs font-bold text-cyan-400 hover:bg-slate-700 transition-colors"
            >
              Today
            </button>

            <span className="text-xs font-semibold text-white px-2">
              {formatReadableDate(selectedDate)}
            </span>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-0 text-slate-400 text-xs focus:ring-0 cursor-pointer w-7"
            />

            <button
              onClick={handleNextDay}
              title="Next Day"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* View Mode Toggle: Timeline vs Grid */}
          <div className="flex items-center rounded-xl border border-slate-700 bg-slate-800 p-1">
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                viewMode === 'timeline'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Timeline View</span>
            </button>

            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                viewMode === 'grid'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="h-3.5 w-3.5" />
              <span>Grid Cards</span>
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => setRefreshTrigger((prev) => prev + 1)}
            title="Refresh Data"
            className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Secondary Filter Bar: Status Tabs & Search */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {['all', 'scheduled', 'live', 'completed', 'cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold capitalize transition-all ${
                  statusFilter === tab
                    ? 'bg-slate-700 text-white border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search by movie */}
          <div className="relative min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search movie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800/60 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Main View Container */}
      {loadingDependencies ? (
        <div className="flex h-64 items-center justify-center">
          <div className="flex items-center gap-3 text-cyan-400">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="text-sm font-semibold">Loading Cinema Multiplexes...</span>
          </div>
        </div>
      ) : viewMode === 'timeline' ? (
        <TimelineScheduler
          theater={currentTheater}
          date={selectedDate}
          shows={shows}
          onSelectShow={(show) => {
            setShowToEdit(show);
            setIsModalOpen(true);
          }}
          onAddShowAtTime={handleAddShowAtTime}
        />
      ) : (
        /* Grid Cards View */
        <div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-64 rounded-2xl border border-slate-800 bg-slate-900/50 animate-pulse"
                />
              ))}
            </div>
          ) : shows.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center">
              <Film className="mx-auto h-12 w-12 text-slate-600 mb-3" />
              <h3 className="text-base font-bold text-white">No Shows Scheduled</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No shows found for the selected theater and date. Click below to schedule a new
                show.
              </p>
              <button
                onClick={() => {
                  setShowToEdit(null);
                  setIsModalOpen(true);
                }}
                className="mt-4 rounded-xl bg-cyan-500/20 border border-cyan-500/30 px-4 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-500/30 transition-colors"
              >
                + Schedule Show
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {shows.map((show) => (
                <ShowCardAdmin
                  key={show._id}
                  show={show}
                  onEdit={(s) => {
                    setShowToEdit(s);
                    setIsModalOpen(true);
                  }}
                  onCancel={(s) => setActionConfirm({ type: 'cancel', show: s })}
                  onDelete={(s) => setActionConfirm({ type: 'delete', show: s })}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Show Creation & Editing Modal */}
      <ShowModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setShowToEdit(null);
        }}
        showToEdit={showToEdit}
        theaters={theaters}
        movies={movies}
        defaultTheaterId={selectedTheaterId}
        defaultScreenId={modalPreFill.screenId}
        defaultDate={selectedDate}
        defaultTime={modalPreFill.time}
        onSubmit={handleSaveShow}
        onBulkSubmit={handleBulkSubmit}
      />

      {/* Conflict Dialog */}
      <ConflictDialog
        isOpen={conflictDialog.isOpen}
        onClose={() => setConflictDialog({ isOpen: false, data: null })}
        conflictData={conflictDialog.data}
        onUseSuggested={(suggestedTime) => {
          const d = new Date(suggestedTime);
          const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
          setModalPreFill((prev) => ({ ...prev, time: timeStr }));
          setIsModalOpen(true);
        }}
      />

      {/* Action Confirmation Dialog (Cancel / Delete) */}
      {actionConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h4 className="text-base font-bold text-white mb-2">
              {actionConfirm.type === 'cancel' ? 'Cancel Show Schedule?' : 'Delete Show?'}
            </h4>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              {actionConfirm.type === 'cancel'
                ? `Are you sure you want to cancel the show for "${actionConfirm.show?.movie?.title}"? The auditorium slot will be released for new scheduling.`
                : `Are you sure you want to delete this show record? This will soft-delete the show.`}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActionConfirm(null)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={() => {
                  if (actionConfirm.type === 'cancel') {
                    handleCancelShow(actionConfirm.show);
                  } else {
                    handleDeleteShow(actionConfirm.show);
                  }
                }}
                className={`rounded-xl px-4 py-2 text-xs font-bold text-white shadow-lg ${
                  actionConfirm.type === 'cancel'
                    ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                    : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                }`}
              >
                {actionConfirm.type === 'cancel' ? 'Confirm Cancellation' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shows;
