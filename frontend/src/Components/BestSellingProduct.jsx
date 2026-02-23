import React, { useContext, useMemo, useState } from "react";
import { ProductsData } from "../context/Context";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";
import CategoryFilters from "./CategoryFilters";
import { useCatalog } from "../context/CatalogContext";

function BestSellingProduct() {
  const { product, HandleClickAdd } = useContext(ProductsData);
  const { categories } = useCatalog();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');

  const handleBuyNow = (item) => {
    if (item.isInsurance) {
      window.open('https://advisor.turtlemintinsurance.com/profile/284308/SHIVALIK_SERVICES_HUB_NEAR_SBI_RAJOURI', '_blank');
    } else {
      navigate('/checkout', { state: { buyNowItem: item } });
    }
  };

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return product;

    return product.filter(p => {
      // Prioritize explicit category slug/ID match
      if (p.category === activeCategory || p.categoryId === activeCategory) return true;

      // Fallback: Check if the category name matches (slugified)
      const pCat = p.category?.toLowerCase() || '';
      if (pCat === activeCategory.toLowerCase()) return true;

      // Deep search in title/description as a backup
      const title = p.title?.toLowerCase() || '';
      const desc = p.description?.toLowerCase() || '';
      const searchStr = `${title} ${desc}`;
      return searchStr.includes(activeCategory.toLowerCase());
    });
  }, [product, activeCategory]);

  return (
    <div id="marketplace" className="flex flex-col mb-16">
      <CategoryFilters
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        isDark={isDark}
        categories={categories}
      />

      <div className="container mx-auto px-4">
        <motion.div
          layout
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

        {filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`py-20 text-center text-lg ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
          >
            No products found in this category.
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default BestSellingProduct;
