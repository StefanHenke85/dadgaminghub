import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase } from './config/supabase.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import sessionRoutes from './routes/sessions.js';
import messageRoutes from './routes/messages.js';
import notificationRoutes from './routes/notifications.js';
import adminRoutes from './routes/admin.js';
import testRoutes from './routes/test.js';
import statisticsRoutes from './routes/statistics.js';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/test', testRoutes);
app.use('/api/statistics', statisticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Dad Gaming Hub API is running',
    timestamp: new Date().toISOString()
  });
});

// Socket.IO for real-time features
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  // User joins with their ID
  socket.on('user:join', (userId) => {
    connectedUsers.set(userId, socket.id);
    socket.join(userId);
    console.log(`👤 User ${userId} joined`);

    // Broadcast online status to friends
    socket.broadcast.emit('user:online', userId);
  });

  // Join a gaming session room
  socket.on('session:join', (sessionId) => {
    socket.join(`session:${sessionId}`);
    console.log(`🎮 User joined session ${sessionId}`);
  });

  // Leave a gaming session room
  socket.on('session:leave', (sessionId) => {
    socket.leave(`session:${sessionId}`);
    console.log(`🚪 User left session ${sessionId}`);
  });

  // Send direct message
  socket.on('message:send', (data) => {
    const { recipientId, message } = data;
    const recipientSocketId = connectedUsers.get(recipientId);

    if (recipientSocketId) {
      io.to(recipientSocketId).emit('message:received', message);
    }
  });

  // Send session message
  socket.on('session:message', (data) => {
    const { sessionId, message } = data;
    io.to(`session:${sessionId}`).emit('session:message:received', message);
  });

  // Send notification
  socket.on('notification:send', (data) => {
    const { recipientId, notification } = data;
    const recipientSocketId = connectedUsers.get(recipientId);

    if (recipientSocketId) {
      io.to(recipientSocketId).emit('notification:received', notification);
    }
  });

  // User typing indicator
  socket.on('typing:start', (data) => {
    const { recipientId, userId } = data;
    const recipientSocketId = connectedUsers.get(recipientId);

    if (recipientSocketId) {
      io.to(recipientSocketId).emit('typing:user', { userId, typing: true });
    }
  });

  socket.on('typing:stop', (data) => {
    const { recipientId, userId } = data;
    const recipientSocketId = connectedUsers.get(recipientId);

    if (recipientSocketId) {
      io.to(recipientSocketId).emit('typing:user', { userId, typing: false });
    }
  });

  // Update online status
  socket.on('status:update', (data) => {
    const { userId, online, currentActivity } = data;
    socket.broadcast.emit('user:status:changed', {
      userId,
      online,
      currentActivity
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);

    // Find and remove user from connected users
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        socket.broadcast.emit('user:offline', userId);
        console.log(`👤 User ${userId} went offline`);
        break;
      }
    }
  });
});

// Test Supabase connection and start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Test Supabase connection
    const { error } = await supabase.from('profiles').select('count').limit(1);
    if (error && error.code !== 'PGRST116') {
      console.error('❌ Supabase connection error:', error.message);
      process.exit(1);
    }

    console.log('✅ Supabase connected successfully');

    httpServer.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════╗
║   Dad Gaming Hub API Server          ║
║                                      ║
║   🚀 Server running on port ${PORT}     ║
║   🌍 Environment: ${process.env.NODE_ENV || 'development'}       ║
║   📡 Socket.IO enabled               ║
║   🗄️  Supabase connected             ║
╚══════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Server startup error:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

export default app;
