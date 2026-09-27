import { useState } from 'react';
import { X, Building2, MapPin, Check, Loader2, Sparkles, ShieldCheck, Layers } from 'lucide-react';

const COMMON_AMENITIES = [
  'IMAX Laser',
  'Dolby Atmos',
  '4DX Motion',
  'VIP Recliners',
  'Valet Parking',
  'Gourmet Food Court',
  'Wheelchair Friendly',
  'Bar & Lounge',
  'Arcade & Gaming Zone',
];

const METRO_CITIES = [
  'Bengaluru',
  'Mumbai',
  'Delhi NCR',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
];

const TheaterFormContent = ({ theater, onClose, onSave }) => {
  const isEditing = Boolean(theater);

  const [name, setName] = useState(theater?.name || '');
  const [city, setCity] = useState(theater?.city || 'Bengaluru');
  const [address, setAddress] = useState(theater?.address || '');
  const [initialScreenCount, setInitialScreenCount] = useState(3);
  const [selectedAmenities, setSelectedAmenities] = useState(() => {
    if (Array.isArray(theater?.amenities) && theater.amenities.length > 0) {
      return theater.amenities;
    }
    if (Array.isArray(theater?.facilities) && theater.facilities.length > 0) {
      return theater.facilities;
    }
    return ['Dolby Atmos', 'Valet Parking', 'Gourmet Food Court'];
  });
  const [customAmenity, setCustomAmenity] = useState('');
  const [isActive, setIsActive] = useState(
    theater?.isActive !== undefined ? theater.isActive : true
  );

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const toggleAmenity = (item) => {
    setSelectedAmenities((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const handleAddCustomAmenity = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      const val = customAmenity.trim();
      if (val && !selectedAmenities.includes(val)) {
        setSelectedAmenities((prev) => [...prev, val]);
        setCustomAmenity('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Theater name is required.');
      return;
    }
    if (!city.trim()) {
      setErrorMessage('City is required.');
      return;
    }
    if (!address.trim()) {
      setErrorMessage('Theater address is required.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: name.trim(),
        city: city.trim(),
        address: address.trim(),
        amenities: selectedAmenities,
        isActive,
      };

      // In create mode, if initialScreenCount is specified, generate initial screens
      if (!isEditing && initialScreenCount > 1) {
        payload.screens = Array.from({ length: initialScreenCount }, (_, i) => ({
          name: `Screen ${i + 1}`,
          type: i === 0 ? 'IMAX' : i === 1 ? 'Dolby Atmos' : 'Standard',
        }));
      }

      await onSave(payload, theater?._id);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save theater details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl bg-[#0b1120] border border-cyan-500/30 p-5 sm:p-7 shadow-2xl shadow-cyan-950/50 text-gray-100 my-6 animate-scale-in flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-tight">
                {isEditing ? `Edit "${theater.name}"` : 'Add New Multiplex Venue'}
              </h3>
              <p className="text-xs text-gray-400">
                {isEditing
                  ? 'Update multiplex location, amenities, and operational status'
                  : 'Register a theater complex to host screens, showtimes, and seat layouts'}
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
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-between flex-shrink-0">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-rose-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 mt-4 space-y-5">
          {/* Multiplex Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Multiplex / Theater Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. PVR Nexus Koramangala or INOX Luxe"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-gray-900/90 border border-gray-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm text-gray-100 placeholder-gray-500 outline-none transition-all"
            />
          </div>

          {/* City Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>City Location *</span>
              </span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter city..."
                required
                className="flex-1 px-4 py-2 rounded-xl bg-gray-900/90 border border-gray-800 focus:border-cyan-500 text-sm text-gray-100 placeholder-gray-500 outline-none"
              />
            </div>
            {/* Quick city presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {METRO_CITIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCity(c)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    city.toLowerCase() === c.toLowerCase()
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-gray-900 text-gray-400 border border-gray-800 hover:text-gray-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Street Address */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Full Address <span className="text-rose-400">*</span>
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              placeholder="Mall name, street address, locality, landmark, postal code..."
              required
              className="w-full px-4 py-2.5 rounded-xl bg-gray-900/90 border border-gray-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm text-gray-100 placeholder-gray-500 outline-none transition-all resize-none"
            />
          </div>

          {/* Initial Screen Setup (Only for new theaters) */}
          {!isEditing && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  <span>Initial Screens to Provision</span>
                </span>
                <span className="text-cyan-300 font-mono font-bold text-xs">
                  {initialScreenCount} Screen{initialScreenCount > 1 ? 's' : ''}
                </span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={8}
                  value={initialScreenCount}
                  onChange={(e) => setInitialScreenCount(Number(e.target.value))}
                  className="flex-1 accent-cyan-400 cursor-pointer"
                />
                <span className="text-xs font-mono text-gray-400">{initialScreenCount}</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                You can fine-tune each screen&apos;s visual seat layout in the builder after
                creation.
              </p>
            </div>
          )}

          {/* Amenities Multi-Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Multiplex Amenities & Facilities</span>
              </span>
              <span className="text-[10px] text-gray-500">{selectedAmenities.length} active</span>
            </label>

            <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-gray-900/50 border border-gray-800/80">
              {COMMON_AMENITIES.map((amenity) => {
                const active = selectedAmenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-3 py-1 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                      active
                        ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 shadow-sm shadow-cyan-950'
                        : 'bg-gray-800/70 border border-gray-700/60 text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    {active && <Check className="w-3 h-3 text-cyan-400" />}
                    <span>{amenity}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom amenity input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={customAmenity}
                onChange={(e) => setCustomAmenity(e.target.value)}
                onKeyDown={handleAddCustomAmenity}
                placeholder="Add specialized facility..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-gray-900/60 border border-gray-800 focus:border-cyan-500 text-xs text-gray-200 outline-none"
              />
              <button
                type="button"
                onClick={handleAddCustomAmenity}
                className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-300 transition-colors cursor-pointer"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Operational Status Toggle */}
          <div className="pt-2">
            <label
              onClick={() => setIsActive(!isActive)}
              className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                isActive
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300 shadow-sm shadow-emerald-950/40'
                  : 'bg-gray-900/60 border-gray-800 text-gray-400'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                  isActive
                    ? 'bg-emerald-500 border-emerald-400 text-gray-950'
                    : 'border-gray-700 bg-gray-800'
                }`}
              >
                {isActive && <ShieldCheck className="w-3.5 h-3.5 fill-current" />}
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold leading-tight">Operational Status</p>
                <p className="text-[10px] text-gray-500">
                  {isActive
                    ? 'Active — Available for booking and show schedule assignment'
                    : 'Maintenance / Inactive — Hidden from customer storefront'}
                </p>
              </div>
            </label>
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
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-gray-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-cyan-500/25 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-gray-950" />
                  <span>Saving Multiplex...</span>
                </>
              ) : (
                <span>{isEditing ? 'Save Changes' : 'Create Multiplex'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const TheaterModal = ({ isOpen, onClose, onSave, theater = null }) => {
  if (!isOpen) return null;

  return (
    <TheaterFormContent
      key={theater?._id || 'new-multiplex-venue'}
      theater={theater}
      onClose={onClose}
      onSave={onSave}
    />
  );
};

export default TheaterModal;
