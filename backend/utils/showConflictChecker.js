import Show from '../models/Show.js';

/**
 * Format a Date object into a readable 12-hour time string (e.g. "6:00 PM")
 * @param {Date|string} date
 * @returns {string}
 */
export const formatTimeStr = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Checks for screen scheduling conflicts considering movie runtime, trailer buffer, and cleaning buffer.
 *
 * @param {object} params
 * @param {string|mongoose.Types.ObjectId} params.theaterId - ID of the theater
 * @param {number} params.screen - Screen number (1-indexed)
 * @param {string|mongoose.Types.ObjectId} [params.screenId] - Optional subdocument Screen ID
 * @param {Date} params.startTime - Intended show start time
 * @param {Date} params.endTime - Intended show end time (runtime + trailers + cleaning)
 * @param {string|mongoose.Types.ObjectId} [params.excludeShowId] - Show ID to exclude (e.g. when updating)
 * @returns {Promise<{ hasConflict: boolean, message?: string, conflict?: object, suggestedNextAvailableTime?: Date, suggestedTimeString?: string }>}
 */
export const checkScreenConflict = async ({
  theaterId,
  screen,
  screenId,
  startTime,
  endTime,
  excludeShowId,
}) => {
  const newStart = new Date(startTime);
  const newEnd = new Date(endTime);

  // Screen query condition: match by screenId if available, or screen number
  const screenQuery = screenId ? { $or: [{ screenId }, { screen }] } : { screen };

  // Query for overlapping active and non-cancelled shows
  const query = {
    theater: theaterId,
    ...screenQuery,
    isActive: true,
    status: { $ne: 'cancelled' },
    // Standard interval overlap condition: (StartA < EndB) && (EndA > StartB)
    $and: [{ startTime: { $lt: newEnd } }, { endTime: { $gt: newStart } }],
  };

  if (excludeShowId) {
    query._id = { $ne: excludeShowId };
  }

  const conflictingShow = await Show.findOne(query)
    .populate('movie', 'title duration poster')
    .sort({ endTime: -1 });

  if (!conflictingShow) {
    return { hasConflict: false };
  }

  const conflictStartFormatted = formatTimeStr(conflictingShow.startTime);
  const conflictEndFormatted = formatTimeStr(conflictingShow.endTime);
  const movieTitle = conflictingShow.movie?.title || 'Another Movie';

  const message = `Screen already occupied between ${conflictStartFormatted} and ${conflictEndFormatted} (${movieTitle}).`;

  // Next available slot is exactly when the conflicting show finishes its cleaning buffer
  const suggestedNextAvailableTime = new Date(conflictingShow.endTime);
  const suggestedTimeString = formatTimeStr(suggestedNextAvailableTime);

  return {
    hasConflict: true,
    message,
    conflict: {
      showId: conflictingShow._id,
      movieTitle,
      startTime: conflictingShow.startTime,
      endTime: conflictingShow.endTime,
      screenName: conflictingShow.screenName,
      screen: conflictingShow.screen,
      cleaningBuffer: conflictingShow.cleaningBuffer,
    },
    suggestedNextAvailableTime,
    suggestedTimeString,
  };
};

export default {
  checkScreenConflict,
  formatTimeStr,
};
