import React, { useContext, useEffect, useRef, useState } from "react";
import { ProductsData } from "../context/Context";
import { FiShoppingBag, FiUser, FiSun, FiMoon } from "react-icons/fi";
import { IoIosSearch } from "react-icons/io";
import { MdMenu } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { IoCloseSharp } from "react-icons/io5";
import { useAuth } from "../context/Auth/AuthContext";
import { useTheme } from "../context/ThemeContext";
import navBackground from "../assets/images/navimg.JPG";

// Search Overlay Component
const SearchOverlay = ({ isOpen, onClose, isDark, overlayVariants }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { product: allProducts } = useContext(ProductsData);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      const query = searchQuery.toLowerCase();
      const filtered = (allProducts || []).filter(product => 
        product.title?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query)
      );
      setSearchResults(filtered);
      setLoading(false);
    }, 300); // Debounce search

    return () => clearTimeout(timer);
  }, [searchQuery, allProducts]);

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={`fixed inset-0 z-[9998] flex flex-col font-poppins ${
          isDark ? "bg-black text-white" : "bg-white text-gray-900"
        }`}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={overlayVariants}
      >
        {/* Search Header */}
        <div
          className={`flex items-center w-full border-b px-6 py-6 ${
            isDark ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div className="flex-1 flex items-center gap-3">
            <IoIosSearch className={`text-2xl ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`flex-1 px-4 py-3 text-xl focus:outline-none bg-transparent ${
                isDark ? "text-white placeholder-gray-500" : "text-gray-900 placeholder-gray-400"
              }`}
              autoFocus
            />
          </div>
          <button
            onClick={handleClose}
            className={`ml-6 px-6 py-2 font-medium rounded-lg transition-colors ${
              isDark
                ? "text-red-400 hover:bg-red-600 hover:text-white"
                : "text-red-600 hover:bg-red-50"
            }`}
          >
            Close
          </button>
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Searching...
              </div>
            </div>
          ) : searchQuery.trim() === '' ? (
            <div className="flex flex-col items-center justify-center py-20">
              <IoIosSearch className={`text-6xl mb-4 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
              <p className={`text-lg ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Start typing to search products
              </p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className={`text-lg ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                No products found for "{searchQuery}"
              </p>
            </div>
          ) : (
            <div>
              <p className={`mb-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Found {searchResults.length} product{searchResults.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {searchResults.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    onClick={handleClose}
                    className={`group rounded-lg overflow-hidden transition-all ${
                      isDark 
                        ? 'bg-gray-900 hover:bg-gray-800 border border-gray-700' 
                        : 'bg-white hover:shadow-lg border border-gray-200'
                    }`}
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={product.src}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className={`font-medium mb-1 line-clamp-1 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {product.title}
                      </h3>
                      <p className={`text-sm mb-2 line-clamp-2 ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold ${
                          isDark ? 'text-red-400' : 'text-red-600'
                        }`}>
                          ₹{product.price}
                        </span>
                        {product.category && (
                          <span className={`text-xs px-2 py-1 rounded ${
                            isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {product.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

function Navbar() {
  const {
    isScroll,
    isDesktop,
    logoSize,
    logoY,
    logoX,
    isOpen,
    setisOpen,
    isSearchOpen,
    setIsSearchOpen,
    profileOpen,
    setProfileOpen,
    dropdownVariants,
    overlayVariants,
    inputVariants,
    listItemVariants,
    addCart,
  } = useContext(ProductsData);

  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const profileDropdownRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileOpen, setProfileOpen]);

  // Dynamic height based on page and scroll state
  const navbarHeight = isHomePage ? (isScroll ? "90px" : "160px") : "90px";

  // Dynamic icon positioning
  const iconPosition = isHomePage
    ? isScroll
      ? "top-1/2 -translate-y-1/2"
      : "top-4 sm:top-8"
    : "top-1/2 -translate-y-1/2";

  // Dynamic icon size
  const iconSize = isHomePage ? (isScroll ? "text-xl" : "text-2xl") : "text-xl";

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 right-0 w-full z-40 shadow-md"
        style={{
          height: navbarHeight,
          transition: "height 0.3s ease-in-out",
        }}
      >
        {/* Background wrapper with overflow hidden */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          {/* Background Image */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              backgroundImage: `url(${navBackground})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              transform: "translateZ(0)", // GPU acceleration
            }}
          ></div>

          {/* Overlay (transparent layer) */}
          <div
            className={`absolute inset-0 w-full h-full pointer-events-none ${
              isDark ? "bg-black/75" : "bg-white/80"
            }`}
          ></div>
        </div>

        {/* Navbar Content */}
        <div className="w-full h-full max-w-7xl mx-auto relative z-10 px-4 sm:px-6 flex justify-center items-center">
          {/* Logo */}
          <Link to="/" className="font-playfair tracking-widest w-full">
            <div
              className={`flex items-center mt-5 ${
                isDesktop ? "justify-center" : "justify-start px-4"
              }`}
            >
              <motion.h1
                style={{
                  fontSize: isHomePage ? logoSize : isDesktop ? "2.8vw" : "7vw",
                  y: isHomePage ? logoY : 0,
                  x: isHomePage ? logoX : isDesktop ? 0 : -11,
                }}
                className={`font-serif transition-colors duration-500 ${
                  isDark ? "text-red-500" : "text-red-600"
                }`}
              >
                {isDesktop ? "S H I V A L I K" : "SHIVALIK"}
              </motion.h1>
            </div>
          </Link>

          {/* Right Side Icons */}
          <div
            className={`absolute right-4 sm:right-6 flex gap-3 sm:gap-4 ${iconPosition} ${
              isDark ? "text-red-500" : "text-gray-600"
            } z-10`}
          >
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`transition-all duration-300 border-b-2 border-transparent ${
                isDark
                  ? "hover:text-white hover:border-white"
                  : "hover:text-gray-900 hover:border-gray-900"
              }`}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? (
                <FiSun className={iconSize} />
              ) : (
                <FiMoon className={iconSize} />
              )}
            </button>

            {/* Cart */}
            <div className="relative">
              <Link
                to="/cart"
                className={`transition-all duration-300 border-b-2 border-transparent ${
                  isDark
                    ? "hover:text-white hover:border-white"
                    : "hover:text-gray-900 hover:border-gray-900"
                }`}
              >
                <FiShoppingBag className={iconSize} />
                {addCart && addCart.length > 0 && (
                  <span className="absolute -top-2 -right-2 h-5 w-5 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {addCart.length}
                  </span>
                )}
              </Link>
            </div>

            {/* Profile */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className={`transition-all duration-300 border-b-2 border-transparent ${
                  isDark
                    ? "hover:text-white hover:border-white"
                    : "hover:text-gray-900 hover:border-gray-900"
                }`}
              >
                <FiUser className={iconSize} />
              </button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={dropdownVariants}
                    className={`absolute right-0 top-full mt-2 shadow-xl rounded-lg w-60 z-[9999] font-poppins ${
                      isDark
                        ? "bg-black border border-gray-600 text-red-400"
                        : "bg-white border border-gray-200 text-gray-700"
                    }`}
                  >
                    {!user ? (
                      <Link
                        to="/signin"
                        className={`block px-6 py-3 text-sm font-medium rounded-lg transition-colors ${
                          isDark
                            ? "text-red-400 hover:bg-red-600 hover:text-white"
                            : "text-gray-700 hover:bg-red-50 hover:text-red-600"
                        }`}
                        onClick={() => setProfileOpen(false)}
                      >
                        SIGN IN
                      </Link>
                    ) : (
                      <>
                        <div
                          className={`px-6 py-3 text-sm border-b ${
                            isDark
                              ? "text-red-400 border-gray-600"
                              : "text-gray-700 border-gray-200"
                          }`}
                        >
                          Hello, {user.name}
                        </div>
                        <Link
                          to="/account"
                          className={`block px-6 py-3 text-sm font-medium transition-colors ${
                            isDark
                              ? "text-red-400 hover:bg-red-600 hover:text-white"
                              : "text-gray-700 hover:bg-red-50 hover:text-red-600"
                          }`}
                          onClick={() => setProfileOpen(false)}
                        >
                          ACCOUNT SETTINGS
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            setProfileOpen(false);
                          }}
                          className={`w-full text-left px-6 py-3 text-sm font-medium transition-colors rounded-b-lg ${
                            isDark
                              ? "text-red-400 hover:bg-red-600 hover:text-white"
                              : "text-gray-700 hover:bg-red-50 hover:text-red-600"
                          }`}
                        >
                          SIGN OUT
                        </button>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className={`transition-all duration-300 border-b-2 border-transparent ${
                isDark
                  ? "hover:text-white hover:border-white"
                  : "hover:text-gray-900 hover:border-gray-900"
              }`}
            >
              <IoIosSearch className={iconSize} />
            </button>

            {/* Menu */}
            <button
              onClick={() => setisOpen(!isOpen)}
              className={`transition-all duration-300 border-b-2 border-transparent ${
                isDark
                  ? "hover:text-white hover:border-white"
                  : "hover:text-gray-900 hover:border-gray-900"
              }`}
            >
              <MdMenu className={iconSize} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Fullscreen Search Overlay */}
      <SearchOverlay 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        isDark={isDark}
        overlayVariants={overlayVariants}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-[320px] sm:w-[400px] shadow-2xl z-[9997] transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } ${isDark ? "bg-black" : "bg-white"}`}
      >
        <div className="flex justify-end p-6">
          <button
            onClick={() => setisOpen(false)}
            className={`rounded-full p-3 transition-colors ${
              isDark
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
          >
            <IoCloseSharp size={24} />
          </button>
        </div>

        <nav
          className={`flex flex-col px-8 py-4 space-y-6 font-poppins text-lg ${
            isDark ? "text-red-400" : "text-gray-700"
          }`}
        >
          <Link
            to="/"
            className={`transition-colors ${
              isDark ? "hover:text-white" : "hover:text-red-600"
            }`}
            onClick={() => setisOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/products"
            className={`transition-colors ${
              isDark ? "hover:text-white" : "hover:text-red-600"
            }`}
            onClick={() => setisOpen(false)}
          >
            Products
          </Link>
          <Link
            to="/about"
            className={`transition-colors ${
              isDark ? "hover:text-white" : "hover:text-red-600"
            }`}
            onClick={() => setisOpen(false)}
          >
            About
          </Link>
          <Link
            to="/contact"
            className={`transition-colors ${
              isDark ? "hover:text-white" : "hover:text-red-600"
            }`}
            onClick={() => setisOpen(false)}
          >
            Contact
          </Link>
        </nav>
      </div>

      {/* Sidebar Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9996] bg-black/50"
          onClick={() => setisOpen(false)}
        ></div>
      )}
    </>
  );
}

export default Navbar;
