/**
 * Application Constants
 */
const resolveApiBaseUrl = () => {
  const rawUrl = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api').trim();
  const trimmed = rawUrl.replace(/\/+$/, '');
  if (!trimmed || trimmed === '/api') return '/api';
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

export const APP_CONFIG = {
  name: 'BookMyShow Clone',
  tagline: 'MERN Stack Architecture • Production Release v1.0.0',
  apiBaseUrl: resolveApiBaseUrl(),
  version: '1.0.0',
};

export const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'Login', path: '/login' },
  { name: 'Register', path: '/register' },
];

export const ROADMAP_PHASES = [
  {
    phase: 'Phase 0',
    title: 'Architecture & Tooling Foundation',
    status: 'Completed',
    description:
      'Vite + React 19, Tailwind CSS, React Router DOM, Express API, MongoDB Atlas, ESLint, Prettier.',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  },
  {
    phase: 'Phase 1',
    title: 'Authentication & Roles',
    status: 'Completed',
    description:
      'User registration, bcryptjs password hashing (12 rounds), HTTP-only JWT cookies, express-validator, ProtectedRoute, AuthContext.',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  },
  {
    phase: 'Phase 2',
    title: 'Movies & Theaters Catalog',
    status: 'Completed',
    description:
      'Movie catalog, showtime selection, multi-city filtering, real-time availability tracking.',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  },
  {
    phase: 'Phase 3',
    title: 'Seat Grid & Real-time Locking',
    status: 'Completed',
    description:
      'Dynamic cinema auditorium seat grid, tier pricing, Socket.IO real-time temporary locking, QR ticketing.',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  },
  {
    phase: 'Phase 4',
    title: 'Admin Suite & Operations',
    status: 'Completed',
    description:
      'Movie/Theater CMS, Visual Seat Builder, Conflict-aware Show Scheduling, Gate Scanner, Refunds, Audit Trails, Executive Analytics.',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  },
  {
    phase: 'Phase 5',
    title: 'Production Hardening & Deployment',
    status: 'Completed',
    description:
      'Trust proxy, API rate limiting, Railway & Vercel deployment configs, graceful shutdown, health monitoring.',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  },
];
