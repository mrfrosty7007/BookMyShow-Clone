import mongoose from 'mongoose';

/**
 * Audit Event Sub-schema for booking lifecycle tracking
 */
const auditEventSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: [true, 'Action identifier is required'],
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    actor: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, default: 'System' },
      role: { type: String, default: 'system' },
    },
    notes: {
      type: String,
      default: '',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { _id: false }
);

/**
 * Scan History Sub-schema for gate entry validation logs
 */
const scanAttemptSchema = new mongoose.Schema(
  {
    scannedAt: {
      type: Date,
      default: Date.now,
    },
    gate: {
      type: String,
      default: 'Main Gate',
    },
    device: {
      type: String,
      default: 'Staff Scanner',
    },
    staffName: {
      type: String,
      default: 'Staff',
    },
    result: {
      type: String,
      enum: ['Valid', 'Already Used', 'Cancelled', 'Refunded', 'Wrong Show', 'Denied'],
      required: true,
    },
    message: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

/**
 * Booking Schema definition for BookMyShow Clone (Phase 4.5 Upgrade)
 * Full operational model tracking confirmed reservations, gate validation,
 * refund processing, seat restoration, and lifecycle audit history.
 */
const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: [true, 'Show reference is required'],
      index: true,
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Movie reference is required'],
      index: true,
    },
    theater: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theater',
      required: [true, 'Theater reference is required'],
      index: true,
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
      trim: true,
    },
    qrToken: {
      type: String,
      required: [true, 'QR token is required'],
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ['pending', 'completed', 'failed', 'refunded'],
        message: '{VALUE} is not a supported payment status',
      },
      default: 'completed',
    },
    paymentMethod: {
      type: String,
      default: 'Simulation (UPI/Card)',
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Confirmed', 'Checked-In', 'Cancelled', 'Refunded', 'Expired'],
        message: '{VALUE} is not a supported booking status',
      },
      default: 'Confirmed',
      index: true,
    },
    checkedInAt: {
      type: Date,
      default: null,
      index: true,
    },
    checkedInBy: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, default: null },
      staffName: { type: String, default: null },
      role: { type: String, default: 'staff' },
      gate: { type: String, default: 'Main Gate' },
      device: { type: String, default: 'Handheld Scanner' },
    },
    refund: {
      amount: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 },
      policyApplied: { type: String, default: null },
      reason: { type: String, default: null },
      isOverridden: { type: Boolean, default: false },
      refundedAt: { type: Date, default: null },
      processedAt: { type: Date, default: null },
      refundedBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: { type: String, default: null },
      },
      processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      transactionId: { type: String, default: null },
    },
    auditTrail: {
      type: [auditEventSchema],
      default: [],
    },
    scanHistory: {
      type: [scanAttemptSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for eligibility to check in
bookingSchema.virtual('canCheckIn').get(function () {
  return this.status === 'Confirmed' && this.paymentStatus === 'completed' && !this.checkedInAt;
});

// Virtual for eligibility for refund
bookingSchema.virtual('isRefundable').get(function () {
  return ['Confirmed', 'Pending'].includes(this.status) && this.paymentStatus === 'completed';
});

// Compound indexes for operations searches and analytics
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ theater: 1, show: 1, status: 1 });
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ paymentStatus: 1, status: 1, createdAt: -1 });

export default mongoose.model('Booking', bookingSchema);
