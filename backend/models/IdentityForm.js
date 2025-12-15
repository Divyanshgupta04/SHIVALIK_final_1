const mongoose = require('mongoose');

// NOTE: Identity documents (Aadhaar/PAN) are sensitive.
// This model stores them so the business can process government services.
// Consider encrypting these fields at rest and restricting access in production.

const IdentityFormSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    formType: {
      type: String,
      enum: ['aadhaar', 'pan', 'universal'],
      required: true,
      index: true,
    },

    // Common fields
    fullName: { type: String, required: true, trim: true },
    dob: { type: String, required: true, trim: true }, // stored as YYYY-MM-DD (from HTML date)
    mobile: { type: String, trim: true },
    consent: { type: Boolean, required: true },

    // Aadhaar fields
    aadhaarNumber: { type: String, trim: true, select: false },

    // PAN fields
    panNumber: { type: String, trim: true, uppercase: true, select: false },
    fatherName: { type: String, trim: true },

    // Optional snapshot for later processing / audit
    cartSnapshot: {
      type: [
        {
          productId: Number,
          title: String,
          quantity: Number,
          price: String,
          productType: String,
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

IdentityFormSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('IdentityForm', IdentityFormSchema);
