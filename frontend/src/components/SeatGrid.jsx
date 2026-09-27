import { useMemo } from 'react';
import { Check, X, Lock } from 'lucide-react';

/**
 * Section definitions and seat tier mapping
 */
const SECTIONS = [
  {
    name: 'VIP',
    rows: ['A', 'B'],
    defaultPrice: 400,
    accent: 'text-purple-400 border-purple-500/30 bg-purple-950/20',
  },
  {
    name: 'Premium',
    rows: ['C', 'D', 'E', 'F'],
    defaultPrice: 300,
    accent: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/20',
  },
  {
    name: 'Regular',
    rows: ['G', 'H', 'I', 'J'],
    defaultPrice: 200,
    accent: 'text-gray-400 border-gray-700/50 bg-gray-900/30',
  },
];

const COLUMNS_COUNT = 12;

/**
 * SeatGrid Component - Phase 3.2 Real-time Enabled
 * Renders categorized auditorium with 10 rows (A-J) and 12 columns per row.
 * Displays 4 states: Available, Selected (You), Locked (Others), Booked.
 */
export const SeatGrid = ({
  categories,
  bookedSeats = [],
  selectedSeats = [],
  lockedByOthers = [],
  onToggleSeat,
  maxSeats = 10,
  onMaxLimitReached,
}) => {
  // Fast lookup set for permanently booked seats
  const bookedSet = useMemo(() => new Set(bookedSeats), [bookedSeats]);

  // Fast lookup set for seats locked by other users
  const lockedByOthersSet = useMemo(() => new Set(lockedByOthers), [lockedByOthers]);

  // Fast lookup map for seats selected by current user
  const selectedMap = useMemo(() => {
    const map = new Map();
    selectedSeats.forEach((seat) => {
      map.set(seat.id, seat);
    });
    return map;
  }, [selectedSeats]);

  // Resolve price and section for row
  const getRowDetails = (row) => {
    for (const section of SECTIONS) {
      if (section.rows.includes(row)) {
        const categoryConfig = categories?.[section.name];
        const price = categoryConfig?.price || section.defaultPrice;
        return { sectionName: section.name, price, accent: section.accent };
      }
    }
    return { sectionName: 'Regular', price: 200, accent: 'text-gray-400' };
  };

  const handleSeatClick = (seat) => {
    if (bookedSet.has(seat.id) || lockedByOthersSet.has(seat.id)) return;

    const isCurrentlySelected = selectedMap.has(seat.id);

    if (!isCurrentlySelected && selectedSeats.length >= maxSeats) {
      if (onMaxLimitReached) {
        onMaxLimitReached(maxSeats);
      }
      return;
    }

    onToggleSeat(seat);
  };

  return (
    <div className="w-full select-none">
      {/* Scrollable Container for Mobile Responsiveness */}
      <div className="overflow-x-auto pb-4 pt-2 -mx-2 px-2 flex justify-center no-scrollbar">
        <div className="min-w-[620px] max-w-full flex flex-col items-center gap-6">
          {SECTIONS.map((section) => {
            const sectionPrice = categories?.[section.name]?.price || section.defaultPrice;

            return (
              <div key={section.name} className="w-full flex flex-col items-center gap-2.5">
                {/* Section Header */}
                <div
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs font-bold tracking-wider uppercase mb-1 shadow-sm backdrop-blur-sm ${section.accent}`}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-current" />
                    {section.name} Tier
                  </span>
                  <span className="text-white font-extrabold">₹{sectionPrice}</span>
                </div>

                {/* Rows in this section */}
                <div className="w-full flex flex-col items-center gap-2">
                  {section.rows.map((row) => {
                    const { sectionName, price } = getRowDetails(row);

                    return (
                      <div key={row} className="flex items-center justify-center gap-1.5 sm:gap-2">
                        {/* Left Row Identifier */}
                        <div className="w-5 sm:w-6 text-center text-xs font-black text-gray-500">
                          {row}
                        </div>

                        {/* Seats in Row (1 to 12) with central aisle after 6 */}
                        <div className="flex items-center gap-1 sm:gap-1.5">
                          {Array.from({ length: COLUMNS_COUNT }, (_, i) => {
                            const colNum = i + 1;
                            const seatId = `${row}${colNum}`;
                            const isBooked = bookedSet.has(seatId);
                            const isLockedByOther = lockedByOthersSet.has(seatId);
                            const isSelected = selectedMap.has(seatId);
                            const isAisleGap = colNum === 6;

                            const seatData = {
                              id: seatId,
                              row,
                              col: colNum,
                              category: sectionName,
                              price,
                            };

                            let stateClasses =
                              'bg-gray-800/90 text-gray-300 border-gray-700/80 hover:border-cyan-400 hover:text-cyan-300 hover:shadow-[0_0_8px_rgba(6,182,212,0.3)]';
                            let titleText = `Seat ${seatId} (${sectionName} - ₹${price}) - Available`;

                            if (isBooked) {
                              stateClasses =
                                'bg-red-950/40 text-red-500/50 border-red-900/40 cursor-not-allowed opacity-60';
                              titleText = `Seat ${seatId} - Booked`;
                            } else if (isLockedByOther) {
                              stateClasses =
                                'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.3)] animate-pulse cursor-not-allowed';
                              titleText = `Seat ${seatId} - Temporarily locked by another user`;
                            } else if (isSelected) {
                              stateClasses =
                                'bg-cyan-400 text-gray-950 font-black border-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.65)] scale-105';
                              titleText = `Seat ${seatId} - Selected by You (Locked for 5m)`;
                            }

                            const isDisabled = isBooked || isLockedByOther;

                            return (
                              <div
                                key={seatId}
                                className={`flex items-center ${isAisleGap ? 'mr-3 sm:mr-6' : ''}`}
                              >
                                <button
                                  type="button"
                                  disabled={isDisabled}
                                  onClick={() => handleSeatClick(seatData)}
                                  title={titleText}
                                  aria-label={`Seat ${seatId}, ${sectionName} tier, ₹${price}, ${
                                    isBooked
                                      ? 'Booked'
                                      : isLockedByOther
                                        ? 'Locked by another user'
                                        : isSelected
                                          ? 'Selected by You'
                                          : 'Available'
                                  }`}
                                  aria-pressed={isSelected}
                                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-t-lg rounded-b-sm border text-[11px] font-bold flex items-center justify-center transition-all duration-150 transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${stateClasses}`}
                                >
                                  {isBooked ? (
                                    <X className="w-3 h-3 stroke-[2.5]" />
                                  ) : isLockedByOther ? (
                                    <Lock className="w-3 h-3 text-amber-400 animate-pulse" />
                                  ) : isSelected ? (
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  ) : (
                                    colNum
                                  )}
                                </button>
                              </div>
                            );
                          })}
                        </div>

                        {/* Right Row Identifier */}
                        <div className="w-5 sm:w-6 text-center text-xs font-black text-gray-500">
                          {row}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SeatGrid;
