import mongoose from 'mongoose';

const userReviewSchema = new mongoose.Schema({
  // Unified to ObjectId for relational integrity and population support
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: true },
  // Unified to ObjectId for relational integrity and population support
  dealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal' },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  createdAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false }
});

export default mongoose.model('UserReview', userReviewSchema); 