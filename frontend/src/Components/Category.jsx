import React, { useEffect, useState, useContext, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { ProductsData } from '../context/Context';
import { useCatalog } from '../context/CatalogContext';
import { normalizeForCompare, slugifyName } from '../utils/slug';
import config from '../config/api';
import PanService from './PanService';
import ProductCard from "./ProductCard";

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
  return normalizeForCompare(s);
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
  const { product: allProducts, loading: contextLoading, HandleClickAdd } = useContext(ProductsData);
  const { categories: catalogCategories, subCategories: catalogSubCategories } = useCatalog();

  const catalogCategory = useMemo(() => {
    return (catalogCategories || []).find((c) => slugifyName(c?.name || '') === String(slug)) || null;
  }, [catalogCategories, slug]);

  const catalogCategoryName = catalogCategory?.name || '';

  const subCategoriesForCatalogCategory = useMemo(() => {
    if (!catalogCategory) return [];
    return (catalogSubCategories || [])
      .filter((sc) => sc.categoryId === catalogCategory.id)
      .slice()
      .sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
  }, [catalogCategory, catalogSubCategories]);

  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState('');

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
    // Dedicated PAN flow has its own component and does not need product/category data
    if (slug === 'pan') return;

    // Reset sub-category selection when switching categories
    setSelectedSubCategoryId('');

    let isMounted = true;
    async function load() {
      setLoading(true);
      setError(null);

      // Fetch category details to get the proper name (DB categories)
      try {
        const catResp = await axios.get(`${config.apiUrl}/api/categories`);
        if (catResp.data.success) {
          const foundCat = catResp.data.categories.find(c => c.slug === slug);
          if (foundCat && isMounted) {
            setCategoryName(foundCat.name);
          }
        }
      } catch (_) {
        // Ignore - admin-catalog categories (localStorage) are handled separately.
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

      // Fallback to context products.
      // If this slug belongs to an AdminCatalog category, prefer id-based matching.
      let filteredLocal;
      if (catalogCategory) {
        filteredLocal = (allProducts || []).filter((p) => {
          // For admin-catalog products we now attach categoryId/subCategoryId.
          if (p?.categoryId) return String(p.categoryId) === String(catalogCategory.id);
          // Fallback for older shapes.
          return normalize(p?.category || '') === normalize(slug);
        });
      } else {
        filteredLocal = filterBySlug(allProducts || [], slug);
      }

      if (isMounted) {
        setItems(filteredLocal);
        setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [slug, allProducts]);

  const heading = categoryName || catalogCategoryName || titleCase(slug);

  // Special UI for PAN card category based on provided flow
  if (slug === 'pan') {
    return <PanService />;
  }

  const visibleItems = useMemo(() => {
    if (!selectedSubCategoryId) return items;
    return (items || []).filter((p) => String(p?.subCategoryId || '') === String(selectedSubCategoryId));
  }, [items, selectedSubCategoryId]);

  const isCatalogFlow = !!catalogCategory && subCategoriesForCatalogCategory.length > 0;

  const selectedSubCategory = useMemo(() => {
    if (!selectedSubCategoryId) return null;
    return (subCategoriesForCatalogCategory || []).find((sc) => String(sc.id) === String(selectedSubCategoryId)) || null;
  }, [selectedSubCategoryId, subCategoriesForCatalogCategory]);

  const handleBuyNow = (p) => {
    if (p.isInsurance && p.externalLink) {
      window.open(p.externalLink, '_blank');
    } else {
      navigate('/checkout', { state: { buyNowItem: p } });
    }
  };

  const productsSection = (list, emptyMessage) => {
    if (loading || contextLoading) {
      return <div className="py-16 text-center text-lg opacity-80">Loading {heading}...</div>;
    }
    if (error) {
      return <div className="py-16 text-center text-violet-500">{error}</div>;
    }
    if (!list || list.length === 0) {
      return <div className="py-16 text-center opacity-80">{emptyMessage}</div>;
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {list.map((item, index) => (
          <ProductCard
            key={item.id || `${slug}-${index}`}
            item={item}
            index={index}
            isDark={isDark}
            onAddToCart={HandleClickAdd}
            onBuyNow={handleBuyNow}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className={`text-3xl sm:text-4xl font-extrabold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{heading}</h1>
          <Link
            to="/"
            className={`text-sm ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
          >
            ← Back to Home
          </Link>
        </div>

        {/* Catalog flow: same area switches between sub-categories and products */}
        {isCatalogFlow ? (
          <div className={`mb-8 rounded-2xl border p-4 ${isDark ? 'border-white/10 bg-white/5' : 'border-blue-100 bg-white'}`}>
            {!selectedSubCategoryId ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
                  <div>
                    <h2 className={`text-xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>Sub-Categories</h2>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Select a sub-category to explorer specialized services.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {subCategoriesForCatalogCategory.map((sc, scIndex) => (
                    <motion.button
                      key={sc.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: scIndex * 0.05 }}
                      whileHover={{ y: -5 }}
                      onClick={() => setSelectedSubCategoryId(sc.id)}
                      className={`group relative h-48 rounded-2xl border overflow-hidden transition-all duration-300 ${isDark
                        ? 'border-white/10 bg-[#13111d] hover:border-violet-500/50 shadow-lg shadow-black/40'
                        : 'border-gray-200 bg-white hover:border-violet-200 shadow-md'
                        }`}
                    >
                      <div className="absolute inset-0 w-full h-full">
                        {sc.imageDataUrl ? (
                          <img src={sc.imageDataUrl} alt={sc.name} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-violet-900/10' : 'bg-gray-50'}`}>
                            <FiGrid className="w-10 h-10 text-violet-500/20" />
                          </div>
                        )}
                        <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-[#0a0a1a] to-transparent' : 'from-black/60 to-transparent'}`} />
                      </div>

                      <div className="absolute inset-0 p-5 flex flex-col justify-end">
                        <span className="text-lg font-black text-white group-hover:text-violet-400 transition-colors">
                          {sc.name}
                        </span>
                        <div className="text-[10px] uppercase tracking-widest text-white/50 font-bold mt-1">Explore Products</div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {selectedSubCategory?.name || 'Products'}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Products in this sub-category.
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedSubCategoryId('')}
                    className={`rounded-lg border px-3 py-2 text-xs font-medium ${isDark
                      ? 'border-white/20 text-gray-200 hover:bg-white/10'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    ← Back
                  </button>
                </div>

                <div className={`mt-6 pt-6 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                  {productsSection(visibleItems, 'No products found in this sub-category.')}
                </div>
              </>
            )}
          </div>
        ) : (
          // Default (non-catalog) flow: products render as before
          <>{productsSection(items, `No items found for ${heading}.`)}</>
        )}
      </div>
    </div>
  );
}
