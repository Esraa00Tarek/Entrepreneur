
import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  /**
   * Unified to ObjectId for relational integrity and population support
   */
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // اسم المنتج
  name: {
    type: String,
    required: true
  },

  // الفئة (Furniture - Electronics ...)
  category: {
    type: String,
    required: true
  },

  // سعر المنتج
  price: {
    type: Number,
    required: true
  },

  // كمية المخزون المتاحة
  stock: {
    type: Number,
    default: 0
  },

  // عدد الطلبات اللي تمت على المنتج
  ordersCount: {
    type: Number,
    default: 0
  },

  // التقييم الإجمالي للمنتج
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },

  // حالة المنتج: active / low_stock / out_of_stock
  status: {
    type: String,
    enum: ['active', 'low_stock', 'out_of_stock'],
    default: 'active'
  },

  // تفعيل المنتج أو لا (يدوي من المورد)
  isActive: {
    type: Boolean,
    default: true
  },

  // صورة أو معرض صور
  images: [String],

  // وصف المنتج (اختياري)
  description: {
    type: String
  },

  // تاريخ الإضافة
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// تحديث الحالة تلقائيًا حسب الكمية
ProductSchema.pre('save', function (next) {
  if (this.stock === 0) {
    this.status = 'out_of_stock';
  } else if (this.stock < 10) {
    this.status = 'low_stock';
  } else {
    this.status = 'active';
  }
  next();
});

const Product = mongoose.model('Product', ProductSchema);
export { Product };
