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
  // For Catalog Manager products, we store the parent category slug here.
  category: {
    type: String,
    trim: true,
    lowercase: true,
    default: undefined
  },

  // Catalog Manager linkage (optional so existing products don't break)
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: undefined
  },
  subCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubCategory',
    default: undefined
  },


  // Identity requirement used by checkout flow
  productType: {
    type: String,
    enum: ['aadhaar', 'pan', 'both', 'none'],
    default: 'both'
  },

  // Toggle to indicate whether this product has its own dedicated form
  hasForm: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', ProductSchema);
