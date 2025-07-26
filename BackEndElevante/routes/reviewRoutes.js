import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  submitPlatformReview,
  getPlatformReviews,
  submitUserReview,
  getUserReviews,
  deletePlatformReview,
  restorePlatformReview,
  deleteUserReview,
  restoreUserReview,
  updatePlatformReviewStatus,
  adminSendNotification,
  getAllPlatformReviewsWithFilter,
  getAllUserReviewsWithFilter
} from '../controllers/reviewController.js';
import { isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/platform', protect, submitPlatformReview);
router.get('/platform', getPlatformReviews);
router.post('/user', protect, submitUserReview);
router.get('/user/:userId', getUserReviews);
router.delete('/platform/:id', protect, deletePlatformReview);
router.patch('/platform/:id/restore', protect, restorePlatformReview);
router.delete('/user/:id', protect, deleteUserReview);
router.patch('/user/:id/restore', protect, restoreUserReview);
router.patch('/platform/:id/status', protect, updatePlatformReviewStatus);
router.post('/admin/notify', protect, adminSendNotification);
router.get('/admin/platform-reviews', protect, isAdmin, getAllPlatformReviewsWithFilter);
router.get('/admin/user-reviews', protect, isAdmin, getAllUserReviewsWithFilter);

export default router; 