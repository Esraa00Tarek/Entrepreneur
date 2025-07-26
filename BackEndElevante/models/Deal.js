import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  mimeType: String,
  size: Number,
  url: String,
  uploadedAt: { type: Date, default: Date.now }
}, { _id: false });

const dealSchema = new mongoose.Schema({
  /**
   * Unified to ObjectId for relational integrity and population support
   */
  participants: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      role: { type: String, enum: ['entrepreneur', 'investor'], required: true }
    }
  ],
  initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  relatedBusiness: { type: mongoose.Schema.Types.ObjectId, ref: 'Business' },
  relatedRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'Request' },

  // ✅ New
  sourceType: { type: String, enum: ['offer', 'direct'], required: true },
  sourceId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'sourceType' },

  dealType: { type: String, enum: ['Investment'], required: true },

  description: String,
  amount: Number,
  currency: String,

  status: { type: String, enum: ['pending', 'in Progress', 'rejected', 'cancelled', 'completed','withdrawn', 'funded'], default: 'pending' },
  statusReason: String,

  attachments: [attachmentSchema],

  agreementDate: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
  escrowBalance: { type: Number, default: 0 }, // المبلغ المجمد
  releasedAmount: { type: Number, default: 0 }, // المبلغ المحرر
  contractUrl: { type: String }, // رابط ملف العقد PDF
  milestonePayments: [{
    milestoneId: { type: mongoose.Schema.Types.ObjectId, ref: 'Milestone', required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'released'], default: 'pending' },
    releasedAt: Date
  }]
}, { timestamps: true });


const Deal = mongoose.model('Deal', dealSchema);
export default Deal;