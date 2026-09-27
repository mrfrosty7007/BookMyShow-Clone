import mongoose from 'mongoose';

/**
 * Connect to MongoDB database using Mongoose
 * Reads connection URI from MONGODB_URI environment variable
 * Handles connection success, failure, and graceful shutdown
 * @returns {Promise<typeof mongoose | null>}
 */
export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bookmyshow_clone';

  // Connection events
  mongoose.connection.on('connected', () => {
    console.log(`[MongoDB] Connected to database: ${mongoose.connection.name}`);
  });

  mongoose.connection.on('error', (err) => {
    console.error(`[MongoDB] Connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] Connection disconnected');
  });

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // 5s timeout for cloud Atlas resilience
    });

    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection failed: ${error.message}`);
    console.warn(
      '[MongoDB] Please ensure MongoDB is running locally or specify a valid MONGODB_URI in your .env file.'
    );
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    return null;
  }
};

/**
 * Graceful shutdown handler for MongoDB connection
 * @param {string} signal - The termination signal received
 */
export const handleGracefulShutdown = async (signal = 'SIGINT') => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close(false);
      console.log(`[MongoDB] Connection closed successfully via ${signal}`);
    }
  } catch (err) {
    console.error(`[MongoDB] Error during graceful shutdown: ${err.message}`);
  }
};
