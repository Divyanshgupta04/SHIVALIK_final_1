const mongoose = require('mongoose');

const PanTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    // Short identifier for the PAN type, e.g. NEW, CORRECTION, MINOR
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  fee: {
    // Base fee for this PAN type (used in Payment Details step)
    type: Number,
    required: true,
    min: 0
  },
  discountPercent: {
    // Optional percentage discount to show in the Discount step
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  iconUrl: {
    type: String,
    trim: true,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PanType', PanTypeSchema);
