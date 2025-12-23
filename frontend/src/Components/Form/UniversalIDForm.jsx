import React, { useState, useEffect } from "react";
import { FiArrowLeft } from "react-icons/fi";

export default function UniversalIDForm({ initialValue, onBack, onSubmit, disabled }) {
  const [form, setForm] = useState({
    fullName: "",
    fatherName: "",
    dob: "",
    gender: "",
    mobile: "",
    address: "",
    aadhaarNumber: "",
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
    if (!/^\d{12}$/.test(form.aadhaarNumber)) {
      alert("Please enter a valid 12-digit Aadhaar Number.");
      return;
    }
    if (!/^[A-Z0-9]{10}$/.test(form.panNumber)) {
      alert("Please enter a valid 10-character PAN Number.");
      return;
    }
    onSubmit(form);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-none sm:shadow-md p-0 sm:p-6">
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
        <h2 className="text-xl font-semibold text-gray-800">Complete ID Verification</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Personal Details Section */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">Personal Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={form.fullName}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                required
                disabled={disabled}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name</label>
              <input
                type="text"
                name="fatherName"
                placeholder="Father's Name"
                value={form.fatherName}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                required
                disabled={disabled}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={form.dob}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
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
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                required
                disabled={disabled}
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <input
                type="tel"
                name="mobile"
                placeholder="10-digit mobile"
                value={form.mobile}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                required
                pattern="[0-9]{10}"
                maxLength="10"
                disabled={disabled}
              />
            </div>
          </div>
        </div>

        {/* Identity Numbers */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">Identity Proofs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number</label>
              <input
                type="text"
                name="aadhaarNumber"
                placeholder="12-digit Aadhaar"
                value={form.aadhaarNumber}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                required
                pattern="\d{12}"
                maxLength="12"
                disabled={disabled}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
              <input
                type="text"
                name="panNumber"
                placeholder="10-digit PAN"
                value={form.panNumber}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                required
                pattern="[A-Z0-9]{10}"
                maxLength="10"
                disabled={disabled}
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">Address</h3>
          <div>
            <textarea
              name="address"
              placeholder="Full Address with Pincode"
              value={form.address}
              onChange={handleChange}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              rows="3"
              required
              disabled={disabled}
            />
          </div>
        </div>

        {/* Consent */}
        <div className="bg-indigo-50 p-4 rounded-lg flex items-start gap-3">
          <input
            type="checkbox"
            name="consent"
            checked={form.consent}
            onChange={handleChange}
            id="consent-universal"
            className="mt-1 w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
            required
            disabled={disabled}
          />
          <label htmlFor="consent-universal" className="text-sm text-indigo-900 leading-snug">
            I hereby declare that the details furnished above are true and correct to the best of my knowledge and belief and I undertake the responsibility to inform about any changes therein, immediately. In case any of the above information is found to be false or untrue or misleading or misrepresenting, I am aware that I may be held liable for it.
          </label>
        </div>

        <button
          type="submit"
          disabled={disabled}
          className="w-full bg-indigo-600 text-white font-medium py-3 rounded-lg hover:bg-indigo-700 transition-colors focus:ring-4 focus:ring-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {disabled ? "Verifying..." : "Submit All verifications"}
        </button>
      </form>
    </div>
  );
}
