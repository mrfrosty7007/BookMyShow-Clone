import PropTypes from 'prop-types';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, IndianRupee, Calendar } from 'lucide-react';

const formatCurrency = (val) => {
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
  return `₹${val}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const gross = payload.find((p) => p.dataKey === 'revenue')?.value || 0;
  const net = payload.find((p) => p.dataKey === 'netRevenue')?.value || 0;
  const tickets = payload.find((p) => p.dataKey === 'ticketsSold')?.value || 0;
  const bookings = payload.find((p) => p.dataKey === 'bookingCount')?.value || 0;

  return (
    <div className="rounded-xl bg-[#090d16] border border-cyan-500/40 p-3.5 shadow-2xl backdrop-blur-md min-w-[200px]">
      <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 mb-2 border-b border-gray-800 pb-1.5">
        <Calendar className="w-3.5 h-3.5" />
        <span className="font-semibold">{label}</span>
      </div>
      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Gross Revenue:</span>
          <span className="font-mono font-bold text-emerald-400">₹{gross.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Net Revenue:</span>
          <span className="font-mono font-semibold text-cyan-300">₹{net.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Tickets Sold:</span>
          <span className="font-mono text-purple-300 font-medium">{tickets}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Transactions:</span>
          <span className="font-mono text-gray-300">{bookings}</span>
        </div>
      </div>
    </div>
  );
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  label: PropTypes.string,
};

export const RevenueChart = ({
  series = [],
  metrics = {},
  timeframe = 'daily',
  onTimeframeChange,
  loading = false,
}) => {
  const { grossRevenue = 0, averageTicketPrice = 0, revenueGrowthPercent = 0 } = metrics;

  return (
    <div className="rounded-2xl bg-[#0d1527]/90 backdrop-blur-md border border-gray-800 p-5 shadow-xl flex flex-col justify-between">
      {/* Chart Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white tracking-wide">
              Revenue Intelligence Curve
            </h3>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Gross box office trajectory with net margins and volume analytics
          </p>
        </div>

        {/* Timeframe selector pill buttons */}
        <div className="flex items-center gap-1 p-1 bg-gray-950/80 rounded-xl border border-gray-800 text-xs font-medium">
          {['daily', 'weekly', 'monthly'].map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => onTimeframeChange?.(tf)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all duration-200 ${
                timeframe === tf
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold shadow-sm shadow-cyan-500/20'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-3 gap-2 p-3 bg-gray-900/50 rounded-xl border border-gray-800/80 mb-4 text-xs font-mono">
        <div>
          <span className="text-gray-400 block text-[11px]">Period Gross</span>
          <span className="font-bold text-white text-sm">₹{grossRevenue.toLocaleString('en-IN')}</span>
        </div>
        <div>
          <span className="text-gray-400 block text-[11px]">Avg Ticket (ATP)</span>
          <span className="font-bold text-cyan-400 text-sm">₹{averageTicketPrice}</span>
        </div>
        <div>
          <span className="text-gray-400 block text-[11px]">Growth Velocity</span>
          <span
            className={`font-bold text-sm ${
              revenueGrowthPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {revenueGrowthPercent >= 0 ? '+' : ''}
            {revenueGrowthPercent}%
          </span>
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="h-[280px] w-full">
        {loading ? (
          <div className="h-full w-full flex items-center justify-center bg-gray-950/40 rounded-xl animate-pulse text-xs text-gray-500">
            Aggregating live time-series...
          </div>
        ) : !series || series.length === 0 ? (
          <div className="h-full w-full flex flex-col items-center justify-center bg-gray-950/20 rounded-xl border border-dashed border-gray-800 text-xs text-gray-500">
            <IndianRupee className="w-8 h-8 text-gray-600 mb-1" />
            No confirmed bookings recorded in this timeframe
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="netGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) => {
                  if (typeof val === 'string' && val.length > 5) {
                    return val.slice(5); // e.g. "09-27"
                  }
                  return val;
                }}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
                tickFormatter={formatCurrency}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Gross Revenue"
                stroke="#06b6d4"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#revenueGlow)"
              />
              <Area
                type="monotone"
                dataKey="netRevenue"
                name="Net Revenue"
                stroke="#10b981"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#netGlow)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

RevenueChart.propTypes = {
  series: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      revenue: PropTypes.number.isRequired,
      netRevenue: PropTypes.number,
      ticketsSold: PropTypes.number,
      bookingCount: PropTypes.number,
    })
  ),
  metrics: PropTypes.shape({
    grossRevenue: PropTypes.number,
    averageTicketPrice: PropTypes.number,
    revenueGrowthPercent: PropTypes.number,
  }),
  timeframe: PropTypes.string,
  onTimeframeChange: PropTypes.func,
  loading: PropTypes.bool,
};

export default RevenueChart;
