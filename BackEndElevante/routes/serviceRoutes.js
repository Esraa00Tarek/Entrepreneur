import express from 'express';
import {
  getServicesBySupplier,
  createService,
  updateService,
  deleteService,
  toggleServiceActiveStatus,
  getServiceById,
  filterServices,
  uploadServiceFile // أضفت الدالة الجديدة
} from '../controllers/serviceController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import {
  uploadServiceFiles // NEW combined middleware
} from '../middleware/upload.js';
import { Service } from '../models/Service.js'; // Fixed import path

const router = express.Router();

// Get all services for a specific supplier
router.get('/supplier/:supplierId', protect, getServicesBySupplier);

// Create a new service
router.post(
  '/',
  protect,
  restrictTo('supplier'),
  uploadServiceFiles('images', 'serviceFile', 'services'), // Combined middleware
  createService
);

// Update a service
router.put(
  '/:serviceId',
  protect,
  restrictTo('supplier'),
  uploadServiceFiles('images', 'serviceFile', 'services'), // Combined middleware
  updateService
);

// Delete a service
router.delete('/:serviceId', protect, restrictTo('supplier'), deleteService);

// Toggle service active status
router.patch('/:serviceId/toggle-active', protect, restrictTo('supplier'), toggleServiceActiveStatus);

// Get a specific service by ID
router.get('/:serviceId', protect, getServiceById);

// Filter services based on queries (name, category, active status, etc.)
router.get('/', protect, filterServices);

// Route to upload a single file with the service (documents like "approval" or "certificate")
router.post('/:serviceId/upload-file', 
  protect, 
  restrictTo('supplier'), 
  uploadServiceFiles('images', 'serviceFile', 'services'),
  uploadServiceFile // استخدم الدالة من الكنترولر
);

export default router;
