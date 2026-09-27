import { Check, X, Sparkles, Lock } from 'lucide-react';

/**
 * SeatLegend Component
 * Displays visual status keys (Available, Selected, Locked, Booked)
 * and cinema tier pricing tags (VIP, Premium, Regular)
 */
export const SeatLegend = ({ categories }) => {
  const vipPrice = categories?.VIP?.price || 400;
  const premiumPrice = categories?.Premium?.price || 300;
  const regularPrice = categories?.Regular?.price || 200;

  return (
    <div className="w-full flex flex-col items-center gap-4 py-4 px-3 sm:px-6 rounded-2xl bg-gray-900/60 border border-gray-800/80 backdrop-blur-md">
      {/* 1. Seat Status Indicators */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-semibold">
        {/* Available */}
        <div className="flex items-center gap-2 text-gray-300">
          <div className="w-5 h-5 rounded-t-lg rounded-b-sm bg-gray-800 border border-gray-600 shadow-sm" />
          <span>Available</span>
        </div>

        {/* Selected (You) */}
        <div className="flex items-center gap-2 text-cyan-300">
          <div className="w-5 h-5 rounded-t-lg rounded-b-sm bg-cyan-400 border border-cyan-300 shadow-md shadow-cyan-400/50 flex items-center justify-center text-gray-950 font-bold">
            <Check className="w-3 h-3 stroke-[3]" />
          </div>
          <span>Selected (You)</span>
        </div>

        {/* Locked (Others) */}
        <div className="flex items-center gap-2 text-amber-300">
          <div className="w-5 h-5 rounded-t-lg rounded-b-sm bg-amber-500/20 border border-amber-500/60 shadow-sm shadow-amber-500/30 flex items-center justify-center text-amber-400 animate-pulse">
            <Lock className="w-2.5 h-2.5" />
          </div>
          <span>Locked (Others)</span>
        </div>

        {/* Booked */}
        <div className="flex items-center gap-2 text-gray-400">
          <div className="w-5 h-5 rounded-t-lg rounded-b-sm bg-red-950/60 border border-red-800/60 flex items-center justify-center text-red-400">
            <X className="w-3 h-3 stroke-[2.5]" />
          </div>
          <span>Booked</span>
        </div>
      </div>

      <div className="w-full max-w-md h-[1px] bg-gray-800/80" />

      {/* 2. Tier Categorized Pricing Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-xs">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/40 border border-purple-800/60 text-purple-300">
          <Sparkles className="w-3 h-3 text-purple-400" />
          <span className="font-bold">VIP (A-B)</span>
          <span className="text-gray-400 font-normal">•</span>
          <span className="font-extrabold text-white">₹{vipPrice}</span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/60 text-cyan-300">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span className="font-bold">Premium (C-F)</span>
          <span className="text-gray-400 font-normal">•</span>
          <span className="font-extrabold text-white">₹{premiumPrice}</span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-800/80 border border-gray-700/80 text-gray-300">
          <span className="w-2 h-2 rounded-full bg-gray-400" />
          <span className="font-bold">Regular (G-J)</span>
          <span className="text-gray-400 font-normal">•</span>
          <span className="font-extrabold text-white">₹{regularPrice}</span>
        </div>
      </div>
    </div>
  );
};

export default SeatLegend;
