import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { FiUploadCloud, FiCheck, FiTrash2, FiUser, FiCalendar, FiPhone, FiHash, FiCreditCard } from 'react-icons/fi';

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
  const [dragType, setDragType] = useState(null);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const processFile = async (type, file) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return alert('File size must be less than 2MB');
    if (!file.type.startsWith('image/')) return alert('Please upload an image file');

    setUploading(prev => ({ ...prev, [type]: true }));
    try {
      const base64 = await resizeImage(file, 1200);
      if (type === 'aadhaar') setAadhaarPhoto(base64);
      else setPanPhoto(base64);
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
    if (!aadhaarPhoto) return alert('Please upload Aadhaar card photo.');
    if (!panPhoto) return alert('Please upload PAN card photo.');
    onSubmit?.({ ...form, aadhaarPhoto, panPhoto });
  };

  const inputClasses = `w-full rounded-2xl border px-5 py-4 outline-none transition-all duration-300 font-medium ${isDark
    ? 'bg-white/5 border-white/10 text-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 placeholder-gray-600'
    : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-violet-600 focus:ring-4 focus:ring-violet-600/10 placeholder-gray-400'
    }`;

  const labelClasses = `block text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${isDark ? 'text-violet-400' : 'text-violet-600'}`;

  const UploadBox = ({ type, photo, setPhoto, isUploading, label }) => (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragType(type); }}
      onDragLeave={() => setDragType(null)}
      onDrop={(e) => { e.preventDefault(); setDragType(null); processFile(type, e.dataTransfer.files?.[0]); }}
      className={`
        relative group cursor-pointer rounded-3xl border-2 border-dashed transition-all duration-500 overflow-hidden
        ${dragType === type ? 'border-violet-500 bg-violet-500/10 scale-[0.99]' :
          isDark ? 'border-white/10 hover:border-violet-500/50 hover:bg-white/5' : 'border-gray-200 hover:border-violet-500/50 hover:bg-gray-50'}
      `}
    >
      <input
        type="file"
        accept="image/*"
        className="absolute inset-0 opacity-0 cursor-pointer z-10"
        onChange={(e) => processFile(type, e.target.files?.[0])}
        disabled={isUploading || disabled}
      />

      <div className="p-6 text-center">
        <AnimatePresence mode="wait">
          {photo ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="relative inline-block group/preview">
                <img src={photo} alt="Preview" className="max-h-32 rounded-xl shadow-lg mx-auto ring-2 ring-violet-500/20" />
                <button type="button" onClick={(e) => { e.stopPropagation(); setPhoto(null); }} className="absolute -top-2 -right-2 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-rose-600 z-20">
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] font-bold text-emerald-500 mt-2 uppercase tracking-widest">{label} Uploaded</p>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
              <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center transition-transform group-hover:scale-110 ${isDark ? 'bg-violet-500/10' : 'bg-violet-50'}`}>
                <FiUploadCloud className="w-6 h-6 text-violet-500" />
              </div>
              <p className="text-sm font-black tracking-tight">{label}</p>
              <p className={`text-[10px] font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Click or drag & drop</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* Step 1: Personal Profile */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-black">1</div>
          <h3 className="text-sm font-black uppercase tracking-widest">Personal Profile</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className={labelClasses}>Full Legal Name</label>
            <div className="relative">
              <FiUser className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input value={form.fullName} onChange={(e) => set('fullName', e.target.value)} className={`${inputClasses} pl-12`} placeholder="As per official documents" required />
            </div>
          </div>
          <div>
            <label className={labelClasses}>Date of Birth</label>
            <div className="relative">
              <FiCalendar className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="date" value={form.dob} onChange={(e) => set('dob', e.target.value)} className={`${inputClasses} pl-12`} required />
            </div>
          </div>
          <div>
            <label className={labelClasses}>Mobile Number</label>
            <div className="relative">
              <FiPhone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input value={form.mobile} onChange={(e) => set('mobile', e.target.value.replace(/[^0-9]/g, '').slice(0, 10))} className={`${inputClasses} pl-12`} placeholder="10 digits" required />
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: Identification Documents */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-black">2</div>
          <h3 className="text-sm font-black uppercase tracking-widest">Identification Documents</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Aadhaar Card Section */}
          <div className="space-y-4">
            <label className={labelClasses}>Aadhaar Card Details</label>
            <div className="relative mb-4">
              <FiHash className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input value={form.aadhaarNumber} onChange={(e) => set('aadhaarNumber', e.target.value.replace(/[^0-9]/g, '').slice(0, 12))} className={`${inputClasses} pl-12 tracking-[0.2em]`} placeholder="12 Digit Aadhaar" required />
            </div>
            <UploadBox type="aadhaar" photo={aadhaarPhoto} setPhoto={setAadhaarPhoto} isUploading={uploading.aadhaar} label="Upload Aadhaar Card" />
          </div>

          {/* PAN Card Section */}
          <div className="space-y-4">
            <label className={labelClasses}>PAN Card Details</label>
            <div className="relative mb-4">
              <FiCreditCard className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input value={form.panNumber} onChange={(e) => set('panNumber', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))} className={`${inputClasses} pl-12 font-mono`} placeholder="PAN Card Number" required />
            </div>
            <div className="relative mb-4">
              <FiUser className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input value={form.fatherName} onChange={(e) => set('fatherName', e.target.value)} className={`${inputClasses} pl-12`} placeholder="Father's Name (as on PAN)" required />
            </div>
            <UploadBox type="pan" photo={panPhoto} setPhoto={setPanPhoto} isUploading={uploading.pan} label="Upload PAN Card" />
          </div>
        </div>
      </div>

      {/* Consent & Submission */}
      <div className="space-y-6 pt-4 border-t border-dashed dark:border-white/10 border-gray-200">
        <div className={`p-5 rounded-3xl border flex items-start gap-4 transition-all duration-300 ${form.consent ? (isDark ? 'bg-violet-500/10 border-violet-500/30' : 'bg-violet-50 border-violet-200') : (isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100')}`}>
          <div className="relative flex items-center justify-center pt-1">
            <input id="consent" type="checkbox" checked={form.consent} onChange={(e) => set('consent', e.target.checked)} className="peer w-6 h-6 rounded-lg opacity-0 absolute cursor-pointer z-10" />
            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${form.consent ? 'bg-violet-600 border-violet-600' : 'bg-transparent border-gray-400'}`}>
              <FiCheck className={`w-4 h-4 text-white transition-transform ${form.consent ? 'scale-100' : 'scale-0'}`} />
            </div>
          </div>
          <div className="flex-grow">
            <label htmlFor="consent" className="text-sm font-black cursor-pointer block mb-1">Authorization & Declaration</label>
            <p className={`text-xs font-medium leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>I confirm that the documents uploaded belong to me and the information provided is true. I authorize the processing of my service request using these credentials.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button type="button" onClick={onBack} className={`px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${isDark ? 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900'}`} disabled={disabled}>Go Back</button>
          <button type="submit" className="flex-grow px-8 py-5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-violet-500/20 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2" disabled={disabled || uploading.aadhaar || uploading.pan || !form.consent || !aadhaarPhoto || !panPhoto}>
            {uploading.aadhaar || uploading.pan ? 'Processing...' : 'Verify Documents & Continue'}
          </button>
        </div>
      </div>
    </form>
  );
}
