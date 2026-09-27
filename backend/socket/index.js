import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { registerSeatEvents, startLockReaper } from './seatEvents.js';
import User from '../models/User.js';

let ioInstance = null;

/**
 * Parse cookies from raw cookie header string
 * @param {string} cookieHeader
 * @returns {Record<string, string>}
 */
const parseCookies = (cookieHeader) => {
  if (!cookieHeader) return {};
  return cookieHeader.split(';').reduce((acc, str) => {
    const [key, ...val] = str.trim().split('=');
    if (key) acc[key] = decodeURIComponent(val.join('='));
    return acc;
  }, {});
};

/**
 * Initialize Socket.IO instance and register middleware & event handlers
 * @param {import('http').Server} httpServer
 * @returns {Server}
 */
export const initSocket = (httpServer) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://localhost:3000',
    process.env.CLIENT_URL,
  ].filter(Boolean);

  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`Origin ${origin} not allowed by Socket.IO CORS`));
        }
      },
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  // Authentication Middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const cookies = parseCookies(socket.handshake.headers.cookie);
      const token = cookies.jwt || socket.handshake.auth?.token;

      if (token) {
        try {
          const secret = process.env.JWT_SECRET || 'bookmyshow_jwt_secret_dev_fallback_key';
          const decoded = jwt.verify(token, secret);
          const user = await User.findById(decoded.userId).select('-password');
          if (user) {
            socket.user = user;
            socket.userId = user._id.toString();
          }
        } catch {
          // Token expired or invalid, will fallback below
        }
      }

      // If not authenticated via JWT, support client session identifier
      if (!socket.userId) {
        const clientUserId = socket.handshake.auth?.userId;
        socket.userId = clientUserId || `guest_${socket.id.slice(0, 8)}`;
      }

      next();
    } catch (err) {
      next(err);
    }
  });

  io.on('connection', (socket) => {
    registerSeatEvents(io, socket);
  });

  // Start background periodic reaper for expired locks
  startLockReaper(io);

  ioInstance = io;
  return io;
};

/**
 * Retrieve the active Socket.IO server instance
 * @returns {Server}
 */
export const getIO = () => {
  if (!ioInstance) {
    throw new Error('Socket.io has not been initialized yet!');
  }
  return ioInstance;
};

export default initSocket;
