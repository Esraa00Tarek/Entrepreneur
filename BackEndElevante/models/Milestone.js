// models/Milestone.js
import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema(
  {
    // Unified to ObjectId for relational integrity and population support
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business ID is required']
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title must be less than 200 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description must be less than 2000 characters']
    },
    files: [
      {
        url: {
          type: String,
          required: true
        },
        public_id: {
          type: String,
          required: true
        },
        originalName: String,
        uploadedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    dealId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deal',
      default: null
    },
    stageUpdate: {
      type: String
    },
    status: {
      type: String
    },
    notes: [
      {
        body: {
          type: String,
          required: true,
          trim: true,
          maxlength: 1000
        },
        // Unified to ObjectId for relational integrity and population support
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    // Unified to ObjectId for relational integrity and population support
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export default mongoose.model('Milestone', milestoneSchema);
