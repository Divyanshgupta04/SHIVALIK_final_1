import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/Auth/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLock, FiChevronLeft, FiMapPin, FiCreditCard, FiShield, FiAlertCircle, FiArrowRight } from 'react-icons/fi';
import axios from 'axios';

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, getCartTotal } = useCart();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [userAddress, setUserAddress] = useState(null);
  const [addressLoading, setAddressLoading] = useState(true);

  const buyNowItem = location.state?.buyNowItem;
  const currentCart = buyNowItem ? [{ ...buyNowItem, productId: buyNowItem.id, quantity: 1 }] : cart;

  useEffect(() => {
    if ((!cart || cart.length === 0) && !buyNowItem) {
      toast.error('Your cart is empty');
      navigate('/products');
    }
  }, [cart, buyNowItem, navigate]);

  useEffect(() => {
    if (!user) {
      toast.error('Please log in to continue');
      navigate('/signin');
    }
  }, [user, navigate]);

  const fetchAddress = async () => {
    if (user) {
      setAddressLoading(true);
      try {
        const res = await axios.get('/api/user-auth/address');
        if (res.data.success && res.data.address) {
          setUserAddress(res.data.address);
        } else {
          setUserAddress(null);
        }
      } catch (error) {
        setUserAddress(null);
      } finally {
        setAddressLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchAddress();
  }, [user]);

  const subtotal = buyNowItem ? Number(buyNowItem.price || 0) : parseFloat(getCartTotal());
  const tax = subtotal * 0.18;
  const shipping = 0;
  const total = subtotal + tax + shipping;

  const handlePayment = async () => {
    if (!userAddress) return toast.error('Please add shipping address');
    setLoading(true);

    try {
      const orderData = {
        items: currentCart,
        subtotal: subtotal,
        tax: tax,
        shipping: shipping,
        total: total,
        identityFormId: location.state?.idData?.identityFormId || null
      };

      const response = await axios.post('/api/payment/create-order', {
        amount: total,
        orderData: orderData
      });

      if (response.data.success && response.data.longurl) {
        window.location.href = response.data.longurl;
      } else {
        toast.error('Failed to initiate payment.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#0f1115] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className={`border-b backdrop-blur-md sticky top-0 z-50 ${isDark ? 'bg-[#0f1115]/80 border-white/5' : 'bg-white/80 border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>
            <FiChevronLeft className="w-4 h-4" />
            Back to Review
          </button>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500">
              <FiShield className="w-4 h-4" />
              Secure Gateway
            </div>
            <div className={`h-8 w-[1px] ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
            <h1 className="text-sm font-black uppercase tracking-widest">Payment</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          <div className="lg:col-span-8 space-y-8">
            {/* Payment Method Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`rounded-3xl border p-6 sm:p-10 ${isDark ? 'bg-gray-900/40 border-white/5 shadow-2xl shadow-black/50' : 'bg-white border-gray-100 shadow-xl shadow-gray-200/50'}`}>
              <div className="mb-8">
                <h2 className="text-2xl font-black mb-2">Payment Method</h2>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Choose how you'd like to pay for your service.</p>
              </div>

              <div className="space-y-4">
                <div className={`p-6 rounded-2xl border-2 transition-all flex items-center gap-6 ${isDark ? 'bg-violet-500/5 border-violet-500/30 shadow-lg shadow-violet-500/10' : 'bg-violet-50 border-violet-600/20 shadow-lg shadow-violet-600/5'}`}>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-violet-500/30">
                    <FiCreditCard className="w-7 h-7" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-black tracking-tight">Instamojo Secure Pay</h3>
                    <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Netbanking, UPI, Cards & Wallets</p>
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-violet-600 p-1">
                    <div className="w-full h-full rounded-full bg-violet-600" />
                  </div>
                </div>

                <div className={`p-6 rounded-2xl border border-dashed flex items-center gap-6 opacity-40 grayscale ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <FiArrowRight className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">Direct Bank Transfer</h3>
                    <p className="text-xs font-medium">Coming soon for corporate accounts</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Shipping Info Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`rounded-3xl border p-6 sm:p-10 ${isDark ? 'bg-white/5 border-white/5 shadow-2xl shadow-black/50' : 'bg-white border-gray-100 shadow-xl shadow-gray-200/50'}`}>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <FiMapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">Delivery Details</h3>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Shipping to your address</p>
                  </div>
                </div>
                <button onClick={() => navigate('/checkout')} className="text-[10px] font-black uppercase tracking-widest text-violet-500 hover:text-violet-400 bg-violet-500/10 px-4 py-2 rounded-full transition-all">
                  Change
                </button>
              </div>

              {addressLoading ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 w-1/3 bg-gray-200 dark:bg-white/10 rounded" />
                  <div className="h-3 w-1/2 bg-gray-200 dark:bg-white/10 rounded" />
                </div>
              ) : userAddress ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <p className="text-sm font-black">{userAddress.fullName}</p>
                    <p className={`text-xs font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{userAddress.phone}</p>
                  </div>
                  <div className={`text-xs font-medium leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {userAddress.line1}<br />
                    {userAddress.line2 && <>{userAddress.line2}<br /></>}
                    {userAddress.city}, {userAddress.state} - {userAddress.postalCode}<br />
                    {userAddress.country}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 text-rose-500 p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20">
                  <FiAlertCircle className="w-5 h-5" />
                  <p className="text-sm font-bold">No shipping address found. Please go back and add one.</p>
                </div>
              )}
            </motion.div>
          </div>

          <div className="lg:col-span-4 lg:sticky lg:top-32 space-y-6">
            <div className={`rounded-3xl border p-6 sm:p-8 overflow-hidden relative ${isDark ? 'bg-gray-900/40 border-white/5 shadow-2xl shadow-black/50' : 'bg-white border-gray-100 shadow-xl shadow-gray-200/50'}`}>
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-600/10 blur-3xl rounded-full" />

              <h3 className="text-lg font-black mb-6 flex items-center gap-2">Final Summary</h3>

              <div className="space-y-4 mb-8">
                {currentCart.map((item) => (
                  <div key={item.productId || item.id} className="flex gap-4">
                    <div className={`w-12 h-12 rounded-xl border flex-shrink-0 flex items-center justify-center overflow-hidden ${isDark ? 'bg-gray-800 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                      <img src={item.src} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-xs font-bold truncate">{item.title}</p>
                      <p className="text-[10px] font-bold text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-xs font-black">₹{Number(item.price) * item.quantity}</p>
                  </div>
                ))}
              </div>

              <div className={`space-y-3 pt-6 border-t ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                <div className="flex justify-between text-xs font-medium">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Subtotal</span>
                  <span className="font-bold">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs font-medium">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Tax (GST 18%)</span>
                  <span className="font-bold">₹{tax.toFixed(2)}</span>
                </div>
                <div className={`pt-4 mt-2 flex justify-between items-end border-t border-dashed ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-emerald-500' : 'text-emerald-600'}`}>Amount Payable</p>
                    <p className="text-3xl font-black leading-none">₹{total.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading || !userAddress || addressLoading}
                className={`w-full py-5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black uppercase tracking-widest text-sm shadow-2xl shadow-violet-500/40 hover:shadow-violet-500/60 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-8 disabled:opacity-50 disabled:grayscale disabled:hover:scale-100`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : <FiLock className="w-5 h-5" />}
                {loading ? 'Processing...' : `Pay ₹${total.toFixed(2)}`}
              </button>
            </div>

            <div className={`p-4 rounded-2xl flex items-center gap-4 ${isDark ? 'bg-emerald-500/5 ring-1 ring-emerald-500/20' : 'bg-emerald-50 ring-1 ring-emerald-500/10'}`}>
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white flex-shrink-0">
                <FiShield className="w-4 h-4" />
              </div>
              <p className={`text-[10px] font-bold leading-tight ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                SSL Encrypted Payment Gateways for secure individual and corporate transactions.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Payment;
