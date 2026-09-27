import { User, Mail, Shield, Calendar, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';

/**
 * Protected User Profile Page
 */
export const ProfilePage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-3xl bg-gray-900/60 backdrop-blur-xl border border-gray-800 p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#f84464]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-gray-800">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#f84464] to-[#ff6b8b] flex items-center justify-center text-white text-2xl font-bold font-heading shadow-xl shadow-[#f84464]/25">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white font-heading">{user?.name}</h1>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Authenticated
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-0.5">{user?.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800/80 hover:bg-rose-500/20 text-gray-300 hover:text-rose-300 border border-gray-700/80 hover:border-rose-500/30 transition-all text-sm font-semibold"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Profile Details Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-gray-950/60 border border-gray-800/80 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-gray-500 block">Full Name</span>
              <span className="text-sm font-semibold text-gray-200">{user?.name}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-950/60 border border-gray-800/80 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-gray-500 block">Email Address</span>
              <span className="text-sm font-semibold text-gray-200">{user?.email}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-950/60 border border-gray-800/80 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#f84464]/10 border border-[#f84464]/20 text-[#f84464] flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-gray-500 block">Account Role</span>
              <span className="text-sm font-semibold text-gray-200 uppercase tracking-wider">
                {user?.role || 'user'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-950/60 border border-gray-800/80 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-gray-500 block">Member Since</span>
              <span className="text-sm font-semibold text-gray-200">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Phase 1'}
              </span>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-8 p-4 rounded-2xl bg-gray-950/40 border border-gray-800/60 text-xs text-gray-400 flex items-center justify-between">
          <span>Session Authentication: HTTP-only Secure JWT Cookie</span>
          <span className="text-emerald-400 font-semibold">Active &amp; Protected</span>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
