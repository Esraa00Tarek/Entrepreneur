import express from 'express';
import {
  createMilestone,
  getMilestonesByBusiness,
  getMilestoneById,
  updateMilestone,
  deleteMilestone,
  updateMilestoneStatus,
  updateProgress,
  addNote,
  getAllMilestonesAdmin
} from '../controllers/milestoneController.js';

import { uploadMultipleFilesToCloudinary } from '../middleware/upload.js';

import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Require login for all routes
router.use(protect);

// Create a new milestone (admin or entrepreneur)
router.post('/', restrictTo( 'entrepreneur'), 
uploadMultipleFilesToCloudinary('files', 'milestones'), 
createMilestone);

// Get milestones for a specific business
router.get('/business/:businessId', getMilestonesByBusiness);


// Get a single milestone by ID
router.get('/:id', getMilestoneById);

// Update milestone (admin or entrepreneur)
router.put('/:id', restrictTo( 'entrepreneur'), updateMilestone);

// Delete milestone
router.delete('/:id', restrictTo('admin', 'entrepreneur'), deleteMilestone);

// NEW: Update milestone status
router.patch('/:id/status', restrictTo('admin', 'entrepreneur'), updateMilestoneStatus);

// NEW: Update milestone progress percentage
router.patch('/:id/progress', restrictTo('admin', 'entrepreneur'), updateProgress);

// NEW: Add a note to a milestone
router.post('/:id/notes', restrictTo('admin', 'entrepreneur'), addNote);

// @desc    Get all milestones (admin only)
// @route   GET /api/milestones/admin/all
// @access  Private (admin only)
router.get('/admin/all', restrictTo('admin'), getAllMilestonesAdmin);

export default router;
