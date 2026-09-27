import PropTypes from 'prop-types';
import {
  FileDown,
  RefreshCw,
  Sparkles,
  Calendar,
  Building,
  Film,
  Zap,
} from 'lucide-react';

export const ExecutiveSummary = ({
  filters = {},
  topMovie = null,
  activeMultiplex = null,
  onExportClick,
  onRefresh,
  loading = false,
}) => {
  const getFilterSummary = () => {
    if (filters.startDate && filters.endDate) {
      return `${filters.startDate} to ${filters.endDate}`;
    }
    if (filters.timeframe === '7d') return 'Last 7 Days';
    if (filters.timeframe === '30d') return 'Last 30 Days';
    if (filters.timeframe === '90d') return 'Last Quarter (90D)';
    return 'All-Time Historical Range';
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0d1527] via-[#111e38] to-[#0a1222] border border-cyan-500/20 p-6 shadow-2xl shadow-cyan-950/20">
      {/* Decorative ambient glows */}
      <div className="absolute top-0 right-1/4 w-96 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-64 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Zap className="w-3 h-3 text-cyan-400" />
              Executive BI Engine Phase 4.6
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Atlas Aggregations
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Executive Analytics &amp; Intelligence
            <Sparkles className="w-6 h-6 text-cyan-400 hidden sm:inline" />
          </h1>
          <p className="text-gray-400 text-sm mt-1 max-w-2xl">
            Real-time multi-dimensional telemetry spanning gross revenue, theater utilization,
            time slot demand curves, and automated business insights.
          </p>

          {/* Quick status chips */}
          <div className="flex flex-wrap items-center gap-2.5 mt-4 text-xs font-medium text-gray-300">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-900/80 border border-gray-800 text-gray-300">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>Range:</span>
              <strong className="text-white font-mono">{getFilterSummary()}</strong>
            </span>

            {topMovie && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-900/80 border border-gray-800 text-gray-300">
                <Film className="w-3.5 h-3.5 text-purple-400" />
                <span>Top Grosser:</span>
                <strong className="text-white">{topMovie.title}</strong>
              </span>
            )}

            {activeMultiplex && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-900/80 border border-gray-800 text-gray-300">
                <Building className="w-3.5 h-3.5 text-amber-400" />
                <span>Focus Theater:</span>
                <strong className="text-white">{activeMultiplex}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Action button cluster */}
        <div className="flex items-center gap-3 w-full sm:w-auto self-end lg:self-center">
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900/90 hover:bg-gray-800 border border-gray-700 text-gray-200 text-sm font-medium transition-all duration-200 disabled:opacity-50"
            title="Refresh aggregations"
          >
            <RefreshCw className={`w-4 h-4 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={onExportClick}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-semibold shadow-lg shadow-cyan-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <FileDown className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};

ExecutiveSummary.propTypes = {
  filters: PropTypes.object,
  topMovie: PropTypes.shape({
    title: PropTypes.string,
  }),
  activeMultiplex: PropTypes.string,
  onExportClick: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default ExecutiveSummary;
