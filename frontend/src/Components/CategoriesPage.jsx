import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useCatalog } from '../context/CatalogContext';
import { slugifyName } from '../utils/slug';
import { FiChevronLeft, FiGrid } from 'react-icons/fi';

const CategoriesPage = () => {
    const { isDark } = useTheme();
    const { categories } = useCatalog();

    return (
        <div className="min-h-screen pt-24 pb-20 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex flex-col">
                        <Link
                            to="/"
                            className="flex items-center gap-2 text-sm font-bold text-violet-500 hover:text-violet-600 transition-colors mb-4"
                        >
                            <FiChevronLeft /> Back to Home
                        </Link>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`text-4xl md:text-5xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}
                        >
                            Explore <span className="text-violet-600">Categories</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className={`mt-4 text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'} max-w-2xl font-light`}
                        >
                            Discover our wide range of digital services and premium solutions tailored to your needs.
                        </motion.p>
                    </div>
                </div>

                {/* Categories Grid */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                >
                    {categories.map((category, index) => (
                        <Link
                            key={category.id || index}
                            to={`/category/${category.slug || slugifyName(category.name)}`}
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index }}
                                whileHover={{ y: -8 }}
                                className={`group relative h-80 rounded-[32px] overflow-hidden border transition-all duration-300 ${isDark
                                    ? 'bg-[#13111d] border-white/5 hover:border-violet-500/50'
                                    : 'bg-white border-gray-100 hover:border-violet-200'
                                    } shadow-xl shadow-black/20`}
                            >
                                {/* Background Image */}
                                <div className="absolute inset-0 w-full h-full overflow-hidden">
                                    {category.imageDataUrl ? (
                                        <img
                                            src={category.imageDataUrl}
                                            alt={category.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-80"
                                        />
                                    ) : (
                                        <div className={`w-full h-full flex items-center justify-center opacity-20 ${isDark ? 'bg-violet-900/20' : 'bg-violet-100'}`}>
                                            <FiGrid className="w-20 h-20 text-violet-500" />
                                        </div>
                                    )}
                                    {/* Overlay Gradient */}
                                    <div className={`absolute inset-0 bg-gradient-to-t ${isDark
                                        ? 'from-[#0a0a1a] via-[#0a0a1a]/40 to-transparent'
                                        : 'from-black/80 via-black/20 to-transparent'
                                        }`} />
                                </div>

                                {/* Content */}
                                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                                    <h3 className="text-2xl font-black text-white mb-2 leading-tight">
                                        {category.name}
                                    </h3>
                                    <div className="flex items-center gap-2 text-violet-400 group-hover:text-violet-300 transition-colors font-bold text-sm uppercase tracking-widest">
                                        Browse Products
                                        <motion.span
                                            animate={{ x: [0, 5, 0] }}
                                            transition={{ repeat: Infinity, duration: 1.5 }}
                                        >
                                            →
                                        </motion.span>
                                    </div>
                                </div>

                                {/* Hover Accent */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                            </motion.div>
                        </Link>
                    ))}
                </motion.div>

                {categories.length === 0 && (
                    <div className="py-20 text-center">
                        <p className={`text-lg ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            No categories found. Check back later!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoriesPage;
