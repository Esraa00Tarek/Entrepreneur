import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  getAllUsers,
  getUserById,
  blockUser,
  unblockUser,
  updateUserStatus,
  updateUserProfile,
  deleteUserAccount,
  restoreUser,
  adminDashboardStats,
  changeUserRole,
  getAllUploadedFiles,
  deleteUploadedFile,
  softDeleteUser,
  getFinancialOverview,
  changePassword,
  uploadProfileImage,
  deleteProfileImage,
  sendResetPasswordEmail,
  resetPassword,
  deleteUserAccountPermanent,
  adminDeleteUserPermanent,
  getInvestors
} from '../controllers/userController.js';

import { protect, isAdmin, restrictTo } from '../middleware/authMiddleware.js';
import { uploadUserFiles } from '../middleware/upload.js';
import multer from 'multer';

// إعداد ميدلوير رفع صورة البروفايل
const uploadProfile = multer({ storage: multer.memoryStorage() }).single('profileImage');


const router = express.Router();

// Auth
router.post('/register', (req, res, next) => {
  console.log('FILES RECEIVED');
  next();
}, uploadUserFiles, registerUser);

router.post('/login', loginUser);
router.post('/logout', logoutUser);

// إعادة تعيين كلمة المرور عبر الإيميل
router.post('/forgot-password', sendResetPasswordEmail);
router.post('/reset-password', resetPassword);

// Profile
router.get('/profile', protect, getUserById); // يحتاج إلى req.user._id
router.put('/profile', protect, updateUserProfile);

// إعدادات الحساب
router.post('/change-password', protect, changePassword);
router.post('/profile-image', protect, uploadProfile, uploadProfileImage);
router.delete('/profile-image', protect, deleteProfileImage);

// Delete account (for logged-in user)
router.delete('/delete', protect, deleteUserAccount);

// حذف نهائي لحساب المستخدم (للمستخدم نفسه)
router.delete('/delete-permanent', protect, deleteUserAccountPermanent);

// حذف نهائي لأي مستخدم (للأدمن)
router.delete('/admin/:userId/delete-permanent', protect, isAdmin, adminDeleteUserPermanent);

// Admin-only routes
router.get('/all', protect, restrictTo('admin', 'investor', 'entrepreneur'), getAllUsers);
router.put('/:userId/block', protect, isAdmin, blockUser);
router.put('/:userId/unblock', protect, isAdmin, unblockUser);
router.put('/:userId/status', protect, isAdmin, updateUserStatus);
router.get('/:userId', protect, isAdmin, getUserById); // Get any user by ID (admin only)
router.patch('/:userId/restore', protect, isAdmin, restoreUser);

// Admin dashboard stats
router.get('/admin/dashboard-stats', protect, isAdmin, adminDashboardStats);

// Admin: Change user role (entrepreneur, supplier, investor only)
router.patch('/admin/:userId/change-role', protect, isAdmin, changeUserRole);

// Admin: Soft delete user
router.delete('/admin/:userId/soft-delete', protect, isAdmin, softDeleteUser);

// Admin: Get all uploaded files
router.get('/admin/uploaded-files', protect, isAdmin, getAllUploadedFiles);

// Admin: Delete uploaded file
router.delete('/admin/delete-uploaded-file', protect, isAdmin, deleteUploadedFile);

// ملخص العمليات المالية والتنفيذية للإدارة
router.get('/admin/financial-overview', protect, getFinancialOverview);

// جلب جميع المستثمرين مع دعم الفلاتر والصفحات (Public)
// GET /api/users/investors?page=1&limit=20&city=...&country=...&name=...
router.get('/investors', getInvestors);

export default router;
