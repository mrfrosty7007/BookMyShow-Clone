import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Clock, Calendar, ChevronLeft, Clapperboard, MapPin, Sparkles } from 'lucide-react';
import { getMovie, getShowsByMovie } from '../services/api.js';
import { useFetch } from '../hooks/useFetch.js';
import { ShowCard } from '../components/ShowCard.jsx';
import { Loader } from '../components/Loader.jsx';
import { EmptyState } from '../components/EmptyState.jsx';

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
 * Movie Details Page with Available Shows
 */
export const MovieDetails = () => {
  const { id } = useParams();
  const [selectedCity, setSelectedCity] = useState('');

  // 1. Fetch movie details
  const {
    data: movieData,
    loading: movieLoading,
    error: movieError,
  } = useFetch(() => getMovie(id), id);

  // 2. Fetch all shows for this movie
  const {
    data: showsData,
    loading: showsLoading,
    error: showsError,
    refetch: refetchShows,
  } = useFetch(() => getShowsByMovie(id), id);

  const movie = movieData?.movie;
  const shows = useMemo(() => {
    return showsData?.shows || [];
  }, [showsData]);

  // Extract cities where this movie has shows
  const availableCities = useMemo(() => {
    const citySet = new Set();
    shows.forEach((s) => {
      if (s.theater?.city) citySet.add(s.theater.city);
    });
    return Array.from(citySet);
  }, [shows]);

  // Filter shows by selected city if any
  const filteredShows = useMemo(() => {
    if (!selectedCity) return shows;
    return shows.filter((s) => s.theater?.city === selectedCity);
  }, [shows, selectedCity]);

  if (movieLoading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <Loader message="Loading movie details and showtimes..." size="lg" />
      </div>
    );
  }

  if (movieError || !movie) {
    return (
      <div className="min-h-screen bg-[#0b0f19] px-4 py-20">
        <EmptyState
          title="Movie Not Found"
          description={movieError || 'The requested movie does not exist or has been deactivated.'}
          actionLabel="Return to Catalog"
          onAction={() => (window.location.href = '/')}
        />
      </div>
    );
  }

  const {
    title,
    description,
    banner,
    poster,
    rating = 0,
    certificate = 'U/A',
    duration,
    language,
    genre = [],
    releaseDate,
  } = movie;

  const bgImage = banner || poster;
  const formattedReleaseDate = releaseDate
    ? new Date(releaseDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 pb-24">
      {/* 1. Backdrop Banner Header */}
      <section className="relative w-full bg-[#0b0f19] border-b border-gray-800/80">
        {/* Backdrop Ambient Image */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {bgImage && (
            <img
              src={bgImage}
              alt={title}
              className="w-full h-full object-cover object-top opacity-20 filter blur-sm brightness-75 scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19]/80 to-[#0b0f19]/40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 sm:pb-16">
          {/* Back Navigation Button */}
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white transition-colors mb-6 group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to All Movies</span>
          </Link>

          <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-center md:items-start">
            {/* Movie Poster */}
            <div className="w-56 sm:w-64 md:w-72 flex-shrink-0">
              <div className="aspect-[2/3] rounded-2xl overflow-hidden border-2 border-gray-800 shadow-2xl shadow-black/90 bg-gray-950">
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

            {/* Movie Details Info */}
            <div className="flex-1 space-y-4 text-center md:text-left">
              {/* Top Badges */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-400/15 border border-amber-400/30 text-amber-400 text-sm font-bold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{rating > 0 ? rating.toFixed(1) : 'N/A'}/10</span>
                </div>

                {certificate && (
                  <span className="px-2.5 py-1 rounded-lg bg-gray-800 border border-gray-700 text-gray-200 text-xs font-bold uppercase tracking-wider">
                    {certificate}
                  </span>
                )}

                {duration && (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 text-xs font-medium">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>{formatDuration(duration)}</span>
                  </span>
                )}

                <span className="px-3 py-1 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 text-xs font-semibold">
                  {language}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                {title}
              </h1>

              {/* Genre Pills */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
                {genre.map((g) => (
                  <span
                    key={g}
                    className="px-3 py-1 rounded-full bg-gray-800/80 border border-gray-700 text-xs font-medium text-gray-300"
                  >
                    {g}
                  </span>
                ))}
              </div>

              {/* Description */}
              <div className="pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  About the Movie
                </h3>
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-3xl">
                  {description}
                </p>
              </div>

              {/* Release Date */}
              {formattedReleaseDate && (
                <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-gray-400 pt-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span>Released: {formattedReleaseDate}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Available Shows & Timings Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14">
        {/* Section Header & City Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-800/80">
          <div>
            <div className="flex items-center gap-2">
              <Clapperboard className="w-5 h-5 text-[#f84464]" />
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Available Shows
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Select your preferred cinema hall, screen format, and showtime
            </p>
          </div>

          {/* City Filter Pills */}
          {availableCities.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto self-start sm:self-center">
              <span className="text-xs text-gray-400 flex items-center gap-1 pr-1 font-semibold">
                <MapPin className="w-3.5 h-3.5 text-[#f84464]" />
                <span>City:</span>
              </span>

              <button
                type="button"
                onClick={() => setSelectedCity('')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  !selectedCity
                    ? 'bg-[#f84464] text-white shadow-md shadow-[#f84464]/25'
                    : 'bg-gray-900 text-gray-300 hover:text-white border border-gray-800'
                }`}
              >
                All Cities
              </button>

              {availableCities.map((c) => {
                const isSelected = selectedCity === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedCity(c)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-[#f84464] text-white shadow-md shadow-[#f84464]/25'
                        : 'bg-gray-900 text-gray-300 hover:text-white border border-gray-800'
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Shows Listing */}
        <div className="pt-6">
          {showsLoading ? (
            <Loader message="Loading available showtimes..." />
          ) : showsError ? (
            <EmptyState
              title="Error Loading Shows"
              description={showsError}
              actionLabel="Retry"
              onAction={refetchShows}
            />
          ) : filteredShows.length === 0 ? (
            <EmptyState
              title="No Shows Available"
              description={
                selectedCity
                  ? `There are no scheduled showtimes for "${title}" in ${selectedCity}.`
                  : `There are currently no active shows scheduled for "${title}".`
              }
              actionLabel={selectedCity ? 'View All Cities' : undefined}
              onAction={selectedCity ? () => setSelectedCity('') : undefined}
            />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-gray-400 px-1">
                <span>
                  Showing <strong className="text-white">{filteredShows.length}</strong> showtime(s)
                </span>
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  Instant Confirmation
                </span>
              </div>

              {filteredShows.map((show) => (
                <ShowCard key={show._id} show={show} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MovieDetails;
