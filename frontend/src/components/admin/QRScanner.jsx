import { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Camera,
  CameraOff,
  Flashlight,
  FlashlightOff,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  QrCode,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { validateTicket } from '../../services/api.js';

/**
 * QRScanner Component
 * Production-grade cinema entry gate kiosk with live camera feed, torch control,
 * animated scanning reticle, manual fallback validation, and instant audio/visual results.
 */
export const QRScanner = ({ gate = 'Gate 1', device = 'Kiosk Terminal', onScanResult }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [hasTorch, setHasTorch] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);

  const [manualInput, setManualInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  // Initialize or stop camera stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      const nav = typeof window !== 'undefined' ? window.navigator : null;
      if (!nav?.mediaDevices || !nav.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported on this browser or environment.');
      }

      const stream = await nav.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Check for torch capability
      const track = stream.getVideoTracks()[0];
      if (track) {
        const capabilities = track.getCapabilities ? track.getCapabilities() : {};
        if (capabilities.torch) {
          setHasTorch(true);
        }
      }

      setIsCameraActive(true);
    } catch (err) {
      setCameraError(err.message || 'Unable to access camera.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsTorchOn(false);
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track && track.applyConstraints) {
      try {
        await track.applyConstraints({
          advanced: [{ torch: !isTorchOn }],
        });
        setIsTorchOn(!isTorchOn);
      } catch (err) {
        console.warn('Torch toggle failed:', err);
      }
    }
  };

  // Perform validation API call
  const handleValidate = useCallback(
    async (payload) => {
      const trimmed = payload?.trim();
      if (!trimmed || isValidating) return;

      setIsValidating(true);
      setValidationResult(null);

      try {
        const response = await validateTicket({
          qrPayload: trimmed,
          gate,
          device,
        });

        const resultObj = {
          success: true,
          status: 'Valid',
          title: 'Entry Approved',
          message: response.message || 'Ticket valid. Access granted.',
          booking: response.booking,
          timestamp: new Date(),
        };

        setValidationResult(resultObj);
        if (onScanResult) onScanResult(resultObj);
      } catch (err) {
        const errData = err.data || err.response?.data || {};
        const isDuplicate =
          err.status === 409 ||
          errData.code === 'ALREADY_USED' ||
          errData.result === 'Already Used';

        const resultObj = {
          success: false,
          status: isDuplicate ? 'Already Used' : errData.result || 'Denied',
          title: isDuplicate ? 'Duplicate Entry' : 'Entry Denied',
          message: errData.message || err.message || 'Ticket validation failed. Access denied.',
          booking: errData.booking || null,
          timestamp: new Date(),
        };

        setValidationResult(resultObj);
        if (onScanResult) onScanResult(resultObj);
      } finally {
        setIsValidating(false);
      }
    },
    [gate, device, isValidating, onScanResult]
  );

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    handleValidate(manualInput);
    setManualInput('');
  };

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Scanner Viewport */}
      <div className="relative aspect-video sm:aspect-square max-h-[460px] w-full rounded-2xl bg-black overflow-hidden border border-gray-800 shadow-2xl flex items-center justify-center">
        {/* Video Element */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isCameraActive ? 'opacity-100' : 'opacity-0 hidden'
          }`}
        />

        {/* Inactive Camera Fallback State */}
        {!isCameraActive && (
          <div className="flex flex-col items-center justify-center p-6 text-center text-gray-400 space-y-3 z-10">
            <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center text-cyan-400">
              <QrCode className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-200">Camera Feed Inactive</p>
              <p className="text-xs text-gray-500 mt-1 max-w-xs">
                Activate the live camera stream for optical QR detection, or enter the Booking ID
                manually below.
              </p>
            </div>
            {cameraError && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {cameraError}
              </div>
            )}
            <button
              onClick={startCamera}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-black font-semibold text-xs transition-all shadow-lg shadow-cyan-500/20"
            >
              <Camera className="w-4 h-4" />
              <span>Start Camera Feed</span>
            </button>
          </div>
        )}

        {/* HUD Scanner Reticle & Scanning Animation */}
        {isCameraActive && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Darkened mask around reticle */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72">
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-cyan-400 rounded-tl-lg shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-cyan-400 rounded-tr-lg shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-cyan-400 rounded-bl-lg shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-cyan-400 rounded-br-lg shadow-[0_0_10px_rgba(6,182,212,0.8)]" />

              {/* Laser scanning beam */}
              <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_rgba(6,182,212,1)] animate-bounce" />

              {/* Center target crosshair */}
              <div className="absolute inset-0 flex items-center justify-center opacity-30">
                <div className="w-6 h-6 border border-cyan-400/50 rounded-full" />
              </div>
            </div>
          </div>
        )}

        {/* Camera Control Toolbar (Top Right) */}
        {isCameraActive && (
          <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
            {hasTorch && (
              <button
                type="button"
                onClick={toggleTorch}
                className={`p-2 rounded-xl backdrop-blur-md border transition-all ${
                  isTorchOn
                    ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                    : 'bg-black/60 border-gray-700 text-gray-300 hover:text-white'
                }`}
                title="Toggle Flashlight"
              >
                {isTorchOn ? (
                  <Flashlight className="w-4 h-4" />
                ) : (
                  <FlashlightOff className="w-4 h-4" />
                )}
              </button>
            )}

            <button
              type="button"
              onClick={stopCamera}
              className="p-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-gray-700 text-gray-300 hover:text-white transition-all"
              title="Stop Camera"
            >
              <CameraOff className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Gate Badge (Top Left) */}
        <div className="absolute top-3 left-3 z-20">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-gray-800 text-xs text-gray-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-semibold text-cyan-300">{gate}</span>
          </div>
        </div>

        {/* Live Validation Result Overlay */}
        {validationResult && (
          <div
            className={`absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center backdrop-blur-md animate-in zoom-in-95 duration-200 ${
              validationResult.status === 'Valid'
                ? 'bg-emerald-950/90 border-2 border-emerald-500'
                : validationResult.status === 'Already Used'
                  ? 'bg-rose-950/90 border-2 border-rose-500'
                  : 'bg-amber-950/90 border-2 border-amber-500'
            }`}
          >
            {validationResult.status === 'Valid' ? (
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 mb-3 shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                <CheckCircle2 className="w-10 h-10" />
              </div>
            ) : validationResult.status === 'Already Used' ? (
              <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500 flex items-center justify-center text-rose-400 mb-3 shadow-[0_0_20px_rgba(244,63,94,0.5)]">
                <ShieldAlert className="w-10 h-10" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center text-amber-400 mb-3 shadow-[0_0_20px_rgba(245,158,11,0.5)]">
                <AlertTriangle className="w-10 h-10" />
              </div>
            )}

            <h3 className="text-2xl font-black tracking-tight text-white mb-1">
              {validationResult.title}
            </h3>
            <p className="text-sm text-gray-200 max-w-sm mb-4 leading-relaxed font-medium">
              {validationResult.message}
            </p>

            {/* Booking Details Capsule if available */}
            {validationResult.booking && (
              <div className="bg-black/60 border border-white/10 rounded-xl p-3 max-w-xs w-full text-xs text-left mb-4 space-y-1">
                <div className="flex justify-between font-mono text-gray-400">
                  <span>Booking ID:</span>
                  <span className="text-white font-bold">{validationResult.booking.bookingId}</span>
                </div>
                {validationResult.booking.movieTitle && (
                  <div className="flex justify-between text-gray-300">
                    <span>Movie:</span>
                    <span className="font-semibold text-white truncate max-w-[150px]">
                      {validationResult.booking.movieTitle}
                    </span>
                  </div>
                )}
                {validationResult.booking.seats && (
                  <div className="flex justify-between text-gray-300">
                    <span>Seats:</span>
                    <span className="text-cyan-400 font-bold">
                      {Array.isArray(validationResult.booking.seats)
                        ? validationResult.booking.seats
                            .map((s) => (typeof s === 'string' ? s : s.seatNumber))
                            .join(', ')
                        : validationResult.booking.seats}
                    </span>
                  </div>
                )}
                {validationResult.booking.customerName && (
                  <div className="flex justify-between text-gray-300">
                    <span>Customer:</span>
                    <span className="text-gray-200">{validationResult.booking.customerName}</span>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setValidationResult(null)}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition-all border border-white/30 shadow-lg"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Ready for Next Scan</span>
            </button>
          </div>
        )}
      </div>

      {/* Manual Input Fallback Bar */}
      <form onSubmit={handleManualSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="Scan QR or enter Booking ID (e.g. BMS...)"
            disabled={isValidating}
            className="w-full px-4 py-3 bg-[#0b1120] border border-gray-800 rounded-xl text-xs text-gray-100 placeholder-gray-500 font-mono focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={isValidating || !manualInput.trim()}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isValidating ? (
            <Loader2 className="w-4 h-4 animate-spin text-black" />
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Validate</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

QRScanner.propTypes = {
  gate: PropTypes.string,
  device: PropTypes.string,
  onScanResult: PropTypes.func,
};

export default QRScanner;
