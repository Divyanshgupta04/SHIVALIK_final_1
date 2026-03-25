import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import config from '../config/api';

// CatalogContext
// Stores Category -> Sub-Category -> Product in localStorage (cache) and syncs from DB when available.
// Images are stored as DataURL (base64) so the demo works without a backend.

const STORAGE_KEY = 'shivalik.catalog.v1';

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

  const refreshCatalog = async () => {
    console.log('[CatalogContext] Refreshing from DB...');
    setLoading(true);
    try {
      const [catRes, subRes, prodRes] = await Promise.all([
        axios.get(`${config.apiUrl}/api/categories`),
        axios.get(`${config.apiUrl}/api/subcategories`),
        axios.get(`${config.apiUrl}/api/products?limit=1000`),
      ]);

      const dbCategories = Array.isArray(catRes?.data?.categories) ? catRes.data.categories : [];
      const dbSubCategories = Array.isArray(subRes?.data?.subCategories) ? subRes.data.subCategories : [];
      const dbProducts = Array.isArray(prodRes?.data?.products) ? prodRes.data.products : [];

      console.log(`[CatalogContext] Loaded: ${dbCategories.length} cats, ${dbSubCategories.length} subs, ${dbProducts.length} prods`);

      const mappedCats = dbCategories.map(c => ({
        id: String(c._id || ''),
        name: c.name,
        slug: c.slug,
        imageDataUrl: c.imageUrl || '',
      }));

      const mappedSubs = dbSubCategories.map(sc => ({
        id: String(sc._id || ''),
        name: sc.name,
        slug: sc.slug,
        categoryId: String(sc.categoryId || ''),
        imageDataUrl: sc.imageUrl || '',
      }));

      const mappedProds = dbProducts
        .filter(p => !!p.categoryId)
        .map(p => ({
          _id: p._id, // Keep the real MongoDB ID
          id: p.id || String(p._id), // Fallback to string _id if numeric id is missing
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
        }));

      setCategories(mappedCats);
      setSubCategories(mappedSubs);
      setProducts(mappedProds);
      
      console.log('[CatalogContext] Sync complete.');
    } catch (err) {
      console.error('[CatalogContext] Sync Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // refresh from DB on start
  useEffect(() => {
    refreshCatalog();
  }, []);

  // Socket setup for real-time category/subcategory updates
  useEffect(() => {
    const socket = io(config.socketUrl);

    socket.on('categoryAdded', (cat) => {
      console.log('[CatalogContext] Local Add Category:', cat._id);
      setCategories(prev => [...prev.filter(c => c.id !== String(cat._id)), {
        id: String(cat._id),
        name: cat.name,
        slug: cat.slug,
        imageDataUrl: cat.imageUrl || ''
      }]);
    });

    socket.on('categoryUpdated', (cat) => {
      console.log('[CatalogContext] Local Update Category:', cat._id);
      setCategories(prev => prev.map(c => c.id === String(cat._id) ? {
        id: String(cat._id),
        name: cat.name,
        slug: cat.slug,
        imageDataUrl: cat.imageUrl || ''
      } : c));
    });

    socket.on('categoryDeleted', (id) => {
       console.log('[CatalogContext] Local Delete Category:', id);
      setCategories(prev => prev.filter(c => c.id !== String(id)));
    });

    socket.on('subCategoryAdded', (sc) => {
      console.log('[CatalogContext] Local Add SubCategory:', sc._id, 'Parent:', sc.categoryId);
      setSubCategories(prev => [...prev.filter(item => item.id !== String(sc._id)), {
        id: String(sc._id),
        name: sc.name,
        slug: sc.slug,
        categoryId: String(sc.categoryId),
        imageDataUrl: sc.imageUrl || ''
      }]);
    });

    socket.on('subCategoryUpdated', (sc) => {
       console.log('[CatalogContext] Local Update SubCategory:', sc._id);
      setSubCategories(prev => prev.map(item => item.id === String(sc._id) ? {
        id: String(sc._id),
        name: sc.name,
        slug: sc.slug,
        categoryId: String(sc.categoryId),
        imageDataUrl: sc.imageUrl || ''
      } : item));
    });

    socket.on('subCategoryDeleted', (id) => {
       console.log('[CatalogContext] Local Delete SubCategory:', id);
      setSubCategories(prev => prev.filter(item => item.id !== String(id)));
    });

    return () => socket.disconnect();
  }, []);

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

  const value = {
    // state
    categories,
    subCategories,
    products,
    loading,

    // maps (handy for rendering)
    categoriesById,
    subCategoriesById,

    // setters (to keep existing component style simple)
    setCategories,
    setSubCategories,
    setProducts,

    // helpers
    makeId: () => `${Date.now()}_${Math.random().toString(16).slice(2)}`,

    refreshCatalog,
    // reset
    clearAll: () => {
      setCategories([]);
      setSubCategories([]);
      setProducts([]);
    },
  };

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}
