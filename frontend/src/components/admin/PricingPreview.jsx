import PropTypes from 'prop-types';
import { Tag, Sparkles, Clock, MonitorPlay, Armchair } from 'lucide-react';

const TIME_SLOT_INFO = {
  Morning: { label: 'Morning (Before 12 PM)', mult: 0.8, color: 'text-amber-400 bg-amber-500/10' },
  Matinee: { label: 'Matinee (12 PM – 5 PM)', mult: 1.0, color: 'text-cyan-400 bg-cyan-500/10' },
  Evening: { label: 'Evening (5 PM – 9 PM)', mult: 1.2, color: 'text-purple-400 bg-purple-500/10' },
  Night: { label: 'Night (9 PM Onwards)', mult: 1.3, color: 'text-indigo-400 bg-indigo-500/10' },
};

const SCREEN_MULTIPLIERS = {
  Standard: 1.0,
  'Dolby Atmos': 1.2,
  IMAX: 1.4,
  'IMAX 3D': 1.4,
  GoldClass: 1.5,
  'Gold Class': 1.5,
  ScreenX: 1.3,
  '4DX': 1.6,
  Laser: 1.25,
  'ICE Immersive': 1.25,
};

/**
 * Helper to determine time slot from time string (e.g. "18:30") or Date
 */
const getTimeSlot = (timeVal) => {
  if (!timeVal) return 'Evening';
  let hour = 18;
  if (typeof timeVal === 'string' && timeVal.includes(':')) {
    const parts = timeVal.split(':');
    hour = parseInt(parts[0], 10);
  } else {
    const d = new Date(timeVal);
    if (!isNaN(d.getTime())) hour = d.getHours();
  }

  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Matinee';
  if (hour < 21) return 'Evening';
  return 'Night';
};

/**
 * PricingPreview Component
 * Displays real-time breakdown of dynamic pricing calculations for show scheduling
 */
export const PricingPreview = ({ basePrice = 200, time = '18:00', screenType = 'Standard' }) => {
  const base = Math.max(1, Number(basePrice) || 200);
  const slotName = getTimeSlot(time);
  const slotInfo = TIME_SLOT_INFO[slotName] || TIME_SLOT_INFO.Evening;
  const screenMult = SCREEN_MULTIPLIERS[screenType] || 1.0;

  const combinedBase = base * slotInfo.mult * screenMult;

  const standardPrice = Math.round(combinedBase * 1.0);
  const premiumPrice = Math.round(combinedBase * 1.25);
  const vipPrice = Math.round(combinedBase * 1.5);
  const accessiblePrice = Math.round(combinedBase * 1.0);

  return (
    <div className="rounded-xl border border-cyan-500/20 bg-slate-900/90 p-4 backdrop-blur-md shadow-lg shadow-cyan-500/5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-cyan-500/20 p-1.5 text-cyan-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold text-white">Dynamic Pricing Engine</span>
        </div>
        <span className="text-xs text-slate-400 flex items-center gap-1">
          Base: <span className="font-mono text-cyan-400 font-bold">₹{base}</span>
        </span>
      </div>

      {/* Multiplier Pills */}
      <div className="grid grid-cols-2 gap-2 my-3">
        <div className="flex items-center justify-between rounded-lg bg-slate-800/60 px-3 py-2 border border-slate-700/50">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>Time Slot</span>
          </div>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${slotInfo.color}`}>
            {slotName} ({slotInfo.mult}x)
          </span>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-slate-800/60 px-3 py-2 border border-slate-700/50">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <MonitorPlay className="h-3.5 w-3.5 text-slate-400" />
            <span>Screen Type</span>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">
            {screenType} ({screenMult}x)
          </span>
        </div>
      </div>

      {/* Tier Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        <div className="rounded-lg bg-slate-800/40 p-2.5 border border-slate-700/40 flex flex-col items-center text-center">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Armchair className="h-3 w-3 text-slate-400" /> Standard
          </span>
          <span className="mt-1 font-mono text-base font-bold text-slate-200">
            ₹{standardPrice}
          </span>
          <span className="text-[10px] text-slate-500">1.0x Base</span>
        </div>

        <div className="rounded-lg bg-purple-950/20 p-2.5 border border-purple-500/30 flex flex-col items-center text-center">
          <span className="text-[11px] text-purple-300 flex items-center gap-1">
            <Tag className="h-3 w-3 text-purple-400" /> Premium
          </span>
          <span className="mt-1 font-mono text-base font-bold text-purple-300">
            ₹{premiumPrice}
          </span>
          <span className="text-[10px] text-purple-400/70">+25% Tier</span>
        </div>

        <div className="rounded-lg bg-amber-950/20 p-2.5 border border-amber-500/30 flex flex-col items-center text-center">
          <span className="text-[11px] text-amber-300 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-400" /> VIP
          </span>
          <span className="mt-1 font-mono text-base font-bold text-amber-300">₹{vipPrice}</span>
          <span className="text-[10px] text-amber-400/70">+50% Tier</span>
        </div>

        <div className="rounded-lg bg-blue-950/20 p-2.5 border border-blue-500/30 flex flex-col items-center text-center">
          <span className="text-[11px] text-blue-300 flex items-center gap-1">♿ Accessible</span>
          <span className="mt-1 font-mono text-base font-bold text-blue-300">
            ₹{accessiblePrice}
          </span>
          <span className="text-[10px] text-blue-400/70">Standard Rate</span>
        </div>
      </div>
    </div>
  );
};

PricingPreview.propTypes = {
  basePrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  time: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  screenType: PropTypes.string,
};

export default PricingPreview;
