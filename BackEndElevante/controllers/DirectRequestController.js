/**
 * Direct Request Controller
 * Handles all operations related to direct requests between users
 * @module controllers/directRequestController
 */

import DirectRequest from '../models/DirectRequest.js';
import { notifyUser } from '../Utilies/notifyUser.js';
import asyncHandler from 'express-async-handler';
import { createOrder } from './orderController.js';
import { createDeal } from './dealController.js';
import mongoose from 'mongoose';

/**
 * @desc    Send a direct request (deal or order) to another user
 * @route   POST /api/direct-requests
 * @access  Private (any user)
 * @param   {Object} req.body - Request body containing type, targetUser, business, etc.
 * @param   {Array} req.attachments - Optional attachments for the request
 * @returns {Object} JSON response with created request data
 */
export const sendDirectRequest = asyncHandler(async (req, res) => {
  const { type, targetUser, business, relatedRequest, offerDetails } = req.body;
  const attachments = req.attachments || [];

  // Check if target user exists in the database
  if (!mongoose.Types.ObjectId.isValid(targetUser)) {
    return res.status(400).json({ success: false, message: 'Invalid target user ID.' });
  }
  const targetUserDoc = await mongoose.model('User').findById(targetUser);
  if (!targetUserDoc) {
    return res.status(404).json({ success: false, message: 'Target user not found.' });
  }

  // Check if business exists in the database
  if (!mongoose.Types.ObjectId.isValid(business)) {
    return res.status(400).json({ success: false, message: 'Invalid business ID.' });
  }
  const businessDoc = await mongoose.model('Business').findById(business);
  if (!businessDoc) {
    return res.status(404).json({ success: false, message: 'Business not found.' });
  }

  // If relatedRequest is provided, check if it exists in the database
  let relatedRequestId = null;
  if (relatedRequest) {
    if (!mongoose.Types.ObjectId.isValid(relatedRequest)) {
      return res.status(400).json({ success: false, message: 'Invalid related request ID.' });
    }
    const relatedRequestDoc = await mongoose.model('Request').findById(relatedRequest);
    if (!relatedRequestDoc) {
      return res.status(404).json({ success: false, message: 'Related request not found.' });
    }
    relatedRequestId = relatedRequest;
  }

  const initiatedBy = req.user._id;
  const targetUserId = targetUser;
  const businessId = business;

  try {
    // لا حاجة لأي فحص مرفقات هنا بعد الآن
    // Create the direct request
    const newRequest = await DirectRequest.create({
      type,
      initiatedBy, // Always ObjectId
      targetUser: targetUserId, // Always ObjectId
      business: businessId, // Always ObjectId
      relatedRequest: relatedRequestId,
      offerDetails,
      attachments
    });

    // Notify the target user
    await notifyUser({
      userId: targetUserId,
      type: 'direct-request',
      title: `You received a new ${type === 'deal' ? 'deal' : 'order'} request from ${req.user.fullName || req.user.username || req.user.email || 'someone'}`,
      actionUser: initiatedBy,
      actionUserName: req.user.fullName || req.user.username || req.user.email || 'Unknown',
      actionUserAvatar: req.user.avatar || '',
      entityType: type,
      entityId: newRequest._id.toString(),
      entityName: business ? business.name : '',
      redirectUrl: `/direct-requests/${newRequest._id}`
    });

    return res.status(201).json({ success: true, data: newRequest });
  } catch (error) {
    console.error('Error in sendDirectRequest:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to create direct request', 
      error: error.message 
    });
  }
});

/**
 * @desc    Get direct requests related to logged-in user (with search, filter, sort, pagination)
 * @route   GET /api/direct-requests/my
 * @access  Private
 * @param   {Object} req.query - Query parameters for filtering and pagination
 * @returns {Object} JSON response with paginated requests and metadata
 */
export const getMyDirectRequests = asyncHandler(async (req, res) => {
  try {
    // Extract query params
    const { status, type, search, sort = 'desc', page = 1, limit = 10 } = req.query;

    // Build filter for initiator or target user
    const filter = {
      $or: [
        { initiatedBy: req.user._id },
        { targetUser: req.user._id }
      ],
      withdrawn: false,
      isDeleted: { $ne: true }
    };
    
    if (status) filter.status = status;
    if (type) filter.type = type;

    // Search by business name or offerDetails
    if (search) {
      filter.$or = [
        ...filter.$or,
        { 'offerDetails.description': { $regex: search, $options: 'i' } },
        { 'offerDetails.title': { $regex: search, $options: 'i' } },
        { 'business.name': { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const pageNum = parseInt(page) > 0 ? parseInt(page) : 1;
    const pageSize = parseInt(limit) > 0 ? parseInt(limit) : 10;
    const skip = (pageNum - 1) * pageSize;

    // Sorting
    const sortOption = sort === 'asc' ? 1 : -1;

    // Query with population
    const query = DirectRequest.find(filter)
      .populate('business', 'name')
      .populate('relatedRequest', 'title offerType')
      .sort({ createdAt: sortOption })
      .skip(skip)
      .limit(pageSize);

    const [requests, total] = await Promise.all([
      query,
      DirectRequest.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      count: requests.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / pageSize),
      data: requests
    });
  } catch (error) {
    console.error('Error in getMyDirectRequests:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve direct requests', 
      error: error.message 
    });
  }
});

/**
 * @desc    Accept or reject a direct request
 * @route   PATCH /api/direct-requests/:id/respond
 * @access  Private (target user only)
 * @param   {String} req.params.id - ID of the direct request
 * @param   {Object} req.body - Contains decision ('accepted' or 'rejected')
 * @returns {Object} JSON response with updated request or created entity
 */
export const respondToDirectRequest = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid direct request ID format' });
  }
  try {
    // Defensive check for missing body
    if (!req.body) {
      return res.status(400).json({ success: false, message: 'Request body is missing' });
    }
    
    const { id } = req.params;
    const { decision } = req.body;

    if (!['accepted', 'rejected'].includes(decision)) {
      return res.status(400).json({ success: false, message: 'Invalid decision value' });
    }

    const request = await DirectRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Prevent responding to withdrawn requests
    if (request.withdrawn) {
      return res.status(400).json({ 
        success: false, 
        message: 'Request is withdrawn, cannot be accepted or rejected.' 
      });
    }

    // Verify the target user is the token owner
    if (!request.targetUser.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to perform this action' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request already responded to' });
    }

    if (decision === 'accepted') {
      let creationResult;
      try {
        if (request.type === 'deal') {
          creationResult = await createDeal({
            req,
            res,
            isFromDirectRequest: true,
            directRequest: request
          });
        } else if (request.type === 'order') {
          creationResult = await createOrder({
            req,
            res,
            isFromDirectRequest: true,
            directRequest: request
          });
        }
        
        // Update request status on successful creation
        request.status = 'accepted';
        request.decisionBy = req.user._id;
        request.decisionAt = new Date();
        await request.save();

        await notifyUser({
          userId: request.initiatedBy,
          type: 'direct-request',
          title: `Your ${request.type} request was accepted`,
          relatedEntityId: request._id
        });

        // Return the final result (deal or order)
        if (creationResult && creationResult._id) {
          return res.status(200).json({ success: true, data: creationResult });
        } else {
          return res.status(200).json({ success: true, data: request });
        }
      } catch (err) {
        // If creation fails, don't change status and return error
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to create deal/order', 
          error: err.message 
        });
      }
    } else if (decision === 'rejected') {
      request.status = 'rejected';
      request.decisionBy = req.user._id;
      request.decisionAt = new Date();
      await request.save();

      await notifyUser({
        userId: request.initiatedBy,
        type: 'direct-request',
        title: `Your ${request.type} request was rejected`,
        relatedEntityId: request._id
      });
      
      return res.status(200).json({ success: true, data: request });
    }
  } catch (error) {
    console.error('Error in respondToDirectRequest:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to respond to direct request', 
      error: error.message 
    });
  }
});

/**
 * @desc    Withdraw a direct request
 * @route   PATCH /api/direct-requests/:id/withdraw
 * @access  Private (initiator only)
 * @param   {String} req.params.id - ID of the direct request
 * @returns {Object} JSON response with updated request
 */
export const withdrawDirectRequest = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid direct request ID format' });
  }
  try {
    const { id } = req.params;
    const request = await DirectRequest.findById(id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Only the initiator can withdraw
    if (!request.initiatedBy.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to withdraw this request' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request cannot be withdrawn' });
    }

    request.withdrawn = true;
    await request.save();

    // Notify the target user
    await notifyUser({
      userId: request.targetUser,
      type: 'direct-request',
      title: `A direct request was withdrawn by ${req.user.fullName || req.user.username || req.user.email || 'Unknown'}`,
      actionUser: req.user._id,
      actionUserName: req.user.fullName || req.user.username || req.user.email || 'Unknown',
      actionUserAvatar: req.user.avatar || '',
      entityType: request.type,
      entityId: request._id.toString(),
      entityName: '',
      redirectUrl: `/direct-requests/${request._id}`,
      options: { withdrawn: true }
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Request withdrawn successfully', 
      data: request 
    });
  } catch (error) {
    console.error('Error in withdrawDirectRequest:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to withdraw direct request', 
      error: error.message 
    });
  }
});

/**
 * @desc    Get direct request by ID
 * @route   GET /api/direct-requests/:id
 * @access  Private (initiator or target)
 * @param   {String} req.params.id - ID of the direct request
 * @returns {Object} JSON response with request data
 */
export const getDirectRequestById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid direct request ID format' });
  }
  try {
    const request = await DirectRequest.findById(req.params.id)
      .populate('business', 'name')
      .populate('relatedRequest', 'title offerType');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const isRelated =
      request.initiatedBy.equals(req.user._id) ||
      request.targetUser.equals(req.user._id);

    if (!isRelated) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    return res.status(200).json({ success: true, data: request });
  } catch (error) {
    console.error('Error in getDirectRequestById:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve direct request', 
      error: error.message 
    });
  }
});
