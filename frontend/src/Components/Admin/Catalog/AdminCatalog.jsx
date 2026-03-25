import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../../config/api';
import { useCatalog } from '../../../context/CatalogContext.jsx';
import Category from './Category';
import Product from './Product';

// AdminCatalog.jsx
// Category -> Sub-Category -> Product admin flow.
// Fully connected to DB via CatalogContext.

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
    refreshCatalog,
  } = useCatalog();

  // Ensure admin is logged in
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    // Refresh catalog on mount to ensure fresh data
    refreshCatalog();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin • Catalog Manager</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage your storefront categories, sub-categories, and products.
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
                  const ok = window.confirm('Clear all local catalog state and resync from DB?');
                  if (!ok) return;
                  refreshCatalog();
                }}
                className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
              >
                Sync with DB
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
