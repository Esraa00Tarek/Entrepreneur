import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { uploadMultipleImagesToCloudinary } from '../middleware/upload.js';
import {
  getUserThreads,
  getThreadMessages,
  sendMessage,
  markThreadMessagesRead,
  startTyping,
  stopTyping,
  joinThread,
  getAllThreadsAdmin,
  getAllMessagesAdmin,
  deleteMessageAdmin,
  deleteThreadAdmin
} from '../controllers/messageController.js';
import { isAdmin } from '../middleware/authMiddleware.js';


const router = express.Router();

router.use(protect);

// Basic routes for threads and messages
router.get('/threads', getUserThreads); // Supports filtering and pagination
router.get('/thread/:threadId', getThreadMessages); // Supports search, filtering and pagination
router.post(
  '/',
  protect,
  uploadMultipleImagesToCloudinary('attachments', 'messages'),
  sendMessage
);
router.patch('/thread/:threadId/read', markThreadMessagesRead);

// Real-time Socket.IO routes
router.post('/typing', startTyping);
router.post('/stop-typing', stopTyping);
router.post('/join-thread', joinThread);

// Advanced filtering routes
router.get('/threads/deals', (req, res) => {
  req.query.type = 'deal-progress';
  return getUserThreads(req, res);
});

router.get('/threads/orders', (req, res) => {
  req.query.type = 'ost-order';
  return getUserThreads(req, res);
});

router.get('/threads/offers', (req, res) => {
  req.query.type = 'offer-negotiation';
  return getUserThreads(req, res);
});

router.get('/threads/pre-deals', (req, res) => {
  req.query.type = 'pre-deal';
  return getUserThreads(req, res);
});

// Global search route
router.get('/search', async (req, res) => {
  const { q, page = 1, limit = 20 } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Search query is required' });
  }
  
  // Redirect to message search
  req.query.content = q;
  return getThreadMessages(req, res);
});

// Admin: Get all threads with filters
router.get('/admin/threads', protect, isAdmin, getAllThreadsAdmin);
// Admin: Get all messages with filters
router.get('/admin/messages', protect, isAdmin, getAllMessagesAdmin);
// Admin: Soft delete a message
router.delete('/admin/message/:messageId', protect, isAdmin, deleteMessageAdmin);
// Admin: Soft delete a thread
router.delete('/admin/thread/:threadId', protect, isAdmin, deleteThreadAdmin);

export default router; 