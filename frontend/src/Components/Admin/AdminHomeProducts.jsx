import React, { useState, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import config from '../../config/api';
import {
    FiStar, FiSearch, FiCheckCircle, FiPackage,
    FiArrowLeft, FiAlertCircle, FiPlus, FiTrash2, FiSave, FiInfo
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const AdminHomeProducts = () => {
    const [products, setProducts] = useState([]);
    const [homeProducts, setHomeProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('adminToken');
        return {
            headers: { Authorization: `Bearer ${token}` }
        };
    };

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const res = await axios.get(`${config.apiUrl}/api/admin/products`, getAuthHeaders());

            if (res.data.success) {
                const all = res.data.products;
                setProducts(all);
                
                // Filter and sort products that are already selected for home page
                const selected = all
                    .filter(p => p.homePageOrder > 0)
                    .sort((a, b) => a.homePageOrder - b.homePageOrder);
                setHomeProducts(selected);
            }
        } catch (error) {
            console.error('Fetch data error:', error);
            toast.error('Failed to load products');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleProduct = (product) => {
        const isSelected = homeProducts.find(p => p.id === product.id);
        if (isSelected) {
            setHomeProducts(homeProducts.filter(p => p.id !== product.id));
        } else {
            if (homeProducts.length >= 14) {
                toast.error('You can only select up to 14 products for the home page');
                return;
            }
            setHomeProducts([...homeProducts, product]);
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const productIds = homeProducts.map(p => p.id);
            const res = await axios.post(`${config.apiUrl}/api/admin/home-products/set`, { productIds }, getAuthHeaders());
            
            if (res.data.success) {
                toast.success('Home page products updated successfully!');
            }
        } catch (error) {
            console.error('Save error:', error);
            toast.error(error.response?.data?.message || 'Failed to update home page products');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredProducts = products.filter(p =>
        (p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toString().includes(searchQuery)) &&
        !homeProducts.find(hp => hp.id === p.id)
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <button
                            onClick={() => navigate('/admin/dashboard')}
                            className="group flex items-center text-gray-500 hover:text-indigo-600 transition-colors mb-2"
                        >
                            <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
                            <span>Back to Dashboard</span>
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900">Home Products Manager</h1>
                        <p className="text-gray-600">Select and order up to 14 products to show on the main landing page.</p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
                        >
                            {isSaving ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <FiSave />}
                            <span>Save Changes</span>
                        </button>
                    </div>
                </header>

                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Left: Selected Products (Ordering) */}
                    <div className="lg:col-span-7">
                        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                            <div className="p-6 border-b flex items-center justify-between bg-indigo-50/30">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <FiStar className="text-amber-500 fill-amber-500" />
                                        Home Page Selection ({homeProducts.length}/14)
                                    </h2>
                                    <p className="text-sm text-gray-500">Drag to reorder products</p>
                                </div>
                                {homeProducts.length > 0 && (
                                    <button 
                                        onClick={() => setHomeProducts([])}
                                        className="text-xs text-red-500 font-bold hover:underline"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>

                            {homeProducts.length === 0 ? (
                                <div className="p-20 text-center">
                                    <FiPackage className="mx-auto text-4xl text-gray-300 mb-4" />
                                    <p className="text-gray-500">No products selected yet.</p>
                                    <p className="text-sm text-gray-400">Search and add products from the right panel.</p>
                                </div>
                            ) : (
                                <Reorder.Group axis="y" values={homeProducts} onReorder={setHomeProducts} className="p-4 space-y-3">
                                    {homeProducts.map((product, index) => (
                                        <Reorder.Item 
                                            key={product.id} 
                                            value={product}
                                            className="bg-white border rounded-xl p-3 flex items-center gap-4 cursor-grab active:cursor-grabbing hover:border-indigo-300 transition-colors shadow-sm"
                                        >
                                            <div className="flex-shrink-0 w-8 text-xs font-bold text-indigo-500 bg-indigo-50 h-8 rounded-full flex items-center justify-center">
                                                {index + 1}
                                            </div>
                                            <img src={product.src} alt="" className="w-12 h-12 object-cover rounded-lg bg-gray-100" />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-gray-900 truncate">{product.title}</h4>
                                                <p className="text-xs text-gray-500">₹{product.price} • ID: {product.id}</p>
                                            </div>
                                            <button 
                                                onClick={() => toggleProduct(product)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </Reorder.Item>
                                    ))}
                                </Reorder.Group>
                            )}
                            
                            <div className="p-4 bg-gray-50 border-t flex items-start gap-2 text-xs text-gray-500">
                                <FiInfo className="flex-shrink-0 mt-0.5 text-indigo-400" />
                                <p>This list determines exactly which products appear on the landing page and in what specific order. Only the first 14 products will be used.</p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Product Selector */}
                    <div className="lg:col-span-5">
                        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col max-h-[calc(100vh-250px)]">
                            <div className="p-6 border-b">
                                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <FiPackage className="text-indigo-500" />
                                    Browse Catalog
                                </h2>
                                <div className="relative">
                                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search title or ID..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                {filteredProducts.map(product => (
                                    <div 
                                        key={product.id}
                                        className="group flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-indigo-100 hover:bg-indigo-50/30 transition-all"
                                    >
                                        <img src={product.src} alt="" className="w-10 h-10 object-cover rounded-lg bg-gray-100" />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-gray-900 truncate">{product.title}</h4>
                                            <p className="text-[10px] text-gray-500">₹{product.price} • ID: {product.id}</p>
                                        </div>
                                        <button
                                            onClick={() => toggleProduct(product)}
                                            className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                        >
                                            <FiPlus />
                                        </button>
                                    </div>
                                ))}

                                {filteredProducts.length === 0 && (
                                    <div className="py-10 text-center text-gray-400 text-sm">
                                        No more products to add.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHomeProducts;
