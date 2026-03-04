import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiShoppingBag, FiTrash2, FiArrowRight } from 'react-icons/fi';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';
import { ProductsData } from '../context/Context';

const Wishlist = () => {
    const { wishlist, removeFromWishlist, wishlistCount } = useWishlist();
    const { isDark } = useTheme();
    const { HandleClickAdd } = useContext(ProductsData);
    const navigate = useNavigate();

    const handleMoveToCart = (product) => {
        HandleClickAdd(product.id);
        removeFromWishlist(product.id);
    };

    if (wishlistCount === 0) {
        return (
            <div className={`min-h-[70vh] flex flex-col items-center justify-center p-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center"
                >
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        <FiHeart className="text-4xl text-gray-400" />
                    </div>
                    <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter">Your Wishlist is Empty</h2>
                    <p className={`mb-8 max-w-md mx-auto ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Looks like you haven't saved any products yet. Start exploring our collection and save your favorites!
                    </p>
                    <Link
                        to="/products"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all hover:scale-105 shadow-xl shadow-violet-600/30"
                    >
                        Explore Products <FiArrowRight />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 ${isDark ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <span className="text-violet-500 font-black uppercase text-[10px] tracking-[0.3em] mb-2 block">My Collection</span>
                        <h1 className="text-4xl font-black uppercase tracking-tighter">Wishlist ({wishlistCount})</h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence mode="popLayout">
                        {wishlist.map((product, index) => (
                            <motion.div
                                key={product.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className={`group rounded-3xl overflow-hidden border transition-all duration-500 ${isDark ? 'bg-[#0f0f1a] border-white/5 hover:border-violet-500/50' : 'bg-white border-gray-100 hover:border-violet-500/50 shadow-xl shadow-gray-200/50'
                                    }`}
                            >
                                {/* Product Image */}
                                <div className="aspect-square relative overflow-hidden">
                                    <img
                                        src={product.src}
                                        alt={product.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    <button
                                        onClick={() => removeFromWishlist(product.id)}
                                        className="absolute top-4 right-4 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-rose-500 transition-all duration-300 transform group-hover:translate-x-0 translate-x-12"
                                    >
                                        <FiTrash2 size={18} />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <div className="mb-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-violet-500">{product.category}</span>
                                        </div>
                                        <h3 className="text-xl font-bold line-clamp-1 mb-1">{product.title}</h3>
                                        <p className={`text-sm line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {product.description}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between mb-6">
                                        <span className="text-2xl font-black">₹{product.price}</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => handleMoveToCart(product)}
                                            className="flex items-center justify-center gap-2 px-4 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-all"
                                        >
                                            <FiShoppingBag size={14} /> Add to Cart
                                        </button>
                                        <button
                                            onClick={() => navigate(`/product/${product.id}`)}
                                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                                                }`}
                                        >
                                            View <FiArrowRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Wishlist;
