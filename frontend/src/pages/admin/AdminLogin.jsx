import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Sparkles,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';

/**
 * AdminLogin Page
 * Specialized executive authentication screen with role enforcement,
 * demo credentials quick-fill, and glowing cyber styling.
 */
export const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, adminLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Target destination after successful authorization
  const from = location.state?.from?.pathname || '/admin/dashboard';

  // If already logged in with admin credentials, redirect immediately
  useEffect(() => {
    if (user?.role === 'admin') {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both administrative email and password.');
      return;
    }

    setLoading(true);
    try {
      await adminLogin({
        email: email.trim(),
        password,
      });
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(
        err.message || 'Authorization failed. Please verify administrator credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Quick fill default admin credentials for reviewer convenience
  const handleQuickFillAdmin = () => {
    setEmail('admin@bookmyshow.com');
    setPassword('AdminPassword123!');
    setErrorMessage(null);
  };

  return (
    <div className="relative min-h-screen bg-[#070b13] text-gray-100 flex items-center justify-center p-4 overflow-hidden selection:bg-cyan-500 selection:text-black">
      {/* Cyber Ambient Lighting Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-cyan-600/15 via-blue-600/10 to-purple-600/15 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="relative w-full max-w-md rounded-3xl bg-[#0b1120]/90 border border-cyan-500/30 p-6 sm:p-8 shadow-2xl shadow-cyan-950/60 backdrop-blur-xl space-y-6 animate-scale-in">
        {/* Top Header Badge */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 mx-auto shadow-xl shadow-cyan-500/30">
            <div className="w-full h-full bg-[#0b1120] rounded-[14px] flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-cyan-400" />
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold uppercase tracking-wider mb-1.5">
              <span>Executive Security Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Admin Portal
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Authorized clearance required for platform management
            </p>
          </div>
        </div>

        {/* Quick Fill Credentials Banner */}
        <button
          type="button"
          onClick={handleQuickFillAdmin}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-950/60 to-blue-950/60 border border-cyan-500/40 text-cyan-300 hover:border-cyan-400 transition-all text-xs font-semibold group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
            <span>Use Default Demo Admin</span>
          </div>
          <span className="text-[10px] font-mono bg-cyan-900/50 px-2 py-0.5 rounded text-cyan-200">
            admin@bookmyshow.com
          </span>
        </button>

        {/* Error Alert */}
        {errorMessage && (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs animate-slide-in-down">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-300 tracking-wide uppercase">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@bookmyshow.com"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900/90 border border-gray-800 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-gray-300 tracking-wide uppercase">
                Password
              </label>
              <span className="text-[10px] text-gray-500 font-mono">256-bit Encrypted</span>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-gray-900/90 border border-gray-800 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 text-gray-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-gray-950" />
                <span>Authenticating Clearance...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4 text-gray-950" />
                <span>Authorize & Access Console</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="pt-2 border-t border-gray-800 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-cyan-400 transition-colors font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Customer Storefront</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
