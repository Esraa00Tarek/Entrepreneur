// models/Offer.js
import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
  url: String,
  public_id: String,
  fileType: String,
  uploadedAt: { type: Date, default: Date.now }
}, { _id: false });

const offerSchema = new mongoose.Schema({
  /**
   * Unified to ObjectId for relational integrity and population support
   */
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request',
    required: true
  },
  offeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  offerType: {
    type: String,
    enum: ['Investment', 'Supply', 'Service'],
    required: true
  },
  price: Number, // optional for investment
  description: String,
  equityPercentage: Number, // for investors
  durationInDays: Number, // optional for suppliers
  attachments: [attachmentSchema],
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  items: [
    {
      itemType: { type: String, enum: ['Product', 'Service'] },
      itemId: { type: mongoose.Schema.Types.ObjectId, refPath: 'items.itemType' },
      quantity: Number,
      price: Number
    }
  ],
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

offerSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Offer', offerSchema);
