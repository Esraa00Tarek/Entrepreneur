import mongoose from 'mongoose';

const businessSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 100
    },

    category: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        required: true,
        trim: true,
        minlength: 10,
        maxlength: 5000
    },

    location: {
        country: String,
        state: String,
        city: String,
        address: String
    },

    contact: {
        phone: String,
        email: String
    },

    financial: {
        investmentNeeded: {
            type: Number,
            min: 0,
            default: 0
        },
        currency: {
            type: String
        }
    },

    files: [{
        filename: String,
        originalName: String,
        fileType: String,
        fileSize: Number,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],

    status: {
        type: String,
        default: 'Idea' // no enum
    },

    statusReason: {
        type: String,
        default: ''
    },

    milestones: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Milestone'
    }],
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
    tags: [String],
    isDeleted: { type: Boolean, default: false },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

export default mongoose.model('Business', businessSchema);
