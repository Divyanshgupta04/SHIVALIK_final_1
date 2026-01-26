import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { FiUploadCloud, FiCheck } from 'react-icons/fi';

// UniversalIDForm
// Used when cart contains Aadhaar + PAN requirements (or productType="both").

export default function UniversalIDForm({ initialValue, onSubmit, onBack, disabled }) {
  const { isDark } = useTheme();
  const [form, setForm] = useState({
    fullName: initialValue?.fullName || '',
    dob: initialValue?.dob || '',
    mobile: initialValue?.mobile || '',
    aadhaarNumber: initialValue?.aadhaarNumber || '',
    panNumber: initialValue?.panNumber || '',
    fatherName: initialValue?.fatherName || '',
    consent: !!initialValue?.consent,
  });
  const [aadhaarPhoto, setAadhaarPhoto] = useState(initialValue?.aadhaarPhoto || null);
  const [panPhoto, setPanPhoto] = useState(initialValue?.panPhoto || null);
  const [uploading, setUploading] = useState({ aadhaar: false, pan: false });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleFileUpload = async (type, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      e.target.value = '';
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      e.target.value = '';
      return;
    }

    setUploading(prev => ({ ...prev, [type]: true }));
    try {
      const base64 = await resizeImage(file, 800);
      if (type === 'aadhaar') {
        setAadhaarPhoto(base64);
      } else {
        setPanPhoto(base64);
      }
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Failed to process image');
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const resizeImage = (file, maxWidth) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.consent) {
      window.alert('Consent is required to continue.');
      return;
    }
    if (!aadhaarPhoto) {
      window.alert('Please upload Aadhaar card photo.');
      return;
    }
    if (!panPhoto) {
      window.alert('Please upload PAN card photo.');
      return;
    }
    onSubmit?.({ ...form, aadhaarPhoto, panPhoto });
  };

  const inputClasses = `w-full rounded-lg border px-4 py-3 outline-none transition-all ${isDark
      ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-500'
      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-400'
    }`;

  const labelClasses = `block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Personal Info Section */}
      <div className="space-y-4">
        <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Personal Information</h3>

        <div>
          <label className={labelClasses}>Full Name</label>
          <input
            value={form.fullName}
            onChange={(e) => set('fullName', e.target.value)}
            className={inputClasses}
            placeholder="John Doe"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClasses}>Date of Birth</label>
            <input
              type="date"
              value={form.dob}
              onChange={(e) => set('dob', e.target.value)}
              className={inputClasses}
              required
            />
          </div>
          <div>
            <label className={labelClasses}>Mobile Number</label>
            <input
              value={form.mobile}
              onChange={(e) => set('mobile', e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
              className={inputClasses}
              placeholder="10 digits"
              required
            />
          </div>
        </div>
      </div>

      {/* Aadhaar Section */}
      <div className={`rounded-xl border p-5 ${isDark ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50/50'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Aadhaar Details</h3>
        <div className="space-y-4">
          <div>
            <label className={labelClasses}>Aadhaar Number</label>
            <input
              value={form.aadhaarNumber}
              onChange={(e) => set('aadhaarNumber', e.target.value.replace(/[^0-9]/g, '').slice(0, 12))}
              className={inputClasses}
              placeholder="12 digits"
              required
            />
          </div>

          <div>
            <label className={labelClasses}>Aadhaar Card Photo *</label>
            <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg ${isDark ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'
              }`}>
              <div className="space-y-1 text-center">
                {aadhaarPhoto ? (
                  <div className="relative inline-block">
                    <img src={aadhaarPhoto} alt="Aadhaar Preview" className="mx-auto h-32 rounded-lg object-contain" />
                    <button
                      type="button"
                      onClick={() => { setAadhaarPhoto(null); document.getElementById('u-aadhaar-upload').value = ''; }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <div className="mt-2 text-xs text-green-500 flex items-center justify-center gap-1">
                      <FiCheck /> Selected
                    </div>
                  </div>
                ) : (
                  <>
                    <FiUploadCloud className={`mx-auto h-10 w-10 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                    <div className={`flex text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'} justify-center mt-2`}>
                      <label
                        htmlFor="u-aadhaar-upload"
                        className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                      >
                        <span>Upload Aadhaar</span>
                        <input
                          id="u-aadhaar-upload"
                          name="u-aadhaar-upload"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => handleFileUpload('aadhaar', e)}
                          disabled={uploading.aadhaar || disabled}
                        />
                      </label>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PAN Section */}
      <div className={`rounded-xl border p-5 ${isDark ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50/50'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>PAN Details</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>PAN Number</label>
              <input
                value={form.panNumber}
                onChange={(e) => set('panNumber', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))}
                className={inputClasses}
                placeholder="ABCDE1234F"
                required
              />
            </div>
            <div>
              <label className={labelClasses}>Father's Name</label>
              <input
                value={form.fatherName}
                onChange={(e) => set('fatherName', e.target.value)}
                className={inputClasses}
                placeholder="Father's Name"
                required
              />
            </div>
          </div>

          <div>
            <label className={labelClasses}>PAN Card Photo *</label>
            <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg ${isDark ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'
              }`}>
              <div className="space-y-1 text-center">
                {panPhoto ? (
                  <div className="relative inline-block">
                    <img src={panPhoto} alt="PAN Preview" className="mx-auto h-32 rounded-lg object-contain" />
                    <button
                      type="button"
                      onClick={() => { setPanPhoto(null); document.getElementById('u-pan-upload').value = ''; }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <div className="mt-2 text-xs text-green-500 flex items-center justify-center gap-1">
                      <FiCheck /> Selected
                    </div>
                  </div>
                ) : (
                  <>
                    <FiUploadCloud className={`mx-auto h-10 w-10 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                    <div className={`flex text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'} justify-center mt-2`}>
                      <label
                        htmlFor="u-pan-upload"
                        className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                      >
                        <span>Upload PAN</span>
                        <input
                          id="u-pan-upload"
                          name="u-pan-upload"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => handleFileUpload('pan', e)}
                          disabled={uploading.pan || disabled}
                        />
                      </label>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`flex items-start gap-3 p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-blue-50'}`}>
        <div className="flex items-center h-5">
          <input
            id="consent"
            type="checkbox"
            checked={form.consent}
            onChange={(e) => set('consent', e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>
        <div className="text-sm">
          <label htmlFor="consent" className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
            Declaration
          </label>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            I confirm the above details are accurate and I consent to identity verification for this order.
          </p>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onBack}
          className={`flex-1 rounded-xl border px-6 py-3 text-sm font-semibold transition-all ${isDark
              ? 'border-gray-600 text-gray-300 hover:bg-gray-800'
              : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
            }`}
          disabled={disabled}
        >
          Back
        </button>
        <button
          type="submit"
          className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all disabled:opacity-70 disabled:hover:scale-100"
          disabled={disabled || uploading.aadhaar || uploading.pan}
        >
          {uploading.aadhaar || uploading.pan ? 'Processing...' : 'Submit & Continue'}
        </button>
      </div>
    </form>
  );
}
