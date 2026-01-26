import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

// DeliveryForm
// Collects the delivery address after successful identity submission.

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

  const inputClasses = `w-full rounded-lg border px-4 py-3 outline-none transition-all ${isDark
      ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-500'
      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-400'
    }`;

  const labelClasses = `block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
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

        <div>
          <label className={labelClasses}>Address (House No, Street, Area)</label>
          <textarea
            value={form.address}
            onChange={(e) => set('address', e.target.value)}
            className={inputClasses}
            rows={3}
            placeholder="Enter your full address"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClasses}>City</label>
            <input
              value={form.city}
              onChange={(e) => set('city', e.target.value)}
              className={inputClasses}
              placeholder="City"
              required
            />
          </div>
          <div>
            <label className={labelClasses}>State</label>
            <input
              value={form.state}
              onChange={(e) => set('state', e.target.value)}
              className={inputClasses}
              placeholder="State"
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
          disabled={disabled}
        >
          Proceed to Review
        </button>
      </div>
    </form>
  );
}
