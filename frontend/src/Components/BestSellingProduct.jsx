import React, { useContext } from "react";
import { ProductsData } from "../context/Context";
import { useTheme } from "../context/ThemeContext";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";

function BestSellingProduct() {
  const { product, HandleClickAdd } = useContext(ProductsData);
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const handleBuyNow = (item) => {
    if (item.isInsurance) {
      window.open('https://advisor.turtlemintinsurance.com/profile/284308/SHIVALIK_SERVICES_HUB_NEAR_SBI_RAJOURI', '_blank');
    } else {
      navigate('/checkout', { state: { buyNowItem: item } });
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col items-center mb-12 text-center">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="px-4 py-1.5 rounded-full bg-violet-500/10 text-violet-500 text-xs font-bold uppercase tracking-widest mb-4 border border-violet-500/20"
        >
          Curated Collection
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className={`text-4xl md:text-5xl font-black mb-4 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}
        >
          Best Selling <span className="text-violet-600">Products</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className={`max-w-2xl text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
        >
          Discover our most popular digital services and physical products, trusted by thousands of customers nationwide.
        </motion.p>
      </div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {product.map((item, index) => (
          <ProductCard
            key={item.id}
            item={item}
            index={index}
            isDark={isDark}
            onAddToCart={HandleClickAdd}
            onBuyNow={handleBuyNow}
          />
        ))}
      </motion.div>
    </div>
  );
}

export default BestSellingProduct;
