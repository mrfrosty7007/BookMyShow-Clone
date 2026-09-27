import { Armchair, Sparkles, Crown, Accessibility, Layers } from 'lucide-react';

/**
 * CapacitySummary Component
 * Real-time capacity calculator and category distribution widget for cinema screens.
 */
export const CapacitySummary = ({ stats, className = '' }) => {
  if (!stats) return null;

  const {
    totalRows = 0,
    standard = 0,
    premium = 0,
    vip = 0,
    accessible = 0,
    totalCapacity = 0,
  } = stats;

  return (
    <div
      className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 p-3 rounded-2xl bg-gray-950/80 border border-gray-800/80 backdrop-blur-md ${className}`}
    >
      {/* Total Capacity Metric */}
      <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0">
          <Armchair className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-400/90 leading-none">
            Total Seats
          </p>
          <p className="text-base font-black text-cyan-200 mt-1">{totalCapacity}</p>
        </div>
      </div>

      {/* Total Rows Metric */}
      <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-900/60 border border-gray-800/80">
        <div className="w-8 h-8 rounded-lg bg-gray-800/80 border border-gray-700/60 text-gray-300 flex items-center justify-center flex-shrink-0">
          <Layers className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 leading-none">
            Total Rows
          </p>
          <p className="text-base font-black text-gray-200 mt-1">{totalRows}</p>
        </div>
      </div>

      {/* Standard Tier */}
      <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-900/60 border border-gray-800/80">
        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold">○</span>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 leading-none">
            Standard
          </p>
          <p className="text-base font-black text-gray-100 mt-1">{standard}</p>
        </div>
      </div>

      {/* Premium Tier */}
      <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/30">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 fill-amber-400/20" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90 leading-none">
            Premium (★)
          </p>
          <p className="text-base font-black text-amber-200 mt-1">{premium}</p>
        </div>
      </div>

      {/* VIP Tier */}
      <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/30">
        <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center flex-shrink-0">
          <Crown className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-purple-400/90 leading-none">
            VIP Recliner
          </p>
          <p className="text-base font-black text-purple-200 mt-1">{vip}</p>
        </div>
      </div>

      {/* Accessible / Wheelchair Tier */}
      <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center flex-shrink-0">
          <Accessibility className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/90 leading-none">
            Accessible (♿)
          </p>
          <p className="text-base font-black text-emerald-200 mt-1">{accessible}</p>
        </div>
      </div>
    </div>
  );
};

export default CapacitySummary;
