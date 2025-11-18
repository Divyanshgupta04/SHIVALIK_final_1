import React, { useContext } from "react";
import { ProductsData } from "../context/Context";
import { useTheme } from "../context/ThemeContext";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

function BestSellingProduct() {
  const { product, HandleClickAdd } = useContext(ProductsData);
  const { isDark } = useTheme();

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.h1 
        className={`text-3xl font-bold mb-8 text-center transition-colors duration-300 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Our Bestsellers
      </motion.h1>

      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {product.map((item, index) => (
          <motion.div
            key={item.id}
            className={`group relative overflow-hidden rounded-2xl transition-all duration-300 cursor-pointer ${
              isDark 
                ? 'bg-gray-800 hover:bg-gray-700 border border-gray-600' 
                : 'bg-white hover:bg-gray-50 border border-gray-200'
            } shadow-lg hover:shadow-xl`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ scale: 1.05, y: -10 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
              <img
                className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                src={item.src}
                alt={item.title}
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Content */}
            <div className="p-4">
              <h2 className={`text-lg font-bold mb-2 line-clamp-2 transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>{item.title}</h2>

              <p className={`text-sm mb-3 line-clamp-2 transition-colors duration-300 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>{item.description}</p>

              {/* Rating */}
              <div className="flex items-center mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                  </svg>
                ))}
                <span className={`ml-2 text-xs ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>★★★★★</span>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xl font-bold transition-colors duration-300 ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`}>₹{item.price}</span>
                <span className={`text-sm line-through transition-colors duration-300 ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`}>₹{Math.floor(item.price * 1.2)}</span>
              </div>

              {/* Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => HandleClickAdd(item.id)}
                  className="w-full py-2.5 px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
                >
                  Add to Cart
                </button>
                <Link
                  to="/checkout/address"
                  className={`block w-full py-2.5 px-4 text-sm font-medium rounded-lg transition-all duration-300 transform hover:scale-105 text-center ${
                    isDark 
                      ? 'bg-gray-600 text-white hover:bg-gray-700' 
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Buy Now
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export default BestSellingProduct;
