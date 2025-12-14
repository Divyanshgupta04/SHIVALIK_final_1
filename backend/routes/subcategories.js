const express = require('express');
const auth = require('../middleware/auth');
const SubCategory = require('../models/SubCategory');
const Product = require('../models/Product');

const router = express.Router();

// @route   GET /api/subcategories
// @desc    List all sub-categories (optionally filtered by categoryId)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { categoryId } = req.query;
    const filter = {};
    if (categoryId) filter.categoryId = categoryId;

    const subCategories = await SubCategory.find(filter).sort({ name: 1 });
    res.json({ success: true, subCategories });
  } catch (error) {
    console.error('Get sub-categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/subcategories
// @desc    Create a sub-category
// @access  Private (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    const { name, categoryId, imageUrl } = req.body;

    if (!name || !categoryId) {
      return res.status(400).json({ message: 'name and categoryId are required' });
    }

    const subCategory = new SubCategory({
      name,
      categoryId,
      imageUrl: imageUrl || '',
    });

    await subCategory.save();

    res.status(201).json({ success: true, subCategory });
  } catch (error) {
    // Handle unique index violation (same sub-category slug within category)
    if (error?.code === 11000) {
      return res.status(400).json({ message: 'Sub-category already exists in this category' });
    }

    console.error('Create sub-category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/subcategories/:id
// @desc    Update a sub-category
// @access  Private (Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, imageUrl } = req.body;
    const update = {};
    if (typeof name !== 'undefined') update.name = name;
    if (typeof imageUrl !== 'undefined') update.imageUrl = imageUrl;

    const subCategory = await SubCategory.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    if (!subCategory) {
      return res.status(404).json({ message: 'Sub-category not found' });
    }

    res.json({ success: true, subCategory });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ message: 'Sub-category already exists in this category' });
    }

    console.error('Update sub-category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/subcategories/:id
// @desc    Delete a sub-category (and products under it)
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const subCategory = await SubCategory.findByIdAndDelete(req.params.id);

    if (!subCategory) {
      return res.status(404).json({ message: 'Sub-category not found' });
    }

    // Remove products under this sub-category
    await Product.deleteMany({ subCategoryId: subCategory._id });

    res.json({ success: true, message: 'Sub-category deleted successfully' });
  } catch (error) {
    console.error('Delete sub-category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
