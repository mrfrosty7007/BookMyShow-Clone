import { useState, useMemo } from 'react';
import { Film, Filter } from 'lucide-react';
import { getMovies } from '../services/api.js';
import { useFetch } from '../hooks/useFetch.js';
import { HeroBanner } from '../components/HeroBanner.jsx';
import { MovieCard } from '../components/MovieCard.jsx';
import { Loader } from '../components/Loader.jsx';
import { EmptyState } from '../components/EmptyState.jsx';

/**
 * BookMyShow-inspired Home Page
 * Renders HeroBanner, genre filtering, and responsive movie catalog grid
 */
export const Home = () => {
  const [selectedGenre, setSelectedGenre] = useState('All');

  // Fetch all active movies from the live backend API
  const { data, loading, error, refetch } = useFetch(getMovies);

  const movies = useMemo(() => {
    return data?.movies || [];
  }, [data]);

  // Extract unique genres across movies
  const genres = useMemo(() => {
    const set = new Set(['All']);
    movies.forEach((m) => {
      if (Array.isArray(m.genre)) {
        m.genre.forEach((g) => set.add(g));
      }
    });
    return Array.from(set);
  }, [movies]);

  // Filter movies by genre
  const filteredMovies = useMemo(() => {
    if (selectedGenre === 'All') return movies;
    return movies.filter((m) => Array.isArray(m.genre) && m.genre.includes(selectedGenre));
  }, [movies, selectedGenre]);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 pb-20">
      {/* 1. Hero Banner (displays highest rated featured movie) */}
      {!loading && movies.length > 0 && <HeroBanner movies={movies} />}

      {/* 2. Main Movies Catalog Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14">
        {/* Section Heading & Filter Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-800/80">
          <div>
            <div className="flex items-center gap-2.5">
              <Film className="w-5 h-5 text-[#f84464]" />
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Recommended Movies
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Explore the latest blockbusters and critically acclaimed releases
            </p>
          </div>

          {/* Quick Counter */}
          {!loading && (
            <div className="text-xs font-semibold text-gray-400 bg-gray-900 px-3 py-1.5 rounded-full border border-gray-800 self-start sm:self-center">
              Showing <span className="text-white font-bold">{filteredMovies.length}</span> of{' '}
              <span className="text-white font-bold">{movies.length}</span> Movies
            </div>
          )}
        </div>

        {/* Genre Filter Pills */}
        {genres.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto py-5 scrollbar-none">
            <span className="text-xs font-semibold text-gray-400 flex items-center gap-1 pl-1 pr-2">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <span>Genre:</span>
            </span>

            {genres.map((genre) => {
              const isSelected = selectedGenre === genre;
              return (
                <button
                  key={genre}
                  type="button"
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#f84464] text-white shadow-md shadow-[#f84464]/30'
                      : 'bg-gray-900/80 text-gray-300 hover:text-white hover:bg-gray-800 border border-gray-800'
                  }`}
                >
                  {genre}
                </button>
              );
            })}
          </div>
        )}

        {/* 3. Movie Grid or States */}
        {loading ? (
          <Loader message="Fetching latest cinema titles..." size="lg" />
        ) : error ? (
          <EmptyState
            title="Failed to Load Movies"
            description={error}
            actionLabel="Try Again"
            onAction={refetch}
          />
        ) : filteredMovies.length === 0 ? (
          <EmptyState
            title="No Movies Found"
            description={`No movies found matching genre "${selectedGenre}".`}
            actionLabel="Reset Filter"
            onAction={() => setSelectedGenre('All')}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 pt-2">
            {filteredMovies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
