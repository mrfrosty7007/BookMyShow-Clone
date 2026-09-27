import PropTypes from 'prop-types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { Building2, Layers } from 'lucide-react';

const FORMAT_COLORS = {
  IMAX: '#06b6d4', // Cyan
  'Dolby Atmos': '#a855f7', // Purple
  Standard: '#3b82f6', // Blue
  'Gold Class': '#f59e0b', // Amber
  '4DX': '#ec4899', // Pink
  ScreenX: '#10b981', // Emerald
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="rounded-xl bg-[#090d16] border border-cyan-500/40 p-3.5 shadow-2xl backdrop-blur-md min-w-[200px]">
      <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-1.5 border-b border-gray-800 pb-1.5">
        <Layers className="w-3.5 h-3.5 text-cyan-400" />
        <span>{data.screenType} Format</span>
      </div>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Occupancy:</span>
          <span className="font-mono font-bold text-cyan-300">{data.occupancyPercent}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Total Booked Seats:</span>
          <span className="font-mono text-white">{data.totalBooked}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Total Capacity:</span>
          <span className="font-mono text-gray-400">{data.totalCapacity}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Active Shows:</span>
          <span className="font-mono text-purple-300">{data.showCount}</span>
        </div>
        <div className="flex justify-between items-center pt-1 border-t border-gray-800">
          <span className="text-gray-400">Estimated Revenue:</span>
          <span className="font-mono font-bold text-emerald-400">
            ₹{data.estimatedRevenue?.toLocaleString('en-IN') || 0}
          </span>
        </div>
      </div>
    </div>
  );
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
};

export const TheaterUtilizationChart = ({ screenFormats = [], loading = false }) => {
  return (
    <div className="rounded-2xl bg-[#0d1527]/90 backdrop-blur-md border border-gray-800 p-5 shadow-xl flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <Building2 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white tracking-wide">
              Theater &amp; Screen Format Utilization
            </h3>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Occupancy percentages and capacity efficiency across multiplex screen types
          </p>
        </div>
      </div>

      {/* Screen Format Cards Mini-Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {screenFormats.slice(0, 4).map((fmt) => (
          <div
            key={fmt.screenType}
            className="rounded-xl bg-gray-900/50 border border-gray-800/80 p-2.5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-gray-300 truncate">
                {fmt.screenType}
              </span>
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: FORMAT_COLORS[fmt.screenType] || '#3b82f6' }}
              />
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="font-mono font-bold text-white text-sm">
                {fmt.occupancyPercent}%
              </span>
              <span className="text-[10px] font-mono text-gray-500">
                {fmt.showCount} shows
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Bar Chart comparing Screen Formats Occupancy */}
      <div className="h-[200px] w-full">
        {loading ? (
          <div className="h-full w-full flex items-center justify-center bg-gray-950/40 rounded-xl animate-pulse text-xs text-gray-500">
            Analyzing screen formats...
          </div>
        ) : screenFormats.length === 0 ? (
          <div className="h-full w-full flex flex-col items-center justify-center bg-gray-950/20 rounded-xl border border-dashed border-gray-800 text-xs text-gray-500">
            <Layers className="w-8 h-8 text-gray-600 mb-1" />
            No screen format data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={screenFormats}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              layout="horizontal"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="screenType" stroke="#6b7280" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="occupancyPercent" name="Occupancy %" radius={[6, 6, 0, 0]}>
                {screenFormats.map((entry) => (
                  <Cell
                    key={`cell-${entry.screenType}`}
                    fill={FORMAT_COLORS[entry.screenType] || '#3b82f6'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

TheaterUtilizationChart.propTypes = {
  screenFormats: PropTypes.arrayOf(
    PropTypes.shape({
      screenType: PropTypes.string.isRequired,
      showCount: PropTypes.number,
      totalCapacity: PropTypes.number,
      totalBooked: PropTypes.number,
      occupancyPercent: PropTypes.number,
      estimatedRevenue: PropTypes.number,
    })
  ),
  loading: PropTypes.bool,
};

export default TheaterUtilizationChart;
