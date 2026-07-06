import { io } from 'socket.io-client';

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message);
    });
  }
  return socket;
}

/**
 * Subscribe to live price updates for a list of symbols.
 * Returns an unsubscribe function.
 *
 * @param {string[]} symbols - e.g. ['TATAMOTORS', 'RELIANCE']
 * @param {(data: { symbol: string, price: number }) => void} onPriceUpdate
 * @returns {() => void} cleanup function
 */
export function subscribePrices(symbols, onPriceUpdate) {
  if (!symbols || symbols.length === 0) return () => {};

  const sock = getSocket();

  sock.emit('subscribe', symbols);

  sock.on('price:update', onPriceUpdate);

  return () => {
    sock.off('price:update', onPriceUpdate);
    sock.emit('unsubscribe', symbols);
  };
}
