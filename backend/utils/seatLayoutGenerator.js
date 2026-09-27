/**
 * Dynamic Seat Layout Generator for BookMyShow Clone (Phase 4.3)
 * Transforms visual row specifications into fully validated seat maps with
 * tier classification, price multipliers, aisle markers, and capacity stats.
 */

const ROW_LABELS = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
];

/**
 * Generate standard default row templates
 * @param {number} rowCount - Number of rows (default 10)
 * @param {number} seatsPerRow - Number of seats per row (default 10)
 * @returns {Array<object>} Rows configuration
 */
export const generateDefaultRows = (rowCount = 10, seatsPerRow = 10) => {
  const rows = [];
  const count = Math.min(Math.max(1, rowCount), 26);
  const seats = Math.min(Math.max(4, seatsPerRow), 40);

  const leftAisle = seats >= 10 ? 3 : 0;
  const rightAisle = seats >= 10 ? seats - 3 : 0;
  const defaultAisles = [leftAisle, rightAisle].filter((a) => a > 0);

  for (let r = 0; r < count; r++) {
    const label = ROW_LABELS[r] || `R${r + 1}`;
    const isWheelchair = r === 0; // Front accessible row
    const isVip = r === count - 1; // Top balcony / back recliner row
    const isPremium = r >= count - 3 && r < count - 1; // 2 rows of premium club seats

    const category = isVip
      ? 'VIP'
      : isPremium
        ? 'Premium'
        : isWheelchair
          ? 'Accessible'
          : 'Standard';

    rows.push({
      label,
      seats,
      category,
      premium: isPremium,
      vip: isVip,
      wheelchair: isWheelchair,
      aisles: defaultAisles,
    });
  }

  return rows;
};

/**
 * Builds individual seat records and aggregate capacity metrics from visual rows configuration
 * @param {Array<object>} rawRows - Array of row definitions
 * @returns {{ rows: Array<object>, seats: Array<object>, capacity: number, stats: object }}
 */
export const generateSeatsFromRows = (rawRows = []) => {
  const rows = [];
  const seats = [];

  let standardCount = 0;
  let premiumCount = 0;
  let vipCount = 0;
  let accessibleCount = 0;

  const validRows = Array.isArray(rawRows) && rawRows.length > 0 ? rawRows : generateDefaultRows();

  validRows.forEach((rowInput, idx) => {
    const label = (rowInput.label || ROW_LABELS[idx] || `R${idx + 1}`)
      .toString()
      .trim()
      .toUpperCase();
    const seatCount = Math.min(Math.max(1, parseInt(rowInput.seats, 10) || 10), 50);

    const isWheelchair = Boolean(rowInput.wheelchair);
    const isVip = Boolean(rowInput.vip);
    const isPremium = Boolean(rowInput.premium);

    let category = rowInput.category || 'Standard';
    if (isWheelchair) category = 'Accessible';
    else if (isVip) category = 'VIP';
    else if (isPremium) category = 'Premium';

    // Parse aisles array
    let aisles = [];
    if (Array.isArray(rowInput.aisles)) {
      aisles = rowInput.aisles.map(Number).filter((n) => n > 0 && n < seatCount);
    }

    rows.push({
      label,
      seats: seatCount,
      category,
      premium: isPremium,
      vip: isVip,
      wheelchair: isWheelchair,
      aisles,
    });

    for (let num = 1; num <= seatCount; num++) {
      let priceMultiplier = 1.0;
      if (category === 'VIP') {
        priceMultiplier = 1.6;
        vipCount++;
      } else if (category === 'Premium') {
        priceMultiplier = 1.3;
        premiumCount++;
      } else if (category === 'Accessible') {
        priceMultiplier = 1.0;
        accessibleCount++;
      } else {
        priceMultiplier = 1.0;
        standardCount++;
      }

      seats.push({
        seatNumber: `${label}${num}`,
        row: label,
        number: num,
        tier: category,
        priceMultiplier,
        isAccessible: isWheelchair,
        aisleAfter: aisles.includes(num),
      });
    }
  });

  const totalCapacity = seats.length;

  return {
    rows,
    seats,
    capacity: totalCapacity,
    stats: {
      totalRows: rows.length,
      standard: standardCount,
      premium: premiumCount,
      vip: vipCount,
      accessible: accessibleCount,
      totalCapacity,
    },
  };
};
