import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const SCREEN_TYPES = ['IMAX', 'Dolby Atmos', '4DX', 'Standard', 'Gold Class', 'ScreenX'];

export const generateDefaultLayout = (rowsCount = 10, seatsPerRow = 10) => {
  const rowLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];
  const rows = [];
  const seats = [];

  for (let r = 0; r < rowsCount; r++) {
    const label = rowLabels[r] || `R${r + 1}`;
    const isPremium = r >= rowsCount - 3 && r < rowsCount - 1;
    const isVip = r === rowsCount - 1;
    const isWheelchair = r === 0;

    const category = isVip
      ? 'VIP'
      : isPremium
        ? 'Premium'
        : isWheelchair
          ? 'Accessible'
          : 'Standard';
    const aisles = seatsPerRow >= 10 ? [3, seatsPerRow - 3] : [];

    rows.push({
      label,
      seats: seatsPerRow,
      category,
      premium: isPremium,
      vip: isVip,
      wheelchair: isWheelchair,
      aisles,
    });

    for (let num = 1; num <= seatsPerRow; num++) {
      const tier = isVip ? 'VIP' : isPremium ? 'Premium' : isWheelchair ? 'Accessible' : 'Standard';
      const priceMultiplier = isVip ? 1.6 : isPremium ? 1.3 : 1.0;
      seats.push({
        seatNumber: `${label}${num}`,
        row: label,
        number: num,
        tier,
        priceMultiplier,
        isAccessible: isWheelchair,
        aisleAfter: aisles.includes(num),
      });
    }
  }

  return { rows, seats, capacity: seats.length };
};

async function migrateTheaters() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected.');

  // Access the raw collection to avoid Mongoose schema casting errors on legacy number fields
  const theaterCol = mongoose.connection.db.collection('theaters');
  const theaters = await theaterCol.find({}).toArray();

  console.log(`Found ${theaters.length} theaters to inspect.`);

  let updatedCount = 0;
  for (const t of theaters) {
    let screensArray = t.screens;

    // If screens is a number or not an array, convert to array of screens
    if (typeof t.screens === 'number' || !Array.isArray(t.screens) || t.screens.length === 0) {
      const screenCount = typeof t.screens === 'number' && t.screens > 0 ? t.screens : 3;
      screensArray = [];

      for (let s = 1; s <= screenCount; s++) {
        const layout = generateDefaultLayout(10, 10);
        screensArray.push({
          _id: new mongoose.Types.ObjectId(),
          name: `Screen ${s}`,
          type: SCREEN_TYPES[(s - 1) % SCREEN_TYPES.length],
          capacity: layout.capacity,
          seatLayout: {
            rows: layout.rows,
            seats: layout.seats,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    const amenities =
      Array.isArray(t.amenities) && t.amenities.length > 0
        ? t.amenities
        : Array.isArray(t.facilities) && t.facilities.length > 0
          ? t.facilities
          : ['Dolby Atmos', 'Parking', 'Food Court'];

    const updateFields = {
      screens: screensArray,
      amenities,
      facilities: amenities,
      isActive: t.isActive !== undefined ? t.isActive : true,
      deletedAt: t.deletedAt || null,
    };

    await theaterCol.updateOne({ _id: t._id }, { $set: updateFields });
    updatedCount++;
    console.log(`✓ Migrated theater "${t.name}" (${t.city}) with ${screensArray.length} screens.`);
  }

  console.log(
    `\n🎉 Successfully migrated ${updatedCount} theaters to Phase 4.3 multi-screen layout!`
  );
  await mongoose.disconnect();
}

migrateTheaters().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
