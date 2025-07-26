import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  /**
   * Unified to ObjectId for relational integrity and population support
   */
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  entrepreneurId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  relatedBusiness: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business'
  },
  relatedRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request'
  },

  // ✅ New
  sourceType: { type: String, enum: ['offer', 'direct'], required: true },
  sourceId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'sourceType' },

  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: Number,
      price: Number
    }
  ],
  services: [
    {
      serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
      quantity: Number,
      price: Number
    }
  ],

  totalAmount: {
    type: Number,
    required: true
  },

  status: {
    type: String,
    enum: ['processing', 'cancelled', 'done'],
    default: 'processing'
  },

  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  platformFee: { type: Number, default: 0 } // عمولة المنصة
}, { timestamps: true });

const Order = mongoose.model('Order', OrderSchema);
export default Order;