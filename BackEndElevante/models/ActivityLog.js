import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  // Unified to ObjectId for relational integrity and population support
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  actionType: { type: String, required: true }, // e.g., approve_user, delete_business
  targetType: { type: String, required: true }, // e.g., user, deal, request
  // Unified to ObjectId for relational integrity and population support
  targetId: { type: mongoose.Schema.Types.ObjectId },
  metadata: { type: Object },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('ActivityLog', activityLogSchema); 