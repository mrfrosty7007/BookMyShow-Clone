import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/index.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Body parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    },
  });
});

// 404 Catch-all Handler
app.use(notFoundHandler);

// Centralized Error-handling Middleware Scaffold
app.use(errorHandler);

export default app;
