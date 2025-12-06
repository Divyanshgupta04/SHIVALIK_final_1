import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { FiPlus, FiEdit, FiTrash2, FiLogOut, FiX, FiBook } from 'react-icons/fi';
import config from '../../config/api';

const LibraryBookModal = ({ show, onClose, onSubmit, title, isEdit = false, formData, setFormData, categories }) => {
  if (!show) return null;
  const handleChange = useCallback((k, v) => setFormData(prev => ({ ...prev, [k]: v })), [setFormData]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto my-8">
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
            <label className="block text-sm text-gray-700 font-medium mb-1">Book ID</label>
            <input
              type="number"
              value={formData.id}
              onChange={e => handleChange('id', e.target.value)}
              disabled={isEdit}
              className="w-full text-gray-900 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => handleChange('title', e.target.value)}
              className="w-full p-2 border text-gray-900 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Author (optional)</label>
            <input
              type="text"
              value={formData.author}
              onChange={e => handleChange('author', e.target.value)}
              className="w-full p-2 border text-gray-900 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. R.K. Narayan"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={e => handleChange('description', e.target.value)}
              className="w-full p-2 border text-gray-900 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              rows="3"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
            <input
              type="text"
              value={formData.price}
              onChange={e => handleChange('price', e.target.value)}
              className="w-full p-2 border text-gray-900 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input
              type="url"
              value={formData.src}
              onChange={e => handleChange('src', e.target.value)}
              className="w-full p-2 border text-gray-900 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Library Category</label>
            <select
              value={formData.categorySlugOrId || ''}
              onChange={e => handleChange('categorySlugOrId', e.target.value)}
              className="w-full p-2 border text-gray-900 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 bg-white"
              required
            >
              <option value="">Select library category</option>
              {categories.map(c => (
                <option key={c._id} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-medium">
              {isEdit ? 'Update' : 'Add'} Book
            </button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 font-medium">
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const AdminLibraryBooks = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [formData, setFormData] = useState({ id: '', title: '', author: '', description: '', price: '', src: '', categorySlugOrId: '' });
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchCategories();
    fetchBooks();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) navigate('/admin/login');
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${config.apiUrl}/api/library/categories`);
      if (res.data.success) setCategories(res.data.categories);
    } catch (e) {
      toast.error('Failed to load library categories');
    }
  };

  const fetchBooks = async () => {
    try {
      const res = await axios.get(`${config.apiUrl}/api/library/books`);
      if (res.data.success) setBooks(res.data.books);
    } catch (e) {
      toast.error('Failed to load library books');
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
    const maxId = books.length ? Math.max(...books.map(b => b.id)) : 0;
    const defaultCat = categories[0]?.slug || '';
    setFormData({ id: maxId + 1, title: '', author: '', description: '', price: '', src: '', categorySlugOrId: defaultCat });
    setShowAddModal(true);
  };

  const openEdit = (b) => {
    setSelectedBook(b);
    setFormData({
      id: b.id,
      title: b.title,
      author: b.author || '',
      description: b.description,
      price: b.price,
      src: b.src,
      categorySlugOrId: b.category?.slug || '',
    });
    setShowEditModal(true);
  };

  const addBook = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${config.apiUrl}/api/library/books`, formData, getAuthHeaders());
      if (res.data.success) {
        toast.success('Library book added');
        setShowAddModal(false);
        fetchBooks();
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to add library book');
    }
  };

  const editBook = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${config.apiUrl}/api/library/books/${selectedBook.id}`, formData, getAuthHeaders());
      if (res.data.success) {
        toast.success('Library book updated');
        setShowEditModal(false);
        setSelectedBook(null);
        fetchBooks();
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update library book');
    }
  };

  const deleteBook = async (id) => {
    if (!window.confirm('Delete this book from library?')) return;
    try {
      const res = await axios.delete(`${config.apiUrl}/api/library/books/${id}`, getAuthHeaders());
      if (res.data.success) {
        toast.success('Library book deleted');
        fetchBooks();
      }
    } catch (e) {
      toast.error('Failed to delete library book');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-lg text-gray-700">Loading library books...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <FiBook className="text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin • Library Books</h1>
                <p className="text-sm text-gray-600 mt-1">Manage books inside each library category</p>
              </div>
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
            <h2 className="text-lg font-semibold text-gray-900">Library Books Management</h2>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <FiPlus /><span>Add Book</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {books.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">{b.id}</td>
                    <td className="px-6 py-4"><img src={b.src} alt={b.title} className="w-12 h-12 object-cover rounded" /></td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{b.title}</div>
                      <div className="text-sm text-gray-500 line-clamp-1">{b.description}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{b.category?.name || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">₹{b.price}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(b)} className="text-blue-600 hover:text-blue-900 p-1" title="Edit">
                          <FiEdit />
                        </button>
                        <button onClick={() => deleteBook(b.id)} className="text-red-600 hover:text-red-900 p-1" title="Delete">
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <LibraryBookModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={addBook}
        title="Add New Book"
        formData={formData}
        setFormData={setFormData}
        categories={categories}
      />
      <LibraryBookModal
        show={showEditModal}
        onClose={() => { setShowEditModal(false); setSelectedBook(null); }}
        onSubmit={editBook}
        title="Edit Book"
        isEdit
        formData={formData}
        setFormData={setFormData}
        categories={categories}
      />
    </div>
  );
};

export default AdminLibraryBooks;
