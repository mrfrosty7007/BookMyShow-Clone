import 'dotenv/config';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';

export const DEFAULT_ADMIN = {
  name: 'System Administrator',
  email: process.env.ADMIN_EMAIL || 'admin@bookmyshow.com',
  password: process.env.ADMIN_PASSWORD || 'AdminPassword123!',
  role: 'admin',
};

/**
 * Seed or verify default admin account in MongoDB Atlas
 * Uses bcrypt hashing automatically via Mongoose pre-save hook
 */
export const seedAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ email: DEFAULT_ADMIN.email.toLowerCase() }).select(
      '+password'
    );

    if (existingAdmin) {
      // Ensure user has admin privileges
      let changed = false;
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        changed = true;
      }

      // Verify or update password
      const isMatch = await existingAdmin.matchPassword(DEFAULT_ADMIN.password);
      if (!isMatch) {
        existingAdmin.password = DEFAULT_ADMIN.password;
        changed = true;
      }

      if (changed) {
        await existingAdmin.save();
        console.log(`[Admin Seed] Updated existing user ${DEFAULT_ADMIN.email} to active Admin.`);
      } else {
        console.log(`[Admin Seed] Verified existing Admin: ${DEFAULT_ADMIN.email}`);
      }

      return existingAdmin;
    }

    // Create new admin account
    const newAdmin = await User.create({
      name: DEFAULT_ADMIN.name,
      email: DEFAULT_ADMIN.email,
      password: DEFAULT_ADMIN.password,
      role: DEFAULT_ADMIN.role,
    });

    console.log(`[Admin Seed] Created default Admin account: ${newAdmin.email}`);
    return newAdmin;
  } catch (error) {
    console.error('[Admin Seed] Error seeding admin account:', error.message);
    throw error;
  }
};

// Execute directly if run via CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  (async () => {
    try {
      await connectDB();
      await seedAdmin();
      await mongoose.connection.close();
      process.exit(0);
    } catch (err) {
      console.error(err);
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
      }
      process.exit(1);
    }
  })();
}
