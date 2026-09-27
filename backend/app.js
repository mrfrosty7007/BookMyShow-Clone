import helmet from 'helmet';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/index.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Allowed origins for CORS with credentials
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

// CORS configuration (credentials: true requires specific origins, not wildcard)
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
};
app.use(cors(corsOptions));

// Body and Cookie parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Sanitize MongoDB queries to prevent NoSQL injection ($ and . operator injection)
app.use(mongoSanitize());

// Serve static uploaded movie assets
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Centralized API route registration
app.use('/api', apiRoutes);

// Root route
app.get('/', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    name: 'BookMyShow Clone API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        me: 'GET /api/auth/me',
      },
      movies: '/api/movies',
      theaters: '/api/theaters',
      shows: '/api/shows',
    },
  });
});

// 404 Catch-all Handler
app.use(notFoundHandler);

// Centralized Error-handling Middleware Scaffold
app.use(errorHandler);

export default app;
