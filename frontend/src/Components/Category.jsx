import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { ProductsData } from '../context/Context';
import config from '../config/api';

// Category keyword mapping for better filtering
const CATEGORY_MAP = {
  insurance: ['insurance'],
  pan: ['pan', 'pan card'],
  certificate: ['certificate'],
  service: ['service'],
  tax: ['tax'],
  'land-record': ['land', 'land record'],
  library: ['library'],
  partner: ['partner', 'partner program']
};

function titleCase(str = '') {
  return str
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function normalize(s = '') {
  return s.toLowerCase();
}

function filterBySlug(items = [], slug) {
  const normalizedSlug = normalize(slug);
  // Use additional keywords if available
  const searchTerms = CATEGORY_MAP[slug] ? [normalizedSlug, ...CATEGORY_MAP[slug]] : [normalizedSlug];
  
  return items.filter((p) => {
    const cat = normalize(p?.category || '');
    const title = normalize(p?.title || '');
    const desc = normalize(p?.description || '');
    
    // Check against all search terms
    return searchTerms.some(term => {
      const normalizedTerm = normalize(term);
      // Prefer explicit category match
      if (cat && cat === normalizedTerm) return true;
      // Also check if category contains the term or vice versa
      if (cat && (cat.includes(normalizedTerm) || normalizedTerm.includes(cat))) return true;
      // Fallback to title/description keyword match
      return title.includes(normalizedTerm) || desc.includes(normalizedTerm);
    });
  });
}

export default function Category() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { product: allProducts, loading: contextLoading } = useContext(ProductsData);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryName, setCategoryName] = useState('');

  // Special case: redirect "library" category to the dedicated Library section
  useEffect(() => {
    if (slug === 'library') {
      navigate('/library', { replace: true });
    }
  }, [slug, navigate]);

  useEffect(() => {
    // If we are redirecting to /library, skip loading logic for this page
    if (slug === 'library') return;

    let isMounted = true;
    async function load() {
      setLoading(true);
      setError(null);

      // Fetch category details to get the proper name
      try {
        const catResp = await axios.get(`${config.apiUrl}/api/categories`);
        if (catResp.data.success) {
          const foundCat = catResp.data.categories.find(c => c.slug === slug);
          if (foundCat && isMounted) {
            setCategoryName(foundCat.name);
          }
        }
      } catch (_) {
        // Ignore and use slug as fallback
      }

      // Try backend first, then strictly filter by slug
      try {
        const q = encodeURIComponent(slug);
        const resp = await axios.get(`${config.apiUrl}/api/products?category=${q}`);
        const serverItems = Array.isArray(resp?.data?.products) ? resp.data.products : [];
        const filteredServer = filterBySlug(serverItems, slug);
        if (isMounted && filteredServer.length > 0) {
          setItems(filteredServer);
          setLoading(false);
          return;
        }
      } catch (_) {
        // Ignore network/API errors and fallback to context
      }

      // Fallback to context products and strict filter
      const filteredLocal = filterBySlug(allProducts || [], slug);
      if (isMounted) {
        setItems(filteredLocal);
        setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [slug, allProducts]);

  const heading = categoryName || titleCase(slug);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className={`text-3xl sm:text-4xl font-extrabold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{heading}</h1>
          <Link to="/" className={`text-sm ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>← Back to Home</Link>
        </div>

        {loading || contextLoading ? (
          <div className="py-16 text-center text-lg opacity-80">Loading {heading}...</div>
        ) : error ? (
          <div className="py-16 text-center text-red-500">{error}</div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center opacity-80">No items found for {heading}.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, index) => (
              <Link key={item.id || `${slug}-${index}`} to={`/product/${item.id}`}>
                <motion.div
                  className={`${isDark ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10' : 'bg-gradient-to-br from-white to-blue-50 border border-blue-100'} group rounded-2xl overflow-hidden shadow-[0_10px_24px_rgba(0,0,0,0.12)]`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.03 }}
                  whileHover={{ y: -4 }}
                >
                  <div className="relative h-48 overflow-hidden">
                    {item.src ? (
                      <img src={item.src} alt={item.title || 'Item'} className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-110" />
                    ) : (
                      <div className={`absolute inset-0 flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>No image</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1 line-clamp-1">{item.title || 'Item'}</h3>
                    {item.description && (
                      <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm mb-3 line-clamp-2`}>{item.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      {item.price ? (
                        <span className={`${isDark ? 'text-blue-300' : 'text-blue-700'} font-bold text-xl`}>₹{item.price}</span>
                      ) : <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm`}>Contact for pricing</span>}
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
