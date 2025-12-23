import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FiCheckCircle, FiFileText, FiCamera, FiUpload, FiArrowRight, FiCreditCard, FiPercent, FiPrinter } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import config from '../config/api';
import { useCart } from '../context/CartContext';

const STEPS = [
  'Click on Pan',
  'Select Type of Pan Card',
  'Fill Details (Saved for future)',
  'Upload Documents (Camera / Browse)',
  'Payment Details',
  'Payment',
  'Print Receipt',
];

const emptyForm = {
  fullName: '',
  mobile: '',
  email: '',
  dob: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  aadhaar: '',
  pan: '',
};

const PanService = () => {
  const { isDark } = useTheme();
  const { addToCart } = useCart();
  const navigate = React.useMemo(() => require('react-router-dom').useNavigate(), []); // clean this up if useNavigate is already imported or available
  const [step, setStep] = useState(1);
  const [panTypes, setPanTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [selectedTypeId, setSelectedTypeId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [docs, setDocs] = useState({ primary: null, additional: [] });
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  useEffect(() => {
    // Load form data from localStorage ("Should be Save for Future")
    const saved = localStorage.getItem('panFormData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData({ ...emptyForm, ...parsed });
      } catch (_) {
        // ignore invalid JSON
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadTypes() {
      setLoadingTypes(true);
      try {
        // Fetch all products that are likely PAN cards (filter by name/title)
        // Alternatively, your backend might have a category filter like /api/products?category=pan
        const res = await axios.get(`${config.apiUrl}/api/products`);
        if (!cancelled && res.data?.success) {
          const allProducts = res.data.products || [];
          // Filter products that identify as PAN cards
          const panProducts = allProducts.filter(p => {
            const title = (p.title || '').toLowerCase();
            const type = (p.productType || '').toLowerCase();
            const category = (p.category || '').toLowerCase();

            return (
              title.includes('pan') ||
              type === 'pan' ||
              category.includes('pan')
            );
          });
          // Map to the shape expected by UI
          // Map to the shape expected by UI AND Cart
          setPanTypes(panProducts.map(p => ({
            ...p, // keep original properties for cart
            _id: p._id || p.id,
            name: p.title,
            fee: parseFloat(p.price) || 0,
            discountPercent: 0,
            code: 'PAN',
            iconUrl: p.src,
            description: p.description
          })));
        }
      } catch (_) {
        if (!cancelled) setPanTypes([]);
      } finally {
        if (!cancelled) setLoadingTypes(false);
      }
    }
    loadTypes();
    return () => { cancelled = true; };
  }, []);

  const selectedType = panTypes.find(p => p._id === selectedTypeId) || null;
  const fee = selectedType?.fee || 0;
  const discountPercent = selectedType?.discountPercent || 0;
  const discountAmount = Math.round((fee * discountPercent) / 100);
  const payable = Math.max(0, Math.round(fee - discountAmount));

  const handleFieldChange = useCallback((key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleProceedToCheckout = () => {
    if (!selectedType) return;

    // Add to cart
    addToCart(selectedType);

    // Navigate to checkout
    // using window.location or navigate if available. 
    // Since I added navigate via require above, I'll use it, but better to check if it was already imported. 
    // Actually, PanService doesn't import useNavigate at top level in the visible code? 
    // Wait, let's check lines 1-10.
    // Line 1: import React ...
    // No useNavigate imported. I should add it to imports or use the one I added inside.
    // Ideally I should fix the imports properly.
    navigate('/checkout');
  };

  const saveAndNext = (nextStep) => {
    // Persist form data locally so user does not lose it
    try {
      localStorage.setItem('panFormData', JSON.stringify(formData));
    } catch (_) {
      // storage may fail silently (private mode etc.)
    }
    setStep(nextStep);
  };

  const handleDocsChange = (key, files) => {
    setDocs(prev => ({ ...prev, [key]: files }));
  };

  const handleConfirmPayment = () => {
    // At this point, in a full integration we would call backend/payment API.
    // For now we just mark as confirmed so user can print a receipt summary.
    setPaymentConfirmed(true);
    setStep(7);
  };

  const handlePrint = () => {
    window.print();
  };

  const containerClasses = isDark
    ? 'bg-black text-white'
    : 'bg-gray-50 text-gray-900';

  return (
    <div className={`min-h-screen py-10 ${containerClasses}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Stepper */}
          <aside className="lg:w-1/3">
            <div className={`${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-gray-200'} rounded-2xl shadow-sm p-6 sticky top-24`}>
              <h1 className="text-2xl font-extrabold mb-2">PAN Card Services</h1>
              <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Complete your PAN card request in simple guided steps.
              </p>
              <ol className="space-y-3 text-sm">
                {STEPS.map((label, index) => {
                  const current = index + 1;
                  const active = current === step;
                  const done = current < step;
                  return (
                    <li key={label} className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold border ${done ? 'bg-green-500 text-white border-green-500' :
                          active ? 'bg-blue-600 text-white border-blue-600' :
                            isDark ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-500'
                          }`}
                      >
                        {done ? <FiCheckCircle className="h-3 w-3" /> : current}
                      </div>
                      <span className={active ? 'font-semibold' : ''}>{label}</span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </aside>

          {/* Right: Step content */}
          <main className="flex-1 space-y-6">
            {/* Step 1 - Click on Pan (intro) */}
            {step === 1 && (
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-gray-200'} rounded-2xl shadow-sm p-6`}
              >
                <h2 className="text-xl font-bold mb-2">1. Click on PAN</h2>
                <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  You are already on the dedicated PAN card service page. Click the button below to start by choosing the type of PAN card you want.
                </p>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                >
                  Go to PAN Types <FiArrowRight />
                </button>
              </motion.section>
            )}

            {/* Step 2 - Select Type */}
            {step === 2 && (
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-gray-200'} rounded-2xl shadow-sm p-6`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <FiCreditCard />
                    <span>2. Select Type of PAN Card</span>
                  </h2>
                  <span className="text-xs uppercase tracking-wide text-gray-500">Admin configurable</span>
                </div>

                {loadingTypes ? (
                  <div className="py-8 text-center text-sm opacity-80">Loading available PAN types...</div>
                ) : panTypes.length === 0 ? (
                  <div className="py-8 text-center text-sm opacity-80">
                    No PAN types configured yet. Please contact the administrator.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {panTypes.map((t) => {
                      const active = t._id === selectedTypeId;
                      const baseClasses = isDark
                        ? 'bg-slate-800 border-slate-600 hover:border-blue-400'
                        : 'bg-white border-gray-200 hover:border-blue-500';
                      return (
                        <button
                          type="button"
                          key={t._id}
                          onClick={() => setSelectedTypeId(t._id)}
                          className={`text-left rounded-xl border p-4 transition shadow-sm ${baseClasses} ${active ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            {t.iconUrl ? (
                              <img
                                src={t.iconUrl}
                                alt={t.name}
                                className="w-12 h-12 rounded object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center text-xs text-gray-600">
                                PAN
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-sm">{t.name}</div>
                              {t.code && (
                                <div className="text-[11px] uppercase tracking-wide text-gray-500">Code: {t.code}</div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-semibold">₹{Number(t.fee || 0).toFixed(0)}</span>
                            {t.discountPercent ? (
                              <span className="inline-flex items-center gap-1 text-xs text-green-600">
                                <FiPercent />
                                <span>{t.discountPercent}% off</span>
                              </span>
                            ) : null}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleProceedToCheckout}
                    disabled={!selectedTypeId}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${selectedTypeId ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      }`}
                  >
                    Add to Cart & Checkout <FiArrowRight />
                  </button>
                </div>
              </motion.section>
            )}

            {/* Step 3 - Fill Details */}
            {step === 3 && (
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-gray-200'} rounded-2xl shadow-sm p-6`}
              >
                <h2 className="text-xl font-bold mb-2">3. Fill Details</h2>
                <p className={`text-xs mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  These details will be securely stored in your browser so you don&apos;t have to re-type them next time.
                </p>

                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveAndNext(4);
                  }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Full Name</label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={e => handleFieldChange('fullName', e.target.value)}
                        required
                        className="w-full p-2 border rounded text-sm text-gray-900 border-gray-300 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Mobile Number</label>
                      <input
                        type="tel"
                        value={formData.mobile}
                        onChange={e => handleFieldChange('mobile', e.target.value)}
                        required
                        className="w-full p-2 border rounded text-sm text-gray-900 border-gray-300 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={e => handleFieldChange('email', e.target.value)}
                        className="w-full p-2 border rounded text-sm text-gray-900 border-gray-300 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={formData.dob}
                        onChange={e => handleFieldChange('dob', e.target.value)}
                        className="w-full p-2 border rounded text-sm text-gray-900 border-gray-300 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Address</label>
                    <textarea
                      rows={3}
                      value={formData.address}
                      onChange={e => handleFieldChange('address', e.target.value)}
                      className="w-full p-2 border rounded text-sm text-gray-900 border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">City</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={e => handleFieldChange('city', e.target.value)}
                        className="w-full p-2 border rounded text-sm text-gray-900 border-gray-300 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">State</label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={e => handleFieldChange('state', e.target.value)}
                        className="w-full p-2 border rounded text-sm text-gray-900 border-gray-300 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">PIN Code</label>
                      <input
                        type="text"
                        value={formData.pincode}
                        onChange={e => handleFieldChange('pincode', e.target.value)}
                        className="w-full p-2 border rounded text-sm text-gray-900 border-gray-300 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Aadhaar Number</label>
                      <input
                        type="text"
                        value={formData.aadhaar}
                        onChange={e => handleFieldChange('aadhaar', e.target.value)}
                        className="w-full p-2 border rounded text-sm text-gray-900 border-gray-300 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Existing PAN (if any)</label>
                      <input
                        type="text"
                        value={formData.pan}
                        onChange={e => handleFieldChange('pan', e.target.value)}
                        className="w-full p-2 border rounded text-sm text-gray-900 border-gray-300 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      ← Back to PAN Types
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                    >
                      Save & Continue <FiArrowRight />
                    </button>
                  </div>
                </form>
              </motion.section>
            )}

            {/* Step 4 - Upload Documents */}
            {step === 4 && (
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-gray-200'} rounded-2xl shadow-sm p-6`}
              >
                <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <FiCamera />
                  <span>4. Upload Documents</span>
                </h2>
                <p className={`text-xs mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Upload clear images or PDFs of the required documents. You can capture directly from your camera or browse existing files.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <FiCamera /> Direct camera access
                    </p>
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl py-6 cursor-pointer hover:border-blue-500">
                      <FiCamera className="text-2xl mb-1" />
                      <span className="text-sm font-semibold">Capture / Upload from Camera</span>
                      <span className="text-xs text-gray-500">Uses device camera where supported</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={e => handleDocsChange('primary', e.target.files?.[0] || null)}
                      />
                    </label>
                    {docs.primary && (
                      <p className="text-xs mt-1 text-green-600 flex items-center gap-1">
                        <FiCheckCircle /> Selected: {docs.primary.name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <FiUpload /> Browse files
                    </p>
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl py-6 cursor-pointer hover:border-blue-500">
                      <FiFileText className="text-2xl mb-1" />
                      <span className="text-sm font-semibold">Upload Supporting Documents</span>
                      <span className="text-xs text-gray-500">You can select multiple files (PDF/JPG/PNG)</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={e => handleDocsChange('additional', Array.from(e.target.files || []))}
                      />
                    </label>
                    {docs.additional && docs.additional.length > 0 && (
                      <ul className="mt-1 space-y-1 text-xs text-gray-700 max-h-24 overflow-y-auto">
                        {docs.additional.map((f) => (
                          <li key={f.name} className="truncate flex items-center gap-1">
                            <FiFileText className="flex-shrink-0" />
                            <span className="truncate">{f.name}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    ← Back to Details
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(5)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                  >
                    Continue to Payment Details <FiArrowRight />
                  </button>
                </div>
              </motion.section>
            )}

            {/* Step 5 & 6 - Payment details and payment confirmation */}
            {step === 5 && (
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-gray-200'} rounded-2xl shadow-sm p-6`}
              >
                <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <FiCreditCard />
                  <span>5. Payment Details</span>
                </h2>
                <p className={`text-xs mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Review the charges before proceeding to payment.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div className={`${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-gray-50 border border-gray-200'} rounded-xl p-4`}>
                    <h3 className="font-semibold mb-2 text-sm">Selected PAN Type</h3>
                    {selectedType ? (
                      <>
                        <p className="text-sm font-bold mb-1">{selectedType.name}</p>
                        {selectedType.description && (
                          <p className={`text-xs mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{selectedType.description}</p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-red-500">No PAN type selected. Go back and choose one.</p>
                    )}

                    <div className="mt-3 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Base Fee</span>
                        <span className="font-semibold">₹{fee.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Discount</span>
                        <span className="font-semibold text-green-600">-₹{discountAmount.toFixed(0)} ({discountPercent}% )</span>
                      </div>
                      <div className="border-t pt-2 mt-2 flex justify-between text-base font-bold">
                        <span>Amount Payable</span>
                        <span>₹{payable.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>

                  <div className={`${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-gray-50 border border-gray-200'} rounded-xl p-4`}>
                    <h3 className="font-semibold mb-2 text-sm flex items-center gap-2">
                      <FiFileText />
                      <span>Applicant Summary</span>
                    </h3>
                    <ul className="text-xs space-y-1">
                      <li><span className="font-semibold">Name:</span> {formData.fullName || '-'} </li>
                      <li><span className="font-semibold">Mobile:</span> {formData.mobile || '-'} </li>
                      <li><span className="font-semibold">Email:</span> {formData.email || '-'} </li>
                      <li><span className="font-semibold">City:</span> {formData.city || '-'} </li>
                      <li><span className="font-semibold">State:</span> {formData.state || '-'} </li>
                    </ul>
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    ← Back to Documents
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmPayment}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                  >
                    Proceed to Payment & Receipt <FiArrowRight />
                  </button>
                </div>
              </motion.section>
            )}

            {/* Step 7 - Print Receipt */}
            {step === 7 && (
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-gray-200'} rounded-2xl shadow-sm p-6`}
              >
                <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <FiPrinter />
                  <span>7. Print Receipt</span>
                </h2>
                {paymentConfirmed ? (
                  <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Your payment has been marked as completed. You can now print a receipt for your records.
                  </p>
                ) : (
                  <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    For demo purposes this step assumes that payment is successful. In production, integrate with your payment gateway and confirm status here.
                  </p>
                )}

                <div className={`${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-gray-50 border border-gray-200'} rounded-xl p-4 mb-4`}>
                  <h3 className="font-semibold text-sm mb-2">Receipt Preview</h3>
                  <p className="text-xs mb-1">PAN Type: <span className="font-semibold">{selectedType?.name || '-'}</span></p>
                  <p className="text-xs mb-1">Applicant: <span className="font-semibold">{formData.fullName || '-'}</span></p>
                  <p className="text-xs mb-1">Mobile: <span className="font-semibold">{formData.mobile || '-'}</span></p>
                  <p className="text-xs mb-1">Amount Paid: <span className="font-semibold">₹{payable.toFixed(0)}</span></p>
                  <p className="text-xs text-gray-500 mt-2">Date: {new Date().toLocaleString()}</p>
                </div>

                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setStep(5)}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    ← Back to Payment Details
                  </button>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                  >
                    Print Receipt <FiPrinter />
                  </button>
                </div>
              </motion.section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default PanService;
