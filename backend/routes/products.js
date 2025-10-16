const express = require('express');
const Product = require('../models/Product');

const router = express.Router();

// @route   GET /api/products
// @desc    Get products (optionally filtered by category or query)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, q } = req.query;

    const buildRegex = (s) => ({ $regex: String(s).trim(), $options: 'i' });

    let filter = {};
    if (category) {
      const rgx = buildRegex(category);
      filter = {
        $or: [
          { category: rgx },
          { title: rgx },
          { description: rgx }
        ]
      };
    } else if (q) {
      const rgx = buildRegex(q);
      filter = {
        $or: [
          { title: rgx },
          { description: rgx },
          { category: rgx }
        ]
      };
    }

    const products = await Product.find(filter).sort({ id: 1 });
    res.json({
      success: true,
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
    const product = await Product.findOne({ id: req.params.id });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
