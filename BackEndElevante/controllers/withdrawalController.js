/**
 * Withdrawal Controller
 * Handles all operations related to withdrawal requests from entrepreneurs
 * @module controllers/withdrawalController
 */

import WithdrawalRequest from '../models/WithdrawalRequest.js';
import Deal from '../models/Deal.js';
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';
import Notification from '../models/Notification.js';
import { notifyUser } from '../Utilies/notifyUser.js';
import mongoose from 'mongoose';

/**
 * @desc    Create a new withdrawal request
 * @route   POST /api/withdrawals
 * @access  Private (entrepreneur only)
 * @param   {Object} req.body - Contains dealId, amount, and reason
 * @returns {Object} JSON response with created withdrawal request data
 */
export const createWithdrawalRequest = asyncHandler(async (req, res) => {
  try {
    const { amount, reason } = req.body;
    // Validate dealId
    if (!mongoose.Types.ObjectId.isValid(req.body.dealId)) {
      return res.status(400).json({ success: false, message: 'Invalid deal ID format.' });
    }
    // Convert incoming string IDs to ObjectId for consistency and relational integrity
    const entrepreneurId = typeof req.user._id === 'string' ? new mongoose.Types.ObjectId(req.user._id) : req.user._id;
    const dealIdObj = typeof req.body.dealId === 'string' ? new mongoose.Types.ObjectId(req.body.dealId) : req.body.dealId;
    
    // Verify sufficient balance
    const user = await User.findById(entrepreneurId);
    if (!user || (user.virtualBalance || 0) < amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Insufficient balance.' 
      });
    }
    
    // Create withdrawal request
    const withdrawal = await WithdrawalRequest.create({
      entrepreneurId,
      dealId: dealIdObj,
      amount,
      reason,
      status: 'pending'
    });

    // Notify administrators
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await notifyUser({
        userId: admin._id,
        type: 'manual',
        title: 'New withdrawal request submitted',
        actionUser: entrepreneurId,
        actionUserName: user.fullName || user.name || user.email,
        entityType: 'withdrawal',
        entityId: withdrawal._id,
        isRead: false
      });
    }

    return res.status(201).json({ 
      success: true, 
      message: 'Withdrawal request submitted for admin approval.', 
      data: withdrawal 
    });
  } catch (error) {
    console.error('Error in createWithdrawalRequest:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to create withdrawal request', 
      error: error.message 
    });
  }
});

/**
 * @desc    Admin approves a withdrawal request
 * @route   PATCH /api/withdrawals/:id/approve
 * @access  Private (admin only)
 * @param   {String} req.params.id - ID of the withdrawal request
 * @returns {Object} JSON response with updated withdrawal request data
 */
export const approveWithdrawalRequest = asyncHandler(async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only admin can approve withdrawals.' 
      });
    }
    // Validate withdrawal id
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid withdrawal ID format.' });
    }
    
    const withdrawal = await WithdrawalRequest.findById(req.params.id);
    
    if (!withdrawal || withdrawal.status !== 'pending') {
      return res.status(404).json({ 
        success: false, 
        message: 'Withdrawal request not found or already processed.' 
      });
    }
    
    const user = await User.findById(withdrawal.entrepreneurId);
    if (!user || (user.virtualBalance || 0) < withdrawal.amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Insufficient balance.' 
      });
    }
    
    // Deduct from user's balance
    user.virtualBalance -= withdrawal.amount;
    await user.save();
    
    // Update withdrawal status
    withdrawal.status = 'approved';
    withdrawal.updatedAt = new Date();
    await withdrawal.save();

    // Notify entrepreneur of approval
    await notifyUser({
      userId: user._id,
      type: 'manual',
      title: 'Your withdrawal request has been approved',
      actionUser: req.user._id,
      actionUserName: req.user.fullName || req.user.name || req.user.email,
      entityType: 'withdrawal',
      entityId: withdrawal._id,
      isRead: false
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Withdrawal approved and balance deducted.', 
      data: withdrawal 
    });
  } catch (error) {
    console.error('Error in approveWithdrawalRequest:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to approve withdrawal request', 
      error: error.message 
    });
  }
});

/**
 * @desc    Entrepreneur uploads proof after withdrawal
 * @route   PATCH /api/withdrawals/:id/proof
 * @access  Private (entrepreneur only)
 * @param   {String} req.params.id - ID of the withdrawal request
 * @param   {Object} req.body - Contains proof file URL
 * @returns {Object} JSON response with updated withdrawal request data
 */
export const uploadWithdrawalProof = asyncHandler(async (req, res) => {
  try {
    // Validate withdrawal id
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid withdrawal ID format.' });
    }
    const withdrawal = await WithdrawalRequest.findById(req.params.id);
    
    if (!withdrawal || !withdrawal.entrepreneurId.equals(req.user._id)) { // Use .equals() for ObjectId comparison
      return res.status(404).json({ 
        success: false, 
        message: 'Withdrawal request not found or unauthorized.' 
      });
    }
    
    // Add proof file and update status
    withdrawal.proofFiles.push({ 
      url: req.body.url,
      uploadedAt: new Date() 
    });
    withdrawal.status = 'completed';
    withdrawal.updatedAt = new Date();
    await withdrawal.save();

    // Notify administrators of new proof
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await notifyUser({
        userId: admin._id,
        type: 'manual',
        title: 'Withdrawal proof uploaded',
        actionUser: req.user._id,
        actionUserName: req.user.fullName || req.user.name || req.user.email,
        entityType: 'withdrawal',
        entityId: withdrawal._id,
        isRead: false
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Proof uploaded and withdrawal marked as completed.', 
      data: withdrawal 
    });
  } catch (error) {
    console.error('Error in uploadWithdrawalProof:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to upload withdrawal proof', 
      error: error.message 
    });
  }
});

/**
 * @desc    Get entrepreneur's withdrawal requests
 * @route   GET /api/withdrawals/my
 * @access  Private (entrepreneur only)
 * @returns {Object} JSON response with user's withdrawal requests
 */
export const getMyWithdrawals = asyncHandler(async (req, res) => {
  try {
    const withdrawals = await WithdrawalRequest.find({ entrepreneurId: req.user._id })
      .sort({ createdAt: -1 });
    
    return res.status(200).json({ 
      success: true, 
      data: withdrawals 
    });
  } catch (error) {
    console.error('Error in getMyWithdrawals:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve withdrawal requests', 
      error: error.message 
    });
  }
});