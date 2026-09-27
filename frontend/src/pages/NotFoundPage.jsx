import { Link } from 'react-router-dom';
import { Film, Home, ArrowLeft } from 'lucide-react';

/**
 * 404 Not Found Page
 */
export const NotFoundPage = () => {
  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-[#f84464]/10 border border-[#f84464]/30 text-[#f84464] flex items-center justify-center mx-auto mb-6">
          <Film className="w-8 h-8" />
        </div>
        <span className="text-sm font-mono font-bold text-[#f84464] tracking-widest uppercase">
          404 Error
        </span>
        <h1 className="mt-2 text-3xl font-extrabold text-white font-heading">Screen Not Found</h1>
        <p className="mt-3 text-sm text-gray-400 leading-relaxed">
          The page you are looking for doesn&apos;t exist or has been relocated to another showtime.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#f84464] to-[#e03150] text-white text-sm font-semibold hover:opacity-95 shadow-lg shadow-[#f84464]/20 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-300 text-sm font-semibold border border-gray-800 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
