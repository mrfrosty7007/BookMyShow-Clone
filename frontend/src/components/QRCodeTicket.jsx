import { QRCodeSVG } from 'qrcode.react';
import { QrCode, ShieldCheck } from 'lucide-react';

/**
 * QRCodeTicket Component
 * Renders an authenticated QR code for entry gate validation
 * containing bookingId, movie, theater, and seat identifiers.
 */
export const QRCodeTicket = ({ booking, size = 160 }) => {
  if (!booking) return null;

  const { bookingId = 'BMS-DEMO', movie, theater, seats = [], qrToken } = booking;

  // Standard payload required by acceptance criteria
  const qrPayload =
    qrToken ||
    JSON.stringify({
      bookingId,
      movie: movie?.title || movie || 'Cinema Movie',
      theater: theater?.name || theater || 'Multiplex Cinema',
      seats,
    });

  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gray-950/80 border border-cyan-500/30 shadow-xl shadow-cyan-950/40 text-center select-none backdrop-blur-md">
      {/* QR Code Container with Cyber Border Accents */}
      <div className="relative p-3.5 bg-white rounded-xl shadow-inner shadow-black/20">
        {/* Cyber glowing corners */}
        <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
        <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
        <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
        <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />

        <QRCodeSVG
          value={qrPayload}
          size={size}
          level="H"
          includeMargin={false}
          className="mx-auto"
        />
      </div>

      {/* Ticket Details & Scan Instructions */}
      <div className="mt-3.5 space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-cyan-300">
          <QrCode className="w-3.5 h-3.5 text-cyan-400" />
          <span>Entry Gate Scan Pass</span>
        </div>

        <div className="font-mono text-xs font-black text-white tracking-widest bg-gray-900/90 px-3 py-1 rounded-md border border-gray-800">
          {bookingId}
        </div>

        <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400 pt-0.5">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>
            Valid for {seats.length} {seats.length === 1 ? 'person' : 'people'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default QRCodeTicket;
