import mongoose from 'mongoose';

/**
 * Booking Schema definition for BookMyShow Clone - Phase 3.3
 * Immutable record representing confirmed ticket reservations,
 * pricing breakdown, QR verification token, and user ownership.
 */
const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: [true, 'Show reference is required'],
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Movie reference is required'],
    },
    theater: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theater',
      required: [true, 'Theater reference is required'],
    },
    seats: {
      type: [String],
      required: [true, 'At least one seat must be selected for booking'],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'A booking must contain at least one seat',
      },
    },
    subtotal: {
      type: Number,
      required: [true, 'Subtotal is required'],
      min: [0, 'Subtotal cannot be negative'],
    },
    convenienceFee: {
      type: Number,
      default: 30,
      min: [0, 'Convenience fee cannot be negative'],
    },
    gst: {
      type: Number,
      default: 5.4,
      min: [0, 'GST cannot be negative'],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },
    bookingId: {
      type: String,
      required: [true, 'Unique booking ID is required'],
      unique: true,
      index: true,
      trim: true,
    },
    qrToken: {
      type: String,
      required: [true, 'QR token is required'],
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ['pending', 'completed', 'failed'],
        message: '{VALUE} is not a supported payment status',
      },
      default: 'completed',
    },
    paymentMethod: {
      type: String,
      default: 'Simulation (UPI/Card)',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Booking', bookingSchema);
