import mongoose from 'mongoose';
const ServiceSchema = new mongoose.Schema({
  /**
   * Unified to ObjectId for relational integrity and population support
   */
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'unavailable'],
    default: 'available'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  images: [String], // صور الخدمة
  files: [String], // ملفات الخدمة (مثل PDF أو Word)
  description: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// سكيمة الخدمة
const Service = mongoose.model('Service', ServiceSchema);
export { Service };
