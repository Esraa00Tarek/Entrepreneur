// controllers/milestoneController.js
import Milestone from '../models/Milestone.js';
import Business from '../models/Business.js';
import asyncHandler from 'express-async-handler';
import { uploadToCloudinary } from '../Utilies/cloudinary.js';

// @desc    Create a new milestone
// @route   POST /api/milestones
// @access  Private (entrepreneur only)
export const createMilestone = asyncHandler(async (req, res) => {
  const { title, description, stageUpdate } = req.body;
  const { businessId } = req.query;
  if (!businessId) return res.status(400).json({ success: false, message: 'Business ID is required in query' });
  if (!businessId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ success: false, message: 'Invalid business ID format' });
  }

  const business = await Business.findById(businessId);
  if (!business) return res.status(404).json({ success: false, message: 'Business not found' });

  if (!business.owner.equals(req.user._id)) {
    return res.status(403).json({ success: false, message: 'Not authorized to update this project' });
  }

  let uploadedFiles = [];
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map(async (file) => {
      const result = await uploadToCloudinary(file.buffer, file.originalname, file.mimetype, 'milestones');
      return {
        url: result.secure_url,
        public_id: result.public_id,
        originalName: file.originalname
      };
    });
    uploadedFiles = await Promise.all(uploadPromises);
  }

  const milestone = await Milestone.create({
    business: business._id,
    title,
    description,
    files: uploadedFiles,
    stageUpdate,
    createdBy: req.user._id
  });

  business.milestones.unshift(milestone._id);
  if (stageUpdate) business.status = stageUpdate;
  await business.save();

  res.status(201).json({ success: true, message: 'Milestone created successfully', data: milestone });
});

// @desc    Get all milestones for a business
// @route   GET /api/milestones/business/:businessId
// @access  Private
export const getMilestonesByBusiness = asyncHandler(async (req, res) => {
  const { businessId } = req.params;
  if (!businessId) return res.status(400).json({ success: false, message: 'Business ID is required in params' });
  if (!businessId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ success: false, message: 'Invalid business ID format' });
  }

  const milestones = await Milestone.find({ business: businessId })
    .sort({ createdAt: -1 })
    .populate('createdBy', 'fullName role')
    .lean();

  res.status(200).json({ success: true, count: milestones.length, data: milestones });
});

// @desc    Get single milestone by ID
// @route   GET /api/milestones/:id
// @access  Private
export const getMilestoneById = asyncHandler(async (req, res) => {
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ success: false, message: 'Invalid milestone ID format' });
  }
  const milestone = await Milestone.findById(req.params.id)
    .populate('createdBy', 'fullName role')
    .populate('business', 'name owner')
    .lean();

  if (!milestone) return res.status(404).json({ success: false, message: 'Milestone not found' });

  res.status(200).json({ success: true, data: milestone });
});

// @desc    Update milestone
// @route   PUT /api/milestones/:id
// @access  Private (entrepreneur only)
export const updateMilestone = asyncHandler(async (req, res) => {
  const { title, description, stageUpdate } = req.body;
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ success: false, message: 'Invalid milestone ID format' });
  }
  const milestone = await Milestone.findById(req.params.id);
  if (!milestone) return res.status(404).json({ success: false, message: 'Milestone not found' });

  if (!milestone.createdBy.equals(req.user._id)) { // Use .equals() for ObjectId comparison
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  if (title) milestone.title = title;
  if (description) milestone.description = description;
  if (stageUpdate) milestone.stageUpdate = stageUpdate;

  await milestone.save();
  res.status(200).json({ success: true, message: 'Milestone updated successfully', data: milestone });
});

// @desc    Delete milestone
// @route   DELETE /api/milestones/:id
// @access  Private (entrepreneur or admin)
export const deleteMilestone = asyncHandler(async (req, res) => {
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ success: false, message: 'Invalid milestone ID format' });
  }
  const milestone = await Milestone.findById(req.params.id);
  if (!milestone) return res.status(404).json({ success: false, message: 'Milestone not found' });

  const business = await Business.findById(milestone.business);
  if (req.user.role !== 'admin' && !business.owner.equals(req.user._id)) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  await milestone.deleteOne();
  business.milestones = business.milestones.filter(m => !m.equals(milestone._id)); // Use .equals() for ObjectId comparison
  await business.save();

  res.status(200).json({ success: true, message: 'Milestone deleted successfully' });
});

// @desc    Update milestone status
// @route   PATCH /api/milestones/:id/status
// @access  Private (entrepreneur or admin)
export const updateMilestoneStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ success: false, message: 'Invalid milestone ID format' });
  }
  const milestone = await Milestone.findById(req.params.id);
  if (!milestone) return res.status(404).json({ success: false, message: 'Milestone not found' });

  if (req.user.role !== 'admin' && milestone.createdBy.equals(req.user._id)) { // Use .equals() for ObjectId comparison
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  milestone.status = status;
  await milestone.save();
  res.status(200).json({ success: true, message: 'Status updated', data: milestone });
});

// @desc    Update milestone progress
// @route   PATCH /api/milestones/:id/progress
// @access  Private (entrepreneur or admin)
export const updateProgress = asyncHandler(async (req, res) => {
  const { progress } = req.body;

  if (progress === undefined || progress < 0 || progress > 100) {
    return res.status(400).json({ error: 'Progress must be between 0 and 100' });
  }
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ success: false, message: 'Invalid milestone ID format' });
  }
  const milestone = await Milestone.findById(req.params.id);
  if (!milestone) return res.status(404).json({ error: 'Milestone not found' });

  if (req.user.role !== 'admin' && milestone.createdBy.equals(req.user._id)) { // Use .equals() for ObjectId comparison
    return res.status(403).json({ error: 'Not authorized' });
  }

  milestone.progress = progress;
  await milestone.save();

  res.status(200).json({ message: 'Progress updated successfully', milestone });
});

// @desc    Add note to milestone
// @route   POST /api/milestones/:id/notes
// @access  Private (entrepreneur or admin)
export const addNote = asyncHandler(async (req, res) => {
  const { body } = req.body;
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ success: false, message: 'Invalid milestone ID format' });
  }
  const milestone = await Milestone.findById(req.params.id);
  if (!milestone) return res.status(404).json({ error: 'Milestone not found' });

  if (req.user.role !== 'admin' && milestone.createdBy.equals(req.user._id)) { // Use .equals() for ObjectId comparison
    return res.status(403).json({ error: 'Not authorized' });
  }

  milestone.notes.push({
    body,
    author: req.user._id,
    createdAt: new Date()
  });

  await milestone.save();
  res.status(201).json({ message: 'Note added successfully', milestone });
});

// Get all milestones (admin only)
export const getAllMilestonesAdmin = asyncHandler(async (req, res) => {
  try {
    const milestones = await Milestone.find()
      .populate('createdBy', 'fullName role')
      .populate('business')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: milestones.length, data: milestones });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch all milestones' });
  }
});
