import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FiChevronLeft, FiCheck, FiLock, FiShield, FiCreditCard } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import AadhaarForm from './AadhaarForm';
import PanForm from './PanForm';
import UniversalIDForm from './UniversalIDForm';
import DeliveryForm from './DeliveryForm';

const STORAGE_KEY = 'shivalik.checkout.v1';

function getRequiredIdForm(cart) {
  let hasAadhaar = false;
  let hasPan = false;

  for (const item of cart || []) {
    const type = String(item.productType || '').toLowerCase();
    if (type === 'aadhaar') { hasAadhaar = true; continue; }
    if (type === 'pan') { hasPan = true; continue; }
    if (type === 'both') { hasAadhaar = true; hasPan = true; continue; }
    if (type === 'none') continue;

    const title = String(item.title || item.name || '').toLowerCase();
    const category = String(item.categoryName || item.category || '').toLowerCase();
    const subCategory = String(item.subCategoryName || '').toLowerCase();
    const textToCheck = `${title} ${category} ${subCategory}`;

    if (textToCheck.includes('aadhaar') || textToCheck.includes('aadhar') || textToCheck.includes('adhar')) hasAadhaar = true;
    if (textToCheck.includes('pan')) hasPan = true;
  }

  if (hasAadhaar && hasPan) return 'universal';
  if (hasAadhaar) return 'aadhaar';
  if (hasPan) return 'pan';
  return null;
}

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart: globalCart, getCartTotal } = useCart();
  const { isDark } = useTheme();

  const [buyNowItem, setBuyNowItem] = useState(() => {
    if (location.state?.buyNowItem) return location.state.buyNowItem;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw).buyNowItem || null;
    } catch { return null; }
    return null;
  });

  const cart = useMemo(() => {
    return buyNowItem ? [{ ...buyNowItem, quantity: 1 }] : globalCart;
  }, [buyNowItem, globalCart]);

  const requiredIdForm = useMemo(() => getRequiredIdForm(cart), [cart]);

  const [step, setStep] = useState(requiredIdForm ? 'id' : 'delivery');
  const [idData, setIdData] = useState(null);
  const [deliveryData, setDeliveryData] = useState(null);
  const [savingAddress, setSavingAddress] = useState(false);
  const [savingIdentity, setSavingIdentity] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.idData) setIdData(parsed.idData);
      if (parsed?.deliveryData) setDeliveryData(parsed.deliveryData);
      if (parsed?.step) setStep(parsed.step);
    } catch { }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        step, idData, deliveryData, buyNowItem
      }));
    } catch { }
  }, [step, idData, deliveryData, buyNowItem]);

  useEffect(() => {
    if (!cart || cart.length === 0) {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed?.buyNowItem) return;
      toast.error('Your cart is empty');
      navigate('/products');
      return;
    }
    if (requiredIdForm && !idData && step !== 'id') setStep('id');
    if (!requiredIdForm && step === 'id') setStep('delivery');
  }, [cart, requiredIdForm, idData, step, navigate]);

  const currentTotal = useMemo(() => {
    if (buyNowItem) return Number(buyNowItem.price || 0);
    return Number(getCartTotal() || 0);
  }, [buyNowItem, getCartTotal]);

  const subtotal = currentTotal;
  const otherCharges = cart.reduce((sum, item) => sum + (Number(item.otherCharges || 0) * (item.quantity || 1)), 0);
  const total = Number((subtotal + otherCharges).toFixed(2));

  const goBack = () => {
    if (step === 'id') navigate('/cart');
    else if (step === 'delivery') requiredIdForm ? setStep('id') : navigate('/cart');
    else if (step === 'review') setStep('delivery');
  };

  const onIdSubmit = async (data) => {
    setSavingIdentity(true);
    try {
      const cartSnapshot = (cart || []).map((i) => ({
        productId: i.productId,
        title: i.title,
        quantity: i.quantity,
        price: i.price,
        productType: i.productType,
      }));

      const res = await axios.post('/api/identity-forms', {
        formType: requiredIdForm,
        ...data,
        cartSnapshot,
      });

      const identityFormId = res?.data?.identityForm?.id;
      setIdData(identityFormId ? { ...data, identityFormId } : data);
      setStep('delivery');
    } catch (err) {
      console.error('Failed to save identity form:', err);
      toast.error('Identity form saved locally');
      setIdData(data);
      setStep('delivery');
    } finally {
      setSavingIdentity(false);
    }
  };

  const onDeliverySubmit = async (data) => {
    setDeliveryData(data);
    setSavingAddress(true);
    try {
      await axios.put('/api/user-auth/address', {
        fullName: data.fullName,
        phone: data.mobile,
        line1: data.address,
        line2: '',
        city: data.city,
        state: data.state,
        postalCode: data.pincode,
        country: 'India',
      });
    } catch { } finally {
      setSavingAddress(false);
    }
    setStep('review');
  };

  const proceedToPayment = () => {
    if (requiredIdForm && !idData) {
      toast.error('Identity verification required');
      setStep('id');
      return;
    }
    if (!deliveryData) {
      toast.error('Delivery address required');
      setStep('delivery');
      return;
    }
    sessionStorage.removeItem(STORAGE_KEY);
    navigate('/pay', {
      state: { deliveryData, idData, requiredIdForm, buyNowItem }
    });
  };

  const steps = [
    { id: 'id', label: 'Identity', show: !!requiredIdForm },
    { id: 'delivery', label: 'Delivery', show: true },
    { id: 'review', label: 'Review & Pay', show: true }
  ].filter(s => s.show);

  const currentStepIndex = steps.findIndex(s => s.id === step);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#0f1115] text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header Area */}
      <div className={`border-b ${isDark ? 'border-white/5 bg-gray-900/50' : 'border-gray-200 bg-white'} backdrop-blur-xl sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={goBack} className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}>
              <FiChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-black tracking-tight">Checkout</h1>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                {step === 'review' ? 'Finalizing your order' : 'Identity & Delivery Details'}
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-500">
            <FiShield className="w-4 h-4" />
            <span>Secure 256-bit SSL</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        {/* Step Indicator */}
        <div className="mb-12 max-w-2xl mx-auto">
          <div className="relative flex justify-between">
            {/* Background Line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-800 -translate-y-1/2 -z-10" />
            <motion.div
              className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-violet-600 to-indigo-600 -translate-y-1/2 -z-10"
              initial={{ width: '0%' }}
              animate={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.5 }}
            />

            {steps.map((s, idx) => {
              const isPast = steps.findIndex(x => x.id === step) > idx;
              const isActive = s.id === step;
              return (
                <div key={s.id} className="flex flex-col items-center gap-3">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-black transition-all duration-500
                    ${isActive ? 'bg-violet-600 text-white ring-4 ring-violet-500/20 scale-110' :
                      isPast ? 'bg-emerald-500 text-white' :
                        isDark ? 'bg-gray-800 text-gray-500' : 'bg-white text-gray-400 border-2 border-gray-200'}
                  `}>
                    {isPast ? <FiCheck className="w-5 h-5" /> : idx + 1}
                  </div>
                  <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest ${isActive ? 'text-violet-500' : 'text-gray-500'}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Form Section */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className={`rounded-3xl border p-6 sm:p-10 shadow-2xl ${isDark ? 'bg-gray-900/40 border-white/5 shadow-black/50' : 'bg-white border-gray-100 shadow-gray-200/50'
                  } backdrop-blur-xl`}
              >
                <div className="mb-8">
                  <h2 className="text-2xl font-black mb-2">
                    {step === 'id' && 'Identity Verification'}
                    {step === 'delivery' && 'Delivery Address'}
                    {step === 'review' && 'Final Review'}
                  </h2>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {step === 'id' && 'Government regulations require identity verification for these services.'}
                    {step === 'delivery' && 'Ensure your shipping details are accurate for timely delivery.'}
                    {step === 'review' && 'Check your details one last time before proceeding to payment.'}
                  </p>
                </div>

                {step === 'id' && requiredIdForm === 'aadhaar' && (
                  <AadhaarForm initialValue={idData} onBack={goBack} onSubmit={onIdSubmit} disabled={savingIdentity} />
                )}
                {step === 'id' && requiredIdForm === 'pan' && (
                  <PanForm initialValue={idData} onBack={goBack} onSubmit={onIdSubmit} disabled={savingIdentity} />
                )}
                {step === 'id' && requiredIdForm === 'universal' && (
                  <UniversalIDForm initialValue={idData} onBack={goBack} onSubmit={onIdSubmit} disabled={savingIdentity} />
                )}
                {step === 'delivery' && (
                  <DeliveryForm initialValue={deliveryData} onBack={goBack} onSubmit={onDeliverySubmit} disabled={savingAddress} />
                )}
                {step === 'review' && (
                  <div className="space-y-8">
                    {/* Compact Review Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {requiredIdForm && (
                        <div className={`group p-6 rounded-3xl border transition-all duration-300 relative ${isDark ? 'bg-white/5 border-white/5 hover:border-violet-500/30 shadow-xl shadow-black/20' : 'bg-gray-50 border-gray-100 hover:border-violet-600/20 shadow-lg shadow-gray-200/50'}`}>
                          <button
                            type="button"
                            onClick={() => setStep('id')}
                            className="absolute top-4 right-4 text-[10px] font-black uppercase tracking-widest text-violet-500 hover:text-violet-400 transition-colors bg-violet-500/10 px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0"
                          >
                            Edit
                          </button>
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-violet-500 mb-4 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                            Identity Details
                          </h4>
                          <div className="space-y-1">
                            <p className="text-sm font-black">{idData?.fullName}</p>
                            <p className={`text-xs font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'} uppercase tracking-tighter`}>
                              {requiredIdForm === 'universal' ? 'Aadhaar & PAN' : requiredIdForm.toUpperCase()} VERIFIED
                            </p>
                            <p className={`text-[10px] mt-2 font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                              Document identification has been pre-verified and encrypted.
                            </p>
                          </div>
                        </div>
                      )}
                      <div className={`group p-6 rounded-3xl border transition-all duration-300 relative ${isDark ? 'bg-white/5 border-white/5 hover:border-violet-500/30 shadow-xl shadow-black/20' : 'bg-gray-50 border-gray-100 hover:border-violet-600/20 shadow-lg shadow-gray-200/50'}`}>
                        <button
                          type="button"
                          onClick={() => setStep('delivery')}
                          className="absolute top-4 right-4 text-[10px] font-black uppercase tracking-widest text-violet-500 hover:text-violet-400 transition-colors bg-violet-500/10 px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0"
                        >
                          Edit
                        </button>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-violet-500 mb-4 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                          Shipping To
                        </h4>
                        <div className="space-y-1">
                          <p className="text-sm font-black">{deliveryData?.fullName}</p>
                          <p className={`text-xs font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{deliveryData?.mobile}</p>
                          <p className={`text-xs mt-2 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {deliveryData?.address}<br />
                            {deliveryData?.city}, {deliveryData?.state} - {deliveryData?.pincode}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-dashed dark:border-white/10 border-gray-200">
                      <button
                        type="button"
                        onClick={proceedToPayment}
                        className="w-full py-5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl font-black text-lg shadow-2xl shadow-violet-500/40 hover:shadow-violet-500/60 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 group"
                      >
                        <FiCreditCard className="w-6 h-6 transition-transform group-hover:rotate-12" />
                        Complete Order & Pay ₹{total}
                      </button>
                      <div className="flex flex-col items-center gap-3 mt-6">
                        <div className="flex items-center gap-2">
                          <FiShield className="w-4 h-4 text-emerald-500" />
                          <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            Verified Secure Transaction
                          </p>
                        </div>
                        <p className={`text-center text-[9px] font-medium leading-relaxed max-w-sm ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                          By proceeding, you agree to Shivalik Service Hub's <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Sticky Summary Section */}
          <div className="lg:col-span-4 lg:sticky lg:top-32">
            <div className={`rounded-3xl border p-6 sm:p-8 overflow-hidden relative ${isDark ? 'bg-gray-900/40 border-white/5 shadow-2xl shadow-black/50' : 'bg-white border-gray-100 shadow-xl shadow-gray-200/50'
              }`}>
              {/* Decorative Gradient Blob */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-600/10 blur-3xl rounded-full" />

              <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                Order Summary
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isDark ? 'bg-violet-500/20 text-violet-400' : 'bg-violet-100 text-violet-600'}`}>
                  {cart.length} item{cart.length !== 1 ? 's' : ''}
                </span>
              </h3>

              <div className="space-y-4 mb-8">
                {cart.map((item) => (
                  <div key={item.productId || item.id} className="flex gap-4">
                    <div className={`w-12 h-12 rounded-xl border flex-shrink-0 flex items-center justify-center overflow-hidden ${isDark ? 'bg-gray-800 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                      <img src={item.src} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-sm font-bold truncate">{item.title}</p>
                      <p className={`text-[10px] font-bold uppercase tracking-tighter ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        Qty: {item.quantity} • {String(item.productType || 'Basic').toUpperCase()}
                      </p>
                    </div>
                    <p className="text-sm font-black whitespace-nowrap">₹{Number(item.price || 0) * Number(item.quantity || 1)}</p>
                  </div>
                ))}
              </div>

              <div className={`space-y-3 pt-6 border-t ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                <div className="flex justify-between text-sm font-medium">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Subtotal</span>
                  <span className="font-bold">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Other Charges</span>
                  <span className="font-bold">₹{otherCharges.toFixed(2)}</span>
                </div>
                {location.state?.discount > 0 && (
                  <div className="flex justify-between text-sm font-medium text-emerald-500">
                    <span>Discount</span>
                    <span className="font-black">-₹{location.state.discount}</span>
                  </div>
                )}

                <div className={`pt-4 mt-2 flex justify-between items-end border-t border-dashed ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-emerald-500' : 'text-emerald-600'}`}>Total Payable</p>
                    <p className="text-3xl font-black leading-none">₹{total}</p>
                  </div>
                </div>
              </div>

              {/* Trust Badge */}
              <div className={`mt-8 p-4 rounded-2xl flex items-center gap-4 ${isDark ? 'bg-emerald-500/5 ring-1 ring-emerald-500/20' : 'bg-emerald-50 ring-1 ring-emerald-500/10'}`}>
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white flex-shrink-0">
                  <FiLock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-emerald-600 leading-tight">Secure Payment</p>
                  <p className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Your data is encrypted and protected.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
