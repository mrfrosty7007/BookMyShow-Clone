/**
 * Application Constants
 */
export const APP_CONFIG = {
  name: 'BookMyShow Clone',
  tagline: 'MERN Stack Architecture • Phase 0 Foundation',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  version: '0.1.0',
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
      'Vite + React 19, Tailwind CSS, React Router DOM, Express API, MongoDB connection, ESLint, Prettier.',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  },
  {
    phase: 'Phase 1',
    title: 'Authentication & Roles',
    status: 'Upcoming',
    description:
      'User registration, JWT authentication, password hashing, role-based access (User / Admin / Partner).',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  },
  {
    phase: 'Phase 2',
    title: 'Movies & Theatres Catalog',
    status: 'Upcoming',
    description:
      'Movie metadata, genres, languages, cinema locations, showtimes, filtering & searching.',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
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
