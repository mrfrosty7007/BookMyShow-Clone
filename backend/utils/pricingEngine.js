/**
 * Dynamic Pricing Engine for BookMyShow Clone (Phase 4.4)
 * Calculates dynamic pricing across Time Slots, Screen Types, and Seat Tiers.
 */

export const TIME_SLOT_MULTIPLIERS = {
  Morning: {
    multiplier: 0.8,
    label: 'Morning (Before 12:00 PM)',
    badge: '0.8x',
  },
  Matinee: {
    multiplier: 1.0,
    label: 'Matinee (12:00 PM – 4:59 PM)',
    badge: '1.0x',
  },
  Evening: {
    multiplier: 1.2,
    label: 'Evening (5:00 PM – 8:59 PM)',
    badge: '1.2x',
  },
  Night: {
    multiplier: 1.3,
    label: 'Night (9:00 PM Onwards)',
    badge: '1.3x',
  },
};

export const SCREEN_TYPE_MULTIPLIERS = {
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

export const SEAT_TIER_MULTIPLIERS = {
  Standard: 1.0,
  Premium: 1.25,
  VIP: 1.5,
  Accessible: 1.0,
};

/**
 * Determines Time Slot category and multiplier from a Date object or hour
 * @param {Date|string} dateOrTime
 * @returns {{ slot: string, multiplier: number }}
 */
export const getTimeSlotInfo = (dateOrTime) => {
  const date = dateOrTime instanceof Date ? dateOrTime : new Date(dateOrTime);
  const hour = date.getHours();

  if (hour < 12) {
    return { slot: 'Morning', multiplier: TIME_SLOT_MULTIPLIERS.Morning.multiplier };
  } else if (hour < 17) {
    return { slot: 'Matinee', multiplier: TIME_SLOT_MULTIPLIERS.Matinee.multiplier };
  } else if (hour < 21) {
    return { slot: 'Evening', multiplier: TIME_SLOT_MULTIPLIERS.Evening.multiplier };
  } else {
    return { slot: 'Night', multiplier: TIME_SLOT_MULTIPLIERS.Night.multiplier };
  }
};

/**
 * Calculates complete dynamic pricing breakdown for a show
 *
 * Example:
 * Base: ₹200, Evening: 1.2, IMAX: 1.4, VIP: 1.5 => Final VIP: ₹504
 *
 * @param {number} basePrice
 * @param {Date|string} startTime
 * @param {string} screenType
 * @returns {object} pricingSnapshot
 */
export const calculateShowPricing = (
  basePrice = 200,
  startTime = new Date(),
  screenType = 'Standard'
) => {
  const base = Number(basePrice) > 0 ? Number(basePrice) : 200;
  const timeSlot = getTimeSlotInfo(startTime);
  const screenMultiplier = SCREEN_TYPE_MULTIPLIERS[screenType] || 1.0;

  // Combined multiplier for screen and time of day
  const slotMultiplier = timeSlot.multiplier;
  const combinedBase = base * slotMultiplier * screenMultiplier;

  const tierPrices = {
    Standard: Math.round(combinedBase * SEAT_TIER_MULTIPLIERS.Standard),
    Premium: Math.round(combinedBase * SEAT_TIER_MULTIPLIERS.Premium),
    VIP: Math.round(combinedBase * SEAT_TIER_MULTIPLIERS.VIP),
    Accessible: Math.round(combinedBase * SEAT_TIER_MULTIPLIERS.Accessible),
  };

  return {
    basePrice: base,
    timeSlot: timeSlot.slot,
    timeMultiplier: slotMultiplier,
    screenType: screenType || 'Standard',
    screenMultiplier,
    tierPrices,
    finalBasePrice: tierPrices.Standard,
  };
};

export default {
  TIME_SLOT_MULTIPLIERS,
  SCREEN_TYPE_MULTIPLIERS,
  SEAT_TIER_MULTIPLIERS,
  getTimeSlotInfo,
  calculateShowPricing,
};
