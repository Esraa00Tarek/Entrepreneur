// routes/orderRoutes.js
import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import {
  createOrder,
  getOrdersForSupplier,
  getOrderById,
  updateOrderStatus,
  filterOrders,
  withdrawOrder,
  confirmOrderReceipt,
  getAllOrders,
  getOrdersForEntrepreneur
} from '../controllers/orderController.js';

const router = express.Router();

// @desc    Create new order from accepted offer
// @route   POST /api/orders
// @access  Private (entrepreneur only)
router.post('/', protect, restrictTo('entrepreneur'), createOrder);

// @desc    Get all orders for supplier
// @route   GET /api/orders/supplier
// @access  Private (supplier only)
router.get('/supplier', protect, restrictTo('supplier'), getOrdersForSupplier);

// @desc    Filter orders for supplier
// @route   GET /api/orders/supplier/filter
// @access  Private (supplier only)
router.get('/supplier/filter', protect, restrictTo('supplier'), filterOrders);

// @desc    Get all orders for entrepreneur with a specific supplier
// @route   GET /api/orders/entrepreneur?supplierId=SUPPLIER_ID
// @access  Private (entrepreneur only)
router.get('/entrepreneur', protect, restrictTo('entrepreneur'), getOrdersForEntrepreneur);

// @desc    Get specific order by ID
// @route   GET /api/orders/:orderId
// @access  Private (supplier only)
router.get('/:orderId', protect, restrictTo('supplier'), getOrderById);

// @desc    Update order status (e.g., done or cancelled)
// @route   PUT /api/orders/:orderId/status
// @access  Private (supplier only)
router.put('/:orderId/status', protect, restrictTo('supplier'), updateOrderStatus);

// @desc    Withdraw order
// @route   PATCH /api/orders/:orderId/withdraw
// @access  Private (supplier only)
router.patch('/:orderId/withdraw', protect, restrictTo('supplier'), withdrawOrder);

// تأكيد استلام الطلب من الريادي وتحرير الأموال للمورد
router.patch('/:orderId/confirm-receipt', protect, confirmOrderReceipt);

// @desc    Get all orders (admin only)
// @route   GET /api/orders/admin/all
// @access  Private (admin only)
router.get('/admin/all', protect, restrictTo('admin'), getAllOrders);

export default router;
