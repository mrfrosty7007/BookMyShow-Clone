import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Film,
  Lock,
  Mail,
  User as UserIcon,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';

/**
 * Interactive Register Page for Phase 1 Authentication
 */
export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect to home
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const validate = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setApiError('');

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
      navigate('/', { replace: true });
    } catch (err) {
      setApiError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="p-8 rounded-3xl bg-gray-900/60 backdrop-blur-xl border border-gray-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#f84464]/10 rounded-full blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#f84464] to-[#ff6b8b] items-center justify-center text-white shadow-lg shadow-[#f84464]/25 mb-3">
              <Film className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-white font-heading">Create an Account</h1>
            <p className="mt-1 text-sm text-gray-400">
              Join BookMyShow Clone to unlock movie ticket bookings
            </p>
          </div>

          {/* Error Banner */}
          {apiError && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="reg-name"
                className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2"
              >
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="reg-name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  autoComplete="name"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-950/80 border text-gray-100 text-sm placeholder-gray-600 focus:outline-none focus:ring-2 transition-all ${
                    formErrors.name
                      ? 'border-rose-500 focus:ring-rose-500/30'
                      : 'border-gray-800 focus:border-[#f84464] focus:ring-[#f84464]/20'
                  }`}
                />
              </div>
              {formErrors.name && <p className="mt-1.5 text-xs text-rose-400">{formErrors.name}</p>}
            </div>

            <div>
              <label
                htmlFor="reg-email"
                className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  autoComplete="email"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-950/80 border text-gray-100 text-sm placeholder-gray-600 focus:outline-none focus:ring-2 transition-all ${
                    formErrors.email
                      ? 'border-rose-500 focus:ring-rose-500/30'
                      : 'border-gray-800 focus:border-[#f84464] focus:ring-[#f84464]/20'
                  }`}
                />
              </div>
              {formErrors.email && (
                <p className="mt-1.5 text-xs text-rose-400">{formErrors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="reg-password"
                className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="reg-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-gray-950/80 border text-gray-100 text-sm placeholder-gray-600 focus:outline-none focus:ring-2 transition-all ${
                    formErrors.password
                      ? 'border-rose-500 focus:ring-rose-500/30'
                      : 'border-gray-800 focus:border-[#f84464] focus:ring-[#f84464]/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formErrors.password && (
                <p className="mt-1.5 text-xs text-rose-400">{formErrors.password}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="reg-confirm-password"
                className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="reg-confirm-password"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-950/80 border text-gray-100 text-sm placeholder-gray-600 focus:outline-none focus:ring-2 transition-all ${
                    formErrors.confirmPassword
                      ? 'border-rose-500 focus:ring-rose-500/30'
                      : 'border-gray-800 focus:border-[#f84464] focus:ring-[#f84464]/20'
                  }`}
                />
              </div>
              {formErrors.confirmPassword && (
                <p className="mt-1.5 text-xs text-rose-400">{formErrors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-[#f84464] to-[#e03150] hover:opacity-95 text-white font-semibold text-sm shadow-lg shadow-[#f84464]/25 hover:shadow-xl hover:shadow-[#f84464]/35 border border-transparent disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Register</span>
              )}
            </button>
          </form>

          {/* Footer of Card */}
          <div className="mt-6 pt-6 border-t border-gray-800/80 text-center text-xs text-gray-400">
            <span>Already have an account? </span>
            <Link to="/login" className="text-[#f84464] hover:underline font-semibold">
              Sign in instead
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

export default RegisterPage;
