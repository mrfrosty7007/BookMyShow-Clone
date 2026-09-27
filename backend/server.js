import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './app.js';
import { connectDB, handleGracefulShutdown } from './config/db.js';
import { initSocket } from './socket/index.js';

// Resolve directory name for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables (checking backend/.env and root .env)
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Production environment variable validation
if (process.env.NODE_ENV === 'production') {
  const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'CLIENT_URL'];
  const missing = requiredEnvVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    console.error(
      `[Server] FATAL: Missing required production environment variables: ${missing.join(', ')}`
    );
    process.exit(1);
  }
}

const PORT = process.env.PORT || 5000;

/**
 * Start the Express server and connect to MongoDB
 */
const startServer = async () => {
  try {
    // 1. Await database connection before accepting incoming requests
    const conn = await connectDB();
    if (!conn && process.env.NODE_ENV === 'production') {
      console.error('[Server] Database connection failed in production.');
      process.exit(1);
    }

    // 2. Wrap Express app with HTTP server for Socket.IO integration
    const httpServer = http.createServer(app);

    // 3. Initialize Socket.IO with real-time seat locking
    initSocket(httpServer);

    // 4. Start HTTP listening
    const server = httpServer.listen(PORT, () => {
      console.log(`[Server] BookMyShow Clone API running on port ${PORT}`);
      console.log(`[Server] Health endpoint: http://localhost:${PORT}/api/health`);
      console.log(`[Server] Real-time Socket.IO initialized on port ${PORT}`);
    });

    // 5. Coordinated graceful shutdown handler (SIGINT / SIGTERM)
    const gracefulShutdown = (signal) => {
      console.log(`[Server] Received ${signal}. Commencing graceful shutdown...`);
      server.close(async () => {
        console.log('[Server] HTTP server closed.');
        await handleGracefulShutdown(signal);
        console.log('[Server] Graceful shutdown complete. Exiting process.');
        process.exit(0);
      });

      // Force process exit if connections fail to close within 10 seconds
      setTimeout(() => {
        console.error('[Server] Graceful shutdown timeout exceeded. Forcing exit.');
        process.exit(1);
      }, 10000).unref();
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

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
