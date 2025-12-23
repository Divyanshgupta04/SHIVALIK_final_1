import React, { useState, useEffect } from "react";
import { FiArrowLeft } from "react-icons/fi";

export default function AadhaarForm({ initialValue, onBack, onSubmit, disabled }) {
  const [form, setForm] = useState({
    fullName: "",
    dob: "",
    gender: "",
    mobile: "",
    address: "",
    aadhaarNumber: "",
    consent: false,
  });

  useEffect(() => {
    if (initialValue) {
      setForm((prev) => ({
        ...prev,
        ...initialValue,
        // Ensure booleans are correctly set
        consent: !!initialValue.consent,
      }));
    }
  }, [initialValue]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
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
    // Validation allows 12 digits for Aadhaar
    if (!/^\d{12}$/.test(form.aadhaarNumber)) {
      alert("Please enter a valid 12-digit Aadhaar Number.");
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
        <h2 className="text-xl font-semibold text-gray-800">Aadhaar Verification</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            name="fullName"
            placeholder="As per Aadhaar"
            value={form.fullName}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            required
            disabled={disabled}
          />
        </div>

        {/* DOB & Gender */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={form.dob}
              onChange={handleChange}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
              disabled={disabled}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
              disabled={disabled}
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Mobile & Aadhaar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
          <input
            type="tel"
            name="mobile"
            placeholder="10-digit mobile number"
            value={form.mobile}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
            pattern="[0-9]{10}"
            maxLength="10"
            disabled={disabled}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number</label>
          <input
            type="text"
            name="aadhaarNumber"
            placeholder="12-digit Aadhaar Number"
            value={form.aadhaarNumber}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
            pattern="\d{12}"
            maxLength="12"
            disabled={disabled}
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <textarea
            name="address"
            placeholder="Full Address with Pincode"
            value={form.address}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            rows="3"
            required
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
            id="consent-check"
            className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            required
            disabled={disabled}
          />
          <label htmlFor="consent-check" className="text-sm text-gray-600 leading-snug">
            I hereby give my consent for the verification of my identity using the provided Aadhaar details for the purpose of availing services.
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={disabled}
          className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition-colors focus:ring-4 focus:ring-blue-200 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
        >
          {disabled ? "Processing..." : "Verify & Continue"}
        </button>
      </form>
    </div>
  );
}
