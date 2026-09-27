import SeatLock from '../models/SeatLock.js';
import Show from '../models/Show.js';
import AuditLog from '../models/AuditLog.js';

/**
 * Recovers abandoned seat locks and restores seat inventory
 *
 * @param {object} [actor] - User or system executing the recovery
 * @returns {Promise<{ expiredLocksRemoved: number, affectedShowsCount: number, recoveredAt: Date }>}
 */
export const recoverExpiredSeatLocks = async (
  actor = { name: 'System Auto-Recovery', role: 'system' }
) => {
  const now = new Date();

  // 1. Find all expired locks
  const expiredLocks = await SeatLock.find({ expiresAt: { $lt: now } });

  if (expiredLocks.length === 0) {
    return {
      expiredLocksRemoved: 0,
      affectedShowsCount: 0,
      recoveredAt: now,
    };
  }

  // 2. Group seat locks by showId
  const showSeatMap = new Map();
  expiredLocks.forEach((lock) => {
    const sId = lock.showId.toString();
    if (!showSeatMap.has(sId)) {
      showSeatMap.set(sId, []);
    }
    showSeatMap.get(sId).push(lock.seatNumber);
  });

  // 3. Revert seat statuses in each Show document
  let affectedShowsCount = 0;
  for (const [showId, seatNumbers] of showSeatMap.entries()) {
    const show = await Show.findById(showId);
    if (show && Array.isArray(show.seats)) {
      let modified = false;
      show.seats.forEach((seat) => {
        if (seatNumbers.includes(seat.seatNumber) && seat.status === 'locked') {
          seat.status = 'available';
          modified = true;
        }
      });

      if (modified) {
        await show.save();
        affectedShowsCount++;
      }
    }
  }

  // 4. Delete the expired lock records
  const deleteResult = await SeatLock.deleteMany({ expiresAt: { $lt: now } });
  const expiredLocksRemoved = deleteResult.deletedCount || expiredLocks.length;

  // 5. Log operational recovery event
  await AuditLog.logAction({
    actor,
    action: 'SEAT_LOCKS_RECOVERED',
    metadata: {
      expiredLocksRemoved,
      affectedShowsCount,
      timestamp: now,
    },
  });

  return {
    expiredLocksRemoved,
    affectedShowsCount,
    recoveredAt: now,
  };
};

export default {
  recoverExpiredSeatLocks,
};
