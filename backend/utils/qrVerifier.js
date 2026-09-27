import Booking from '../models/Booking.js';

/**
 * Extracts normalized bookingId from a scanned QR payload or raw string
 * @param {string} rawInput
 * @returns {string} normalized booking identifier
 */
export const extractBookingId = (rawInput) => {
  if (!rawInput) return '';
  const trimmed = rawInput.toString().trim();

  // 1. Try parsing as JSON token
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed.bookingId) return parsed.bookingId.trim();
    } catch {
      // Fall through if not valid JSON
    }
  }

  // 2. Return as raw string ID
  return trimmed;
};

/**
 * Verifies a QR ticket against booking records, payment state, and show timing.
 *
 * @param {string} qrInput - Scanned QR payload or booking ID
 * @param {string} [targetShowId] - Optional Show ID to ensure ticket matches the active session
 * @returns {Promise<{ valid: boolean, code: string, result: string, message: string, booking?: object }>}
 */
export const verifyQRTicket = async (qrInput, targetShowId = null) => {
  const identifier = extractBookingId(qrInput);

  if (!identifier) {
    return {
      valid: false,
      code: 'INVALID_PAYLOAD',
      result: 'Denied',
      message: 'Invalid QR code payload format.',
    };
  }

  // Look up booking by bookingId or MongoDB _id
  let query = { bookingId: identifier };
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    query = { $or: [{ bookingId: identifier }, { _id: identifier }] };
  }

  const booking = await Booking.findOne(query)
    .populate('user', 'name email phone')
    .populate('movie', 'title poster duration genre rating')
    .populate('theater', 'name city screens')
    .populate('show');

  // Check 1: Booking Exists
  if (!booking) {
    return {
      valid: false,
      code: 'NOT_FOUND',
      result: 'Denied',
      message: `Ticket Invalid — No booking found matching "${identifier}".`,
    };
  }

  // Check 2: Payment Verification
  if (booking.paymentStatus !== 'completed') {
    return {
      valid: false,
      code: 'PAYMENT_PENDING',
      result: 'Denied',
      message: `Entry Denied — Payment status is "${booking.paymentStatus}".`,
      booking,
    };
  }

  // Check 3: Show Validity
  const show = booking.show;
  if (!show || !show.isActive || show.status === 'cancelled') {
    return {
      valid: false,
      code: 'SHOW_CANCELLED',
      result: 'Cancelled',
      message: 'Ticket Invalid — The show session has been cancelled.',
      booking,
    };
  }

  // Check 4: Correct Session / Show Target Check (Optional gate guard)
  if (targetShowId && show._id.toString() !== targetShowId.toString()) {
    return {
      valid: false,
      code: 'WRONG_SHOW',
      result: 'Wrong Show',
      message: `Invalid Session — Ticket is for "${booking.movie?.title}" at a different show time.`,
      booking,
    };
  }

  // Check 5: One-Time Ticket Entry Protection (Duplicate Scan Rejection)
  if (booking.status === 'Checked-In' || booking.checkedInAt) {
    const formattedCheckinTime = new Date(booking.checkedInAt).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    const gateName = booking.checkedInBy?.gate || 'Gate Entry';

    return {
      valid: false,
      code: 'ALREADY_USED',
      result: 'Already Used',
      message: `Duplicate Entry — Ticket was already scanned at ${formattedCheckinTime} (${gateName}).`,
      booking,
    };
  }

  // Check 6: Cancelled Booking
  if (booking.status === 'Cancelled') {
    return {
      valid: false,
      code: 'CANCELLED',
      result: 'Cancelled',
      message: 'Ticket Invalid — This booking was cancelled.',
      booking,
    };
  }

  // Check 7: Refunded Booking
  if (booking.status === 'Refunded') {
    return {
      valid: false,
      code: 'REFUNDED',
      result: 'Refunded',
      message: 'Entry Denied — Booking has been refunded.',
      booking,
    };
  }

  // Check 8: Expired Show
  if (booking.status === 'Expired') {
    return {
      valid: false,
      code: 'EXPIRED',
      result: 'Denied',
      message: 'Ticket Expired — Show has ended.',
      booking,
    };
  }

  // All verification checks passed
  return {
    valid: true,
    code: 'VALID',
    result: 'Valid',
    message: 'Entry Approved',
    booking,
  };
};

export default {
  extractBookingId,
  verifyQRTicket,
};
