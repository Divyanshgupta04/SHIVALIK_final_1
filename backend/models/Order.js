const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  productId: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  price: String,
  src: String,
  externalLink: String, // for Apply Now products
  isExternalLink: { type: Boolean, default: false },
  otherCharges: { type: Number, default: 0 },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

const OrderSchema = new mongoose.Schema({
  // User information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },

  // Identity form reference (for admin to view uploaded documents)
  identityFormId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'IdentityForm'
  },

  // Order items
  items: [OrderItemSchema],

  // Whether this order is an external-link (Apply Now) order
  isExternalLinkOrder: { type: Boolean, default: false },
  // The external URL the user is redirected to after payment
  externalLink: { type: String },

  // Shipping address (optional for external-link orders)
  shippingAddress: {
    fullName: { type: String },
    phone: { type: String },
    line1: { type: String },
    line2: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String }
  },

  // Payment information
  payment: {
    payment_request_id: {
      type: String,
      required: true
    },
    payment_id: {
      type: String
    },
    payment_status: {
      type: String,
      default: 'Pending'
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },

  // Order status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'confirmed'
  },

  // Totals
  subtotal: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    default: 0
  },
  shipping: {
    type: Number,
    default: 0
  },
  otherCharges: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },

  // Timestamps
  orderDate: {
    type: Date,
    default: Date.now
  },
  estimatedDelivery: {
    type: Date
  }
}, {
  timestamps: true
});

// Calculate estimated delivery (7 days from order date)
OrderSchema.pre('save', function (next) {
  if (!this.estimatedDelivery) {
    this.estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  }
  next();
});

// ── Performance Indexes ──────────────────────────────────────────────────────
OrderSchema.index({ 'payment.payment_request_id': 1 }); // payment verification lookup
OrderSchema.index({ userId: 1, status: 1 });            // user order history
OrderSchema.index({ status: 1, createdAt: -1 });        // admin order listing
OrderSchema.index({ createdAt: -1 });                   // general sorting

module.exports = mongoose.model('Order', OrderSchema);