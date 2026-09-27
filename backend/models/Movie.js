import mongoose from 'mongoose';

/**
 * Movie Schema definition for BookMyShow Clone
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
      type: String,
      required: [true, 'Movie language is required'],
      trim: true,
    },
    genre: {
      type: [String],
      default: [],
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
      default: 'U/A',
      trim: true,
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

export default mongoose.model('Movie', movieSchema);
