
import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { initializeSocketIO } from './socket';
import { Logger } from './utils/logger';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const PORT = process.env.PORT || 3000;

const httpServer = http.createServer(app);

// Initialize Socket.io with CORS
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : '*', // Allow all for dev
    methods: ["GET", "POST"],
    credentials: true // Allow cookies/auth headers with WebSocket handshake
  },
  // Optionally increase maxHttpBufferSize if sending large WebRTC SDPs or candidates
  // maxHttpBufferSize: 1e8 // 100 MB
});

// Setup Socket Logic
initializeSocketIO(io);

// Start Server
httpServer.listen(PORT, () => {
  Logger.tactical(`SYSTEM ONLINE. Listening on port ${PORT}`);
  Logger.info(`Mission Control (API & Frontend) accessible at http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  Logger.warn('SIGTERM signal received. Shutting down gracefully.');
  httpServer.close(() => {
    Logger.info('HTTP server closed.');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  Logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  Logger.error('Uncaught Exception:', error);
  process.exit(1); // Exit with failure code
});
