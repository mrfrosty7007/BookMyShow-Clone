import { Link } from 'react-router-dom';
import { Star, Clock } from 'lucide-react';

/**
 * Format minutes into hours and minutes (e.g. 166 -> 2h 46m)
 */
const formatDuration = (minutes) => {
  if (!minutes) return '';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
};

/**
 * Movie Card Component for Grid Displays
 */
export const MovieCard = ({ movie }) => {
  if (!movie) return null;

  const {
    _id,
    title,
    poster,
    rating = 0,
    certificate = 'U/A',
    language,
    duration,
    genre = [],
  } = movie;

  return (
    <Link
      to={`/movie/${_id}`}
      className="group flex flex-col rounded-2xl overflow-hidden bg-gray-900/60 border border-gray-800/80 hover:border-gray-700/80 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#f84464]/15 focus:outline-none focus:ring-2 focus:ring-[#f84464]"
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-gray-950">
        <img
          src={poster}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            // Fallback placeholder if image load fails
            e.target.onerror = null;
            e.target.src =
              'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60';
          }}
        />

        {/* Certificate Badge */}
        {certificate && (
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-bold tracking-wider text-gray-200 uppercase">
            {certificate}
          </div>
        )}

        {/* Rating Overlay */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 pt-6 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-amber-400 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-amber-400/20 shadow-sm">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span className="text-xs font-black text-white">
              {rating > 0 ? rating.toFixed(1) : 'N/A'}
            </span>
            <span className="text-[10px] text-gray-400 font-medium">/10</span>
          </div>

          {duration && (
            <div className="hidden sm:flex items-center gap-1 text-[11px] font-medium text-gray-300 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
              <Clock className="w-3 h-3 text-gray-400" />
              <span>{formatDuration(duration)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Movie Details */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-1.5">
        <div>
          <h3
            className="text-base font-bold text-white group-hover:text-[#f84464] transition-colors line-clamp-1"
            title={title}
          >
            {title}
          </h3>

          <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
            {genre.length > 0 ? genre.join(', ') : 'Cinema'}
          </p>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-gray-800/60 text-[11px] text-gray-400">
          <span className="font-medium text-gray-300">{language}</span>
          <span className="sm:hidden font-medium text-gray-400">{formatDuration(duration)}</span>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
