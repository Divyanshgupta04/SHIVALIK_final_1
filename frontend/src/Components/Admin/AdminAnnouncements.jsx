import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FiSend, FiMenu, FiX, FiRefreshCw, FiLogOut, FiHome, FiActivity, FiPackage, FiGrid, FiShoppingCart, FiUsers, FiSettings, FiHelpCircle, FiMessageSquare } from 'react-icons/fi';
import config from '../../config/api';

const AdminAnnouncements = () => {
    const [formData, setFormData] = useState({
        subject: '',
        message: '',
        sendTo: 'all' // 'all', 'verified'
    });
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        navigate('/admin/login');
        toast.success('Logged out successfully');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.subject.trim() || !formData.message.trim()) {
            toast.error('Please fill in all fields');
            return;
        }

        if (!window.confirm(`Are you sure you want to send this announcement to ${formData.sendTo === 'all' ? 'ALL' : 'VERIFIED'} users? This cannot be undone.`)) {
            return;
        }

        setLoading(true);
        const toastId = toast.loading('Sending announcements...');

        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.post(
                `${config.apiUrl}/api/admin/announcements/send`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                toast.dismiss(toastId);
                toast.success(response.data.message);
                setFormData({ subject: '', message: '', sendTo: 'all' });
            }
        } catch (error) {
            toast.dismiss(toastId);
            console.error('Send error:', error);
            toast.error(error.response?.data?.message || 'Failed to send announcements');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top nav */}
            <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                            <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-700" onClick={() => setSidebarOpen(v => !v)}>
                                {sidebarOpen ? <FiX /> : <FiMenu />}
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                        </div>
                        <div className="flex items-center gap-3">
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
                                <a href="/admin/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700">
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
                                <a href="/admin/announcements" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 font-medium">
                                    <FiMessageSquare /> <span>Announcements</span>
                                </a>
                            </nav>
                        </div>
                    </aside>

                    {/* Main content */}
                    <main className="flex-1 min-w-0">
                        <div className="bg-white rounded-xl border shadow-sm p-6 max-w-2xl mx-auto">
                            <div className="border-b pb-4 mb-6">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <FiMessageSquare className="text-indigo-600" />
                                    Send Announcement
                                </h2>
                                <p className="text-gray-500 text-sm mt-1">Send bulk emails to your registered users.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Big Sale! 50% Off Everything"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Message Body</label>
                                    <textarea
                                        rows={6}
                                        placeholder="Type your announcement here..."
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Basic HTML is supported (e.g. &lt;b&gt;, &lt;br&gt;)</p>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h3 className="text-sm font-medium text-gray-900 mb-3">Sending Options</h3>

                                    <div className="space-y-3">
                                        <label className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                name="sendTo"
                                                value="all"
                                                checked={formData.sendTo === 'all'}
                                                onChange={(e) => setFormData({ ...formData, sendTo: e.target.value })}
                                                className="text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className="text-sm text-gray-700">All Registered Users</span>
                                        </label>

                                        <label className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                name="sendTo"
                                                value="verified"
                                                checked={formData.sendTo === 'verified'}
                                                onChange={(e) => setFormData({ ...formData, sendTo: e.target.value })}
                                                className="text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className="text-sm text-gray-700">Verified Users Only</span>
                                        </label>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-indigo-600 text-white font-medium py-2.5 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-colors flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>Processing...</>
                                    ) : (
                                        <>
                                            <FiSend /> Send Announcement
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default AdminAnnouncements;
