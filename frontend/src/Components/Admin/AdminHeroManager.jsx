import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import config from '../../config/api';
import {
    FiStar, FiSearch, FiCheckCircle, FiPackage,
    FiArrowLeft, FiAlertCircle, FiShoppingBag
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const AdminHeroManager = () => {
    const [products, setProducts] = useState([]);
    const [featuredProduct, setFeaturedProduct] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
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
            const [allProductsRes, heroProductRes] = await Promise.all([
                axios.get(`${config.apiUrl}/api/admin/products`, getAuthHeaders()),
                axios.get(`${config.apiUrl}/api/admin/hero-product`, getAuthHeaders())
            ]);

            if (allProductsRes.data.success) {
                setProducts(allProductsRes.data.products);
            }
            if (heroProductRes.data.success) {
                setFeaturedProduct(heroProductRes.data.product);
            }
        } catch (error) {
            console.error('Fetch data error:', error);
            toast.error('Failed to load products');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSetFeatured = async (productId) => {
        try {
            setIsUpdating(true);
            const res = await axios.post(`${config.apiUrl}/api/admin/hero-product/set`, { productId }, getAuthHeaders());
            if (res.data.success) {
                setFeaturedProduct(res.data.product);
                toast.success('Hero featured product updated!');
            }
        } catch (error) {
            console.error('Set featured error:', error);
            toast.error(error.response?.data?.message || 'Failed to update featured product');
        } finally {
            setIsUpdating(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toString().includes(searchQuery)
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
            <div className="max-w-6xl mx-auto">
                <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <button
                            onClick={() => navigate('/admin/dashboard')}
                            className="group flex items-center text-gray-500 hover:text-indigo-600 transition-colors mb-2"
                        >
                            <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
                            <span>Back to Dashboard</span>
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900">Hero Section Manager</h1>
                        <p className="text-gray-600">Choose the product to showcase in the homepage hero section.</p>
                    </div>

                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full md:w-64"
                        />
                    </div>
                </header>

                {/* Current Featured Hero Card */}
                <section className="mb-12">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FiStar className="mr-2 text-amber-500 fill-amber-500" /> Currently Featured
                    </h2>
                    {featuredProduct ? (
                        <motion.div
                            layoutId="featured-card"
                            className="bg-white rounded-2xl border-2 border-indigo-500 shadow-xl overflow-hidden flex flex-col md:flex-row"
                        >
                            <div className="md:w-1/3 bg-gray-100 p-4 flex items-center justify-center">
                                <img
                                    src={featuredProduct.src}
                                    alt={featuredProduct.title}
                                    className="max-h-64 object-contain"
                                />
                            </div>
                            <div className="p-8 md:w-2/3 flex flex-col justify-center">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded">FEATURED PRODUCT</span>
                                    <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded flex items-center">
                                        <FiCheckCircle className="mr-1" /> Active on Live Site
                                    </span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">{featuredProduct.title}</h3>
                                <p className="text-gray-600 mb-6 line-clamp-2">{featuredProduct.description}</p>
                                <div className="flex items-center gap-4">
                                    <div className="text-2xl font-bold text-gray-900">₹{featuredProduct.price}</div>
                                    <div className="text-sm text-gray-500">ID: {featuredProduct.id}</div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
                            <FiAlertCircle className="mx-auto text-amber-400 mb-3" size={48} />
                            <h3 className="text-amber-800 font-bold text-lg">No Product Featured</h3>
                            <p className="text-amber-700">Select a product from the list below to show in the Hero section.</p>
                        </div>
                    )}
                </section>

                {/* Product Grid */}
                <section>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FiPackage className="mr-2 text-indigo-500" /> Available Products
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map(product => {
                            const isSelected = featuredProduct?.id === product.id;
                            return (
                                <motion.div
                                    key={product.id}
                                    whileHover={{ y: -5 }}
                                    className={`bg-white rounded-xl border-2 transition-all p-4 flex flex-col ${isSelected ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-transparent shadow-sm'
                                        }`}
                                >
                                    <div className="aspect-square bg-gray-50 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                                        <img
                                            src={product.src}
                                            alt={product.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 line-clamp-1">{product.title}</h3>
                                        <p className="text-sm text-gray-500 mb-2">₹{product.price}</p>
                                    </div>
                                    <button
                                        disabled={isSelected || isUpdating}
                                        onClick={() => handleSetFeatured(product.id)}
                                        className={`w-full py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${isSelected
                                            ? 'bg-green-100 text-green-700 cursor-default'
                                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
                                            }`}
                                    >
                                        {isSelected ? (
                                            <><FiCheckCircle /> Currently Active</>
                                        ) : (
                                            <><FiStar /> Set as Featured</>
                                        )}
                                    </button>
                                </motion.div>
                            );
                        })}
                    </div>

                    {filteredProducts.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-2xl border border-dashed text-gray-500">
                            No products found matching your search.
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default AdminHeroManager;
