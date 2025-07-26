import express from "express";
import http from "http"; // ✅ لازم نستخدم http server علشان Socket.io
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

// Import routes
import requestRoutes from "./routes/requestRoutes.js";
import milestoneRoutes from './routes/milestoneRoutes.js';
import businessRoutes from './routes/businessRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import activityLogRoutes from './routes/activityLogRoutes.js';
import dealRoutes from './routes/dealRoutes.js';
import offerRoutes from './routes/offerRoutes.js';
import directRequestRoutes from './routes/directRequestRoutes.js';
import withdrawalRoutes from './routes/withdrawalRoutes.js';
import disputeRoutes from './routes/disputeRoutes.js';
dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // أو origin الفرونت
    methods: ["GET", "POST", "PATCH"]
  }
});

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Inject io instance into every request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ✅ Routes
app.use("/api/requests", requestRoutes);
app.use('/api/milestones', milestoneRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/direct-requests', directRequestRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/disputes', disputeRoutes);
// ✅ WebSocket logic
io.on('connection', (socket) => {
  console.log('🟢 A user connected:', socket.id);

  // ======== JOIN USER ROOM =========
  socket.on('joinUser', (userId) => {
    socket.join(`user:${userId}`);
    console.log(`Socket ${socket.id} joined user:${userId}`);
  });

  // ======== JOIN THREAD ROOM =========
  socket.on('joinThread', (threadId) => {
    socket.join(threadId);
    console.log(`Socket ${socket.id} joined thread ${threadId}`);
  });

  // ======== LEAVE THREAD ROOM =========
  socket.on('leaveThread', (threadId) => {
    socket.leave(threadId);
    console.log(`Socket ${socket.id} left thread ${threadId}`);
  });

  // ======== NEW MESSAGE IN THREAD =========
  socket.on('newMessage', ({ threadId, message }) => {
    socket.to(threadId).emit('receiveMessage', message);
  });

  // ======== TYPING INDICATORS =========
  socket.on('startTyping', ({ threadId, userId }) => {
    socket.to(threadId).emit('userTyping', { userId, threadId });
  });

  socket.on('stopTyping', ({ threadId, userId }) => {
    socket.to(threadId).emit('typingStopped', { userId, threadId });
  });

  // ======== MESSAGE STATUS UPDATES =========
  socket.on('messageDelivered', ({ messageId, threadId }) => {
    socket.to(threadId).emit('messageStatusChanged', {
      messageId,
      status: 'delivered',
      timestamp: new Date()
    });
  });

  socket.on('messageRead', ({ messageId, threadId, readBy }) => {
    socket.to(threadId).emit('messageStatusChanged', {
      messageId,
      status: 'read',
      readBy,
      timestamp: new Date()
    });
  });

  // ======== THREAD UPDATES =========
  socket.on('threadUpdated', ({ threadId, lastMessage, lastMessageTime }) => {
    socket.to(threadId).emit('threadUpdated', {
      threadId,
      lastMessage,
      lastMessageTime
    });
  });

  // ======== JOIN NOTIFICATION CHANNEL =========
  socket.on('joinNotifications', (userId) => {
    socket.join(`notifications:${userId}`);
    console.log(`Socket ${socket.id} joined notifications:${userId}`);
  });

  // ======== SEND NOTIFICATION TO USER =========
  socket.on('sendNotification', ({ userId, notification }) => {
    io.to(`notifications:${userId}`).emit('receiveNotification', notification);
  });

  // ======== DEAL/ORDER/OFFER RELATED EVENTS =========
  socket.on('dealStatusChanged', ({ dealId, oldStatus, newStatus, participants }) => {
    participants.forEach(userId => {
      io.to(`user:${userId}`).emit('dealStatusUpdated', {
        dealId,
        oldStatus,
        newStatus,
        timestamp: new Date()
      });
    });
  });

  socket.on('orderStatusChanged', ({orderId, oldStatus, newStatus, participants }) => {
    participants.forEach(userId => {
      io.to(`user:${userId}`).emit('orderStatusUpdated', {
        orderId,
        oldStatus,
        newStatus,
        timestamp: new Date()
      });
    });
  });

  socket.on('offerStatusChanged', ({offerId, oldStatus, newStatus, participants }) => {
    participants.forEach(userId => {
      io.to(`user:${userId}`).emit('offerStatusUpdated', {
        offerId,
        oldStatus,
        newStatus,
        timestamp: new Date()
      });
    });
  });

  // ======== PRESENCE INDICATORS =========
  socket.on('userOnline', (userId) => {
    socket.broadcast.emit('userStatusChanged', {
      userId,
      status: 'online',
      timestamp: new Date()
    });
  });

  socket.on('userOffline', (userId) => {
    socket.broadcast.emit('userStatusChanged', {
      userId,
      status: 'offline',
      timestamp: new Date()
    });
  });

  // ======== FILE UPLOAD PROGRESS =========
  socket.on('fileUploadProgress', ({ threadId, fileName, progress }) => {
    socket.to(threadId).emit('fileUploadProgress', {
      fileName,
      progress,
      timestamp: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log('🔴 A user disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on portt ${PORT}`);
});

export { app, io };
