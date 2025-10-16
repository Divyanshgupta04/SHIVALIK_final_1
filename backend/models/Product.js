const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: String,
    required: true
  },
  src: {
    type: String,
    required: true
  },
  // Optional array of additional product images
  images: {
    type: [String],
    default: []
  },
  // Optional category for filtering (kept optional to avoid breaking existing flows)
  category: {
    type: String,
    trim: true,
    lowercase: true,
    default: undefined
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', ProductSchema);
