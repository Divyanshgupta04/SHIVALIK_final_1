import React, { useState } from "react";

export default function UniversalIDForm() {
  const [type, setType] = useState("aadhaar");

  const [form, setForm] = useState({
    name: "",
    fatherName: "",
    dob: "",
    gender: "",
    mobile: "",
    address: "",
    aadhaar: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (type === "aadhaar") {
      console.log("Aadhaar Data:", form);
      alert("Aadhaar Form Submitted");
    } else {
      console.log("PAN Data:", form);
      alert("PAN Form Submitted");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Aadhaar / PAN Application
        </h2>

        {/* Select Form Type */}
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        >
          <option value="aadhaar">Aadhaar Card</option>
          <option value="pan">PAN Card</option>
        </select>

        {/* Common Fields */}
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          className="w-full border p-2 rounded mb-3"
          required
        />

        <input
          type="date"
          name="dob"
          value={form.dob}
          onChange={handleChange}
          className="w-full border p-2 rounded mb-3"
          required
        />

        {type === "aadhaar" && (
          <>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full border p-2 rounded mb-3"
              required
            >
              <option value="">Select Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>

            <textarea
              name="address"
              placeholder="Full Address"
              value={form.address}
              onChange={handleChange}
              className="w-full border p-2 rounded mb-3"
              rows="3"
              required
            />
          </>
        )}

        {type === "pan" && (
          <>
            <input
              type="text"
              name="fatherName"
              placeholder="Father's Name"
              value={form.fatherName}
              onChange={handleChange}
              className="w-full border p-2 rounded mb-3"
              required
            />

            <input
              type="text"
              name="aadhaar"
              placeholder="Aadhaar Number"
              value={form.aadhaar}
              onChange={handleChange}
              className="w-full border p-2 rounded mb-3"
              required
            />
          </>
        )}

        {/* Common Mobile */}
        <input
          type="tel"
          name="mobile"
          placeholder="Mobile Number"
          value={form.mobile}
          onChange={handleChange}
          className="w-full border p-2 rounded mb-4"
          required
        />

        <button
          type="submit"
          className={`w-full text-white py-2 rounded ${
            type === "aadhaar"
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          Submit {type === "aadhaar" ? "Aadhaar" : "PAN"} Form
        </button>
      </form>
    </div>
  );
}
