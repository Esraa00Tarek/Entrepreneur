import express from 'express';
import { protect, isAdmin } from '../middleware/authMiddleware.js';
import {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  adminSendNotification,
  adminGetUserNotifications,
  adminGetAllNotifications,
  adminDeleteNotification,
  adminUpdateNotification,
  adminBroadcastNotification
} from '../controllers/notificationController.js';

const router = express.Router();

router.use(protect);

router.get('/', getUserNotifications);
router.patch('/:id/read', markNotificationRead);
router.patch('/markAllRead', markAllNotificationsRead);
router.post('/admin/send', isAdmin, adminSendNotification);

// Admin: Get notifications for a specific user
router.get('/admin/user/:userId', isAdmin, adminGetUserNotifications);
// Admin: Get all notifications (with filtering)
router.get('/admin/all', isAdmin, adminGetAllNotifications);
// Admin: Delete a notification by ID
router.delete('/admin/:notificationId', isAdmin, adminDeleteNotification);
// Admin: Update a notification by ID
router.patch('/admin/:notificationId', isAdmin, adminUpdateNotification);
// Admin: Broadcast notification to a group of users by filter
router.post('/admin/broadcast', isAdmin, adminBroadcastNotification);

export default router; 