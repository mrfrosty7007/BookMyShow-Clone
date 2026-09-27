import { Star, Clock, ShieldCheck, Film } from 'lucide-react';

/**
 * Format minutes into hours and minutes
 */
const formatDuration = (minutes) => {
  if (!minutes) return '';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
};

/**
 * ShowHeader Component
 * Displays movie metadata (poster, title, rating, genre, runtime, certification)
 * for the ShowDetails page
 */
export const ShowHeader = ({ movie }) => {
  if (!movie) return null;

  const { title, poster, rating = 0, genre = [], duration, certificate = 'U/A', language } = movie;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900/95 via-gray-900/85 to-[#0f172a]/90 border border-gray-800/80 shadow-xl shadow-black/60 p-4 sm:p-6 backdrop-blur-xl">
      {/* Cyan/Blue ambient glow */}
      <div className="pointer-events-none absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 w-48 h-48 bg-[#f84464]/10 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6">
        {/* Movie Poster */}
        <div className="w-28 sm:w-32 md:w-36 flex-shrink-0">
          <div className="aspect-[2/3] rounded-xl overflow-hidden border border-gray-700/60 shadow-lg shadow-black/80 bg-gray-950">
            <img
              src={poster}
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60';
              }}
            />
          </div>
        </div>

        {/* Movie Metadata */}
        <div className="flex-1 space-y-3 text-center sm:text-left">
          {/* Certificate & Language */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            {certificate && (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3" />
                {certificate}
              </span>
            )}

            {language && (
              <span className="px-2.5 py-0.5 rounded-md bg-gray-800 border border-gray-700 text-gray-300 text-xs font-medium">
                {language}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
            {title}
          </h1>

          {/* Rating Badge */}
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-400/15 border border-amber-400/30 text-amber-400 text-sm font-bold shadow-sm">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{rating > 0 ? rating.toFixed(1) : 'N/A'}</span>
              <span className="text-xs text-gray-400 font-normal">/10</span>
            </div>

            {duration && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-800/80 border border-gray-700 text-xs font-medium text-gray-300">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span>
                  {formatDuration(duration)} ({duration} min)
                </span>
              </div>
            )}
          </div>

          {/* Genre Pills */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
            <Film className="w-3.5 h-3.5 text-gray-400 hidden sm:inline" />
            {(Array.isArray(genre) ? genre : [genre]).map((g) => (
              <span
                key={g}
                className="px-2.5 py-0.5 rounded-full bg-gray-800/60 border border-gray-700/60 text-xs text-gray-300 font-medium"
              >
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowHeader;
