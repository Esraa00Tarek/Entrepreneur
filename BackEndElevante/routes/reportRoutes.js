import express from 'express';
import { protect, isAdmin, isAdminOrEntrepreneur } from '../middleware/authMiddleware.js';
import { uploadOneToCloudinary } from '../middleware/upload.js';
import {
  submitReport,
  getAllReports,
  updateReportStatus,
  adminSendNotification,
  adminBroadcastNotification
} from '../controllers/reportController.js';

const router = express.Router();

router.post('/', protect, isAdminOrEntrepreneur, uploadOneToCloudinary('attachment'), submitReport);
router.get('/', protect, isAdmin, getAllReports);
router.patch('/:id', protect, isAdmin, updateReportStatus);
router.post('/admin/notify', protect, isAdmin, adminSendNotification);
router.post('/admin/broadcast-notification', protect, isAdmin, adminBroadcastNotification);

export default router; 