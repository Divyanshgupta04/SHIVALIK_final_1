const express = require('express');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const PanType = require('../models/PanType');
const auth = require('../middleware/auth');
const emailService = require('../utils/email');

const router = express.Router();

// @route   POST /api/admin/products
// @desc    Create new product
// @access  Private (Admin only)
router.post('/products', auth, async (req, res) => {
  try {
    const { id, title, description, price, src, category, categoryId, subCategoryId, productType, images, hasForm, isInsurance } = req.body;

    // Check if product with same ID already exists
    const existingProduct = await Product.findOne({ id });
    if (existingProduct) {
      return res.status(400).json({ message: 'Product with this ID already exists' });
    }

    // If subCategoryId is provided, fetch the subcategory to get its categoryId
    let finalCategoryId = categoryId;
    if (subCategoryId && !categoryId) {
      const SubCategory = require('../models/SubCategory');
      const subcategory = await SubCategory.findById(subCategoryId);
      if (subcategory) {
        finalCategoryId = subcategory.categoryId;
      }
    }

    const product = new Product({
      id,
      title,
      description,
      price,
      src,
      images: images || [],
      category,
      categoryId: finalCategoryId,
      subCategoryId: subCategoryId || undefined,
      productType: productType || 'both',
      hasForm: !!hasForm,
      isInsurance: !!isInsurance
    });

    await product.save();

    // Emit real-time update to all connected clients
    req.io.emit('productAdded', product);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/products/:id
// @desc    Update product
// @access  Private (Admin only)
router.put('/products/:id', auth, async (req, res) => {
  try {
    const { title, description, price, src, category, categoryId, subCategoryId, productType, images, hasForm, isInsurance } = req.body;

    const update = { title, description, price, src };
    if (typeof category !== 'undefined') update.category = category;
    if (typeof categoryId !== 'undefined') update.categoryId = categoryId;
    if (typeof subCategoryId !== 'undefined') {
      update.subCategoryId = subCategoryId || undefined;

      // If subCategoryId is provided and categoryId is not, fetch categoryId from subcategory
      if (subCategoryId && !categoryId) {
        const SubCategory = require('../models/SubCategory');
        const subcategory = await SubCategory.findById(subCategoryId);
        if (subcategory) {
          update.categoryId = subcategory.categoryId;
        }
      }
    }
    if (typeof productType !== 'undefined') update.productType = productType;
    if (typeof images !== 'undefined') update.images = images;
    if (typeof hasForm !== 'undefined') update.hasForm = !!hasForm;
    if (typeof isInsurance !== 'undefined') update.isInsurance = !!isInsurance;

    const product = await Product.findOneAndUpdate(
      { id: req.params.id },
      update,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Emit real-time update to all connected clients
    req.io.emit('productUpdated', product);

    res.json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/products/:id
// @desc    Delete product
// @access  Private (Admin only)
router.delete('/products/:id', auth, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ id: req.params.id });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Emit real-time update to all connected clients
    req.io.emit('productDeleted', { id: req.params.id });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/products
// @desc    Get all products (admin view)
// @access  Private (Admin only)
router.get('/products', auth, async (req, res) => {
  try {
    const products = await Product.find().sort({ id: 1 });
    res.json({
      success: true,
      products,
      count: products.length
    });
  } catch (error) {
    console.error('Get admin products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users (admin view)
// @access  Private (Admin only)
router.get('/users', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('name email isVerified createdAt lastLogin cart address')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);

    // Add cart item count for each user
    const usersWithCartCount = users.map(user => ({
      ...user.toObject(),
      cartItemCount: user.cart ? user.cart.reduce((total, item) => total + item.quantity, 0) : 0
    }));

    res.json({
      success: true,
      users: usersWithCartCount,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/dashboard
// @desc    Get dashboard stats
// @access  Private (Admin only)
router.get('/dashboard', auth, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const recentProducts = await Product.find().sort({ createdAt: -1 }).limit(5);

    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('name email isVerified createdAt lastLogin');

    res.json({
      success: true,
      stats: {
        totalProducts,
        recentProducts,
        totalUsers,
        verifiedUsers,
        recentUsers
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/orders
// @desc    Get all orders (admin view)
// @access  Private (Admin only)
router.get('/orders', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status; // Optional status filter

    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / limit);

    // Calculate order statistics
    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$total' }
        }
      }
    ]);

    res.json({
      success: true,
      orders,
      pagination: {
        currentPage: page,
        totalPages,
        totalOrders,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      stats: orderStats
    });
  } catch (error) {
    console.error('Get admin orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/orders/:id
// @desc    Get specific order details (admin)
// @access  Private (Admin only)
router.get('/orders/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'username email')
      .populate({
        path: 'identityFormId',
        select: '+aadhaarNumber +panNumber +aadhaarPhoto +panPhoto fullName dob mobile fatherName formType'
      });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Format response with identity form data
    const response = {
      ...order.toObject(),
      identityForm: order.identityFormId || null
    };

    res.json({ success: true, order: response });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/orders/:id/status
// @desc    Update order status
// @access  Private (Admin only)
router.put('/orders/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/pan-types
// @desc    List all PAN card types for admin management
// @access  Private (Admin only)
router.get('/pan-types', auth, async (req, res) => {
  try {
    const panTypes = await PanType.find().sort({ createdAt: -1 });
    res.json({ success: true, panTypes });
  } catch (error) {
    console.error('Get admin PAN types error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/pan-types
// @desc    Create a new PAN card type
// @access  Private (Admin only)
router.post('/pan-types', auth, async (req, res) => {
  try {
    const { name, code, description, fee, discountPercent, iconUrl, isActive } = req.body;

    if (!name || !code || typeof fee === 'undefined') {
      return res.status(400).json({ message: 'Name, code and fee are required' });
    }

    const existing = await PanType.findOne({ code: String(code).toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: 'PAN type with this code already exists' });
    }

    const panType = new PanType({
      name,
      code,
      description,
      fee,
      discountPercent,
      iconUrl,
      isActive: typeof isActive === 'boolean' ? isActive : true
    });

    await panType.save();

    res.status(201).json({
      success: true,
      message: 'PAN type created successfully',
      panType
    });
  } catch (error) {
    console.error('Create PAN type error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/pan-types/:id
// @desc    Update an existing PAN card type
// @access  Private (Admin only)
router.put('/pan-types/:id', auth, async (req, res) => {
  try {
    const { name, description, fee, discountPercent, iconUrl, isActive } = req.body;

    const update = {};
    if (typeof name !== 'undefined') update.name = name;
    if (typeof description !== 'undefined') update.description = description;
    if (typeof fee !== 'undefined') update.fee = fee;
    if (typeof discountPercent !== 'undefined') update.discountPercent = discountPercent;
    if (typeof iconUrl !== 'undefined') update.iconUrl = iconUrl;
    if (typeof isActive !== 'undefined') update.isActive = isActive;

    const panType = await PanType.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    );

    if (!panType) {
      return res.status(404).json({ message: 'PAN type not found' });
    }

    res.json({
      success: true,
      message: 'PAN type updated successfully',
      panType
    });
  } catch (error) {
    console.error('Update PAN type error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/pan-types/:id
// @desc    Delete a PAN card type
// @access  Private (Admin only)
router.delete('/pan-types/:id', auth, async (req, res) => {
  try {
    const panType = await PanType.findByIdAndDelete(req.params.id);

    if (!panType) {
      return res.status(404).json({ message: 'PAN type not found' });
    }

    res.json({ success: true, message: 'PAN type deleted successfully' });
  } catch (error) {
    console.error('Delete PAN type error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/announcements/send
// @desc    Send bulk announcement to users
// @access  Private (Admin only)
router.post('/announcements/send', auth, async (req, res) => {
  try {
    const { subject, message, sendTo = 'all' } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ message: 'Subject and message are required' });
    }

    // Determine target users
    let query = {};
    if (sendTo === 'verified') {
      query = { isVerified: true };
    }
    // 'all' uses empty query {}

    const users = await User.find(query).select('email name');

    if (users.length === 0) {
      return res.status(400).json({ message: 'No users found to send message to' });
    }

    console.log(`Sending announcement to ${users.length} users`);

    // Send emails in background (or simpler loop for now)
    // For production with thousands of users, use a queue (Bull/RabbitMQ)
    let successCount = 0;
    let failCount = 0;

    // Send in parallel batches of 5 to avoid overwhelming SMTP
    const batchSize = 5;
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      await Promise.all(batch.map(async (user) => {
        try {
          const result = await emailService.sendAnnouncementEmail(user.email, user.name, subject, message);
          if (result.success) successCount++;
          else failCount++;
        } catch (err) {
          console.error(`Failed to send to ${user.email}:`, err);
          failCount++;
        }
      }));
    }

    res.json({
      success: true,
      message: `Announcement processing complete. Sent: ${successCount}, Failed: ${failCount}`,
      stats: { successCount, failCount, total: users.length }
    });

  } catch (error) {
    console.error('Announcement send error:', error);
    res.status(500).json({ message: 'Server error sending announcements' });
  }
});

module.exports = router;
