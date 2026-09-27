import mongoose from 'mongoose';
import SeatLock from '../models/SeatLock.js';
import Show from '../models/Show.js';

const LOCK_DURATION_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Register all seat reservation and real-time locking events on a socket
 *
 * @param {import('socket.io').Server} io
 * @param {import('socket.io').Socket} socket
 */
export const registerSeatEvents = (io, socket) => {
  const userId = socket.userId || `guest_${socket.id.slice(0, 8)}`;

  /**
   * 1. Join Show Room
   */
  socket.on('join-show', async ({ showId }) => {
    try {
      if (!showId || !mongoose.Types.ObjectId.isValid(showId)) {
        return;
      }

      const room = `show_${showId}`;
      socket.join(room);

      // Clean expired locks for this show
      await SeatLock.deleteMany({
        showId,
        expiresAt: { $lte: new Date() },
      });

      // Fetch all currently active locks for this show
      const activeLocks = await SeatLock.find({
        showId,
        expiresAt: { $gt: new Date() },
      });

      // Send initial locked seats to the joining socket
      socket.emit('initial-locks', {
        showId,
        lockedSeats: activeLocks.map((lock) => ({
          seatNumber: lock.seatNumber,
          userId: lock.userId,
          expiresIn: Math.max(0, Math.floor((lock.expiresAt.getTime() - Date.now()) / 1000)),
          isSelf: lock.userId === userId,
        })),
      });
    } catch (err) {
      console.error('[Socket] Error in join-show:', err.message);
    }
  });

  /**
   * 2. Lock Seat
   */
  socket.on('lock-seat', async ({ showId, seatNumber }) => {
    try {
      if (!showId || !seatNumber || !mongoose.Types.ObjectId.isValid(showId)) {
        socket.emit('lock-failed', { seatNumber, reason: 'Invalid show or seat identifier' });
        return;
      }

      const room = `show_${showId}`;

      // A. Check permanent bookings in Show model
      const show = await Show.findById(showId);
      if (!show || !show.isActive) {
        socket.emit('lock-failed', { seatNumber, reason: 'Show not found or inactive' });
        return;
      }

      const isPermanentlyBooked = show.seats?.some(
        (s) => s.seatNumber === seatNumber && s.status === 'booked'
      );
      if (isPermanentlyBooked) {
        socket.emit('lock-failed', { seatNumber, reason: 'Seat is already permanently booked' });
        return;
      }

      // B. Remove any expired lock for this specific seat
      await SeatLock.deleteMany({
        showId,
        seatNumber,
        expiresAt: { $lte: new Date() },
      });

      // C. Check if seat is currently locked by someone else
      const existingLock = await SeatLock.findOne({
        showId,
        seatNumber,
        expiresAt: { $gt: new Date() },
      });

      if (existingLock) {
        if (existingLock.userId === userId) {
          // Already locked by this user - acknowledge
          socket.emit('seat-locked', {
            showId,
            seatNumber,
            userId,
            expiresIn: Math.max(
              0,
              Math.floor((existingLock.expiresAt.getTime() - Date.now()) / 1000)
            ),
          });
          return;
        }

        socket.emit('lock-failed', {
          seatNumber,
          reason: 'Seat is currently locked by another customer',
        });
        return;
      }

      // D. Create new 5-minute lock
      const expiresAt = new Date(Date.now() + LOCK_DURATION_MS);
      await SeatLock.create({
        showId,
        seatNumber,
        userId,
        socketId: socket.id,
        expiresAt,
      });

      // E. Broadcast lock to all clients in this show room
      io.to(room).emit('seat-locked', {
        showId,
        seatNumber,
        userId,
        expiresIn: Math.floor(LOCK_DURATION_MS / 1000),
        expiresAt: expiresAt.toISOString(),
      });
    } catch (err) {
      console.error('[Socket] Error in lock-seat:', err.message);
      // In case of duplicate key race condition
      socket.emit('lock-failed', {
        seatNumber,
        reason: 'Seat was just locked by another customer',
      });
    }
  });

  /**
   * 3. Unlock Seat
   */
  socket.on('unlock-seat', async ({ showId, seatNumber }) => {
    try {
      if (!showId || !seatNumber || !mongoose.Types.ObjectId.isValid(showId)) {
        return;
      }

      const room = `show_${showId}`;

      // Validate lock ownership before unlocking
      const lock = await SeatLock.findOne({
        showId,
        seatNumber,
        userId,
      });

      if (lock) {
        await SeatLock.deleteOne({ _id: lock._id });

        // Broadcast release to all users viewing this show
        io.to(room).emit('seat-unlocked', {
          showId,
          seatNumber,
          userId,
        });
      }
    } catch (err) {
      console.error('[Socket] Error in unlock-seat:', err.message);
    }
  });

  /**
   * 4. Confirm Booking (Finalize permanent booking)
   */
  socket.on('confirm-booking', async ({ showId, seatNumbers }) => {
    try {
      if (!showId || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
        socket.emit('booking-failed', { reason: 'No seats provided for booking confirmation' });
        return;
      }

      const room = `show_${showId}`;

      // A. Verify that all requested seats currently belong to this user and haven't expired
      const validLocks = await SeatLock.find({
        showId,
        seatNumber: { $in: seatNumbers },
        userId,
        expiresAt: { $gt: new Date() },
      });

      if (validLocks.length !== seatNumbers.length) {
        socket.emit('booking-failed', {
          reason: 'One or more seat reservations have expired or are no longer valid.',
        });
        return;
      }

      // B. Update Show model: convert seats into permanent bookings
      const show = await Show.findById(showId);
      if (!show || !show.isActive) {
        socket.emit('booking-failed', { reason: 'Show is not available' });
        return;
      }

      seatNumbers.forEach((sn) => {
        const existingSeat = show.seats?.find((s) => s.seatNumber === sn);
        if (existingSeat) {
          existingSeat.status = 'booked';
        } else {
          show.seats.push({
            seatNumber: sn,
            row: sn.charAt(0),
            status: 'booked',
          });
        }
      });

      await show.save();

      // C. Remove temporary locks
      await SeatLock.deleteMany({
        showId,
        seatNumber: { $in: seatNumbers },
      });

      // D. Broadcast permanent booking to everyone in the room
      io.to(room).emit('booking-confirmed', {
        showId,
        bookedSeats: seatNumbers,
        userId,
      });

      // E. Emit booking success to the current user
      socket.emit('booking-success', {
        showId,
        bookedSeats: seatNumbers,
        bookingId: `BMS-${Date.now().toString(36).toUpperCase()}`,
      });
    } catch (err) {
      console.error('[Socket] Error in confirm-booking:', err.message);
      socket.emit('booking-failed', { reason: err.message || 'Booking confirmation failed' });
    }
  });

  /**
   * 5. Disconnection Handling
   * Automatically release all active locks held by this socket connection
   */
  socket.on('disconnect', async () => {
    try {
      const socketLocks = await SeatLock.find({ socketId: socket.id });

      if (socketLocks.length > 0) {
        await SeatLock.deleteMany({ socketId: socket.id });

        socketLocks.forEach((lock) => {
          const room = `show_${lock.showId}`;
          io.to(room).emit('seat-unlocked', {
            showId: lock.showId.toString(),
            seatNumber: lock.seatNumber,
            userId: lock.userId,
            reason: 'disconnected',
          });
        });
      }
    } catch (err) {
      console.error('[Socket] Error in disconnect lock cleanup:', err.message);
    }
  });
};

/**
 * Periodically purge expired locks and broadcast unlocks to connected rooms
 * @param {import('socket.io').Server} io
 */
export const startLockReaper = (io) => {
  setInterval(async () => {
    try {
      const now = new Date();
      const expiredLocks = await SeatLock.find({ expiresAt: { $lte: now } });

      if (expiredLocks.length > 0) {
        await SeatLock.deleteMany({ _id: { $in: expiredLocks.map((l) => l._id) } });

        expiredLocks.forEach((lock) => {
          const room = `show_${lock.showId}`;
          io.to(room).emit('seat-unlocked', {
            showId: lock.showId.toString(),
            seatNumber: lock.seatNumber,
            userId: lock.userId,
            reason: 'expired',
          });
        });
      }
    } catch (err) {
      console.error('[Socket] Lock reaper error:', err.message);
    }
  }, 5000); // Check every 5 seconds
};

export default registerSeatEvents;
