import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';
import { FiCheck, FiX, FiLoader, FiArrowRight, FiMail, FiHelpCircle, FiShield, FiLogIn } from 'react-icons/fi';

function PaymentStatus() {
    const location = useLocation();
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const { clearCart } = useCart();
    // status: 'processing' | 'success' | 'failed' | 'session_expired'
    const [status, setStatus] = useState('processing');
    const [orderId, setOrderId] = useState(null);
    const hasExecuted = useRef(false);

    useEffect(() => {
        const verifyPayment = async () => {
            if (hasExecuted.current) return;
            hasExecuted.current = true;
            const query = new URLSearchParams(location.search);
            const paymentId = query.get('payment_id');
            const paymentStatus = query.get('payment_status');
            const paymentRequestId = query.get('payment_request_id');

            if (!paymentId || !paymentRequestId) {
                // If we have payment_status and it's not credit, it's a definite failure
                if (paymentStatus && paymentStatus !== 'Credit') {
                    setStatus('failed');
                    return;
                }

                // Otherwise, it's an invalid landing on this page
                setStatus('failed');
                toast.error('No payment information found');
                return;
            }

            // Immediately fail if status is definitely failed (e.g. user cancelled)
            if (paymentStatus && paymentStatus !== 'Credit') {
                setStatus('failed');
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
                    setOrderId(response.data.orderId);
                    try { await clearCart(); } catch (e) { /* cart clear is best-effort */ }

                    const isExternal = response.data.isExternalLinkOrder;
                    const link = response.data.externalLink;

                    if (isExternal && link) {
                        toast.success('Payment verified! Redirecting to your service...', { duration: 6000 });
                        setTimeout(() => {
                            window.location.href = link; // Use same window for reliability
                        }, 5000);
                    } else {
                        toast.success('Order placed successfully!');
                        setTimeout(() => {
                            navigate('/account', {
                                state: { orderSuccess: true, orderId: response.data.orderId }
                            });
                        }, 5000);
                    }
                } else {
                    setStatus('failed');
                    toast.error('Payment verification failed');
                }
            } catch (error) {
                // Handle session expired (401) separately
                if (error.response?.status === 401) {
                    setStatus('session_expired');
                    toast('Your session expired. Please log in to check your order.', { icon: '🔑' });
                } else {
                    setStatus('failed');
                    toast.error(error.response?.data?.message || 'Verification failed');
                }
            }
        };

        verifyPayment();
    }, [location, navigate, clearCart]);

    return (
        <div className={`min-h-screen flex items-center justify-center p-6 transition-colors duration-300 ${isDark ? 'bg-[#0f1115]' : 'bg-gray-50'}`}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`max-w-xl w-full rounded-[2.5rem] border p-8 sm:p-12 text-center relative overflow-hidden ${isDark ? 'bg-gray-900/40 border-white/5 shadow-2xl shadow-black' : 'bg-white border-gray-100 shadow-2xl shadow-gray-200'}`}
            >
                {/* Decorative Blobs */}
                <div className={`absolute -top-24 -left-24 w-48 h-48 blur-3xl rounded-full opacity-20 ${status === 'success' ? 'bg-emerald-500' : status === 'failed' ? 'bg-rose-500' : status === 'session_expired' ? 'bg-amber-500' : 'bg-violet-500'}`} />
                <div className={`absolute -bottom-24 -right-24 w-48 h-48 blur-3xl rounded-full opacity-10 ${status === 'success' ? 'bg-emerald-500' : status === 'failed' ? 'bg-rose-500' : status === 'session_expired' ? 'bg-amber-500' : 'bg-violet-500'}`} />

                {status === 'processing' && (
                    <div className="relative z-10">
                        <div className="w-24 h-24 mx-auto mb-8 relative">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                className="w-full h-full border-4 border-violet-500/20 border-t-violet-500 rounded-full"
                            />
                            <FiLoader className="absolute inset-0 m-auto w-8 h-8 text-violet-500 animate-pulse" />
                        </div>
                        <h2 className="text-3xl font-black mb-3">Verifying Payment</h2>
                        <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Please do not refresh or close the window. We are confirming your transaction with the bank.
                        </p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="relative z-10">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", damping: 12 }}
                            className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/40"
                        >
                            <FiCheck className="w-12 h-12 text-white" />
                        </motion.div>

                        <h2 className="text-3xl font-black mb-2 text-emerald-500">Order Confirmed!</h2>
                        <p className={`text-sm font-medium mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Thank you for your order. Your transaction was successful and your service request is now being processed.
                        </p>

                        <div className={`p-5 rounded-2xl border mb-4 ${isDark ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'}`}>
                            <div className="flex items-center gap-2 justify-center mb-2">
                                <FiMail className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                <p className={`text-xs font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                    Confirmation email sent to your inbox
                                </p>
                            </div>
                            <p className={`text-[10px] font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                You will receive an order confirmation with invoice details shortly.
                            </p>
                        </div>

                        <div className={`p-6 rounded-3xl border mb-8 flex flex-col gap-3 ${isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-gray-500">
                                <span>Order ID</span>
                                <span className={isDark ? 'text-white' : 'text-gray-900'}>#{orderId ? orderId.toString().slice(-8) : 'PENDING'}</span>
                            </div>
                            <div className="h-[1px] w-full bg-current opacity-5" />
                            <p className="text-[10px] font-black uppercase text-emerald-500">Status: Successfully Placed ✓</p>
                        </div>

                        <div className="space-y-4">
                            {status === 'success' && orderId && location.state?.isExternalLinkOrder ? (
                                <button
                                    onClick={() => {
                                        const link = location.state?.externalLink;
                                        if (link) window.location.href = link;
                                        else navigate('/account');
                                    }}
                                    className="w-full py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                                >
                                    Go to Your Service
                                    <FiArrowRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    onClick={() => navigate('/account')}
                                    className="w-full py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                                >
                                    Go to My Dashboard
                                    <FiArrowRight className="w-4 h-4" />
                                </button>
                            )}

                            <p className="text-[10px] font-bold text-gray-500 animate-pulse">
                                {location.state?.isExternalLinkOrder ? 'Redirecting to your service in 5 seconds...' : 'Redirecting in 5 seconds...'}
                            </p>
                        </div>
                    </div>
                )}

                {status === 'failed' && (
                    <div className="relative z-10">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-24 h-24 bg-gradient-to-br from-rose-500 to-rose-700 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-rose-500/40"
                        >
                            <FiX className="w-12 h-12 text-white" />
                        </motion.div>

                        <h2 className="text-3xl font-black mb-2 text-rose-500">Payment Failed</h2>
                        <p className={`text-sm font-medium mb-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            We couldn't verify your payment. This might be due to a connection timeout or insufficient funds. No worries, your cart is still saved.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => navigate('/pay')}
                                className="flex-1 py-5 bg-rose-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-rose-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => navigate('/contact')}
                                className={`flex-1 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 ${isDark ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                            >
                                <FiHelpCircle className="w-4 h-4" />
                                Get Help
                            </button>
                        </div>
                    </div>
                )}

                {status === 'session_expired' && (
                    <div className="relative z-10">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", damping: 12 }}
                            className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-amber-500/40"
                        >
                            <FiLogIn className="w-12 h-12 text-white" />
                        </motion.div>

                        <h2 className="text-3xl font-black mb-2 text-amber-500">Session Expired</h2>
                        <p className={`text-sm font-medium mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Your payment is being processed but your login session expired during the redirect. Don't worry — if the payment was successful, your order has been placed automatically.
                        </p>

                        <div className={`p-5 rounded-2xl border mb-8 ${isDark ? 'bg-amber-500/5 border-amber-500/20' : 'bg-amber-50 border-amber-100'}`}>
                            <p className={`text-xs font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                                💡 Please log in and check "My Orders" in your dashboard to see your order status.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => navigate('/signin')}
                                className="flex-1 py-5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                            >
                                <FiLogIn className="w-4 h-4" />
                                Log In
                            </button>
                            <button
                                onClick={() => navigate('/contact')}
                                className={`flex-1 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 ${isDark ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                            >
                                <FiHelpCircle className="w-4 h-4" />
                                Get Help
                            </button>
                        </div>
                    </div>
                )}

                <div className="mt-12 pt-8 border-t border-dashed dark:border-white/10 border-gray-100 flex items-center justify-center gap-6">
                    <div className="flex items-center gap-2 opacity-40">
                        <FiMail className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase">Email Support</span>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-white/10" />
                    <div className="flex items-center gap-2 opacity-40">
                        <FiShield className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase">Secure Transaction</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default PaymentStatus;
