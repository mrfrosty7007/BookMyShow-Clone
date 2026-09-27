import { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Film,
  Sparkles,
  Loader2,
  Check,
  Star,
  Clock,
  Calendar,
  Layers,
  Globe2,
  Link as LinkIcon,
  Tag,
} from 'lucide-react';

const GENRE_OPTIONS = [
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

const LANGUAGE_OPTIONS = ['English', 'Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Kannada'];

const CERTIFICATE_OPTIONS = ['U', 'U/A', 'A'];

/**
 * Inner Form Component for MovieModal
 * State initializes on mount from props; key prop ensures clean reset on movie change.
 */
const MovieFormContent = ({ movie, onClose, onSave }) => {
  const isEditing = Boolean(movie);

  const [title, setTitle] = useState(movie?.title || '');
  const [description, setDescription] = useState(movie?.description || '');
  const [duration, setDuration] = useState(
    movie?.duration ? String(movie.duration) : isEditing ? '' : '120'
  );
  const [releaseDate, setReleaseDate] = useState(
    movie?.releaseDate
      ? new Date(movie.releaseDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [rating, setRating] = useState(
    movie?.rating !== undefined ? String(movie.rating) : isEditing ? '' : '8.0'
  );
  const [certificate, setCertificate] = useState(movie?.certificate || 'U/A');
  const [trailer, setTrailer] = useState(movie?.trailer || '');
  const [featured, setFeatured] = useState(Boolean(movie?.featured));

  // Selected arrays
  const [selectedGenres, setSelectedGenres] = useState(
    Array.isArray(movie?.genre) && movie.genre.length > 0 ? movie.genre : ['Action', 'Sci-Fi']
  );
  const [selectedLanguages, setSelectedLanguages] = useState(
    Array.isArray(movie?.language) && movie.language.length > 0 ? movie.language : ['English']
  );
  const [customGenre, setCustomGenre] = useState('');

  // Image upload states
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState(movie?.poster || '');
  const [posterUrl, setPosterUrl] = useState(movie?.poster || '');

  const [backdropFile, setBackdropFile] = useState(null);
  const [backdropPreview, setBackdropPreview] = useState(movie?.backdrop || movie?.banner || '');
  const [backdropUrl, setBackdropUrl] = useState(movie?.backdrop || movie?.banner || '');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const posterInputRef = useRef(null);
  const backdropInputRef = useRef(null);

  // Revoke object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (posterPreview && posterPreview.startsWith('blob:')) {
        URL.revokeObjectURL(posterPreview);
      }
      if (backdropPreview && backdropPreview.startsWith('blob:')) {
        URL.revokeObjectURL(backdropPreview);
      }
    };
  }, [posterPreview, backdropPreview]);

  // Handle Poster file change
  const handlePosterChange = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPEG, PNG, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Poster image must be smaller than 5MB.');
      return;
    }

    setPosterFile(file);
    const previewUrl = URL.createObjectURL(file);
    setPosterPreview(previewUrl);
    setPosterUrl('');
    setErrorMessage(null);
  };

  // Handle Backdrop file change
  const handleBackdropChange = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPEG, PNG, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Backdrop image must be smaller than 5MB.');
      return;
    }

    setBackdropFile(file);
    const previewUrl = URL.createObjectURL(file);
    setBackdropPreview(previewUrl);
    setBackdropUrl('');
    setErrorMessage(null);
  };

  // Toggle Genre Tag
  const toggleGenre = (g) => {
    setSelectedGenres((prev) =>
      prev.includes(g) ? prev.filter((item) => item !== g) : [...prev, g]
    );
  };

  // Add custom genre tag
  const handleAddCustomGenre = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      const val = customGenre.trim();
      if (val && !selectedGenres.includes(val)) {
        setSelectedGenres((prev) => [...prev, val]);
        setCustomGenre('');
      }
    }
  };

  // Toggle Language Tag
  const toggleLanguage = (lang) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((item) => item !== lang) : [...prev, lang]
    );
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!title.trim()) {
      setErrorMessage('Movie title is required.');
      return;
    }
    const numDuration = Number(duration);
    if (!numDuration || numDuration <= 0) {
      setErrorMessage('Duration must be greater than 0 minutes.');
      return;
    }
    if (!releaseDate) {
      setErrorMessage('Please provide a valid release date.');
      return;
    }
    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 0 || numRating > 10) {
      setErrorMessage('Rating must be between 0 and 10.');
      return;
    }
    if (selectedGenres.length === 0) {
      setErrorMessage('Please select at least one genre.');
      return;
    }
    if (selectedLanguages.length === 0) {
      setErrorMessage('Please select at least one language.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('duration', String(numDuration));
      formData.append('releaseDate', releaseDate);
      formData.append('rating', String(numRating));
      formData.append('certificate', certificate);
      formData.append('trailer', trailer.trim());
      formData.append('featured', String(featured));
      formData.append('genre', selectedGenres.join(','));
      formData.append('language', selectedLanguages.join(','));

      // Append files or text URLs
      if (posterFile) {
        formData.append('poster', posterFile);
      } else if (posterUrl) {
        formData.append('poster', posterUrl.trim());
      }

      if (backdropFile) {
        formData.append('backdrop', backdropFile);
      } else if (backdropUrl) {
        formData.append('backdrop', backdropUrl.trim());
      }

      await onSave(formData, movie?._id);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save movie details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#0b1120] border border-cyan-500/30 p-5 sm:p-7 shadow-2xl shadow-cyan-950/50 text-gray-100 my-6 animate-scale-in max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-tight">
                {isEditing ? `Edit "${movie.title}"` : 'Add New Theatrical Title'}
              </h3>
              <p className="text-xs text-gray-400">
                {isEditing
                  ? 'Update metadata, replace media assets, and manage release status'
                  : 'Register a movie with poster, backdrop, and auditorium layout specs'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/80 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-between flex-shrink-0 animate-fade-in">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-rose-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 mt-4 space-y-6">
          {/* Section: Title & Description */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Movie Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Avatar: Fire & Ash"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-gray-900/90 border border-gray-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm text-gray-100 placeholder-gray-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Synopsis / Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Enter storyline, key characters, and premise..."
                className="w-full px-4 py-2.5 rounded-xl bg-gray-900/90 border border-gray-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm text-gray-100 placeholder-gray-500 outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* Section: Image Media Uploads */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Poster Upload */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
                <span>Vertical Poster</span>
                <span className="text-[10px] text-gray-500">Max 5MB</span>
              </label>

              <div
                onClick={() => posterInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.[0]) handlePosterChange(e.dataTransfer.files[0]);
                }}
                className={`group relative rounded-2xl border-2 border-dashed ${
                  posterPreview
                    ? 'border-cyan-500/40 bg-gray-900/60'
                    : 'border-gray-800 hover:border-cyan-500/50 bg-gray-900/40'
                } p-3 flex flex-col items-center justify-center min-h-[160px] text-center cursor-pointer transition-all overflow-hidden`}
              >
                {posterPreview ? (
                  <div className="relative w-full h-36 rounded-lg overflow-hidden flex items-center justify-center bg-black/40">
                    <img
                      src={posterPreview}
                      alt="Poster Preview"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 text-cyan-300 text-xs font-semibold">
                      <Upload className="w-5 h-5" />
                      <span>Change Poster</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 py-4">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-300">Click or Drag Poster</p>
                      <p className="text-[10px] text-gray-500">2:3 aspect recommended</p>
                    </div>
                  </div>
                )}
                <input
                  ref={posterInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePosterChange(e.target.files?.[0])}
                  className="hidden"
                />
              </div>

              {/* Direct URL Fallback */}
              <div className="relative">
                <input
                  type="url"
                  value={posterUrl}
                  onChange={(e) => {
                    setPosterUrl(e.target.value);
                    setPosterPreview(e.target.value);
                    setPosterFile(null);
                  }}
                  placeholder="Or paste poster image URL..."
                  className="w-full px-3 py-1.5 pl-8 rounded-lg bg-gray-900/60 border border-gray-800 focus:border-cyan-500 text-xs text-gray-200 placeholder-gray-500 outline-none"
                />
                <LinkIcon className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* Backdrop Upload */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
                <span>Wide Backdrop / Banner</span>
                <span className="text-[10px] text-gray-500">Max 5MB</span>
              </label>

              <div
                onClick={() => backdropInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.[0]) handleBackdropChange(e.dataTransfer.files[0]);
                }}
                className={`group relative rounded-2xl border-2 border-dashed ${
                  backdropPreview
                    ? 'border-cyan-500/40 bg-gray-900/60'
                    : 'border-gray-800 hover:border-cyan-500/50 bg-gray-900/40'
                } p-3 flex flex-col items-center justify-center min-h-[160px] text-center cursor-pointer transition-all overflow-hidden`}
              >
                {backdropPreview ? (
                  <div className="relative w-full h-36 rounded-lg overflow-hidden flex items-center justify-center bg-black/40">
                    <img
                      src={backdropPreview}
                      alt="Backdrop Preview"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 text-cyan-300 text-xs font-semibold">
                      <Upload className="w-5 h-5" />
                      <span>Change Backdrop</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 py-4">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-300">Click or Drag Backdrop</p>
                      <p className="text-[10px] text-gray-500">16:9 aspect recommended</p>
                    </div>
                  </div>
                )}
                <input
                  ref={backdropInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleBackdropChange(e.target.files?.[0])}
                  className="hidden"
                />
              </div>

              {/* Direct URL Fallback */}
              <div className="relative">
                <input
                  type="url"
                  value={backdropUrl}
                  onChange={(e) => {
                    setBackdropUrl(e.target.value);
                    setBackdropPreview(e.target.value);
                    setBackdropFile(null);
                  }}
                  placeholder="Or paste backdrop image URL..."
                  className="w-full px-3 py-1.5 pl-8 rounded-lg bg-gray-900/60 border border-gray-800 focus:border-cyan-500 text-xs text-gray-200 placeholder-gray-500 outline-none"
                />
                <LinkIcon className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>

          {/* Section: Numerical Specs & Certificates */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {/* Duration */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Runtime (min) *</span>
              </label>
              <input
                type="number"
                min="1"
                max="600"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="150"
                required
                className="w-full px-3 py-2 rounded-xl bg-gray-900/90 border border-gray-800 focus:border-cyan-500 text-sm text-gray-100 placeholder-gray-500 outline-none"
              />
            </div>

            {/* Rating */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-400" />
                <span>Rating (0-10)</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder="8.5"
                className="w-full px-3 py-2 rounded-xl bg-gray-900/90 border border-gray-800 focus:border-cyan-500 text-sm text-gray-100 placeholder-gray-500 outline-none"
              />
            </div>

            {/* Release Date */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                <span>Release Date *</span>
              </label>
              <input
                type="date"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-gray-900/90 border border-gray-800 focus:border-cyan-500 text-xs text-gray-100 outline-none"
              />
            </div>

            {/* Certificate */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>Certificate</span>
              </label>
              <select
                value={certificate}
                onChange={(e) => setCertificate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-900/90 border border-gray-800 focus:border-cyan-500 text-xs text-gray-100 outline-none cursor-pointer"
              >
                {CERTIFICATE_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c} (CBFC)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section: Genres Multi-Select */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-cyan-400" />
                <span>Genres (Multi-select) *</span>
              </span>
              <span className="text-[10px] text-gray-500">{selectedGenres.length} selected</span>
            </label>

            <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-gray-900/50 border border-gray-800/80">
              {GENRE_OPTIONS.map((g) => {
                const active = selectedGenres.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGenre(g)}
                    className={`px-3 py-1 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                      active
                        ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 shadow-sm shadow-cyan-950'
                        : 'bg-gray-800/70 border border-gray-700/60 text-gray-400 hover:text-gray-200 hover:bg-gray-700/60'
                    }`}
                  >
                    {active && <Check className="w-3 h-3 text-cyan-400" />}
                    <span>{g}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom genre input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={customGenre}
                onChange={(e) => setCustomGenre(e.target.value)}
                onKeyDown={handleAddCustomGenre}
                placeholder="Add other genre..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-gray-900/60 border border-gray-800 focus:border-cyan-500 text-xs text-gray-200 outline-none"
              />
              <button
                type="button"
                onClick={handleAddCustomGenre}
                className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-300 transition-colors cursor-pointer"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Section: Languages Multi-Select */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Languages (Multi-select) *</span>
              </span>
              <span className="text-[10px] text-gray-500">{selectedLanguages.length} selected</span>
            </label>

            <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-gray-900/50 border border-gray-800/80">
              {LANGUAGE_OPTIONS.map((lang) => {
                const active = selectedLanguages.includes(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLanguage(lang)}
                    className={`px-3 py-1 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                      active
                        ? 'bg-purple-500/20 border border-purple-500/50 text-purple-300 shadow-sm shadow-purple-950'
                        : 'bg-gray-800/70 border border-gray-700/60 text-gray-400 hover:text-gray-200 hover:bg-gray-700/60'
                    }`}
                  >
                    {active && <Check className="w-3 h-3 text-purple-400" />}
                    <span>{lang}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Trailer & Featured Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 items-center">
            {/* Trailer URL */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                YouTube Trailer Link
              </label>
              <input
                type="url"
                value={trailer}
                onChange={(e) => setTrailer(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3 py-2 rounded-xl bg-gray-900/90 border border-gray-800 focus:border-cyan-500 text-xs text-gray-200 outline-none"
              />
            </div>

            {/* Featured Showcase Toggle */}
            <div className="pt-4 sm:pt-6">
              <label
                onClick={() => setFeatured(!featured)}
                className={`flex items-center gap-3 p-2.5 rounded-2xl border cursor-pointer transition-all ${
                  featured
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-sm shadow-amber-950/40'
                    : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:border-gray-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                    featured
                      ? 'bg-amber-500 border-amber-400 text-gray-950'
                      : 'border-gray-700 bg-gray-800'
                  }`}
                >
                  {featured && <Sparkles className="w-3.5 h-3.5 fill-current" />}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold leading-tight">Featured Hero</p>
                  <p className="text-[10px] text-gray-500">Pin to Storefront</p>
                </div>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl border border-gray-800 text-xs font-bold text-gray-300 hover:bg-gray-800/80 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-gray-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-gray-950" />
                  <span>Saving Movie...</span>
                </>
              ) : (
                <span>{isEditing ? 'Save Changes' : 'Publish Movie'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * MovieModal Component
 * Reusable modal for Creating and Editing movies with file uploads and instant preview.
 */
export const MovieModal = ({ isOpen, onClose, onSave, movie = null }) => {
  if (!isOpen) return null;

  return (
    <MovieFormContent
      key={movie?._id || 'new-theatrical-title'}
      movie={movie}
      onClose={onClose}
      onSave={onSave}
    />
  );
};

export default MovieModal;
