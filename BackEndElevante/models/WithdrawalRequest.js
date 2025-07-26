import mongoose from 'mongoose';

const withdrawalRequestSchema = new mongoose.Schema({
  // Unified to ObjectId for relational integrity and population support
  entrepreneurId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal', required: true },
  amount: { type: Number, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'completed'], default: 'pending' },
  adminComments: String,
  proofFiles: [{
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('WithdrawalRequest', withdrawalRequestSchema); 