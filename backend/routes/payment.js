const express = require('express');
const crypto = require('crypto');
const Order = require('../models/Order');
const User = require('../models/User');
const { sendOrderConfirmationEmail, sendAdminOrderNotification } = require('../utils/email');
const { createInstamojoPayment, getPaymentDetails } = require('../utils/instamojo');

const router = express.Router();

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
        req.session = req.session || {};
        req.session.userId = req.user._id || req.user.id;
        return next();
    }
    if (req.session && req.session.userId) {
        return next();
    }
    return res.status(401).json({ message: 'Please log in to continue' });
};

// @route   POST /api/payment/create-order
// @desc    Create Instamojo payment request
// @access  Private
router.post('/create-order', requireAuth, async (req, res) => {
    try {
        const { amount, orderData } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Sanitize phone number (Instamojo expects 10 digits, no leading zero or +91)
        let phone = user.address?.phone || '';
        // Remove all non-digit characters
        phone = phone.replace(/\D/g, '');

        // Remove leading 91 if it's 12 digits
        if (phone.length === 12 && phone.startsWith('91')) {
            phone = phone.substring(2);
        }

        // Aggressively remove leading zeros
        while (phone.startsWith('0')) {
            phone = phone.substring(1);
        }

        // If it's still more than 10 digits, take the last 10
        if (phone.length > 10) {
            phone = phone.slice(-10);
        }

        // Final validation: must be exactly 10 digits
        if (phone.length !== 10) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid 10-digit mobile number in your shipping address. (Current cleaned number: " + phone + ")"
            });
        }

        const paymentData = {
            amount: amount.toString(),
            purpose: 'Order for Shivalik Service Hub',
            buyer_name: user.name,
            email: user.email,
            phone: phone,
            redirect_url: `${process.env.FRONTEND_URL}/payment-status`,
            webhook: `${process.env.FRONTEND_URL.replace('sshjk.in', 'api.sshjk.in')}/api/payment/webhook` // Adjust based on your API URL
        };

        console.log('Sending Payment Data to Instamojo:', { ...paymentData, phone: phone });

        const response = await createInstamojoPayment(paymentData);

        if (response.success) {
            // Create a pending order in DB to track the request
            const order = new Order({
                userId: user._id,
                userEmail: user.email,
                userName: user.name,
                items: orderData.items,
                shippingAddress: user.address,
                identityFormId: orderData.identityFormId,
                payment: {
                    payment_request_id: response.payment_request.id,
                    amount: amount,
                    currency: 'INR',
                    payment_status: 'Pending'
                },
                subtotal: orderData.subtotal,
                tax: orderData.tax || 0,
                shipping: orderData.shipping || 0,
                total: orderData.total,
                status: 'pending'
            });

            await order.save();

            res.status(200).json({
                success: true,
                longurl: response.payment_request.longurl,
                payment_request_id: response.payment_request.id
            });
        } else {
            res.status(500).json({ success: false, message: 'Failed to create payment request' });
        }
    } catch (error) {
        console.error('Create Instamojo order error:', error.response?.data || error.message);
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || error.message || "Internal Server Error";
        res.status(status).json({ success: false, message: message, details: error.response?.data });
    }
});

// @route   GET /api/payment/verify-status
// @desc    Verify payment status after redirect
// @access  Private
router.get('/verify-status', requireAuth, async (req, res) => {
    try {
        const { payment_id, payment_status, payment_request_id } = req.query;

        if (!payment_id || !payment_request_id) {
            return res.status(400).json({ message: 'Missing payment information' });
        }

        const order = await Order.findOne({ 'payment.payment_request_id': payment_request_id });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // If already success, just return
        if (order.payment.payment_status === 'Credit') {
            return res.status(200).json({ success: true, orderId: order._id });
        }

        // Verify with Instamojo API
        const response = await getPaymentDetails(payment_request_id);

        if (response.success) {
            const payment = response.payment_request.payments.find(p => p.payment_id === payment_id);

            if (payment && payment.status === 'Credit') {
                order.payment.payment_id = payment_id;
                order.payment.payment_status = 'Credit';
                order.status = 'confirmed';
                await order.save();

                // Clear cart
                const user = await User.findById(order.userId);
                if (user) {
                    user.cart = [];
                    await user.save();
                }

                // Send emails
                try {
                    await sendOrderConfirmationEmail(order.userEmail, order.userName, order);
                    await sendAdminOrderNotification(order);
                } catch (e) {
                    console.error('Email error:', e);
                }

                return res.status(200).json({ success: true, orderId: order._id });
            }
        }

        res.status(400).json({ success: false, message: 'Payment not successful' });
    } catch (error) {
        console.error('Verify status error:', error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// @route   POST /api/payment/webhook
// @desc    Instamojo Webhook
// @access  Public
router.post('/webhook', async (req, res) => {
    try {
        const data = req.body;
        const mac_provided = data.mac;
        delete data.mac;

        // Sort keys case-insensitively
        const keys = Object.keys(data).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
        const str = keys.map(key => data[key]).join('|');

        const mac_calculated = crypto
            .createHmac('sha1', process.env.INSTAMOJO_SALT)
            .update(str)
            .digest('hex');

        if (mac_provided === mac_calculated) {
            if (data.status === 'Credit') {
                const order = await Order.findOne({ 'payment.payment_request_id': data.payment_request_id });
                if (order && order.payment.payment_status !== 'Credit') {
                    order.payment.payment_id = data.payment_id;
                    order.payment.payment_status = 'Credit';
                    order.status = 'confirmed';
                    await order.save();

                    // Clear cart for user
                    const user = await User.findById(order.userId);
                    if (user) {
                        user.cart = [];
                        await user.save();
                    }

                    // Send emails
                    try {
                        await sendOrderConfirmationEmail(order.userEmail, order.userName, order);
                        await sendAdminOrderNotification(order);
                    } catch (e) {
                        console.error('Email error in webhook:', e);
                    }
                }
            }
            res.status(200).send('OK');
        } else {
            res.status(400).send('MAC mismatch');
        }
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).send('Internal Server Error');
    }
});

// @route   GET /api/payment/orders
// @desc    Get user's orders
// @access  Private
router.get('/orders', requireAuth, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.session.userId })
            .sort({ createdAt: -1 })
            .select('_id status total orderDate estimatedDelivery items');

        res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// @route   GET /api/payment/orders/:id
// @desc    Get specific order details
// @access  Private
router.get('/orders/:id', requireAuth, async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            userId: req.session.userId
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        console.error('Get order details error:', error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;