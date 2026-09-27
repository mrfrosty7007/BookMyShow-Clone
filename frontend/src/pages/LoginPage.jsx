import { Link } from 'react-router-dom';
import { Film, Lock, Mail, ArrowLeft, Info, Sparkles } from 'lucide-react';

/**
 * Login Page Placeholder for Phase 0
 */
export const LoginPage = () => {
  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Placeholder Info Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs flex items-start gap-3 shadow-lg">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-white block mb-0.5">Phase 0 Scaffolding</span>
            This route is reserved for{' '}
            <strong className="text-white">Phase 1 (User Authentication)</strong>. User models, JWT
            tokens, and secure password hashing will be integrated next.
          </div>
        </div>

        {/* Card */}
        <div className="p-8 rounded-3xl bg-gray-900/60 backdrop-blur-xl border border-gray-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#f84464]/10 rounded-full blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#f84464] to-[#ff6b8b] items-center justify-center text-white shadow-lg shadow-[#f84464]/25 mb-3">
              <Film className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-white font-heading">Welcome Back</h1>
            <p className="mt-1 text-sm text-gray-400">Sign in to your BookMyShow Clone account</p>
          </div>

          {/* Form preview (disabled for Phase 0) */}
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  disabled
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-950/80 border border-gray-800 text-gray-400 text-sm placeholder-gray-600 focus:outline-none cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold text-gray-300 uppercase tracking-wider"
                >
                  Password
                </label>
                <span className="text-xs text-gray-500 cursor-not-allowed">Forgot password?</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-password"
                  type="password"
                  disabled
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-950/80 border border-gray-800 text-gray-400 text-sm placeholder-gray-600 focus:outline-none cursor-not-allowed"
                />
              </div>
            </div>

            <button
              type="button"
              disabled
              className="w-full mt-2 py-3 rounded-xl bg-gray-800 text-gray-400 font-semibold text-sm cursor-not-allowed border border-gray-700/60 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#f84464]" />
              <span>Sign In (Enabled in Phase 1)</span>
            </button>
          </form>

          {/* Footer of Card */}
          <div className="mt-6 pt-6 border-t border-gray-800/80 text-center text-xs text-gray-400">
            <span>Don&apos;t have an account? </span>
            <Link to="/register" className="text-[#f84464] hover:underline font-semibold">
              Register here
            </Link>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
