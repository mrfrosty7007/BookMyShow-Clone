import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';

const inspectIndexes = async () => {
  await connectDB();
  const collections = await mongoose.connection.db.listCollections().toArray();
  for (const col of collections) {
    const indexes = await mongoose.connection.db.collection(col.name).indexes();
    console.log(`\nCollection: [${col.name}]`);
    indexes.forEach((idx) => {
      console.log(`  - Key: ${JSON.stringify(idx.key)}, Name: "${idx.name}"${idx.unique ? ' (UNIQUE)' : ''}`);
    });
  }
  await mongoose.connection.close();
  process.exit(0);
};

inspectIndexes().catch((err) => {
  console.error('Error inspecting indexes:', err);
  process.exit(1);
});
