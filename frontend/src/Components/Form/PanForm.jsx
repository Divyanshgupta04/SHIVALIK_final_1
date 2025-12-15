import React, { useState } from "react";

export default function PanForm() {
  const [form, setForm] = useState({
    name: "",
    fatherName: "",
    dob: "",
    mobile: "",
    aadhaar: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("PAN Form Data:", form);
    alert("PAN Form Submitted");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-semibold mb-4 text-center">
          PAN Card Form
        </h2>

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
          type="text"
          name="fatherName"
          placeholder="Father's Name"
          value={form.fatherName}
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

        <input
          type="tel"
          name="mobile"
          placeholder="Mobile Number"
          value={form.mobile}
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
          className="w-full border p-2 rounded mb-4"
          required
        />

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Submit PAN Form
        </button>
      </form>
    </div>
  );
}
