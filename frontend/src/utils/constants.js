/**
 * Application Constants
 */
export const APP_CONFIG = {
  name: 'BookMyShow Clone',
  tagline: 'MERN Stack Architecture • Phase 1 Authentication Active',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  version: '0.2.0',
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
    title: 'Movies & Theatres Catalog',
    status: 'Next Up',
    description:
      'Movie metadata, genres, languages, cinema locations, showtimes, filtering & searching.',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  },
  {
    phase: 'Phase 3',
    title: 'Interactive Seat Layout',
    status: 'Upcoming',
    description:
      'Dynamic cinema auditorium seat grid, tier pricing (Silver / Gold / Recliner), real-time seat locks.',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  },
  {
    phase: 'Phase 4',
    title: 'Booking Engine & Payments',
    status: 'Upcoming',
    description:
      'Order checkout, payment gateway integration, QR ticket generation, email confirmations.',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  },
  {
    phase: 'Phase 5',
    title: 'Admin Dashboard & Analytics',
    status: 'Upcoming',
    description: 'Revenue graphs, theatre management, show scheduler, ticket validation scanner.',
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  },
];
