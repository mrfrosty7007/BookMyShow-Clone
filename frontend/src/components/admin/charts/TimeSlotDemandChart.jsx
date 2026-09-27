import PropTypes from 'prop-types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Clock, Sun, Sunset, Moon, Sunrise } from 'lucide-react';

const formatCurrency = (val) => {
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
  return `₹${val}`;
};

const getSlotIcon = (slot) => {
  switch (slot) {
    case 'Morning':
      return <Sunrise className="w-4 h-4 text-amber-400" />;
    case 'Matinee':
      return <Sun className="w-4 h-4 text-yellow-400" />;
    case 'Evening':
      return <Sunset className="w-4 h-4 text-orange-400" />;
    case 'Night':
      return <Moon className="w-4 h-4 text-indigo-400" />;
    default:
      return <Clock className="w-4 h-4 text-cyan-400" />;
  }
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="rounded-xl bg-[#090d16] border border-amber-500/40 p-3.5 shadow-2xl backdrop-blur-md min-w-[200px]">
      <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-1.5 border-b border-gray-800 pb-1.5">
        {getSlotIcon(data.slot)}
        <span>{data.slot} ({data.label})</span>
      </div>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Total Bookings:</span>
          <span className="font-mono font-semibold text-white">{data.bookings} seats</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Occupancy:</span>
          <span className="font-mono font-bold text-amber-400">{data.occupancyPercent}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Revenue:</span>
          <span className="font-mono font-bold text-emerald-400">
            ₹{data.revenue?.toLocaleString('en-IN') || 0}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Shows Scheduled:</span>
          <span className="font-mono text-purple-300">{data.shows}</span>
        </div>
      </div>
    </div>
  );
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
};

export const TimeSlotDemandChart = ({ timeslots = [], loading = false }) => {
  return (
    <div className="rounded-2xl bg-[#0d1527]/90 backdrop-blur-md border border-gray-800 p-5 shadow-xl flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white tracking-wide">
              Time Slot Demand Curve
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
              Diurnal Windows
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Customer booking frequency and gross revenue comparison across time of day
          </p>
        </div>
      </div>

      {/* 4 Diurnal Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {timeslots.map((slot) => (
          <div
            key={slot.slot}
            className="rounded-xl bg-gray-900/50 border border-gray-800/80 p-2.5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-200 flex items-center gap-1.5">
                {getSlotIcon(slot.slot)}
                {slot.slot}
              </span>
              <span className="text-[10px] font-mono text-gray-400">
                {slot.occupancyPercent}% occ
              </span>
            </div>
            <div className="mt-1 flex items-baseline justify-between text-xs">
              <span className="font-mono font-bold text-emerald-400">
                ₹{slot.revenue >= 1000 ? `${(slot.revenue / 1000).toFixed(1)}k` : slot.revenue}
              </span>
              <span className="text-[10px] font-mono text-gray-400">
                {slot.bookings} tix
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Bar Chart comparing Bookings & Revenue */}
      <div className="h-[200px] w-full">
        {loading ? (
          <div className="h-full w-full flex items-center justify-center bg-gray-950/40 rounded-xl animate-pulse text-xs text-gray-500">
            Aggregating time-slot volume...
          </div>
        ) : timeslots.length === 0 ? (
          <div className="h-full w-full flex flex-col items-center justify-center bg-gray-950/20 rounded-xl border border-dashed border-gray-800 text-xs text-gray-500">
            <Clock className="w-8 h-8 text-gray-600 mb-1" />
            No time slot data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timeslots} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="slot" stroke="#6b7280" fontSize={11} tickLine={false} />
              <YAxis
                yAxisId="rev"
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
                tickFormatter={formatCurrency}
              />
              <YAxis
                yAxisId="tix"
                orientation="right"
                stroke="#f59e0b"
                fontSize={11}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ fontSize: '11px', paddingBottom: '6px' }}
              />
              <Bar
                yAxisId="rev"
                dataKey="revenue"
                name="Revenue"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
              <Bar
                yAxisId="tix"
                dataKey="bookings"
                name="Seats Booked"
                fill="#f59e0b"
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

TimeSlotDemandChart.propTypes = {
  timeslots: PropTypes.arrayOf(
    PropTypes.shape({
      slot: PropTypes.string.isRequired,
      label: PropTypes.string,
      bookings: PropTypes.number,
      revenue: PropTypes.number,
      capacity: PropTypes.number,
      shows: PropTypes.number,
      occupancyPercent: PropTypes.number,
    })
  ),
  loading: PropTypes.bool,
};

export default TimeSlotDemandChart;
