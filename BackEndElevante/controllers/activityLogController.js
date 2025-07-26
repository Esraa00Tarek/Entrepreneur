import asyncHandler from 'express-async-handler';
import ActivityLog from '../models/ActivityLog.js';

/**
 * @desc    Create a new activity log
 * @route   POST /api/activity-logs
 * @access  Private
 */
export const createLog = asyncHandler(async (req, res) => {
  const { actionType, targetType, targetId, metadata } = req.body;
  const log = await ActivityLog.create({
    userId: req.user._id,
    actionType,
    targetType,
    targetId,
    metadata
  });
  res.status(201).json(log);
});

/**
 * @desc    Query activity logs (by user, target, or date)
 * @route   GET /api/activity-logs
 * @access  Admin
 */
export const getLogs = asyncHandler(async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admin can access activity logs.' });
  }
  const { userId, targetType, targetId, actionType, from, to, page = 1, limit = 50 } = req.query;
  const filter = {};
  if (userId) filter.userId = userId;
  if (targetType) filter.targetType = targetType;
  if (targetId) filter.targetId = targetId;
  if (actionType) filter.actionType = actionType;
  if (from || to) {
    filter.timestamp = {};
    if (from) filter.timestamp.$gte = new Date(from);
    if (to) filter.timestamp.$lte = new Date(to);
  }
  // دعم pagination
  const logs = await ActivityLog.find(filter)
    .sort({ timestamp: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  res.json(logs);
});

// @desc    Get timeline for a specific entity
// @route   GET /api/activity-logs/timeline/:type/:id
// @access  Admin or owner
export const getEntityTimeline = asyncHandler(async (req, res) => {
  const { type, id } = req.params;
  // Validate id
  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ success: false, message: 'Invalid entity ID format.' });
  }
  // Authorization: admin or entity owner (customize logic as needed)
  if (req.user.role !== 'admin') {
    const logs = await ActivityLog.find({ targetType: type, targetId: id });
    if (!logs.some(log => log.userId.equals(req.user._id))) {
      return res.status(403).json({ success: false, message: 'You are not authorized to view this timeline.' });
    }
  }
  const logs = await ActivityLog.find({ targetType: type, targetId: id }).sort({ timestamp: 1 });
  res.json({ success: true, data: logs });
}); 