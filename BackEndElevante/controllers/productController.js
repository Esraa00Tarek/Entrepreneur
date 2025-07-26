import { Product } from '../models/Product.js';

// @desc Get all products for a supplier
export const getProductsBySupplier = async (req, res) => {
  try {
    const supplierId = req.params.supplierId;
    if (!supplierId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid supplier ID format' });
    }
    const products = await Product.find({ supplierId }).populate('supplierId', 'username fullName email');
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// @desc Create a new product
export const createProduct = async (req, res) => {
  try {
    const { name, category, price, stock, description, isActive } = req.body;
    const supplierId = req.user._id;

    const newProduct = new Product({
      name,
      category,
      price,
      stock,
      description,
      isActive: isActive === 'true',
      supplierId,
      images: req.imageUrls || [],
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(400).json({ error: 'Failed to create product' });
  }
};

// @desc Update a product
export const updateProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid product ID format' });
    }
    const { name, category, price, stock, description, isActive } = req.body;

    const updateData = {
      name,
      category,
      price,
      stock,
      description,
      isActive: isActive === 'true'
    };

    // لو فيه صور جديدة مرفوعة
    if (req.imageUrls && req.imageUrls.length > 0) {
      updateData.images = req.imageUrls;
    }

    // تحديث حالة المنتج حسب المخزون
    if (stock !== undefined) {
      if (+stock === 0) {
        updateData.status = 'out_of_stock';
      } else if (+stock < 10) {
        updateData.status = 'low_stock';
      } else {
        updateData.status = 'active';
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, {
      new: true,
      runValidators: true
    });

    if (!updatedProduct) {
      return res.status(404).json({ error: 'المنتج غير موجود' });
    }

    res.status(200).json(updatedProduct);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(400).json({ error: 'فشل تعديل المنتج' });
  }
};



// @desc Delete a product
export const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid product ID format' });
    }
    await Product.findByIdAndDelete(productId);
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

// ✅ @desc Toggle isActive status of a product
export const toggleProductActiveStatus = async (req, res) => {
  try {
    const productId = req.params.productId;
    if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid product ID format' });
    }
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    product.isActive = !product.isActive;
    await product.save();

    res.status(200).json({
      message: `Product is now ${product.isActive ? 'active' : 'inactive'}`,
      isActive: product.isActive
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle product status' });
  }
};

// ✅ @desc Get a single product by ID
export const getProductById = async (req, res) => {
  try {
    const productId = req.params.productId;
    if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid product ID format' });
    }
    const product = await Product.findById(productId).populate('supplierId', 'username fullName email');
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

// ✅ @desc Filter products by query
export const filterProducts = async (req, res) => {
  try {
    const { name, category, isActive, supplierId } = req.query;

    const query = {};

    if (name) {
      query.name = { $regex: name, $options: 'i' }; // بحث جزئي غير حساس لحالة الأحرف
    }
    if (category) {
      query.category = category;
    }
    if (isActive !== undefined) {
      query.isActive = isActive === 'true'; // تحويل إلى Boolean
    }
    if (supplierId) {
      query.supplierId = supplierId;
    }

    const products = await Product.find(query).populate('supplierId', 'username fullName email');
    res.status(200).json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to filter products' });
  }
};
