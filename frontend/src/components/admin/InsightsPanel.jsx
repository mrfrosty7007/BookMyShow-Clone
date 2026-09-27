import PropTypes from 'prop-types';
import {
  Lightbulb,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Film,
  Layers,
} from 'lucide-react';

export const InsightsPanel = ({ insights = [], loading = false }) => {
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Formats':
        return <Layers className="w-4 h-4 text-cyan-400" />;
      case 'Scheduling':
        return <Flame className="w-4 h-4 text-amber-400" />;
      case 'Box Office':
        return <Film className="w-4 h-4 text-purple-400" />;
      case 'Operations':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'Revenue':
        return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      default:
        return <Lightbulb className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getTypeStyle = (type) => {
    switch (type) {
      case 'growth':
      case 'positive':
        return 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300';
      case 'peak':
        return 'border-amber-500/30 bg-amber-950/20 text-amber-300';
      case 'warning':
        return 'border-rose-500/30 bg-rose-950/20 text-rose-300';
      default:
        return 'border-cyan-500/30 bg-cyan-950/20 text-cyan-300';
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl bg-[#0d1527]/90 border border-gray-800 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-cyan-400 animate-spin" />
          <div className="h-5 w-44 bg-gray-800 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-lg bg-gray-900/60 border border-gray-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!insights || insights.length === 0) {
    return (
      <div className="rounded-xl bg-[#0d1527]/90 border border-gray-800/80 p-5 text-center text-gray-400 text-sm">
        <Lightbulb className="w-6 h-6 text-gray-500 mx-auto mb-2" />
        No automated insights identified for the current filter criteria.
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#0d1527]/90 backdrop-blur-md border border-gray-800/90 p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              Automated Executive Insights
              <span className="text-xs font-mono font-normal text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded-full border border-cyan-500/30">
                {insights.length} Signals
              </span>
            </h2>
            <p className="text-xs text-gray-400">
              Heuristic intelligence synthesized in real-time from active bookings &amp; schedule performance
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {insights.map((insight, idx) => (
          <div
            key={idx}
            className={`relative rounded-xl border p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${getTypeStyle(
              insight.type
            )} flex flex-col justify-between`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-300">
                  {getCategoryIcon(insight.category)}
                  {insight.category}
                </span>

                {insight.metric && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-black/40 border border-white/10 font-bold">
                    {insight.metric}
                  </span>
                )}
              </div>

              <p className="text-sm font-medium text-gray-100 leading-snug">
                {insight.text}
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400 font-mono">
              <span>Dynamic Intelligence</span>
              {insight.type === 'warning' ? (
                <span className="inline-flex items-center gap-1 text-rose-400">
                  <AlertTriangle className="w-3 h-3" /> Requires Focus
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-emerald-400">
                  <TrendingUp className="w-3 h-3" /> Positive Driver
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

InsightsPanel.propTypes = {
  insights: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string,
      category: PropTypes.string,
      text: PropTypes.string.isRequired,
      metric: PropTypes.string,
    })
  ),
  loading: PropTypes.bool,
};

export default InsightsPanel;
