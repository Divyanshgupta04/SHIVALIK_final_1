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

        const isExternalLinkOrder = !!orderData.isExternalLinkOrder;
        const externalLink = orderData.externalLink || '';

        // Use provided shipping address if available, otherwise fallback to user's saved address
        const shippingAddress = orderData.shippingAddress || user.address || {};

        // Sanitize phone number (Instamojo expects exactly 10 digits)
        let phone = '';

        // Priority: 1. shippingAddress.phone, 2. user.phone, 3. Placeholder (only if digital service)
        phone = shippingAddress?.phone || shippingAddress?.mobile || user.phone || '';

        // Clean the number
        phone = phone.toString().replace(/\D/g, '');

        // Remove leading 91
        if (phone.length === 12 && phone.startsWith('91')) {
            phone = phone.substring(2);
        }

        // Aggressively remove leading zeros
        while (phone.startsWith('0')) {
            phone = phone.substring(1);
        }

        // Take last 10 digits if longer
        if (phone.length > 10) {
            phone = phone.slice(-10);
        }

        // Final validation
        if (phone.length !== 10) {
            // If it's a standard order, we MUST have a valid phone
            if (!isExternalLinkOrder) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide a valid 10-digit mobile number in your shipping address."
                });
            }
            // fallback for external link if the cleaning failed
            phone = '9999999999';
        }

        const webhookUrl = process.env.API_URL || 'http://localhost:5000';
        const isLocalhost = webhookUrl.includes('localhost') || webhookUrl.includes('127.0.0.1');

        const paymentData = {
            amount: amount.toString(),
            purpose: 'Order for Shivalik Service Hub',
            buyer_name: user.name,
            email: user.email,
            phone: phone,
            redirect_url: `${process.env.FRONTEND_URL}/payment-status`,
            // Only send webhook if it's not localhost (Instamojo rejects localhost URLs)
            ...(isLocalhost ? {} : { webhook: `${webhookUrl}/api/payment/webhook` })
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
                shippingAddress: isExternalLinkOrder ? {
                    fullName: user.name,
                    phone: phone,
                    line1: 'External Link Service',
                    city: 'Online',
                    state: 'Digital',
                    postalCode: '000000',
                    country: 'India'
                } : shippingAddress,
                identityFormId: orderData.identityFormId,
                isExternalLinkOrder: isExternalLinkOrder,
                externalLink: externalLink,
                payment: {
                    payment_request_id: response.payment_request.id,
                    amount: amount,
                    currency: 'INR',
                    payment_status: 'Pending'
                },
                subtotal: orderData.subtotal,
                otherCharges: Number(orderData.otherCharges) || 0,
                tax: 0,
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
        let message = error.response?.data?.message || error.message || "Internal Server Error";

        // If message is an object (common with field validation errors), stringify it
        if (typeof message === 'object') {
            message = Object.entries(message)
                .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
                .join('; ') || JSON.stringify(message);
        }

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

                return res.status(200).json({
                    success: true,
                    orderId: order._id,
                    isExternalLinkOrder: order.isExternalLinkOrder,
                    externalLink: order.externalLink
                });
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
        const orders = await Order.find({
            userId: req.session.userId,
            status: { $ne: 'pending' }
        })
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