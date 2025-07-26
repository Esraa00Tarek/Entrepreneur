import asyncHandler from 'express-async-handler';
import PlatformReview from '../models/PlatformReview.js';
import UserReview from '../models/UserReview.js';
import { notifyUser } from '../Utilies/notifyUser.js';
import ActivityLog from '../models/ActivityLog.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

/**
 * @desc    Submit a platform review
 * @route   POST /api/reviews/platform
 * @access  Private
 */
export const submitPlatformReview = asyncHandler(async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ message: 'Request body is required' });
  }
  // Convert incoming string IDs to ObjectId for consistency and relational integrity
  const userId = req.user._id;
  const { rating, content, title } = req.body;
  const review = await PlatformReview.create({
    userId,
    rating,
    content,
    title
  });
  res.status(201).json(review);
});

/**
 * @desc    Get all platform reviews (static page)
 * @route   GET /api/reviews/platform
 * @access  Public
 */
export const getPlatformReviews = asyncHandler(async (req, res) => {
  let filter = {};
  if (!req.user || req.user.role !== 'admin') filter.isDeleted = false;
  if (req.query.status) filter.status = req.query.status;
  const reviews = await PlatformReview.find(filter).populate('userId', 'fullName role');
  res.json(reviews);
});

/**
 * @desc    Submit a user-to-user review
 * @route   POST /api/reviews/user
 * @access  Private
 */
export const submitUserReview = asyncHandler(async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ message: 'Request body is required' });
  }
  // Validate toUser
  if (!mongoose.Types.ObjectId.isValid(req.body.toUser)) {
    return res.status(400).json({ message: 'Invalid toUser ID format' });
  }
  // استخدم القيم كما هي بدون تحويل
  const fromUser = req.user._id;
  const toUser = req.body.toUser;
  const dealIdObj = req.body.dealId ? req.body.dealId : undefined;
  const orderIdObj = req.body.orderId ? req.body.orderId : undefined;
  const { rating, comment } = req.body;
  if (!dealIdObj && !orderIdObj) {
    return res.status(400).json({ message: 'A review must be related to a deal or an order.' });
  }
  const review = await UserReview.create({
    fromUser,
    toUser,
    rating,
    comment,
    dealId: dealIdObj,
    orderId: orderIdObj
  });
  // Notify the review recipient
  await notifyUser({
    userId: toUser,
    type: 'review',
    title: 'You received a new review.',
    actionUser: req.user._id.toString(),
    actionUserName: req.user.fullName || req.user.username || req.user.email || 'Unknown',
    actionUserAvatar: req.user.avatar || '',
    entityType: 'review',
    entityId: review._id.toString(),
    entityName: '',
    redirectUrl: `/reviews/${review._id}`
  });
  res.status(201).json(review);
});

/**
 * @desc    Get reviews for a user
 * @route   GET /api/reviews/user/:userId
 * @access  Public
 */
export const getUserReviews = asyncHandler(async (req, res) => {
  let filter = { toUser: req.params.userId };
  if (!req.user || req.user.role !== 'admin') filter.isDeleted = false;
  const reviews = await UserReview.find(filter).populate('fromUser', 'fullName role');
  res.json(reviews);
});

// Soft delete platform review (admin or owner)
export const deletePlatformReview = asyncHandler(async (req, res) => {
  // Validate review id
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid review ID format' });
  }
  const review = await PlatformReview.findById(req.params.id);
  if (!review || (review.isDeleted && (!req.user || req.user.role !== 'admin'))) return res.status(404).json({ message: 'Review not found' });
  if (!review.userId.equals(req.user._id) && req.user.role !== 'admin') { // Use .equals() for ObjectId comparison
    return res.status(403).json({ message: 'Not authorized' });
  }
  review.isDeleted = true;
  await review.save();
  await ActivityLog.create({ userId: req.user._id, actionType: 'delete_platform_review', targetType: 'platform_review', targetId: review._id });
  res.status(200).json({ message: 'Review deleted successfully' });
});

// Restore platform review (admin only)
export const restorePlatformReview = asyncHandler(async (req, res) => {
  // Validate review id
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid review ID format' });
  }
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admin can restore reviews.' });
  }
  const review = await PlatformReview.findById(req.params.id);
  if (!review || !review.isDeleted) return res.status(404).json({ message: 'Review not found or not deleted.' });
  review.isDeleted = false;
  await review.save();
  await ActivityLog.create({ userId: req.user._id, actionType: 'restore_platform_review', targetType: 'platform_review', targetId: review._id });
  res.status(200).json({ message: 'Review restored successfully', review });
});

// Soft delete user review (admin or owner)
export const deleteUserReview = asyncHandler(async (req, res) => {
  // Validate review id
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid review ID format' });
  }
  const review = await UserReview.findById(req.params.id);
  if (!review || (review.isDeleted && (!req.user || req.user.role !== 'admin'))) return res.status(404).json({ message: 'Review not found' });
  if (!review.fromUser.equals(req.user._id) && req.user.role !== 'admin') { // Use .equals() for ObjectId comparison
    return res.status(403).json({ message: 'Not authorized' });
  }
  review.isDeleted = true;
  await review.save();
  await ActivityLog.create({ userId: req.user._id, actionType: 'delete_user_review', targetType: 'user_review', targetId: review._id });
  res.status(200).json({ message: 'Review deleted successfully' });
});

// Restore user review (admin only)
export const restoreUserReview = asyncHandler(async (req, res) => {
  // Validate review id
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid review ID format' });
  }
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admin can restore reviews.' });
  }
  const review = await UserReview.findById(req.params.id);
  if (!review || !review.isDeleted) return res.status(404).json({ message: 'Review not found or not deleted.' });
  review.isDeleted = false;
  await review.save();
  await ActivityLog.create({ userId: req.user._id, actionType: 'restore_user_review', targetType: 'user_review', targetId: review._id });
  res.status(200).json({ message: 'Review restored successfully', review });
});

// تحديث حالة مراجعة المنصة (admin فقط)
export const updatePlatformReviewStatus = asyncHandler(async (req, res) => {
  // Validate review id
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid review ID format' });
  }
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admin can change review status.' });
  }
  const { status } = req.body;
  const review = await PlatformReview.findByIdAndUpdate(
    req.params.id,
    { status, updatedAt: new Date() },
    { new: true }
  );
  if (!review) return res.status(404).json({ message: 'Review not found.' });

  // Send notification to all admins
  const admins = await User.find({ role: 'admin' });
  for (const admin of admins) {
    await notifyUser({
      userId: admin._id,
      type: 'platform_review',
      title: `Platform review status changed to ${status}`,
      relatedEntityId: review._id
    });
  }
  // Log activity
  await ActivityLog.create({
    userId: req.user._id,
    actionType: 'update_platform_review_status',
    targetType: 'platform_review',
    targetId: review._id,
    metadata: { status }
  });
  res.json({ message: 'Review status updated and admins notified.', review });
});

// Admin notification endpoint for review/report
export const adminSendNotification = asyncHandler(async (req, res) => {
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

// Admin: Get all platform reviews with filters
export const getAllPlatformReviewsWithFilter = asyncHandler(async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admin can access this endpoint.' });
  }
  const { status, userId, isDeleted, fromDate, toDate } = req.query;
  let filter = {};
  if (status) filter.status = status;
  if (userId) filter.userId = userId;
  if (isDeleted !== undefined) filter.isDeleted = isDeleted === 'true';
  if (fromDate || toDate) {
    filter.createdAt = {};
    if (fromDate) filter.createdAt.$gte = new Date(fromDate);
    if (toDate) filter.createdAt.$lte = new Date(toDate);
  }
  const reviews = await PlatformReview.find(filter).populate('userId', 'fullName role email');
  res.json(reviews);
});

// Admin: Get all user reviews with filters
export const getAllUserReviewsWithFilter = asyncHandler(async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admin can access this endpoint.' });
  }
  const { fromUser, toUser, isDeleted, fromDate, toDate, rating } = req.query;
  let filter = {};
  if (fromUser) filter.fromUser = fromUser;
  if (toUser) filter.toUser = toUser;
  if (isDeleted !== undefined) filter.isDeleted = isDeleted === 'true';
  if (rating) filter.rating = Number(rating);
  if (fromDate || toDate) {
    filter.createdAt = {};
    if (fromDate) filter.createdAt.$gte = new Date(fromDate);
    if (toDate) filter.createdAt.$lte = new Date(toDate);
  }
  const reviews = await UserReview.find(filter)
    .populate('fromUser', 'fullName role email')
    .populate('toUser', 'fullName role email');
  res.json(reviews);
}); 