import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiZap, FiInfo } from 'react-icons/fi';

const ProductCard = ({ item, onAddToCart, onBuyNow, isDark, index = 0 }) => {
    const navigate = useNavigate();
    const [isWishlisted, setIsWishlisted] = useState(false);

    // Animation variants
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, delay: index * 0.1 }
        },
        hover: {
            y: -8,
            transition: { duration: 0.3, ease: "easeOut" }
        }
    };

    const imageVariants = {
        hover: { scale: 1.1 }
    };

    const heartVariants = {
        tap: { scale: 0.8 },
        active: { scale: [1, 1.3, 1], color: "#ef4444" }
    };

    const handleCardClick = () => {
        navigate(`/product/${item.id}`);
    };

    const stopPropagation = (e) => e.stopPropagation();

    return (
        <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            onClick={handleCardClick}
            className={`group relative flex flex-col h-full rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 ${isDark
                ? 'bg-gray-900/40 border border-white/5 hover:border-violet-500/30 shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
                : 'bg-white border border-gray-100 hover:border-violet-200 shadow-[0_8px_32px_rgba(31,38,135,0.07)]'
                } backdrop-blur-sm`}
        >
            {/* Top Image & Wishlist Overlay */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-t-2xl">
                <motion.img
                    variants={imageVariants}
                    src={item.src}
                    alt={item.title}
                    className="w-full h-full object-cover"
                />

                {/* Wishlist Button */}
                <button
                    onClick={(e) => {
                        stopPropagation(e);
                        setIsWishlisted(!isWishlisted);
                    }}
                    className="absolute top-3 right-3 z-10 p-2.5 rounded-full bg-black/20 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
                >
                    <motion.div
                        variants={heartVariants}
                        whileTap="tap"
                        animate={isWishlisted ? "active" : ""}
                    >
                        <FiHeart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                    </motion.div>
                </button>

                {/* Badges/Category */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    {item.discountPercent > 0 && (
                        <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white rounded-lg shadow-lg ${item.discountPercent >= 30 ? 'bg-rose-600 shadow-rose-500/30' : 'bg-emerald-600 shadow-emerald-500/30'
                            }`}>
                            {item.discountPercent}% OFF
                        </span>
                    )}
                    {item.isNew && (
                        <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-violet-600 text-white rounded-lg shadow-lg shadow-violet-500/30">
                            New Arrival
                        </span>
                    )}
                    {item.isBestSeller && (
                        <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white rounded-lg shadow-lg shadow-amber-500/30">
                            Top Pick
                        </span>
                    )}
                </div>

                {/* Info Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4">
                    <p className="text-white text-xs leading-relaxed line-clamp-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        {item.description}
                    </p>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-5 flex flex-col flex-grow">
                <div className="mb-2">
                    <h3 className={`text-lg font-bold mb-1 transition-colors duration-300 ${isDark ? 'text-white group-hover:text-violet-400' : 'text-gray-900 group-hover:text-violet-600'
                        } line-clamp-1`}>
                        {item.title}
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className={`text-xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            ₹{item.sellingPrice || item.price}
                        </span>
                        {item.discountPercent > 0 && (
                            <span className="text-xs text-gray-400 line-through">
                                ₹{item.originalPrice}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1 mb-4 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                    ))}
                    <span className={`ml-1 text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        (4.9)
                    </span>
                </div>

                {/* Buy Actions */}
                <div className="mt-auto space-y-2.5">
                    {!item.isInsurance && (
                        <button
                            onClick={(e) => {
                                stopPropagation(e);
                                onAddToCart(item.id);
                            }}
                            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${isDark
                                ? 'bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-900/20'
                                : 'bg-violet-600 text-white hover:bg-violet-700 shadow-lg shadow-violet-200'
                                }`}
                        >
                            <FiShoppingCart className="w-4 h-4" />
                            Add to Cart
                        </button>
                    )}

                    <button
                        onClick={(e) => {
                            stopPropagation(e);
                            onBuyNow(item);
                        }}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${isDark
                            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-white/5'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 border border-gray-200'
                            }`}
                    >
                        {item.isInsurance ? <FiInfo className="w-4 h-4" /> : <FiZap className="w-4 h-4" />}
                        {item.isInsurance ? 'Apply Now' : 'Buy Now'}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
