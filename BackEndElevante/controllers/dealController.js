// controllers/dealController.js

import Deal from '../models/Deal.js'
import asyncHandler from 'express-async-handler';
import { notifyUser } from '../Utilies/notifyUser.js';
import ActivityLog from '../models/ActivityLog.js';
import User from '../models/User.js'; // Added import for User
import PDFDocument from 'pdfkit';
import fs from 'fs';
import { uploadToCloudinary } from '../Utilies/cloudinary.js';
import mongoose from 'mongoose';

/**
 * @desc    Create a new deal
 * @route   POST /api/deals
 * @access  Private
 */
export const createDeal = asyncHandler(async (req, res) => {
  try {
    let {
      participants,
      relatedBusiness,
      relatedRequest,
      sourceType,
      sourceId,
      dealType,
      description,
      amount,
      currency,
      status,
      statusReason,
      isFromDirect
    } = req.body;
    
    const attachments = req.attachments || [];

    // Convert participants from string to Array if needed
    if (typeof participants === 'string') {
      try {
        participants = JSON.parse(participants);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: 'Invalid participants format'
        });
      }
    }

    // Validate participant roles
    const validRoles = ['entrepreneur', 'investor'];
    for (const p of participants) {
      if (!validRoles.includes(p.role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid participant role'
        });
      }
    }

    // Convert incoming string IDs to ObjectId for consistency and relational integrity
    if (!isFromDirect) {
      if (participants && Array.isArray(participants)) {
        participants = participants.map(p => ({
          user: (typeof p.user === 'string' || typeof p.user === 'number') ? new mongoose.Types.ObjectId(String(p.user)) : p.user,
          role: p.role
        }));
      }
      if (relatedBusiness && (typeof relatedBusiness === 'string' || typeof relatedBusiness === 'number')) relatedBusiness = new mongoose.Types.ObjectId(String(relatedBusiness));
      if (relatedRequest && (typeof relatedRequest === 'string' || typeof relatedRequest === 'number')) relatedRequest = new mongoose.Types.ObjectId(String(relatedRequest));
      if (sourceId && (typeof sourceId === 'string' || typeof sourceId === 'number')) sourceId = new mongoose.Types.ObjectId(String(sourceId));
    }

    // Create milestone payments based on business milestones
    let milestonePayments = [];
    if (relatedBusiness) {
      const Business = (await import('../models/Business.js')).default;
      const Milestone = (await import('../models/Milestone.js')).default;
      const business = await Business.findById(relatedBusiness).populate('milestones');
      
      if (business && business.milestones && business.milestones.length > 0) {
        // If each milestone has a specified amount, use it; otherwise distribute equally
        let totalMilestoneAmount = 0;
        milestonePayments = business.milestones.map(m => {
          const amt = m.amount && m.amount > 0 ? m.amount : null;
          if (amt) totalMilestoneAmount += amt;
          return {
            milestoneId: m._id,
            amount: amt,
            status: 'pending'
          };
        });
        
        // If some milestones don't have specified amounts, distribute equally
        if (milestonePayments.some(mp => !mp.amount)) {
          const equalAmount = amount / business.milestones.length;
          milestonePayments = business.milestones.map(m => ({
            milestoneId: m._id,
            amount: m.amount && m.amount > 0 ? m.amount : equalAmount,
            status: 'pending'
          }));
          totalMilestoneAmount = amount;
        }
        
        // Ensure total milestone amounts don't exceed deal amount
        if (totalMilestoneAmount > amount) {
          return res.status(400).json({
            success: false,
            message: 'Total milestone amounts exceed deal amount'
          });
        }
      }
    }

    // Create the new deal
    const newDeal = new Deal({
      participants,
      initiatedBy: isFromDirect ? participants[0].user : (typeof req.user._id === 'string' ? new mongoose.Types.ObjectId(req.user._id) : req.user._id),
      relatedBusiness,
      relatedRequest,
      sourceType,
      sourceId,
      dealType,
      description,
      amount,
      currency,
      status: status || 'pending',
      statusReason,
      attachments,
      milestonePayments
    });

    await newDeal.save();

    // Notify participants (except the actor)
    for (const p of participants) {
      if (!p.user.equals(isFromDirect ? participants[0].user : req.user._id)) {
        await notifyUser({
          userId: p.user,
          type: 'deal',
          title: 'A new deal has been created involving you',
          entityId: newDeal._id,
          entityType: 'deal',
          entityName: description || '',
          redirectUrl: `/deals/${newDeal._id}`
        });
      }
    }

    // Return appropriate response based on context
    if (isFromDirect) {
      return newDeal;
    } else {
      return res.status(201).json({
        success: true,
        data: newDeal
      });
    }
  } catch (error) {
    console.error('Error creating deal:', error);
    if (isFromDirect) {
      throw new Error('Failed to create deal: ' + error.message);
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to create deal',
        error: error.message
      });
    }
  }
});

/**
 * @desc    Get all deals for current user
 * @route   GET /api/deals/my
 * @access  Private
 */
export const getMyDeals = asyncHandler(async (req, res) => {
  try {
    const filter = { 'participants.user': req.user._id };
    if (req.user.role !== 'admin') filter.isDeleted = false;
    
    const deals = await Deal.find(filter)
      .populate('participants.user', 'name role')
      .populate('relatedBusiness', 'name status')
      .populate('relatedRequest', 'title offerType');
    
    return res.status(200).json({
      success: true,
      count: deals.length,
      data: deals
    });
  } catch (error) {
    console.error('Error fetching user deals:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve deals',
      error: error.message
    });
  }
});

// ====== Helper Functions (Authorization & Status Logic) ======

/**
 * Check if user is a participant in the deal
 * @param {Object} user - User object
 * @param {Object} deal - Deal object
 * @returns {Boolean} - True if user is a participant
 */
function isDealParticipant(user, deal) {
  return deal.participants.some(
    p => (p.user && p.user._id ? p.user._id.equals(user._id) : p.user.equals(user._id))
  );
}

/**
 * Check if user is the owner of the related business
 * @param {Object} user - User object
 * @param {Object} deal - Deal object
 * @returns {Boolean} - True if user is the business owner
 */
function isBusinessOwner(user, deal) {
  return deal.relatedBusiness && deal.relatedBusiness.owner && 
         deal.relatedBusiness.owner.equals(user._id);
}

/**
 * Check if user is the owner of the related request
 * @param {Object} user - User object
 * @param {Object} deal - Deal object
 * @returns {Boolean} - True if user is the request owner
 */
function isRequestOwner(user, deal) {
  return deal.relatedRequest && deal.relatedRequest.createdBy && 
         deal.relatedRequest.createdBy.equals(user._id);
}

/**
 * Check if user is an admin
 * @param {Object} user - User object
 * @returns {Boolean} - True if user is an admin
 */
function isAdmin(user) {
  return user.role === 'admin';
}

/**
 * Check if user can view the deal
 * @param {Object} user - User object
 * @param {Object} deal - Deal object
 * @returns {Boolean} - True if user can view the deal
 */
function canViewDeal(user, deal) {
  return isDealParticipant(user, deal) || isBusinessOwner(user, deal) || 
         isRequestOwner(user, deal) || isAdmin(user);
}

/**
 * Check if the deal status transition is valid
 * @param {String} current - Current status
 * @param {String} next - Next status
 * @returns {Boolean} - True if transition is valid
 */
function isValidDealStatusTransition(current, next) {
  const allowed = {
    pending: ['active', 'cancelled', 'withdrawn'],
    active: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
    withdrawn: []
  };
  return allowed[current] && allowed[current].includes(next);
}

/**
 * @desc    Get deal by ID
 * @route   GET /api/deals/:id
 * @access  Private (participant or admin)
 */
export const getDealById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid deal ID format' });
  }
  try {
    const deal = await Deal.findById(req.params.id)
      .populate('participants.user', 'name role')
      .populate('relatedBusiness', 'name status owner')
      .populate('relatedRequest', 'title offerType createdBy');

    if (!deal || (deal.isDeleted && req.user.role !== 'admin')) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    if (!canViewDeal(req.user, deal)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this deal'
      });
    }

    return res.status(200).json({
      success: true,
      data: deal
    });
  } catch (error) {
    console.error('Error fetching deal by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve deal',
      error: error.message
    });
  }
});

/**
 * @desc    Update status of a deal
 * @route   PATCH /api/deals/:id/status
 * @access  Private (participant only)
 */
export const updateDealStatus = asyncHandler(async (req, res) => {
  try {
    const { status, statusReason } = req.body;
    const deal = await Deal.findById(req.params.id);
    
    if (!deal || (deal.isDeleted && req.user.role !== 'admin')) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    if (!isDealParticipant(req.user, deal)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this deal'
      });
    }

    // Validate status transition
    if (status && !isValidDealStatusTransition(deal.status, status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${deal.status} to ${status}`
      });
    }

    // Update deal status
    deal.status = status || deal.status;
    if (statusReason) deal.statusReason = statusReason;
    deal.updatedAt = new Date();
    await deal.save();

    // If deal is cancelled or withdrawn, reopen the original request
    if ((deal.status === 'cancelled' || deal.status === 'withdrawn') && deal.relatedRequest) {
      const reqModel = await import('../models/Request.js');
      const Request = reqModel.default;
      const relatedRequest = await Request.findById(deal.relatedRequest);
      
      if (relatedRequest) {
        relatedRequest.isOpen = true;
        await relatedRequest.save();
      }
      
      // Reset rejected offers to pending
      const OfferModel = (await import('../models/Offer.js')).default;
      await OfferModel.updateMany(
        { requestId: deal.relatedRequest, status: 'rejected' },
        { $set: { status: 'pending' } }
      );
      
      // Change accepted offer to not_applicable
      if (deal.sourceId) {
        await OfferModel.updateOne(
          { _id: deal.sourceId },
          { $set: { status: 'not_applicable' } }
        );
      }
    }

    // Notify participants
    for (const p of deal.participants) {
      if (!p.user.equals(req.user._id)) { // Use .equals() for ObjectId comparison
        await notifyUser({
          userId: p.user,
          type: 'deal',
          title: `Deal status updated: ${deal.status}`,
          relatedEntityId: deal._id
        });
      }
    }

    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      actionType: 'update_deal_status',
      targetType: 'deal',
      targetId: deal._id
    });

    return res.status(200).json({
      success: true,
      message: 'Deal status updated',
      data: deal
    });
  } catch (error) {
    console.error('Error updating deal status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update deal status',
      error: error.message
    });
  }
});

/**
 * @desc    Delete a deal (soft delete)
 * @route   DELETE /api/deals/:id
 * @access  Private (initiator or admin)
 */
export const deleteDeal = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid deal ID format' });
  }
  try {
    const deal = await Deal.findById(req.params.id);
    
    if (!deal || (deal.isDeleted && req.user.role !== 'admin')) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    if (!deal.initiatedBy.equals(req.user._id) && req.user.role !== 'admin') { // Use .equals() for ObjectId comparison
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this deal'
      });
    }
    
    // Soft delete
    deal.isDeleted = true;
    await deal.save();

    // Notify participants
    for (const p of deal.participants) {
      if (!p.user.equals(req.user._id)) { // Use .equals() for ObjectId comparison
        await notifyUser({
          userId: p.user,
          type: 'deal',
          title: 'A deal you are part of was deleted',
          relatedEntityId: deal._id
        });
      }
    }

    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      actionType: 'delete_deal',
      targetType: 'deal',
      targetId: deal._id
    });

    return res.status(200).json({
      success: true,
      message: 'Deal deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting deal:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete deal',
      error: error.message
    });
  }
});

/**
 * @desc    Restore a deleted deal
 * @route   PATCH /api/deals/:id/restore
 * @access  Private (admin)
 */
export const restoreDeal = asyncHandler(async (req, res) => {
  try {
    // Verify admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can restore deals'
      });
    }
    
    const deal = await Deal.findById(req.params.id);
    
    if (!deal || !deal.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found or not deleted'
      });
    }
    
    // Restore deal
    deal.isDeleted = false;
    await deal.save();

    // Notify participants
    for (const p of deal.participants) {
      await notifyUser({
        userId: p.user,
        type: 'deal',
        title: 'A deleted deal you are part of was restored by admin',
        relatedEntityId: deal._id
      });
    }

    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      actionType: 'restore_deal',
      targetType: 'deal',
      targetId: deal._id
    });

    return res.status(200).json({
      success: true,
      message: 'Deal restored successfully',
      data: deal
    });
  } catch (error) {
    console.error('Error restoring deal:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to restore deal',
      error: error.message
    });
  }
});

/**
 * @desc    Get all deals (filterable)
 * @route   GET /api/deals
 * @access  Private (admin or filtered view)
 */
export const getAllDeals = asyncHandler(async (req, res) => {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.dealType) filters.dealType = req.query.dealType;
    if (req.query.relatedBusiness) filters.relatedBusiness = req.query.relatedBusiness;
    if (req.user.role !== 'admin') filters.isDeleted = false;
    
    const deals = await Deal.find(filters)
      .populate('participants.user', 'name role')
      .populate('relatedBusiness', 'name status')
      .populate('relatedRequest', 'title offerType');
    
    return res.status(200).json({
      success: true,
      count: deals.length,
      data: deals
    });
  } catch (error) {
    console.error('Error fetching all deals:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve deals',
      error: error.message
    });
  }
});

/**
 * @desc    Withdraw a deal
 * @route   PATCH /api/deals/:id/withdraw
 * @access  Private (initiator only)
 */
export const withdrawDeal = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const deal = await Deal.findById(id);

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    // Only the initiator can withdraw
    if (!deal.initiatedBy.equals(req.user._id)) { // Use .equals() for ObjectId comparison
      return res.status(403).json({
        success: false,
        message: 'Not authorized to withdraw this deal'
      });
    }

    if (deal.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Deal cannot be withdrawn at this stage'
      });
    }

    deal.status = 'withdrawn';
    await deal.save();

    // Notify all participants
    for (const participant of deal.participants) {
      await notifyUser({
        userId: participant.user.toString(),
        type: 'deal',
        title: `A deal was withdrawn by ${req.user.fullName || req.user.username || req.user.email || 'Unknown'}`,
        actionUser: req.user._id.toString(),
        actionUserName: req.user.fullName || req.user.username || req.user.email || 'Unknown',
        actionUserAvatar: req.user.avatar || '',
        entityType: 'deal',
        entityId: deal._id.toString(),
        entityName: deal.title || '',
        redirectUrl: `/deals/${deal._id}`,
        options: { withdrawn: true }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Deal withdrawn successfully',
      data: deal
    });
  } catch (error) {
    console.error('Error withdrawing deal:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to withdraw deal',
      error: error.message
    });
  }
});

/**
 * @desc    Confirm investment after payment
 * @route   POST /api/deals/:dealId/confirm-investment
 * @access  Private
 */
export const confirmInvestment = asyncHandler(async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.dealId)
      .populate('participants.user')
      .populate('relatedBusiness');
    
    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }
    
    if (deal.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Deal already confirmed or cannot be confirmed'
      });
    }

    // Calculate platform fee
    const platformFeeRate = 0.02;
    const platformFee = deal.amount * platformFeeRate;
    const escrowAmount = deal.amount - platformFee;

    deal.escrowBalance = escrowAmount;
    deal.status = 'active';
    deal.platformFee = platformFee;

    // Generate PDF contract
    const doc = new PDFDocument();
    const pdfPath = `uploads/contracts/deal_contract_${deal._id}.pdf`;
    doc.pipe(fs.createWriteStream(pdfPath));
    
    // Add contract content
    doc.fontSize(18).text('Investment Deal Contract', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Deal ID: ${deal._id}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown();
    doc.text(`Entrepreneur: ${deal.participants.find(p => p.role === 'entrepreneur')?.user?.fullName || ''} (ID: ${deal.participants.find(p => p.role === 'entrepreneur')?.user?._id || ''})`);
    doc.text(`Investor: ${deal.participants.find(p => p.role === 'investor')?.user?.fullName || ''} (ID: ${deal.participants.find(p => p.role === 'investor')?.user?._id || ''})`);
    doc.moveDown();
    doc.text(`Project: ${deal.relatedBusiness?.name || ''}`);
    doc.text(`Description: ${deal.description || ''}`);
    doc.moveDown();
    doc.text(`Investment Amount: ${deal.amount} ${deal.currency || ''}`);
    doc.text(`Platform Fee: ${platformFee}`);
    doc.text(`Net Amount (in escrow): ${escrowAmount}`);
    doc.moveDown();
    doc.text(`Agreement Date: ${deal.agreementDate ? deal.agreementDate.toLocaleDateString() : ''}`);
    doc.text(`Status: ${deal.status}`);
    doc.moveDown();
    doc.text('This contract is generated automatically by the platform and is binding upon confirmation by both parties.');
    doc.end();

    // Wait for PDF to be saved
    await new Promise(resolve => doc.on('finish', resolve));

    // Upload to Cloudinary
    const pdfBuffer = fs.readFileSync(pdfPath);
    const cloudinaryResult = await uploadToCloudinary(pdfBuffer, `deal_contract_${deal._id}.pdf`, 'application/pdf', 'contracts');
    deal.contractUrl = cloudinaryResult.secure_url;

    // Delete temporary file
    fs.unlinkSync(pdfPath);

    await deal.save();

    // Notify participants about contract
    for (const p of deal.participants) {
      await notifyUser({
        userId: p.user._id,
        type: 'deal',
        title: 'Contract generated for your investment deal',
        entityType: 'deal',
        entityId: deal._id,
        isRead: false
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Investment confirmed. Funds are now held in escrow and contract generated',
      contractUrl: deal.contractUrl
    });
  } catch (error) {
    console.error('Error confirming investment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to confirm investment',
      error: error.message
    });
  }
});

/**
 * @desc    Approve milestone payment
 * @route   POST /api/deals/milestone/approve
 * @access  Private (investor/admin)
 */
export const approveMilestonePayment = asyncHandler(async (req, res) => {
  try {
    const { dealId, milestoneId } = req.body;
    const deal = await Deal.findById(dealId);
    
    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    // Find the milestone payment
    const payment = deal.milestonePayments.find(
      mp => mp.milestoneId.equals(milestoneId) && mp.status === 'pending' // Use .equals() for ObjectId comparison
    );
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Milestone payment not found or already released'
      });
    }

    // Verify milestone status
    const Milestone = (await import('../models/Milestone.js')).default;
    const milestone = await Milestone.findById(milestoneId);
    
    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found'
      });
    }
    
    if (!['completed', 'submitted'].includes(milestone.status)) {
      return res.status(400).json({
        success: false,
        message: 'Milestone is not completed or ready for payment'
      });
    }

    // Check escrow balance
    if (deal.escrowBalance < payment.amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient escrow balance'
      });
    }

    // Release payment
    deal.escrowBalance -= payment.amount;
    deal.releasedAmount += payment.amount;
    payment.status = 'released';
    payment.releasedAt = new Date();
    await deal.save();

    // Add amount to entrepreneur's balance
    const entrepreneurParticipant = deal.participants.find(p => p.role === 'entrepreneur');
    if (!entrepreneurParticipant) {
      return res.status(500).json({
        success: false,
        message: 'Entrepreneur not found in deal'
      });
    }
    
    const entrepreneur = await User.findById(entrepreneurParticipant.user);
    entrepreneur.virtualBalance = (entrepreneur.virtualBalance || 0) + payment.amount;
    await entrepreneur.save();

    // Update business status after milestone payment
    if (milestone.business) {
      const Business = (await import('../models/Business.js')).default;
      const business = await Business.findById(milestone.business);
      
      if (business) {
        // Check if all milestones are completed
        const Milestone = (await import('../models/Milestone.js')).default;
        const allMilestones = await Milestone.find({ business: business._id });
        const allCompleted = allMilestones.every(m => m.status === 'completed');
        
        business.status = allCompleted ? 'Completed' : 'In Progress';
        await business.save();
      }
    }

    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      actionType: 'release_milestone_payment',
      targetType: 'deal',
      targetId: deal._id,
      metadata: { milestoneId, amount: payment.amount }
    });

    // Notify entrepreneur
    await notifyUser({
      userId: entrepreneur._id,
      type: 'deal',
      title: 'Milestone payment released to your balance',
      actionUser: req.user._id,
      actionUserName: req.user.fullName || req.user.name || req.user.email,
      entityType: 'deal',
      entityId: deal._id,
      isRead: false
    });

    // Notify investor
    const investorParticipant = deal.participants.find(p => p.role === 'investor');
    if (investorParticipant) {
      await notifyUser({
        userId: investorParticipant.user,
        type: 'deal',
        title: 'Milestone payment released to entrepreneur',
        actionUser: req.user._id,
        actionUserName: req.user.fullName || req.user.name || req.user.email,
        entityType: 'deal',
        entityId: deal._id,
        isRead: false
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Milestone payment released successfully',
      releasedAmount: payment.amount
    });
  } catch (error) {
    console.error('Error approving milestone payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to release milestone payment',
      error: error.message
    });
  }
});
