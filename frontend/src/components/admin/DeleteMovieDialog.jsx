import { EyeOff, Loader2 } from 'lucide-react';

/**
 * DeleteMovieDialog Component
 * Modern confirmation modal for soft-deleting / hiding movies without losing historical booking data.
 */
export const DeleteMovieDialog = ({ isOpen, onClose, onConfirm, movie, loading = false }) => {
  if (!isOpen || !movie) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-md rounded-3xl bg-[#0b1120] border border-rose-500/40 p-6 sm:p-7 shadow-2xl shadow-rose-950/50 text-gray-100 animate-scale-in space-y-5">
        {/* Warning Icon */}
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-950/40">
          <EyeOff className="w-7 h-7" />
        </div>

        {/* Text Content */}
        <div className="text-center space-y-2">
          <span className="px-3 py-0.5 rounded-full bg-rose-950/70 border border-rose-500/40 text-rose-300 text-[10px] font-bold uppercase tracking-wider">
            Soft Delete Protection
          </span>
          <h3 className="text-xl font-black text-white tracking-tight">
            Hide &ldquo;{movie.title}&rdquo;?
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed max-w-sm mx-auto">
            This movie will be immediately hidden from customer search, listings, and the hero
            banner. All historical bookings, analytics, and show records will remain safely
            preserved.
          </p>
        </div>

        {/* Movie Summary Chip */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-900/80 border border-gray-800 text-xs">
          {movie.poster && (
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-8 h-12 object-cover rounded shadow"
            />
          )}
          <div className="flex-1 min-w-0 text-left">
            <h4 className="font-bold text-white truncate">{movie.title}</h4>
            <p className="text-[11px] text-gray-400">
              {Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre} • {movie.duration}
              m
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => onConfirm(movie)}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Hiding...</span>
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4 text-white" />
                <span>Hide Movie</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteMovieDialog;
