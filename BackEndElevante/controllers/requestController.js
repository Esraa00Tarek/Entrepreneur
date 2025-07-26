import Request from "../models/Request.js";
import Business from "../models/Business.js";
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import { notifyUser } from "../utils/notificationUtils.js";

// @desc    Create a new request (Investment or Supply/Service)
// @route   POST /api/requests
// @access  Private (Entrepreneur only)
export const createRequest = asyncHandler(async (req, res) => {
  // Check if req.body exists
  if (!req.body) {
    return res
      .status(400)
      .json({ success: false, message: "Request body is required" });
  }

  const {
    title,
    offerType,
    supplyType,
    description,
    quantity,
    category,
    deadline,
    amount,
    purpose,
    summary,
    returnDetails,
    businessId,
  } = req.body;

  // Validate required fields
  if (!title || !offerType || !category || !businessId) {
    return res.status(400).json({
      success: false,
      message: "title, offerType, category, and businessId are required",
    });
  }

  // Validate businessId
  if (!mongoose.Types.ObjectId.isValid(businessId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid business ID format" });
  }

  const business = await Business.findById(businessId);
  if (!business || !business.owner.equals(req.user._id)) {
    // Use .equals() for ObjectId comparison
    return res
      .status(403)
      .json({ success: false, message: "You do not own this business" });
  }

  const attachments = [];

  // Only add attachment if file was uploaded
  if (req.cloudinaryFileInfo) {
    const file = req.cloudinaryFileInfo;
    attachments.push({
      filename: file.public_id,
      originalName: req.file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: file.secure_url,
      uploadedAt: new Date(),
    });
  }

  // Convert incoming string IDs to ObjectId for consistency and relational integrity
  const createdBy =
    typeof req.user._id === "string"
      ? new mongoose.Types.ObjectId(req.user._id)
      : req.user._id;
  const businessIdObj =
    typeof businessId === "string"
      ? new mongoose.Types.ObjectId(businessId)
      : businessId;

  const newRequest = new Request({
    createdBy,
    business: businessIdObj,
    title,
    offerType,
    category,
    description,
    deadline,
    attachments,
  });

  if (offerType === "Supply") {
    newRequest.supplyType = supplyType;
    if (supplyType === "Product") newRequest.quantity = quantity;
  }

  if (offerType === "Investment") {
    newRequest.amount = amount;
    newRequest.purpose = purpose;
    newRequest.summary = summary;
    newRequest.returnDetails = returnDetails;
  }

  await newRequest.save();

  // After creating the request and before sending the response, notify the creator
  await notifyUser({
    userId: newRequest.createdBy,
    type: "request",
    title: "Your request has been created.",
    entityId: newRequest._id,
    entityType: "request",
    entityName: newRequest.title || "",
    redirectUrl: `/requests/${newRequest._id}`,
  });

  res.status(201).json({
    success: true,
    message: "Request created successfully",
    data: newRequest,
  });
});

// @desc    Get all requests of logged in entrepreneur
// @route   GET /api/requests/my
// @access  Private (Entrepreneur only)
export const getMyRequests = asyncHandler(async (req, res) => {
  // No need to check user id validity here because it comes from the token and is already validated by auth middleware
  const requests = await Request.find({ createdBy: req.user._id });
  res
    .status(200)
    .json({ success: true, count: requests.length, data: requests });
});

// @desc    Get request by ID
// @route   GET /api/requests/:id
// @access  Private (Owner or Admin)
export const getRequestById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid request ID format" });
  }
  const request = await Request.findById(req.params.id);

  if (!request) {
    return res
      .status(404)
      .json({ success: false, message: "Request not found" });
  }

  if (!request.createdBy.equals(req.user._id) && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  res.status(200).json({ success: true, data: request });
});

// @desc    Delete a request
// @route   DELETE /api/requests/:id
// @access  Private (Owner or Admin)
export const deleteRequest = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid request ID format" });
  }
  const request = await Request.findById(req.params.id);
  if (!request) {
    return res
      .status(404)
      .json({ success: false, message: "Request not found" });
  }

  if (!request.createdBy.equals(req.user._id) && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  await request.deleteOne();
  res
    .status(200)
    .json({ success: true, message: "Request deleted successfully" });
});

// @desc    Get all requests (with filters + pagination + keyword search)
// @route   GET /api/requests
// @access  Public or Role-based
export const getAllRequests = asyncHandler(async (req, res) => {
  const {
    offerType,
    category,
    business,
    owner,
    keyword,
    page = 1,
    limit = 10,
  } = req.query;

  const filters = {};

  if (offerType) filters.offerType = offerType;
  if (category) filters.category = category;
  if (business) filters.business = business;
  if (owner) filters.createdBy = owner;

  // احذف الفلترة حسب الدور
  // if (req.user?.role === 'supplier') filters.offerType = 'Supply';
  // if (req.user?.role === 'investor') filters.offerType = 'Investment';

  if (keyword) {
    filters.$or = [
      { title: { $regex: keyword, $options: "i" } },
      { description: { $regex: keyword, $options: "i" } },
    ];
  }

  filters.isOpen = true;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [requests, total] = await Promise.all([
    Request.find(filters).skip(skip).limit(parseInt(limit)),
    Request.countDocuments(filters),
  ]);

  res.status(200).json({
    success: true,
    count: requests.length,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / limit),
    data: requests,
  });
});

// @desc    Update a request
// @route   PATCH /api/requests/:id
// @access  Private (Owner only)
export const updateRequest = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid request ID format" });
  }
  const request = await Request.findById(req.params.id);
  if (!request) {
    return res
      .status(404)
      .json({ success: false, message: "Request not found" });
  }

  if (!request.createdBy.equals(req.user._id)) {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  const allowedFields = [
    "title",
    "description",
    "category",
    "deadline",
    "supplyType",
    "quantity",
    "amount",
    "purpose",
    "summary",
    "returnDetails",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      request[field] = req.body[field];
    }
  });

  await request.save();
  res.status(200).json({ success: true, data: request });
});

// @desc    Add attachment to existing request
// @route   PATCH /api/requests/:id/attachments
// @access  Private (Owner only)
export const addAttachmentToRequest = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid request ID format" });
  }
  const request = await Request.findById(req.params.id);
  if (!request) {
    return res
      .status(404)
      .json({ success: false, message: "Request not found" });
  }

  if (!request.createdBy.equals(req.user._id)) {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  if (!req.cloudinaryFileInfo) {
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });
  }
  const file = req.cloudinaryFileInfo;
  const newAttachment = {
    filename: file.public_id,
    originalName: req.file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    url: file.secure_url,
    uploadedAt: new Date(),
  };
  request.attachments.push(newAttachment);
  await request.save();

  res
    .status(200)
    .json({ success: true, message: "Attachment added", data: request });
});

// Get all requests (admin only)
export const getAllRequestsAdmin = asyncHandler(async (req, res) => {
  try {
    const requests = await Request.find()
      .populate("createdBy")
      .populate("business")
      .sort({ createdAt: -1 });
    res
      .status(200)
      .json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch all requests" });
  }
});
