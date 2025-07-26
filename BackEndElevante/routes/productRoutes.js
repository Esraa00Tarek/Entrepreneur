import express from 'express';
import {
  getProductsBySupplier,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductActiveStatus,
  getProductById,
  filterProducts
} from '../controllers/productController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import {
  uploadMultipleImagesToCloudinary
} from '../middleware/upload.js';

const router = express.Router();

// 🔹 جلب كل المنتجات التابعة لمورد معين
router.get('/supplier/:supplierId', protect, getProductsBySupplier);

// 🔹 إنشاء منتج جديد
router.post(
  '/',
  protect,
  restrictTo('supplier'),
  uploadMultipleImagesToCloudinary('images', 'products'),
  createProduct
);

// 🔹 تحديث منتج
router.put(
  '/:productId',
  protect,
  restrictTo('supplier'),
  uploadMultipleImagesToCloudinary('images', 'products'),
  updateProduct
);

// 🔹 حذف منتج
router.delete('/:productId', protect, restrictTo('supplier'), deleteProduct);

// 🔹 تبديل حالة تفعيل المنتج
router.patch('/:productId/toggle-active', protect, restrictTo('supplier'), toggleProductActiveStatus);

// ✅ جلب منتج معين حسب ID
router.get('/:productId', protect,  getProductById);

// ✅ فلترة المنتجات بناءً على استعلامات (اسم، تصنيف، تفعيل...)
router.get('/', protect, filterProducts);

export default router;
