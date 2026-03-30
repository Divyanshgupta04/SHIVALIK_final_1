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
  },

  // Pricing and Discount fields
  originalPrice: {
    type: Number,
    default: 0
  },
  sellingPrice: {
    type: Number,
    default: 0
  },
  discountPercent: {
    type: Number,
    default: 0
  },

  // Toggle to indicate if this is an insurance product (Link-out only)
  isInsurance: {
    type: Boolean,
    default: false
  },

  // External URL to redirect users to when isInsurance is true
  externalLink: {
    type: String,
    trim: true,
    default: ''
  },

  // Custom charges defined by admin, replaces GST
  otherCharges: {
    type: Number,
    default: 0
  },

  // Toggle for Hero section featured product
  isHeroFeatured: {
    type: Boolean,
    default: false
  },

  // Order for home page products (1-14, 0 means not featured)
  homePageOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// ── Performance Indexes ──────────────────────────────────────────────────────

// Sorting / filtering in public routes
ProductSchema.index({ homePageOrder: 1 });
ProductSchema.index({ isHeroFeatured: 1 });
ProductSchema.index({ id: 1 });              // custom numeric id lookup

// Catalog / category views
ProductSchema.index({ categoryId: 1 });
ProductSchema.index({ subCategoryId: 1 });
ProductSchema.index({ categoryId: 1, subCategoryId: 1 }); // compound

// Full-text search (replaces slow $regex on title/description/category)
ProductSchema.index(
  { title: 'text', description: 'text', category: 'text' },
  { name: 'product_text_search', weights: { title: 3, category: 2, description: 1 } }
);

module.exports = mongoose.model('Product', ProductSchema);
