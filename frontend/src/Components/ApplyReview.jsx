import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiShield, FiArrowRight, FiInfo } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

export default function ApplyReview() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isDark } = useTheme();
    const [phone, setPhone] = React.useState('');
    const [isValid, setIsValid] = React.useState(false);

    const handlePhoneChange = (e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
        setPhone(val);
        setIsValid(val.length === 10);
    };

    const product = location.state?.buyNowItem;

    if (!product) {
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center ${isDark ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
                <h2 className="text-2xl font-bold mb-4">No product selected</h2>
                <Link to="/products" className="px-6 py-3 bg-violet-600 text-white rounded-lg">Back to Products</Link>
            </div>
        );
    }

    const subtotal = Number(product.sellingPrice || product.price || 0);
    const otherCharges = Number(product.otherCharges || 0);
    const total = Number((subtotal + otherCharges).toFixed(2));

    const proceedToPay = () => {
        navigate('/pay', {
            state: {
                buyNowItem: product,
                isExternalLinkOrder: true,
                deliveryData: {
                    fullName: 'Digital Service',
                    mobile: phone,
                    address: 'External Link Service',
                    city: 'Online',
                    state: 'Digital',
                    pincode: '000000'
                }
            }
        });
    };

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#0f1115] text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Header */}
            <div className={`border-b ${isDark ? 'border-white/5 bg-gray-900/50' : 'border-gray-200 bg-white'} backdrop-blur-xl sticky top-0 z-40`}>
                <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}>
                            <FiChevronLeft className="w-6 h-6" />
                        </button>
                        <h1 className="text-xl font-black tracking-tight">Apply for Service</h1>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase tracking-widest">
                        <FiShield className="w-4 h-4" />
                        <span>Secure Checkout</span>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-[2.5rem] border p-8 sm:p-12 shadow-2xl ${isDark ? 'bg-gray-900/40 border-white/5 shadow-black/50' : 'bg-white border-gray-100 shadow-gray-200/50'} backdrop-blur-xl`}
                >
                    <div className="text-center mb-10">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${isDark ? 'bg-violet-500/10 text-violet-400' : 'bg-violet-50 text-violet-600'}`}>
                            <FiInfo className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Instant Activation after payment</span>
                        </div>
                        <h2 className="text-3xl font-black mb-2">Review & Apply</h2>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>You're one step away from accessing your requested service.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-10">
                        {/* Product Image */}
                        <div className={`aspect-square rounded-3xl overflow-hidden border ${isDark ? 'bg-gray-800 border-white/5' : 'bg-gray-100 border-gray-200'}`}>
                            <img src={product.src} alt={product.title} className="w-full h-full object-cover" />
                        </div>

                        {/* Price Breakdown */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-2xl font-black mb-1">{product.title}</h3>
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{product.description}</p>
                            </div>

                            <div className={`space-y-3 pt-6 border-t ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                                <div className="flex justify-between text-sm">
                                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Service Fee</span>
                                    <span className="font-bold">₹{subtotal.toFixed(2)}</span>
                                </div>
                                {otherCharges > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Other Charges</span>
                                        <span className="font-bold">₹{otherCharges.toFixed(2)}</span>
                                    </div>
                                )}

                                <div className={`pt-4 mt-2 flex justify-between items-end border-t border-dashed ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                                    <div>
                                        <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-emerald-500' : 'text-emerald-600'}`}>Total Amount to Pay</p>
                                        <p className="text-4xl font-black leading-none">₹{total.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`p-6 rounded-2xl mb-8 flex gap-4 items-start ${isDark ? 'bg-blue-500/5 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
                        <FiInfo className={`w-5 h-5 mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                        <p className={`text-xs leading-relaxed ${isDark ? 'text-blue-300/80' : 'text-blue-700/80'}`}>
                            <b>Note:</b> No physical delivery or address is required for this digital service. Upon successful payment, you will be automatically redirected to the service portal to complete your application.
                        </p>
                    </div>

                    <div className="mb-10">
                        <label className={`block text-xs font-black uppercase tracking-widest mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Enter your Mobile Number (Required for Payment)
                        </label>
                        <div className="relative group">
                            <input
                                type="tel"
                                value={phone}
                                onChange={handlePhoneChange}
                                placeholder="10-digit mobile number"
                                className={`w-full py-4 px-6 rounded-2xl border-2 transition-all outline-none text-lg font-bold tracking-widest
                                    ${isDark
                                        ? 'bg-black/40 border-white/5 focus:border-violet-500 text-white placeholder:text-gray-700'
                                        : 'bg-gray-50 border-gray-100 focus:border-violet-600 text-gray-900 placeholder:text-gray-400'
                                    }
                                    ${phone.length > 0 && !isValid ? 'border-red-500/50' : ''}
                                    ${isValid ? 'border-emerald-500/50' : ''}
                                `}
                            />
                            {isValid && (
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-emerald-500 font-bold text-xs uppercase tracking-tighter">
                                    Ready to Proceed
                                </div>
                            )}
                        </div>
                        {phone.length > 0 && !isValid && (
                            <p className="mt-2 text-[10px] font-bold text-red-500 uppercase tracking-widest">
                                Please enter valid 10-digit number
                            </p>
                        )}
                    </div>

                    <button
                        onClick={proceedToPay}
                        disabled={!isValid}
                        className={`w-full py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-4 group 
                            ${isValid
                                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-2xl shadow-violet-500/40 hover:shadow-violet-500/60 hover:scale-[1.02] active:scale-[0.98]'
                                : 'bg-gray-800/50 text-gray-500 cursor-not-allowed border border-white/5'
                            }
                        `}
                    >
                        Confirm & Proceed to Payment
                        <FiArrowRight className={`w-6 h-6 transition-transform ${isValid ? 'group-hover:translate-x-1' : 'opacity-20'}`} />
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
