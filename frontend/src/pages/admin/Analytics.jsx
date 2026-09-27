import { useState, useEffect, useCallback } from 'react';
import {
  Filter,
  RotateCcw,
  Calendar,
  Building,
  Film,
  Layers,
  MapPin,
  AlertCircle,
} from 'lucide-react';
import {
  getAnalyticsOverview,
  getAnalyticsRevenue,
  getAnalyticsOccupancy,
  getAnalyticsMovies,
  getAnalyticsTheaters,
  getAnalyticsTimeSlots,
  getAnalyticsRefunds,
  getTheaters,
  getMovies,
  getCities,
} from '../../services/api.js';

import KPIGrid from '../../components/admin/KPIGrid.jsx';
import ExecutiveSummary from '../../components/admin/ExecutiveSummary.jsx';
import InsightsPanel from '../../components/admin/InsightsPanel.jsx';
import ReportExportModal from '../../components/admin/ReportExportModal.jsx';

import RevenueChart from '../../components/admin/charts/RevenueChart.jsx';
import OccupancyHeatmap from '../../components/admin/charts/OccupancyHeatmap.jsx';
import MoviePerformanceChart from '../../components/admin/charts/MoviePerformanceChart.jsx';
import TheaterUtilizationChart from '../../components/admin/charts/TheaterUtilizationChart.jsx';
import TimeSlotDemandChart from '../../components/admin/charts/TimeSlotDemandChart.jsx';
import RefundTrendChart from '../../components/admin/charts/RefundTrendChart.jsx';
import EntryConversionChart from '../../components/admin/charts/EntryConversionChart.jsx';

const SCREEN_TYPES = ['All', 'IMAX', 'Dolby Atmos', 'Standard', 'Gold Class', '4DX', 'ScreenX'];

export const Analytics = () => {
  // Global Filters
  const [datePreset, setDatePreset] = useState('30d');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [theaterId, setTheaterId] = useState('');
  const [movieId, setMovieId] = useState('');
  const [screenType, setScreenType] = useState('All');
  const [city, setCity] = useState('');

  // Revenue chart specific timeframe
  const [revenueTimeframe, setRevenueTimeframe] = useState('daily');

  // Filter option collections
  const [theatersList, setTheatersList] = useState([]);
  const [moviesList, setMoviesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);

  // Data states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [overviewData, setOverviewData] = useState({
    kpis: {},
    insights: [],
    topMovies: [],
  });
  const [revenueData, setRevenueData] = useState({
    metrics: {},
    series: [],
  });
  const [occupancyData, setOccupancyData] = useState({
    overall: {},
    heatmap: [],
    peakSlot: null,
    quietestSlot: null,
  });
  const [movieRankings, setMovieRankings] = useState([]);
  const [theaterUtilization, setTheaterUtilization] = useState({
    screenFormats: [],
    theaters: [],
  });
  const [timeslotsData, setTimeslotsData] = useState([]);
  const [refundsData, setRefundsData] = useState({
    refunds: {},
  });
  const [conversionData, setConversionData] = useState({
    stages: [],
    admissionConversionRate: 0,
  });

  // Export Modal state
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Compute active query parameters based on presets or manual inputs
  const computeQueryParams = useCallback(() => {
    const params = {};

    if (datePreset === '7d') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      params.startDate = d.toISOString().split('T')[0];
    } else if (datePreset === '30d') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      params.startDate = d.toISOString().split('T')[0];
    } else if (datePreset === '90d') {
      const d = new Date();
      d.setDate(d.getDate() - 90);
      params.startDate = d.toISOString().split('T')[0];
    } else if (datePreset === 'custom') {
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
    }

    if (theaterId) params.theaterId = theaterId;
    if (movieId) params.movieId = movieId;
    if (screenType && screenType !== 'All') params.screenType = screenType;
    if (city) params.city = city;

    return params;
  }, [datePreset, startDate, endDate, theaterId, movieId, screenType, city]);

  // Load auxiliary filter options (theaters, movies, cities)
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [tRes, mRes, cRes] = await Promise.allSettled([
          getTheaters(),
          getMovies(),
          getCities(),
        ]);

        if (tRes.status === 'fulfilled' && tRes.value?.theaters) {
          setTheatersList(tRes.value.theaters);
        } else if (tRes.status === 'fulfilled' && Array.isArray(tRes.value)) {
          setTheatersList(tRes.value);
        }

        if (mRes.status === 'fulfilled') {
          const list = mRes.value?.movies || mRes.value?.data || mRes.value;
          if (Array.isArray(list)) setMoviesList(list);
        }

        if (cRes.status === 'fulfilled' && Array.isArray(cRes.value)) {
          setCitiesList(cRes.value);
        }
      } catch (err) {
        console.error('Failed to load filter catalogs:', err);
      }
    };
    loadFilterOptions();
  }, []);

  // Fetch all analytics datasets asynchronously without triggering cascading renders
  useEffect(() => {
    let isMounted = true;

    const loadAnalyticsData = async () => {
      try {
        const params = computeQueryParams();

        const [
          overviewRes,
          revRes,
          occRes,
          movieRes,
          theaterRes,
          slotRes,
          refundRes,
        ] = await Promise.all([
          getAnalyticsOverview(params),
          getAnalyticsRevenue({ ...params, timeframe: revenueTimeframe }),
          getAnalyticsOccupancy(params),
          getAnalyticsMovies({ ...params, limit: 10 }),
          getAnalyticsTheaters(params),
          getAnalyticsTimeSlots(params),
          getAnalyticsRefunds(params),
        ]);

        if (!isMounted) return;

        setOverviewData({
          kpis: overviewRes.kpis || {},
          insights: overviewRes.insights || [],
          topMovies: overviewRes.topMovies || [],
        });

        setRevenueData({
          metrics: revRes.metrics || {},
          series: revRes.series || [],
        });

        setOccupancyData({
          overall: occRes.overall || {},
          heatmap: occRes.heatmap || [],
          peakSlot: occRes.peakSlot || null,
          quietestSlot: occRes.quietestSlot || null,
        });

        setMovieRankings(movieRes.movies || []);
        setTheaterUtilization({
          screenFormats: theaterRes.screenFormats || [],
          theaters: theaterRes.theaters || [],
        });
        setTimeslotsData(slotRes.timeslots || []);
        setRefundsData(refundRes.refunds || {});

        setConversionData({
          admissionConversionRate: overviewRes.kpis?.checkInRate || 0,
          paidConfirmed: overviewRes.kpis?.confirmedBookings || 0,
          checkedIn: overviewRes.kpis?.gateCheckedIn || 0,
        });
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        console.error('Error fetching analytics telemetry:', err);
        setError(err.message || 'Failed to aggregate executive analytics');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAnalyticsData();

    return () => {
      isMounted = false;
    };
  }, [computeQueryParams, revenueTimeframe]);

  // Manual refresh trigger
  const handleManualRefresh = async () => {
    setLoading(true);
    try {
      const params = computeQueryParams();
      const [
        overviewRes,
        revRes,
        occRes,
        movieRes,
        theaterRes,
        slotRes,
        refundRes,
      ] = await Promise.all([
        getAnalyticsOverview(params),
        getAnalyticsRevenue({ ...params, timeframe: revenueTimeframe }),
        getAnalyticsOccupancy(params),
        getAnalyticsMovies({ ...params, limit: 10 }),
        getAnalyticsTheaters(params),
        getAnalyticsTimeSlots(params),
        getAnalyticsRefunds(params),
      ]);

      setOverviewData({
        kpis: overviewRes.kpis || {},
        insights: overviewRes.insights || [],
        topMovies: overviewRes.topMovies || [],
      });
      setRevenueData({
        metrics: revRes.metrics || {},
        series: revRes.series || [],
      });
      setOccupancyData({
        overall: occRes.overall || {},
        heatmap: occRes.heatmap || [],
        peakSlot: occRes.peakSlot || null,
        quietestSlot: occRes.quietestSlot || null,
      });
      setMovieRankings(movieRes.movies || []);
      setTheaterUtilization({
        screenFormats: theaterRes.screenFormats || [],
        theaters: theaterRes.theaters || [],
      });
      setTimeslotsData(slotRes.timeslots || []);
      setRefundsData(refundRes.refunds || {});
      setConversionData({
        admissionConversionRate: overviewRes.kpis?.checkInRate || 0,
        paidConfirmed: overviewRes.kpis?.confirmedBookings || 0,
        checkedIn: overviewRes.kpis?.gateCheckedIn || 0,
      });
      setError(null);
    } catch (err) {
      console.error('Manual refresh error:', err);
      setError(err.message || 'Failed to refresh analytics');
    } finally {
      setLoading(false);
    }
  };

  // Handle revenue timeframe change (daily/weekly/monthly)
  const handleTimeframeChange = async (newTimeframe) => {
    setRevenueTimeframe(newTimeframe);
    try {
      const params = computeQueryParams();
      const revRes = await getAnalyticsRevenue({ ...params, timeframe: newTimeframe });
      setRevenueData({
        metrics: revRes.metrics || {},
        series: revRes.series || [],
      });
    } catch (err) {
      console.error('Failed to change revenue timeframe:', err);
    }
  };

  const handleResetFilters = () => {
    setDatePreset('30d');
    setStartDate('');
    setEndDate('');
    setTheaterId('');
    setMovieId('');
    setScreenType('All');
    setCity('');
  };

  const activeTheaterName = theatersList.find((t) => t._id === theaterId)?.name || null;
  const topMovie = movieRankings.length > 0 ? movieRankings[0] : null;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Flagship Executive Banner */}
      <ExecutiveSummary
        filters={{
          timeframe: datePreset,
          startDate: datePreset === 'custom' ? startDate : '',
          endDate: datePreset === 'custom' ? endDate : '',
        }}
        topMovie={topMovie}
        activeMultiplex={activeTheaterName}
        onExportClick={() => setExportModalOpen(true)}
        onRefresh={handleManualRefresh}
        loading={loading}
      />

      {/* Global Executive Filter Toolbar */}
      <div className="rounded-2xl bg-[#0d1527]/80 backdrop-blur-md border border-gray-800 p-4 shadow-xl">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
              Executive Filters
            </span>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/20">
              Instant Aggregation
            </span>
          </div>

          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Date Range Preset */}
          <div>
            <label className="block text-[11px] font-mono text-gray-400 mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-cyan-400" /> Date Preset
            </label>
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value)}
              className="w-full text-xs rounded-xl bg-gray-950 border border-gray-800 text-white px-3 py-2 focus:border-cyan-500 focus:outline-none transition-colors"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="all">All-Time Range</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Theater Filter */}
          <div>
            <label className="block text-[11px] font-mono text-gray-400 mb-1 flex items-center gap-1">
              <Building className="w-3 h-3 text-amber-400" /> Theater
            </label>
            <select
              value={theaterId}
              onChange={(e) => setTheaterId(e.target.value)}
              className="w-full text-xs rounded-xl bg-gray-950 border border-gray-800 text-white px-3 py-2 focus:border-cyan-500 focus:outline-none transition-colors"
            >
              <option value="">All Theaters</option>
              {theatersList.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} ({t.city})
                </option>
              ))}
            </select>
          </div>

          {/* Movie Filter */}
          <div>
            <label className="block text-[11px] font-mono text-gray-400 mb-1 flex items-center gap-1">
              <Film className="w-3 h-3 text-purple-400" /> Movie
            </label>
            <select
              value={movieId}
              onChange={(e) => setMovieId(e.target.value)}
              className="w-full text-xs rounded-xl bg-gray-950 border border-gray-800 text-white px-3 py-2 focus:border-cyan-500 focus:outline-none transition-colors"
            >
              <option value="">All Movies</option>
              {moviesList.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>

          {/* Screen Type Filter */}
          <div>
            <label className="block text-[11px] font-mono text-gray-400 mb-1 flex items-center gap-1">
              <Layers className="w-3 h-3 text-blue-400" /> Screen Format
            </label>
            <select
              value={screenType}
              onChange={(e) => setScreenType(e.target.value)}
              className="w-full text-xs rounded-xl bg-gray-950 border border-gray-800 text-white px-3 py-2 focus:border-cyan-500 focus:outline-none transition-colors"
            >
              {SCREEN_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* City Filter */}
          <div>
            <label className="block text-[11px] font-mono text-gray-400 mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-400" /> City
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full text-xs rounded-xl bg-gray-950 border border-gray-800 text-white px-3 py-2 focus:border-cyan-500 focus:outline-none transition-colors"
            >
              <option value="">All Cities</option>
              {citiesList.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Date Pickers (visible if custom selected) */}
          {datePreset === 'custom' ? (
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-[10px] font-mono text-gray-400 mb-1">Start</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-xs rounded-xl bg-gray-950 border border-gray-800 text-white px-2 py-1.5 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-mono text-gray-400 mb-1">End</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-xs rounded-xl bg-gray-950 border border-gray-800 text-white px-2 py-1.5 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-end pt-5 text-[11px] font-mono text-gray-500">
              Filters sync live
            </div>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Executive KPI Ribbon */}
      <KPIGrid kpis={overviewData.kpis} loading={loading} />

      {/* Automated Executive Insights Panel ⭐ */}
      <InsightsPanel insights={overviewData.insights} loading={loading} />

      {/* Flagship Chart Rows */}
      {/* Row 1: Revenue Intelligence & Occupancy Matrix Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart
          series={revenueData.series}
          metrics={revenueData.metrics}
          timeframe={revenueTimeframe}
          onTimeframeChange={handleTimeframeChange}
          loading={loading}
        />
        <OccupancyHeatmap
          matrix={occupancyData.heatmap}
          peakSlot={occupancyData.peakSlot}
          quietestSlot={occupancyData.quietestSlot}
          overall={occupancyData.overall}
          loading={loading}
        />
      </div>

      {/* Row 2: Movie Performance Ranking & Theater Screen Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MoviePerformanceChart movies={movieRankings} loading={loading} />
        <TheaterUtilizationChart
          screenFormats={theaterUtilization.screenFormats}
          loading={loading}
        />
      </div>

      {/* Row 3: Time Slot Demand, Entry Conversion Funnel & Refund Trend */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TimeSlotDemandChart timeslots={timeslotsData} loading={loading} />
        <EntryConversionChart conversion={conversionData} loading={loading} />
        <RefundTrendChart refunds={refundsData} loading={loading} />
      </div>

      {/* Export Report Modal */}
      <ReportExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        filters={computeQueryParams()}
      />
    </div>
  );
};

export default Analytics;
