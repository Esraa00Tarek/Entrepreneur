import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import { uploadOneToCloudinary } from '../middleware/upload.js';
import {
  createRequest,
  getMyRequests,
  getRequestById,
  deleteRequest,
  getAllRequests,
  updateRequest,
  addAttachmentToRequest,
  getAllRequestsAdmin
} from '../controllers/requestController.js';

const router = express.Router();

// @desc    Create a new request
// @access  Private (Entrepreneur only)
router.post('/', protect, restrictTo('entrepreneur'), uploadOneToCloudinary('attachment', 'requests'), createRequest);

// @desc    Get requests created by logged-in entrepreneur
router.get('/my', protect, restrictTo('entrepreneur'), getMyRequests);

// @desc    Get all requests (filterable + pagination)
router.get('/', protect, getAllRequests);

// @desc    Get all requests (admin only)
// @route   GET /api/requests/admin/all
// @access  Private (admin only)
router.get('/admin/all', protect, restrictTo('admin'), getAllRequestsAdmin);

// @desc    Get request by ID
router.get('/:id', protect, getRequestById);

// @desc    Update request
router.patch('/:id', protect, updateRequest);

// @desc    Delete request
router.delete('/:id', protect, deleteRequest);

// @desc    Add attachments
router.patch('/:id/attachments', protect, uploadOneToCloudinary('attachment', 'requests'), addAttachmentToRequest);

export default router;
