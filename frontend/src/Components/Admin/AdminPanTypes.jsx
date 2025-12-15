import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { FiPlus, FiEdit, FiTrash2, FiLogOut, FiX, FiCreditCard } from 'react-icons/fi';
import config from '../../config/api';

const PanTypeModal = ({ show, onClose, onSubmit, title, isEdit = false, formData, setFormData }) => {
  if (!show) return null;

  const handleChange = useCallback((key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  }, [setFormData]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto my-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FiCreditCard />
            <span>{title}</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 font-medium mb-1">PAN Type Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
              className="w-full text-gray-900 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. New PAN Card"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
            <input
              type="text"
              value={formData.code}
              onChange={e => handleChange('code', e.target.value.toUpperCase())}
              disabled={isEdit}
              className="w-full p-2 border text-gray-900 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 uppercase"
              placeholder="e.g. NEW"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Short unique code used internally (shown in admin only).</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={e => handleChange('description', e.target.value)}
              className="w-full p-2 border text-gray-900 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Short note about where this PAN type is used"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fee (₹)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.fee}
                onChange={e => handleChange('fee', e.target.value)}
                className="w-full p-2 border text-gray-900 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={formData.discountPercent}
                onChange={e => handleChange('discountPercent', e.target.value)}
                className="w-full p-2 border text-gray-900 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Icon / Image URL</label>
            <input
              type="url"
              value={formData.iconUrl}
              onChange={e => handleChange('iconUrl', e.target.value)}
              className="w-full p-2 border text-gray-900 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/pan.png"
            />
            {formData.iconUrl && (
              <div className="mt-2">
                <img
                  src={formData.iconUrl}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded border"
                  onError={e => { e.target.style.display = 'none'; }}
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              id="isActive"
              type="checkbox"
              checked={!!formData.isActive}
              onChange={e => handleChange('isActive', e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">Active (visible on user PAN page)</label>
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-medium"
            >
              {isEdit ? 'Update' : 'Add'} PAN Type
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const AdminPanTypes = () => {
  const [panTypes, setPanTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPanType, setSelectedPanType] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    fee: '',
    discountPercent: 0,
    iconUrl: '',
    isActive: true,
  });
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchPanTypes();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) navigate('/admin/login');
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchPanTypes = async () => {
    try {
      const res = await axios.get(`${config.apiUrl}/api/admin/pan-types`, getAuthHeaders());
      if (res.data.success) setPanTypes(res.data.panTypes || []);
    } catch (e) {
      toast.error('Failed to load PAN types');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/admin/login');
    toast.success('Logged out successfully');
  };

  const openAdd = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      fee: '',
      discountPercent: 0,
      iconUrl: '',
      isActive: true,
    });
    setShowAddModal(true);
  };

  const openEdit = (pan) => {
    setSelectedPanType(pan);
    setFormData({
      name: pan.name || '',
      code: pan.code || '',
      description: pan.description || '',
      fee: pan.fee ?? '',
      discountPercent: pan.discountPercent ?? 0,
      iconUrl: pan.iconUrl || '',
      isActive: typeof pan.isActive === 'boolean' ? pan.isActive : true,
    });
    setShowEditModal(true);
  };

  const addPanType = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        fee: Number(formData.fee),
        discountPercent: Number(formData.discountPercent) || 0,
      };
      const res = await axios.post(`${config.apiUrl}/api/admin/pan-types`, payload, getAuthHeaders());
      if (res.data.success) {
        toast.success('PAN type added');
        setShowAddModal(false);
        fetchPanTypes();
      }
    } catch (e) {
      const message = e.response?.data?.message || 'Failed to add PAN type';
      toast.error(message);
    }
  };

  const editPanType = async (e) => {
    e.preventDefault();
    if (!selectedPanType?._id) return;
    try {
      const payload = {
        ...formData,
        fee: Number(formData.fee),
        discountPercent: Number(formData.discountPercent) || 0,
      };
      const res = await axios.put(`${config.apiUrl}/api/admin/pan-types/${selectedPanType._id}`, payload, getAuthHeaders());
      if (res.data.success) {
        toast.success('PAN type updated');
        setShowEditModal(false);
        setSelectedPanType(null);
        fetchPanTypes();
      }
    } catch (e) {
      const message = e.response?.data?.message || 'Failed to update PAN type';
      toast.error(message);
    }
  };

  const deletePanType = async (id) => {
    if (!window.confirm('Delete this PAN type?')) return;
    try {
      const res = await axios.delete(`${config.apiUrl}/api/admin/pan-types/${id}`, getAuthHeaders());
      if (res.data.success) {
        toast.success('PAN type deleted');
        fetchPanTypes();
      }
    } catch (e) {
      toast.error('Failed to delete PAN type');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-700">Loading PAN types...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FiCreditCard />
                <span>Admin  b7 PAN Types</span>
              </h1>
              <p className="text-sm text-gray-600 mt-1">Add or remove available PAN card types.</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              <FiLogOut />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">PAN Types Management</h2>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <FiPlus />
              <span>Add PAN Type</span>
            </button>
          </div>

          {panTypes.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No PAN types found. Use "Add PAN Type" to create your first type.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {panTypes.map((p) => {
                    const discount = Number(p.discountPercent || 0);
                    return (
                      <tr key={p._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex items-center gap-3">
                            {p.iconUrl ? (
                              <img
                                src={p.iconUrl}
                                alt={p.name}
                                className="w-10 h-10 rounded object-cover border"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                                No Image
                              </div>
                            )}
                            <div>
                              <div className="font-semibold">{p.name}</div>
                              {p.description && (
                                <div className="text-xs text-gray-500 max-w-xs line-clamp-2">{p.description}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 font-mono">{p.code}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 font-semibold">
                           a3{Number(p.fee || 0).toFixed(0)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {discount ? `${discount}%` : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                            {p.isActive ? 'Active' : 'Hidden'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEdit(p)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="Edit"
                            >
                              <FiEdit />
                            </button>
                            <button
                              onClick={() => deletePanType(p._id)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Delete"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <PanTypeModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={addPanType}
        title="Add New PAN Type"
        formData={formData}
        setFormData={setFormData}
      />
      <PanTypeModal
        show={showEditModal}
        onClose={() => { setShowEditModal(false); setSelectedPanType(null); }}
        onSubmit={editPanType}
        title="Edit PAN Type"
        isEdit
        formData={formData}
        setFormData={setFormData}
      />
    </div>
  );
};

export default AdminPanTypes;
