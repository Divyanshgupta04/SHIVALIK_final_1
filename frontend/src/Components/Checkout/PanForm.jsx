import React, { useState } from 'react';

// PanForm
// Collects basic identity details needed for PAN-required services.

export default function PanForm({ initialValue, onSubmit, onBack, disabled }) {
  const [form, setForm] = useState({
    fullName: initialValue?.fullName || '',
    fatherName: initialValue?.fatherName || '',
    panNumber: initialValue?.panNumber || '',
    dob: initialValue?.dob || '',
    consent: !!initialValue?.consent,
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.consent) {
      window.alert('Consent is required to continue.');
      return;
    }
    onSubmit?.(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Full Name</label>
        <input
          value={form.fullName}
          onChange={(e) => set('fullName', e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Father's Name</label>
        <input
          value={form.fatherName}
          onChange={(e) => set('fatherName', e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">PAN Number</label>
          <input
            value={form.panNumber}
            onChange={(e) => set('panNumber', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
            placeholder="ABCDE1234F"
            required
          />
          <p className="mt-1 text-xs text-gray-500">Uppercase letters + digits (demo validation).</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
          <input
            type="date"
            value={form.dob}
            onChange={(e) => set('dob', e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
            required
          />
        </div>
      </div>

      <label className="flex items-start gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={form.consent}
          onChange={(e) => set('consent', e.target.checked)}
          className="mt-1 h-4 w-4"
        />
        <span>
          I confirm the above details are accurate and I consent to identity verification for this order.
        </span>
      </label>

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          disabled={disabled}
        >
          Back
        </button>
        <button
          type="submit"
          className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          disabled={disabled}
        >
          Submit PAN Details
        </button>
      </div>
    </form>
  );
}
