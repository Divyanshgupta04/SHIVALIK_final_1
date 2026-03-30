import React, { createContext, useContext, useEffect, useMemo, useState, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import config from '../config/api';
import { cachedGet, invalidateCache } from '../utils/apiCache';

/**
 * CatalogContext
 * ─────────────────────────────────────────────────────────────────────────────
 * Stores Category → Sub-Category → Product and syncs from the DB.
 *
 * Optimisations applied vs the original:
 *  1. 5-minute TTL cache via apiCache.js — re-mounts don't re-trigger fetches.
 *  2. All three API calls run in parallel (Promise.all).
 *  3. Only fetches when data is stale or explicitly refreshed.
 *  4. Products fetched with limit=500 (practical cap; raise if needed).
 *  5. Socket events keep the cache consistent after writes without re-fetching.
 */

const CATALOG_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const CatalogContext = createContext(null);

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog must be used within CatalogProvider');
  return ctx;
}

export function CatalogProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Track whether we have already loaded data this session
  const hasLoaded = useRef(false);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const mapCategory = (c) => ({
    id: String(c._id || ''),
    name: c.name,
    slug: c.slug,
    imageDataUrl: c.imageUrl || '',
  });

  const mapSubCategory = (sc) => ({
    id: String(sc._id || ''),
    name: sc.name,
    slug: sc.slug,
    categoryId: String(sc.categoryId || ''),
    imageDataUrl: sc.imageUrl || '',
  });

  const mapProduct = (p) => ({
    _id: p._id,
    id: p.id || String(p._id),
    name: p.title,
    price: Number(p.price || 0),
    originalPrice: Number(p.originalPrice || 0),
    sellingPrice: Number(p.sellingPrice || 0),
    discountPercent: Number(p.discountPercent || 0),
    isNew: !!p.isNew,
    isBestSeller: !!p.isBestSeller,
    categoryId: String(p.categoryId || ''),
    subCategoryId: p.subCategoryId ? String(p.subCategoryId) : '',
    productType: p.productType || 'both',
    imageDataUrl: p.src || '',
    isInsurance: !!p.isInsurance,
    externalLink: p.externalLink || '',
    homePageOrder: p.homePageOrder || 0,
    createdAt: p.createdAt,
  });

  // ── Primary fetch (cached) ─────────────────────────────────────────────────

  const refreshCatalog = async (force = false) => {
    // Skip if data is already fresh and this isn't a forced refresh
    if (!force && hasLoaded.current) return;

    console.log('[CatalogContext] Refreshing from DB...');
    setLoading(true);

    try {
      // Invalidate old cache if forcing a refresh
      if (force) {
        invalidateCache(`${config.apiUrl}/api/categories`);
        invalidateCache(`${config.apiUrl}/api/subcategories`);
        invalidateCache(`${config.apiUrl}/api/products`);
      }

      // Parallel fetch with 5-minute client-side TTL cache
      const [catData, subData, prodData] = await Promise.all([
        cachedGet(axios, `${config.apiUrl}/api/categories`, { ttlMs: CATALOG_CACHE_TTL }),
        cachedGet(axios, `${config.apiUrl}/api/subcategories`, { ttlMs: CATALOG_CACHE_TTL }),
        cachedGet(axios, `${config.apiUrl}/api/products`, {
          ttlMs: CATALOG_CACHE_TTL,
          params: { limit: 500 }
        }),
      ]);

      const dbCategories   = Array.isArray(catData?.categories)   ? catData.categories   : [];
      const dbSubCategories = Array.isArray(subData?.subCategories) ? subData.subCategories : [];
      const dbProducts      = Array.isArray(prodData?.products)    ? prodData.products    : [];

      console.log(
        `[CatalogContext] Loaded: ${dbCategories.length} cats, ` +
        `${dbSubCategories.length} subs, ${dbProducts.length} prods`
      );

      setCategories(dbCategories.map(mapCategory));
      setSubCategories(dbSubCategories.map(mapSubCategory));
      setProducts(dbProducts.filter(p => !!p.categoryId).map(mapProduct));

      hasLoaded.current = true;
      console.log('[CatalogContext] Sync complete.');
    } catch (err) {
      console.error('[CatalogContext] Sync Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load once on mount
  useEffect(() => {
    refreshCatalog();
  }, []);

  // ── Socket — real-time updates (keep local state consistent) ───────────────
  useEffect(() => {
    const socket = io(config.socketUrl);

    socket.on('categoryAdded', (cat) => {
      setCategories(prev => [...prev.filter(c => c.id !== String(cat._id)), mapCategory(cat)]);
      invalidateCache(`${config.apiUrl}/api/categories`);
    });
    socket.on('categoryUpdated', (cat) => {
      setCategories(prev => prev.map(c => c.id === String(cat._id) ? mapCategory(cat) : c));
      invalidateCache(`${config.apiUrl}/api/categories`);
    });
    socket.on('categoryDeleted', (id) => {
      setCategories(prev => prev.filter(c => c.id !== String(id)));
      invalidateCache(`${config.apiUrl}/api/categories`);
    });

    socket.on('subCategoryAdded', (sc) => {
      setSubCategories(prev => [...prev.filter(item => item.id !== String(sc._id)), mapSubCategory(sc)]);
      invalidateCache(`${config.apiUrl}/api/subcategories`);
    });
    socket.on('subCategoryUpdated', (sc) => {
      setSubCategories(prev => prev.map(item => item.id === String(sc._id) ? mapSubCategory(sc) : item));
      invalidateCache(`${config.apiUrl}/api/subcategories`);
    });
    socket.on('subCategoryDeleted', (id) => {
      setSubCategories(prev => prev.filter(item => item.id !== String(id)));
      invalidateCache(`${config.apiUrl}/api/subcategories`);
    });

    socket.on('productAdded', () => {
      invalidateCache(`${config.apiUrl}/api/products`);
      refreshCatalog(true);
    });
    socket.on('productUpdated', () => {
      invalidateCache(`${config.apiUrl}/api/products`);
      refreshCatalog(true);
    });
    socket.on('productDeleted', () => {
      invalidateCache(`${config.apiUrl}/api/products`);
      refreshCatalog(true);
    });

    return () => socket.disconnect();
  }, []);

  // ── Derived maps ───────────────────────────────────────────────────────────

  const categoriesById = useMemo(() => {
    const map = new Map();
    for (const c of categories) map.set(c.id, c);
    return map;
  }, [categories]);

  const subCategoriesById = useMemo(() => {
    const map = new Map();
    for (const sc of subCategories) map.set(sc.id, sc);
    return map;
  }, [subCategories]);

  // ── Context value ──────────────────────────────────────────────────────────

  const value = {
    categories,
    subCategories,
    products,
    loading,
    categoriesById,
    subCategoriesById,
    setCategories,
    setSubCategories,
    setProducts,
    makeId: () => `${Date.now()}_${Math.random().toString(16).slice(2)}`,
    refreshCatalog: () => refreshCatalog(true), // exposed as forced refresh
    clearAll: () => {
      setCategories([]);
      setSubCategories([]);
      setProducts([]);
    },
  };

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}
