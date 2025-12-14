import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../../config/api';
import { useCatalog } from '../../../context/CatalogContext.jsx';
import Category from './Category';
import Product from './Product';

// AdminCatalog.jsx
// Category -> Sub-Category -> Product admin flow.
// Data persists in localStorage (frontend demo). No backend required.

export default function AdminCatalog() {
  const navigate = useNavigate();
  const {
    categories,
    subCategories,
    products,
    setCategories,
    setSubCategories,
    setProducts,
    clearAll,
  } = useCatalog();

  // Optional: follow your existing admin pattern
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    // Load DB data so admin sees what users will see.
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
      } catch (err) {
        // If API isn't available, localStorage CatalogContext data still shows.
        console.error('Failed to load catalog from DB (using local cache):', err);
      }
    })();
  }, [navigate, setCategories, setSubCategories, setProducts]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin • Catalog Manager</h1>
              <p className="mt-1 text-sm text-gray-600">
                Category → Sub-Category → Product management (localStorage demo).
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => navigate('/admin/dashboard')}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Back to Dashboard
              </button>
              <button
                type="button"
                onClick={() => {
                  const ok = window.confirm('Clear all catalog data (categories, sub-categories, products)?');
                  if (!ok) return;
                  clearAll();
                }}
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Category
          categories={categories}
          setCategories={setCategories}
          subCategories={subCategories}
          setSubCategories={setSubCategories}
          products={products}
          setProducts={setProducts}
        />

        <Product
          categories={categories}
          subCategories={subCategories}
          products={products}
          setProducts={setProducts}
        />
      </main>
    </div>
  );
}
