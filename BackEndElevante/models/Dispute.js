import mongoose from 'mongoose';

const disputeSchema = new mongoose.Schema({
  type: { type: String, enum: ['milestone', 'withdrawal'], required: true },
  // Unified to ObjectId for relational integrity and population support
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true }, // milestoneId أو withdrawalId
  openedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['open', 'under_review', 'resolved', 'rejected'], default: 'open' },
  // Unified to ObjectId for relational integrity and population support
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    createdAt: { type: Date, default: Date.now }
  }],
  resolution: String,
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Dispute', disputeSchema); 