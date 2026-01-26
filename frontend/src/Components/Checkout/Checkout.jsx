import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import AadhaarForm from './AadhaarForm';
import PanForm from './PanForm';
import UniversalIDForm from './UniversalIDForm';
import DeliveryForm from './DeliveryForm';

// Checkout.jsx
// Step-by-step checkout:
// 1) Identity Verification (Aadhaar/PAN/Universal) - derived from cart
// 2) Delivery Address
// 3) Proceed to Payment

const STORAGE_KEY = 'shivalik.checkout.v1';

function getRequiredIdForm(cart) {
  let hasAadhaar = false;
  let hasPan = false;

  for (const item of cart || []) {
    // 1. Check explicit productType if available (Admin setting)
    const type = String(item.productType || '').toLowerCase();

    if (type === 'aadhaar') {
      hasAadhaar = true;
      continue;
    }
    if (type === 'pan') {
      hasPan = true;
      continue;
    }
    // If explicitly 'both', set both flags
    if (type === 'both') {
      hasAadhaar = true;
      hasPan = true;
      continue;
    }

    // explicit skip
    if (type === 'none') {
      continue;
    }

    // 2. Fallback: Check title/name for keywords case-insensitively
    const title = String(item.title || item.name || '').toLowerCase();
    const category = String(item.categoryName || item.category || '').toLowerCase();
    const subCategory = String(item.subCategoryName || '').toLowerCase();

    const textToCheck = `${title} ${category} ${subCategory}`;

    if (textToCheck.includes('aadhaar') || textToCheck.includes('aadhar') || textToCheck.includes('adhar')) {
      hasAadhaar = true;
    }

    if (textToCheck.includes('pan')) {
      hasPan = true;
    }
  }

  // If both exist in cart, we use Universal form
  if (hasAadhaar && hasPan) return 'universal';
  if (hasAadhaar) return 'aadhaar';
  if (hasPan) return 'pan';

  return null;
}

function StepPill({ active, done, children }) {
  return (
    <div
      className={`rounded-full px-3 py-1 text-xs font-medium border ${active
        ? 'bg-indigo-600 text-white border-indigo-600'
        : done
          ? 'bg-green-50 text-green-700 border-green-200'
          : 'bg-white text-gray-600 border-gray-200'
        }`}
    >
      {children}
    </div>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart: globalCart, getCartTotal } = useCart();
  const { isDark } = useTheme();

  // Initialize with location state OR session storage to persist Buy Now item
  const [buyNowItem, setBuyNowItem] = useState(() => {
    if (location.state?.buyNowItem) return location.state.buyNowItem;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed.buyNowItem || null;
      }
    } catch {
      return null;
    }
    return null;
  });

  const cart = useMemo(() => {
    return buyNowItem ? [{ ...buyNowItem, quantity: 1 }] : globalCart;
  }, [buyNowItem, globalCart]);

  const requiredIdForm = useMemo(() => getRequiredIdForm(cart), [cart]);

  // step: 'id' | 'delivery' | 'review'
  const [step, setStep] = useState(requiredIdForm ? 'id' : 'delivery');
  const [idData, setIdData] = useState(null);
  const [deliveryData, setDeliveryData] = useState(null);
  const [savingAddress, setSavingAddress] = useState(false);
  const [savingIdentity, setSavingIdentity] = useState(false);

  // Load from session storage (so user can't accidentally lose progress by navigating)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.idData) setIdData(parsed.idData);
      if (parsed?.deliveryData) setDeliveryData(parsed.deliveryData);
      if (parsed?.step) setStep(parsed.step);
      // buyNowItem is already handled in initial state
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        step,
        idData,
        deliveryData,
        buyNowItem: buyNowItem // Persist this too!
      }));
    } catch {
      // ignore
    }
  }, [step, idData, deliveryData, buyNowItem]);

  // Prevent invalid step states when cart changes
  useEffect(() => {
    // If we have a buyNowItem in storage but not in state/memo (e.g. reload), 
    // we might want to recover it.
    // However, the memo 'cart' currently only looks at location.state.buyNowItem.
    // We should probably update the 'cart' memo to check simple sessionStorage/state too if we want robust reload support.

    if (!cart || cart.length === 0) {
      // Check if we have it in session before giving up
      const raw = sessionStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed?.buyNowItem) {
        // Redirect to self with state to restore
        // This causes a quick flicker but restores flow
        // navigate('.', { state: { buyNowItem: parsed.buyNowItem }, replace: true });
        return;
      }

      toast.error('Your cart is empty');
      navigate('/products');
      return;
    }

    // If identity is required but we are on delivery/review without idData, force back.
    if (requiredIdForm && !idData && step !== 'id') {
      setStep('id');
    }

    // If identity is NOT required, skip to delivery
    if (!requiredIdForm && step === 'id') {
      setStep('delivery');
    }
  }, [cart, requiredIdForm, idData, step, navigate]);

  // Calculate total: override getCartTotal if using buyNowItem
  const currentTotal = useMemo(() => {
    if (buyNowItem) {
      return Number(buyNowItem.price || 0);
    }
    // Fallback to checking session storage if location empty (for reload support logic above)
    // But 'cart' logic handles the truth.
    return Number(getCartTotal() || 0);
  }, [buyNowItem, getCartTotal]);

  const subtotal = currentTotal;
  const tax = Number((subtotal * 0.18).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));

  const goBack = () => {
    if (step === 'id') {
      navigate('/cart');
      return;
    }
    if (step === 'delivery') {
      if (requiredIdForm) setStep('id');
      else navigate('/cart');
      return;
    }
    if (step === 'review') {
      setStep('delivery');
    }
  };

  const onIdSubmit = async (data) => {
    // Persist identity form data to backend (optional but requested)
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
      // Don't block checkout if backend save fails
      console.error('Failed to save identity form (continuing checkout):', err);
      toast.error('Failed to save identity form (continuing)');
      setIdData(data);
      setStep('delivery');
    } finally {
      setSavingIdentity(false);
    }
  };

  const onDeliverySubmit = async (data) => {
    setDeliveryData(data);

    // OPTIONAL: integrate with your existing backend address endpoint.
    // This helps your existing Payment page show the saved address.
    // If backend is not available, the flow still works (demo).
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
    } catch {
      // Don't block checkout if address save fails in demo mode.
    } finally {
      setSavingAddress(false);
    }

    setStep('review');
  };

  const proceedToPayment = () => {
    // Hard guard
    if (requiredIdForm && !idData) {
      toast.error('Identity verification is required before payment');
      setStep('id');
      return;
    }
    if (!deliveryData) {
      toast.error('Delivery address is required before payment');
      setStep('delivery');
      return;
    }

    // Clear step cache but keep cart (Payment will clear after success).
    sessionStorage.removeItem(STORAGE_KEY);

    // Go to your existing payment route.
    // Pass buyNowItem so Payment.jsx knows what to pay for!
    navigate('/pay', {
      state: {
        deliveryData,
        idData,
        requiredIdForm,
        buyNowItem // PASSING THIS IS CRITICAL
      }
    });
  };

  const pageBg = isDark
    ? 'bg-gradient-to-br from-[#1a2332] via-[#2a3441] to-[#1e2a38] text-white'
    : 'bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900';

  return (
    <div className={`min-h-screen ${pageBg}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Checkout</h1>
            <p className={`mt-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Identity verification is mandatory for government services.
            </p>
          </div>
          <button
            type="button"
            onClick={goBack}
            className={`rounded-lg border px-4 py-2 text-sm font-medium ${isDark
              ? 'border-gray-600 bg-[#1a2332] text-gray-100 hover:bg-gray-700'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
          >
            Back
          </button>
        </div>

        {/* Stepper */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {requiredIdForm && (
            <StepPill active={step === 'id'} done={!!idData}>
              1. Identity
            </StepPill>
          )}
          <StepPill
            active={step === 'delivery'}
            done={!!deliveryData}
          >
            {requiredIdForm ? '2. Delivery' : '1. Delivery'}
          </StepPill>
          <StepPill active={step === 'review'} done={false}>
            {requiredIdForm ? '3. Review & Pay' : '2. Review & Pay'}
          </StepPill>
        </div>

        <div className={`mt-6 rounded-xl border shadow-sm ${isDark ? 'bg-[#2a3441] border-gray-600' : 'bg-white border-gray-200'}`}>
          <div className={`px-5 py-4 border-b ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">
                {step === 'id' && 'Identity Verification'}
                {step === 'delivery' && 'Delivery Address'}
                {step === 'review' && 'Review & Payment'}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Total: <span className="font-semibold">₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="p-5">
            {step === 'id' && requiredIdForm === 'aadhaar' && (
              <AadhaarForm
                initialValue={idData}
                onBack={goBack}
                onSubmit={onIdSubmit}
                disabled={savingIdentity}
              />
            )}

            {step === 'id' && requiredIdForm === 'pan' && (
              <PanForm
                initialValue={idData}
                onBack={goBack}
                onSubmit={onIdSubmit}
                disabled={savingIdentity}
              />
            )}

            {step === 'id' && requiredIdForm === 'universal' && (
              <UniversalIDForm
                initialValue={idData}
                onBack={goBack}
                onSubmit={onIdSubmit}
                disabled={savingIdentity}
              />
            )}

            {step === 'delivery' && (
              <DeliveryForm
                initialValue={deliveryData}
                onBack={goBack}
                onSubmit={onDeliverySubmit}
                disabled={savingAddress}
              />
            )}

            {step === 'review' && (
              <div className="space-y-6">
                <div className={`rounded-lg border p-4 ${isDark ? 'border-gray-600 bg-[#1a2332]' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="text-sm font-semibold">Order Summary</div>
                  <div className={`mt-3 space-y-2 text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {cart.map((item) => (
                      <div key={item.productId} className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className="font-medium truncate">{item.title}</div>
                          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Qty: {item.quantity} • Type: {String(item.productType || 'both').toUpperCase()}
                          </div>
                        </div>
                        <div className="font-medium">₹{(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(2)}</div>
                      </div>
                    ))}

                    <div className={`pt-3 mt-3 border-t ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>GST (18%)</span>
                        <span>₹{tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>₹{total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`rounded-lg border p-4 ${isDark ? 'border-gray-600 bg-[#1a2332]' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="text-sm font-semibold">Delivery Address</div>
                  <div className={`mt-2 text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    <div className="font-medium">{deliveryData?.fullName}</div>
                    <div>{deliveryData?.mobile}</div>
                    <div className="mt-1">{deliveryData?.address}</div>
                    <div className="mt-1">{deliveryData?.city}, {deliveryData?.state} - {deliveryData?.pincode}</div>
                  </div>
                </div>

                {requiredIdForm && (
                  <div className={`rounded-lg border p-4 ${isDark ? 'border-gray-600 bg-[#1a2332]' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="text-sm font-semibold">Identity Verified</div>
                    <div className={`mt-2 text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      <div>Form: <span className="font-medium">{requiredIdForm.toUpperCase()}</span></div>
                      <div>Name: <span className="font-medium">{idData?.fullName || '—'}</span></div>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={proceedToPayment}
                  className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Proceed to Payment →
                </button>

                <p className={`text-xs text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  You cannot skip identity and delivery steps.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
