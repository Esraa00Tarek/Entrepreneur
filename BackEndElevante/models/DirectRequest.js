// models/DirectRequest.js

import mongoose from 'mongoose';

const directRequestSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['deal', 'order'],
    required: true
  },
  /**
   * Unified to ObjectId for relational integrity and population support
   */
  initiatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  relatedRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request',
    default: null
  },
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  offerDetails: {
    amount: Number, // for investment
    purpose: String,
    supplyType: String, // for order
    quantity: Number,
    description: String
  },
  attachments: [
    {
      filename: String,
      url: String,
      mimeType: String,
      size: Number,
      uploadedAt: Date
    }
  ],
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  withdrawn: {
    type: Boolean,
    default: false
  },
  decisionBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  decisionAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

export default mongoose.model('DirectRequest', directRequestSchema);