import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { ProductsData } from '../context/Context';
import { FiShoppingCart, FiHeart, FiShare2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import axios from 'axios';
import config from '../config/api';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { product: allProducts, addCart, HandleClickAdd } = useContext(ProductsData);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState('');
  const [allImages, setAllImages] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLibraryBook, setIsLibraryBook] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setIsLibraryBook(false);
      setProduct(null);

      // 1) Try normal products from context first
      if (allProducts && allProducts.length > 0) {
        const foundProduct = allProducts.find(p => p.id === parseInt(id));
        if (foundProduct) {
          if (cancelled) return;
          setProduct(foundProduct);
          setMainImage(foundProduct.src);

          const productImages = [foundProduct.src];
          if (foundProduct.images && foundProduct.images.length > 0) {
            productImages.push(...foundProduct.images);
          }
          setAllImages(productImages);

          const related = allProducts
            .filter(p => p.category === foundProduct.category && p.id !== foundProduct.id)
            .slice(0, 4);
          setRelatedProducts(related);
          setLoading(false);
          return;
        }
      }

      // 2) If not found, try library books API so /product/:id also works for library items
      try {
        const res = await axios.get(`${config.apiUrl}/api/library/books/${id}`);
        if (!cancelled && res.data?.success && res.data.book) {
          const b = res.data.book;
          const mapped = {
            id: b.id,
            title: b.title,
            description: b.description,
            price: b.price,
            src: b.src,
            category: (b.category && (b.category.name || b.category.slug)) || 'Library',
          };

          setProduct(mapped);
          setMainImage(mapped.src);
          setAllImages(mapped.src ? [mapped.src] : []);
          setRelatedProducts([]); // Optional: could fetch related library books by category
          setIsLibraryBook(true);
        }
      } catch (e) {
        // ignore, will fall through to not-found state
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [id, allProducts]);

  const handleAddToCart = () => {
    if (!product) return;
    // For now, Add to Cart only works for normal products managed in context
    if (!isLibraryBook) {
      HandleClickAdd(product.id);
    }
  };


  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${isDark ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
        <h2 className="text-2xl font-bold mb-4">Product not found</h2>
        <Link to="/products" className={`px-6 py-3 rounded-lg ${isDark ? 'bg-red-600 hover:bg-red-700' : 'bg-red-600 hover:bg-red-700'} text-white`}>
          Back to Products
        </Link>
      </div>
    );
  }

  const isInCart = addCart?.some(item => item.id === product.id);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Breadcrumb */}
      <div className={`border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className={isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}>
              Home
            </Link>
            <span className={isDark ? 'text-gray-600' : 'text-gray-400'}>/</span>
            <Link to="/products" className={isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}>
              Products
            </Link>
            <span className={isDark ? 'text-gray-600' : 'text-gray-400'}>/</span>
            <span className={isDark ? 'text-white' : 'text-gray-900'}>{product.title}</span>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`aspect-square rounded-2xl overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-white'}`}
            >
              <img 
                src={mainImage} 
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Thumbnail Images - Only show if there are multiple images */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {allImages.map((img, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => setMainImage(img)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      mainImage === img 
                        ? isDark ? 'border-red-500' : 'border-red-600'
                        : isDark ? 'border-gray-800 hover:border-gray-700' : 'border-gray-200 hover:border-gray-300'
                    } ${isDark ? 'bg-gray-900' : 'bg-white'}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category Tag */}
            {product.category && (
              <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
              }`}>
                {product.category}
              </span>
            )}

            {/* Title */}
            <div>
              <h1 className={`text-3xl lg:text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {product.title}
              </h1>
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                SKU: #{product.id}
              </p>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className={`text-4xl font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                ₹{product.price}
              </span>
            </div>

            {/* Rating (Static for now) */}
            <div className="flex items-center gap-2">
              <div className="flex text-yellow-400">
                {'★★★★★'.split('').map((star, i) => (
                  <span key={i}>{star}</span>
                ))}
              </div>
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>4.5 (128 reviews)</span>
            </div>

            {/* Description */}
            <div className={`pt-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                {product.description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                onClick={handleAddToCart}
                disabled={isInCart}
                className={`flex-1 py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 transition-all ${
                  isInCart
                    ? isDark
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                <FiShoppingCart />
                {isInCart ? 'Already in Cart' : 'Add to Cart'}
              </button>
              <button
                className={`p-4 rounded-lg border transition-all ${
                  isDark 
                    ? 'border-gray-700 hover:border-red-600 hover:bg-gray-900' 
                    : 'border-gray-300 hover:border-red-600 hover:bg-gray-50'
                }`}
              >
                <FiHeart className="text-xl" />
              </button>
              <button
                className={`p-4 rounded-lg border transition-all ${
                  isDark 
                    ? 'border-gray-700 hover:border-red-600 hover:bg-gray-900' 
                    : 'border-gray-300 hover:border-red-600 hover:bg-gray-50'
                }`}
              >
                <FiShare2 className="text-xl" />
              </button>
            </div>
          </div>
        </div>

        {/* You Might Also Like */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              You might also like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map(item => (
                <Link
                  key={item.id}
                  to={`/product/${item.id}`}
                  className={`group rounded-lg overflow-hidden transition-all ${
                    isDark 
                      ? 'bg-gray-900 hover:bg-gray-800' 
                      : 'bg-white hover:shadow-lg'
                  }`}
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={item.src}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className={`font-medium mb-1 line-clamp-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {item.title}
                    </h3>
                    <p className={`font-semibold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                      ₹{item.price}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;
