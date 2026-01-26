const express = require('express');
const IdentityForm = require('../models/IdentityForm');

const router = express.Router();

// Middleware to check if user is authenticated (session-based)
const requireAuth = (req, res, next) => {
  // Check for Passport session (Google OAuth)
  if (req.isAuthenticated && req.isAuthenticated()) {
    // Polyfill req.session.userId for legacy code compatibility
    req.session = req.session || {};
    req.session.userId = req.user._id || req.user.id;
    return next();
  }

  // Check for legacy session
  if (req.session && req.session.userId) {
    return next();
  }

  return res.status(401).json({ message: 'Please log in to continue' });
};

function cleanDigits(value = '', maxLen) {
  const s = String(value).replace(/[^0-9]/g, '');
  return typeof maxLen === 'number' ? s.slice(0, maxLen) : s;
}

function cleanPan(value = '') {
  return String(value).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
}

// @route   POST /api/identity-forms
// @desc    Create identity form submission (aadhaar / pan / universal)
// @access  Private
router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      formType,
      fullName,
      dob,
      mobile,
      consent,
      aadhaarNumber,
      aadhaarPhoto,
      panNumber,
      panPhoto,
      fatherName,
      cartSnapshot,
    } = req.body || {};

    if (!formType || !['aadhaar', 'pan', 'universal'].includes(String(formType))) {
      return res.status(400).json({ message: 'Invalid formType' });
    }

    if (!fullName || !dob) {
      return res.status(400).json({ message: 'fullName and dob are required' });
    }

    if (!consent) {
      return res.status(400).json({ message: 'Consent is required' });
    }

    const payload = {
      userId: req.session.userId,
      formType: String(formType),
      fullName: String(fullName).trim(),
      dob: String(dob).trim(),
      mobile: mobile ? cleanDigits(mobile, 10) : undefined,
      consent: !!consent,
      fatherName: fatherName ? String(fatherName).trim() : undefined,
      cartSnapshot: Array.isArray(cartSnapshot) ? cartSnapshot : [],
    };

    if (payload.formType === 'aadhaar' || payload.formType === 'universal') {
      const a = cleanDigits(aadhaarNumber, 12);
      if (!a || a.length !== 12) {
        return res.status(400).json({ message: 'Valid aadhaarNumber (12 digits) is required' });
      }
      payload.aadhaarNumber = a;
      if (!payload.mobile || payload.mobile.length !== 10) {
        return res.status(400).json({ message: 'Valid mobile (10 digits) is required' });
      }
      // Add aadhaar photo if provided
      if (aadhaarPhoto) {
        payload.aadhaarPhoto = aadhaarPhoto;
      }
    }

    if (payload.formType === 'pan' || payload.formType === 'universal') {
      const p = cleanPan(panNumber);
      if (!p || p.length !== 10) {
        return res.status(400).json({ message: 'Valid panNumber (10 chars) is required' });
      }
      if (!payload.fatherName) {
        return res.status(400).json({ message: 'fatherName is required' });
      }
      payload.panNumber = p;
      // Add PAN photo if provided
      if (panPhoto) {
        payload.panPhoto = panPhoto;
      }
    }

    const doc = new IdentityForm(payload);
    await doc.save();

    return res.status(201).json({
      success: true,
      message: 'Identity form saved',
      identityForm: {
        id: doc._id,
        formType: doc.formType,
        fullName: doc.fullName,
        dob: doc.dob,
        mobile: doc.mobile,
        fatherName: doc.fatherName,
        createdAt: doc.createdAt,
      },
    });
  } catch (error) {
    console.error('Create identity form error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/identity-forms/me
// @desc    List current user's identity submissions (without sensitive numbers)
// @access  Private
router.get('/me', requireAuth, async (req, res) => {
  try {
    const forms = await IdentityForm.find({ userId: req.session.userId })
      .select('formType fullName dob mobile fatherName createdAt')
      .sort({ createdAt: -1 });

    return res.json({ success: true, forms });
  } catch (error) {
    console.error('List identity forms error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
