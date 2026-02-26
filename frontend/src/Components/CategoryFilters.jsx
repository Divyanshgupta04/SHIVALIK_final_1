import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiChevronRight, FiGrid } from 'react-icons/fi';

const CategoryFilters = ({ activeCategory, onCategoryChange, isDark, categories = [] }) => {
    const allCategories = [
        { id: 'all', name: 'All', slug: 'all' },
        ...categories
    ];

    return (
        <div className="container mx-auto px-4 pt-16 pb-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div className="flex flex-col">
                    <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className={`text-3xl md:text-4xl font-black tracking-tight mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                        Browse <span className="text-violet-600">Categories</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className={`text-sm md:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                        Find exactly what you need with our intuitive filters.
                    </motion.p>
                </div>

                <Link
                    to="/categories"
                    className="group flex items-center gap-2 text-sm font-bold text-violet-500 hover:text-violet-600 transition-colors"
                >
                    View All
                    <FiChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
            </div>

            <div className="overflow-x-auto no-scrollbar pb-4 -mb-4">
                <div className="flex flex-nowrap md:flex-wrap gap-3 min-w-max md:min-w-0">
                    {allCategories.map((cat, index) => (
                        <motion.button
                            key={cat.id || index}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => onCategoryChange(cat.slug)}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold border transition-all duration-300 whitespace-nowrap ${activeCategory === cat.slug
                                ? 'bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-500/20'
                                : isDark
                                    ? 'bg-gray-900/40 border-white/5 text-gray-400 hover:border-violet-500/30'
                                    : 'bg-white border-gray-100 text-gray-600 hover:border-violet-200 hover:text-violet-600 shadow-sm'
                                }`}
                        >
                            {cat.name}
                        </motion.button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CategoryFilters;
