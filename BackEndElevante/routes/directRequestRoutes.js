// routes/directRequestRoutes.js

import express from 'express';
import {
  sendDirectRequest,
  getMyDirectRequests,
  respondToDirectRequest,
  getDirectRequestById,
  withdrawDirectRequest
} from '../controllers/DirectRequestController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadMultipleFilesToCloudinary } from '../middleware/upload.js';

const router = express.Router();

// @route   POST /api/direct-requests
router.post('/', protect, uploadMultipleFilesToCloudinary('attachments', 'direct-requests'), sendDirectRequest);

// @route   GET /api/direct-requests/my
router.get('/my', protect, getMyDirectRequests);

// @route   PATCH /api/direct-requests/:id/respond
router.patch('/:id/respond', protect, respondToDirectRequest);

// @route   GET /api/direct-requests/:id
router.get('/:id', protect, getDirectRequestById);

// @route   PATCH /api/direct-requests/:id/withdraw
router.patch('/:id/withdraw', protect, withdrawDirectRequest);

export default router;
