import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { FiUser, FiPhone, FiMapPin, FiTruck, FiChevronRight } from 'react-icons/fi';

export default function DeliveryForm({ initialValue, onSubmit, onBack, disabled }) {
  const { isDark } = useTheme();
  const [form, setForm] = useState({
    fullName: initialValue?.fullName || '',
    mobile: initialValue?.mobile || '',
    address: initialValue?.address || '',
    city: initialValue?.city || '',
    state: initialValue?.state || '',
    pincode: initialValue?.pincode || '',
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(form);
  };

  const inputClasses = `w-full rounded-2xl border px-5 py-4 outline-none transition-all duration-300 font-medium ${isDark
    ? 'bg-white/5 border-white/10 text-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 placeholder-gray-600'
    : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-violet-600 focus:ring-4 focus:ring-violet-600/10 placeholder-gray-400'
    }`;

  const labelClasses = `block text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${isDark ? 'text-violet-400' : 'text-violet-600'}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClasses}>Receiver Full Name</label>
          <div className="relative">
            <FiUser className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={form.fullName}
              onChange={(e) => set('fullName', e.target.value)}
              className={`${inputClasses} pl-12`}
              placeholder="e.g. John Doe"
              required
            />
          </div>
        </div>

        <div>
          <label className={labelClasses}>Contact Number</label>
          <div className="relative">
            <FiPhone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={form.mobile}
              onChange={(e) => set('mobile', e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
              className={`${inputClasses} pl-12`}
              placeholder="10 digit mobile number"
              required
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className={labelClasses}>Full Address</label>
          <div className="relative">
            <FiMapPin className="absolute left-5 top-5 text-gray-500" />
            <textarea
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
              className={`${inputClasses} pl-12 resize-none`}
              rows={3}
              placeholder="House No., Building Name, Street, Locality..."
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:col-span-2">
          <div>
            <label className={labelClasses}>City</label>
            <input
              value={form.city}
              onChange={(e) => set('city', e.target.value)}
              className={inputClasses}
              placeholder="e.g. Mumbai"
              required
            />
          </div>
          <div>
            <label className={labelClasses}>State</label>
            <input
              value={form.state}
              onChange={(e) => set('state', e.target.value)}
              className={inputClasses}
              placeholder="e.g. Maharashtra"
              required
            />
          </div>
          <div>
            <label className={labelClasses}>Pincode</label>
            <input
              value={form.pincode}
              onChange={(e) => set('pincode', e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
              className={inputClasses}
              placeholder="6 digits"
              required
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-dashed dark:border-white/10 border-gray-200">
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
          className="flex-grow px-8 py-5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-violet-500/20 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3"
          disabled={disabled}
        >
          <FiTruck className="w-5 h-5" />
          Ship to this Address
          <FiChevronRight className="w-5 h-5 ml-auto sm:ml-0" />
        </button>
      </div>
    </form>
  );
}
