import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { FiUploadCloud, FiCheck, FiTrash2, FiAlertCircle, FiUser, FiCalendar, FiCreditCard } from 'react-icons/fi';

export default function PanForm({ initialValue, onSubmit, onBack, disabled }) {
  const { isDark } = useTheme();
  const [form, setForm] = useState({
    fullName: initialValue?.fullName || '',
    fatherName: initialValue?.fatherName || '',
    panNumber: initialValue?.panNumber || '',
    dob: initialValue?.dob || '',
    consent: !!initialValue?.consent,
  });
  const [panPhoto, setPanPhoto] = useState(initialValue?.panPhoto || null);
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const processFile = async (file) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setUploading(true);
    try {
      const base64 = await resizeImage(file, 1200);
      setPanPhoto(base64);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Failed to process image');
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = (e) => processFile(e.target.files?.[0]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    processFile(e.dataTransfer.files?.[0]);
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
          resolve(canvas.toDataURL('image/jpeg', 0.85));
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
    if (!form.consent) return alert('Consent is required to continue.');
    if (!panPhoto) return alert('Please upload PAN card photo.');
    onSubmit?.({ ...form, panPhoto });
  };

  const inputClasses = `w-full rounded-2xl border px-5 py-4 outline-none transition-all duration-300 font-medium ${isDark
    ? 'bg-white/5 border-white/10 text-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 placeholder-gray-600'
    : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-violet-600 focus:ring-4 focus:ring-violet-600/10 placeholder-gray-400'
    }`;

  const labelClasses = `block text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${isDark ? 'text-violet-400' : 'text-violet-600'}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-1">
          <label className={labelClasses}>Full Name (As per PAN)</label>
          <div className="relative">
            <FiUser className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={form.fullName}
              onChange={(e) => set('fullName', e.target.value)}
              className={`${inputClasses} pl-12`}
              placeholder="e.g. Johnathan Doe"
              required
            />
          </div>
        </div>

        <div className="md:col-span-1">
          <label className={labelClasses}>Father's Name</label>
          <div className="relative">
            <FiUser className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={form.fatherName}
              onChange={(e) => set('fatherName', e.target.value)}
              className={`${inputClasses} pl-12`}
              placeholder="e.g. Robert Doe"
              required
            />
          </div>
        </div>

        <div>
          <label className={labelClasses}>PAN Card Number</label>
          <div className="relative">
            <FiCreditCard className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={form.panNumber}
              onChange={(e) => set('panNumber', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))}
              className={`${inputClasses} pl-12 font-mono tracking-widest`}
              placeholder="ABCDE1234F"
              required
            />
          </div>
        </div>

        <div>
          <label className={labelClasses}>Date of Birth</label>
          <div className="relative">
            <FiCalendar className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="date"
              value={form.dob}
              onChange={(e) => set('dob', e.target.value)}
              className={`${inputClasses} pl-12`}
              required
            />
          </div>
        </div>
      </div>

      <div>
        <label className={labelClasses}>PAN Card Document</label>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative mt-1 group cursor-pointer rounded-3xl border-2 border-dashed transition-all duration-500 overflow-hidden
            ${isDragOver ? 'border-violet-500 bg-violet-500/10 scale-[0.99]' :
              isDark ? 'border-white/10 hover:border-violet-500/50 hover:bg-white/5' : 'border-gray-200 hover:border-violet-500/50 hover:bg-gray-50'}
          `}
        >
          <input
            id="pan-upload"
            type="file"
            accept="image/*"
            className="absolute inset-0 opacity-0 cursor-pointer z-10"
            onChange={handleFileUpload}
            disabled={uploading || disabled}
          />

          <div className="p-8 sm:p-12 text-center">
            <AnimatePresence mode="wait">
              {panPhoto ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4"
                >
                  <div className="relative inline-block group/preview">
                    <img src={panPhoto} alt="PAN card preview" className="max-h-64 rounded-2xl shadow-2xl mx-auto ring-4 ring-violet-500/20" />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setPanPhoto(null); }}
                      className="absolute -top-3 -right-3 w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-rose-600 transition-colors z-20"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-emerald-500 font-bold">
                    <FiCheck className="w-5 h-5" />
                    <span className="text-sm">Document uploaded successfully</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4 transition-transform duration-500 group-hover:scale-110 ${isDark ? 'bg-violet-500/10' : 'bg-violet-50'}`}>
                    <FiUploadCloud className="w-10 h-10 text-violet-500" />
                  </div>
                  <div>
                    <p className="text-lg font-black tracking-tight">Click to upload or drag & drop</p>
                    <p className={`text-sm mt-1 font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      Clear image of your PAN card (JPG, PNG • Max 2MB)
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        {uploading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center justify-center gap-3 text-violet-500 font-bold"
          >
            <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Optimizing document...</span>
          </motion.div>
        )}
      </div>

      <div className={`p-5 rounded-3xl border flex items-start gap-4 transition-all duration-300 ${form.consent ? (isDark ? 'bg-violet-500/10 border-violet-500/30' : 'bg-violet-50 border-violet-200') : (isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100')
        }`}>
        <div className="relative flex items-center justify-center pt-1">
          <input
            id="consent"
            type="checkbox"
            checked={form.consent}
            onChange={(e) => set('consent', e.target.checked)}
            className="peer w-6 h-6 rounded-lg opacity-0 absolute cursor-pointer z-10"
          />
          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${form.consent ? 'bg-violet-600 border-violet-600' : 'bg-transparent border-gray-400'
            }`}>
            <FiCheck className={`w-4 h-4 text-white transition-transform ${form.consent ? 'scale-100' : 'scale-0'}`} />
          </div>
        </div>
        <div className="flex-grow">
          <label htmlFor="consent" className="text-sm font-black cursor-pointer block mb-1">Declaration</label>
          <p className={`text-xs font-medium leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            I hereby confirm that the information provided is accurate and I authorize Shivalik Service Hub to process my application for the selected service.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <button
          type="button"
          onClick={onBack}
          className={`px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${isDark
            ? 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900'
            }`}
          disabled={disabled}
        >
          Go Back
        </button>
        <button
          type="submit"
          className="flex-grow px-8 py-5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-violet-500/20 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
          disabled={disabled || uploading || !form.consent || !panPhoto}
        >
          {disabled ? 'Submitting...' : 'Confirm Identity & Continue'}
        </button>
      </div>
    </form>
  );
}
