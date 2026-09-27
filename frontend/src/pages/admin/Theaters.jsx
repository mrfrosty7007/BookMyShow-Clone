import { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  Plus,
  Search,
  MapPin,
  RefreshCw,
  Armchair,
  Sliders,
  ChevronDown,
  ChevronUp,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Film,
  Edit2,
  RotateCcw,
} from 'lucide-react';
import {
  getAdminTheaters,
  createTheater,
  updateTheater,
  deleteTheater,
  restoreTheater,
  addScreen,
  updateScreen,
  deleteScreen,
  duplicateScreen,
} from '../../services/api.js';
import { TheaterModal } from '../../components/admin/TheaterModal.jsx';
import { ScreenManager } from '../../components/admin/ScreenManager.jsx';
import { SeatLayoutBuilder } from '../../components/admin/SeatLayoutBuilder.jsx';

/**
 * Theaters Admin Page - Phase 4.3 (Multiplex Management & Visual Seat Layout Builder)
 * Comprehensive executive console for managing multiplex venues, configuring multiple screens,
 * and visually designing auditorium seating charts with dynamic capacity.
 */
export const Theaters = () => {
  const [theaters, setTheaters] = useState([]);
  const [cities, setCities] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // Filters & Search
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('All Cities');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'
  const [page, setPage] = useState(1);

  // Expanded Theaters for Screen Management
  const [expandedTheaterIds, setExpandedTheaterIds] = useState(new Set());

  // Loading & Feedback
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Modals state
  const [theaterModalOpen, setTheaterModalOpen] = useState(false);
  const [editingTheater, setEditingTheater] = useState(null);

  const [builderOpen, setBuilderOpen] = useState(false);
  const [builderTheater, setBuilderTheater] = useState(null);
  const [editingScreen, setEditingScreen] = useState(null);

  // Show Toast
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Reload data trigger
  const reloadTheaters = useCallback(() => {
    setLoading(true);
    setRefreshTrigger((k) => k + 1);
  }, []);

  // Fetch theaters on parameter changes
  useEffect(() => {
    let isMounted = true;

    const fetchTheaters = async () => {
      try {
        const params = {
          page,
          limit: 10,
          status: statusFilter,
        };
        if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
        if (cityFilter && cityFilter !== 'All Cities') params.city = cityFilter;

        const res = await getAdminTheaters(params);
        if (isMounted && res?.theaters) {
          setTheaters(res.theaters);
          if (res.pagination) setPagination(res.pagination);
          if (res.cities) setCities(res.cities);
        }
      } catch (err) {
        if (isMounted) {
          showToast(err.message || 'Failed to fetch theaters', 'error');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTheaters();

    return () => {
      isMounted = false;
    };
  }, [page, statusFilter, debouncedSearch, cityFilter, refreshTrigger]);

  // Aggregate metrics
  const aggregateMetrics = {
    totalTheaters: pagination.total || theaters.length,
    totalScreens: theaters.reduce((acc, t) => acc + (t.screens?.length || 0), 0),
    totalCapacity: theaters.reduce(
      (acc, t) =>
        acc +
        (Array.isArray(t.screens) ? t.screens.reduce((sSum, s) => sSum + (s.capacity || 0), 0) : 0),
      0
    ),
    uniqueCities: cities.length,
  };

  // Toggle expand theater screens
  const toggleExpandTheater = (theaterId) => {
    setExpandedTheaterIds((prev) => {
      const next = new Set(prev);
      if (next.has(theaterId)) {
        next.delete(theaterId);
      } else {
        next.add(theaterId);
      }
      return next;
    });
  };

  // Open Create Theater
  const handleOpenCreateTheater = () => {
    setEditingTheater(null);
    setTheaterModalOpen(true);
  };

  // Open Edit Theater
  const handleOpenEditTheater = (theater) => {
    setEditingTheater(theater);
    setTheaterModalOpen(true);
  };

  // Save Theater (Create / Update)
  const handleSaveTheater = async (theaterData, theaterId) => {
    if (theaterId) {
      const res = await updateTheater(theaterId, theaterData);
      showToast(`Multiplex "${res.theater?.name}" updated successfully!`);
    } else {
      const res = await createTheater(theaterData);
      showToast(`Multiplex "${res.theater?.name}" created with configured screens!`);
    }
    reloadTheaters();
  };

  // Soft Delete Theater
  const handleDeleteTheater = async (theater) => {
    if (
      !window.confirm(
        `Hide "${theater.name}" from customer storefront? All show histories and historical bookings remain safely preserved.`
      )
    ) {
      return;
    }
    try {
      await deleteTheater(theater._id);
      showToast(`Multiplex "${theater.name}" hidden from customer listings.`, 'info');
      reloadTheaters();
    } catch (err) {
      showToast(err.message || 'Failed to hide theater', 'error');
    }
  };

  // Restore Theater
  const handleRestoreTheater = async (theater) => {
    try {
      await restoreTheater(theater._id);
      showToast(`Multiplex "${theater.name}" restored to active storefront!`, 'success');
      reloadTheaters();
    } catch (err) {
      showToast(err.message || 'Failed to restore theater', 'error');
    }
  };

  // Open Builder to Add New Screen
  const handleOpenAddScreen = (theater) => {
    setBuilderTheater(theater);
    setEditingScreen(null);
    setBuilderOpen(true);
  };

  // Open Builder to Edit Existing Screen
  const handleOpenEditScreen = (theater, screen) => {
    setBuilderTheater(theater);
    setEditingScreen(screen);
    setBuilderOpen(true);
  };

  // Save Screen from Visual Layout Builder
  const handleSaveScreenLayout = async (screenData) => {
    if (!builderTheater) return;
    setActionLoading(true);
    try {
      if (editingScreen?._id) {
        // Update
        const res = await updateScreen(builderTheater._id, editingScreen._id, screenData);
        showToast(
          `Screen "${res.screen?.name}" layout updated (${res.screen?.capacity} seats)!`,
          'success'
        );
      } else {
        // Create
        const res = await addScreen(builderTheater._id, screenData);
        showToast(
          `Screen "${res.screen?.name}" created (${res.screen?.capacity} seats)!`,
          'success'
        );
      }
      setBuilderOpen(false);
      reloadTheaters();
    } catch (err) {
      showToast(err.message || 'Failed to save screen layout', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Duplicate Screen
  const handleDuplicateScreen = async (theaterId, screenId) => {
    setActionLoading(true);
    try {
      const res = await duplicateScreen(theaterId, screenId);
      showToast(`Screen duplicated as "${res.screen?.name}" with identical layout!`, 'success');
      reloadTheaters();
    } catch (err) {
      showToast(err.message || 'Failed to duplicate screen', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Screen
  const handleDeleteScreen = async (theaterId, screenId) => {
    setActionLoading(true);
    try {
      await deleteScreen(theaterId, screenId);
      showToast('Screen removed from multiplex.', 'info');
      reloadTheaters();
    } catch (err) {
      showToast(err.message || 'Failed to delete screen', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative pb-12">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 animate-slide-in-down">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-md text-xs font-bold ${
              toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/40 text-rose-200'
                : toast.type === 'info'
                  ? 'bg-blue-950/90 border-blue-500/40 text-blue-200'
                  : 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            )}
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="opacity-70 hover:opacity-100 p-0.5 ml-2 cursor-pointer"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-950/40">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Theater & Screen Management
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                  Phase 4.3
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Multiplex facilities, multi-screen configurations, and interactive visual seat
                layout CAD builder
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleOpenCreateTheater}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-gray-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 active:scale-95 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Multiplex</span>
        </button>
      </div>

      {/* Aggregate Statistics Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Multiplexes */}
        <div className="p-4 rounded-2xl bg-[#0b1120] border border-gray-800/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Multiplexes
            </p>
            <p className="text-xl font-black text-white mt-0.5">{aggregateMetrics.totalTheaters}</p>
          </div>
        </div>

        {/* Screens */}
        <div className="p-4 rounded-2xl bg-[#0b1120] border border-gray-800/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Total Screens
            </p>
            <p className="text-xl font-black text-purple-300 mt-0.5">
              {aggregateMetrics.totalScreens}
            </p>
          </div>
        </div>

        {/* Seating Capacity */}
        <div className="p-4 rounded-2xl bg-[#0b1120] border border-gray-800/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Armchair className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Auditorium Seats
            </p>
            <p className="text-xl font-black text-emerald-300 mt-0.5">
              {aggregateMetrics.totalCapacity}
            </p>
          </div>
        </div>

        {/* Cities */}
        <div className="p-4 rounded-2xl bg-[#0b1120] border border-gray-800/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Cities Active
            </p>
            <p className="text-xl font-black text-amber-300 mt-0.5">
              {aggregateMetrics.uniqueCities}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-2xl bg-[#0b1120] border border-gray-800/80">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search multiplex name, city, address..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-900 border border-gray-800 focus:border-cyan-500 text-xs font-semibold text-gray-100 placeholder-gray-500 outline-none transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {/* City Dropdown */}
          <div className="relative">
            <select
              value={cityFilter}
              onChange={(e) => {
                setLoading(true);
                setCityFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 pr-8 rounded-xl bg-gray-900 border border-gray-800 focus:border-cyan-500 text-xs font-semibold text-gray-200 outline-none cursor-pointer"
            >
              <option value="All Cities">All Cities</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-gray-900 border border-gray-800 text-xs">
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setStatusFilter('all');
                setPage(1);
              }}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setStatusFilter('active');
                setPage(1);
              }}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                statusFilter === 'active'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setStatusFilter('inactive');
                setPage(1);
              }}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                statusFilter === 'inactive'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Hidden
            </button>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={reloadTheaters}
            disabled={loading}
            className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-cyan-400 hover:border-gray-700 transition-colors cursor-pointer"
            title="Refresh multiplex records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Theaters List */}
      {loading ? (
        <div className="py-24 rounded-2xl bg-[#0b1120]/40 border border-gray-800 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Loading Multiplexes & Layouts...
            </p>
          </div>
        </div>
      ) : theaters.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-[#0b1120]/50 border border-dashed border-gray-800 space-y-3">
          <Building2 className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="text-base font-bold text-gray-200">No multiplex theaters found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Try adjusting search terms, city filter, or register a new theater venue.
          </p>
          <button
            type="button"
            onClick={handleOpenCreateTheater}
            className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold hover:bg-cyan-500/30 transition-all cursor-pointer"
          >
            + Register Multiplex
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {theaters.map((theater) => {
            const isExpanded = expandedTheaterIds.has(theater._id);
            const screensCount = theater.screens?.length || 0;
            const totalCapacity = Array.isArray(theater.screens)
              ? theater.screens.reduce((sum, s) => sum + (s.capacity || 0), 0)
              : 0;

            const amenitiesList =
              Array.isArray(theater.amenities) && theater.amenities.length > 0
                ? theater.amenities
                : Array.isArray(theater.facilities)
                  ? theater.facilities
                  : [];

            return (
              <div
                key={theater._id}
                className={`rounded-2xl border transition-all duration-300 ${
                  theater.isActive
                    ? 'bg-[#0b1120] border-gray-800/80 hover:border-gray-700'
                    : 'bg-[#0b1120]/60 border-rose-950/40 opacity-75'
                }`}
              >
                {/* Theater Header Card */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Multiplex Name, City & Address */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                        {theater.name}
                      </h3>

                      {/* City Badge */}
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-cyan-400" />
                        <span>{theater.city}</span>
                      </span>

                      {/* Operational Status Badge */}
                      {theater.isActive ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                          <EyeOff className="w-3 h-3" />
                          <span>Hidden</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-400 max-w-2xl leading-relaxed">
                      {theater.address}
                    </p>

                    {/* Amenities list */}
                    {amenitiesList.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {amenitiesList.slice(0, 5).map((amenity, aIdx) => (
                          <span
                            key={aIdx}
                            className="px-2 py-0.5 rounded-md bg-gray-900 border border-gray-800 text-[10px] font-medium text-gray-400"
                          >
                            {amenity}
                          </span>
                        ))}
                        {amenitiesList.length > 5 && (
                          <span className="px-2 py-0.5 rounded-md bg-gray-900 text-[10px] text-gray-500">
                            +{amenitiesList.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Middle / Right: Stats & Actions */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-gray-800/80">
                    {/* Screens & Capacity Metrics */}
                    <div className="flex items-center gap-4 px-3 py-2 rounded-xl bg-gray-900/60 border border-gray-800 text-xs">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Screens</p>
                        <p className="text-sm font-black text-purple-300">{screensCount}</p>
                      </div>
                      <div className="h-6 w-px bg-gray-800" />
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Capacity</p>
                        <p className="text-sm font-black text-emerald-300">{totalCapacity}</p>
                      </div>
                    </div>

                    {/* Expand Screens Toggle */}
                    <button
                      type="button"
                      onClick={() => toggleExpandTheater(theater._id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isExpanded
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'bg-gray-900 border border-gray-800 text-gray-300 hover:text-white hover:bg-gray-800'
                      }`}
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Screens ({screensCount})</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 ml-0.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                      )}
                    </button>

                    {/* Theater Actions Dropdown */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditTheater(theater)}
                        className="p-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-400 hover:text-cyan-400 transition-colors cursor-pointer"
                        title="Edit Multiplex Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {theater.isActive ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteTheater(theater)}
                          className="p-2 rounded-xl bg-gray-900 hover:bg-rose-950/40 border border-gray-800 hover:border-rose-500/30 text-gray-400 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Hide Multiplex (Soft Delete)"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRestoreTheater(theater)}
                          className="p-2 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/50 transition-colors cursor-pointer"
                          title="Restore Multiplex to Active Storefront"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Screens Manager */}
                {isExpanded && (
                  <div className="border-t border-gray-800/80 px-4 sm:px-5 pb-5">
                    <ScreenManager
                      theater={theater}
                      onEditScreen={handleOpenEditScreen}
                      onAddScreen={handleOpenAddScreen}
                      onDuplicateScreen={handleDuplicateScreen}
                      onDeleteScreen={handleDeleteScreen}
                      actionLoading={actionLoading}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-[#0b1120] border border-gray-800 text-xs">
          <p className="text-gray-400">
            Showing Page <strong className="text-white">{pagination.page}</strong> of{' '}
            <strong className="text-white">{pagination.totalPages}</strong> ({pagination.total}{' '}
            total venues)
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1 || loading}
              onClick={() => {
                setLoading(true);
                setPage((p) => Math.max(1, p - 1));
              }}
              className="px-3.5 py-1.5 rounded-xl border border-gray-800 bg-gray-900 hover:bg-gray-800 text-gray-300 font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages || loading}
              onClick={() => {
                setLoading(true);
                setPage((p) => p + 1);
              }}
              className="px-3.5 py-1.5 rounded-xl border border-gray-800 bg-gray-900 hover:bg-gray-800 text-gray-300 font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Multiplex Metadata Modal */}
      <TheaterModal
        isOpen={theaterModalOpen}
        theater={editingTheater}
        onClose={() => setTheaterModalOpen(false)}
        onSave={handleSaveTheater}
      />

      {/* Visual Seat Layout Builder Modal */}
      <SeatLayoutBuilder
        isOpen={builderOpen}
        screen={editingScreen}
        theaterName={builderTheater?.name}
        onClose={() => setBuilderOpen(false)}
        onSave={handleSaveScreenLayout}
        loading={actionLoading}
      />
    </div>
  );
};

export default Theaters;
