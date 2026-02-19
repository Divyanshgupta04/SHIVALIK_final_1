import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';

function PaymentStatus() {
    const location = useLocation();
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const { clearCart } = useCart();
    const [status, setStatus] = useState('processing'); // processing, success, failed

    useEffect(() => {
        const verifyPayment = async () => {
            const query = new URLSearchParams(location.search);
            const paymentId = query.get('payment_id');
            const paymentStatus = query.get('payment_status');
            const paymentRequestId = query.get('payment_request_id');

            if (!paymentId || !paymentRequestId) {
                setStatus('failed');
                toast.error('Invalid payment parameters');
                return;
            }

            try {
                const response = await axios.get(`/api/payment/verify-status`, {
                    params: {
                        payment_id: paymentId,
                        payment_status: paymentStatus,
                        payment_request_id: paymentRequestId
                    }
                });

                if (response.data.success) {
                    setStatus('success');
                    await clearCart();
                    toast.success('Payment successful! Order placed.');

                    // Redirect to account page after a delay
                    setTimeout(() => {
                        navigate('/account', {
                            state: {
                                orderSuccess: true,
                                orderId: response.data.orderId
                            }
                        });
                    }, 3000);
                } else {
                    setStatus('failed');
                    toast.error('Payment verification failed');
                }
            } catch (error) {
                console.error('Verification error:', error);
                setStatus('failed');
                toast.error(error.response?.data?.message || 'Payment verification failed');
            }
        };

        verifyPayment();
    }, [location, navigate, clearCart]);

    return (
        <div className={`min-h-[60vh] flex flex-col items-center justify-center p-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <div className={`max-w-md w-full p-8 rounded-2xl shadow-xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                {status === 'processing' && (
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                        <h2 className="text-2xl font-bold mb-2">Verifying Payment</h2>
                        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Please wait while we confirm your payment status...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-green-600">Payment Successful!</h2>
                        <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Your order has been placed successfully. You are being redirected to your account...</p>
                        <button
                            onClick={() => navigate('/account')}
                            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Go to My Account
                        </button>
                    </div>
                )}

                {status === 'failed' && (
                    <div className="text-center">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-red-600">Payment Failed</h2>
                        <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>There was an issue processing your payment. Please try again or contact support.</p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => navigate('/pay')}
                                className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => navigate('/contact')}
                                className={`flex-1 py-3 rounded-lg border transition-colors ${isDark ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'}`}
                            >
                                Contact Support
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PaymentStatus;
