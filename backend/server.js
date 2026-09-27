import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './app.js';
import { connectDB } from './config/db.js';
import { initSocket } from './socket/index.js';

// Resolve directory name for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables (checking backend/.env and root .env)
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PORT = process.env.PORT || 5000;

/**
 * Start the Express server and connect to MongoDB
 */
const startServer = async () => {
  try {
    // Connect to MongoDB before accepting incoming HTTP requests
    const conn = await connectDB();
    if (!conn && process.env.NODE_ENV === 'production') {
      console.error('[Server] Database connection failed in production.');
      process.exit(1);
    }

    // Wrap Express app with HTTP server for Socket.IO integration
    const httpServer = http.createServer(app);

    // Initialize Socket.IO with real-time seat locking
    initSocket(httpServer);

    const server = httpServer.listen(PORT, () => {
      console.log(`[Server] BookMyShow Clone API running on port ${PORT}`);
      console.log(`[Server] Health endpoint: http://localhost:${PORT}/api/health`);
      console.log(`[Server] Real-time Socket.IO initialized on port ${PORT}`);
    });

    // Handle unhandled rejections gracefully
    process.on('unhandledRejection', (err) => {
      console.error(`[Server] Unhandled Rejection: ${err.message}`);
      server.close(() => process.exit(1));
    });
  } catch (error) {
    console.error(`[Server] Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
