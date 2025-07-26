import express from 'express';
import {
  createWithdrawalRequest,
  approveWithdrawalRequest,
  uploadWithdrawalProof,
  getMyWithdrawals
} from '../controllers/withdrawalController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// تقديم طلب سحب
router.post('/', createWithdrawalRequest);

// موافقة الإدارة على السحب
router.patch('/:id/approve', approveWithdrawalRequest);

// رفع إثبات الدفع
router.post('/:id/proof', uploadWithdrawalProof);

// استعراض طلبات الريادي
router.get('/my', getMyWithdrawals);

export default router; 