import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { FiPlus, FiEdit, FiTrash2, FiLogOut, FiX } from 'react-icons/fi'
import config from '../../config/api'

const CategoryModal = ({ show, onClose, onSubmit, title, isEdit = false, formData, setFormData }) => {
  if (!show) return null
  const handleChange = useCallback((k, v) => setFormData(prev => ({ ...prev, [k]: v })), [setFormData])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
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
            <label className="block text-sm text-gray-700 font-medium mb-1">Category Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
              className="w-full text-gray-900 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Insurance"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL-friendly)</label>
            <input
              type="text"
              value={formData.slug}
              onChange={e => handleChange('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
              disabled={isEdit}
              className="w-full p-2 border text-gray-900 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. insurance"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Auto-generated from name, or customize it</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={e => handleChange('imageUrl', e.target.value)}
              className="w-full p-2 border text-gray-900 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/image.jpg"
            />
            {formData.imageUrl && (
              <div className="mt-2">
                <img src={formData.imageUrl} alt="Preview" className="w-24 h-24 object-cover rounded border" />
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-medium">
              {isEdit ? 'Update' : 'Add'} Category
            </button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 font-medium">
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

const AdminCategories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [formData, setFormData] = useState({ name: '', slug: '', imageUrl: '' })
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth();
    fetchCategories();
  }, [])

  // Auto-generate slug from name


  const checkAuth = () => {
    const token = localStorage.getItem('adminToken')
    if (!token) navigate('/admin/login')
  }

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken')
    return { headers: { Authorization: `Bearer ${token}` } }
  }

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${config.apiUrl}/api/categories`)
      if (res.data.success) setCategories(res.data.categories)
    } catch (e) {
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/admin/login');
    toast.success('Logged out successfully')
  }



  const openEdit = (cat) => {
    setSelectedCategory(cat);
    setFormData({ name: cat.name, slug: cat.slug, imageUrl: cat.imageUrl || '' });
    setShowEditModal(true)
  }



  const editCategory = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.put(`${config.apiUrl}/api/categories/${selectedCategory.slug}`, formData, getAuthHeaders())
      if (res.data.success) {
        toast.success('Category updated');
        setShowEditModal(false);
        setSelectedCategory(null);
        fetchCategories()
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update category')
    }
  }

  const deleteCategory = async (slug) => {
    if (!window.confirm('Delete this category? Products with this category will not be deleted.')) return
    try {
      const res = await axios.delete(`${config.apiUrl}/api/categories/${slug}`, getAuthHeaders())
      if (res.data.success) {
        toast.success('Category deleted');
        fetchCategories()
      }
    } catch (e) {
      toast.error('Failed to delete category')
    }
  }


  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-lg text-gray-700">Loading categories...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin • Categories</h1>
              <p className="text-sm text-gray-600 mt-1">Manage product categories</p>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
              <FiLogOut /><span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Categories Management</h2>

          </div>

          {categories.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No categories found. Please use <b>Catalog Manager</b> to create new categories.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {categories.map(cat => (
                <motion.div
                  key={cat.slug}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-start gap-3">
                    {cat.imageUrl ? (
                      <img src={cat.imageUrl} alt={cat.name} className="w-16 h-16 object-cover rounded" />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                        No Image
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                      <p className="text-sm text-gray-500">/{cat.slug}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => openEdit(cat)}
                      className="flex-1 flex items-center justify-center gap-1 text-blue-600 hover:text-blue-900 border border-blue-300 hover:bg-blue-50 p-2 rounded text-sm"
                    >
                      <FiEdit /><span>Edit</span>
                    </button>
                    <button
                      onClick={() => deleteCategory(cat.slug)}
                      className="flex-1 flex items-center justify-center gap-1 text-red-600 hover:text-red-900 border border-red-300 hover:bg-red-50 p-2 rounded text-sm"
                    >
                      <FiTrash2 /><span>Delete</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>


      <CategoryModal
        show={showEditModal}
        onClose={() => { setShowEditModal(false); setSelectedCategory(null) }}
        onSubmit={editCategory}
        title="Edit Category"
        isEdit
        formData={formData}
        setFormData={setFormData}
      />
    </div>
  )
}

export default AdminCategories
