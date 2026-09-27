import mongoose from 'mongoose';

/**
 * Embedded Seat Schema for individual show layout and booking state
 */
const seatSchema = new mongoose.Schema(
  {
    seatNumber: {
      type: String,
      required: [true, 'Seat number is required'],
      trim: true,
    },
    row: {
      type: String,
      required: [true, 'Row identifier is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['available', 'booked'],
        message: '{VALUE} is not a valid seat status',
      },
      default: 'available',
    },
  },
  {
    _id: false,
  }
);

/**
 * Show Schema definition for BookMyShow Clone
 */
const showSchema = new mongoose.Schema(
  {
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
    screen: {
      type: Number,
      required: [true, 'Screen number is required'],
      min: [1, 'Screen number must be at least 1'],
    },
    showTime: {
      type: Date,
      required: [true, 'Show time is required'],
    },
    price: {
      type: Number,
      required: [true, 'Ticket price is required'],
      min: [0, 'Ticket price cannot be negative'],
    },
    seats: {
      type: [seatSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Show', showSchema);
