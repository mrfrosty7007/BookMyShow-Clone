import {
  Star,
  Clock,
  Calendar,
  Pencil,
  EyeOff,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Film,
} from 'lucide-react';

/**
 * Format minutes into hours and minutes
 */
const formatDuration = (minutes) => {
  if (!minutes) return '-';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
};

/**
 * Format date string into readable short format
 */
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * MovieTable Component
 * Displays administrative movie catalog records with real-time status badges,
 * featured toggles, and direct CRUD operations.
 */
export const MovieTable = ({
  movies = [],
  onEdit,
  onDelete,
  onRestore,
  onToggleFeatured,
  loading = false,
}) => {
  if (movies.length === 0 && !loading) {
    return (
      <div className="py-16 text-center rounded-2xl bg-[#0b1120]/50 border border-gray-800 p-8 space-y-3">
        <div className="w-12 h-12 rounded-xl bg-gray-800/80 text-gray-400 flex items-center justify-center mx-auto">
          <Film className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-white">No Movies Found</h4>
        <p className="text-xs text-gray-400 max-w-sm mx-auto">
          No titles matched your active query filters. Try adjusting search terms or add a new
          movie.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-[#0b1120]/90 border border-gray-800 shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-gray-300">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-900/60 text-gray-400 text-[11px] font-bold uppercase tracking-wider">
              <th className="py-4 pl-4 sm:pl-6 pr-3">Poster</th>
              <th className="py-4 px-3">Title & Certificate</th>
              <th className="py-4 px-3">Genres</th>
              <th className="py-4 px-3">Language</th>
              <th className="py-4 px-3">Runtime</th>
              <th className="py-4 px-3">Release Date</th>
              <th className="py-4 px-3">Rating</th>
              <th className="py-4 px-3 text-center">Featured</th>
              <th className="py-4 px-3 text-center">Status</th>
              <th className="py-4 pr-4 sm:pr-6 pl-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {movies.map((movie) => {
              const genres = Array.isArray(movie.genre)
                ? movie.genre
                : [movie.genre].filter(Boolean);
              const languages = Array.isArray(movie.language)
                ? movie.language
                : [movie.language].filter(Boolean);

              return (
                <tr
                  key={movie._id}
                  className={`hover:bg-gray-800/30 transition-colors ${
                    !movie.isActive ? 'opacity-65 bg-gray-950/40' : ''
                  }`}
                >
                  {/* Poster Thumbnail */}
                  <td className="py-3 pl-4 sm:pl-6 pr-3">
                    <div className="w-10 h-14 rounded-lg overflow-hidden bg-gray-900 border border-gray-800 flex-shrink-0 shadow-sm relative group">
                      {movie.poster ? (
                        <img
                          src={movie.poster}
                          alt={movie.title}
                          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                          <Film className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Title & Certificate */}
                  <td className="py-3 px-3">
                    <div className="flex flex-col gap-1 max-w-[200px]">
                      <span className="font-bold text-white text-sm line-clamp-1">
                        {movie.title}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-gray-800 text-[10px] font-bold text-gray-300 border border-gray-700">
                          {movie.certificate || 'U/A'}
                        </span>
                        {movie.trailer && (
                          <span className="text-[10px] text-cyan-400 font-mono">
                            Trailer Available
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Genres */}
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1 max-w-[150px]">
                      {genres.map((g) => (
                        <span
                          key={g}
                          className="px-2 py-0.5 rounded-full bg-cyan-950/50 border border-cyan-800/40 text-cyan-300 text-[10px] font-medium"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Language */}
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1 max-w-[120px] font-medium text-gray-300">
                      {languages.join(', ') || 'English'}
                    </div>
                  </td>

                  {/* Runtime */}
                  <td className="py-3 px-3 font-mono text-gray-300 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-500" />
                      <span>{formatDuration(movie.duration)}</span>
                    </div>
                  </td>

                  {/* Release Date */}
                  <td className="py-3 px-3 font-mono text-gray-400 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-500" />
                      <span>{formatDate(movie.releaseDate)}</span>
                    </div>
                  </td>

                  {/* Rating */}
                  <td className="py-3 px-3 font-mono whitespace-nowrap">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-950/40 border border-amber-500/30 text-amber-300 font-bold text-xs">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{Number(movie.rating || 0).toFixed(1)}</span>
                    </div>
                  </td>

                  {/* Featured Status Toggle */}
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => onToggleFeatured(movie)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        movie.featured
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm shadow-amber-500/30 hover:bg-amber-500/30'
                          : 'bg-gray-800 text-gray-400 border border-gray-700 hover:text-white hover:border-gray-600'
                      }`}
                      title={
                        movie.featured ? 'Click to unfeature' : 'Click to feature in Hero Banner'
                      }
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{movie.featured ? 'Featured' : 'Standard'}</span>
                    </button>
                  </td>

                  {/* Active / Inactive Status */}
                  <td className="py-3 px-3 text-center">
                    {movie.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Active</span>
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-800 border border-gray-700 text-gray-400"
                        title={
                          movie.deletedAt ? `Hidden on ${formatDate(movie.deletedAt)}` : 'Hidden'
                        }
                      >
                        <EyeOff className="w-3 h-3" />
                        <span>Hidden</span>
                      </span>
                    )}
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3 pr-4 sm:pr-6 pl-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => onEdit(movie)}
                        className="p-1.5 rounded-lg bg-gray-800 hover:bg-cyan-950/60 border border-gray-700 hover:border-cyan-500/50 text-gray-300 hover:text-cyan-300 transition-colors cursor-pointer"
                        title="Edit Movie Details"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      {/* Hide (Soft Delete) or Restore */}
                      {movie.isActive ? (
                        <button
                          type="button"
                          onClick={() => onDelete(movie)}
                          className="p-1.5 rounded-lg bg-gray-800 hover:bg-rose-950/60 border border-gray-700 hover:border-rose-500/50 text-gray-300 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Hide from Storefront"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onRestore(movie)}
                          className="p-1.5 rounded-lg bg-gray-800 hover:bg-emerald-950/60 border border-gray-700 hover:border-emerald-500/50 text-gray-300 hover:text-emerald-400 transition-colors cursor-pointer"
                          title="Restore to Storefront"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MovieTable;
