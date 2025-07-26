import Business from '../models/Business.js';
import asyncHandler from 'express-async-handler';
import Milestone from '../models/Milestone.js';
import { notifyUser } from '../Utilies/notifyUser.js';
import ActivityLog from '../models/ActivityLog.js';
import mongoose from 'mongoose';

// PATCH /api/business/:businessId/progress
export const updateBusinessProgressManually = async (req, res) => {
  const { businessId } = req.params;
  // Validate businessId
  if (!mongoose.Types.ObjectId.isValid(businessId)) {
    return res.status(400).json({ error: 'Invalid business ID format' });
  }

  const business = await Business.findById(businessId);
  if (!business) {
    return res.status(404).json({ error: 'Business not found' });
  }

  //
  if (req.user.role !== 'admin' && business.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({ error: 'You are not authorized to update progress for this business' });
  }

  await recalculateBusinessProgress(businessId);

  res.status(200).json({ message: 'Business progress recalculated successfully' });
};

// 

export const recalculateBusinessProgress = async (businessId) => {
  const milestones = await Milestone.find({ business: businessId });

  if (!milestones.length) {
    await Business.findByIdAndUpdate(businessId, { progress: 0 });
    return;
  }

  const completed = milestones.filter(m => m.files && m.files.length > 0).length;
  const progress = Math.round((completed / milestones.length) * 100);

  await Business.findByIdAndUpdate(businessId, { progress });
};

export const getAllBusinesses = asyncHandler(async (req, res) => {
  const filters = {};

  if (req.query.status) filters.status = req.query.status;
  if (req.query.owner) filters.owner = req.query.owner;
  if (req.query.stage) filters.startupStage = req.query.stage;

  if (req.query.keyword) {
    filters.$or = [
      { name: { $regex: req.query.keyword, $options: 'i' } },
      { description: { $regex: req.query.keyword, $options: 'i' } }
    ];
  }

  // exclude soft deleted unless admin
  if (req.user.role !== 'admin') filters.isDeleted = false;

  // حدد اتجاه الترتيب
  let sortOptions = {};
  if (req.query.sort === 'progressAsc') {
    sortOptions.progress = 1;
  } else if (req.query.sort === 'progressDesc') {
    sortOptions.progress = -1;
  }

  const businesses = await Business.find(filters).sort(sortOptions);

  res.status(200).json({ success: true, count: businesses.length, data: businesses });
});

// @desc    Create a new business
// @route   POST /api/business
// @access  Private (entrepreneur only)
export const createBusiness = asyncHandler(async (req, res) => {
  // Check if req.body exists
  if (!req.body) {
    return res.status(400).json({ 
      success: false, 
      message: 'Request body is required' 
    });
  }

  const ownerId = req.user._id;
  const { name, category, description, location, contact, financial, tags, status } = req.body;

  // Validate required fields
  if (!name || !category || !description) {
    return res.status(400).json({ 
      success: false, 
      message: 'name, category, and description are required' 
    });
  }

  // Parse JSON fields if they come as strings from form data
  let parsedLocation = location;
  let parsedContact = contact;
  let parsedFinancial = financial;
  let parsedTags = tags;

  try {
    if (typeof location === 'string') parsedLocation = JSON.parse(location);
    if (typeof contact === 'string') parsedContact = JSON.parse(contact);
    if (typeof financial === 'string') parsedFinancial = JSON.parse(financial);
    if (typeof tags === 'string') parsedTags = JSON.parse(tags);
  } catch (error) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid JSON format in form data fields' 
    });
  }

  const businessData = {
    owner: ownerId,
    name,
    category,
    description,
    location: parsedLocation,
    contact: parsedContact,
    financial: parsedFinancial,
    tags: parsedTags
  };

  // Add status if provided
  if (status) {
    businessData.status = status;
  }

  // Add files if uploaded
  if (req.attachments && req.attachments.length > 0) {
    businessData.files = req.attachments.map(attachment => ({
      filename: attachment.url,
      originalName: attachment.originalName || attachment.url.split('/').pop(),
      fileType: attachment.fileType,
      fileSize: attachment.fileSize || 0,
      uploadedAt: new Date()
    }));
  }

  const business = new Business(businessData);
  await business.save();

  // تسجيل الحدث
  await ActivityLog.create({ 
    userId: req.user._id, 
    actionType: 'create_business', 
    targetType: 'business', 
    targetId: business._id 
  });

  res.status(201).json({ success: true, data: business });
});

// @desc    Get all businesses of logged in entrepreneur
// @route   GET /api/business
// @access  Private
export const getMyBusinesses = asyncHandler(async (req, res) => {
  const filter = { owner: req.user._id };
  if (req.user.role !== 'admin') filter.isDeleted = false;
  const businesses = await Business.find(filter);
  res.status(200).json({ success: true, count: businesses.length, data: businesses });
});

// @desc    Get business by ID
// @route   GET /api/business/:id
// @access  Private
export const getBusinessById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid business ID format' });
  }
  const business = await Business.findById(req.params.id);

  if (!business || (business.isDeleted && req.user.role !== 'admin')) {
    return res.status(404).json({ success: false, message: 'Business not found' });
  }

  if (!business.owner.equals(req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  res.status(200).json({ success: true, data: business });
});

// @desc    Update entire business (PUT)
// @route   PUT /api/business/:id
// @access  Private (owner or admin)
export const updateBusiness = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid business ID format' });
  }
  const business = await Business.findById(req.params.id);

  if (!business || (business.isDeleted && req.user.role !== 'admin')) {
    return res.status(404).json({ success: false, message: 'Business not found' });
  }

  if (!business.owner.equals(req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  const updated = await Business.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // إشعار المالك
  if (req.user.role === 'admin' && !business.owner.equals(req.user._id)) {
    await notifyUser({
      userId: business.owner,
      type: 'business',
      title: `Your business "${business.name}" was updated by ${req.user.fullName || req.user.username || req.user.email || 'Unknown'}`,
      actionUser: req.user._id.toString(),
      actionUserName: req.user.fullName || req.user.username || req.user.email || 'Unknown',
      actionUserAvatar: req.user.avatar || '',
      entityType: 'business',
      entityId: business._id.toString(),
      entityName: business.name,
      redirectUrl: `/businesses/${business._id}`
    });
  }
  // تسجيل الحدث
  await ActivityLog.create({ userId: req.user._id, actionType: 'update_business', targetType: 'business', targetId: business._id });

  res.status(200).json({ success: true, message: 'Business updated successfully', data: updated });
});

// @desc    Patch partial business info
// @route   PATCH /api/business/:id
// @access  Private (owner or admin)
export const patchBusiness = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid business ID format' });
  }
  const business = await Business.findById(req.params.id);

  if (!business || (business.isDeleted && req.user.role !== 'admin')) {
    return res.status(404).json({ success: false, message: 'Business not found' });
  }

  if (!business.owner.equals(req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  Object.assign(business, req.body);
  await business.save();

  // إشعار المالك
  if (req.user.role === 'admin' && !business.owner.equals(req.user._id)) {
    await notifyUser({
      userId: business.owner,
      type: 'business',
      title: `Your business "${business.name}" was updated by ${req.user.fullName || req.user.username || req.user.email || 'Unknown'}`,
      actionUser: req.user._id.toString(),
      actionUserName: req.user.fullName || req.user.username || req.user.email || 'Unknown',
      actionUserAvatar: req.user.avatar || '',
      entityType: 'business',
      entityId: business._id.toString(),
      entityName: business.name,
      redirectUrl: `/businesses/${business._id}`
    });
  }
  // تسجيل الحدث
  await ActivityLog.create({ userId: req.user._id, actionType: 'patch_business', targetType: 'business', targetId: business._id });

  res.status(200).json({ success: true, message: 'Business updated', data: business });
});

// @desc    Delete a business
// @route   DELETE /api/business/:id
// @access  Private (owner or admin)
export const deleteBusiness = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid business ID format' });
  }
  const business = await Business.findById(req.params.id);

  if (!business || (business.isDeleted && req.user.role !== 'admin')) {
    return res.status(404).json({ success: false, message: 'Business not found' });
  }

  if (!business.owner.equals(req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  business.isDeleted = true;
  await business.save();

  // إشعار المالك
  if (req.user.role === 'admin' && !business.owner.equals(req.user._id)) {
    await notifyUser({
      userId: business.owner,
      type: 'business',
      title: `Your business "${business.name}" was deleted by ${req.user.fullName || req.user.username || req.user.email || 'Unknown'}`,
      actionUser: req.user._id.toString(),
      actionUserName: req.user.fullName || req.user.username || req.user.email || 'Unknown',
      actionUserAvatar: req.user.avatar || '',
      entityType: 'business',
      entityId: business._id.toString(),
      entityName: business.name,
      redirectUrl: `/businesses/${business._id}`
    });
  }
  // تسجيل الحدث
  await ActivityLog.create({ userId: req.user._id, actionType: 'delete_business', targetType: 'business', targetId: business._id });

  res.status(200).json({ success: true, message: 'Business deleted successfully' });
});

// Restore business (admin only)
export const restoreBusiness = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Only admin can restore businesses.' });
  }
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid business ID format' });
  }
  const business = await Business.findById(req.params.id);
  if (!business || !business.isDeleted) {
    return res.status(404).json({ success: false, message: 'Business not found or not deleted.' });
  }
  business.isDeleted = false;
  await business.save();
  // إشعار المالك
  await notifyUser({
    userId: business.owner,
    type: 'business',
    title: `Your business "${business.name}" was restored by ${req.user.fullName || req.user.username || req.user.email || 'Unknown'}`,
    actionUser: req.user._id.toString(),
    actionUserName: req.user.fullName || req.user.username || req.user.email || 'Unknown',
    actionUserAvatar: req.user.avatar || '',
    entityType: 'business',
    entityId: business._id.toString(),
    entityName: business.name,
    redirectUrl: `/businesses/${business._id}`
  });
  // تسجيل الحدث
  await ActivityLog.create({ userId: req.user._id, actionType: 'restore_business', targetType: 'business', targetId: business._id });
  res.status(200).json({ success: true, message: 'Business restored successfully', data: business });
});


// @desc    Pause a business
// @route   PATCH /api/business/:id/pause
// @access  Private (owner or admin)
export const pauseBusiness = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid business ID format' });
  }
  const business = await Business.findById(req.params.id);

  if (!business) {
    return res.status(404).json({ success: false, message: 'Business not found' });
  }

  if (!business.owner.equals(req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  business.status = 'Paused';
  await business.save();

  res.status(200).json({ success: true, message: 'Business paused successfully', data: business });
});

// @desc    Update status + statusReason
// @route   PATCH /api/business/:id/status
// @access  Private (owner or admin)
export const updateBusinessStatus = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid business ID format' });
  }
  const { status, statusReason } = req.body;

  const business = await Business.findById(req.params.id);
  if (!business) {
    return res.status(404).json({ success: false, message: 'Business not found' });
  }

  if (!business.owner.equals(req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  business.status = status || business.status;
  business.statusReason = statusReason || business.statusReason;

  await business.save();

  res.status(200).json({ success: true, message: 'Status updated successfully', data: business });
});
