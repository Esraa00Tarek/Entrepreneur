import asyncHandler from 'express-async-handler';
import Notification from '../models/Notification.js';
import { io } from '../server.js';
/**
 * @desc    Get notifications for the logged-in user (with filter, pagination)
 * @route   GET /api/notifications
 * @access  Private
 */
export const getUserNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unread } = req.query;
  const filter = { userId: req.user._id };
  if (unread === 'true') filter.isRead = false;
  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  res.json(notifications);
});

/**
 * @desc    Mark a notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
export const markNotificationRead = asyncHandler(async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
  res.json({ success: true });
});

/**
 * @desc    Mark all notifications as read for the user
 * @route   PATCH /api/notifications/markAllRead
 * @access  Private
 */
export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
  res.json({ success: true });
});

/**
 * @desc    Admin: Send manual notification to one or more users
 * @route   POST /api/notifications/admin/send
 * @access  Admin
 */
export const adminSendNotification = asyncHandler(async (req, res) => {
  const { userIds, title, relatedEntityId } = req.body;
  if (!userIds || !title) return res.status(400).json({ message: 'userIds and title are required' });

  const results = [];

  for (const userId of userIds) {
    const notif = await notifyUser({
      userId: userId.toString(),
      type: 'manual',
      title,
      relatedEntityId
    });
    results.push(notif);
  }

  res.status(201).json(results);
});

/**
 * @desc    Admin: Get notifications for a specific user
 * @route   GET /api/notifications/admin/user/:userId
 * @access  Admin
 */
export const adminGetUserNotifications = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 20, unread } = req.query;
  const filter = { userId };
  if (unread === 'true') filter.isRead = false;
  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  res.json(notifications);
});

/**
 * @desc    Admin: Get all notifications (with filtering)
 * @route   GET /api/notifications/admin/all
 * @access  Admin
 */
export const adminGetAllNotifications = asyncHandler(async (req, res) => {
  const { userId, type, unread, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (userId) filter.userId = userId;
  if (type) filter.type = type;
  if (unread === 'true') filter.isRead = false;
  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  res.json(notifications);
});

/**
 * @desc    Admin: Delete a notification by ID
 * @route   DELETE /api/notifications/admin/:notificationId
 * @access  Admin
 */
export const adminDeleteNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  const notif = await Notification.findByIdAndDelete(notificationId);
  if (!notif) return res.status(404).json({ message: 'Notification not found' });
  res.json({ success: true, message: 'Notification deleted' });
});

/**
 * @desc    Admin: Update a notification by ID
 * @route   PATCH /api/notifications/admin/:notificationId
 * @access  Admin
 */
export const adminUpdateNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  const update = req.body;
  const notif = await Notification.findByIdAndUpdate(notificationId, update, { new: true });
  if (!notif) return res.status(404).json({ message: 'Notification not found' });
  res.json({ success: true, notification: notif });
});

/**
 * @desc    Admin: Broadcast notification to a group of users by filter
 * @route   POST /api/notifications/admin/broadcast
 * @access  Admin
 */
export const adminBroadcastNotification = asyncHandler(async (req, res) => {
  const { filter = {}, title, relatedEntityId } = req.body;
  if (!title) return res.status(400).json({ message: 'title is required' });
  const users = await (await import('../models/User.js')).default.find(filter, '_id');
  const results = [];
  for (const user of users) {
    const notif = await notifyUser({
      userId: user._id.toString(),
      type: 'broadcast',
      title,
      relatedEntityId
    });
    results.push(notif);
  }
  res.status(201).json(results);
});
