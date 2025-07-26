/**
 * Dispute Controller
 * Handles all operations related to disputes between users
 * @module controllers/disputeController
 */

import Dispute from '../models/Dispute.js';
import Milestone from '../models/Milestone.js';
import WithdrawalRequest from '../models/WithdrawalRequest.js';
import Deal from '../models/Deal.js';
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';

/**
 * @desc    Create a new dispute for a milestone or withdrawal
 * @route   POST /api/disputes
 * @access  Private
 * @param   {Object} req.body - Contains type, targetId, and reason
 * @returns {Object} JSON response with created dispute data
 */
export const createDispute = asyncHandler(async (req, res) => {
  try {
    const { type, targetId, reason } = req.body;
    
    if (!['milestone', 'withdrawal'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid dispute type.' });
    }
    
    // Freeze the milestone or withdrawal
    if (type === 'milestone') {
      const milestone = await Milestone.findById(targetId);
      if (!milestone) {
        return res.status(404).json({ success: false, message: 'Milestone not found.' });
      }
      milestone.status = 'disputed';
      await milestone.save();
    } else if (type === 'withdrawal') {
      const withdrawal = await WithdrawalRequest.findById(targetId);
      if (!withdrawal) {
        return res.status(404).json({ success: false, message: 'Withdrawal not found.' });
      }
      withdrawal.status = 'disputed';
      await withdrawal.save();
    }
    
    // Convert incoming string IDs to ObjectId for consistency and relational integrity
    const targetIdObj = typeof targetId === 'string' ? new mongoose.Types.ObjectId(targetId) : targetId;
    const openedBy = typeof req.user._id === 'string' ? new mongoose.Types.ObjectId(req.user._id) : req.user._id;

    const dispute = await Dispute.create({
      type,
      targetId: targetIdObj,
      openedBy,
      reason,
      status: 'open'
    });
    
    return res.status(201).json({ 
      success: true, 
      message: 'Dispute opened and target frozen.', 
      data: dispute 
    });
  } catch (error) {
    console.error('Error in createDispute:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to create dispute', 
      error: error.message 
    });
  }
});

/**
 * @desc    Resolve a dispute (admin only)
 * @route   PATCH /api/disputes/:id/resolve
 * @access  Private (admin only)
 * @param   {String} req.params.id - ID of the dispute
 * @param   {Object} req.body - Contains resolution and releaseTo
 * @returns {Object} JSON response with resolved dispute data
 */
export const resolveDispute = asyncHandler(async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admin can resolve disputes.' });
    }
    
    const { id } = req.params;
    // Validate dispute id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid dispute ID format.' });
    }
    const { resolution, releaseTo } = req.body; // releaseTo: 'entrepreneur', 'investor', or 'refund'
    
    const dispute = await Dispute.findById(id);
    if (!dispute || dispute.status !== 'open') {
      return res.status(404).json({ success: false, message: 'Dispute not found or already resolved.' });
    }
    
    dispute.status = 'resolved';
    dispute.resolution = resolution;
    dispute.resolvedBy = req.user._id;
    dispute.resolvedAt = new Date();
    await dispute.save();
    
    // Unfreeze and release funds according to decision
    if (dispute.type === 'milestone') {
      const milestone = await Milestone.findById(dispute.targetId);
      if (milestone) {
        if (releaseTo === 'entrepreneur') {
          milestone.status = 'completed';
          // Release payment in Deal
          const deal = await Deal.findOne({ 'milestonePayments.milestoneId': milestone._id });
          if (deal) {
            const payment = deal.milestonePayments.find(mp => mp.milestoneId.equals(milestone._id)); // Use .equals() for ObjectId comparison
            if (payment && payment.status === 'pending') {
              deal.escrowBalance -= payment.amount;
              deal.releasedAmount += payment.amount;
              payment.status = 'released';
              payment.releasedAt = new Date();
              await deal.save();
              
              // Add amount to entrepreneur's balance
              const entrepreneurParticipant = deal.participants.find(p => p.role === 'entrepreneur');
              if (entrepreneurParticipant) {
                const entrepreneur = await User.findById(entrepreneurParticipant.user);
                entrepreneur.virtualBalance = (entrepreneur.virtualBalance || 0) + payment.amount;
                await entrepreneur.save();
              }
            }
          }
        } else {
          milestone.status = 'rejected';
        }
        await milestone.save();
      }
    } else if (dispute.type === 'withdrawal') {
      const withdrawal = await WithdrawalRequest.findById(dispute.targetId);
      if (withdrawal) {
        if (releaseTo === 'entrepreneur') {
          withdrawal.status = 'approved';
        } else if (releaseTo === 'refund') {
          withdrawal.status = 'rejected';
          // Refund amount to entrepreneur
          const entrepreneur = await User.findById(withdrawal.entrepreneurId);
          entrepreneur.virtualBalance = (entrepreneur.virtualBalance || 0) + withdrawal.amount;
          await entrepreneur.save();
        }
        await withdrawal.save();
      }
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'Dispute resolved.', 
      data: dispute 
    });
  } catch (error) {
    console.error('Error in resolveDispute:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to resolve dispute', 
      error: error.message 
    });
  }
});

/**
 * @desc    Add a message to an existing dispute
 * @route   POST /api/disputes/:id/messages
 * @access  Private
 * @param   {String} req.params.id - ID of the dispute
 * @param   {Object} req.body - Contains message content
 * @returns {Object} JSON response with updated dispute data
 */
export const addDisputeMessage = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    // Validate dispute id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid dispute ID format.' });
    }
    const { message } = req.body;
    
    const dispute = await Dispute.findById(id);
    if (!dispute) {
      return res.status(404).json({ success: false, message: 'Dispute not found.' });
    }
    
    dispute.messages.push({ sender: req.user._id, message });
    await dispute.save();
    
    return res.status(200).json({ 
      success: true, 
      message: 'Message added to dispute.', 
      data: dispute 
    });
  } catch (error) {
    console.error('Error in addDisputeMessage:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to add message to dispute', 
      error: error.message 
    });
  }
});

/**
 * @desc    Get all disputes opened by the current user
 * @route   GET /api/disputes/my
 * @access  Private
 * @returns {Object} JSON response with user's disputes
 */
export const getMyDisputes = asyncHandler(async (req, res) => {
  try {
    const disputes = await Dispute.find({ openedBy: req.user._id })
      .sort({ createdAt: -1 });
    
    return res.status(200).json({ 
      success: true, 
      data: disputes 
    });
  } catch (error) {
    console.error('Error in getMyDisputes:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve disputes', 
      error: error.message 
    });
  }
});

/**
 * @desc    Get details of a specific dispute
 * @route   GET /api/disputes/:id
 * @access  Private
 * @param   {String} req.params.id - ID of the dispute
 * @returns {Object} JSON response with dispute data
 */
export const getDisputeById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    // Validate dispute id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid dispute ID format.' });
    }
    
    const dispute = await Dispute.findById(id);
    if (!dispute) {
      return res.status(404).json({ success: false, message: 'Dispute not found.' });
    }
    
    return res.status(200).json({ 
      success: true, 
      data: dispute 
    });
  } catch (error) {
    console.error('Error in getDisputeById:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve dispute', 
      error: error.message 
    });
  }
});