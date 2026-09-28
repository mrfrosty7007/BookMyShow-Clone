import mongoose from 'mongoose';

/**
 * Movie Schema definition for BookMyShow Clone (Phase 4.2 Enhanced)
 */
const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Movie description is required'],
      trim: true,
    },
    poster: {
      type: String,
      required: [true, 'Movie poster URL is required'],
      trim: true,
    },
    backdrop: {
      type: String,
      default: '',
      trim: true,
    },
    banner: {
      type: String,
      default: '',
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, 'Movie duration in minutes is required'],
      min: [1, 'Duration must be at least 1 minute'],
    },
    language: {
      type: [String],
      default: ['English'],
      set: (val) => {
        if (Array.isArray(val)) return val;
        if (typeof val === 'string') {
          return val
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        }
        return ['English'];
      },
    },
    genre: {
      type: [String],
      default: [],
      set: (val) => {
        if (Array.isArray(val)) return val;
        if (typeof val === 'string') {
          return val
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        }
        return [];
      },
    },
    releaseDate: {
      type: Date,
      required: [true, 'Movie release date is required'],
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [10, 'Rating cannot be more than 10'],
    },
    certificate: {
      type: String,
      enum: {
        values: ['U', 'U/A', 'A'],
        message: '{VALUE} is not a valid certificate rating',
      },
      default: 'U/A',
      trim: true,
    },
    trailer: {
      type: String,
      default: '',
      trim: true,
    },
    featured: {
      type: Boolean,
      default: false,
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
  }
);

/**
 * Pre-save synchronization hook: ensure backdrop and legacy banner stay synchronized
 */
movieSchema.pre('save', function (next) {
  if (this.backdrop && !this.banner) {
    this.banner = this.backdrop;
  } else if (this.banner && !this.backdrop) {
    this.backdrop = this.banner;
  }
  next();
});

// Compound index for active movie catalog sorted by release date (eliminates in-memory SORT)
movieSchema.index({ isActive: 1, releaseDate: -1 });

// Single field index for movie title lookup and alphabetically sorted selections
movieSchema.index({ title: 1 });

export default mongoose.model('Movie', movieSchema);
