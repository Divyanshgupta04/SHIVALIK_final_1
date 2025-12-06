const express = require('express');
const auth = require('../middleware/auth');
const LibraryCategory = require('../models/LibraryCategory');

const router = express.Router();

// GET /api/library/categories - list all library categories (public)
router.get('/', async (req, res) => {
  try {
    const categories = await LibraryCategory.find().sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    console.error('Get library categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/library/categories - create library category (admin only)
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

    if (!payload.name && payload.slug) {
      payload.name = payload.slug.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
    }

    const exists = await LibraryCategory.findOne({ slug: payload.slug });
    if (exists) {
      return res.status(400).json({ message: 'Library category already exists' });
    }

    const category = new LibraryCategory(payload);
    await category.save();

    res.status(201).json({ success: true, category });
  } catch (error) {
    console.error('Create library category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/library/categories/:slug - update library category (admin only)
router.put('/:slug', auth, async (req, res) => {
  try {
    const { name, imageUrl } = req.body;
    const update = {};
    if (name) update.name = name;
    if (typeof imageUrl !== 'undefined') update.imageUrl = imageUrl;

    const category = await LibraryCategory.findOneAndUpdate(
      { slug: req.params.slug },
      update,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Library category not found' });
    }

    res.json({ success: true, category });
  } catch (error) {
    console.error('Update library category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/library/categories/:slug - delete library category (admin only)
router.delete('/:slug', auth, async (req, res) => {
  try {
    const category = await LibraryCategory.findOneAndDelete({ slug: req.params.slug });

    if (!category) {
      return res.status(404).json({ message: 'Library category not found' });
    }

    res.json({ success: true, message: 'Library category deleted successfully' });
  } catch (error) {
    console.error('Delete library category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
