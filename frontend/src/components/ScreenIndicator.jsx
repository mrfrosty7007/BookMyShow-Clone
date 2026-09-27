/**
 * ScreenIndicator Component
 * Renders a futuristic curved cinema screen with subtle perspective and glowing projector ambient light.
 */
export const ScreenIndicator = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center my-6 sm:my-8 select-none">
      {/* Ambient Projector Beam Effect */}
      <div className="relative w-full max-w-xl mx-auto flex flex-col items-center">
        {/* Curved Screen Arc */}
        <div className="relative w-full h-10 overflow-hidden flex items-end justify-center">
          {/* Curved SVG screen arc with glowing border */}
          <svg
            viewBox="0 0 500 40"
            className="w-full h-10 text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.65)]"
            preserveAspectRatio="none"
          >
            <path
              d="M 10 35 Q 250 5 490 35"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>

          {/* Diffused projector light beam fading towards auditorium */}
          <div className="absolute inset-x-8 top-2 h-14 bg-gradient-to-b from-cyan-400/25 via-cyan-500/10 to-transparent blur-md pointer-events-none rounded-t-full" />
        </div>

        {/* Screen Label */}
        <div className="relative z-10 flex items-center gap-2 mt-1">
          <span className="h-[1px] w-8 sm:w-12 bg-gradient-to-r from-transparent to-cyan-500/40" />
          <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.25em] text-cyan-300/80 drop-shadow-sm">
            All Eyes This Way • Screen
          </span>
          <span className="h-[1px] w-8 sm:w-12 bg-gradient-to-l from-transparent to-cyan-500/40" />
        </div>
      </div>
    </div>
  );
};

export default ScreenIndicator;
