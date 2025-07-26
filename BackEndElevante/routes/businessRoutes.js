import express from 'express';
import {
  createBusiness,
  getMyBusinesses,
  getBusinessById,
  updateBusiness,
  patchBusiness,
  deleteBusiness,
  getAllBusinesses,
  pauseBusiness,
  updateBusinessStatus,
  updateBusinessProgressManually
} from '../controllers/businessController.js';
import { protect, restrictTo, checkProjectOwnership } from '../middleware/authMiddleware.js';
import { uploadMultipleFilesToCloudinary } from '../middleware/upload.js';

const router = express.Router();

// 🟢 إنشاء مشروع جديد (فقط لرائد الأعمال) - يدعم رفع الملفات
router.post('/', protect, restrictTo('entrepreneur'), uploadMultipleFilesToCloudinary('files', 'businesses'), createBusiness);

// 🟠 استعراض كل المشاريع (لكل الأدوار – مستثمر/مورد/إدمن)
router.get('/all', protect, getAllBusinesses); // ممكن لاحقًا نفلتر حسب الدور

// 🟢 استعراض كل المشاريع (لكل الأدوار)
router.get('/', protect, getAllBusinesses);

// 🟢 استعراض كل المشاريع الخاصة بـ Entrepreneur الحالي
router.get('/my', protect, restrictTo('entrepreneur'), getMyBusinesses);

// 🟢 استعراض مشروع واحد بالتفصيل (يسمح للإدمن ورائد الأعمال)
router.get('/:id', protect, checkProjectOwnership, getBusinessById);


router.patch('/:businessId/progress', protect, restrictTo('entrepreneur', 'admin'), updateBusinessProgressManually);


// 🟢 تعديل كامل لمشروع (PUT)
router.put('/:id', protect, checkProjectOwnership, updateBusiness);

// 🟠 تعديل جزئي لمشروع (PATCH)
router.patch('/:id', protect, checkProjectOwnership, patchBusiness);

// 🔴 حذف مشروع
router.delete('/:id', protect, checkProjectOwnership, deleteBusiness);

// 🟠 إيقاف مشروع مؤقتًا
router.patch('/:id/pause', protect, checkProjectOwnership, pauseBusiness);

// 🟠 تحديث حالة المشروع وسببها
router.patch('/:id/status', protect, checkProjectOwnership, updateBusinessStatus);

export default router;