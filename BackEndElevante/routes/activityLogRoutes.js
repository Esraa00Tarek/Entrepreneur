import express from 'express';
import { protect, isAdmin } from '../middleware/authMiddleware.js';
import { createLog, getLogs, getEntityTimeline } from '../controllers/activityLogController.js';

const router = express.Router();

router.use(protect);

router.post('/', createLog);
router.get('/', isAdmin, getLogs);
router.get('/timeline/:type/:id', protect, getEntityTimeline);

export default router; 