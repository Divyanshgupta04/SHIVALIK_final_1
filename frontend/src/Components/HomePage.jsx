import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { Link } from "react-router-dom";

function HomePage() {
  const { isDark } = useTheme();
  
  return (
    <div className={`w-full min-h-screen relative transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-black to-gray-800' 
        : 'bg-gradient-to-br from-blue-50 via-white to-gray-100'
    }`}>
      {/* Background */}
      <div className={`relative min-h-screen w-full ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-black to-gray-800' 
          : 'bg-gradient-to-br from-blue-50 via-white to-gray-100'
      }`}>
        {/* Text Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute bottom-28 left-6 sm:left-12 lg:left-24 transform -translate-y-1/2 text-left"
        >
          <p className={`text-base sm:text-lg md:text-xl font-light mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Welcome to
          </p>

          <h1 className={`text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold leading-tight transition-colors duration-300 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            SHIVALIK
          </h1>

          <h2 className={`text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold transition-colors duration-300 ${
            isDark 
              ? 'text-red-500 stroke-text-red' 
              : 'text-blue-600'
          }`}>
            SERVICE HUB
          </h2>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
          className="absolute bottom-8 left-6 sm:left-12 lg:left-24 flex flex-row gap-3 sm:gap-4 font-bold text-sm sm:text-md"
        >
          <Link to="/products" className={`py-2 px-4 sm:py-3 sm:px-6 rounded-md transition duration-200 ease-in-out inline-block ${
            isDark 
              ? 'bg-white text-black border border-white hover:bg-red-700 hover:text-white' 
              : 'bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 hover:border-blue-700'
          }`}>
            Shop Now
          </Link>
          <a href="#showcase" className={`py-2 px-4 sm:py-3 sm:px-6 bg-transparent rounded-md transition duration-200 ease-in-out inline-block ${
            isDark 
              ? 'border border-white text-white hover:bg-white hover:text-black' 
              : 'border border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white'
          }`}>
            Know More
          </a>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className={`px-3 sm:px-6 lg:px-8 py-4 sm:py-6 ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}>
        {/* You can add more cards or sections here */}
      </div>
    </div>
  );
}

export default HomePage;
