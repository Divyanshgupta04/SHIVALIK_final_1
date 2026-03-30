const express = require('express');
const Product = require('../models/Product');

const router = express.Router();

// @route   GET /api/products
// @desc    Get products (optionally filtered by category or query)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, q, categoryId, subCategoryId, limit = 50, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Base filter for exact ids (when present)
    const base = {};
    if (categoryId) base.categoryId = categoryId;
    if (subCategoryId) base.subCategoryId = subCategoryId;

    let textFilter = null;
    if (q) {
      // Use MongoDB text index (fast) instead of $regex (slow full scan)
      textFilter = { $text: { $search: String(q).trim() } };
    } else if (category) {
      // Category filter uses indexed field — keep as equality when possible
      const rgx = { $regex: String(category).trim(), $options: 'i' };
      textFilter = {
        $or: [
          { category: rgx },
          { title: rgx }
        ]
      };
    }

    let filter = base;
    if (textFilter) {
      filter = Object.keys(base).length ? { $and: [base, textFilter] } : textFilter;
    }

    const [total, products] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter)
        .sort(q ? { score: { $meta: 'textScore' } } : { id: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean() // return plain JS objects — faster serialisation
    ]);

    // Cache for 30s on public routes (CDN / browser)
    res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
    res.json({
      success: true,
      count: products.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      products
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id }).lean();

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.set('Cache-Control', 'public, max-age=60');
    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/products/hero/featured
// @desc    Get the featured product for the hero section
// @access  Public
router.get('/hero/featured', async (req, res) => {
  try {
    const product = await Product.findOne({ isHeroFeatured: true }).lean();
    // Cache for 2 minutes — hero product rarely changes
    res.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=300');
    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Get hero featured product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/products/home/list
// @desc    Get products selected for the home page (up to 14)
// @access  Public
router.get('/home/list', async (req, res) => {
  try {
    const products = await Product.find({ homePageOrder: { $gt: 0 } })
      .sort({ homePageOrder: 1 })
      .limit(14)
      .lean(); // plain JS objects — faster serialisation

    // Cache for 2 minutes — home page list rarely changes
    res.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=300');
    res.json({
      success: true,
      products
    });
  } catch (error) {
    console.error('Get home products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
