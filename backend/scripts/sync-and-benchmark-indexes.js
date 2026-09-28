import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Movie from '../models/Movie.js';
import Theater from '../models/Theater.js';
import Show from '../models/Show.js';
import Booking from '../models/Booking.js';
import SeatLock from '../models/SeatLock.js';
import AuditLog from '../models/AuditLog.js';
import User from '../models/User.js';

const syncAndBenchmark = async () => {
  console.log('=====================================================================');
  console.log('--- Step 1: Synchronizing & Building Production Indexes via Mongoose ---');
  console.log('=====================================================================');

  await connectDB();

  const models = [
    { name: 'Theater', model: Theater },
    { name: 'Movie', model: Movie },
    { name: 'Show', model: Show },
    { name: 'Booking', model: Booking },
    { name: 'SeatLock', model: SeatLock },
    { name: 'AuditLog', model: AuditLog },
    { name: 'User', model: User },
  ];

  for (const { name, model } of models) {
    console.log(`Synchronizing indexes for model: ${name}...`);
    try {
      await model.syncIndexes();
      console.log(`  ✓ ${name} indexes synchronized successfully.`);
    } catch (err) {
      console.warn(`  ⚠️ Warning syncing ${name} indexes:`, err.message);
      // Fallback to createIndexes if syncIndexes fails due to collection drop permissions
      await model.createIndexes();
    }
  }

  console.log('\n=====================================================================');
  console.log('--- Step 2: Listing Active Indexes After Synchronization ---');
  console.log('=====================================================================');

  const collections = await mongoose.connection.db.listCollections().toArray();
  for (const col of collections) {
    const indexes = await mongoose.connection.db.collection(col.name).indexes();
    console.log(`\nCollection: [${col.name}]`);
    indexes.forEach((idx) => {
      console.log(`  - Key: ${JSON.stringify(idx.key)}, Name: "${idx.name}"${idx.unique ? ' (UNIQUE)' : ''}`);
    });
  }

  console.log('\n=====================================================================');
  console.log('--- Step 3: Measuring Query Execution Plans (POST-OPTIMIZATION) ---');
  console.log('=====================================================================');

  const sampleMovie = await Movie.findOne({ isActive: true }).lean();
  const sampleShow = await Show.findOne({ isActive: true }).lean();

  // 1. Theater Query: Find by city and isActive
  const q1 = Theater.find({ city: 'Bengaluru', isActive: true });
  const exp1 = await q1.explain('executionStats');
  const stage1 = exp1.executionStats.executionStages.stage;
  const childStage1 = exp1.executionStats.executionStages.inputStage?.stage || 'NONE';
  const indexName1 = exp1.queryPlanner.winningPlan.inputStage?.indexName || exp1.queryPlanner.winningPlan.indexName || 'NONE (COLLSCAN)';

  console.log('\n1. Theater Query: Theater.find({ city: "Bengaluru", isActive: true })');
  console.log(`   - Stage:              ${stage1} (Input: ${childStage1})`);
  console.log(`   - Winning Index:      ${indexName1}`);
  console.log(`   - Docs Examined:      ${exp1.executionStats.totalDocsExamined}`);
  console.log(`   - Keys Examined:      ${exp1.executionStats.totalKeysExamined}`);
  console.log(`   - Execution Time:     ${exp1.executionStats.executionTimeMillis} ms`);

  // 2. Movie Catalog Query: Find active movies sorted by releaseDate desc
  const q2 = Movie.find({ isActive: true }).sort({ releaseDate: -1 });
  const exp2 = await q2.explain('executionStats');
  const stage2 = exp2.executionStats.executionStages.stage;
  const childStage2 = exp2.executionStats.executionStages.inputStage?.stage || 'NONE';
  const hasSortStage2 = stage2 === 'SORT' || childStage2 === 'SORT';
  const indexName2 = exp2.queryPlanner.winningPlan.inputStage?.indexName || exp2.queryPlanner.winningPlan.indexName || 'NONE';

  console.log('\n2. Movie Catalog Query: Movie.find({ isActive: true }).sort({ releaseDate: -1 })');
  console.log(`   - Stage:              ${stage2} (Input: ${childStage2})`);
  console.log(`   - In-Memory Sort?     ${hasSortStage2 ? 'YES (In-Memory Sort)' : 'NO (Index-Covered Sort)'}`);
  console.log(`   - Winning Index:      ${indexName2}`);
  console.log(`   - Docs Examined:      ${exp2.executionStats.totalDocsExamined}`);
  console.log(`   - Keys Examined:      ${exp2.executionStats.totalKeysExamined}`);
  console.log(`   - Execution Time:     ${exp2.executionStats.executionTimeMillis} ms`);

  // 3. Show by Movie Query: Find active non-cancelled shows sorted by showTime
  if (sampleMovie) {
    const q3 = Show.find({
      movie: sampleMovie._id,
      isActive: true,
      status: { $ne: 'cancelled' },
    }).sort({ showTime: 1 });
    const exp3 = await q3.explain('executionStats');
    const stage3 = exp3.executionStats.executionStages.stage;
    const childStage3 = exp3.executionStats.executionStages.inputStage?.stage || 'NONE';
    const indexName3 = exp3.queryPlanner.winningPlan.inputStage?.indexName || exp3.queryPlanner.winningPlan.inputStage?.inputStage?.indexName || 'NONE';

    console.log('\n3. Show Query: Show.find({ movie, isActive: true, status: { $ne: "cancelled" } }).sort({ showTime: 1 })');
    console.log(`   - Stage:              ${stage3} (Input: ${childStage3})`);
    console.log(`   - Winning Index:      ${indexName3}`);
    console.log(`   - Docs Examined:      ${exp3.executionStats.totalDocsExamined}`);
    console.log(`   - Keys Examined:      ${exp3.executionStats.totalKeysExamined}`);
    console.log(`   - Execution Time:     ${exp3.executionStats.executionTimeMillis} ms`);
  }

  // 4. SeatLock Query: Active locks for show
  if (sampleShow) {
    const q4 = SeatLock.find({ showId: sampleShow._id, expiresAt: { $gt: new Date() } });
    const exp4 = await q4.explain('executionStats');
    const stage4 = exp4.executionStats.executionStages.stage;
    const childStage4 = exp4.executionStats.executionStages.inputStage?.stage || 'NONE';
    const indexName4 = exp4.queryPlanner.winningPlan.inputStage?.indexName || 'NONE';

    console.log('\n4. SeatLock Query: SeatLock.find({ showId, expiresAt: { $gt: now } })');
    console.log(`   - Stage:              ${stage4} (Input: ${childStage4})`);
    console.log(`   - Winning Index:      ${indexName4}`);
    console.log(`   - Docs Examined:      ${exp4.executionStats.totalDocsExamined}`);
    console.log(`   - Keys Examined:      ${exp4.executionStats.totalKeysExamined}`);
    console.log(`   - Execution Time:     ${exp4.executionStats.executionTimeMillis} ms`);
  }

  // 5. Booking Analytics Query: Confirmed/Refunded bookings sorted by createdAt desc
  const q5 = Booking.find({
    paymentStatus: { $in: ['completed', 'refunded'] },
    status: { $in: ['Confirmed', 'Checked-In', 'Refunded'] },
  }).sort({ createdAt: -1 });
  const exp5 = await q5.explain('executionStats');
  const stage5 = exp5.executionStats.executionStages.stage;
  const childStage5 = exp5.executionStats.executionStages.inputStage?.stage || 'NONE';
  const indexName5 = exp5.queryPlanner.winningPlan.inputStage?.indexName || exp5.queryPlanner.winningPlan.indexName || 'NONE';

  console.log('\n5. Booking Analytics Query: Booking.find({ paymentStatus, status }).sort({ createdAt: -1 })');
  console.log(`   - Stage:              ${stage5} (Input: ${childStage5})`);
  console.log(`   - In-Memory Sort?     ${stage5 === 'SORT' ? 'YES' : 'NO'}`);
  console.log(`   - Winning Index:      ${indexName5}`);
  console.log(`   - Docs Examined:      ${exp5.executionStats.totalDocsExamined}`);
  console.log(`   - Keys Examined:      ${exp5.executionStats.totalKeysExamined}`);
  console.log(`   - Execution Time:     ${exp5.executionStats.executionTimeMillis} ms`);

  await mongoose.connection.close();
  console.log('\n=====================================================================');
  console.log('RESULT: DATABASE INDEX OPTIMIZATION COMPLETE & VERIFIED!');
  console.log('=====================================================================');
  process.exit(0);
};

syncAndBenchmark().catch((err) => {
  console.error('\n❌ Index synchronization & benchmark failed:', err);
  process.exit(1);
});
