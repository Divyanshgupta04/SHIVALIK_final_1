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
    if (item.isInsurance && item.externalLink) {
      window.open(item.externalLink, '_blank');
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
    let result = activeCategory === 'all' ? [...product] : product.filter(p => {
      // Prioritize explicit category slug/ID match
      const categoryMatch = p.category === activeCategory || p.categoryId === activeCategory;
      if (!categoryMatch) {
        // Fallback: Check if the category name matches (slugified)
        const pCat = p.category?.toLowerCase() || '';
        if (pCat !== activeCategory.toLowerCase()) {
          // Deep search as last resort
          const title = p.title?.toLowerCase() || '';
          const desc = p.description?.toLowerCase() || '';
          if (!`${title} ${desc}`.includes(activeCategory.toLowerCase())) return false;
        }
      }

      // If a subcategory is active, filter by it too
      if (activeSubCategory) {
        return p.subCategoryId === activeSubCategory.id;
      }

      return true;
    });

    // Sort by createdAt (newest first)
    return result.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });
  }, [product, activeCategory, activeSubCategory]);

  const displayedProducts = isMobile ? filteredProducts.slice(0, visibleCount) : filteredProducts;
  const hasMore = isMobile && visibleCount < filteredProducts.length;

  // Decide what to show: Subcategories or Products
  const showSubCategories = activeCategory !== 'all' && relevantSubCategories.length > 0 && !activeSubCategory;

  return (
    <div id="marketplace" className="flex flex-col mb-16">
      <CategoryFilters
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        isDark={isDark}
        categories={categories}
      />

      <div className="container mx-auto px-4">
        {activeCategory !== 'all' && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 mb-8"
          >
            <button
              onClick={() => {
                if (activeSubCategory) setActiveSubCategory(null);
                else setActiveCategory('all');
              }}
              className={`flex items-center gap-2 text-sm font-bold transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <FiArrowLeft className="w-4 h-4" />
              {activeSubCategory ? `Back to ${currentCategory?.name}` : 'Back to All Categories'}
            </button>
            {activeSubCategory && (
              <span className={`text-sm font-medium ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>/ {activeSubCategory.name}</span>
            )}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {showSubCategories ? (
            <motion.div
              key="subcategories"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {relevantSubCategories.map(sc => (
                <SubCategoryCard
                  key={sc.id}
                  subCategory={sc}
                  isDark={isDark}
                  onClick={() => setActiveSubCategory(sc)}
                />
              ))}
            </motion.div>
          ) : loading ? (
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
                {displayedProducts.map((item, index) => (
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

        {!showSubCategories && hasMore && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 flex justify-center"
          >
            <button
              onClick={() => setVisibleCount(prev => prev + 10)}
              className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl ${isDark
                ? 'bg-white text-black hover:bg-gray-200 shadow-white/5'
                : 'bg-black text-white hover:bg-gray-800 shadow-black/10'
                }`}
            >
              See More Products
              <FiPlus className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {displayedProducts.length === 0 && !showSubCategories && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`py-20 text-center text-lg ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
          >
            No products found in this section.
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default BestSellingProduct;
