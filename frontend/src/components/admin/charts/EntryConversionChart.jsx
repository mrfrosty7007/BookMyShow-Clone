import PropTypes from 'prop-types';
import { CheckCircle2, Ticket, QrCode, ArrowDown } from 'lucide-react';

export const EntryConversionChart = ({ conversion = {}, loading = false }) => {
  const {
    stages = [],
    admissionConversionRate = 0,
    paymentConversionRate = 100,
    totalCreated = 0,
    paidConfirmed = 0,
    checkedIn = 0,
  } = conversion;

  const funnelStages = stages.length > 0
    ? stages
    : [
        { name: 'Booked', count: totalCreated, conversionRate: 100, dropoff: 0 },
        {
          name: 'Paid & Confirmed',
          count: paidConfirmed,
          conversionRate: paymentConversionRate,
          dropoff: Math.max(0, totalCreated - paidConfirmed),
        },
        {
          name: 'Gate Checked-In',
          count: checkedIn,
          conversionRate: admissionConversionRate,
          dropoff: Math.max(0, paidConfirmed - checkedIn),
        },
      ];

  const getStageIcon = (name) => {
    if (name.includes('Booked')) return <Ticket className="w-4 h-4 text-cyan-400" />;
    if (name.includes('Paid')) return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    return <QrCode className="w-4 h-4 text-purple-400" />;
  };

  const getProgressColor = (name) => {
    if (name.includes('Booked')) return 'from-cyan-500 to-blue-500';
    if (name.includes('Paid')) return 'from-blue-500 to-indigo-500';
    return 'from-emerald-500 to-teal-400';
  };

  return (
    <div className="rounded-2xl bg-[#0d1527]/90 backdrop-blur-md border border-gray-800 p-5 shadow-xl flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white tracking-wide">
              Entry &amp; Conversion Funnel
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              {admissionConversionRate}% Check-In
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Customer transition flow from seat reservation to physical auditorium gate admission
          </p>
        </div>

        <div className="text-right text-xs font-mono">
          <span className="text-gray-400">Formula: </span>
          <span className="text-cyan-400 font-bold">Checked-In / Confirmed</span>
        </div>
      </div>

      {loading ? (
        <div className="h-48 flex items-center justify-center bg-gray-950/40 rounded-xl animate-pulse text-xs text-gray-500">
          Calculating conversion telemetry...
        </div>
      ) : (
        <div className="space-y-3.5 my-auto py-2">
          {funnelStages.map((stage, idx) => {
            const widthPct = Math.max(12, Math.min(100, stage.conversionRate || 100));
            return (
              <div key={stage.name} className="relative">
                {/* Connector arrow between stages */}
                {idx > 0 && (
                  <div className="flex items-center justify-center my-1">
                    <ArrowDown className="w-3.5 h-3.5 text-gray-600 animate-bounce" />
                    {stage.dropoff > 0 && (
                      <span className="text-[10px] font-mono text-rose-400 ml-1.5">
                        -{stage.dropoff} drop-off
                      </span>
                    )}
                  </div>
                )}

                <div className="rounded-xl bg-gray-900/60 border border-gray-800 p-3 hover:border-gray-700 transition-all duration-200">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-gray-200 flex items-center gap-2">
                      {getStageIcon(stage.name)}
                      {stage.name}
                    </span>
                    <div className="flex items-center gap-3 font-mono">
                      <span className="text-white font-bold">{stage.count} tickets</span>
                      <span className="text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30 text-[11px]">
                        {stage.conversionRate}%
                      </span>
                    </div>
                  </div>

                  {/* Visual Bar Indicator */}
                  <div className="w-full bg-gray-950 rounded-full h-2.5 overflow-hidden p-0.5 border border-gray-800">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(
                        stage.name
                      )} transition-all duration-500`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Note */}
      <div className="mt-4 pt-3 border-t border-gray-800/80 text-[11px] text-gray-400 flex items-center justify-between font-mono">
        <span>Cinema Gate Efficiency</span>
        <span className="text-emerald-400 font-semibold">
          {admissionConversionRate >= 80 ? 'Optimal Admission Speed' : 'Check Gate Scanner Operations'}
        </span>
      </div>
    </div>
  );
};

EntryConversionChart.propTypes = {
  conversion: PropTypes.shape({
    stages: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        count: PropTypes.number,
        conversionRate: PropTypes.number,
        dropoff: PropTypes.number,
      })
    ),
    admissionConversionRate: PropTypes.number,
    paymentConversionRate: PropTypes.number,
    totalCreated: PropTypes.number,
    paidConfirmed: PropTypes.number,
    checkedIn: PropTypes.number,
  }),
  loading: PropTypes.bool,
};

export default EntryConversionChart;
