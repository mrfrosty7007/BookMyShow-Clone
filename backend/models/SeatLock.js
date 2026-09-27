import mongoose from 'mongoose';

/**
 * SeatLock Schema definition for Phase 3.2 Real-time Seat Locking
 * Represents temporary 5-minute reservations on specific seats
 */
const seatLockSchema = new mongoose.Schema(
  {
    showId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: [true, 'Show ID is required'],
      index: true,
    },
    seatNumber: {
      type: String,
      required: [true, 'Seat number is required'],
      trim: true,
    },
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      index: true,
    },
    socketId: {
      type: String,
      default: '',
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration timestamp is required'],
      default: () => new Date(Date.now() + 5 * 60 * 1000), // 5 minutes default
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index ensuring a seat cannot have more than one active lock
seatLockSchema.index({ showId: 1, seatNumber: 1 }, { unique: true });

// MongoDB TTL Index for automatic expiration cleanup
seatLockSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('SeatLock', seatLockSchema);
