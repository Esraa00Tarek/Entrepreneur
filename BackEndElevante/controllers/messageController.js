import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import MessageThread from '../models/MessageThread.js';
import Message from '../models/Message.js';

/**
 * @desc    Get all threads for the logged-in user, sorted by latest activity
 * @route   GET /api/messages/threads
 * @access  Private
 */
export const getUserThreads = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { type, relatedDealId, relatedOrderId, relatedOfferId, relatedRequestId, page = 1, limit = 20 } = req.query;
    
    // Build filter object
    const filter = { participants: userId };
    if (type) filter.type = type;
    if (relatedDealId) filter.relatedDealId = relatedDealId;
    if (relatedOrderId) filter.relatedOrderId = relatedOrderId;
    if (relatedOfferId) filter.relatedOfferId = relatedOfferId;
    if (relatedRequestId) filter.relatedRequestId = relatedRequestId;
    
    // Pagination setup
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Fetch threads with populated participant details
    const threads = await MessageThread.find(filter)
      .populate('participants', 'fullName email role avatar')
      .sort({ lastMessageTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Count total threads for pagination
    const total = await MessageThread.countDocuments(filter);
    
    // Emit real-time update for thread list
    if (req.io) {
      req.io.to(`user:${userId}`).emit('threadListUpdated');
    }
    
    return res.status(200).json({
      success: true,
      data: {
        threads,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user threads:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve message threads',
      error: error.message
    });
  }
});

/**
 * @desc    Get messages for a specific thread
 * @route   GET /api/messages/thread/:threadId
 * @access  Private
 */
export const getThreadMessages = asyncHandler(async (req, res) => {
  try {
    const { threadId } = req.params;
    // Validate threadId
    if (!mongoose.Types.ObjectId.isValid(threadId)) {
      return res.status(400).json({ success: false, message: 'Invalid thread ID format' });
    }
    const userId = req.user._id.toString();
    const { messageType, senderId, status, search, page = 1, limit = 50 } = req.query;
    
    // Verify user is a participant in the thread
    const thread = await MessageThread.findOne({
      _id: threadId,
      participants: userId
    });
    
    if (!thread) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this thread'
      });
    }
    
    // Build filter object
    const filter = { threadId };
    if (messageType) filter.messageType = messageType;
    if (senderId) filter.senderId = senderId;
    if (status) filter.status = status;
    if (search) filter.content = { $regex: search, $options: 'i' };
    
    // Pagination setup
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Fetch messages
    const messages = await Message.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Count total messages for pagination
    const total = await Message.countDocuments(filter);
    
    // Emit real-time update for messages
    if (req.io) {
      req.io.to(threadId).emit('messagesUpdated', { threadId });
    }
    
    return res.status(200).json({
      success: true,
      data: {
        messages,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching thread messages:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve messages',
      error: error.message
    });
  }
});

/**
 * @desc    Send a new message
 * @route   POST /api/messages
 * @access  Private
 */
export const sendMessage = asyncHandler(async (req, res) => {
  try {
    // Convert incoming string IDs to ObjectId for consistency and relational integrity
    const senderId = typeof req.user._id === 'string' ? new mongoose.Types.ObjectId(req.user._id) : req.user._id;
    const receiverIdObj = req.body.receiverId ? (typeof req.body.receiverId === 'string' ? new mongoose.Types.ObjectId(req.body.receiverId) : req.body.receiverId) : null;
    const threadIdObj = req.body.threadId ? (typeof req.body.threadId === 'string' ? new mongoose.Types.ObjectId(req.body.threadId) : req.body.threadId) : null;
    const relatedDealIdObj = req.body.relatedDealId ? (typeof req.body.relatedDealId === 'string' ? new mongoose.Types.ObjectId(req.body.relatedDealId) : req.body.relatedDealId) : null;
    const relatedOrderIdObj = req.body.relatedOrderId ? (typeof req.body.relatedOrderId === 'string' ? new mongoose.Types.ObjectId(req.body.relatedOrderId) : req.body.relatedOrderId) : null;
    const relatedOfferIdObj = req.body.relatedOfferId ? (typeof req.body.relatedOfferId === 'string' ? new mongoose.Types.ObjectId(req.body.relatedOfferId) : req.body.relatedOfferId) : null;
    const relatedRequestIdObj = req.body.relatedRequestId ? (typeof req.body.relatedRequestId === 'string' ? new mongoose.Types.ObjectId(req.body.relatedRequestId) : req.body.relatedRequestId) : null;
    
    // Validate required fields
    if (!receiverIdObj && !threadIdObj) {
      return res.status(400).json({
        success: false,
        message: 'Either receiverId or threadId is required'
      });
    }
    
    if (!req.body.content) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }
    
    // لا حاجة لأي فحص مرفقات هنا بعد الآن
    
    let finalThreadId = threadIdObj;
    let thread;
    
    // Thread type determination logic
    let threadType = req.body.type;
    if (!threadType) {
      if (relatedDealIdObj) threadType = 'deal-progress';
      else if (relatedOrderIdObj) threadType = 'post-order';
      else if (relatedOfferIdObj) threadType = 'offer-negotiation';
      else threadType = 'pre-deal';
    }
    
    // Support thread logic: if type is 'support', create/find thread between user and admin only
    if (threadType === 'support') {
      // Find admin user
      const adminUser = await mongoose.model('User').findOne({ role: 'admin' });
      if (!adminUser) {
        return res.status(500).json({ success: false, message: 'No admin user found for support thread.' });
      }
      // Always create/find thread between current user and admin
      let supportThread = await MessageThread.findOne({
        participants: { $all: [senderId, adminUser._id] },
        type: 'support'
      });
      if (!supportThread) {
        supportThread = await MessageThread.create({
          participants: [senderId, adminUser._id],
          type: 'support',
          lastMessage: req.body.content,
          lastMessageTime: new Date(),
          lastMessageSender: senderId
        });
      }
      finalThreadId = supportThread._id;
      thread = supportThread;
    }
    
    // If no threadId, try to find or create based on references
    if (!threadIdObj) {
      let query = {
        participants: { $all: [senderId, receiverIdObj] },
        type: threadType
      };
      
      if (relatedDealIdObj) query.relatedDealId = relatedDealIdObj;
      if (relatedOrderIdObj) query.relatedOrderId = relatedOrderIdObj;
      if (relatedOfferIdObj) query.relatedOfferId = relatedOfferIdObj;
      if (relatedRequestIdObj) query.relatedRequestId = relatedRequestIdObj;
      
      thread = await MessageThread.findOne(query);
      
      if (!thread) {
        thread = await MessageThread.create({
          participants: [senderId, receiverIdObj],
          type: threadType,
          relatedDealId: relatedDealIdObj,
          relatedOrderId: relatedOrderIdObj,
          relatedOfferId: relatedOfferIdObj,
          relatedRequestId: relatedRequestIdObj,
          lastMessage: req.body.content,
          lastMessageTime: new Date(),
          lastMessageSender: senderId
        });
        
        // Emit new thread created event
        if (req.io) {
          req.io.to(`user:${senderId}`).emit('newThreadCreated', thread);
          req.io.to(`user:${receiverIdObj}`).emit('newThreadCreated', thread);
        }
      }
      
      finalThreadId = thread._id;
    } else {
      thread = await MessageThread.findById(finalThreadId);
      
      if (!thread) {
        return res.status(404).json({
          success: false,
          message: 'Thread not found'
        });
      }
    }
    
    // Create and save the new message
    const newMessage = new Message({
      threadId: finalThreadId,
      senderId,
      receiverId: receiverIdObj,
      content: req.body.content,
      attachments: req.attachments || [],
      relatedDealId: relatedDealIdObj,
      relatedOrderId: relatedOrderIdObj,
      relatedOfferId: relatedOfferIdObj,
      relatedRequestId: relatedRequestIdObj,
      messageType: 'text',
    });
    
    await newMessage.save();

    // After saving the new message, notify the recipient
    await notifyUser({
      userId: receiverIdObj,
      type: 'message',
      title: 'You have received a new message.',
      actionUser: senderId.toString(),
      actionUserName: req.user.fullName || req.user.username || req.user.email || 'Unknown',
      actionUserAvatar: req.user.avatar || '',
      entityType: 'message',
      entityId: newMessage._id.toString(),
      entityName: '',
      redirectUrl: `/messages/${newMessage._id}`
    });
    
    // Update thread with latest message info
    await MessageThread.findByIdAndUpdate(finalThreadId, {
      lastMessage: req.body.content,
      lastMessageTime: new Date(),
      lastMessageSender: senderId
    });
    
    // Handle real-time events via Socket.IO
    if (req.io) {
      // Emit to thread room
      req.io.to(finalThreadId.toString()).emit('receiveMessage', newMessage);
      
      // Emit typing stopped event
      req.io.to(finalThreadId.toString()).emit('typingStopped', { userId: senderId });
      
      // Emit thread updated event
      req.io.to(`user:${senderId}`).emit('threadUpdated', { threadId: finalThreadId, lastMessage: req.body.content });
      req.io.to(`user:${receiverIdObj}`).emit('threadUpdated', { threadId: finalThreadId, lastMessage: req.body.content });
      
      // Emit notification to receiver
      req.io.to(`notifications:${receiverIdObj}`).emit('newMessageNotification', {
        threadId: finalThreadId,
        senderId,
        content: req.body.content.substring(0, 100),
        timestamp: new Date()
      });
    }
    
    return res.status(201).json({
      success: true,
      message: 'Message sent',
      data: {
        message: newMessage,
        threadId: finalThreadId
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
});

/**
 * @desc    Mark messages as read in a thread
 * @route   PATCH /api/messages/thread/:threadId/read
 * @access  Private
 */
export const markThreadMessagesRead = asyncHandler(async (req, res) => {
  try {
    const { threadId } = req.params;
    // Validate threadId
    if (!mongoose.Types.ObjectId.isValid(threadId)) {
      return res.status(400).json({ success: false, message: 'Invalid thread ID format' });
    }
    const userId = req.user._id.toString();
    
    // Update message status to 'read'
    await Message.updateMany(
      { threadId, receiverId: userId, status: { $ne: 'read' } },
      { $set: { status: 'read' } }
    );
    
    // Emit real-time read status update
    if (req.io) {
      req.io.to(threadId).emit('messagesRead', {
        threadId, 
        readBy: userId, 
        timestamp: new Date() 
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read',
      error: error.message
    });
  }
});

/**
 * @desc    Start typing indicator
 * @route   POST /api/messages/typing
 * @access  Private
 */
export const startTyping = asyncHandler(async (req, res) => {
  try {
    const { threadId } = req.body;
    // Validate threadId
    if (!mongoose.Types.ObjectId.isValid(threadId)) {
      return res.status(400).json({ success: false, message: 'Invalid thread ID format' });
    }
    const userId = req.user._id.toString();
    
    if (req.io) {
      req.io.to(threadId).emit('userTyping', { userId, threadId });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Typing indicator started'
    });
  } catch (error) {
    console.error('Error starting typing indicator:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to start typing indicator',
      error: error.message
    });
  }
});

/**
 * @desc    Stop typing indicator
 * @route   POST /api/messages/stop-typing
 * @access  Private
 */
export const stopTyping = asyncHandler(async (req, res) => {
  try {
    const { threadId } = req.body;
    // Validate threadId
    if (!mongoose.Types.ObjectId.isValid(threadId)) {
      return res.status(400).json({ success: false, message: 'Invalid thread ID format' });
    }
    const userId = req.user._id.toString();
    
    if (req.io) {
      req.io.to(threadId).emit('typingStopped', { userId, threadId });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Typing indicator stopped'
    });
  } catch (error) {
    console.error('Error stopping typing indicator:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to stop typing indicator',
      error: error.message
    });
  }
});

/**
 * @desc    Join thread room for real-time updates
 * @route   POST /api/messages/join-thread
 * @access  Private
 */
export const joinThread = asyncHandler(async (req, res) => {
  try {
    const { threadId } = req.body;
    // Validate threadId
    if (!mongoose.Types.ObjectId.isValid(threadId)) {
      return res.status(400).json({ success: false, message: 'Invalid thread ID format' });
    }
    const userId = req.user._id.toString();
    
    // Verify user is participant in thread
    const thread = await MessageThread.findById(threadId);
    if (!thread || !thread.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to join this thread'
      });
    }
    
    if (req.io) {
      req.io.to(`user:${userId}`).emit('threadJoined', { threadId, userId });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Thread joined successfully',
      data: { threadId }
    });
  } catch (error) {
    console.error('Error joining thread:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to join thread',
      error: error.message
    });
  }
});

/**
 * @desc    Get all threads (admin only)
 * @route   GET /api/messages/admin/threads
 * @access  Private (Admin)
 */
export const getAllThreadsAdmin = asyncHandler(async (req, res) => {
  try {
    // Verify admin role
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can access all threads'
      });
    }
    
    const { 
      type, participant, relatedDealId, relatedOrderId, 
      relatedOfferId, relatedRequestId, isActive, isArchived, 
      page = 1, limit = 50 
    } = req.query;
    
    // Build filter object
    const filter = {};
    if (type) filter.type = type;
    if (participant) filter.participants = participant;
    if (relatedDealId) filter.relatedDealId = relatedDealId;
    if (relatedOrderId) filter.relatedOrderId = relatedOrderId;
    if (relatedOfferId) filter.relatedOfferId = relatedOfferId;
    if (relatedRequestId) filter.relatedRequestId = relatedRequestId;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (isArchived !== undefined) filter.isArchived = isArchived === 'true';
    
    // Pagination setup
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Fetch threads
    const threads = await MessageThread.find(filter)
      .populate('participants', 'fullName role email')
      .sort({ lastMessageTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Count total threads for pagination
    const total = await MessageThread.countDocuments(filter);
    
    return res.status(200).json({
      success: true,
      data: {
        threads,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching all threads (admin):', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve threads',
      error: error.message
    });
  }
});

/**
 * @desc    Get all messages (admin only)
 * @route   GET /api/messages/admin/messages
 * @access  Private (Admin)
 */
export const getAllMessagesAdmin = asyncHandler(async (req, res) => {
  try {
    // Verify admin role
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can access all messages'
      });
    }
    
    const { 
      threadId, senderId, receiverId, messageType, status, 
      relatedDealId, relatedOrderId, relatedOfferId, relatedRequestId, 
      page = 1, limit = 50 
    } = req.query;
    
    // Build filter object
    const filter = {};
    if (threadId) filter.threadId = threadId;
    if (senderId) filter.senderId = senderId;
    if (receiverId) filter.receiverId = receiverId;
    if (messageType) filter.messageType = messageType;
    if (status) filter.status = status;
    if (relatedDealId) filter.relatedDealId = relatedDealId;
    if (relatedOrderId) filter.relatedOrderId = relatedOrderId;
    if (relatedOfferId) filter.relatedOfferId = relatedOfferId;
    if (relatedRequestId) filter.relatedRequestId = relatedRequestId;
    
    // Pagination setup
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Fetch messages
    const messages = await Message.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Count total messages for pagination
    const total = await Message.countDocuments(filter);
    
    return res.status(200).json({
      success: true,
      data: {
        messages,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching all messages (admin):', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve messages',
      error: error.message
    });
  }
});

/**
 * @desc    Soft delete a message (admin only)
 * @route   DELETE /api/messages/admin/message/:messageId
 * @access  Private (Admin)
 */
export const deleteMessageAdmin = asyncHandler(async (req, res) => {
  try {
    // Verify admin role
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can delete messages'
      });
    }
    
    const { messageId } = req.params;
    // Validate messageId
    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ success: false, message: 'Invalid message ID format' });
    }
    
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    // Soft delete the message
    message.isDeleted = true;
    await message.save();
    
    // Log the activity
    const ActivityLog = (await import('../models/ActivityLog.js')).default;
    await ActivityLog.create({
      userId: req.user._id,
      actionType: 'admin_delete_message',
      targetType: 'message',
      targetId: message._id
    });
    
    return res.status(200).json({
      success: true,
      message: 'Message soft deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message (admin):', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: error.message
    });
  }
});

/**
 * @desc    Soft delete a thread (admin only)
 * @route   DELETE /api/messages/admin/thread/:threadId
 * @access  Private (Admin)
 */
export const deleteThreadAdmin = asyncHandler(async (req, res) => {
  try {
    // Verify admin role
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can delete threads'
      });
    }
    
    const { threadId } = req.params;
    // Validate threadId
    if (!mongoose.Types.ObjectId.isValid(threadId)) {
      return res.status(400).json({ success: false, message: 'Invalid thread ID format' });
    }
    
    const thread = await MessageThread.findById(threadId);
    if (!thread) {
      return res.status(404).json({
        success: false,
        message: 'Thread not found'
      });
    }
    
    // Soft delete (archive) the thread
    thread.isActive = false;
    thread.isArchived = true;
    await thread.save();
    
    // Log the activity
    const ActivityLog = (await import('../models/ActivityLog.js')).default;
    await ActivityLog.create({
      userId: req.user._id,
      actionType: 'admin_delete_thread',
      targetType: 'thread',
      targetId: thread._id
    });
    
    return res.status(200).json({
      success: true,
      message: 'Thread soft deleted (archived) successfully'
    });
  } catch (error) {
    console.error('Error deleting thread (admin):', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete thread',
      error: error.message
    });
  }
});