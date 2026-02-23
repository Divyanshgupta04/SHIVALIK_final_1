import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { Link } from "react-router-dom";

function HomePage() {
  const { isDark } = useTheme();

  return (
    <div className={`w-full min-h-[90vh] relative transition-colors duration-500 flex items-center overflow-hidden h-screen px-4 sm:px-6 lg:px-12 ${isDark
      ? 'bg-[#0a0a1a]'
      : 'bg-gray-50'
      }`}>
      {/* Background Decorative Elements */}
      {isDark && (
        <>
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
        </>
      )}

      <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center relative z-10 pt-28 sm:pt-32 lg:pt-0">

        {/* Left Column: Typography & CTAs */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-start text-left"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`mb-6 px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase border ${isDark
              ? 'bg-white/5 border-white/10 text-gray-400'
              : 'bg-black/5 border-black/10 text-gray-500'
              }`}
          >
            THE FUTURE OF SHOPPING IS HERE
          </motion.div>

          {/* Main Heading */}
          <h1 className={`text-5xl sm:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter mb-6 ${isDark ? 'text-white' : 'text-gray-900'
            }`}>
            ELEVATE <br />
            YOUR <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-600">
              EXPERIENCE.
            </span>
          </h1>

          {/* Description */}
          <p className={`max-w-md text-sm sm:text-base md:text-lg mb-10 leading-relaxed font-light ${isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
            Discover a curated selection of premium services and essentials designed to empower your lifestyle. Shivalik brings luxury and utility to your fingertips.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 items-center">
            <Link
              to="/products"
              className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-violet-600 font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 hover:bg-violet-700"
              role="button"
            >
              Shop Now
              <svg className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>

            <Link
              to="/about"
              className={`inline-flex items-center justify-center px-8 py-4 font-bold transition-all duration-200 border rounded-xl focus:outline-none ${isDark
                ? 'border-white/10 text-white hover:bg-white/5'
                : 'border-gray-300 text-gray-900 hover:bg-black/5'
                }`}
            >
              Learn More
            </Link>
          </div>
        </motion.div>

        {/* Right Column: Image Showcase */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, x: 50 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="relative group"
        >
          {/* Main Showcase Container */}
          <div className="relative aspect-[4/5] sm:aspect-[3/4] lg:aspect-square w-full rounded-[40px] overflow-hidden shadow-2xl">
            {/* Image Wrapper with Rounded Corners and Padding */}
            <div className="absolute inset-0 w-full h-full p-12 overflow-hidden rounded-[48px] group-hover:scale-105 transition-transform duration-700">
              <img
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop"
                alt="Product Preview"
                className="w-full h-full object-cover drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                style={{ borderRadius: '48px' }}
              />
            </div>

            {/* Floating Info Card */}
            <div className="absolute bottom-6 left-6 right-6 p-6 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-between" >
              <div>
                <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest block mb-1">New Release</span>
                <h3 className="text-white text-lg font-bold">Limited Edition Series</h3>
                <p className="text-gray-300 font-medium mt-1">₹4,999</p>
              </div>
              <button className="h-12 w-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 40 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Decorative Glow behind the image */}
          <div className="absolute -inset-4 bg-violet-600/20 blur-3xl rounded-[60px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        </motion.div>

      </div>

      {/* Main Content (Placeholder for future sections) */}
      <div className={`px-3 sm:px-6 lg:px-8 py-4 sm:py-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {/* Additional content can be added here */}
      </div>
    </div>
  );
}

export default HomePage;
