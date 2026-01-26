const express = require('express');
const passport = require('passport');

const router = express.Router();

// @route   GET /api/auth/google
// @desc    Initiate Google OAuth flow
// @access  Public
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: process.env.FRONTEND_URL || 'http://localhost:5173/signin',
        session: true
    }),
    (req, res) => {
        // Successful authentication, redirect to frontend
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/auth/success`);
    }
);

// @route   GET /api/auth/status
// @desc    Check if user is authenticated
// @access  Public
router.get('/status', (req, res) => {
    if (req.isAuthenticated()) {
        return res.json({
            success: true,
            authenticated: true,
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                isVerified: req.user.isVerified
            }
        });
    }

    res.json({
        success: true,
        authenticated: false
    });
});

// @route   GET /api/auth/me
// @desc    Get current user (compatible with old endpoint)
// @access  Private
router.get('/me', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    res.json({
        success: true,
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            isVerified: req.user.isVerified,
            createdAt: req.user.createdAt,
            lastLogin: req.user.lastLogin,
            address: req.user.address || {}
        }
    });
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ message: 'Failed to logout' });
        }

        req.session.destroy((err) => {
            if (err) {
                console.error('Session destroy error:', err);
            }
            res.clearCookie('connect.sid');
            res.json({
                success: true,
                message: 'Logged out successfully'
            });
        });
    });
});

module.exports = router;
