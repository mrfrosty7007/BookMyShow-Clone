import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Movie from '../models/Movie.js';
import Theater from '../models/Theater.js';
import Show from '../models/Show.js';
import SeatLock from '../models/SeatLock.js';
import Booking from '../models/Booking.js';

export const runExplainBench = async (label = 'BASELINE') => {
  console.log(`\n=====================================================================`);
  console.log(`--- Running Explain Plan Benchmark: [${label}] ---`);
  console.log(`=====================================================================`);

  const sampleMovie = await Movie.findOne({ isActive: true }).lean();
  const sampleShow = await Show.findOne({ isActive: true }).lean();

  const results = {};

  // 1. Theater Query: Find by city and isActive
  const q1 = Theater.find({ city: 'Bengaluru', isActive: true });
  const exp1 = await q1.explain('executionStats');
  const stage1 = exp1.executionStats.executionStages.stage;
  const childStage1 = exp1.executionStats.executionStages.inputStage?.stage || 'NONE';
  results.theater = {
    query: 'Theater.find({ city: "Bengaluru", isActive: true })',
    stage: stage1 === 'FETCH' ? `FETCH -> ${childStage1}` : stage1,
    indexName: exp1.queryPlanner.winningPlan.inputStage?.indexName || 'NONE (COLLSCAN)',
    nReturned: exp1.executionStats.nReturned,
    totalDocsExamined: exp1.executionStats.totalDocsExamined,
    totalKeysExamined: exp1.executionStats.totalKeysExamined,
    executionTimeMillis: exp1.executionStats.executionTimeMillis,
  };

  // 2. Movie Catalog Query: Find active movies sorted by releaseDate desc
  const q2 = Movie.find({ isActive: true }).sort({ releaseDate: -1 });
  const exp2 = await q2.explain('executionStats');
  const stage2 = exp2.executionStats.executionStages.stage;
  const childStage2 = exp2.executionStats.executionStages.inputStage?.stage || 'NONE';
  const hasSortStage2 = stage2 === 'SORT' || childStage2 === 'SORT';
  results.movie = {
    query: 'Movie.find({ isActive: true }).sort({ releaseDate: -1 })',
    stage: stage2,
    hasSortStage: hasSortStage2 ? 'YES (In-Memory Sort)' : 'NO (Index-Covered Sort)',
    indexName: exp2.queryPlanner.winningPlan.inputStage?.inputStage?.indexName || exp2.queryPlanner.winningPlan.inputStage?.indexName || 'NONE (COLLSCAN)',
    nReturned: exp2.executionStats.nReturned,
    totalDocsExamined: exp2.executionStats.totalDocsExamined,
    totalKeysExamined: exp2.executionStats.totalKeysExamined,
    executionTimeMillis: exp2.executionStats.executionTimeMillis,
  };

  // 3. Show by Movie Query: Find active non-cancelled shows sorted by showTime
  if (sampleMovie) {
    const q3 = Show.find({
      movie: sampleMovie._id,
      isActive: true,
      status: { $ne: 'cancelled' },
    }).sort({ showTime: 1 });
    const exp3 = await q3.explain('executionStats');
    const stage3 = exp3.executionStats.executionStages.stage;
    results.show = {
      query: 'Show.find({ movie, isActive: true, status: { $ne: "cancelled" } }).sort({ showTime: 1 })',
      stage: stage3,
      indexName: exp3.queryPlanner.winningPlan.inputStage?.indexName || exp3.queryPlanner.winningPlan.inputStage?.inputStage?.indexName || 'NONE',
      nReturned: exp3.executionStats.nReturned,
      totalDocsExamined: exp3.executionStats.totalDocsExamined,
      totalKeysExamined: exp3.executionStats.totalKeysExamined,
      executionTimeMillis: exp3.executionStats.executionTimeMillis,
    };
  }

  // 4. SeatLock Query: Active locks for show
  if (sampleShow) {
    const q4 = SeatLock.find({ showId: sampleShow._id, expiresAt: { $gt: new Date() } });
    const exp4 = await q4.explain('executionStats');
    results.seatLock = {
      query: 'SeatLock.find({ showId, expiresAt: { $gt: now } })',
      stage: exp4.executionStats.executionStages.stage,
      indexName: exp4.queryPlanner.winningPlan.inputStage?.indexName || 'NONE',
      nReturned: exp4.executionStats.nReturned,
      totalDocsExamined: exp4.executionStats.totalDocsExamined,
      totalKeysExamined: exp4.executionStats.totalKeysExamined,
      executionTimeMillis: exp4.executionStats.executionTimeMillis,
    };
  }

  // 5. Booking Analytics Query: Confirmed/Refunded bookings
  const q5 = Booking.find({
    paymentStatus: { $in: ['completed', 'refunded'] },
    status: { $in: ['Confirmed', 'Checked-In', 'Refunded'] },
  }).sort({ createdAt: -1 });
  const exp5 = await q5.explain('executionStats');
  results.booking = {
    query: 'Booking.find({ paymentStatus, status }).sort({ createdAt: -1 })',
    stage: exp5.executionStats.executionStages.stage,
    indexName: exp5.queryPlanner.winningPlan.inputStage?.indexName || exp5.queryPlanner.winningPlan.indexName || 'NONE',
    nReturned: exp5.executionStats.nReturned,
    totalDocsExamined: exp5.executionStats.totalDocsExamined,
    totalKeysExamined: exp5.executionStats.totalKeysExamined,
    executionTimeMillis: exp5.executionStats.executionTimeMillis,
  };

  console.log(JSON.stringify(results, null, 2));
  return results;
};

if (process.argv[1]?.endsWith('benchmark-indexes.js')) {
  (async () => {
    await connectDB();
    await runExplainBench(process.argv[2] || 'CURRENT');
    await mongoose.connection.close();
    process.exit(0);
  })().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
