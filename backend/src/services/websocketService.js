import { Server as SocketIOServer } from 'socket.io';
import { logger } from '../config/logger.js';

/**
 * Real-Time WebSocket Communication Hub
 * 
 * Concept: WebSocket / real-time communication (System & Integration)
 * - Full-duplex bidirectional communication
 * - Event-driven broadcasting (news:new, event:alert, ticker:update)
 * - Room / Channel segregation (e.g. theater rooms: 'INDO_PACIFIC', 'EUROPE')
 * - Connection heartbeat and telemetry
 */

let io = null;

export function initWebSocketServer(httpServer) {
  if (io) return io;

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*', // Allow development origins
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    logger.info({ socketId: socket.id }, 'WebSocket client connected');

    // Send initial handshake confirmation with server timestamp
    socket.emit('connection:ready', {
      status: 'CONNECTED',
      serverTime: new Date().toISOString(),
      activeClients: io.engine.clientsCount,
    });

    // Client can subscribe to theater-specific rooms
    socket.on('join:theater', (theater) => {
      if (typeof theater === 'string') {
        socket.join(theater);
        logger.debug({ socketId: socket.id, theater }, 'Client joined theater room');
        socket.emit('joined:theater', { theater, confirmed: true });
      }
    });

    socket.on('leave:theater', (theater) => {
      socket.leave(theater);
      logger.debug({ socketId: socket.id, theater }, 'Client left theater room');
    });

    // Client heartbeat
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() });
    });

    socket.on('disconnect', (reason) => {
      logger.info({ socketId: socket.id, reason }, 'WebSocket client disconnected');
    });
  });

  return io;
}

export function getIO() {
  return io;
}

/**
 * Broadcasts a new article to all connected clients
 */
export function broadcastNewArticle(article) {
  if (!io) return;
  io.emit('news:new', {
    article,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Broadcasts a high-priority geopolitical alert
 */
export function broadcastGeopoliticalAlert(alert) {
  if (!io) return;
  io.emit('event:alert', {
    ...alert,
    timestamp: new Date().toISOString(),
  });

  // If theater is specified, emit targeted update
  if (alert.theater) {
    io.to(alert.theater).emit('theater:alert', alert);
  }
}

/**
 * Broadcasts live intelligence ticker updates
 */
export function broadcastTickerUpdate(tickerItems) {
  if (!io) return;
  io.emit('ticker:update', {
    items: tickerItems,
    timestamp: new Date().toISOString(),
  });
}
