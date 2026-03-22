import React, { useContext, useMemo, useState, useEffect } from "react";
import { ProductsData } from "../context/Context";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";
import ProductCardSkeleton from "./ProductCardSkeleton";
import CategoryFilters from "./CategoryFilters";
import SubCategoryCard from "./SubCategoryCard";
import { useCatalog } from "../context/CatalogContext";
import { FiPlus, FiArrowLeft } from "react-icons/fi";

function BestSellingProduct() {
  const { product, HandleClickAdd, loading } = useContext(ProductsData);
  const { categories, subCategories } = useCatalog();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSubCategory, setActiveSubCategory] = useState(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reset visible count and subcategory when category changes
  useEffect(() => {
    setVisibleCount(10);
    setActiveSubCategory(null);
  }, [activeCategory]);

  const handleBuyNow = (item) => {
    if (item.isInsurance) {
      navigate('/apply-review', { state: { buyNowItem: item } });
    } else {
      navigate('/checkout', { state: { buyNowItem: item } });
    }
  };

  // Get current category object
  const currentCategory = useMemo(() => {
    if (activeCategory === 'all') return null;
    return categories.find(c => c.slug === activeCategory || c.id === activeCategory);
  }, [categories, activeCategory]);

  // Find sub-categories for active category
  const relevantSubCategories = useMemo(() => {
    if (!currentCategory) return [];
    return subCategories.filter(sc => sc.categoryId === currentCategory.id);
  }, [subCategories, currentCategory]);

  const filteredProducts = useMemo(() => {
    // Show ONLY products selected by admin for home page
    return product
      .filter(p => p.homePageOrder > 0)
      .sort((a, b) => a.homePageOrder - b.homePageOrder);
  }, [product]);

  return (
    <div id="marketplace" className="flex flex-col mb-16 px-4 sm:px-8">
      {/* Section Header */}
      <motion.div 
        className="container mx-auto mb-10 text-center sm:text-left"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <span className="text-violet-500 font-bold tracking-widest uppercase text-xs mb-2 block">Our Top Picks</span>
        <h2 className={`text-3xl sm:text-5xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Best Selling <span className="text-violet-600">Products</span>
        </h2>
      </motion.div>

      <div className="container mx-auto">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              <ProductCardSkeleton isDark={isDark} count={8} />
            </motion.div>
          ) : (
            <motion.div
              key="products"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((item, index) => (
                  <ProductCard
                    key={item.id}
                    item={item}
                    index={index}
                    isDark={isDark}
                    onAddToCart={HandleClickAdd}
                    onBuyNow={handleBuyNow}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {filteredProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 flex justify-center"
          >
            <button
              onClick={() => navigate('/products')}
              className={`group relative flex items-center gap-3 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-2xl hover:scale-105 active:scale-95 ${isDark
                ? 'bg-white text-black hover:bg-gray-100 shadow-white/10'
                : 'bg-black text-white hover:bg-gray-800 shadow-black/20'
                }`}
            >
              <span>Explore All Products</span>
              <div className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </motion.div>
        )}

        {filteredProducts.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`py-20 text-center text-lg ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
          >
            No products selected for the home page.
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default BestSellingProduct;
