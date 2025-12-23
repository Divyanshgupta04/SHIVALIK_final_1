import React, { useState, useEffect } from "react";
import { FiArrowLeft } from "react-icons/fi";

export default function PanForm({ initialValue, onBack, onSubmit, disabled }) {
  const [form, setForm] = useState({
    fullName: "",
    fatherName: "",
    dob: "",
    mobile: "",
    panNumber: "",
    consent: false,
  });

  useEffect(() => {
    if (initialValue) {
      setForm((prev) => ({
        ...prev,
        ...initialValue,
        consent: !!initialValue.consent,
      }));
    }
  }, [initialValue]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Auto-uppercase PAN
    if (name === "panNumber") {
      setForm({ ...form, [name]: value.toUpperCase() });
      return;
    }
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.consent) {
      alert("Please provide your consent to proceed.");
      return;
    }
    if (!/^[A-Z0-9]{10}$/.test(form.panNumber)) {
      alert("Please enter a valid 10-character PAN Number.");
      return;
    }
    onSubmit(form);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-none sm:shadow-md p-0 sm:p-6">
      <div className="flex items-center mb-6">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="p-2 mr-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
        )}
        <h2 className="text-xl font-semibold text-gray-800">PAN Verification</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            name="fullName"
            placeholder="As per PAN Card"
            value={form.fullName}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
            required
            disabled={disabled}
          />
        </div>

        {/* Father's Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name</label>
          <input
            type="text"
            name="fatherName"
            placeholder="Father's Full Name"
            value={form.fatherName}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            required
            disabled={disabled}
          />
        </div>

        {/* DOB & Mobile */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={form.dob}
              onChange={handleChange}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              required
              disabled={disabled}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
            <input
              type="tel"
              name="mobile"
              placeholder="10-digit mobile"
              value={form.mobile}
              onChange={handleChange}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              required
              pattern="[0-9]{10}"
              maxLength="10"
              disabled={disabled}
            />
          </div>
        </div>

        {/* PAN Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
          <input
            type="text"
            name="panNumber"
            placeholder="10-character PAN (e.g., ABCDE1234F)"
            value={form.panNumber}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none uppercase"
            required
            pattern="[A-Z0-9]{10}"
            maxLength="10"
            disabled={disabled}
          />
        </div>

        {/* Consent */}
        <div className="flex items-start gap-3 mt-4">
          <input
            type="checkbox"
            name="consent"
            checked={form.consent}
            onChange={handleChange}
            id="consent-pan"
            className="mt-1 w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
            required
            disabled={disabled}
          />
          <label htmlFor="consent-pan" className="text-sm text-gray-600 leading-snug">
            I hereby give my consent for the verification of my identity using the provided PAN details.
          </label>
        </div>

        <button
          type="submit"
          disabled={disabled}
          className="w-full bg-green-600 text-white font-medium py-2.5 rounded-lg hover:bg-green-700 transition-colors focus:ring-4 focus:ring-green-200 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
        >
          {disabled ? "Processing..." : "Verify & Continue"}
        </button>
      </form>
    </div>
  );
}
