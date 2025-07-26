import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  // Unified to ObjectId for relational integrity and population support
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  userName: { type: String }, // اختياري إذا توفر
  email: { type: String }, // اختياري إذا توفر
  type: {
    type: String,
    enum: ['UX Issue', 'Bug Report', 'Suggestions'],
    required: true
  },
  title: { type: String }, // عنوان الملاحظة اختياري
  content: { type: String, required: true }, // وصف الملاحظة
  attachment: { type: String }, // رابط أو اسم ملف مرفق أو base64
  attachmentUrl: { type: String }, // رابط Cloudinary أو رابط تحميل الملف
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected', 'Resolved'],
    default: 'Pending'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true }); // timestamps يضيف createdAt و updatedAt تلقائياً

export default mongoose.model('Report', reportSchema); 