import { Film, Heart, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Reusable Footer Component
 */
export const Footer = () => {
  return (
    <footer className="w-full border-t border-gray-800/80 bg-[#080b12] text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#f84464] to-[#ff6b8b] flex items-center justify-center text-white shadow-md">
                <Film className="w-4 h-4" />
              </div>
              <span className="text-xl font-black text-white font-heading">
                book<span className="text-[#f84464]">my</span>show
                <span className="ml-2 text-xs uppercase px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                  Clone
                </span>
              </span>
            </div>
            <p className="text-sm text-gray-400 max-w-md leading-relaxed">
              An educational full-stack recreation of the BookMyShow platform architecture using the
              MERN stack (MongoDB, Express, React 19, Node.js) with Tailwind CSS.
            </p>
            <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-400">
              <Layers className="w-3.5 h-3.5 text-[#f84464]" />
              <span>Phase 0: Environment, Architecture &amp; Tooling Scaffold</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 font-heading">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home Overview
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Sign In (Placeholder)
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Create Account (Placeholder)
                </Link>
              </li>
              <li>
                <a
                  href="/api/health"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span>Health Route API</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1 rounded">
                    JSON
                  </span>
                </a>
              </li>
            </ul>
          </div>

          {/* Educational Disclaimer */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 font-heading">
              Disclaimer
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              This is an educational clone project developed strictly for learning and software
              architecture demonstrations. It is not affiliated with, endorsed by, or associated
              with BookMyShow or Bigtree Entertainment Pvt. Ltd.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} BookMyShow Clone • Built for learning the MERN Stack.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span>Crafted with</span>
              <Heart className="w-3.5 h-3.5 text-[#f84464] fill-[#f84464]" />
              <span>for MERN Developers</span>
            </span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub Repository"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
