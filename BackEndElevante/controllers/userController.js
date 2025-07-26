import User from "../models/User.js";
import { notifyUser } from "../Utilies/notifyUser.js";
import sendEmail from "../Utilies/sendEmail.js";
import { generateStatusEmail } from "../Utilies/emailTemplates.js";
import ActivityLog from "../models/ActivityLog.js";
import jwt from "jsonwebtoken";
import { uploadToCloudinary } from "../Utilies/cloudinary.js";
import { deleteFromCloudinary } from "../Utilies/cloudinary.js";
import WithdrawalRequest from "../models/WithdrawalRequest.js";
import Dispute from "../models/Dispute.js";
import Deal from "../models/Deal.js";
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import crypto from "crypto";

// Register user
export const registerUser = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      confirmPassword,
      pitchDeckLink,
      companyProfileLink,
    } = req.body;

    // Check for required password fields
    if (!password || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "Password and confirm password are required." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Username or email already exists" });
    }

    // رفع الملفات (بطاقة + Pitch Deck)
    const idCardFront = req.files?.idCardFront?.[0];
    const idCardBack = req.files?.idCardBack?.[0];
    const pitchDeckFile = req.files?.pitchDeckFile?.[0];
    const companyProfileFile = req.files?.companyProfile?.[0];

    if (!idCardFront || !idCardBack) {
      return res.status(400).json({ message: "ID card images are required." });
    }

    // رفع الصور لـ Cloudinary
    const idFrontResult = await uploadToCloudinary(
      idCardFront.buffer,
      idCardFront.originalname,
      idCardFront.mimetype,
      "id_cards"
    );

    const idBackResult = await uploadToCloudinary(
      idCardBack.buffer,
      idCardBack.originalname,
      idCardBack.mimetype,
      "id_cards"
    );

    let pitchDeckResult = null;

    if (pitchDeckFile) {
      pitchDeckResult = await uploadToCloudinary(
        pitchDeckFile.buffer,
        pitchDeckFile.originalname,
        pitchDeckFile.mimetype,
        "pitch_decks"
      );
    }
    let companyProfileResult = null;
    if (companyProfileFile) {
      companyProfileResult = await uploadToCloudinary(
        companyProfileFile.buffer,
        companyProfileFile.originalname,
        companyProfileFile.mimetype,
        "company_profiles"
      );
    }
    // إعداد الحالة لو Admin
    if (req.body.role === "admin") {
      req.body.status = "approved";
    }

    // إنشاء المستخدم
    const user = await User.create({
      ...req.body,
      idCardFront: idFrontResult.secure_url,
      idCardBack: idBackResult.secure_url,
      pitchDeckFile: pitchDeckResult?.secure_url || null,
      pitchDeckLink: !pitchDeckResult ? pitchDeckLink : null, // استخدم الرابط لو الملف مش موجود
      companyProfileFile: companyProfileResult?.secure_url || null,
      companyProfileLink: !companyProfileResult ? companyProfileLink : null,
    });

    // Send welcome notification in-app
    await notifyUser({
      userId: user._id,
      type: 'manual',
      title: 'Welcome to Elevante! Your account has been created. You will receive notifications about your projects and deals here.',
      entityType: 'user',
      entityId: user._id,
      entityName: user.fullName || user.username || user.email || '',
      redirectUrl: '/dashboard'
    });

    // إرسال إيميل في حالة مش Admin
    if (user.role !== "admin") {
      const { subject, html } = generateStatusEmail(user.fullName, "pending");
      await sendEmail({ to: user.email, subject, html });
    }

    const response =
      user.role === "admin"
        ? {
            message: "Admin registered successfully.",
            userId: user._id,
          }
        : {
            message: "User registered successfully. Awaiting admin approval.",
            userId: user._id,
          };

    res.status(201).json(response);
  } catch (error) {
    console.error("Registration error:", error);
    res
      .status(500)
      .json({ message: "Server error during registration", error });
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    const { login, password } = req.body; // login يمكن أن يكون username أو email

    // التحقق إذا كان المستخدم هو بالـ email أو الـ username
    let user;
    if (login.includes("@")) {
      // إذا كان login يحتوي على '@'، نعتبره إيميل
      user = await User.findOne({ email: login });
    } else {
      // إذا كان لا يحتوي على '@'، نعتبره username
      user = await User.findOne({ username: login });
    }

    if (!user)
      return res.status(400).json({ message: "Invalid username or email" });

    // منع تسجيل الدخول إذا كان الحساب محذوفًا
    if (user.isDeleted) {
      return res
        .status(403)
        .json({ message: "This account has been deleted." });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid username or password" });

    if (user.status !== "approved") {
      return res.status(403).json({
        message: "Your account has not been approved yet.",
        status: user.status,
        rejectionReason: user.rejectionReason || null,
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        message: "Your account is blocked.",
        reason: user.blockReason || "Blocked by admin",
      });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET
    );
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// Logout
export const logoutUser = async (req, res) => {
  try {
    res.status(200).json({ message: "Logout successful." });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error during logout" });
  }
};

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    let users;
    if (req.user.role === "admin") {
      users = await User.find().select("-password");
    } else {
      users = await User.find({ isDeleted: false }).select("-password");
    }
    res.status(200).json(users);
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Server error fetching users" });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    if (!user || user.isDeleted)
      return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({ message: "Server error fetching user" });
  }
};

// Block a user (admin only)
export const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { blockReason } = req.body;
    if (!blockReason)
      return res.status(400).json({ message: "Block reason is required" });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin")
      return res.status(400).json({ message: "Cannot block another admin." });
    if (user._id.equals(req.user._id))
      return res.status(400).json({ message: "Admin cannot block himself." }); // Use .equals() for ObjectId comparison
    user.isBlocked = true;
    user.blockReason = blockReason;
    user.blockedAt = new Date();
    user.blockExpiresAt = null;
    await user.save();
    // سجل النشاط
    await ActivityLog.create({
      userId:
        typeof req.user._id === "string"
          ? new mongoose.Types.ObjectId(req.user._id)
          : req.user._id,
      actionType: "block_user",
      targetType: "user",
      targetId:
        typeof userId === "string"
          ? new mongoose.Types.ObjectId(userId)
          : userId,
      metadata: { blockReason },
    });
    res
      .status(200)
      .json({ message: "User has been blocked", userId: user._id });
  } catch (error) {
    console.error("Block user error:", error);
    res.status(500).json({ message: "Server error blocking user" });
  }
};

// Unblock a user (admin only)
export const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin")
      return res.status(400).json({ message: "Cannot unblock another admin." });
    user.isBlocked = false;
    user.blockReason = "";
    user.blockedAt = null;
    user.blockExpiresAt = null;
    await user.save();
    // سجل النشاط
    await ActivityLog.create({
      userId:
        typeof req.user._id === "string"
          ? new mongoose.Types.ObjectId(req.user._id)
          : req.user._id,
      actionType: "unblock_user",
      targetType: "user",
      targetId:
        typeof userId === "string"
          ? new mongoose.Types.ObjectId(userId)
          : userId,
    });
    res
      .status(200)
      .json({ message: "User has been unblocked", userId: user._id });
  } catch (error) {
    console.error("Unblock user error:", error);
    res.status(500).json({ message: "Server error unblocking user" });
  }
};

// Admin: Soft delete user (not himself, not admin)
export const softDeleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ message: "User not found or already deleted" });
    if (user.role === "admin")
      return res.status(400).json({ message: "Cannot delete another admin." });
    if (user._id.equals(req.user._id))
      return res.status(400).json({ message: "Admin cannot delete himself." }); // Use .equals() for ObjectId comparison
    if (user.isDeleted)
      return res.status(400).json({ message: "User already deleted." });
    user.isDeleted = true;
    await user.save();
    // سجل النشاط
    await ActivityLog.create({
      userId:
        typeof req.user._id === "string"
          ? new mongoose.Types.ObjectId(req.user._id)
          : req.user._id,
      actionType: "soft_delete_user",
      targetType: "user",
      targetId:
        typeof userId === "string"
          ? new mongoose.Types.ObjectId(userId)
          : userId,
    });
    res
      .status(200)
      .json({ message: "User soft deleted successfully", userId: user._id });
  } catch (error) {
    console.error("Soft delete user error:", error);
    res.status(500).json({ message: "Server error soft deleting user" });
  }
};

// Approve or Reject user
export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action, rejectionReason } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (action === "approve") {
      user.status = "approved";
      user.rejectionReason = "";
    } else if (action === "reject") {
      if (!rejectionReason) {
        return res
          .status(400)
          .json({ message: "Rejection reason is required" });
      }
      user.status = "rejected";
      user.rejectionReason = rejectionReason;
    } else if (action === "pending") {
      user.status = "pending";
      user.rejectionReason = "";
    } else {
      return res
        .status(400)
        .json({ message: "Invalid action. Use approve or reject" });
    }

    await user.save();
    const { subject, html } = generateStatusEmail(
      user.fullName,
      user.status,
      rejectionReason
    );
    await sendEmail({ to: user.email, subject, html });
    res
      .status(200)
      .json({ message: `User ${action}d successfully`, userId: user._id });
  } catch (error) {
    console.error("Update user status error:", error);
    res.status(500).json({ message: "Server error updating user status" });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    Object.assign(user, req.body); // كن حذرًا، يمكن تحسين ذلك بالتحقق من الحقول المسموح بها
    await user.save();

    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error updating profile" });
  }
};

// Delete user account (for the logged-in user)
export const deleteUserAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || user.isDeleted)
      return res.status(404).json({ message: "User not found" });
    user.isDeleted = true;
    await user.save();
    // إشعار الأدمن
    await notifyUser({
      userId: null,
      type: "user",
      title: `User ${user.username} deleted their account.`,
    });
    // تسجيل الحدث
    await ActivityLog.create({
      userId:
        typeof req.user._id === "string"
          ? new mongoose.Types.ObjectId(req.user._id)
          : req.user._id,
      actionType: "delete_user",
      targetType: "user",
      targetId:
        typeof req.user._id === "string"
          ? new mongoose.Types.ObjectId(req.user._id)
          : req.user._id,
    });
    res.status(200).json({ message: "User account deleted successfully" });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({ message: "Server error deleting account" });
  }
};

// Restore user (admin only)
export const restoreUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can restore users." });
    }
    const user = await User.findById(req.params.userId);
    if (!user || !user.isDeleted)
      return res
        .status(404)
        .json({ message: "User not found or not deleted." });
    user.isDeleted = false;
    await user.save();
    // إشعار المستخدم
    await notifyUser({
      userId: user._id,
      type: "user",
      title: "Your account was restored by admin.",
    });
    // تسجيل الحدث
    await ActivityLog.create({
      userId:
        typeof req.user._id === "string"
          ? new mongoose.Types.ObjectId(req.user._id)
          : req.user._id,
      actionType: "restore_user",
      targetType: "user",
      targetId:
        typeof req.params.userId === "string"
          ? new mongoose.Types.ObjectId(req.params.userId)
          : req.params.userId,
    });
    res.status(200).json({ message: "User restored successfully", user });
  } catch (error) {
    console.error("Restore user error:", error);
    res.status(500).json({ message: "Server error restoring user" });
  }
};

// Admin Dashboard Stats
export const adminDashboardStats = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admin can access dashboard stats." });
    }
    // Count users by role
    const totalUsers = await User.countDocuments();
    const entrepreneurs = await User.countDocuments({ role: "entrepreneur" });
    const suppliers = await User.countDocuments({ role: "supplier" });
    const investors = await User.countDocuments({ role: "investor" });
    const admins = await User.countDocuments({ role: "admin" });

    // Count deals, requests, offers, orders, direct requests, products, services
    const Deal = (await import("../models/Deal.js")).default;
    const Request = (await import("../models/Request.js")).default;
    const Offer = (await import("../models/Offer.js")).default;
    const Order = (await import("../models/Order.js")).default;
    const DirectRequest = (await import("../models/DirectRequest.js")).default;
    const Product = (await import("../models/Product.js")).default;
    const Service = (await import("../models/Service.js")).default;
    const ActivityLog = (await import("../models/ActivityLog.js")).default;
    const Milestone = (await import("../models/Milestone.js")).default;
    const Business = (await import("../models/Business.js")).default;

    const totalDeals = await Deal.countDocuments();
    const totalRequests = await Request.countDocuments();
    const totalOffers = await Offer.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalDirectRequests = await DirectRequest.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalServices = await Service.countDocuments();

    // Pending Approvals
    const pendingUsers = await User.countDocuments({ status: "pending" });
    let pendingRequests = 0;
    if (Request.schema.paths.status) {
      pendingRequests = await Request.countDocuments({ status: "pending" });
    }

    // Request Status
    let requestStatusCounts = [];
    if (Request.schema.paths.status) {
      requestStatusCounts = await Request.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]);
    }

    // Active Phases
    let activeMilestones = 0;
    if (Milestone.schema.paths.status) {
      activeMilestones = await Milestone.countDocuments({ status: "active" });
    }
    let activeBusinesses = 0;
    if (Business.schema.paths.status) {
      activeBusinesses = await Business.countDocuments({ status: "active" });
    }

    // Daily activity (last 7 days)
    const today = new Date();
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      day.setHours(0, 0, 0, 0);
      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);
      const count = await ActivityLog.countDocuments({
        createdAt: { $gte: day, $lt: nextDay },
      });
      last7Days.push({ date: day.toISOString().slice(0, 10), count });
    }

    res.json({
      users: { total: totalUsers, entrepreneurs, suppliers, investors, admins },
      deals: totalDeals,
      requests: totalRequests,
      offers: totalOffers,
      orders: totalOrders,
      directRequests: totalDirectRequests,
      products: totalProducts,
      services: totalServices,
      activityLast7Days: last7Days,
      pendingApprovals: {
        users: pendingUsers,
        requests: pendingRequests,
      },
      requestStatus: requestStatusCounts,
      activePhases: {
        milestones: activeMilestones,
        businesses: activeBusinesses,
      },
    });
  } catch (error) {
    console.error("Admin dashboard stats error:", error);
    res.status(500).json({ message: "Server error fetching dashboard stats" });
  }
};

// Admin: Change user role (entrepreneur, supplier, investor only)
export const changeUserRole = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admin can change user roles." });
    }
    const { userId } = req.params;
    const { newRole } = req.body;
    const allowedRoles = ["entrepreneur", "supplier", "investor"];
    if (!allowedRoles.includes(newRole)) {
      return res
        .status(400)
        .json({
          message: "Invalid role. Allowed: entrepreneur, supplier, investor.",
        });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    if (user.role === "admin") {
      return res
        .status(400)
        .json({ message: "Cannot change role for admin users." });
    }
    if (user.role === newRole) {
      return res.status(400).json({ message: "User already has this role." });
    }
    // تحقق من البيانات المطلوبة للدور الجديد (بسيط)
    if (newRole === "entrepreneur" && !user.startupName) {
      return res
        .status(400)
        .json({ message: "Missing startupName for entrepreneur role." });
    }
    if (newRole === "supplier" && !user.supplierType) {
      return res
        .status(400)
        .json({ message: "Missing supplierType for supplier role." });
    }
    if (newRole === "investor" && !user.investmentRange) {
      return res
        .status(400)
        .json({ message: "Missing investmentRange for investor role." });
    }
    const oldRole = user.role;
    user.role = newRole;
    await user.save();
    // سجل النشاط
    await ActivityLog.create({
      userId:
        typeof req.user._id === "string"
          ? new mongoose.Types.ObjectId(req.user._id)
          : req.user._id,
      actionType: "change_user_role",
      targetType: "user",
      targetId:
        typeof userId === "string"
          ? new mongoose.Types.ObjectId(userId)
          : userId,
      metadata: { oldRole, newRole },
    });
    res.json({
      message: "User role updated successfully.",
      userId: user._id,
      oldRole,
      newRole,
    });
  } catch (error) {
    console.error("Change user role error:", error);
    res.status(500).json({ message: "Server error changing user role" });
  }
};

// Admin: Get all uploaded files from all entities
export const getAllUploadedFiles = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admin can access uploaded files." });
    }
    // استيراد الموديلات
    const Business = (await import("../models/Business.js")).default;
    const Milestone = (await import("../models/Milestone.js")).default;
    const Deal = (await import("../models/Deal.js")).default;
    const Request = (await import("../models/Request.js")).default;
    const Offer = (await import("../models/Offer.js")).default;
    const Message = (await import("../models/Message.js")).default;
    const DirectRequest = (await import("../models/DirectRequest.js")).default;
    // User files
    const users = await User.find(
      {},
      "idCardFront idCardBack pitchDeckFile companyProfileFile fullName username email"
    );
    const userFiles = users.flatMap((u) =>
      [
        u.idCardFront
          ? {
              url: u.idCardFront,
              owner: u._id,
              ownerName: u.fullName,
              type: "User",
              field: "idCardFront",
            }
          : null,
        u.idCardBack
          ? {
              url: u.idCardBack,
              owner: u._id,
              ownerName: u.fullName,
              type: "User",
              field: "idCardBack",
            }
          : null,
        u.pitchDeckFile
          ? {
              url: u.pitchDeckFile,
              owner: u._id,
              ownerName: u.fullName,
              type: "User",
              field: "pitchDeckFile",
            }
          : null,
        u.companyProfileFile
          ? {
              url: u.companyProfileFile,
              owner: u._id,
              ownerName: u.fullName,
              type: "User",
              field: "companyProfileFile",
            }
          : null,
      ].filter(Boolean)
    );
    // Business files
    const businesses = await Business.find({}, "files owner name");
    const businessFiles = businesses.flatMap((b) =>
      (b.files || []).map((f) => ({
        ...f._doc,
        owner: b.owner,
        type: "Business",
        businessName: b.name,
      }))
    );
    // Milestone files
    const milestones = await Milestone.find({}, "files createdBy title");
    const milestoneFiles = milestones.flatMap((m) =>
      (m.files || []).map((f) => ({
        ...f._doc,
        owner: m.createdBy,
        type: "Milestone",
        milestoneTitle: m.title,
      }))
    );
    // Deal attachments
    const deals = await Deal.find({}, "attachments participants");
    const dealFiles = deals.flatMap((d) =>
      (d.attachments || []).map((f) => ({
        ...f._doc,
        owner: d.participants?.[0]?.user,
        type: "Deal",
      }))
    );
    // Request attachments
    const requests = await Request.find({}, "attachments createdBy title");
    const requestFiles = requests.flatMap((r) =>
      (r.attachments || []).map((f) => ({
        ...f._doc,
        owner: r.createdBy,
        type: "Request",
        requestTitle: r.title,
      }))
    );
    // Offer attachments
    const offers = await Offer.find({}, "attachments offeredBy");
    const offerFiles = offers.flatMap((o) =>
      (o.attachments || []).map((f) => ({
        ...f._doc,
        owner: o.offeredBy,
        type: "Offer",
      }))
    );
    // Message attachments
    const messages = await Message.find({}, "attachments senderId");
    const messageFiles = messages.flatMap((m) =>
      (m.attachments || []).map((f) => ({
        ...f._doc,
        owner: m.senderId,
        type: "Message",
      }))
    );
    // DirectRequest attachments
    const directRequests = await DirectRequest.find(
      {},
      "attachments initiatedBy"
    );
    const directRequestFiles = directRequests.flatMap((d) =>
      (d.attachments || []).map((f) => ({
        ...f._doc,
        owner: d.initiatedBy,
        type: "DirectRequest",
      }))
    );
    // دمج كل الملفات
    const allFiles = [
      ...userFiles,
      ...businessFiles,
      ...milestoneFiles,
      ...dealFiles,
      ...requestFiles,
      ...offerFiles,
      ...messageFiles,
      ...directRequestFiles,
    ];
    res.json({ count: allFiles.length, files: allFiles });
  } catch (error) {
    console.error("Get all uploaded files error:", error);
    res.status(500).json({ message: "Server error fetching uploaded files" });
  }
};

// Admin: Delete uploaded file from any entity
export const deleteUploadedFile = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admin can delete uploaded files." });
    }
    const { entityType, entityId, fileField, fileUrl, public_id } = req.body;
    // تحقق من نوع الكيان
    const models = {
      User: (await import("../models/User.js")).default,
      Business: (await import("../models/Business.js")).default,
      Milestone: (await import("../models/Milestone.js")).default,
      Deal: (await import("../models/Deal.js")).default,
      Request: (await import("../models/Request.js")).default,
      Offer: (await import("../models/Offer.js")).default,
      Message: (await import("../models/Message.js")).default,
      DirectRequest: (await import("../models/DirectRequest.js")).default,
    };
    const Model = models[entityType];
    if (!Model) return res.status(400).json({ message: "Invalid entityType." });
    const doc = await Model.findById(entityId);
    if (!doc) return res.status(404).json({ message: "Entity not found." });
    let removed = false;
    // حذف من Cloudinary إذا وجد public_id
    if (public_id) {
      try {
        await deleteFromCloudinary(public_id);
      } catch (e) {
        /* تجاهل الخطأ */
      }
    }
    // حذف من قاعدة البيانات حسب نوع الحقل
    if (entityType === "User") {
      if (fileField && doc[fileField] && doc[fileField] === fileUrl) {
        doc[fileField] = undefined;
        removed = true;
      }
    } else if (["Business", "Milestone"].includes(entityType)) {
      if (Array.isArray(doc.files)) {
        doc.files = doc.files.filter(
          (f) => (f.url || f.filename) !== fileUrl && f.public_id !== public_id
        );
        removed = true;
      }
    } else if (["Deal", "Request", "Offer"].includes(entityType)) {
      if (Array.isArray(doc.attachments)) {
        doc.attachments = doc.attachments.filter(
          (f) => f.url !== fileUrl && f.public_id !== public_id
        );
        removed = true;
      }
    } else if (entityType === "Message") {
      if (Array.isArray(doc.attachments)) {
        doc.attachments = doc.attachments.filter(
          (f) => f.url !== fileUrl && f.public_id !== public_id
        );
        removed = true;
      }
    } else if (entityType === "DirectRequest") {
      if (Array.isArray(doc.attachments)) {
        doc.attachments = doc.attachments.filter(
          (f) => f.url !== fileUrl && f.public_id !== public_id
        );
        removed = true;
      }
    }
    if (removed) {
      await doc.save();
      await ActivityLog.create({
        userId:
          typeof req.user._id === "string"
            ? new mongoose.Types.ObjectId(req.user._id)
            : req.user._id,
        actionType: "delete_uploaded_file",
        targetType: entityType,
        targetId:
          typeof entityId === "string"
            ? new mongoose.Types.ObjectId(entityId)
            : entityId,
        metadata: { fileUrl, public_id, fileField },
      });
      return res.json({ message: "File deleted successfully." });
    } else {
      return res
        .status(400)
        .json({ message: "File not found or already deleted." });
    }
  } catch (error) {
    console.error("Delete uploaded file error:", error);
    res.status(500).json({ message: "Server error deleting uploaded file" });
  }
};

// ملخص العمليات المالية والتنفيذية للإدارة
export const getFinancialOverview = asyncHandler(async (req, res) => {
  if (!req.user || req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Only admin can access this overview." });
  }
  const { status } = req.query;
  // سحوبات
  const withdrawals = await WithdrawalRequest.find(
    status ? { status } : {}
  ).sort({ createdAt: -1 });
  // نزاعات
  const disputes = await Dispute.find(status ? { status } : {}).sort({
    createdAt: -1,
  });
  // صفقات
  const deals = await Deal.find(status ? { status } : {}).sort({
    createdAt: -1,
  });
  res.json({
    withdrawals,
    disputes,
    deals,
  });
});

// تغيير كلمة المرور للمستخدم الحالي
export const changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { oldPassword, newPassword } = req.body;
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!oldPassword || !newPassword)
      return res
        .status(400)
        .json({ message: "Both old and new passwords are required." });
    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch)
      return res.status(400).json({ message: "Old password is incorrect." });
    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server error changing password" });
  }
};

// رفع أو تغيير صورة البروفايل
export const uploadProfileImage = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!req.file)
      return res.status(400).json({ message: "No image uploaded." });
    // حذف الصورة القديمة من Cloudinary إذا وجدت
    if (user.profileImage && user.profileImage.public_id) {
      try {
        await deleteFromCloudinary(user.profileImage.public_id);
      } catch (e) {
        /* تجاهل الخطأ */
      }
    }
    // رفع الصورة الجديدة
    const result = await uploadToCloudinary(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      "profile_images"
    );
    user.profileImage = { url: result.secure_url, public_id: result.public_id };
    await user.save();
    res
      .status(200)
      .json({
        message: "Profile image updated successfully.",
        profileImage: user.profileImage,
      });
  } catch (error) {
    console.error("Upload profile image error:", error);
    res.status(500).json({ message: "Server error uploading profile image" });
  }
};

// حذف صورة البروفايل
export const deleteProfileImage = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.profileImage || !user.profileImage.public_id) {
      return res.status(400).json({ message: "No profile image to delete." });
    }
    try {
      await deleteFromCloudinary(user.profileImage.public_id);
    } catch (e) {
      /* تجاهل الخطأ */
    }
    user.profileImage = undefined;
    await user.save();
    res.status(200).json({ message: "Profile image deleted successfully." });
  } catch (error) {
    console.error("Delete profile image error:", error);
    res.status(500).json({ message: "Server error deleting profile image" });
  }
};

// إرسال رابط إعادة تعيين كلمة المرور
export const sendResetPasswordEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required." });
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ message: "No user found with this email." });
    // إنشاء توكن مؤقت
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    // رابط إعادة التعيين (يفترض وجود واجهة أو endpoint للفرونت)
    const resetLink = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/reset-password?token=${token}`;
    // نص الإيميل بالإنجليزية
    const subject = "Reset your password";
    const html = `<p>Click the link below to reset your password:</p><a href="${resetLink}">${resetLink}</a>`;
    await sendEmail({ to: user.email, subject, html });
    res.status(200).json({ message: "Reset password email sent." });
  } catch (error) {
    console.error("Send reset password email error:", error);
    res
      .status(500)
      .json({ message: "Server error sending reset password email" });
  }
};

// إعادة تعيين كلمة المرور باستخدام التوكن
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword)
      return res
        .status(400)
        .json({ message: "Token and new password are required." });
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }
    const user = await User.findById(payload.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error resetting password" });
  }
};

export const getInvestors = async (req, res) => {
  try {
    // لا تتحقق من أن المستخدم أدمن أو أي حماية زائدة
    const {
      city,
      country,
      state,
      name,
      minInvestment,
      maxInvestment,
      page = 1,
      limit = 20,
    } = req.query;
    const query = { role: "investor", isBlocked: false, isDeleted: false };

    if (city) query.city = city;
    if (country) query.country = country;
    if (state) query.state = state;
    if (name) query.fullName = { $regex: name, $options: "i" };
    if (minInvestment)
      query["investmentRange.min"] = { $gte: Number(minInvestment) };
    if (maxInvestment)
      query["investmentRange.max"] = { $lte: Number(maxInvestment) };

    const skip = (Number(page) - 1) * Number(limit);
    const [investors, total] = await Promise.all([
      User.find(query).select("-password").skip(skip).limit(Number(limit)),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: investors.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      data: investors,
    });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "فشل في جلب المستثمرين",
        error: err.message,
      });
  }
};

// حذف نهائي لحساب المستخدم (للمستخدم نفسه)
export const deleteUserAccountPermanent = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    await User.findByIdAndDelete(req.user._id);
    // سجل النشاط
    await ActivityLog.create({
      userId:
        typeof req.user._id === "string"
          ? new mongoose.Types.ObjectId(req.user._id)
          : req.user._id,
      actionType: "permanent_delete_user",
      targetType: "user",
      targetId:
        typeof req.user._id === "string"
          ? new mongoose.Types.ObjectId(req.user._id)
          : req.user._id,
    });
    res.status(200).json({ message: "User account permanently deleted" });
  } catch (error) {
    console.error("Permanent delete account error:", error);
    res
      .status(500)
      .json({ message: "Server error permanently deleting account" });
  }
};

// حذف نهائي لأي مستخدم (للأدمن)
export const adminDeleteUserPermanent = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    await User.findByIdAndDelete(userId);
    // سجل النشاط
    await ActivityLog.create({
      userId:
        typeof req.user._id === "string"
          ? new mongoose.Types.ObjectId(req.user._id)
          : req.user._id,
      actionType: "admin_permanent_delete_user",
      targetType: "user",
      targetId:
        typeof userId === "string"
          ? new mongoose.Types.ObjectId(userId)
          : userId,
    });
    res
      .status(200)
      .json({ message: "User permanently deleted by admin", userId: userId });
  } catch (error) {
    console.error("Admin permanent delete user error:", error);
    res.status(500).json({ message: "Server error permanently deleting user" });
  }
};
