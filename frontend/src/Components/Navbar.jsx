import React, { useContext, useEffect, useRef, useState } from "react";
import { ProductsData } from "../context/Context";
import { FiShoppingBag, FiUser, FiSun, FiMoon, FiHeart } from "react-icons/fi";
import { useWishlist } from "../context/WishlistContext";
import { IoIosSearch } from "react-icons/io";
import { MdMenu } from "react-icons/md";

import { Link, useLocation } from "react-router-dom";
import { IoCloseSharp } from "react-icons/io5";
import { useAuth } from "../context/Auth/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useCatalog } from "../context/CatalogContext";
import { slugifyName } from "../utils/slug";
import navBackground from "../assets/images/navimg.JPG";
import axios from "axios";
import config from "../config/api";

// Search Overlay Component
const SearchOverlay = ({ isOpen, onClose, isDark, overlayVariants }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]); // Products
  const [bookResults, setBookResults] = useState([]);     // Library books
  const [categoryResults, setCategoryResults] = useState([]); // Categories
  const [loading, setLoading] = useState(false);
  const [libraryBooks, setLibraryBooks] = useState([]);
  const [libraryLoaded, setLibraryLoaded] = useState(false);
  const { categories: catalogCategories } = useCatalog();

  const [apiCategories, setApiCategories] = useState([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const { product: allProducts } = useContext(ProductsData);

  const categories = React.useMemo(() => {
    // Merge DB categories + admin-catalog categories.
    const map = new Map();

    for (const c of apiCategories || []) {
      if (!c?.slug) continue;
      map.set(c.slug, c);
    }

    for (const c of catalogCategories || []) {
      const slug = slugifyName(c?.name || '');
      if (!slug) continue;
      if (map.has(slug)) continue;

      map.set(slug, {
        id: c.id,
        slug,
        name: c.name,
        imageUrl: c.imageDataUrl || '',
      });
    }

    return Array.from(map.values());
  }, [apiCategories, catalogCategories]);

  // Load all library books once when search overlay opens
  useEffect(() => {
    if (!isOpen || libraryLoaded) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get(`${config.apiUrl}/api/library/books`);
        if (!cancelled && res.data?.success && Array.isArray(res.data.books)) {
          setLibraryBooks(res.data.books);
        }
      } catch (_) {
        if (!cancelled) setLibraryBooks([]);
      } finally {
        if (!cancelled) setLibraryLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, libraryLoaded]);

  // Load all product categories once when search overlay opens
  useEffect(() => {
    if (!isOpen || categoriesLoaded) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get(`${config.apiUrl}/api/categories`);
        if (!cancelled && res.data?.success && Array.isArray(res.data.categories)) {
          setApiCategories(res.data.categories);
        }
      } catch (_) {
        if (!cancelled) setApiCategories([]);
      } finally {
        if (!cancelled) setCategoriesLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, categoriesLoaded]);

  // Filter products, library books, and categories by search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      setBookResults([]);
      setCategoryResults([]);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      const query = searchQuery.toLowerCase();

      const filteredProducts = (allProducts || []).filter(product =>
        product.title?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query)
      );

      const filteredBooks = (libraryBooks || []).filter(book =>
        book.title?.toLowerCase().includes(query)
      );

      const filteredCategories = (categories || []).filter(cat =>
        cat.name?.toLowerCase().includes(query) ||
        cat.slug?.toLowerCase().includes(query)
      );

      setSearchResults(filteredProducts);
      setBookResults(filteredBooks);
      setCategoryResults(filteredCategories);
      setLoading(false);
    }, 300); // Debounce search

    return () => clearTimeout(timer);
  }, [searchQuery, allProducts, libraryBooks, categories]);

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[9998] flex flex-col font-poppins ${isDark ? "bg-black text-white" : "bg-white text-gray-900"
        }`}
    >
      {/* Search Header */}
      <div
        className={`flex items-center w-full border-b px-6 py-6 ${isDark ? "border-gray-700" : "border-gray-200"
          }`}
      >
        <div className="flex-1 flex items-center gap-3">
          <IoIosSearch className={`text-2xl ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            placeholder="Search for products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`flex-1 px-4 py-3 text-xl focus:outline-none bg-transparent ${isDark ? "text-white placeholder-gray-500" : "text-gray-900 placeholder-gray-400"
              }`}
            autoFocus
          />
        </div>
        <button
          onClick={handleClose}
          className={`ml-6 px-6 py-2 font-medium rounded-lg transition-colors ${isDark
            ? "text-violet-400 hover:bg-violet-600 hover:text-white"
            : "text-violet-600 hover:bg-violet-50"
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
              Start typing to search products or library books
            </p>
          </div>
        ) : searchResults.length === 0 && bookResults.length === 0 && categoryResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className={`text-lg ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              No matches found for "{searchQuery}"
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Category results */}
            {categoryResults.length > 0 && (
              <div>
                <p className={`mb-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Categories: {categoryResults.length} match{categoryResults.length !== 1 ? 'es' : ''}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {categoryResults.map((cat) => (
                    <Link
                      key={cat.slug}
                      to={`/category/${cat.slug}`}
                      onClick={handleClose}
                      className={`group rounded-lg overflow-hidden transition-all ${isDark
                        ? 'bg-gray-900 hover:bg-gray-800 border border-gray-700'
                        : 'bg-white hover:shadow-lg border border-gray-200'
                        }`}
                    >
                      <div className="aspect-square overflow-hidden">
                        {cat.imageUrl ? (
                          <img
                            src={cat.imageUrl}
                            alt={cat.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center text-sm ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
                            }`}>
                            {cat.name}
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className={`font-medium mb-1 line-clamp-1 ${isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                          {cat.name}
                        </h3>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                          /category/{cat.slug}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Product results */}
            {searchResults.length > 0 && (
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
                      className={`group rounded-lg overflow-hidden transition-all ${isDark
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
                        <h3 className={`font-medium mb-1 line-clamp-1 ${isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                          {product.title}
                        </h3>
                        <p className={`text-sm mb-2 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className={`font-semibold ${isDark ? 'text-violet-400' : 'text-violet-600'
                            }`}>
                            ₹{product.price}
                          </span>
                          {product.category && (
                            <span className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
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

            {/* Library books results */}
            {bookResults.length > 0 && (
              <div>
                <p className={`mb-4 mt-6 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Library books: {bookResults.length} match{bookResults.length !== 1 ? 'es' : ''}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {bookResults.map((book) => (
                    <Link
                      key={book.id}
                      to={book.category?.slug ? `/library/${book.category.slug}` : '/library'}
                      onClick={handleClose}
                      className={`group rounded-lg overflow-hidden transition-all ${isDark
                        ? 'bg-gray-900 hover:bg-gray-800 border border-gray-700'
                        : 'bg-white hover:shadow-lg border border-gray-200'
                        }`}
                    >
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={book.src}
                          alt={book.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className={`font-medium mb-1 line-clamp-1 ${isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                          {book.title}
                        </h3>
                        {book.author && (
                          <p className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                            by {book.author}
                          </p>
                        )}
                        <p className={`text-sm mb-2 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                          {book.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className={`font-semibold ${isDark ? 'text-violet-400' : 'text-violet-600'
                            }`}>
                            ₹{book.price}
                          </span>
                          {book.category?.name && (
                            <span className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
                              }`}>
                              {book.category.name}
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
        )}
      </div>
    </div>
  );
};

import { motion, AnimatePresence } from "framer-motion";

function Navbar() {
  const {
    isOpen,
    setisOpen,
    isSearchOpen,
    setIsSearchOpen,
    profileOpen,
    setProfileOpen,
    addCart,
    overlayVariants
  } = useContext(ProductsData);

  const { wishlistCount } = useWishlist();

  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const profileDropdownRef = useRef(null);

  // Scroll listener for Navbar transition
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 5);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileOpen, setProfileOpen]);

  return (
    <>
      <motion.header
        initial={false}
        animate={{
          paddingTop: isScrolled ? "1.25rem" : "0rem",
          backgroundColor: "transparent"
        }}
        className="fixed top-0 left-0 right-0 z-[100] flex justify-center items-center pointer-events-none transition-colors duration-300"
      >
        <motion.div
          initial={false}
          animate={{
            maxWidth: isScrolled ? "1000px" : "100%",
            width: isScrolled ? "90%" : "100%",
            height: isScrolled ? "64px" : "80px",
            borderRadius: isScrolled ? "9999px" : "0px",
            backgroundColor: isScrolled
              ? (isDark ? "rgba(15, 15, 26, 0.7)" : "rgba(255, 255, 255, 0.8)")
              : "transparent",
            paddingLeft: isScrolled ? "2rem" : "4rem",
            paddingRight: isScrolled ? "2rem" : "4rem",
            borderWidth: isScrolled ? "1px" : "0px",
            borderColor: "rgba(139, 92, 246, 0.2)",
            boxShadow: isScrolled ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)" : "none",
          }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className={`flex items-center justify-between pointer-events-auto relative backdrop-blur-xl`}
        >
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div
                className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20 transform group-hover:rotate-6 transition-transform"
              >
                <span className="text-white font-black text-sm">S</span>
              </motion.div>
              <motion.h1
                className={`font-black tracking-tighter text-2xl transition-colors duration-300 ${isScrolled || isDark ? "text-white" : "text-gray-900"
                  }`}
              >
                SHIVALIK
              </motion.h1>
            </Link>
          </div>

          {/* Desktop Navigation Links - Centered */}
          <nav className={`hidden lg:flex items-center gap-10 text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${isScrolled || isDark ? "text-gray-400" : "text-gray-500"
            }`}>
            <Link to="/" className="hover:text-violet-500 transition-colors cursor-pointer">Home</Link>
            <Link to="/products" className="hover:text-violet-500 transition-colors cursor-pointer">Products</Link>
            <Link to="/about" className="hover:text-violet-500 transition-colors cursor-pointer">Services</Link>
            <Link to="/contact" className="hover:text-violet-500 transition-colors cursor-pointer">Contact</Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex items-center gap-1">
              {/* Search Toggle */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className={`p-2.5 rounded-full transition-colors ${isScrolled || isDark ? "text-gray-400 hover:bg-white/10" : "text-gray-500 hover:bg-black/5"
                  }`}
              >
                <IoIosSearch size={20} />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2.5 rounded-full transition-colors ${isScrolled || isDark ? "text-gray-400 hover:bg-white/10" : "text-gray-500 hover:bg-black/5"
                  }`}
              >
                {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
              </button>
            </div>

            {/* Cart Link */}
            <Link to="/cart" className="relative p-2.5 rounded-full transition-colors group">
              <FiShoppingBag className={isScrolled || isDark ? "text-gray-400 group-hover:text-violet-500" : "text-gray-500 group-hover:text-violet-500"} size={20} />
              {addCart?.length > 0 && (
                <span className="absolute top-2 right-2 h-4 w-4 bg-violet-600 text-[10px] font-black text-white rounded-full flex items-center justify-center border-2 border-white/10">
                  {addCart.length}
                </span>
              )}
            </Link>

            {/* Wishlist Link */}
            <Link to="/wishlist" className="relative p-2.5 rounded-full transition-colors group">
              <FiHeart className={isScrolled || isDark ? "text-gray-400 group-hover:text-violet-500" : "text-gray-500 group-hover:text-violet-500"} size={20} />
              {wishlistCount > 0 && (
                <span className="absolute top-2 right-2 h-4 w-4 bg-rose-600 text-[10px] font-black text-white rounded-full flex items-center justify-center border-2 border-white/10">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className={`p-2.5 rounded-full transition-all ${profileOpen ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30" : (isScrolled || isDark ? "text-gray-400 hover:bg-white/10" : "text-gray-500 hover:bg-black/5")
                  }`}
              >
                <FiUser size={18} />
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className={`absolute right-0 top-full mt-4 w-60 py-3 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden border backdrop-blur-3xl ${isDark ? "bg-[#0f0f1a]/95 border-white/10 text-white" : "bg-white/95 border-gray-100 text-gray-900"
                      }`}
                  >
                    {!user ? (
                      <Link to="/account" className="block px-6 py-3 hover:bg-violet-600 hover:text-white transition-colors text-sm font-black uppercase tracking-widest" onClick={() => setProfileOpen(false)}>Preview Dashboard</Link>
                    ) : (
                      <>
                        <div className="px-6 py-2 mb-1 border-b border-white/5 text-[10px] uppercase tracking-[0.2em] text-violet-500 font-black">Account</div>
                        <Link to="/account" className="block px-6 py-3 hover:bg-violet-600 hover:text-white transition-colors text-sm font-bold" onClick={() => setProfileOpen(false)}>Settings</Link>
                        <button onClick={() => { logout(); setProfileOpen(false); }} className="w-full text-left px-6 py-3 hover:bg-rose-600 hover:text-white transition-colors text-sm font-bold">Sign Out</button>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>


            {/* Mobile Menu */}
            <button
              onClick={() => setisOpen(!isOpen)}
              className={`lg:hidden p-2.5 rounded-full transition-colors ${isScrolled || isDark ? "text-gray-400 hover:bg-white/10" : "text-gray-500 hover:bg-black/5"
                }`}
            >
              <MdMenu size={26} />
            </button>
          </div>
        </motion.div>
      </motion.header>

      {/* Fullscreen Search Overlay */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        isDark={isDark}
        overlayVariants={overlayVariants}
      />

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setisOpen(false)}
              className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`fixed top-0 right-0 h-full w-full max-w-[400px] z-[1001] shadow-2xl flex flex-col border-l ${isDark ? "bg-[#0b0b14] border-white/5 text-white" : "bg-white border-gray-100 text-gray-900"
                }`}
            >
              <div className="flex items-center justify-between p-10 border-b border-white/5">
                <div className="flex flex-col">
                  <span className="text-[10px] text-violet-500 font-black uppercase tracking-[0.3em] mb-1">Explore</span>
                  <h2 className="text-3xl font-black tracking-tighter uppercase">Menu</h2>
                </div>
                <button
                  onClick={() => setisOpen(false)}
                  className="p-4 bg-violet-600 text-white rounded-2xl hover:bg-violet-700 transition-all hover:rotate-90 shadow-2xl shadow-violet-600/40"
                >
                  <IoCloseSharp size={24} />
                </button>
              </div>

              <nav className="flex-1 px-10 py-12 flex flex-col gap-8 text-2xl font-black uppercase tracking-tight">
                <Link to="/" onClick={() => setisOpen(false)} className="hover:text-violet-500 transition-all hover:translate-x-2">Home</Link>
                <Link to="/products" onClick={() => setisOpen(false)} className="hover:text-violet-500 transition-all hover:translate-x-2">Products</Link>
                <Link to="/about" onClick={() => setisOpen(false)} className="hover:text-violet-500 transition-all hover:translate-x-2">Services</Link>
                <Link to="/contact" onClick={() => setisOpen(false)} className="hover:text-violet-500 transition-all hover:translate-x-2">Contact</Link>

                <div className="mt-auto pt-10 border-t border-white/5 grid grid-cols-1 gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Legal</span>
                    <Link to="/terms" onClick={() => setisOpen(false)} className="text-xs text-gray-400 hover:text-violet-500 transition-colors">Terms & Conditions</Link>
                    <Link to="/refund-policy" onClick={() => setisOpen(false)} className="text-xs text-gray-400 hover:text-violet-500 transition-colors">Refund Policy</Link>
                    <Link to="/privacy-policy" onClick={() => setisOpen(false)} className="text-xs text-gray-400 hover:text-violet-500 transition-colors">Privacy Policy</Link>
                  </div>
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;
