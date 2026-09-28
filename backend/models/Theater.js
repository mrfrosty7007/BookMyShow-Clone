import mongoose from 'mongoose';

/**
 * Seat Item Schema - Individual seat definition within a screen layout
 */
const seatItemSchema = new mongoose.Schema(
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
    number: {
      type: Number,
      required: [true, 'Seat number sequence is required'],
      min: 1,
    },
    tier: {
      type: String,
      enum: ['Standard', 'Premium', 'VIP', 'Accessible'],
      default: 'Standard',
    },
    priceMultiplier: {
      type: Number,
      default: 1.0,
      min: 0.5,
      max: 5.0,
    },
    isAccessible: {
      type: Boolean,
      default: false,
    },
    aisleAfter: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  }
);

/**
 * Row Layout Schema - Visual configuration for a seating row
 */
const rowLayoutSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: [true, 'Row label is required'],
      trim: true,
      uppercase: true,
    },
    seats: {
      type: Number,
      required: [true, 'Seats per row is required'],
      min: [1, 'Row must have at least 1 seat'],
      max: [50, 'Row cannot exceed 50 seats'],
      default: 10,
    },
    category: {
      type: String,
      enum: ['Standard', 'Premium', 'VIP', 'Accessible'],
      default: 'Standard',
    },
    premium: {
      type: Boolean,
      default: false,
    },
    vip: {
      type: Boolean,
      default: false,
    },
    wheelchair: {
      type: Boolean,
      default: false,
    },
    aisles: {
      type: [Number],
      default: [],
    },
  },
  {
    _id: false,
  }
);

/**
 * Screen Schema - Individual auditorium / screen inside a multiplex
 */
const screenSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Screen name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: [
        'IMAX',
        'Dolby Atmos',
        '4DX',
        'Standard',
        'Gold Class',
        'ScreenX',
        'IMAX 3D',
        'Laser',
        'ICE Immersive',
      ],
      default: 'Standard',
    },
    capacity: {
      type: Number,
      default: 0,
      min: 0,
    },
    seatLayout: {
      rows: {
        type: [rowLayoutSchema],
        default: [],
      },
      seats: {
        type: [seatItemSchema],
        default: [],
      },
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Theater Schema definition for BookMyShow Clone (Phase 4.3 Multiplex Upgrade)
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
    amenities: {
      type: [String],
      default: ['Dolby Atmos', 'Parking', 'Food Court'],
    },
    facilities: {
      type: [String],
      default: ['Dolby Atmos', 'Parking', 'Food Court'],
    },
    screens: {
      type: [screenSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: Total number of active screens
theaterSchema.virtual('totalScreens').get(function () {
  return Array.isArray(this.screens) ? this.screens.length : 0;
});

// Virtual: Aggregate seat capacity across all screens in the multiplex
theaterSchema.virtual('totalCapacity').get(function () {
  if (!Array.isArray(this.screens)) return 0;
  return this.screens.reduce((acc, s) => acc + (s.capacity || 0), 0);
});

// Pre-save synchronization hook
theaterSchema.pre('save', function (next) {
  // Synchronize amenities and facilities for backward compatibility
  if (
    this.amenities &&
    this.amenities.length > 0 &&
    (!this.facilities || this.facilities.length === 0)
  ) {
    this.facilities = [...this.amenities];
  } else if (
    this.facilities &&
    this.facilities.length > 0 &&
    (!this.amenities || this.amenities.length === 0)
  ) {
    this.amenities = [...this.facilities];
  }

  // Ensure each screen capacity matches its seat layout
  if (Array.isArray(this.screens)) {
    for (const screen of this.screens) {
      if (screen.seatLayout?.seats?.length) {
        screen.capacity = screen.seatLayout.seats.length;
      } else if (screen.seatLayout?.rows?.length) {
        screen.capacity = screen.seatLayout.rows.reduce(
          (sum, r) => sum + (Number(r.seats) || 0),
          0
        );
      }
    }
  }

  next();
});

// Production indexes for city lookup and active directory sorting
theaterSchema.index({ city: 1 });
theaterSchema.index({ isActive: 1, name: 1 });

export default mongoose.model('Theater', theaterSchema);
