import { useState, useMemo } from 'react';
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  Crown,
  Accessibility,
  Sliders,
  Check,
  Loader2,
  Wand2,
} from 'lucide-react';
import { CapacitySummary } from './CapacitySummary.jsx';

const SCREEN_TYPES = [
  'IMAX',
  'Dolby Atmos',
  '4DX',
  'Standard',
  'Gold Class',
  'ScreenX',
  'IMAX 3D',
  'Laser',
  'ICE Immersive',
];

const PRESETS = [
  {
    name: 'Standard Hall (100)',
    description: '10 rows × 10 seats with dual aisles and back premium rows',
    rowsCount: 10,
    seatsPerRow: 10,
    aisles: [3, 7],
    premiumRows: 2,
    vipRows: 1,
    wheelchairRows: 1,
  },
  {
    name: 'IMAX Laser (180)',
    description: '12 rows × 15 seats with spacious walkway aisles and VIP recliners',
    rowsCount: 12,
    seatsPerRow: 15,
    aisles: [4, 11],
    premiumRows: 3,
    vipRows: 1,
    wheelchairRows: 1,
  },
  {
    name: 'Grand Multiplex (252)',
    description: '14 rows × 18 seats large scale auditorium with triple tiers',
    rowsCount: 14,
    seatsPerRow: 18,
    aisles: [5, 13],
    premiumRows: 4,
    vipRows: 2,
    wheelchairRows: 1,
  },
];

const ROW_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/**
 * Visual Seat Layout Builder (Phase 4.3 Flagship Feature)
 * Interactive cinema auditorium designer with live seat grid visualization,
 * category tiers, aisle placement, and instant capacity calculation.
 */
export const SeatLayoutBuilder = ({
  isOpen,
  onClose,
  onSave,
  screen = null,
  theaterName = '',
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <SeatLayoutBuilderContent
      key={screen?._id || 'new-screen-builder'}
      screen={screen}
      theaterName={theaterName}
      onClose={onClose}
      onSave={onSave}
      loading={loading}
    />
  );
};

const SeatLayoutBuilderContent = ({ screen, theaterName, onClose, onSave, loading }) => {
  const isEditing = Boolean(screen?._id);

  const [screenName, setScreenName] = useState(
    screen?.name || (isEditing ? 'Screen' : 'Screen 1 — Grand Dolby Atmos')
  );
  const [screenType, setScreenType] = useState(screen?.type || 'Dolby Atmos');

  // Initialize visual rows
  const [rows, setRows] = useState(() => {
    if (screen?.seatLayout?.rows?.length) {
      return screen.seatLayout.rows.map((r, i) => ({
        label: r.label || ROW_LETTERS[i] || `R${i + 1}`,
        seats: Number(r.seats) || 10,
        category:
          r.category ||
          (r.vip ? 'VIP' : r.premium ? 'Premium' : r.wheelchair ? 'Accessible' : 'Standard'),
        premium: Boolean(r.premium),
        vip: Boolean(r.vip),
        wheelchair: Boolean(r.wheelchair),
        aisles: Array.isArray(r.aisles) ? [...r.aisles] : [3, 7],
      }));
    }
    // Default 10 rows × 10 seats
    return Array.from({ length: 10 }, (_, i) => {
      const isWheelchair = i === 0;
      const isVip = i === 9;
      const isPremium = i >= 7 && i < 9;
      const category = isVip
        ? 'VIP'
        : isPremium
          ? 'Premium'
          : isWheelchair
            ? 'Accessible'
            : 'Standard';

      return {
        label: ROW_LETTERS[i],
        seats: 10,
        category,
        premium: isPremium,
        vip: isVip,
        wheelchair: isWheelchair,
        aisles: [3, 7],
      };
    });
  });

  const [selectedRowIndex, setSelectedRowIndex] = useState(0);

  // Computed layout statistics
  const stats = useMemo(() => {
    let standard = 0;
    let premium = 0;
    let vip = 0;
    let accessible = 0;

    rows.forEach((r) => {
      const seatCount = Number(r.seats) || 0;
      if (r.vip || r.category === 'VIP') vip += seatCount;
      else if (r.premium || r.category === 'Premium') premium += seatCount;
      else if (r.wheelchair || r.category === 'Accessible') accessible += seatCount;
      else standard += seatCount;
    });

    const totalCapacity = standard + premium + vip + accessible;

    return {
      totalRows: rows.length,
      standard,
      premium,
      vip,
      accessible,
      totalCapacity,
    };
  }, [rows]);

  const selectedRow = rows[selectedRowIndex] || rows[0];

  // Apply a predefined auditorium template
  const applyPreset = (preset) => {
    const newRows = Array.from({ length: preset.rowsCount }, (_, i) => {
      const isWheelchair = i < preset.wheelchairRows;
      const isVip = i >= preset.rowsCount - preset.vipRows;
      const isPremium =
        i >= preset.rowsCount - preset.vipRows - preset.premiumRows &&
        i < preset.rowsCount - preset.vipRows;

      const category = isVip
        ? 'VIP'
        : isPremium
          ? 'Premium'
          : isWheelchair
            ? 'Accessible'
            : 'Standard';

      return {
        label: ROW_LETTERS[i] || `R${i + 1}`,
        seats: preset.seatsPerRow,
        category,
        premium: isPremium,
        vip: isVip,
        wheelchair: isWheelchair,
        aisles: [...preset.aisles],
      };
    });

    setRows(newRows);
    setSelectedRowIndex(0);
  };

  // Add Row
  const handleAddRow = () => {
    const nextIdx = rows.length;
    const nextLetter = ROW_LETTERS[nextIdx] || `R${nextIdx + 1}`;
    const prevRow = rows[rows.length - 1];

    const newRow = {
      label: nextLetter,
      seats: prevRow ? prevRow.seats : 10,
      category: 'Standard',
      premium: false,
      vip: false,
      wheelchair: false,
      aisles: prevRow ? [...prevRow.aisles] : [3, 7],
    };

    setRows((prev) => [...prev, newRow]);
    setSelectedRowIndex(rows.length);
  };

  // Remove Row
  const handleRemoveRow = (indexToRemove) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    if (selectedRowIndex >= rows.length - 1) {
      setSelectedRowIndex(Math.max(0, rows.length - 2));
    }
  };

  // Update selected row attribute
  const updateSelectedRow = (updates) => {
    setRows((prev) => prev.map((r, idx) => (idx === selectedRowIndex ? { ...r, ...updates } : r)));
  };

  // Toggle Category for selected row
  const setRowCategory = (category) => {
    const isWheelchair = category === 'Accessible';
    const isVip = category === 'VIP';
    const isPremium = category === 'Premium';

    updateSelectedRow({
      category,
      wheelchair: isWheelchair,
      vip: isVip,
      premium: isPremium,
    });
  };

  // Toggle Aisle after seat number
  const toggleAisle = (seatNum) => {
    if (!selectedRow) return;
    const currentAisles = selectedRow.aisles || [];
    const exists = currentAisles.includes(seatNum);
    const newAisles = exists
      ? currentAisles.filter((a) => a !== seatNum)
      : [...currentAisles, seatNum].sort((a, b) => a - b);

    updateSelectedRow({ aisles: newAisles });
  };

  // Form Save
  const handleSave = () => {
    if (!screenName.trim()) return;

    onSave({
      name: screenName.trim(),
      type: screenType,
      seatLayout: {
        rows: rows.map((r) => ({
          label: r.label.trim().toUpperCase(),
          seats: Number(r.seats),
          category: r.category,
          premium: r.premium,
          vip: r.vip,
          wheelchair: r.wheelchair,
          aisles: r.aisles,
        })),
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-6xl rounded-3xl bg-[#0b1120] border border-cyan-500/30 p-4 sm:p-6 shadow-2xl shadow-cyan-950/50 text-gray-100 my-4 flex flex-col max-h-[95vh] animate-scale-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-950/40">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white tracking-tight">
                  Visual Seat Layout Builder
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-black uppercase tracking-wider">
                  Interactive CAD
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {theaterName ? `Multiplex: ${theaterName} · ` : ''}
                {isEditing ? `Editing "${screen.name}"` : 'Designing New Cinema Screen Auditorium'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={onClose}
              disabled={loading}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/80 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Screen Metadata & Quick Presets Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 py-3 border-b border-gray-800/80 flex-shrink-0 items-center">
          {/* Screen Name */}
          <div className="md:col-span-5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              Screen Auditorium Name *
            </label>
            <input
              type="text"
              value={screenName}
              onChange={(e) => setScreenName(e.target.value)}
              placeholder="e.g. Screen 1 — IMAX Laser Experience"
              required
              className="w-full px-3 py-2 rounded-xl bg-gray-900/90 border border-gray-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-xs font-semibold text-gray-100 placeholder-gray-500 outline-none transition-all"
            />
          </div>

          {/* Screen Type */}
          <div className="md:col-span-3">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              Screen Format / Technology
            </label>
            <select
              value={screenType}
              onChange={(e) => setScreenType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-gray-900/90 border border-gray-800 focus:border-cyan-500 text-xs font-semibold text-gray-100 outline-none cursor-pointer"
            >
              {SCREEN_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Presets Menu */}
          <div className="md:col-span-4 flex items-center justify-start md:justify-end gap-1.5 pt-4 md:pt-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 hidden sm:inline flex items-center gap-1">
              <Wand2 className="w-3 h-3 text-cyan-400" /> Presets:
            </span>
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset)}
                className="px-2.5 py-1.5 rounded-lg bg-gray-900 border border-gray-800 hover:border-cyan-500/50 hover:bg-gray-800/80 text-[11px] font-semibold text-gray-300 hover:text-cyan-300 transition-all cursor-pointer"
                title={preset.description}
              >
                {preset.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Live Capacity Summary Bar */}
        <div className="py-2 flex-shrink-0">
          <CapacitySummary stats={stats} />
        </div>

        {/* Main Workspace (Row Controls on Left, Live Cinema Grid on Right) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 mt-2 overflow-hidden min-h-[360px]">
          {/* Left Column: Row Properties & Editor Controls */}
          <div className="lg:col-span-4 rounded-2xl bg-gray-950/60 border border-gray-800/80 p-4 flex flex-col space-y-4 overflow-y-auto">
            {/* Header & Row Stepper */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-800/80">
              <div>
                <p className="text-xs font-bold text-gray-200">
                  Editing Row:{' '}
                  <span className="text-cyan-400 font-mono text-sm">{selectedRow?.label}</span>
                </p>
                <p className="text-[10px] text-gray-500">
                  Row {selectedRowIndex + 1} of {rows.length}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Row</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveRow(selectedRowIndex)}
                  disabled={rows.length <= 1}
                  className="p-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 disabled:opacity-30 disabled:cursor-not-allowed text-xs transition-all cursor-pointer"
                  title="Delete Row"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Row Selector Pill Scroll */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Jump to Row
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {rows.map((r, idx) => {
                  const isSelected = idx === selectedRowIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedRowIndex(idx)}
                      className={`w-7 h-7 rounded-lg text-xs font-mono font-bold flex items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500 text-gray-950 font-black shadow-md shadow-cyan-500/30 scale-105'
                          : r.vip
                            ? 'bg-purple-950/50 border border-purple-500/40 text-purple-300'
                            : r.premium
                              ? 'bg-amber-950/50 border border-amber-500/40 text-amber-300'
                              : r.wheelchair
                                ? 'bg-emerald-950/50 border border-emerald-500/40 text-emerald-300'
                                : 'bg-gray-900 border border-gray-800 text-gray-300 hover:border-gray-700'
                      }`}
                    >
                      {r.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row Label & Seat Count */}
            {selectedRow && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {/* Row Label */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                      Row Identifier
                    </label>
                    <input
                      type="text"
                      maxLength={3}
                      value={selectedRow.label}
                      onChange={(e) => updateSelectedRow({ label: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 focus:border-cyan-500 text-center font-mono font-bold text-sm text-cyan-300 outline-none"
                    />
                  </div>

                  {/* Seat Count */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                      Seats Count ({selectedRow.seats})
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={40}
                      value={selectedRow.seats}
                      onChange={(e) =>
                        updateSelectedRow({
                          seats: Math.max(1, Math.min(40, parseInt(e.target.value, 10) || 1)),
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 focus:border-cyan-500 text-center font-mono font-bold text-sm text-white outline-none"
                    />
                  </div>
                </div>

                {/* Seat Slider */}
                <div>
                  <input
                    type="range"
                    min={4}
                    max={30}
                    value={selectedRow.seats}
                    onChange={(e) => updateSelectedRow({ seats: Number(e.target.value) })}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                    <span>4 min</span>
                    <span>16 mid</span>
                    <span>30 max</span>
                  </div>
                </div>

                {/* Row Tier / Category Selector */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    Row Tier Category
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Standard */}
                    <button
                      type="button"
                      onClick={() => setRowCategory('Standard')}
                      className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
                        selectedRow.category === 'Standard' && !selectedRow.wheelchair
                          ? 'bg-slate-800 border-slate-600 text-white shadow-sm'
                          : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <span className="text-sm">○</span>
                      <span>Standard</span>
                    </button>

                    {/* Premium */}
                    <button
                      type="button"
                      onClick={() => setRowCategory('Premium')}
                      className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
                        selectedRow.premium || selectedRow.category === 'Premium'
                          ? 'bg-amber-950/60 border-amber-500/60 text-amber-300 shadow-sm'
                          : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>Premium (★)</span>
                    </button>

                    {/* VIP Recliner */}
                    <button
                      type="button"
                      onClick={() => setRowCategory('VIP')}
                      className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
                        selectedRow.vip || selectedRow.category === 'VIP'
                          ? 'bg-purple-950/60 border-purple-500/60 text-purple-300 shadow-sm'
                          : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <Crown className="w-3.5 h-3.5 text-purple-400" />
                      <span>VIP Recliner</span>
                    </button>

                    {/* Accessible / Wheelchair */}
                    <button
                      type="button"
                      onClick={() => setRowCategory('Accessible')}
                      className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
                        selectedRow.wheelchair || selectedRow.category === 'Accessible'
                          ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 shadow-sm'
                          : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <Accessibility className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Accessible (♿)</span>
                    </button>
                  </div>
                </div>

                {/* Aisle Breakpoints */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center justify-between">
                    <span>Aisle Gap Breakpoints</span>
                    <span className="text-[10px] text-gray-500">Click seat to toggle aisle</span>
                  </label>
                  <div className="flex flex-wrap gap-1 p-2 rounded-xl bg-gray-900/80 border border-gray-800">
                    {Array.from({ length: selectedRow.seats }, (_, idx) => {
                      const seatNum = idx + 1;
                      const hasAisle = (selectedRow.aisles || []).includes(seatNum);
                      return (
                        <button
                          key={seatNum}
                          type="button"
                          onClick={() => toggleAisle(seatNum)}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-all cursor-pointer ${
                            hasAisle
                              ? 'bg-cyan-500/30 border border-cyan-400 text-cyan-200 font-bold'
                              : 'bg-gray-800/80 text-gray-400 hover:text-gray-200'
                          }`}
                          title={`Toggle aisle gap after seat ${selectedRow.label}${seatNum}`}
                        >
                          {seatNum}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Interactive Live Cinema Grid Visualization */}
          <div className="lg:col-span-8 rounded-2xl bg-gray-950/80 border border-gray-800/80 p-4 sm:p-6 flex flex-col overflow-hidden relative">
            {/* Curved Screen Banner at Top */}
            <div className="w-full flex flex-col items-center justify-center pb-4 select-none">
              <div className="w-3/4 sm:w-2/3 h-2 rounded-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_24px_#06b6d4] opacity-90" />
              <div className="w-4/5 sm:w-3/4 h-8 bg-gradient-to-b from-cyan-500/10 via-cyan-500/5 to-transparent blur-sm rounded-t-full -mt-1" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-300/80 mt-1 flex items-center gap-1.5">
                <span>CINEMA AUDITORIUM SCREEN</span>
              </p>
            </div>

            {/* Scrollable Seating Grid */}
            <div className="flex-1 overflow-auto p-2 flex flex-col items-center space-y-2">
              {rows.map((rowItem, rIdx) => {
                const isSelected = rIdx === selectedRowIndex;
                const aisles = rowItem.aisles || [];

                return (
                  <div
                    key={rIdx}
                    onClick={() => setSelectedRowIndex(rIdx)}
                    className={`flex items-center gap-2 px-2 py-1 rounded-xl transition-all cursor-pointer ${
                      isSelected ? 'bg-cyan-500/10 ring-1 ring-cyan-500/50' : 'hover:bg-gray-900/60'
                    }`}
                  >
                    {/* Left Row Indicator */}
                    <span
                      className={`w-6 text-center font-mono text-xs font-bold ${
                        isSelected ? 'text-cyan-400' : 'text-gray-500'
                      }`}
                    >
                      {rowItem.label}
                    </span>

                    {/* Seats in Row */}
                    <div className="flex items-center">
                      {Array.from({ length: rowItem.seats }, (_, sIdx) => {
                        const seatNum = sIdx + 1;
                        const hasAisle = aisles.includes(seatNum);

                        let seatStyles = 'bg-slate-800/80 border-slate-700 text-slate-300';
                        let seatIcon = null;

                        if (rowItem.vip || rowItem.category === 'VIP') {
                          seatStyles =
                            'bg-gradient-to-t from-purple-900/90 to-purple-800/90 border-purple-500/50 text-purple-200 shadow-sm shadow-purple-950';
                          seatIcon = <Crown className="w-2.5 h-2.5 text-purple-300" />;
                        } else if (rowItem.premium || rowItem.category === 'Premium') {
                          seatStyles =
                            'bg-gradient-to-t from-amber-900/90 to-amber-800/90 border-amber-500/50 text-amber-200 shadow-sm shadow-amber-950';
                          seatIcon = (
                            <Sparkles className="w-2.5 h-2.5 text-amber-300 fill-amber-300" />
                          );
                        } else if (rowItem.wheelchair || rowItem.category === 'Accessible') {
                          seatStyles =
                            'bg-gradient-to-t from-emerald-900/90 to-emerald-800/90 border-emerald-500/50 text-emerald-200 shadow-sm shadow-emerald-950';
                          seatIcon = <Accessibility className="w-2.5 h-2.5 text-emerald-300" />;
                        }

                        return (
                          <div
                            key={seatNum}
                            className={`flex items-center ${hasAisle ? 'mr-4 sm:mr-6' : 'mr-1'}`}
                          >
                            <div
                              title={`${rowItem.label}${seatNum} — ${rowItem.category}`}
                              className={`w-5 h-6 sm:w-6 sm:h-7 rounded-t-lg rounded-b-md border flex flex-col items-center justify-center text-[9px] font-mono font-bold transition-transform hover:scale-110 ${seatStyles}`}
                            >
                              {seatIcon ? (
                                seatIcon
                              ) : (
                                <span className="text-[8px] opacity-75">{seatNum}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Right Row Indicator */}
                    <span
                      className={`w-6 text-center font-mono text-xs font-bold ${
                        isSelected ? 'text-cyan-400' : 'text-gray-500'
                      }`}
                    >
                      {rowItem.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Legend Footer */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-3 border-t border-gray-800 text-[11px] text-gray-400 flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-slate-800 border border-slate-700" />
                <span>Standard (1.0x)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-amber-800 border border-amber-500" />
                <span className="text-amber-300">Premium (1.3x)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-purple-800 border border-purple-500" />
                <span className="text-purple-300">VIP Recliner (1.6x)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-emerald-800 border border-emerald-500" />
                <span className="text-emerald-300">Accessible Space (♿)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-800 flex-shrink-0 mt-3">
          <div className="text-xs text-gray-400 hidden sm:block">
            Capacity auto-computed from visual rows:{' '}
            <strong className="text-cyan-300">{stats.totalCapacity} seats</strong>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-gray-800 text-xs font-bold text-gray-300 hover:bg-gray-800/80 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading || !screenName.trim()}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-gray-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-cyan-500/25 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-gray-950" />
                  <span>Saving Layout...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isEditing ? 'Update Screen Layout' : 'Create Auditorium Screen'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatLayoutBuilder;
