// controllers/orderController.js
import Order from '../models/Order.js';
import { notifyUser } from '../Utilies/notifyUser.js';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import mongoose from 'mongoose';

// Create Order after offer acceptance or directRequest
export const createOrder = async ({ offer, entrepreneurId, businessId, isFromDirectRequest = false, directRequest = null }) => {
  try {
    // Convert incoming string IDs to ObjectId for consistency and relational integrity
    const entrepreneurIdObj = typeof (isFromDirectRequest ? directRequest.initiatedBy : entrepreneurId) === 'string' ? new mongoose.Types.ObjectId(isFromDirectRequest ? directRequest.initiatedBy : entrepreneurId) : (isFromDirectRequest ? directRequest.initiatedBy : entrepreneurId);
    const supplierIdObj = typeof (isFromDirectRequest ? directRequest.targetUser : offer.offeredBy) === 'string' ? new mongoose.Types.ObjectId(isFromDirectRequest ? directRequest.targetUser : offer.offeredBy) : (isFromDirectRequest ? directRequest.targetUser : offer.offeredBy);
    const relatedBusinessObj = typeof (isFromDirectRequest ? directRequest.business : businessId) === 'string' ? new mongoose.Types.ObjectId(isFromDirectRequest ? directRequest.business : businessId) : (isFromDirectRequest ? directRequest.business : businessId);
    const relatedRequestObj = isFromDirectRequest ? directRequest.relatedRequest : offer.requestId;

    const order = new Order({
      entrepreneurId: entrepreneurIdObj,
      supplierId: supplierIdObj,
      relatedBusiness: relatedBusinessObj,
      sourceType: isFromDirectRequest ? 'direct' : 'offer',
      sourceId: isFromDirectRequest ? directRequest._id : offer._id,
      products: [],
      services: [],
      totalAmount: isFromDirectRequest ? directRequest.offerDetails?.amount || 0 : offer.price || 0,
      orderNumber: 'ORD-' + Date.now(),
      relatedRequest: relatedRequestObj
    });

    if (!isFromDirectRequest) {
      for (const item of offer.items) {
        if (item.itemType === 'Product') {
          order.products.push({
            productId: item.itemId,
            quantity: item.quantity,
            price: item.price
          });
        } else if (item.itemType === 'Service') {
          order.services.push({
            serviceId: item.itemId,
            quantity: item.quantity,
            price: item.price
          });
        }
      }
    }

    await order.save();

    await notifyUser({
      userId: order.supplierId,
      type: 'order',
      title: `Order status updated: ${order.status}`,
      actionUser: req.user._id.toString(),
      actionUserName: req.user.fullName || req.user.username || req.user.email ,
      actionUserAvatar: req.user.avatar || '',
      entityType: 'order',
      entityId: order._id.toString(),
      entityName: order.title || '',
      redirectUrl: `/orders/${order._id}`
    });

    return order;
  } catch (error) {
    console.error('createOrder error:', error);
    throw new Error('Failed to create order');
  }
};


export const getOrdersForSupplier = async (req, res) => {
  try {
    // No need to check user id validity here because it comes from the token and is already validated by auth middleware
    const orders = await Order.find({ supplierId: req.user._id })
      .populate('entrepreneurId')
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const filterOrders = async (req, res) => {
  try {
    const { status, startDate, endDate, entrepreneurId } = req.query;
    const filter = { supplierId: req.user._id };
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    if (entrepreneurId) filter.entrepreneurId = entrepreneurId;
    const orders = await Order.find(filter)
      .populate('entrepreneurId')
      .populate('products.productId')
      .populate('services.serviceId')
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error filtering orders:', error);
    res.status(500).json({ error: 'Failed to filter orders' });
  }
};

export const getOrderById = async (req, res) => {
  try {
    // Validate orderId
    if (!mongoose.Types.ObjectId.isValid(req.params.orderId)) {
      return res.status(400).json({ message: 'Invalid order ID format' });
    }
    const order = await Order.findById(req.params.orderId)
      .populate('entrepreneurId')
      .populate('products.productId')
      .populate('services.serviceId');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (!order.supplierId.equals(req.user._id)) {
      return res.status(403).json({ message: 'You are not authorized to view this order' });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    // Validate orderId
    if (!mongoose.Types.ObjectId.isValid(req.params.orderId)) {
      return res.status(400).json({ message: 'Invalid order ID format' });
    }
    const { orderId } = req.params;
    const { status } = req.body;
    const allowedStatuses = ['processing', 'cancelled', 'done'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    const order = await Order.findOneAndUpdate(
      { _id: orderId, supplierId: req.user._id },
      { status },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ message: 'Order not found or not authorized' });
    }
    // If order is cancelled, reopen the original request and update offers
    if (status === 'cancelled' && order.relatedRequest) {
      const reqModel = await import('../models/Request.js');
      const Request = reqModel.default;
      const relatedRequest = await Request.findById(order.relatedRequest);
      if (relatedRequest) {
        relatedRequest.isOpen = true;
        await relatedRequest.save();
      }
      // Set all rejected offers for this request to pending
      const OfferModel = (await import('../models/Offer.js')).default;
      await OfferModel.updateMany(
        { requestId: order.relatedRequest, status: 'rejected' },
        { $set: { status: 'pending' } }
      );
      // Set accepted offer to not_applicable
      if (order.sourceId) {
        await OfferModel.updateOne(
          { _id: order.sourceId },
          { $set: { status: 'not_applicable' } }
        );
      }
    }
    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

export const withdrawOrder = asyncHandler(async (req, res) => {
  // Validate orderId
  if (!mongoose.Types.ObjectId.isValid(req.params.orderId)) {
    return res.status(400).json({ success: false, message: 'Invalid order ID format' });
  }
  const { orderId } = req.params;
  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  // Only the order creator can withdraw
  if (!order.createdBy.equals(req.user._id)) {
    return res.status(403).json({ success: false, message: 'Not authorized to withdraw this order' });
  }
  if (order.status !== 'pending') {
    return res.status(400).json({ success: false, message: 'Order cannot be withdrawn' });
  }
  order.status = 'withdrawn';
  await order.save();
  // Notify the supplier in real time and remove notification
  await notifyUser({
    userId: order.supplierId.toString(),
    type: 'order',
    title: `An order was withdrawn by ${req.user.fullName || req.user.username || req.user.email || 'Unknown'}`,
    actionUser: req.user._id.toString(),
    actionUserName: req.user.fullName || req.user.username || req.user.email || 'Unknown',
    actionUserAvatar: req.user.avatar || '',
    entityType: 'order',
    entityId: order._id.toString(),
    entityName: order.title || '',
    redirectUrl: `/orders/${order._id}`,
    options: { withdrawn: true }
  });
  res.status(200).json({ success: true, message: 'Order withdrawn successfully', data: order });
});

export const confirmOrderReceipt = asyncHandler(async (req, res) => {
  // Validate orderId
  if (!mongoose.Types.ObjectId.isValid(req.params.orderId)) {
    return res.status(400).json({ message: 'Invalid order ID format' });
  }
  const { orderId } = req.params;
  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.status !== 'processing') return res.status(400).json({ message: 'Order is not in processing state' });
  // Check that the user is the entrepreneur
  if (!order.entrepreneurId.equals(req.user._id)) {
    return res.status(403).json({ message: 'Not authorized to confirm receipt for this order' });
  }
  // Platform fee deduction
  const platformFeeRate = 0.02;
  const platformFee = order.totalAmount * platformFeeRate;
  const netAmount = order.totalAmount - platformFee;
  order.platformFee = platformFee;
  order.status = 'done';
  await order.save();
  // Update supplier balance
  const supplier = await User.findById(order.supplierId);
  supplier.virtualBalance = (supplier.virtualBalance || 0) + netAmount;
  await supplier.save();
  // Log the operation in ActivityLog
  await ActivityLog.create({
    userId: req.user._id,
    actionType: 'release_order_payment',
    targetType: 'order',
    targetId: order._id,
    metadata: { platformFee, netAmount }
  });
  res.json({ message: 'Order completed, payment released to supplier (after platform fee deduction).', platformFee, netAmount });
});

// Get all orders (admin only)
export const getAllOrders = asyncHandler(async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('entrepreneurId')
      .populate('supplierId')
      .populate('products.productId')
      .populate('services.serviceId')
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch all orders' });
  }
});

// Get all orders for entrepreneur (entrepreneur only)
export const getOrdersForEntrepreneur = asyncHandler(async (req, res) => {
  try {
    const orders = await Order.find({ entrepreneurId: req.user._id })
      .populate('supplierId')
      .populate('products.productId')
      .populate('services.serviceId')
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch entrepreneur orders' });
  }
});
