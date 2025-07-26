import express from 'express';
import {
  createDispute,
  resolveDispute,
  addDisputeMessage,
  getMyDisputes,
  getDisputeById
} from '../controllers/disputeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// فتح نزاع جديد
router.post('/', createDispute);

// حل النزاع من قبل الإدارة
router.patch('/:id/resolve', resolveDispute);

// إضافة رسالة في النزاع
router.post('/:id/message', addDisputeMessage);

// استعراض نزاعات المستخدم
router.get('/my', getMyDisputes);

// جلب تفاصيل نزاع
router.get('/:id', getDisputeById);

export default router; 