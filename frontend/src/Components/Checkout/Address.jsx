import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Address = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India'
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get('/api/user-auth/address');
        if (res.data.success && res.data.address) {
          setForm(prev => ({ ...prev, ...res.data.address }));
        }
      } catch (err) {
        // no-op: new users may have no address yet
      }
    };
    load();
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.put('/api/user-auth/address', form);
      if (res.data.success) {
        toast.success('Address saved');
        navigate('/pay', { 
          state: { addressUpdated: true },
          replace: true
        });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save address';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Delivery Address</h1>
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input name="fullName" value={form.fullName} onChange={onChange} required className="w-full border text-black rounded px-3 py-2" placeholder='enter full name ' />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input name="phone" value={form.phone} onChange={onChange} required className="w-full border rounded text-black px-3 py-2" placeholder="10-digit phone" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
            <input name="postalCode" value={form.postalCode} onChange={onChange} required className="w-full border text-black rounded px-3 py-2" placeholder="PIN code" />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
            <input name="line1" value={form.line1} onChange={onChange} required className="w-full border rounded text-black px-3 py-2" placeholder="House no, Street, Area" />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
            <input name="line2" value={form.line2} onChange={onChange} className="w-full border rounded px-3 text-black py-2" placeholder="Landmark (optional)" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input name="city" value={form.city} onChange={onChange} required className="w-full border rounded text-black px-3 py-2" placeholder="City" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input name="state" value={form.state} onChange={onChange} required className="w-full border rounded text-black px-3 py-2" placeholder="State" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <input name="country" value={form.country} onChange={onChange} required className="w-full border rounded text-black px-3 py-2" placeholder="Country" />
          </div>
          <div className="col-span-1 md:col-span-2 mt-2">
            <button disabled={saving} type="submit" className="w-full bg-indigo-600 text-white py-3 rounded hover:bg-indigo-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save & Continue to Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Address;
