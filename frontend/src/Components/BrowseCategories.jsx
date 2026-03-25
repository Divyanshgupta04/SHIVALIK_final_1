import React, { useState, useContext, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCatalog } from '../context/CatalogContext';
import { ProductsData } from '../context/Context';
import { useTheme } from '../context/ThemeContext';
import { FiChevronRight, FiArrowLeft, FiGrid, FiPlus } from 'react-icons/fi';
import ProductCard from './ProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';
import SubCategoryCard from './SubCategoryCard';
import { useNavigate } from 'react-router-dom';
import { slugifyName } from '../utils/slug';

const BrowseCategories = () => {
    const { categories, subCategories, loading: catalogLoading, refreshCatalog } = useCatalog();
    const { product, HandleClickAdd, loading: contextLoading, fetchAllProducts } = useContext(ProductsData);
    const { isDark } = useTheme();
    const navigate = useNavigate();

    const [view, setView] = useState('categories'); // 'categories', 'subcategories', 'products'
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState(null);
    const [isLocalLoading, setIsLocalLoading] = useState(false);

    const handleBuyNow = (item) => {
        if (item.isInsurance) {
            navigate('/apply-review', { state: { buyNowItem: item } });
        } else {
            navigate('/checkout', { state: { buyNowItem: item } });
        }
    };

    const handleCategoryClick = async (category) => {
        console.log('Category Clicked:', category.name, 'ID:', category.id);
        setSelectedCategory(category);
        setView('category-detail');
        setIsLocalLoading(true);
        // Fetch products for THIS category (including direct ones and subcat ones potentially)
        // The filter in filteredProducts will ensure we show what's requested
        await fetchAllProducts({ categoryId: category.id, limit: 100 });
        setIsLocalLoading(false);
    };

    const handleSubCategoryClick = async (subCat) => {
        setSelectedSubCategory(subCat);
        setView('products');
        setIsLocalLoading(true);
        await fetchAllProducts({ subCategoryId: subCat.id, limit: 100 });
        setIsLocalLoading(false);
    };

    const handleBack = () => {
        if (view === 'products') {
            setView('category-detail');
            setSelectedSubCategory(null);
        } else if (view === 'category-detail') {
            setView('categories');
            setSelectedCategory(null);
        }
    };

    const filteredProducts = useMemo(() => {
        if (view === 'categories') return [];
        
        return product.filter(p => {
            if (selectedSubCategory) {
                return String(p.subCategoryId) === String(selectedSubCategory.id);
            }
            if (selectedCategory) {
                const catIdMatch = String(p.categoryId) === String(selectedCategory.id);
                // Also try slug match as fallback for older products or sync issues
                const catSlugMatch = p.category && selectedCategory.name && (p.category === selectedCategory.slug || p.category === slugifyName(selectedCategory.name));
                
                return catIdMatch || catSlugMatch;
            }
            return false;
        });
    }, [product, view, selectedCategory, selectedSubCategory]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <section className={`py-20 mb-10`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-4 mb-2">
                            {view !== 'categories' && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    onClick={handleBack}
                                    className={`p-2 rounded-full transition-colors ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-black/5 text-black hover:bg-black/10'}`}
                                >
                                    <FiArrowLeft className="w-5 h-5" />
                                </motion.button>
                            )}
                            <span className="text-violet-500 font-bold tracking-widest uppercase text-xs">
                                {view === 'categories' ? 'Our Catalog' : selectedCategory?.name}
                            </span>
                        </div>
                        <h2 className={`text-3xl sm:text-5xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {view === 'categories' ? (
                                <>Browse <span className="text-violet-600">Categories</span></>
                            ) : view === 'category-detail' ? (
                                <>{selectedCategory?.name}</>
                            ) : (
                                selectedSubCategory?.name
                            )}
                        </h2>
                    </div>

                    <button
                        onClick={() => navigate('/products')}
                        className={`group flex items-center gap-2 text-sm font-bold text-violet-500 hover:text-violet-600 transition-colors py-2`}
                    >
                        View Full Marketplace
                        <FiChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {/* TOP LEVEL CATEGORIES */}
                    {view === 'categories' && (
                        <motion.div
                            key="categories-grid"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
                        >
                            {catalogLoading && categories.length === 0 ? (
                                [...Array(4)].map((_, i) => (
                                    <div key={i} className={`h-72 rounded-[32px] animate-pulse ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />
                                ))
                            ) : (
                                categories.map((category, index) => (
                                    <motion.div
                                        key={category.id || index}
                                        variants={itemVariants}
                                        whileHover={{ y: -10 }}
                                        onClick={() => handleCategoryClick(category)}
                                        className={`group cursor-pointer relative h-72 rounded-[32px] overflow-hidden border transition-all duration-300 ${isDark
                                            ? 'bg-gray-900/40 border-white/5 hover:border-violet-500/50'
                                            : 'bg-white border-gray-100 hover:border-violet-200'
                                            } shadow-xl shadow-black/10 backdrop-blur-sm`}
                                    >
                                        {/* Image */}
                                        <div className="absolute inset-0 w-full h-full">
                                            {category.imageDataUrl ? (
                                                <img
                                                    src={category.imageDataUrl}
                                                    alt={category.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-80"
                                                />
                                            ) : (
                                                <div className={`w-full h-full flex items-center justify-center opacity-20 ${isDark ? 'bg-violet-900/20' : 'bg-violet-100'}`}>
                                                    <FiGrid className="w-16 h-16 text-violet-500" />
                                                </div>
                                            )}
                                            <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-black via-black/40 to-transparent' : 'from-black/80 via-black/20 to-transparent'}`} />
                                        </div>

                                        {/* Content */}
                                        <div className="absolute inset-0 p-8 flex flex-col justify-end translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                            <h3 className="text-2xl font-black text-white mb-2 leading-tight">
                                                {category.name}
                                            </h3>
                                            <div className="h-0.5 w-0 bg-violet-500 group-hover:w-full transition-all duration-500 rounded-full" />
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </motion.div>
                    )}

                    {/* CATEGORY DETAIL (SubCats + Products) */}
                    {view === 'category-detail' && (
                        <motion.div
                            key="category-detail-view"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-12"
                        >
                            {/* Subcategories Subsection */}
                            {subCategories.some(sc => String(sc.categoryId) === String(selectedCategory?.id)) && (
                                <div>
                                    <h4 className={`text-xl font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        <div className="w-2 h-2 rounded-full bg-violet-600" />
                                        Sub-Categories
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {subCategories.filter(sc => String(sc.categoryId) === String(selectedCategory?.id)).map(sc => (
                                            <motion.div key={sc.id} variants={itemVariants} initial="hidden" animate="visible">
                                                <SubCategoryCard
                                                    subCategory={sc}
                                                    isDark={isDark}
                                                    onClick={() => handleSubCategoryClick(sc)}
                                                />
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Products Subsection */}
                            <div>
                                <h4 className={`text-xl font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    <div className="w-2 h-2 rounded-full bg-violet-600" />
                                    {subCategories.some(sc => String(sc.categoryId) === String(selectedCategory?.id)) 
                                        ? `Products in ${selectedCategory?.name}` 
                                        : 'Products'
                                    }
                                </h4>
                                
                                {isLocalLoading || contextLoading ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                        <ProductCardSkeleton isDark={isDark} count={4} />
                                    </div>
                                ) : filteredProducts.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                        {filteredProducts.map((item, index) => (
                                            <motion.div key={item.id} variants={itemVariants} initial="hidden" animate="visible">
                                                <ProductCard
                                                    item={item}
                                                    index={index}
                                                    isDark={isDark}
                                                    onAddToCart={HandleClickAdd}
                                                    onBuyNow={handleBuyNow}
                                                />
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={`p-10 rounded-3xl border-2 border-dashed text-center ${isDark ? 'border-white/5 text-gray-500' : 'border-gray-100 text-gray-400'}`}>
                                        <p>No direct products found in this category.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* SUBCATEGORY PRODUCTS ONLY */}
                    {view === 'products' && (
                        <motion.div
                            key="subcategory-products-view"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {isLocalLoading || contextLoading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                    <ProductCardSkeleton isDark={isDark} count={4} />
                                </div>
                            ) : filteredProducts.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                    {filteredProducts.map((item, index) => (
                                        <motion.div key={item.id} variants={itemVariants} initial="hidden" animate="visible">
                                            <ProductCard
                                                item={item}
                                                index={index}
                                                isDark={isDark}
                                                onAddToCart={HandleClickAdd}
                                                onBuyNow={handleBuyNow}
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                                    <div className={`mb-6 text-lg ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                        No products found in this sub-category.
                                    </div>
                                    <button 
                                        onClick={() => refreshCatalog()}
                                        className="px-6 py-3 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 transition-all flex items-center gap-2"
                                    >
                                        <FiPlus className="w-5 h-5" /> Refresh Catalog
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
};

export default BrowseCategories;
