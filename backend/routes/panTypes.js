const express = require('express');
const PanType = require('../models/PanType');

const router = express.Router();

// @route   GET /api/pan-types
// @desc    List active PAN card types for the frontend
// @access  Public
router.get('/', async (req, res) => {
  try {
    const panTypes = await PanType.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, panTypes });
  } catch (error) {
    console.error('Get PAN types error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
