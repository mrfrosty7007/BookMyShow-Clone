import { Link } from 'react-router-dom';
import {
  Film,
  Server,
  Database,
  Code2,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Cpu,
  Layers,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { useApiHealth } from '../hooks/useApiHealth.js';
import { ROADMAP_PHASES } from '../utils/constants.js';

/**
 * Professional Landing Page for Phase 0
 */
export const HomePage = () => {
  const { data: healthData, loading, error, isConnected, refetch } = useApiHealth();

  return (
    <div className="w-full pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Subtle Phase 0 Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#f84464]/15 to-[#3b82f6]/15 border border-[#f84464]/30 text-[#f84464] text-xs font-semibold uppercase tracking-wider mb-6 animate-fade-in shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#f84464]" />
          <span>Phase 0 • Architectural Foundation Complete</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white font-heading max-w-4xl mx-auto leading-tight sm:leading-none">
          Book<span className="text-[#f84464]">My</span>Show{' '}
          <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Clone
          </span>
        </h1>

        {/* Short Project Description */}
        <p className="mt-6 text-base sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          An educational, production-ready MERN application recreation of the BookMyShow experience.
          Engineered for high performance, modularity, and seamless scalability into ticket
          bookings.
        </p>

        {/* Hero CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#architecture"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#f84464] to-[#e03150] text-white font-semibold text-sm hover:opacity-95 shadow-lg shadow-[#f84464]/30 hover:shadow-xl hover:shadow-[#f84464]/40 transition-all duration-200"
          >
            <span>Explore Architecture</span>
            <ArrowRight className="w-4 h-4" />
          </a>

          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gray-900/80 hover:bg-gray-800 text-gray-200 font-semibold text-sm border border-gray-700/80 hover:border-gray-600 transition-all duration-200"
          >
            <span>Preview Auth Scaffolding</span>
          </Link>
        </div>

        {/* Live System Diagnostics Card */}
        <div className="mt-14 max-w-2xl mx-auto rounded-2xl bg-gray-900/60 backdrop-blur-md border border-gray-800 p-6 text-left shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#f84464]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between pb-4 border-b border-gray-800">
            <div className="flex items-center gap-2.5">
              <Terminal className="w-4 h-4 text-[#f84464]" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                Live Backend Diagnostics
              </span>
            </div>
            <button
              type="button"
              onClick={refetch}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white px-2.5 py-1 rounded-lg bg-gray-800/80 hover:bg-gray-700 transition-colors disabled:opacity-50"
              title="Ping backend health route"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              <span>Ping API</span>
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800/60 flex items-start justify-between">
              <div>
                <span className="text-gray-400 block mb-1">Express API Status</span>
                <span
                  className={`font-semibold text-sm flex items-center gap-1.5 ${
                    isConnected ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                    }`}
                  />
                  {loading
                    ? 'Checking...'
                    : isConnected
                      ? 'Operational (200 OK)'
                      : 'Offline / Error'}
                </span>
              </div>
              <Server className="w-4 h-4 text-gray-400" />
            </div>

            <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800/60 flex items-start justify-between">
              <div>
                <span className="text-gray-400 block mb-1">Health Route Message</span>
                <span className="font-semibold text-sm text-gray-200 block truncate">
                  {loading
                    ? 'Pinging /api/health...'
                    : healthData?.message || error || 'Check local backend'}
                </span>
              </div>
              <Code2 className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-800/60 flex items-center justify-between text-[11px] text-gray-400">
            <span>Route: GET /api/health</span>
            <span>Target: http://localhost:5000</span>
          </div>
        </div>
      </section>

      {/* Architecture Highlights Section */}
      <section id="architecture" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-4xl font-bold text-white font-heading">
            Modern MERN Architecture
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-400">
            Modular, decoupled, and standardized across both frontend and backend layers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: React 19 + Vite */}
          <div className="p-6 rounded-2xl bg-gray-900/40 border border-gray-800 hover:border-gray-700 transition-all duration-200 group">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-heading">React 19 + Vite</h3>
            <p className="mt-2 text-sm text-gray-400 leading-relaxed">
              Blazing fast development server with native ES modules, React 19 concurrent features,
              and optimized production builds.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5 text-[11px] text-blue-300 font-mono">
              <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                React 19
              </span>
              <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                Vite 8
              </span>
            </div>
          </div>

          {/* Card 2: Tailwind CSS */}
          <div className="p-6 rounded-2xl bg-gray-900/40 border border-gray-800 hover:border-gray-700 transition-all duration-200 group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-heading">Tailwind CSS</h3>
            <p className="mt-2 text-sm text-gray-400 leading-relaxed">
              Modern utility-first styling with custom BookMyShow brand palettes, responsive
              breakpoints, and sleek glassmorphism.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5 text-[11px] text-cyan-300 font-mono">
              <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                Tailwind v4
              </span>
              <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                Custom Theme
              </span>
            </div>
          </div>

          {/* Card 3: React Router DOM */}
          <div className="p-6 rounded-2xl bg-gray-900/40 border border-gray-800 hover:border-gray-700 transition-all duration-200 group">
            <div className="w-12 h-12 rounded-xl bg-[#f84464]/10 border border-[#f84464]/20 text-[#f84464] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <Film className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-heading">React Router DOM</h3>
            <p className="mt-2 text-sm text-gray-400 leading-relaxed">
              Client-side navigation with declarative route configuration, shared layouts, and
              placeholder routes for upcoming phases.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5 text-[11px] text-[#f84464] font-mono">
              <span className="px-2 py-0.5 rounded bg-[#f84464]/10 border border-[#f84464]/20">
                React Router v7
              </span>
              <span className="px-2 py-0.5 rounded bg-[#f84464]/10 border border-[#f84464]/20">
                Outlets
              </span>
            </div>
          </div>

          {/* Card 4: Node.js & Express */}
          <div className="p-6 rounded-2xl bg-gray-900/40 border border-gray-800 hover:border-gray-700 transition-all duration-200 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <Server className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-heading">Node.js + Express</h3>
            <p className="mt-2 text-sm text-gray-400 leading-relaxed">
              Decoupled Express application with CORS, centralized route registration, body parsers,
              and standardized error middlewares.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5 text-[11px] text-emerald-300 font-mono">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                Node.js 22 LTS
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                Express 4
              </span>
            </div>
          </div>

          {/* Card 5: MongoDB & Mongoose */}
          <div className="p-6 rounded-2xl bg-gray-900/40 border border-gray-800 hover:border-gray-700 transition-all duration-200 group">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-heading">MongoDB + Mongoose</h3>
            <p className="mt-2 text-sm text-gray-400 leading-relaxed">
              Asynchronous Mongoose connector with success/failure event telemetry and
              SIGINT/SIGTERM graceful connection shutdown hooks.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5 text-[11px] text-amber-300 font-mono">
              <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                Mongoose 8
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                Graceful Exit
              </span>
            </div>
          </div>

          {/* Card 6: Tooling & Code Quality */}
          <div className="p-6 rounded-2xl bg-gray-900/40 border border-gray-800 hover:border-gray-700 transition-all duration-200 group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-heading">ESLint &amp; Prettier</h3>
            <p className="mt-2 text-sm text-gray-400 leading-relaxed">
              Configured linting rules and code formatting pipelines to enforce high code quality
              and consistency across the entire codebase.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5 text-[11px] text-purple-300 font-mono">
              <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                ESLint 9
              </span>
              <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                Prettier 3
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800 border border-gray-700 text-xs font-semibold text-gray-300 mb-3">
            <Layers className="w-3.5 h-3.5 text-[#f84464]" />
            <span>Development Milestones</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-white font-heading">
            Project Evolution Roadmap
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-400">
            A step-by-step path from Phase 0 foundation to complete enterprise booking application.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ROADMAP_PHASES.map((item) => (
            <div
              key={item.phase}
              className={`p-6 rounded-2xl bg-gray-900/50 border transition-all ${
                item.status === 'Completed'
                  ? 'border-emerald-500/40 bg-emerald-950/10'
                  : 'border-gray-800'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-gray-400">{item.phase}</span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold flex items-center gap-1 ${item.badgeColor}`}
                >
                  {item.status === 'Completed' ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : (
                    <Clock className="w-3 h-3" />
                  )}
                  {item.status}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white font-heading">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-400 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
