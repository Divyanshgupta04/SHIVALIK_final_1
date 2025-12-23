import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import config from '../../config/api';
import {
  FiPlus, FiEdit, FiTrash2, FiLogOut, FiBarChart, FiUsers, FiShoppingCart,
  FiDollarSign, FiTrendingUp, FiPackage, FiEye, FiStar, FiActivity,
  FiHome, FiSettings, FiHelpCircle, FiMenu, FiX, FiArrowUp, FiArrowDown,
  FiRefreshCw, FiCalendar, FiClock, FiMapPin, FiGrid, FiBook, FiCreditCard
} from 'react-icons/fi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts';

// Move ProductModal outside to prevent re-creation on each render
const ProductModal = ({ show, onClose, onSubmit, title, isEdit = false, formData, setFormData }) => {
  if (!show) return null;

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, [setFormData]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto my-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
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
            <label className="block text-sm font-medium mb-1">Product ID</label>
            <input
              type="number"
              value={formData.id}
              onChange={(e) => handleInputChange('id', e.target.value)}
              disabled={isEdit}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              rows="3"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <input
              type="text"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Image URL</label>
            <input
              type="url"
              value={formData.src}
              onChange={(e) => handleInputChange('src', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {/* Toggle to connect/detach a form with this product */}
          <div className="pt-2">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!formData.hasForm}
                onChange={(e) => handleInputChange('hasForm', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Enable form for this product</span>
            </label>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              {isEdit ? 'Update' : 'Add'} Product
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderStats, setOrderStats] = useState({ totalOrders: 0, revenue: 0, byStatus: {}, monthly: [], productStats: [] });
  const [stats, setStats] = useState({ totalProducts: 0, recentProducts: [], totalUsers: 0, verifiedUsers: 0, recentUsers: [] });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();

  // Users state
  const [users, setUsers] = useState([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersPagination, setUsersPagination] = useState({ totalUsers: 0, totalPages: 1, hasNext: false, hasPrev: false });

  // Form state
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    price: '',
    src: '',
    hasForm: false,
  });

  useEffect(() => {
    checkAuth();
    fetchProducts();
    fetchDashboardStats();
    fetchUsers(1);
    fetchOrders(1);
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/api/admin/products`, getAuthHeaders());
      if (response.data.success) {
        setProducts(response.data.products);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        handleLogout();
      } else {
        toast.error('Failed to fetch products');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/api/admin/dashboard`, getAuthHeaders());
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    }
  };

  // Fetch orders for dashboard widgets and compute analytics
  const fetchOrders = async (page = 1) => {
    try {
      // Fetch more orders for better analytics
      const response = await axios.get(`${config.apiUrl}/api/admin/orders?page=${page}&limit=50`, getAuthHeaders());
      if (response.data.success) {
        setOrders(response.data.orders.slice(0, 8)); // Keep only 8 for display

        // Compute derived stats from all orders
        const allOrders = response.data.orders;
        const byStatus = {};
        let revenue = 0;
        const monthlyData = {};
        const productData = {};

        allOrders.forEach(order => {
          // Status distribution
          byStatus[order.status] = (byStatus[order.status] || 0) + 1;
          revenue += order.total || 0;

          // Monthly trends
          const month = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short' });
          if (!monthlyData[month]) {
            monthlyData[month] = { name: month, orders: 0, revenue: 0 };
          }
          monthlyData[month].orders += 1;
          monthlyData[month].revenue += order.total || 0;

          // Product performance from order items
          if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
              const productName = item.title || 'Unknown Product';
              if (!productData[productName]) {
                productData[productName] = {
                  name: productName,
                  sales: 0,
                  revenue: 0,
                  quantity: 0
                };
              }
              productData[productName].sales += 1;
              productData[productName].quantity += item.quantity || 1;
              productData[productName].revenue += (parseFloat(item.price) || 0) * (item.quantity || 1);
            });
          }
        });

        // Sort products by revenue and take top 6
        const topProducts = Object.values(productData)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 6);

        setOrderStats({
          totalOrders: response.data.pagination.totalOrders,
          revenue,
          byStatus,
          monthly: Object.values(monthlyData).sort((a, b) => {
            // Sort months chronologically
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return months.indexOf(a.name) - months.indexOf(b.name);
          }),
          productStats: topProducts
        });
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const fetchUsers = async (page = 1) => {
    try {
      const response = await axios.get(`${config.apiUrl}/api/admin/users?page=${page}&limit=10`, getAuthHeaders());
      if (response.data.success) {
        setUsers(response.data.users);
        setUsersPagination(response.data.pagination);
        setUsersPage(page);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/admin/login');
    toast.success('Logged out successfully');
  };

  const resetForm = () => {
    setFormData({
      id: '',
      title: '',
      description: '',
      price: '',
      src: '',
      hasForm: false,
    });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${config.apiUrl}/api/admin/products`,
        formData,
        getAuthHeaders()
      );

      if (response.data.success) {
        toast.success('Product added successfully!');
        setShowAddModal(false);
        resetForm();
        fetchProducts();
        fetchDashboardStats();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add product';
      toast.error(message);
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${config.apiUrl}/api/admin/products/${selectedProduct.id}`,
        formData,
        getAuthHeaders()
      );

      if (response.data.success) {
        toast.success('Product updated successfully!');
        setShowEditModal(false);
        setSelectedProduct(null);
        resetForm();
        fetchProducts();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update product';
      toast.error(message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await axios.delete(
          `${config.apiUrl}/api/admin/products/${productId}`,
          getAuthHeaders()
        );

        if (response.data.success) {
          toast.success('Product deleted successfully!');
          fetchProducts();
          fetchDashboardStats();
        }
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to delete product';
        toast.error(message);
      }
    }
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setFormData({
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      src: product.src,
      hasForm: !!product.hasForm,
    });
    setShowEditModal(true);
  };

  const openAddModal = () => {
    // Auto-generate next ID
    const maxId = products.length > 0 ? Math.max(...products.map(p => p.id)) : 0;
    setFormData({
      id: maxId + 1,
      title: '',
      description: '',
      price: '',
      src: '',
      hasForm: false,
    });
    setShowAddModal(true);
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-xl animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  // Helper for status chip styles
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-indigo-100 text-indigo-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-700" onClick={() => setSidebarOpen(v => !v)} aria-label="Toggle sidebar">
                {sidebarOpen ? <FiX /> : <FiMenu />}
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => { fetchProducts(); fetchDashboardStats(); fetchOrders(); }} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
                <FiRefreshCw /> <span>Refresh</span>
              </button>
              <button onClick={handleLogout} className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                <FiLogOut /> <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className={`w-full md:w-64 md:flex-shrink-0 ${sidebarOpen ? 'block' : 'hidden md:block'}`}>
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden md:sticky md:top-24">
              <div className="p-4 border-b font-semibold flex items-center gap-2 text-gray-800">
                <FiHome className="text-gray-600" />
                <span>Menu</span>
              </div>
              <nav className="p-2 space-y-1">
                <a href="/admin/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 font-medium">
                  <FiActivity /> <span>Overview</span>
                </a>
                <a href="/admin/products" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700">
                  <FiPackage /> <span>Products</span>
                </a>
                <a href="/admin/categories" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700">
                  <FiGrid /> <span>Categories</span>
                </a>
                <a href="/admin/catalog" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700">
                  <FiGrid /> <span>Catalog Manager</span>
                </a>

                <a href="/admin/orders" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700">
                  <FiShoppingCart /> <span>Orders</span>
                </a>
                <a href="/admin/users" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700">
                  <FiUsers /> <span>Users</span>
                </a>
                <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700">
                  <FiSettings /> <span>Settings</span>
                </a>
                <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700">
                  <FiHelpCircle /> <span>Help</span>
                </a>
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0 space-y-6">
            {/* KPI cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border shadow-sm p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">₹{orderStats.revenue?.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-full bg-emerald-50 text-emerald-600"><FiDollarSign /></div>
                </div>
                <div className="mt-3 text-xs text-emerald-600 inline-flex items-center gap-1">
                  <FiArrowUp /> <span>Live (from recent orders)</span>
                </div>
              </div>
              <div className="bg-white rounded-xl border shadow-sm p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Total Products</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                  </div>
                  <div className="p-3 rounded-full bg-indigo-50 text-indigo-600"><FiBarChart /></div>
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  <span>Latest: {stats.recentProducts?.[0]?.title || '—'}</span>
                </div>
              </div>
              <div className="bg-white rounded-xl border shadow-sm p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers || 0}</p>
                  </div>
                  <div className="p-3 rounded-full bg-blue-50 text-blue-600"><FiUsers /></div>
                </div>
                <div className="mt-3 text-xs text-blue-600 inline-flex items-center gap-1">
                  <FiArrowUp /> <span>{stats.verifiedUsers || 0} verified</span>
                </div>
              </div>
              <div className="bg-white rounded-xl border shadow-sm p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{orderStats.totalOrders}</p>
                  </div>
                  <div className="p-3 rounded-full bg-purple-50 text-purple-600"><FiShoppingCart /></div>
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  <span>Recent window</span>
                </div>
              </div>
            </div>

            {/* Charts section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Revenue Trends Chart */}
              <div className="bg-white rounded-xl border shadow-sm p-5 lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Revenue Trends</h3>
                  <div className="text-xs text-gray-500 inline-flex items-center gap-2">
                    <FiTrendingUp /> <span>Monthly Performance</span>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={orderStats.monthly.length ? orderStats.monthly : [
                      { name: 'Jan', orders: 12, revenue: 45000 },
                      { name: 'Feb', orders: 19, revenue: 67000 },
                      { name: 'Mar', orders: 15, revenue: 52000 },
                      { name: 'Apr', orders: 25, revenue: 89000 },
                      { name: 'May', orders: 22, revenue: 78000 },
                      { name: 'Jun', orders: 30, revenue: 120000 }
                    ]}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#6B7280" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
                      <Tooltip
                        formatter={(value, name) => [
                          name === 'revenue' ? `₹${value.toLocaleString()}` : value,
                          name === 'revenue' ? 'Revenue' : 'Orders'
                        ]}
                        labelStyle={{ color: '#374151' }}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        fill="url(#revenueGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Order Status Pie Chart */}
              <div className="bg-white rounded-xl border shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Order Status</h3>
                  <div className="text-xs text-gray-500">
                    <span>Distribution</span>
                  </div>
                </div>

                {/* Pie Chart */}
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Delivered', value: orderStats.byStatus?.delivered || 5, color: '#10B981' },
                          { name: 'Processing', value: orderStats.byStatus?.processing || 2, color: '#F59E0B' },
                          { name: 'Shipped', value: orderStats.byStatus?.shipped || 1, color: '#3B82F6' },
                          { name: 'Pending', value: orderStats.byStatus?.pending || 4, color: '#8B5CF6' },
                          { name: 'Cancelled', value: orderStats.byStatus?.cancelled || 4, color: '#EF4444' }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={65}
                        innerRadius={25}
                        dataKey="value"
                        startAngle={90}
                        endAngle={450}
                      >
                        {[
                          { name: 'Delivered', value: orderStats.byStatus?.delivered || 5, color: '#10B981' },
                          { name: 'Processing', value: orderStats.byStatus?.processing || 2, color: '#F59E0B' },
                          { name: 'Shipped', value: orderStats.byStatus?.shipped || 1, color: '#3B82F6' },
                          { name: 'Pending', value: orderStats.byStatus?.pending || 4, color: '#8B5CF6' },
                          { name: 'Cancelled', value: orderStats.byStatus?.cancelled || 4, color: '#EF4444' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [value, 'Orders']}
                        labelFormatter={(label) => `Status: ${label}`}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Status Legend */}
                <div className="mt-4 space-y-2">
                  {[
                    { name: 'Delivered', value: orderStats.byStatus?.delivered || 5, color: '#10B981' },
                    { name: 'Cancelled', value: orderStats.byStatus?.cancelled || 4, color: '#EF4444' },
                    { name: 'Pending', value: orderStats.byStatus?.pending || 4, color: '#8B5CF6' },
                    { name: 'Processing', value: orderStats.byStatus?.processing || 2, color: '#F59E0B' },
                    { name: 'Shipped', value: orderStats.byStatus?.shipped || 1, color: '#3B82F6' }
                  ].filter(item => item.value > 0).map((item, index) => {
                    const total = Object.values(orderStats.byStatus).reduce((a, b) => a + b, 0) || 16;
                    const percentage = ((item.value / total) * 100).toFixed(0);
                    return (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <span className="text-gray-700 font-medium">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900 font-semibold">{item.value}</span>
                          <span className="text-gray-500 text-xs">({percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Product Performance Bar Chart - Real Data */}
            <div className="bg-white rounded-xl border shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Top Products Performance</h3>
                <a href="/admin/products" className="text-sm text-indigo-600 hover:underline">
                  <span>View all products</span>
                </a>
              </div>
              <div className="h-64">
                {orderStats.productStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={orderStats.productStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11 }}
                        stroke="#6B7280"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
                      <Tooltip
                        formatter={(value, name) => {
                          if (name === 'revenue') return [`₹${value.toLocaleString()}`, 'Revenue'];
                          if (name === 'quantity') return [value, 'Total Quantity'];
                          return [value, 'Orders Count'];
                        }}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="sales" fill="#3B82F6" radius={[4, 4, 0, 0]} name="orders" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <FiPackage className="mx-auto text-4xl mb-2 text-gray-300" />
                      <p>No product data available</p>
                      <p className="text-sm">Orders with items will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Real-time Analytics Summary */}
            <div className="bg-white rounded-xl border shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Live Analytics Summary</h3>
                <div className="text-xs text-gray-500 inline-flex items-center gap-2">
                  <FiActivity className="animate-pulse text-green-500" /> <span>Real-time data</span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {orderStats.productStats.reduce((sum, p) => sum + p.quantity, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Items Sold</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    ₹{Math.round(orderStats.revenue / (orderStats.totalOrders || 1)).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Avg Order Value</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {Object.keys(orderStats.byStatus).length}
                  </div>
                  <div className="text-sm text-gray-600">Status Types</div>
                </div>
                <div className="text-center p-3 bg-amber-50 rounded-lg">
                  <div className="text-2xl font-bold text-amber-600">
                    {orderStats.monthly.length}
                  </div>
                  <div className="text-sm text-gray-600">Active Months</div>
                </div>
              </div>
            </div>

            {/* Recent orders table */}
            <div className="bg-white rounded-xl border shadow-sm">
              <div className="p-5 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Recent Orders</h3>
                <a href="/admin/orders" className="text-sm text-indigo-600 hover:underline">
                  <span>View all</span>
                </a>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-5 py-3 font-medium text-gray-600">Customer</th>
                      <th className="text-left px-5 py-3 font-medium text-gray-600">Items</th>
                      <th className="text-left px-5 py-3 font-medium text-gray-600">Total</th>
                      <th className="text-left px-5 py-3 font-medium text-gray-600">Status</th>
                      <th className="text-left px-5 py-3 font-medium text-gray-600">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 8).map(o => (
                      <tr key={o._id} className="border-t">
                        <td className="px-5 py-3">
                          <div className="font-medium text-gray-900">{o.userName}</div>
                          <div className="text-gray-500 text-xs">{o.userEmail}</div>
                        </td>
                        <td className="px-5 py-3 text-gray-700">{o.items?.reduce((a, b) => a + b.quantity, 0)} items</td>
                        <td className="px-5 py-3 font-medium text-gray-900">₹{o.total?.toLocaleString()}</td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[o.status]}`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-500 text-xs">{new Date(o.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr><td colSpan="5" className="px-5 py-8 text-center text-gray-500">No orders yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Manage products quick */}
            <div className="bg-white rounded-xl border shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Quick Product Actions</h3>
                <button onClick={openAddModal} className="inline-flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700">
                  <FiPlus /> <span>Add Product</span>
                </button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.slice(0, 6).map(product => (
                  <div key={product.id} className="border rounded-xl p-3 hover:shadow-sm transition">
                    <div className="flex items-center gap-3">
                      <img src={product.src} alt={product.title} className="w-14 h-14 rounded object-cover border" />
                      <div className="flex-1 min-w-0">
                        <div className="truncate font-medium text-gray-900">{product.title}</div>
                        <div className="text-sm text-gray-500">₹{product.price}</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openEditModal(product)} className="p-2 rounded-lg border hover:bg-gray-50" title="Edit"><FiEdit /></button>
                        <button onClick={() => handleDeleteProduct(product.id)} className="p-2 rounded-lg border hover:bg-red-50 text-red-600" title="Delete"><FiTrash2 /></button>
                      </div>
                    </div>
                  </div>
                ))}
                {products.length === 0 && <div className="text-sm text-gray-500">No products. Use "Add Product" to create.</div>}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Modals */}
      <ProductModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddProduct}
        title="Add Product"
        formData={formData}
        setFormData={setFormData}
      />
      <ProductModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleEditProduct}
        title="Edit Product"
        isEdit
        formData={formData}
        setFormData={setFormData}
      />
    </div>
  );
};

export default AdminDashboard;
