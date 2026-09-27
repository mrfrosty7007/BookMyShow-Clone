import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { Loader } from './Loader.jsx';

/**
 * Protected Admin Route Wrapper
 * Ensures the requesting user is authenticated AND possesses the 'admin' role.
 * Redirects unauthenticated requests to /admin/login.
 * Renders an access-denied screen if authenticated as a standard customer.
 */
export const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b13] flex flex-col items-center justify-center gap-3">
        <Loader message="Verifying administrator clearance..." size="lg" />
      </div>
    );
  }

  // Not logged in at all
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Logged in, but lacking administrator role
  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#070b13] text-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl bg-[#0f172a] border border-red-500/40 p-6 sm:p-8 text-center space-y-5 shadow-2xl shadow-red-950/40">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-red-950/60 border border-red-500/30 text-red-300 text-xs font-bold uppercase tracking-wider">
              Access Forbidden
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Admin Privileges Required
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Your account (<strong className="text-gray-200">{user.email}</strong>) is logged in
              with standard customer clearance and cannot access the executive admin console.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a
              href="/"
              className="flex-1 py-3 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Storefront</span>
            </a>
            <a
              href="/admin/login"
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 hover:scale-[1.02] transition-all inline-flex items-center justify-center"
            >
              <span>Switch Account</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return children ? children : <Outlet />;
};

export default AdminRoute;
