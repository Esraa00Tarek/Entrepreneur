// routes/offerRoutes.js

import express from 'express';
import {
  createOffer,
  updateOffer,
  getMyOffers,
  getOffersByRequest,
  getOffersByBusiness,
  getAcceptedReceivedOffers,
  getAcceptedSentOffers,
  getOfferById,
  acceptOffer,
  rejectOffer,
  deleteOffer,
  getAllOffers,
  withdrawOffer
} from '../controllers/OfferController.js';

import { protect } from '../middleware/authMiddleware.js';
import { uploadMultipleFilesToCloudinary } from '../middleware/upload.js';

const router = express.Router();

/**
 * @route   POST /api/offers/:requestId
 * @desc    Create offer on a request
 * @access  Private (supplier/investor)
 */
router.post(
  '/:requestId',
  protect,
  uploadMultipleFilesToCloudinary('files'),
  createOffer
);

/**
 * @route   PATCH /api/offers/:id
 * @desc    Update offer before acceptance
 * @access  Private (offer owner)
 */
router.patch(
  '/:id',
  protect,
  uploadMultipleFilesToCloudinary('files'),
  updateOffer
);

/**
 * @route   GET /api/offers/my
 * @desc    Get current user's submitted offers
 * @access  Private
 */
router.get('/my', protect, getMyOffers);

/**
 * @route   GET /api/offers/request/:requestId
 * @desc    Get offers submitted to a specific request
 * @access  Private (request creator)
 */
router.get('/request/:requestId', protect, getOffersByRequest);

/**
 * @route   GET /api/offers/business/:businessId
 * @desc    Get offers for a specific business
 * @access  Private (business owner)
 */
router.get('/business/:businessId', protect, getOffersByBusiness);

/**
 * @route   GET /api/offers/accepted-received
 * @desc    Get offers I received and accepted
 * @access  Private
 */
router.get('/accepted-received', protect, getAcceptedReceivedOffers);

/**
 * @route   GET /api/offers/accepted-sent
 * @desc    Get offers I sent and were accepted
 * @access  Private
 */
router.get('/accepted-sent', protect, getAcceptedSentOffers);

/**
 * @route   GET /api/offers/:id
 * @desc    Get single offer by ID
 * @access  Private (owner or request creator or admin)
 */
router.get('/:id', protect, getOfferById);

/**
 * @route   PATCH /api/offers/:id/accept
 * @desc    Accept offer
 * @access  Private (request creator)
 */
router.patch('/:id/accept', protect, acceptOffer);

/**
 * @route   PATCH /api/offers/:id/reject
 * @desc    Reject offer
 * @access  Private (request creator)
 */
router.patch('/:id/reject', protect, rejectOffer);

/**
 * @route   DELETE /api/offers/:id
 * @desc    Delete offer
 * @access  Private (offer owner or admin)
 */
router.delete('/:id', protect, deleteOffer);

/**
 * @route   PATCH /api/offers/:id/withdraw
 * @desc    Withdraw offer
 * @access  Private (offer owner)
 */
router.patch('/:id/withdraw', protect, withdrawOffer);

/**
 * @route   GET /api/offers
 * @desc    Get all offers (with filtering and pagination)
 * @access  Private
 */
router.get('/', protect, getAllOffers);

export default router;
