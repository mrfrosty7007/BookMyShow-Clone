import PropTypes from 'prop-types';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Film, Trophy } from 'lucide-react';

const formatCurrency = (val) => {
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
  return `₹${val}`;
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const movie = payload[0]?.payload;
  if (!movie) return null;

  return (
    <div className="rounded-xl bg-[#090d16] border border-purple-500/40 p-3.5 shadow-2xl backdrop-blur-md min-w-[220px]">
      <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-1.5 border-b border-gray-800 pb-1.5">
        <Film className="w-3.5 h-3.5 text-purple-400" />
        <span className="truncate max-w-[180px]">{movie.title}</span>
      </div>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Gross Box Office:</span>
          <span className="font-mono font-bold text-emerald-400">
            ₹{movie.revenue?.toLocaleString('en-IN') || 0}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Tickets Sold:</span>
          <span className="font-mono font-semibold text-cyan-300">
            {movie.ticketsSold?.toLocaleString('en-IN') || 0}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Average Occupancy:</span>
          <span className="font-mono font-bold text-purple-400">
            {movie.averageOccupancy || 0}%
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Scheduled Shows:</span>
          <span className="font-mono text-gray-300">{movie.showCount || 0}</span>
        </div>
        {movie.genre && (
          <div className="pt-1 text-[11px] text-gray-500">
            Genre: <span className="text-gray-300">{Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre}</span>
          </div>
        )}
      </div>
    </div>
  );
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
};

export const MoviePerformanceChart = ({ movies = [], loading = false }) => {
  // Top 10 movies
  const chartData = movies.slice(0, 10).map((m, index) => ({
    ...m,
    rank: index + 1,
    shortTitle: m.title.length > 12 ? `${m.title.substring(0, 10)}...` : m.title,
  }));

  return (
    <div className="rounded-2xl bg-[#0d1527]/90 backdrop-blur-md border border-gray-800 p-5 shadow-xl flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Trophy className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white tracking-wide">
              Movie Performance Ranking
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              Top 10
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Gross revenue generated vs seat occupancy rates by cinematic feature
          </p>
        </div>
      </div>

      <div className="h-[280px] w-full">
        {loading ? (
          <div className="h-full w-full flex items-center justify-center bg-gray-950/40 rounded-xl animate-pulse text-xs text-gray-500">
            Compiling box office rankings...
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-full w-full flex flex-col items-center justify-center bg-gray-950/20 rounded-xl border border-dashed border-gray-800 text-xs text-gray-500">
            <Film className="w-8 h-8 text-gray-600 mb-1" />
            No movie performance data for this range
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
              <defs>
                <linearGradient id="barGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis
                dataKey="shortTitle"
                stroke="#6b7280"
                fontSize={10}
                tickLine={false}
                angle={-20}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                yAxisId="left"
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
                tickFormatter={formatCurrency}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#a855f7"
                fontSize={11}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ fontSize: '11px', paddingBottom: '6px' }}
              />
              <Bar
                yAxisId="left"
                dataKey="revenue"
                name="Revenue"
                fill="url(#barGlow)"
                radius={[6, 6, 0, 0]}
                barSize={24}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="averageOccupancy"
                name="Occupancy %"
                stroke="#c084fc"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#c084fc', stroke: '#1e1b4b', strokeWidth: 1 }}
                activeDot={{ r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

MoviePerformanceChart.propTypes = {
  movies: PropTypes.arrayOf(
    PropTypes.shape({
      movieId: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      title: PropTypes.string.isRequired,
      revenue: PropTypes.number,
      ticketsSold: PropTypes.number,
      averageOccupancy: PropTypes.number,
      showCount: PropTypes.number,
      genre: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    })
  ),
  loading: PropTypes.bool,
};

export default MoviePerformanceChart;
