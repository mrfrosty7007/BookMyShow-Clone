import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  QrCode,
  ShieldCheck,
  ShieldAlert,
  History,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  VolumeX,
  ArrowLeft,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import { QRScanner } from '../../components/admin/QRScanner.jsx';
import { getTicketScanHistory } from '../../services/api.js';

const GATE_OPTIONS = [
  'Gate 1 (Main Entrance)',
  'Gate 2 (Audi 1-3)',
  'Gate 3 (IMAX / 4DX)',
  'VIP Club Entrance',
  'Staff Pass Gate',
];

/**
 * TicketScanner Page
 * Full-screen operational kiosk for gate staff ticket validation,
 * duplicate scan defense, and real-time entry stream monitoring.
 */
export const TicketScanner = () => {
  const [selectedGate, setSelectedGate] = useState(GATE_OPTIONS[0]);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const [stats, setStats] = useState({
    scansToday: 0,
    approvedToday: 0,
    duplicatesToday: 0,
    deniedToday: 0,
  });
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Fetch scan history and statistics
  const fetchTelemetry = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) setIsLoadingHistory(true);
      const data = await getTicketScanHistory({ limit: 20 });
      if (data.logs) {
        setScanHistory(data.logs);
      }
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load entry scan history:', err);
    } finally {
      if (showLoader) setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const runInitial = async () => {
      try {
        const data = await getTicketScanHistory({ limit: 20 });
        if (!isMounted) return;
        if (data.logs) setScanHistory(data.logs);
        if (data.stats) setStats(data.stats);
      } catch (err) {
        console.error('Failed to load entry scan history:', err);
      }
    };
    runInitial();

    const interval = setInterval(() => {
      fetchTelemetry(false);
    }, 15000); // 15s polling for kiosk

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [fetchTelemetry]);

  // Handle incoming scan results from QRScanner
  const handleScanResult = (result) => {
    // Play subtle audio cue if not muted
    if (!isAudioMuted && typeof window !== 'undefined') {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (result.success) {
          // Success high pitch beep
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          osc.start();
          osc.stop(ctx.currentTime + 0.15);
        } else {
          // Error low buzz
          osc.frequency.setValueAtTime(220, ctx.currentTime);
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          osc.start();
          osc.stop(ctx.currentTime + 0.3);
        }
      } catch {
        // Fallback silently if audio context restricted
      }
    }

    // Refresh history
    fetchTelemetry();
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-gray-100 flex flex-col">
      {/* Top Kiosk Header */}
      <header className="sticky top-0 z-30 bg-[#0b1120]/95 backdrop-blur-md border-b border-gray-800/80 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/bookings"
            className="p-2 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-gray-200 transition-colors"
            title="Back to Bookings Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-gray-100 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-cyan-400" />
                <span>Ticket Validation Kiosk</span>
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                Gate Terminal
              </span>
            </div>
            <p className="text-xs text-gray-400">Live Cinema Entry & Check-In Validation</p>
          </div>
        </div>

        {/* Gate Selector & Audio Toggle */}
        <div className="flex items-center gap-3">
          {/* Gate Selector */}
          <div className="flex items-center gap-1.5 bg-gray-900 border border-gray-800 rounded-xl px-3 py-1.5 text-xs text-gray-300">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={selectedGate}
              onChange={(e) => setSelectedGate(e.target.value)}
              className="bg-transparent text-gray-200 focus:outline-none cursor-pointer"
            >
              {GATE_OPTIONS.map((gate) => (
                <option key={gate} value={gate} className="bg-gray-900 text-gray-200">
                  {gate}
                </option>
              ))}
            </select>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className={`p-2 rounded-xl border transition-all ${
              isAudioMuted
                ? 'bg-gray-900 border-gray-800 text-gray-500'
                : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
            }`}
            title={isAudioMuted ? 'Unmute Scan Audio' : 'Mute Scan Audio'}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Kiosk Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: QR Scanner Viewport (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <QRScanner
            gate={selectedGate}
            device="Kiosk Terminal #1"
            onScanResult={handleScanResult}
          />

          {/* Validation Matrix Reference Card */}
          <div className="rounded-2xl bg-[#0b1120]/70 border border-gray-800/80 p-4 text-xs text-gray-400 space-y-2">
            <h4 className="font-semibold text-gray-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Gate Entry Policies</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1">
              <div className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-emerald-300">
                <strong className="block text-emerald-400 font-mono">1. Entry Approved</strong>
                Valid ticket, payment confirmed, marked Checked-In.
              </div>
              <div className="p-2 rounded-lg bg-rose-950/20 border border-rose-500/20 text-rose-300">
                <strong className="block text-rose-400 font-mono">2. Duplicate Entry</strong>
                Ticket already scanned. Immediate gate rejection (409).
              </div>
              <div className="p-2 rounded-lg bg-amber-950/20 border border-amber-500/20 text-amber-300">
                <strong className="block text-amber-400 font-mono">3. Entry Denied</strong>
                Wrong show, cancelled session, or refunded booking.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Telemetry & Feed (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {/* Quick Metrics Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-[#0b1120] border border-gray-800">
              <span className="text-[10px] text-gray-400 block">Scans Today</span>
              <span className="text-lg font-bold text-gray-100 font-mono">{stats.scansToday}</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
              <span className="text-[10px] text-emerald-400 block">Approved</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">
                {stats.approvedToday}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/20">
              <span className="text-[10px] text-rose-400 block">Duplicates</span>
              <span className="text-lg font-bold text-rose-400 font-mono">
                {stats.duplicatesToday}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20">
              <span className="text-[10px] text-amber-400 block">Denied</span>
              <span className="text-lg font-bold text-amber-400 font-mono">
                {stats.deniedToday}
              </span>
            </div>
          </div>

          {/* Live Scan History Stream */}
          <div className="flex-1 rounded-2xl bg-[#0b1120] border border-gray-800 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900/40">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                  Live Gate Log
                </h3>
              </div>
              <button
                onClick={fetchTelemetry}
                disabled={isLoadingHistory}
                className="p-1.5 rounded-lg text-gray-400 hover:text-cyan-400 transition-colors"
                title="Refresh History"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingHistory ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Log Stream List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[460px]">
              {scanHistory.length === 0 ? (
                <div className="text-center py-16 text-gray-500 text-xs">
                  No scan operations recorded today yet.
                </div>
              ) : (
                scanHistory.map((item, idx) => {
                  const isApproved =
                    item.action === 'TICKET_VALIDATED' || item.action === 'MANUAL_CHECKIN';
                  const isDuplicate = item.action === 'DUPLICATE_SCAN_REJECTED';
                  const timeStr = new Date(item.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  });

                  return (
                    <div
                      key={item._id || idx}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 transition-all ${
                        isApproved
                          ? 'bg-emerald-950/10 border-emerald-500/20 text-gray-200'
                          : isDuplicate
                            ? 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                            : 'bg-amber-950/15 border-amber-500/25 text-amber-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`p-1.5 rounded-lg ${
                            isApproved
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : isDuplicate
                                ? 'bg-rose-500/20 text-rose-400'
                                : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {isApproved ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : isDuplicate ? (
                            <ShieldAlert className="w-3.5 h-3.5" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-[11px] text-gray-200 truncate">
                              {item.metadata?.bookingId ||
                                item.booking?.bookingId ||
                                item.metadata?.rawInput ||
                                'ID Lookup'}
                            </span>
                            <span
                              className={`text-[9px] px-1 rounded font-bold uppercase ${
                                isApproved
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : isDuplicate
                                    ? 'bg-rose-500/30 text-rose-300'
                                    : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              {isApproved ? 'Approved' : isDuplicate ? 'Duplicate' : 'Denied'}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 truncate">
                            {item.metadata?.gate || 'Gate Entry'} •{' '}
                            {item.actor?.name || 'Staff User'}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono text-gray-400 shrink-0">
                        {timeStr}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TicketScanner;
