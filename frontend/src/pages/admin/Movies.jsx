import { useState, useEffect, useCallback } from 'react';
import {
  Film,
  Plus,
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import {
  getAdminMovies,
  createMovie,
  updateMovie,
  deleteMovie,
  restoreMovie,
  toggleFeatured,
} from '../../services/api.js';
import { MovieTable } from '../../components/admin/MovieTable.jsx';
import { MovieModal } from '../../components/admin/MovieModal.jsx';
import { DeleteMovieDialog } from '../../components/admin/DeleteMovieDialog.jsx';
import { Loader } from '../../components/Loader.jsx';

const GENRES = [
  'All Genres',
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Drama',
  'Fantasy',
  'Horror',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Thriller',
];

/**
 * Movies CMS Page
 * Primary movie management console for administrators with full CRUD,
 * live search, genre filters, status tabs, pagination, and instant modal editing.
 */
export const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filter states
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [genre, setGenre] = useState('All Genres');
  const [status, setStatus] = useState('all'); // 'all' | 'active' | 'inactive'
  const [page, setPage] = useState(1);

  // Modal dialog states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState(null);

  // Toast notifications
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Debounce search input by 350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on new search
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Trigger reload of movie catalog
  const reloadMovies = useCallback(() => {
    setLoading(true);
    setRefreshTrigger((k) => k + 1);
  }, []);

  // Fetch movies on parameter changes or manual reload
  useEffect(() => {
    let isMounted = true;

    const fetchMovies = async () => {
      try {
        const params = {
          page,
          limit: 10,
          status,
        };
        if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
        if (genre && genre !== 'All Genres') params.genre = genre;

        const res = await getAdminMovies(params);
        if (isMounted && res?.movies) {
          setMovies(res.movies);
          if (res.pagination) {
            setPagination(res.pagination);
          }
        }
      } catch (err) {
        if (isMounted) {
          showToast(err.message || 'Failed to fetch movies', 'error');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMovies();

    return () => {
      isMounted = false;
    };
  }, [page, status, debouncedSearch, genre, refreshTrigger]);

  // Open Create Movie Modal
  const handleOpenCreateModal = () => {
    setEditingMovie(null);
    setModalOpen(true);
  };

  // Open Edit Movie Modal
  const handleOpenEditModal = (movie) => {
    setEditingMovie(movie);
    setModalOpen(true);
  };

  // Save Movie (Create or Update)
  const handleSaveMovie = async (formData, movieId) => {
    if (movieId) {
      // Update
      const res = await updateMovie(movieId, formData);
      showToast(`Movie "${res.movie?.title || 'Title'}" updated successfully!`);
    } else {
      // Create
      const res = await createMovie(formData);
      showToast(`Movie "${res.movie?.title || 'Title'}" published to catalog!`);
    }
    reloadMovies();
  };

  // Open Soft Delete Confirmation Dialog
  const handleOpenDeleteDialog = (movie) => {
    setMovieToDelete(movie);
    setDeleteDialogOpen(true);
  };

  // Confirm Soft Delete (Hide Movie)
  const handleConfirmDelete = async (movie) => {
    setActionLoading(true);
    try {
      await deleteMovie(movie._id);
      showToast(`Movie "${movie.title}" hidden from customer storefront.`, 'info');
      setDeleteDialogOpen(false);
      setMovieToDelete(null);
      reloadMovies();
    } catch (err) {
      showToast(err.message || 'Failed to hide movie', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Restore Soft-Deleted Movie
  const handleRestoreMovie = async (movie) => {
    try {
      await restoreMovie(movie._id);
      showToast(`Movie "${movie.title}" restored to active storefront!`, 'success');
      reloadMovies();
    } catch (err) {
      showToast(err.message || 'Failed to restore movie', 'error');
    }
  };

  // Toggle Featured status
  const handleToggleFeatured = async (movie) => {
    try {
      const res = await toggleFeatured(movie._id);
      const isNowFeatured = res.movie?.featured;
      showToast(
        `Movie "${movie.title}" is now ${isNowFeatured ? 'featured in Hero Banner' : 'standard'}.`,
        'success'
      );
      reloadMovies();
    } catch (err) {
      showToast(err.message || 'Failed to update featured status', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 animate-slide-in-down">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-md text-xs font-bold ${
              toast.type === 'error'
                ? 'bg-red-950/90 border-red-500/40 text-red-200'
                : toast.type === 'info'
                  ? 'bg-blue-950/90 border-blue-500/40 text-blue-200'
                  : 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            )}
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="opacity-70 hover:opacity-100 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Header with Title and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Film className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Movie Catalog CMS
            </h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Create, edit, hide, and manage theatrical releases across all auditoriums
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 py-3 px-5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 text-gray-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-gray-950 stroke-[3]" />
          <span>Add New Movie</span>
        </button>
      </div>

      {/* Filter Toolbar: Search, Genre dropdown, Status Pills */}
      <div className="p-4 rounded-2xl bg-[#0b1120]/80 border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or description..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-cyan-400"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Genre Dropdown */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={genre}
              onChange={(e) => {
                setGenre(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs font-semibold text-gray-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              {GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center rounded-xl bg-gray-900 p-1 border border-gray-800">
            <button
              type="button"
              onClick={() => {
                setStatus('all');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                status === 'all'
                  ? 'bg-cyan-500 text-gray-950 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              All ({pagination.total})
            </button>
            <button
              type="button"
              onClick={() => {
                setStatus('active');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                status === 'active'
                  ? 'bg-emerald-500 text-gray-950 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => {
                setStatus('inactive');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                status === 'inactive'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Hidden
            </button>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={reloadMovies}
            disabled={loading}
            className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-cyan-400 hover:border-gray-700 transition-colors"
            title="Refresh movie records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Movie Records Table */}
      {loading ? (
        <div className="py-24 rounded-2xl bg-[#0b1120]/40 border border-gray-800 flex items-center justify-center">
          <Loader message="Loading movie catalog records..." size="lg" />
        </div>
      ) : (
        <MovieTable
          movies={movies}
          onEdit={handleOpenEditModal}
          onDelete={handleOpenDeleteDialog}
          onRestore={handleRestoreMovie}
          onToggleFeatured={handleToggleFeatured}
          loading={loading}
        />
      )}

      {/* Pagination Footer */}
      {!loading && movies.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <span className="text-xs text-gray-400 font-mono">
            Showing Page <strong className="text-white">{pagination.page}</strong> of{' '}
            <strong className="text-white">{pagination.totalPages}</strong> ({pagination.total}{' '}
            total movies)
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs font-bold text-gray-300 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-1 font-mono text-xs">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg font-bold transition-all cursor-pointer ${
                    p === pagination.page
                      ? 'bg-cyan-500 text-gray-950 font-black shadow-sm shadow-cyan-500/30'
                      : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
              className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs font-bold text-gray-300 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Movie Modal */}
      <MovieModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveMovie}
        movie={editingMovie}
      />

      {/* Delete / Hide Confirmation Modal */}
      <DeleteMovieDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setMovieToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        movie={movieToDelete}
        loading={actionLoading}
      />
    </div>
  );
};

export default Movies;
