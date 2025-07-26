// models/Request.js
import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  mimeType: String,
  size: Number,
  url: String,
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const requestSchema = new mongoose.Schema({
  /**
   * Unified to ObjectId for relational integrity and population support
   */
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  offerType: {
    type: String,
    enum: ['Supply', 'Investment'],
    required: true
  },
  supplyType: {
    type: String,
    enum: ['Product', 'Service'],
    required: function () {
      return this.offerType === 'Supply';
    }
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 3000
  },
  quantity: {
    type: Number,
    min: 1,
    required: function () {
      return this.offerType === 'Supply' && this.supplyType === 'Product';
    }
  },
  category: {
    type: String,
    required: true
  },
  deadline: {
    type: Date
  },
  amount: {
    type: Number,
    min: 0,
    required: function () {
      return this.offerType === 'Investment';
    }
  },
  purpose: {
    type: String,
    required: function () {
      return this.offerType === 'Investment';
    },
    maxlength: 2000
  },
  summary: {
    type: String,
    maxlength: 5000
  },
  returnDetails: {
    type: String,
    maxlength: 2000
  },
  attachments: [attachmentSchema],
  isOpen: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model('Request', requestSchema);
