const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io = null;

/**
 * Initialize Socket.IO on the HTTP server.
 * Call once from server.js after creating the http server.
 */
const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  // Auth middleware — verify JWT on every connection
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    // Join a personal room so we can exclude this user when broadcasting
    socket.join(`user:${socket.userId}`);

    // Join a board room
    socket.on('board:join', ({ boardId }) => {
      if (boardId) {
        socket.join(`board:${boardId}`);
      }
    });

    // Leave a board room
    socket.on('board:leave', ({ boardId }) => {
      if (boardId) {
        socket.leave(`board:${boardId}`);
      }
    });

    socket.on('disconnect', () => {});
  });

  return io;
};

/**
 * Get the Socket.IO instance.
 * Returns null if not yet initialized.
 */
const getIO = () => io;

/**
 * Emit an event to a board room, EXCLUDING the user who triggered the action.
 * Uses a personal `user:<id>` room to exclude all of that user's sockets.
 */
const emitToBoard = (boardId, userId, event, data) => {
  if (!io) return;
  io.to(`board:${boardId}`).except(`user:${userId}`).emit(event, data);
};

module.exports = { initSocket, getIO, emitToBoard };
