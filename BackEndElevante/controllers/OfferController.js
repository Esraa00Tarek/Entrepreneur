// controllers/offerController.js

import Offer from "../models/Offer.js";
import Request from "../models/Request.js";
import asyncHandler from "express-async-handler";
import { notifyUser } from "../Utilies/notifyUser.js";
import ActivityLog from "../models/ActivityLog.js";
import { uploader } from "cloudinary"; // cloudinary SDK
import mongoose from "mongoose";
import Deal from "../models/Deal.js";
import Order from "../models/Order.js";

// ✅ Get all offers (filterable + pagination)
// @desc    Get all offers with filters
// @route   GET /api/offers
// @access  Private (admin or request owner or offeredBy)
export const getAllOffers = asyncHandler(async (req, res) => {
  const {
    request,
    offeredBy,
    offerType,
    status,
    keyword,
    page = 1,
    limit = 10,
  } = req.query;

  const filter = {};

  if (request) filter.request = request;
  if (offeredBy) filter.offeredBy = offeredBy;
  if (offerType) filter.offerType = offerType;
  if (status) filter.status = status;

  if (keyword) {
    filter.$or = [
      { description: { $regex: keyword, $options: "i" } },
      { message: { $regex: keyword, $options: "i" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const total = await Offer.countDocuments(filter);
  const offers = await Offer.find(filter)
    .populate("offeredBy", "name role")
    .populate("requestId", "title offerType")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.status(200).json({
    success: true,
    count: offers.length,
    page: Number(page),
    pages: Math.ceil(total / limit),
    total,
    data: offers,
  });
});

// @desc    Get single offer by ID
// @route   GET /api/offers/:id
// @access  Private (offer owner or request owner or admin)
export const getOfferById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid offer ID format" });
  }
  const offer = await Offer.findById(req.params.id)
    .populate("offeredBy", "name role")
    .populate("requestId", "title offerType createdBy");

  if (!offer) {
    return res.status(404).json({ success: false, message: "Offer not found" });
  }

  // Check if request exists for requestId
  if (!offer.requestId) {
    return res
      .status(404)
      .json({ success: false, message: "Related request not found" });
  }

  const isOwner = offer.offeredBy._id.equals(req.user._id);
  const isRequestOwner = offer.requestId.createdBy.equals(req.user._id);
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isRequestOwner && !isAdmin) {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  res.status(200).json({ success: true, data: offer });
});

// @desc    Create offer on a request
// @route   POST /api/offers/:requestId
// @access  Private (supplier or investor)
export const createOffer = asyncHandler(async (req, res) => {
  // Validate requestId
  if (!mongoose.Types.ObjectId.isValid(req.params.requestId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid request ID format" });
  }
  const requestIdObj = req.params.requestId;
  const offeredBy = req.user._id;
  const { amount, message } = req.body;
  const attachments = req.attachments || [];

  // Check if the request exists and is open
  const request = await Request.findById(requestIdObj);
  if (!request || !request.isOpen) {
    return res.status(404).json({
      success: false,
      message: "Request not found or not available to receive any offers",
    });
  }

  // Prevent duplicate offer from same user on same request
  const existing = await Offer.findOne({
    requestId: requestIdObj,
    offeredBy: offeredBy,
  });
  if (existing) {
    return res.status(400).json({
      success: false,
      message: "You have already submitted an offer to this request.",
    });
  }

  let items = req.body.items;
  if (typeof items === "string") {
    try {
      items = JSON.parse(items);
    } catch (e) {
      items = [];
    }
  }
  if (Array.isArray(items)) {
    items = items.map((item) => ({
      ...item,
      itemId: mongoose.Types.ObjectId.isValid(item.itemId)
        ? item.itemId
        : undefined,
    }));
  }

  const offer = new Offer({
    requestId: requestIdObj,
    amount,
    message,
    attachments,
    offeredBy,
    offeredByRole: req.user.role,
    offerType: request.offerType,
    items: items || [],
  });

  await offer.save();

  await notifyUser({
    userId: request.createdBy,
    type: "offer",
    title: `${req.user.role} submitted a new offer on your request`,
    actionUser: req.user._id.toString(),
    actionUserName:
      req.user.fullName || req.user.username || req.user.email || "Unknown",
    actionUserAvatar: req.user.avatar || "",
    entityType: "offer",
    entityId: offer._id.toString(),
    entityName: offer.title || "",
    redirectUrl: `/offers/${offer._id}`,
  });

  await ActivityLog.create({
    userId: req.user._id,
    actionType: "create_offer",
    targetType: "offer",
    targetId: offer._id,
  });

  res.status(201).json({ success: true, data: offer });
});

export const updateOffer = asyncHandler(async (req, res) => {
  // Validate offer id
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid offer ID format" });
  }
  const offerId = req.params.id;
  const {
    price,
    description,
    equityPercentage,
    durationInDays,
    items,
    attachmentsToDelete,
  } = req.body;

  // Check if the offer exists
  const offer = await Offer.findById(offerId);
  if (!offer)
    return res.status(404).json({ success: false, message: "Offer not found" });

  if (!offer.offeredBy.equals(req.user._id)) {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  if (price !== undefined) offer.price = price;
  if (description !== undefined) offer.description = description;
  if (equityPercentage !== undefined) offer.equityPercentage = equityPercentage;
  if (durationInDays !== undefined) offer.durationInDays = durationInDays;
  if (items !== undefined) offer.items = items;

  // Delete specific attachments
  if (attachmentsToDelete && Array.isArray(attachmentsToDelete)) {
    offer.attachments = offer.attachments.filter((att) => {
      const shouldDelete = attachmentsToDelete.includes(att.public_id);
      if (shouldDelete) uploader.destroy(att.public_id).catch(() => {});
      return !shouldDelete;
    });
  }

  // Add new attachments from middleware
  if (req.attachments && req.attachments.length > 0) {
    offer.attachments.push(...req.attachments);
  }

  offer.updatedAt = Date.now();
  await offer.save();

  await ActivityLog.create({
    userId: req.user._id,
    actionType: "update_offer",
    targetType: "offer",
    targetId: offer._id,
  });

  res.status(200).json({
    success: true,
    message: "Offer updated successfully",
    data: offer,
  });
});

// @desc    Get offers submitted by current user
// @route   GET /api/offers/my
// @access  Private
export const getMyOffers = asyncHandler(async (req, res) => {
  // No need to check user id validity here because it comes from the token and is already validated by auth middleware
  const offers = await Offer.find({ offeredBy: req.user._id }).populate(
    "requestId",
    "title offerType createdBy"
  );

  res.status(200).json({ success: true, count: offers.length, data: offers });
});

// @desc    Get offers received on a specific request
// @route   GET /api/offers/request/:requestId
// @access  Private (request creator)
export const getOffersByRequest = asyncHandler(async (req, res) => {
  // Validate requestId
  if (!mongoose.Types.ObjectId.isValid(req.params.requestId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid request ID format" });
  }
  const request = await Request.findById(req.params.requestId);
  if (!request) {
    return res
      .status(404)
      .json({ success: false, message: "Request not found" });
  }
  if (!request.createdBy.equals(req.user._id)) {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  const offers = await Offer.find({ requestId: req.params.requestId }).populate(
    "offeredBy",
    "name role"
  );

  res.status(200).json({ success: true, count: offers.length, data: offers });
});

// @desc    Accept an offer
// @route   PATCH /api/offers/:id/accept
// @access  Private (request creator)
export const acceptOffer = asyncHandler(async (req, res) => {
  // Validate offer id
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid offer ID format" });
  }
  const offer = await Offer.findById(req.params.id);
  if (!offer) {
    return res.status(404).json({ success: false, message: "Offer not found" });
  }
  // Check if related request exists
  const request = await Request.findById(offer.requestId);
  if (!request) {
    return res
      .status(404)
      .json({ success: false, message: "Related request not found" });
  }
  if (!request.createdBy.equals(req.user._id)) {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to perform this action",
    });
  }

  if (offer.status === "accepted") {
    return res
      .status(400)
      .json({ success: false, message: "Offer already accepted" });
  }

  // Mark this offer as accepted, others as rejected
  offer.status = "accepted";
  await offer.save();

  await Offer.updateMany(
    { requestId: offer.requestId._id, _id: { $ne: offer._id } },
    { $set: { status: "rejected" } }
  );

  try {
    request.isOpen = false;
    await request.save();

    // أنشئ صفقة (Deal) دائماً عند قبول الأوفر، مع roles متوافقة مع schema
    const newDeal = await Deal.create({
      participants: [
        { user: offer.offeredBy, role: "investor" },
        { user: request.createdBy, role: "entrepreneur" },
      ],
      initiatedBy: request.createdBy,
      relatedBusiness: request.business,
      relatedRequest: request._id,
      sourceType: "offer",
      sourceId: offer._id,
      dealType: "Investment",
      description: offer.description,
      amount: offer.amount || offer.price || 0,
      status: "pending",
    });
    console.log("DEBUG: Deal created:", newDeal);
  } catch (err) {
    offer.status = "pending";
    await offer.save();
    return res.status(500).json({
      success: false,
      message: "Failed to process offer acceptance. Offer acceptance reverted.",
    });
  }

  await notifyUser({
    userId: offer.offeredBy,
    type: "offer",
    title: "Your offer has been accepted.",
    relatedEntityId: offer._id,
  });

  await ActivityLog.create({
    userId: req.user._id,
    actionType: "accept_offer",
    targetType: "offer",
    targetId: offer._id,
  });

  res
    .status(200)
    .json({ success: true, message: "Offer accepted", data: offer });
});

// @desc    Reject offer manually
// @route   PATCH /api/offers/:id/reject
// @access  Private (request creator)
export const rejectOffer = asyncHandler(async (req, res) => {
  // Validate offer id
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid offer ID format" });
  }
  const offer = await Offer.findById(req.params.id).populate("requestId");
  if (!offer) {
    return res.status(404).json({ success: false, message: "Offer not found" });
  }
  if (!offer.requestId || !offer.requestId.createdBy.equals(req.user._id)) {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  if (offer.status !== "pending") {
    return res
      .status(400)
      .json({ success: false, message: "Only pending offers can be rejected" });
  }

  offer.status = "rejected";
  await offer.save();

  await notifyUser({
    userId: offer.offeredBy,
    type: "offer",
    title: "Your offer has been rejected.",
    relatedEntityId: offer._id,
  });

  await ActivityLog.create({
    userId: req.user._id,
    actionType: "reject_offer",
    targetType: "offer",
    targetId: offer._id,
  });

  res.status(200).json({ success: true, message: "Offer rejected" });
});

// @desc    Delete offer (only by owner or admin)
// @route   DELETE /api/offers/:id
// @access  Private
export const deleteOffer = asyncHandler(async (req, res) => {
  // Validate offer id
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid offer ID format" });
  }
  const offer = await Offer.findById(req.params.id);
  if (!offer) {
    return res.status(404).json({ success: false, message: "Offer not found" });
  }

  if (!offer.offeredBy.equals(req.user._id) && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  await offer.deleteOne();

  await ActivityLog.create({
    userId: req.user._id,
    actionType: "delete_offer",
    targetType: "offer",
    targetId: offer._id,
  });

  res.status(200).json({ success: true, message: "Offer deleted" });
});

export const withdrawOffer = asyncHandler(async (req, res) => {
  // Validate offer id
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid offer ID format" });
  }
  const offer = await Offer.findById(req.params.id);
  if (!offer)
    return res.status(404).json({ success: false, message: "Offer not found" });
  // Only the offer creator can withdraw
  if (!offer.offeredBy.equals(req.user._id)) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to withdraw this offer",
    });
  }
  if (offer.status !== "pending") {
    return res
      .status(400)
      .json({ success: false, message: "Offer cannot be withdrawn" });
  }

  offer.status = "withdrawn";
  await offer.save();

  // Notify the recipient in real time and remove notification
  await notifyUser({
    userId: offer.offeredBy.toString(), // Assuming offeredBy is the recipient for withdrawal
    type: "offer",
    title: `An offer was withdrawn by ${
      req.user.fullName || req.user.username || req.user.email || "Unknown"
    }`,
    actionUser: req.user._id.toString(),
    actionUserName:
      req.user.fullName || req.user.username || req.user.email || "Unknown",
    actionUserAvatar: req.user.avatar || "",
    entityType: "offer",
    entityId: offer._id.toString(),
    entityName: offer.title || "",
    redirectUrl: `/offers/${offer._id}`,
    options: { withdrawn: true },
  });

  res.status(200).json({
    success: true,
    message: "Offer withdrawn successfully",
    data: offer,
  });
});
