const axios = require('axios');
const formData = require('form-data');

const createInstamojoPayment = async (data) => {
    const body = new formData();
    if (data.amount) body.append('amount', data.amount);
    if (data.purpose) body.append('purpose', data.purpose);
    if (data.buyer_name) body.append('buyer_name', data.buyer_name);
    if (data.email) body.append('email', data.email);
    if (data.phone) body.append('phone', data.phone);
    if (data.redirect_url) body.append('redirect_url', data.redirect_url);
    if (data.webhook) body.append('webhook', data.webhook);
    body.append('allow_repeated_payments', 'false');
    body.append('send_email', 'false');
    body.append('send_sms', 'false');

    try {
        const response = await axios.post(process.env.INSTAMOJO_BASE_URL + 'payment-requests/', body, {
            headers: {
                ...body.getHeaders(),
                'X-Api-Key': process.env.INSTAMOJO_API_KEY,
                'X-Auth-Token': process.env.INSTAMOJO_AUTH_TOKEN
            }
        });
        return response.data;
    } catch (error) {
        console.error('Instamojo API Error:', error.response?.data || error.message);
        throw error;
    }
};

const getPaymentDetails = async (paymentRequestId) => {
    const response = await axios.get(`${process.env.INSTAMOJO_BASE_URL}payment-requests/${paymentRequestId}/`, {
        headers: {
            'X-Api-Key': process.env.INSTAMOJO_API_KEY,
            'X-Auth-Token': process.env.INSTAMOJO_AUTH_TOKEN
        }
    });
    return response.data;
};

module.exports = { createInstamojoPayment, getPaymentDetails };
