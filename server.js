/**
 * Server Entrypoint
 * Boots HTTP server and Socket.io engine listening on dynamic Cloud Run PORT.
 */

const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');

// Dynamic PORT for Google Cloud Run (Defaults to 8080)
const PORT = process.env.PORT || 8080;

const server = http.createServer(app);

// Initialize Socket.io Real-Time Engine
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Store io instance on app for access in route handlers
app.set('io', io);

// Real-Time Socket Connection Handlers
io.on('connection', (socket) => {
  console.log(`[Socket.io] New client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// Start Server Listening
server.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(` SmartKinalEventPlatform Server Running `);
  console.log(` Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(` Port        : ${PORT}`);
  console.log(` Local Access: http://localhost:${PORT}`);
  console.log(`=======================================================`);
});

// Graceful Shutdown Handler for Cloud Run Containers
const gracefulShutdown = (signal) => {
  console.log(`[Server] Received ${signal}. Initiating graceful shutdown...`);
  server.close(() => {
    console.log('[Server] HTTP and Socket.io server closed.');
    process.exit(0);
  });

  // Force shutdown if connections do not drain in 10s
  setTimeout(() => {
    console.error('[Server] Forced shutdown due to timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = server;
