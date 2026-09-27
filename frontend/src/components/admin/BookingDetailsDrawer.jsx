import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  X,
  User,
  Film,
  Building2,
  Calendar,
  CreditCard,
  QrCode,
  RotateCcw,
  UserCheck,
  History,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { getAdminBookingById, checkInBooking } from '../../services/api.js';
import { BookingStatusPill } from './BookingStatusPill.jsx';
import { AuditTimeline } from './AuditTimeline.jsx';

/**
 * BookingDetailsDrawer Component
 * Slide-over inspector displaying comprehensive booking lifecycle, customer profile,
 * financial breakdown, gate validation telemetry, and full audit logs.
 */
export const BookingDetailsDrawer = ({
  isOpen,
  onClose,
  bookingId,
  onBookingUpdated,
  onOpenRefund,
}) => {
  const [booking, setBooking] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchBookingDetails = async () => {
      if (!bookingId || !isOpen) return;
      setIsLoading(true);
      setError(null);
      setActionMessage(null);

      try {
        const response = await getAdminBookingById(bookingId);
        if (isMounted) {
          setBooking(response.booking);
          setAuditLogs(response.auditLogs || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load booking details.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchBookingDetails();

    return () => {
      isMounted = false;
    };
  }, [bookingId, isOpen]);

  const handleManualCheckIn = async () => {
    if (!booking) return;
    setIsCheckingIn(true);
    setError(null);

    try {
      const response = await checkInBooking(booking._id || booking.bookingId, {
        gate: 'Staff Desk',
        device: 'Admin Console (Manual)',
      });

      setBooking(response.booking);
      setActionMessage('Ticket successfully checked-in.');
      if (onBookingUpdated) {
        onBookingUpdated(response.booking);
      }
    } catch (err) {
      setError(err.message || 'Failed to check-in ticket.');
    } finally {
      setIsCheckingIn(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-[#0b1120] border-l border-gray-800 shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800/80 bg-gray-900/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-gray-100 font-mono tracking-tight">
                    {booking?.bookingId || bookingId}
                  </h2>
                  {booking && <BookingStatusPill status={booking.status} size="sm" />}
                </div>
                <p className="text-xs text-gray-400">Operational Booking Inspector</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                <p className="text-sm">Loading booking telemetry...</p>
              </div>
            ) : error ? (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            ) : booking ? (
              <>
                {/* Feedback Message */}
                {actionMessage && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                    <UserCheck className="w-4 h-4 shrink-0" />
                    <span>{actionMessage}</span>
                  </div>
                )}

                {/* Quick Action Bar */}
                <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-xl bg-gray-900/60 border border-gray-800">
                  {booking.status === 'Confirmed' && (
                    <button
                      onClick={handleManualCheckIn}
                      disabled={isCheckingIn}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-xs transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
                    >
                      {isCheckingIn ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <UserCheck className="w-3.5 h-3.5" />
                      )}
                      <span>Manual Check-In</span>
                    </button>
                  )}

                  {booking.status !== 'Refunded' && booking.status !== 'Cancelled' && (
                    <button
                      onClick={() => onOpenRefund(booking)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-medium text-xs transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Process Refund</span>
                    </button>
                  )}

                  <div className="ml-auto text-xs text-gray-400">
                    Created on{' '}
                    <span className="text-gray-200">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Customer Information Card */}
                <div className="rounded-xl bg-gray-900/40 border border-gray-800 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-300">
                    <User className="w-4 h-4 text-cyan-400" />
                    <span>Customer Details</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-gray-500 block">Name</span>
                      <span className="font-medium text-gray-200">
                        {booking.user?.name || 'Guest User'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Email</span>
                      <span className="font-medium text-gray-200">
                        {booking.user?.email || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Phone</span>
                      <span className="font-medium text-gray-200">
                        {booking.user?.phone || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Payment Method</span>
                      <span className="font-medium text-gray-200 capitalize">
                        {booking.paymentMethod || 'Online Simulation'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Movie & Showtime Card */}
                <div className="rounded-xl bg-gray-900/40 border border-gray-800 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-300">
                    <Film className="w-4 h-4 text-cyan-400" />
                    <span>Movie & Session Details</span>
                  </div>
                  <div className="flex gap-4">
                    {booking.movie?.poster && (
                      <img
                        src={booking.movie.poster}
                        alt={booking.movie.title}
                        className="w-16 h-24 object-cover rounded-lg border border-gray-800 shadow"
                      />
                    )}
                    <div className="space-y-1.5 text-xs flex-1">
                      <p className="font-bold text-sm text-gray-100">{booking.movie?.title}</p>
                      <p className="text-gray-400 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-blue-400" />
                        <span>
                          {booking.theater?.name} • Screen{' '}
                          {booking.screen || booking.show?.screen || 1}
                        </span>
                      </p>
                      <p className="text-gray-400 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-purple-400" />
                        <span>
                          {booking.show?.showDate ||
                            (booking.show?.showTime
                              ? new Date(booking.show.showTime).toLocaleDateString()
                              : 'N/A')}{' '}
                          at{' '}
                          {booking.show?.showTime
                            ? new Date(booking.show.showTime).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'N/A'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reserved Seats & Financial Breakdown */}
                <div className="rounded-xl bg-gray-900/40 border border-gray-800 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-300">
                      <CreditCard className="w-4 h-4 text-cyan-400" />
                      <span>Seats & Billing Breakdown</span>
                    </div>
                    <span className="text-xs font-mono text-cyan-400">
                      {booking.seats?.length} Seat(s) Reserved
                    </span>
                  </div>

                  {/* Seat badges */}
                  <div className="flex flex-wrap gap-2">
                    {booking.seats?.map((seat, idx) => {
                      const seatName = typeof seat === 'string' ? seat : seat.seatNumber;
                      return (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-cyan-300 font-mono font-bold text-xs"
                        >
                          Seat {seatName}
                        </span>
                      );
                    })}
                  </div>

                  <div className="h-px bg-gray-800 my-2" />

                  {/* Amount table */}
                  <div className="space-y-1.5 text-xs text-gray-400">
                    <div className="flex justify-between">
                      <span>Subtotal (Tickets):</span>
                      <span className="text-gray-200 font-mono">
                        ₹{booking.subtotal || booking.totalAmount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Convenience Fee:</span>
                      <span className="text-gray-200 font-mono">
                        ₹{booking.convenienceFee || 30}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST (18%):</span>
                      <span className="text-gray-200 font-mono">₹{booking.gst || 5.4}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-gray-100 pt-2 border-t border-gray-800">
                      <span>Total Paid:</span>
                      <span className="text-cyan-400 font-mono">₹{booking.totalAmount}</span>
                    </div>
                  </div>

                  {/* Refund details if present */}
                  {booking.refund && booking.refund.amount > 0 && (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs space-y-1">
                      <div className="flex justify-between font-semibold text-amber-400">
                        <span>Refund Processed:</span>
                        <span>
                          ₹{booking.refund.amount} ({booking.refund.percentage}%)
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400">
                        Reason: {booking.refund.reason || 'Admin discretion'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Gate Entry & Scan History */}
                <div className="rounded-xl bg-gray-900/40 border border-gray-800 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-300">
                      <QrCode className="w-4 h-4 text-cyan-400" />
                      <span>Gate Entry Status</span>
                    </div>
                    {booking.checkedInAt && (
                      <span className="text-xs text-emerald-400 font-medium">
                        Checked-in at {new Date(booking.checkedInAt).toLocaleTimeString()}
                      </span>
                    )}
                  </div>

                  {booking.checkedInBy && (
                    <div className="p-2.5 rounded-lg bg-black/40 border border-gray-800/80 text-xs text-gray-400 flex flex-wrap gap-4">
                      <div>
                        <span className="text-gray-500 block">Gate</span>
                        <span className="text-gray-200 font-medium">
                          {booking.checkedInBy.gate || 'Main Entrance'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Device</span>
                        <span className="text-gray-200 font-medium">
                          {booking.checkedInBy.device || 'Kiosk Scanner'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Validated By</span>
                        <span className="text-gray-200 font-medium">
                          {booking.checkedInBy.staffName ||
                            booking.checkedInBy.name ||
                            'Staff User'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* QR Raw Token Display */}
                  <div className="p-2.5 rounded-lg bg-black/60 border border-gray-800/80 font-mono text-[11px] text-gray-400 break-all">
                    <span className="text-gray-500 block text-[10px] mb-1">QR TOKEN PAYLOAD</span>
                    {booking.qrToken || JSON.stringify({ bookingId: booking.bookingId })}
                  </div>
                </div>

                {/* Audit Trail Timeline */}
                <div className="rounded-xl bg-gray-900/40 border border-gray-800 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-300">
                    <History className="w-4 h-4 text-cyan-400" />
                    <span>Audit Trail & Lifecycle Events</span>
                  </div>
                  <AuditTimeline
                    events={[
                      ...(booking.auditTrail || []),
                      ...(booking.scanHistory || []),
                      ...(auditLogs || []),
                    ]}
                  />
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

BookingDetailsDrawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  bookingId: PropTypes.string,
  onBookingUpdated: PropTypes.func,
  onOpenRefund: PropTypes.func,
};

export default BookingDetailsDrawer;
