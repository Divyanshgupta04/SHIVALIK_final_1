import React from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import {
  FiMinus,
  FiPlus,
  FiTrash2,
  FiArrowLeft,
  FiShield,
  FiTruck,
  FiShoppingBag,
  FiShoppingBag as FiCartIcon
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

function Cart() {
  const { cart, itemCount, updateCartItem, removeFromCart, clearCart, getCartTotal } = useCart();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const formatINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const subtotalNum = Number(getCartTotal());
  const deliveryFee = 0; // Free
  const tax = Number((subtotalNum * 0.18).toFixed(2));
  const total = (subtotalNum + deliveryFee + tax).toFixed(2);

  const inc = (item) => updateCartItem(item.productId, (item.quantity || 1) + 1);
  const dec = (item) => updateCartItem(item.productId, Math.max(1, (item.quantity || 1) - 1));

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 25 }
    },
    exit: {
      opacity: 0,
      x: -50,
      scale: 0.9,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-500 selection:bg-purple-500/30 overflow-x-hidden ${isDark ? 'bg-[#0a0a12] text-white' : 'bg-gray-50 text-gray-900'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-20">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 relative">
          {/* Background Decorative Blur */}
          <div className="absolute -top-40 -left-20 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="relative z-10">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => navigate('/')}
              className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] transition-all mb-6 group ${isDark ? 'text-gray-500 hover:text-purple-400' : 'text-gray-400 hover:text-purple-600'
                }`}
            >
              <FiArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Return to Gallery
            </motion.button>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-black tracking-tighter leading-none"
            >
              Shopping <span className="text-transparent bg-clip-text bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 italic">Bag</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`mt-4 text-xs font-bold uppercase tracking-[0.4em] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
            >
              Collection Review • {itemCount} premium item{itemCount !== 1 ? 's' : ''}
            </motion.p>
          </div>

          <div className="flex items-center gap-4 relative z-10">
            <div className="hidden sm:flex flex-col items-end">
              <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Current Est.</p>
              <p className="text-2xl font-black tracking-tight">{formatINR(total)}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start relative z-10">

          {/* LEFT SECTION: Items */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="popLayout">
              {cart.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`flex flex-col items-center justify-center p-16 md:p-28 rounded-[3.5rem] border-2 border-dashed text-center transition-all ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-white border-gray-100'
                    }`}
                >
                  <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-10 relative ${isDark ? 'bg-white/5' : 'bg-gray-50'
                    }`}>
                    <div className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-full" />
                    <FiCartIcon className="w-12 h-12 text-gray-400 relative z-10" />
                  </div>
                  <h2 className="text-3xl font-black mb-4 tracking-tight">Your bag is empty</h2>
                  <p className={`text-sm max-w-xs mx-auto mb-10 font-medium leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    It seems you haven't selected any of our premium services yet.
                  </p>
                  <button
                    onClick={() => navigate('/products')}
                    className="px-12 py-5 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white font-black uppercase tracking-[0.3em] rounded-2xl hover:shadow-[0_25px_50px_-12px_rgba(79,70,229,0.5)] transition-all hover:-translate-y-2 text-[10px]"
                  >
                    Browse Collections
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="items"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-8"
                >
                  {cart.map((item) => (
                    <motion.div
                      key={item.productId}
                      variants={itemVariants}
                      layout
                      className={`group relative rounded-[2.5rem] border p-6 md:p-8 transition-all duration-700 ${isDark
                          ? 'bg-[#15151e] border-white/5 hover:bg-[#1a1a28] hover:shadow-2xl hover:shadow-purple-900/20'
                          : 'bg-white border-gray-100 hover:shadow-2xl hover:shadow-gray-200/50'
                        }`}
                    >
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-8">
                        {/* Image Preview */}
                        <div className="relative shrink-0 flex justify-center">
                          <div className="w-32 h-32 md:w-44 md:h-44 rounded-[2.2rem] overflow-hidden bg-gray-100 relative shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]">
                            <img
                              src={item.src}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-4 mb-4">
                            <div>
                              <h3 className="text-2xl md:text-3xl font-black tracking-tighter mb-1.5 truncate uppercase">
                                {item.title}
                              </h3>
                              <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-violet-500' : 'text-purple-600'}`}>
                                {item.description}
                              </p>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1, rotate: 90 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeFromCart(item.productId)}
                              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isDark ? 'bg-white/5 hover:bg-red-500 text-gray-400 hover:text-white' : 'bg-gray-50 hover:bg-red-500 text-gray-400 hover:text-white shadow-sm'
                                }`}
                            >
                              <FiTrash2 className="w-5 h-5" />
                            </motion.button>
                          </div>

                          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="space-y-4">
                              <p className="text-3xl font-black tracking-tight">
                                {formatINR(item.price)}
                              </p>

                              {/* Quantity Adjuster */}
                              <div className={`inline-flex items-center rounded-2xl border p-1.5 transition-all ${isDark ? 'bg-black/30 border-white/5' : 'bg-gray-50 border-gray-100 shadow-inner'
                                }`}>
                                <button
                                  onClick={() => dec(item)}
                                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${isDark ? 'hover:bg-white/10 text-gray-500 hover:text-white' : 'hover:bg-white text-gray-400 hover:text-black shadow-sm'
                                    }`}
                                >
                                  <FiMinus className="w-4 h-4" />
                                </button>
                                <motion.span
                                  key={item.quantity}
                                  initial={{ y: 5, opacity: 0 }}
                                  animate={{ y: 0, opacity: 1 }}
                                  className="w-14 text-center font-black text-xl tabular-nums italic"
                                >
                                  {item.quantity || 1}
                                </motion.span>
                                <button
                                  onClick={() => inc(item)}
                                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${isDark ? 'hover:bg-white/10 text-gray-500 hover:text-white' : 'hover:bg-white text-gray-400 hover:text-black shadow-sm'
                                    }`}
                                >
                                  <FiPlus className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <div className="text-right flex flex-col items-end">
                              <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Total Product Value</p>
                              <p className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
                                {formatINR((parseFloat(item.price) || 0) * (item.quantity || 0))}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Additional Actions */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-10">
                    <button
                      onClick={() => navigate('/products')}
                      className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] transition-all group ${isDark ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-black'
                        }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-gray-500/10 flex items-center justify-center group-hover:bg-purple-600/10 transition-all">
                        <FiPlus className="w-4 h-4 group-hover:scale-125 transition-transform" />
                      </div>
                      Explore More Services
                    </button>
                    <button
                      onClick={clearCart}
                      className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500/40 hover:text-red-500 transition-all px-6 py-3 rounded-xl hover:bg-red-500/5"
                    >
                      Purge Bag
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT SECTION: Premium Summary */}
          <div className="lg:col-span-4 lg:sticky lg:top-36 pb-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-[3rem] border p-10 relative overflow-hidden transition-all duration-500 ${isDark
                  ? 'bg-[#15151e] border-white/5 shadow-2xl shadow-black/80'
                  : 'bg-white border-gray-100 shadow-2xl shadow-gray-200/50'
                }`}
            >
              {/* Dynamic Gradient Background Glow */}
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />
              <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-3xl font-black tracking-tighter uppercase italic">Summary</h2>
                  <FiCartIcon className="w-6 h-6 opacity-20" />
                </div>

                <div className="space-y-8 mb-12">
                  <div className="flex justify-between items-center group">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-[1rem] flex items-center justify-center transition-colors ${isDark ? 'bg-white/5 group-hover:bg-white/10' : 'bg-gray-50 group-hover:bg-gray-100'
                        }`}>
                        <FiShoppingBag className="w-4 h-4 text-gray-500" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Value</span>
                    </div>
                    <span className="font-black text-xl tabular-nums">{formatINR(subtotalNum)}</span>
                  </div>

                  <div className="flex justify-between items-center group">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-[1rem] flex items-center justify-center transition-colors ${isDark ? 'bg-white/5 group-hover:bg-white/10' : 'bg-gray-50 group-hover:bg-gray-100'
                        }`}>
                        <FiTruck className="w-4 h-4 text-gray-500" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Handling</span>
                    </div>
                    <span className="text-green-500 font-black text-xs uppercase tracking-[0.3em] italic">Complimentary</span>
                  </div>

                  <div className="flex justify-between items-center group">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-[1rem] flex items-center justify-center transition-colors ${isDark ? 'bg-white/5 group-hover:bg-white/10' : 'bg-gray-50 group-hover:bg-gray-100'
                        }`}>
                        <FiShield className="w-4 h-4 text-gray-500" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Tax (18%)</span>
                    </div>
                    <span className="font-black text-lg tabular-nums opacity-60">{formatINR(tax)}</span>
                  </div>
                </div>

                <div className={`border-t-2 pt-10 ${isDark ? 'border-white/5' : 'border-gray-50'}`}>
                  <div className="flex flex-col gap-2 mb-12">
                    <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>Total Collection Value</p>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-5xl font-black tracking-tighter tabular-nums leading-none">
                        {formatINR(total)}
                      </h3>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={cart.length === 0}
                    onClick={() => navigate('/checkout')}
                    className={`group w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-4 transition-all relative overflow-hidden disabled:opacity-30 disabled:cursor-not-allowed shadow-2xl ${isDark
                        ? 'bg-white text-black hover:shadow-white/10'
                        : 'bg-gray-900 text-white hover:bg-black hover:shadow-black/20'
                      }`}
                  >
                    <span>Finalize Order</span>
                    <FiArrowLeft className="rotate-180 w-4 h-4 transition-transform group-hover:translate-x-2" />

                    {/* Animated Glow Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                  </motion.button>

                  <div className="flex items-center justify-center gap-6 mt-10 opacity-30">
                    <div className="flex flex-col items-center gap-1">
                      <FiShield className="w-4 h-4" />
                      <span className="text-[8px] font-black uppercase">Secure</span>
                    </div>
                    <div className="w-px h-6 bg-gray-500/20" />
                    <div className="flex flex-col items-center gap-1">
                      <FiTruck className="w-4 h-4" />
                      <span className="text-[8px] font-black uppercase">Rapid</span>
                    </div>
                    <div className="w-px h-6 bg-gray-500/20" />
                    <div className="flex flex-col items-center gap-1">
                      <FiPlus className="w-4 h-4" />
                      <span className="text-[8px] font-black uppercase">Insured</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className={`text-center text-[10px] font-bold uppercase tracking-[0.2em] mt-8 opacity-50 ${isDark ? 'text-gray-500' : 'text-gray-400'
                }`}
            >
              100% Encrypted Payment Processing
            </motion.p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
