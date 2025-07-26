import mongoose from 'mongoose';

const platformReviewSchema = new mongoose.Schema({
  // Unified to ObjectId for relational integrity and population support
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String }, // اختياري إذا توفر
  email: { type: String }, // اختياري إذا توفر
  rating: { type: Number, min: 1, max: 5, required: true },
  title: { type: String }, // عنوان المراجعة اختياري
  content: { type: String, required: true }, // نص المراجعة
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected', 'Resolved'],
    default: 'Pending'
  },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true }); // timestamps يضيف createdAt و updatedAt تلقائياً

export default mongoose.model('PlatformReview', platformReviewSchema); 