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
import { RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const count = payload.find((p) => p.dataKey === 'count')?.value || 0;
  const amount = payload.find((p) => p.dataKey === 'amount')?.value || 0;

  return (
    <div className="rounded-xl bg-[#090d16] border border-rose-500/40 p-3 shadow-xl backdrop-blur-md text-xs min-w-[170px]">
      <div className="text-gray-400 font-mono mb-1">{label}</div>
      <div className="flex justify-between items-center text-white">
        <span>Refunds:</span>
        <span className="font-mono font-bold text-rose-400">{count}</span>
      </div>
      <div className="flex justify-between items-center text-white">
        <span>Amount:</span>
        <span className="font-mono font-bold text-emerald-400">₹{amount.toLocaleString('en-IN')}</span>
      </div>
    </div>
  );
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  label: PropTypes.string,
};

export const RefundTrendChart = ({ refunds = {}, loading = false }) => {
  const {
    refundCount = 0,
    refundRatePercent = 0,
    reasons = [],
    timeline = [],
  } = refunds;

  return (
    <div className="rounded-2xl bg-[#0d1527]/90 backdrop-blur-md border border-gray-800 p-5 shadow-xl flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <RotateCcw className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white tracking-wide">
              Refund &amp; Cancellation Trend
            </h3>
            <span
              className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${
                refundRatePercent <= 3
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : refundRatePercent <= 6
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}
            >
              {refundRatePercent}% Rate
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Operational cancellation velocity and categorized reasons
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
          {refundRatePercent <= 5 ? (
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Stable Operations
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-rose-400">
              <AlertTriangle className="w-3.5 h-3.5" /> Elevated Refunds
            </span>
          )}
        </div>
      </div>

      {/* Refund Reasons Breakdown Mini-Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
        <div className="p-2.5 rounded-xl bg-gray-900/50 border border-gray-800/80 flex items-center justify-between text-xs">
          <span className="text-gray-400 font-mono">Total Refunds Processed</span>
          <span className="font-bold text-white font-mono text-sm">{refundCount}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-gray-900/50 border border-gray-800/80 flex items-center justify-between text-xs">
          <span className="text-gray-400 font-mono">Primary Reason</span>
          <span className="font-medium text-rose-300 truncate max-w-[150px]">
            {reasons[0]?.reason || 'Standard User Cancellation'}
          </span>
        </div>
      </div>

      {/* Timeline Chart */}
      <div className="h-[200px] w-full">
        {loading ? (
          <div className="h-full w-full flex items-center justify-center bg-gray-950/40 rounded-xl animate-pulse text-xs text-gray-500">
            Analyzing refund timeline...
          </div>
        ) : timeline.length === 0 ? (
          <div className="h-full w-full flex flex-col items-center justify-center bg-gray-950/20 rounded-xl border border-dashed border-gray-800 text-xs text-gray-500">
            <ShieldCheck className="w-8 h-8 text-emerald-500/60 mb-1" />
            Zero cancellations recorded in this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="refundGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="date" stroke="#6b7280" fontSize={11} tickLine={false} />
              <YAxis stroke="#6b7280" fontSize={11} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                name="Refunds"
                stroke="#f43f5e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#refundGlow)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

RefundTrendChart.propTypes = {
  refunds: PropTypes.shape({
    refundCount: PropTypes.number,
    refundRatePercent: PropTypes.number,
    reasons: PropTypes.arrayOf(
      PropTypes.shape({
        reason: PropTypes.string,
        count: PropTypes.number,
        amount: PropTypes.number,
      })
    ),
    timeline: PropTypes.arrayOf(
      PropTypes.shape({
        date: PropTypes.string,
        count: PropTypes.number,
        amount: PropTypes.number,
      })
    ),
  }),
  loading: PropTypes.bool,
};

export default RefundTrendChart;
