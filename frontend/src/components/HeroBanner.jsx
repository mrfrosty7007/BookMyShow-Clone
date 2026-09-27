import { Link } from 'react-router-dom';
import { Star, Clock, Ticket, Calendar } from 'lucide-react';

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
 * Hero Banner showcasing featured/highest-rated movie
 */
export const HeroBanner = ({ movies = [], movie = null }) => {
  // Prioritize explicitly featured movie, then highest rated active movie
  const explicitFeatured = movies.find((m) => m.featured);
  const featured =
    movie ||
    explicitFeatured ||
    (movies.length > 0
      ? movies.reduce(
          (highest, curr) => (curr.rating > (highest?.rating || 0) ? curr : highest),
          movies[0]
        )
      : null);

  if (!featured) return null;

  const {
    _id,
    title,
    description,
    banner,
    backdrop,
    poster,
    rating = 0,
    certificate = 'U/A',
    duration,
    language,
    genre = [],
    releaseDate,
    featured: isFeatured,
  } = featured;

  const bgImage = backdrop || banner || poster;
  const formattedDate = releaseDate
    ? new Date(releaseDate).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <section className="relative w-full overflow-hidden bg-[#0b0f19] border-b border-gray-800/80">
      {/* Background Banner Image with Gradient Mask */}
      <div className="absolute inset-0 z-0">
        {bgImage && (
          <img
            src={bgImage}
            alt={title}
            className="w-full h-full object-cover object-top opacity-35 filter brightness-90 contrast-110"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19]/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0f19] via-[#0b0f19]/90 to-transparent" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between gap-8 lg:gap-12">
          {/* Left Text Column */}
          <div className="flex-1 space-y-5 text-center lg:text-left max-w-2xl">
            {/* Top Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
              <span className="px-2.5 py-1 rounded-md bg-[#f84464]/20 border border-[#f84464]/40 text-[#f84464] text-xs font-bold uppercase tracking-wider">
                {isFeatured ? 'Featured Premiere' : 'Trending Now'}
              </span>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-400/15 border border-amber-400/30 text-amber-400 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{rating > 0 ? rating.toFixed(1) : 'N/A'}/10</span>
              </div>

              {certificate && (
                <span className="px-2 py-1 rounded-md bg-gray-800/80 border border-gray-700 text-gray-300 text-xs font-semibold uppercase">
                  {certificate}
                </span>
              )}

              {duration && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-800/80 border border-gray-700 text-gray-300 text-xs font-medium">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span>{formatDuration(duration)}</span>
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              {title}
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base text-gray-300 line-clamp-3 leading-relaxed max-w-xl mx-auto lg:mx-0">
              {description}
            </p>

            {/* Metadata Pills */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1 text-xs text-gray-400">
              <span className="font-semibold text-gray-200">{language}</span>
              <span>•</span>
              {genre.map((g) => (
                <span
                  key={g}
                  className="px-2 py-0.5 rounded-full bg-gray-800/60 border border-gray-700/60"
                >
                  {g}
                </span>
              ))}
              {formattedDate && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {formattedDate}
                  </span>
                </>
              )}
            </div>

            {/* CTA Button */}
            <div className="pt-3">
              <Link
                to={`/movie/${_id}`}
                className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#f84464] to-[#e03150] hover:from-[#e03150] hover:to-[#c72542] text-white text-base font-bold shadow-lg shadow-[#f84464]/30 hover:shadow-xl hover:shadow-[#f84464]/40 transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <Ticket className="w-5 h-5" />
                <span>Book Tickets</span>
              </Link>
            </div>
          </div>

          {/* Right Floating Poster (Desktop Only) */}
          <div className="hidden lg:block w-64 xl:w-72 flex-shrink-0">
            <Link
              to={`/movie/${_id}`}
              className="block group relative aspect-[2/3] rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl shadow-black/90 transform group-hover:scale-105 transition-transform duration-300"
            >
              <img
                src={poster}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <span className="text-sm font-bold text-white flex items-center gap-1.5">
                  View Details & Shows &rarr;
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
