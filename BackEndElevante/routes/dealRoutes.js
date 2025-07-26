// routes/dealRoutes.js

import express from 'express';
import {
  createDeal,
  getMyDeals,
  getDealById,
  updateDealStatus,
  deleteDeal,
  restoreDeal,
  getAllDeals,
  withdrawDeal,
  approveMilestonePayment
} from '../controllers/dealController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadMultipleFilesToCloudinary } from '../middleware/upload.js';

const router = express.Router();

router.use(protect);

// @route POST /api/deals
router.post('/', uploadMultipleFilesToCloudinary('attachments', 'deals'), createDeal);

// @route GET /api/deals/my
router.get('/my', getMyDeals);

// @route GET /api/deals/:id
router.get('/:id', getDealById);

// @route PATCH /api/deals/:id/status
router.patch('/:id/status', updateDealStatus);

// @route DELETE /api/deals/:id
router.delete('/:id', deleteDeal);

// @route PATCH /api/deals/:id/restore
router.patch('/:id/restore', restoreDeal);

// @route PATCH /api/deals/:id/withdraw
router.patch('/:id/withdraw', protect, withdrawDeal);

// @route POST /api/deals/approve-milestone-payment
router.post('/approve-milestone-payment', protect, approveMilestonePayment);

// @route GET /api/deals
router.get('/', getAllDeals);

export default router;
