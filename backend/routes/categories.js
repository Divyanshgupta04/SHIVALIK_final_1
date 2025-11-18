const express = require('express');
const auth = require('../middleware/auth');
const Category = require('../models/Category');

const router = express.Router();

// @route   GET /api/categories
// @desc    List all categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/categories
// @desc    Create a new category
// @access  Private (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    const { name, slug, imageUrl } = req.body;
    if (!name && !slug) {
      return res.status(400).json({ message: 'Category name or slug is required' });
    }

    const payload = {};
    if (name) payload.name = name;
    if (slug) payload.slug = String(slug).toLowerCase();
    if (imageUrl) payload.imageUrl = imageUrl;

    // If only slug provided, set name same as slug capitalized
    if (!payload.name && payload.slug) {
      payload.name = payload.slug.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
    }

    // Ensure unique slug
    const exists = await Category.findOne({ slug: payload.slug });
    if (exists) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = new Category(payload);
    await category.save();

    res.status(201).json({ success: true, category });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/categories/:slug
// @desc    Update a category
// @access  Private (Admin only)
router.put('/:slug', auth, async (req, res) => {
  try {
    const { name, imageUrl } = req.body;
    const update = {};
    if (name) update.name = name;
    if (typeof imageUrl !== 'undefined') update.imageUrl = imageUrl;

    const category = await Category.findOneAndUpdate(
      { slug: req.params.slug },
      update,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ success: true, category });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/categories/:slug
// @desc    Delete a category
// @access  Private (Admin only)
router.delete('/:slug', auth, async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({ slug: req.params.slug });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/categories/seed
// @desc    Seed initial categories (for setup)
// @access  Private (Admin only)
router.post('/seed', auth, async (req, res) => {
  try {
    const defaultCategories = [
      { name: 'Partner Program', slug: 'partner', imageUrl: '/src/assets/Partner.jpg' },
      { name: 'Pan Card', slug: 'pan', imageUrl: '/src/assets/Pan.jpg' },
      { name: 'Insurance', slug: 'insurance', imageUrl: '/src/assets/Insurance.jpg' },
      { name: 'Service', slug: 'service', imageUrl: '/src/assets/service.jpg' },
      { name: 'Tax', slug: 'tax', imageUrl: '/src/assets/tax.jpg' },
      { name: 'Land Record', slug: 'land-record', imageUrl: '/src/assets/land.jpg' },
      { name: 'Certificate', slug: 'certificate', imageUrl: '/src/assets/Car.jpg' },
      { name: 'Library', slug: 'library', imageUrl: '/src/assets/li.jpg' }
    ];

    const results = [];
    for (const cat of defaultCategories) {
      const exists = await Category.findOne({ slug: cat.slug });
      if (!exists) {
        const newCat = new Category(cat);
        await newCat.save();
        results.push(newCat);
      }
    }

    res.json({ 
      success: true, 
      message: `Seeded ${results.length} categories`, 
      categories: results 
    });
  } catch (error) {
    console.error('Seed categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
