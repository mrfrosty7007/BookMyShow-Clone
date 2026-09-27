import mongoose from 'mongoose';

/**
 * Theater Schema definition for BookMyShow Clone
 */
const theaterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Theater name is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Theater address is required'],
      trim: true,
    },
    screens: {
      type: Number,
      required: [true, 'Number of screens is required'],
      min: [1, 'A theater must have at least 1 screen'],
      default: 1,
    },
    facilities: {
      type: [String],
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

export default mongoose.model('Theater', theaterSchema);
