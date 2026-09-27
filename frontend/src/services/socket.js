import { io } from 'socket.io-client';

let socket = null;

/**
 * Get or create the client-side session identifier for guest or multi-tab isolation
 */
export const getClientSessionId = () => {
  if (typeof window === 'undefined') return 'guest_default';
  let sessionId = window.sessionStorage.getItem('bms_socket_session_id');
  if (!sessionId) {
    sessionId = `sess_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
    window.sessionStorage.setItem('bms_socket_session_id', sessionId);
  }
  return sessionId;
};

/**
 * Initialize or retrieve the Socket.IO connection
 * @param {string|null} userId Optional authenticated user ID
 * @returns {import('socket.io-client').Socket}
 */
export const getSocket = (userId = null) => {
  if (!socket) {
    const sessionId = getClientSessionId();
    const resolvedUserId = userId || sessionId;

    // Use current origin in development (proxied by Vite) or fallback to localhost:5000
    const serverUrl =
      typeof window !== 'undefined' && window.location.port === '5173'
        ? window.location.origin
        : 'http://localhost:5000';

    socket = io(serverUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      auth: {
        userId: resolvedUserId,
      },
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected to realtime seat server:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.warn('[Socket] Connection error:', error.message);
    });
  }

  return socket;
};

/**
 * Disconnect socket instance
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Join a specific show room
 * @param {string} showId
 */
export const joinShow = (showId) => {
  const s = getSocket();
  if (s && showId) {
    s.emit('join-show', { showId });
  }
};

/**
 * Request a 5-minute seat lock
 * @param {string} showId
 * @param {string} seatNumber
 */
export const lockSeat = (showId, seatNumber) => {
  const s = getSocket();
  if (s && showId && seatNumber) {
    s.emit('lock-seat', { showId, seatNumber });
  }
};

/**
 * Release a held seat lock
 * @param {string} showId
 * @param {string} seatNumber
 */
export const unlockSeat = (showId, seatNumber) => {
  const s = getSocket();
  if (s && showId && seatNumber) {
    s.emit('unlock-seat', { showId, seatNumber });
  }
};

/**
 * Confirm and finalize booking of locked seats
 * @param {string} showId
 * @param {string[]} seatNumbers
 */
export const confirmBooking = (showId, seatNumbers) => {
  const s = getSocket();
  if (s && showId && Array.isArray(seatNumbers)) {
    s.emit('confirm-booking', { showId, seatNumbers });
  }
};

export default {
  getSocket,
  disconnectSocket,
  joinShow,
  lockSeat,
  unlockSeat,
  confirmBooking,
  getClientSessionId,
};
