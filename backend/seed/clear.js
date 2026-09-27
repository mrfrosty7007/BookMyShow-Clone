import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Movie from '../models/Movie.js';
import Theater from '../models/Theater.js';
import Show from '../models/Show.js';

/**
 * Clears seed collections (Movies, Theaters, Shows) without touching Users
 */
export const clearDatabase = async () => {
  try {
    await connectDB();

    await Show.deleteMany({});
    await Movie.deleteMany({});
    await Theater.deleteMany({});

    console.log('Seed collections cleared successfully.');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error clearing seed collections:', error.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

// Execute if run directly via CLI
if (process.argv[1]?.endsWith('clear.js')) {
  clearDatabase();
}

export default clearDatabase;
