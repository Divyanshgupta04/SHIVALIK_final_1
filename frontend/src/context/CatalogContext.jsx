import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
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

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function loadFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  return safeParse(raw);
}

function saveToStorage(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore (quota, private mode, etc.)
  }
}

const makeId = () => `${Date.now()}_${Math.random().toString(16).slice(2)}`;

export function CatalogProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [products, setProducts] = useState([]);

  // One-time load (local cache) + refresh from DB
  useEffect(() => {
    const stored = loadFromStorage();
    if (stored) {
      setCategories(Array.isArray(stored.categories) ? stored.categories : []);
      setSubCategories(Array.isArray(stored.subCategories) ? stored.subCategories : []);
      setProducts(Array.isArray(stored.products) ? stored.products : []);
    }

    // Fetch latest from DB so storefront always shows newly added admin catalog data.
    // If API is unavailable, cached localStorage data still works.
    (async () => {
      try {
        const [catRes, subRes, prodRes] = await Promise.all([
          axios.get(`${config.apiUrl}/api/categories`),
          axios.get(`${config.apiUrl}/api/subcategories`),
          axios.get(`${config.apiUrl}/api/products`),
        ]);

        const dbCategories = Array.isArray(catRes?.data?.categories) ? catRes.data.categories : [];
        const dbSubCategories = Array.isArray(subRes?.data?.subCategories) ? subRes.data.subCategories : [];
        const dbProducts = Array.isArray(prodRes?.data?.products) ? prodRes.data.products : [];

        // Normalize into the Catalog Manager shapes
        setCategories(
          dbCategories.map((c) => ({
            id: String(c._id),
            name: c.name,
            slug: c.slug,
            imageDataUrl: c.imageUrl || '',
          })),
        );

        setSubCategories(
          dbSubCategories.map((sc) => ({
            id: String(sc._id),
            name: sc.name,
            slug: sc.slug,
            categoryId: String(sc.categoryId),
            imageDataUrl: sc.imageUrl || '',
          })),
        );

        // Only take products that are part of the catalog system (linked to categoryId)
        setProducts(
          dbProducts
            .filter((p) => !!p.categoryId)
            .map((p) => ({
              id: p.id,
              name: p.title,
              price: Number(p.price || 0),
              categoryId: String(p.categoryId),
              subCategoryId: p.subCategoryId ? String(p.subCategoryId) : '',
              productType: p.productType || 'both',
              imageDataUrl: p.src || '',
              createdAt: p.createdAt,
            })),
        );
      } catch {
        // ignore (offline / backend not running)
      }
    })();
  }, []);

  // Persist
  useEffect(() => {
    saveToStorage({ categories, subCategories, products });
  }, [categories, subCategories, products]);

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

    // maps (handy for rendering)
    categoriesById,
    subCategoriesById,

    // setters (to keep existing component style simple)
    setCategories,
    setSubCategories,
    setProducts,

    // helpers
    makeId,

    // reset
    clearAll: () => {
      setCategories([]);
      setSubCategories([]);
      setProducts([]);
    },
  };

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}
