import React from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { FiMinus, FiPlus, FiTrash2, FiArrowLeft, FiShoppingCart, FiUser, FiSearch, FiBell } from "react-icons/fi";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

function Cart() {
  const { cart, itemCount, updateCartItem, removeFromCart, clearCart, getCartTotal } = useCart();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const formatINR = (n) => `₹${Number(n || 0).toFixed(2)}`;
  const subtotalNum = Number(getCartTotal());
  const shipping = 0; // Free
  const tax = Number((subtotalNum * 0.18).toFixed(2)); // 18%
  const total = (subtotalNum + shipping + tax).toFixed(2);

  const inc = (item) => updateCartItem(item.productId, (item.quantity || 1) + 1);
  const dec = (item) => updateCartItem(item.productId, Math.max(1, (item.quantity || 1) - 1));

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-[#1a2332] via-[#2a3441] to-[#1e2a38] text-white' 
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900'
    }`}>
     

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate('/')} 
            className={`flex items-center gap-2 transition-colors ${
              isDark 
                ? 'text-gray-300 hover:text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FiArrowLeft className="h-4 w-4" />
            Continue Shopping
          </button>
          <div className={`text-sm ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {formatINR(total)} &nbsp;&nbsp;•&nbsp;&nbsp; {itemCount} item{itemCount !== 1 ? 's' : ''}
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className={`rounded-lg border overflow-hidden transition-colors duration-300 ${
              isDark 
                ? 'bg-[#2a3441] border-gray-600' 
                : 'bg-white border-gray-200'
            }`}>
              <div className={`px-6 py-4 border-b transition-colors duration-300 ${
                isDark 
                  ? 'border-gray-600 text-gray-200' 
                  : 'border-gray-200 text-gray-700'
              }`}>
                <h2 className="text-lg font-medium">Cart Items</h2>
              </div>
              
              {cart.length === 0 ? (
                <div className={`px-6 py-12 text-center ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Your cart is empty
                </div>
              ) : (
                <div className={`divide-y ${
                  isDark ? 'divide-gray-600' : 'divide-gray-200'
                }`}>
                  {cart.map((item) => (
                    <div key={item.productId} className="p-6">
                      <div className="flex items-start gap-4">
                        <img 
                          src={item.src} 
                          alt={item.title} 
                          className={`h-20 w-20 rounded-lg object-cover ${
                            isDark ? 'bg-gray-700' : 'bg-gray-200'
                          }`} 
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-lg font-medium mb-1 ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>{item.title}</h3>
                          <p className={`text-sm mb-3 ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}>{item.description}</p>
                          <div className={`font-medium text-lg ${
                            isDark ? 'text-blue-400' : 'text-blue-600'
                          }`}>{formatINR(item.price)}</div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-3">
                          {/* Quantity Controls */}
                          <div className={`flex items-center rounded-lg border transition-colors duration-300 ${
                            isDark 
                              ? 'bg-[#1a2332] border-gray-600' 
                              : 'bg-gray-50 border-gray-300'
                          }`}>
                            <button 
                              onClick={() => dec(item)} 
                              className={`p-2 rounded-l-lg transition-colors ${
                                isDark 
                                  ? 'text-gray-300 hover:text-white hover:bg-gray-600' 
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                              }`}
                            >
                              <FiMinus className="h-4 w-4" />
                            </button>
                            <span className={`px-4 py-2 min-w-[3rem] text-center ${
                              isDark ? 'text-white' : 'text-gray-900'
                            }`}>{item.quantity || 1}</span>
                            <button 
                              onClick={() => inc(item)} 
                              className={`p-2 rounded-r-lg transition-colors ${
                                isDark 
                                  ? 'text-gray-300 hover:text-white hover:bg-gray-600' 
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                              }`}
                            >
                              <FiPlus className="h-4 w-4" />
                            </button>
                          </div>
                          
                          {/* Remove Button */}
                          <button 
                            onClick={() => removeFromCart(item.productId)} 
                            className={`p-2 rounded-lg transition-colors ${
                              isDark 
                                ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30 hover:text-red-300' 
                                : 'bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700'
                            }`}
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                          
                          {/* Item Total */}
                          <div className={`text-lg font-semibold ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            {formatINR((parseFloat(item.price) || 0) * (item.quantity || 0))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className={`rounded-lg border overflow-hidden sticky top-8 transition-colors duration-300 ${
              isDark 
                ? 'bg-[#2a3441] border-gray-600' 
                : 'bg-white border-gray-200'
            }`}>
              <div className={`px-6 py-4 border-b transition-colors duration-300 ${
                isDark 
                  ? 'border-gray-600 text-gray-200' 
                  : 'border-gray-200 text-gray-700'
              }`}>
                <h2 className="text-lg font-medium">Order Summary</h2>
              </div>
              
              <div className="p-6 space-y-4">
                <div className={`flex justify-between ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <span>Subtotal</span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>{formatINR(subtotalNum)}</span>
                </div>
                
                <div className={`flex justify-between ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <span>Shipping</span>
                  <span className={`font-medium ${
                    isDark ? 'text-green-400' : 'text-green-600'
                  }`}>Free</span>
                </div>
                
               
                
                <div className={`border-t pt-4 ${
                  isDark ? 'border-gray-600' : 'border-gray-200'
                }`}>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className={isDark ? 'text-blue-400' : 'text-blue-600'}>{formatINR(total)}</span>
                  </div>
                </div>
                
                <button
                  disabled={cart.length === 0}
                  onClick={() => navigate('/checkout')}
                  className={`w-full mt-6 py-3 px-4 font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDark 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700' 
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                  }`}
                >
                  Proceed to Order →
                </button>
                
                <p className={`text-center text-xs mt-4 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Secure checkout powered by SSL encryption
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      
    </div>
  );
}

export default Cart;
