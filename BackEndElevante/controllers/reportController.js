import asyncHandler from 'express-async-handler';
import Report from '../models/Report.js';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import { notifyUser } from '../Utilies/notifyUser.js';
import mongoose from 'mongoose';

/**
 * @desc    Submit a report/feedback
 * @route   POST /api/reports
 * @access  Private
 */
export const submitReport = asyncHandler(async (req, res) => {
  try {
    // لا تشترط وجود req.user
    // const userId = req.user?._id || null;
    // استقبل بيانات إضافية من body لو أردت (email, userName)
    const { type, content, title, email, userName } = req.body;
    if (!type || !content) {
      return res.status(400).json({ message: 'type and content are required.' });
    }
    let attachmentUrl = undefined;
    if (req.cloudinaryFileUrl) {
      attachmentUrl = req.cloudinaryFileUrl;
    }
    console.log('req.file:', req.file);
    console.log('attachmentUrl to save:', attachmentUrl);
    const report = await Report.create({
      reporterId: req.user._id,
      userName,
      email,
      type,
      content,
      title,
      attachmentUrl
    });
    res.status(201).json(report);
  } catch (err) {
    console.error('Error in submitReport:', err);
    res.status(500).json({ message: 'Failed to submit report', error: err.message });
  }
});

/**
 * @desc    Get all reports (admin only, with filter & pagination)
 * @route   GET /api/reports
 * @access  Admin
 */
export const getAllReports = asyncHandler(async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admin can access this endpoint.' });
  }
  const { page = 1, limit = 20, status, type, reporterId, fromDate, toDate, isDeleted } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (type) filter.type = type;
  if (reporterId) filter.reporterId = reporterId;
  if (isDeleted !== undefined) filter.isDeleted = isDeleted === 'true';
  if (fromDate || toDate) {
    filter.createdAt = {};
    if (fromDate) filter.createdAt.$gte = new Date(fromDate);
    if (toDate) filter.createdAt.$lte = new Date(toDate);
  }
  const reports = await Report.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  res.json(reports);
});

/**
 * @desc    Update report status (admin)
 * @route   PATCH /api/reports/:id
 * @access  Admin
 */
export const updateReportStatus = asyncHandler(async (req, res) => {
  // Validate report id
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid report ID format' });
  }
  const { status } = req.body;
  const report = await Report.findByIdAndUpdate(
    req.params.id,
    { status, updatedAt: new Date() },
    { new: true }
  );
  if (!report) return res.status(404).json({ message: 'Report not found.' });

  // Send notification to all admins
  const admins = await User.find({ role: 'admin' });
  for (const admin of admins) {
    await notifyUser({
      userId: admin._id,
      type: 'report',
      title: `Report status changed to ${status}`,
      relatedEntityId: report._id
    });
  }
  // Log activity
  await ActivityLog.create({
    userId: req.user._id,
    actionType: 'update_report_status',
    targetType: 'report',
    targetId: report._id,
    metadata: { status }
  });
  res.json({ message: 'Report status updated and admins notified.', report });
});

export const adminSendNotification = asyncHandler(async (req, res) => {
  // Validate userId
  if (req.body.userId && !mongoose.Types.ObjectId.isValid(req.body.userId)) {
    return res.status(400).json({ message: 'Invalid user ID format' });
  }
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admin can send notifications.' });
  }
  const { userId, type, title, relatedEntityId } = req.body;
  await notifyUser({ userId, type, title, relatedEntityId });
  await ActivityLog.create({
    userId: req.user._id,
    actionType: 'admin_send_notification',
    targetType: type,
    targetId: relatedEntityId,
    metadata: { title }
  });
  res.json({ message: 'Notification sent.' });
});

export const adminBroadcastNotification = asyncHandler(async (req, res) => {
  // Validate userIds if provided
  if (req.body.userIds && Array.isArray(req.body.userIds)) {
    for (const id of req.body.userIds) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid user ID in userIds array' });
      }
    }
  }
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admin can send broadcast notifications.' });
  }
  const { target, role, userIds, type, title, relatedEntityId } = req.body;
  let users = [];
  if (target === 'all') {
    users = await User.find({});
  } else if (target === 'role' && role) {
    users = await User.find({ role });
  } else if (target === 'users' && Array.isArray(userIds)) {
    users = await User.find({ _id: { $in: userIds } });
  } else {
    return res.status(400).json({ message: 'Invalid target for broadcast.' });
  }
  for (const user of users) {
    await notifyUser({
      userId: user._id,
      type,
      title,
      relatedEntityId
    });
  }
  await ActivityLog.create({
    userId: req.user._id,
    actionType: 'admin_broadcast_notification',
    targetType: target,
    metadata: { role, userIds, type, title, relatedEntityId, count: users.length }
  });
  res.json({ message: `Notification sent to ${users.length} users.` });
}); 