import mongoose from 'mongoose';

/**
 * AuditLog Schema for Global Operations Tracking - Phase 4.5
 * Captures an immutable audit trail of every ticket validation,
 * attendance check-in, refund calculation, seat recovery, and manual override.
 */
const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, default: 'System' },
      email: { type: String, default: '' },
      role: { type: String, default: 'system' },
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      index: true,
      default: null,
    },
    bookingId: {
      type: String,
      index: true,
      default: null,
    },
    action: {
      type: String,
      required: [true, 'Audit action is required'],
      enum: [
        'BOOKING_CREATED',
        'PAYMENT_COMPLETED',
        'TICKET_VALIDATED',
        'DUPLICATE_SCAN_REJECTED',
        'ENTRY_DENIED',
        'MANUAL_CHECKIN',
        'REFUND_PROCESSED',
        'SEATS_RESTORED',
        'SEAT_LOCKS_RECOVERED',
        'BOOKING_CANCELLED',
      ],
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Static convenience helper to record an operational event
 */
auditLogSchema.statics.logAction = async function ({
  actor = {},
  booking = null,
  bookingId = null,
  action,
  metadata = {},
  ipAddress = null,
}) {
  try {
    const actorInfo = {
      id: actor._id || actor.id || null,
      name: actor.name || 'System Operator',
      email: actor.email || 'system@bookmyshow.internal',
      role: actor.role || 'system',
    };

    const bId = bookingId || (booking ? booking.bookingId : null);
    const bRef = booking ? booking._id || booking : null;

    const log = await this.create({
      actor: actorInfo,
      booking: bRef,
      bookingId: bId,
      action,
      metadata,
      ipAddress,
    });

    return log;
  } catch (err) {
    console.error('AuditLog logging error:', err.message);
    return null;
  }
};

// Compound index for timeline queries
auditLogSchema.index({ timestamp: -1, action: 1 });

export default mongoose.model('AuditLog', auditLogSchema);
