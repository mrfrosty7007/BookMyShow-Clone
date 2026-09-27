import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Movie from '../models/Movie.js';
import Theater from '../models/Theater.js';
import Show from '../models/Show.js';
import { generateSeatLayout } from '../controllers/showController.js';
import movies from './movies.js';
import theaters from './theaters.js';
import { seedAdmin } from './admin.js';

/**
 * Generates approximately 40 relational shows linking movies and theaters
 * across realistic timeslots and upcoming dates
 *
 * @param {Array} createdMovies - List of inserted Movie documents
 * @param {Array} createdTheaters - List of inserted Theater documents
 * @returns {Array} Array of show objects with 100 auto-generated seats
 */
const generateShows = (createdMovies, createdTheaters) => {
  const timeSlots = [
    { hours: 10, minutes: 0 }, // 10:00 AM
    { hours: 13, minutes: 30 }, // 1:30 PM
    { hours: 17, minutes: 0 }, // 5:00 PM
    { hours: 20, minutes: 30 }, // 8:30 PM
  ];

  const prices = [250, 300, 350, 420];
  const shows = [];
  const baseDate = new Date();

  // Create 5 shows per movie (8 * 5 = 40 shows total)
  // Ensures every movie is in multiple theaters, and every theater hosts multiple movies
  createdMovies.forEach((movie, movieIdx) => {
    for (let i = 0; i < 5; i++) {
      const theater = createdTheaters[(movieIdx + i) % createdTheaters.length];
      const slot = timeSlots[(movieIdx + i) % timeSlots.length];
      const dayOffset = (i % 3) + 1; // Spread across upcoming 3 days

      const showTime = new Date(baseDate);
      showTime.setDate(baseDate.getDate() + dayOffset);
      showTime.setHours(slot.hours, slot.minutes, 0, 0);

      const screen = (i % Math.min(theater.screens, 3)) + 1;
      const price = prices[(movieIdx + i) % prices.length];

      shows.push({
        movie: movie._id,
        theater: theater._id,
        screen,
        showTime,
        price,
        seats: generateSeatLayout(),
        isActive: true,
      });
    }
  });

  return shows;
};

/**
 * Main seeding execution function
 */
export const seedDatabase = async () => {
  try {
    await connectDB();

    // 1. Clear existing seed collections (never touches users/auth)
    await Show.deleteMany({});
    await Movie.deleteMany({});
    await Theater.deleteMany({});

    // 2. Insert movies
    const createdMovies = await Movie.insertMany(movies);

    // 3. Insert theaters
    const createdTheaters = await Theater.insertMany(theaters);

    // 4. Generate & insert relational shows
    const showsToInsert = generateShows(createdMovies, createdTheaters);
    const createdShows = await Show.insertMany(showsToInsert);

    // 5. Seed default administrator account
    await seedAdmin();

    // 6. Output summary
    console.log(`Movies inserted: ${createdMovies.length}`);
    console.log(`Theaters inserted: ${createdTheaters.length}`);
    console.log(`Shows inserted: ${createdShows.length}`);
    console.log('Database seeded successfully.');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

// Execute if run directly via CLI
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase();
}

export default seedDatabase;
