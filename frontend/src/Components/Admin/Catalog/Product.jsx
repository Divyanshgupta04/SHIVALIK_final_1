import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import config from '../../../config/api';
import { slugifyName } from '../../../utils/slug';

// Product.jsx
// Admin UI for Products connected to Category + Sub-Category.
// Each product includes:
// - name, price
// - categoryId (dropdown)
// - subCategoryId (dynamic dropdown)
// - productType: "aadhaar" | "pan" | "both"
// - imageDataUrl (base64 DataURL)

// Numeric id so it can be used with existing /product/:id pages.
const makeId = () => Number(`${Date.now()}${Math.floor(Math.random() * 1000)}`);

function getAdminHeaders() {
  const token = localStorage.getItem('adminToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function ImageThumb({ src, alt }) {
  if (!src) {
    return (
      <div className="h-12 w-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-[10px] text-gray-400">
        No Image
      </div>
    );
  }
  return <img src={src} alt={alt} className="h-12 w-12 rounded-lg object-cover border border-gray-200" />;
}

function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <button type="button" onClick={onClose} className="text-sm text-gray-600 hover:text-gray-900">
            Close
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export default function Product({ categories, subCategories, products, setProducts }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [productType, setProductType] = useState('aadhaar');
  const [imageDataUrl, setImageDataUrl] = useState('');

  const [editProduct, setEditProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    price: '',
    categoryId: '',
    subCategoryId: '',
    productType: 'aadhaar',
    imageDataUrl: '',
  });

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

  const filteredSubCategories = useMemo(() => {
    if (!categoryId) return [];
    return subCategories
      .filter((sc) => sc.categoryId === categoryId)
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [categoryId, subCategories]);

  const filteredSubCategoriesForEdit = useMemo(() => {
    if (!editForm.categoryId) return [];
    return subCategories
      .filter((sc) => sc.categoryId === editForm.categoryId)
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [editForm.categoryId, subCategories]);

  // Keep dropdowns consistent (create form)
  useEffect(() => {
    if (!subCategoryId) return;
    const sc = subCategoriesById.get(subCategoryId);
    if (!sc || sc.categoryId !== categoryId) setSubCategoryId('');
  }, [categoryId, subCategoryId, subCategoriesById]);

  // If there is exactly one sub-category, auto-select it (create form)
  useEffect(() => {
    if (!categoryId) return;
    if (filteredSubCategories.length === 1) setSubCategoryId(filteredSubCategories[0].id);
  }, [categoryId, filteredSubCategories]);

  // Keep dropdowns consistent (edit form)
  useEffect(() => {
    if (!editProduct) return;
    if (!editForm.subCategoryId) return;
    const sc = subCategoriesById.get(editForm.subCategoryId);
    if (!sc || sc.categoryId !== editForm.categoryId) {
      setEditForm((p) => ({ ...p, subCategoryId: '' }));
    }
  }, [editProduct, editForm.categoryId, editForm.subCategoryId, subCategoriesById]);

  const resetForm = () => {
    setName('');
    setPrice('');
    setCategoryId('');
    setSubCategoryId('');
    setProductType('aadhaar');
    setImageDataUrl('');
  };

  const addProduct = async (e) => {
    e.preventDefault();

    const cleanName = name.trim();
    if (!cleanName) return;

    const parsedPrice = Number(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      window.alert('Price must be a valid number greater than 0.');
      return;
    }

    if (!categoryId) {
      window.alert('Please select a category.');
      return;
    }

    if (!subCategoryId) {
      window.alert('Please select a sub-category.');
      return;
    }

    const sc = subCategoriesById.get(subCategoryId);
    if (!sc || sc.categoryId !== categoryId) {
      window.alert('Selected sub-category does not belong to the selected category.');
      return;
    }

    const category = categoriesById.get(categoryId);
    const categorySlug = slugifyName(category?.name || '');
    const description = sc?.name ? `${sc.name} • ${category?.name || 'Service'}` : (category?.name || 'Service');

    let newProduct = {
      id: makeId(),
      name: cleanName,
      price: parsedPrice,
      categoryId,
      subCategoryId,
      productType,
      imageDataUrl: imageDataUrl || '',
      createdAt: new Date().toISOString(),
    };

    // Persist to DB (admin auth) so users can see it.
    try {
      const res = await axios.post(
        `${config.apiUrl}/api/admin/products`,
        {
          id: newProduct.id,
          title: cleanName,
          description,
          price: String(parsedPrice),
          src: imageDataUrl || '',
          category: categorySlug,
          categoryId,
          subCategoryId,
          productType,
          hasForm: false,
        },
        { headers: getAdminHeaders() },
      );

      if (res.data?.success && res.data.product) {
        const p = res.data.product;
        newProduct = {
          id: p.id,
          name: p.title,
          price: Number(p.price || 0),
          categoryId: String(p.categoryId || categoryId),
          subCategoryId: String(p.subCategoryId || subCategoryId),
          productType: p.productType || productType,
          imageDataUrl: p.src || imageDataUrl || '',
          createdAt: p.createdAt,
        };
      }
    } catch (err) {
      console.error('Failed to create product in DB (fallback to local):', err);
    }

    setProducts((prev) => [newProduct, ...prev]);
    resetForm();
  };

  const openEdit = (p) => {
    setEditProduct(p);
    setEditForm({
      name: p.name || '',
      price: String(p.price ?? ''),
      categoryId: p.categoryId || '',
      subCategoryId: p.subCategoryId || '',
      productType: p.productType || 'aadhaar',
      imageDataUrl: p.imageDataUrl || '',
    });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editProduct) return;

    const cleanName = editForm.name.trim();
    if (!cleanName) return;

    const parsedPrice = Number(editForm.price);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      window.alert('Price must be a valid number greater than 0.');
      return;
    }

    if (!editForm.categoryId || !editForm.subCategoryId) {
      window.alert('Category and Sub-Category are required.');
      return;
    }

    const sc = subCategoriesById.get(editForm.subCategoryId);
    if (!sc || sc.categoryId !== editForm.categoryId) {
      window.alert('Selected sub-category does not belong to the selected category.');
      return;
    }

    const category = categoriesById.get(editForm.categoryId);
    const categorySlug = slugifyName(category?.name || '');
    const description = sc?.name ? `${sc.name} • ${category?.name || 'Service'}` : (category?.name || 'Service');

    try {
      await axios.put(
        `${config.apiUrl}/api/admin/products/${editProduct.id}`,
        {
          title: cleanName,
          description,
          price: String(parsedPrice),
          src: editForm.imageDataUrl || '',
          category: categorySlug,
          categoryId: editForm.categoryId,
          subCategoryId: editForm.subCategoryId,
          productType: editForm.productType,
        },
        { headers: getAdminHeaders() },
      );
    } catch (err) {
      console.error('Failed to update product in DB (still updating local):', err);
    }

    setProducts((prev) =>
      prev.map((p) =>
        p.id === editProduct.id
          ? {
              ...p,
              name: cleanName,
              price: parsedPrice,
              categoryId: editForm.categoryId,
              subCategoryId: editForm.subCategoryId,
              productType: editForm.productType,
              imageDataUrl: editForm.imageDataUrl || '',
            }
          : p,
      ),
    );

    setEditProduct(null);
  };

  const deleteProduct = async (productId) => {
    const ok = window.confirm('Delete this product?');
    if (!ok) return;

    try {
      await axios.delete(`${config.apiUrl}/api/admin/products/${productId}`, { headers: getAdminHeaders() });
    } catch (err) {
      console.error('Failed to delete product from DB (still deleting local):', err);
    }

    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="p-5 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Products</h2>
        <p className="mt-1 text-sm text-gray-600">
          Create products with category + sub-category, image upload, and mandatory identity type.
        </p>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Product form */}
        <div className="lg:col-span-2 rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900">Add Product</h3>

          <form onSubmit={addProduct} className="mt-3 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Product Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. PAN Correction"
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Price</label>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 199"
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setSubCategoryId('');
                }}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {categories.length === 0 && <p className="mt-1 text-xs text-red-600">Add a category first.</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Sub-Category</label>
              <select
                value={subCategoryId}
                onChange={(e) => setSubCategoryId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={!categoryId || filteredSubCategories.length === 0}
                required
              >
                <option value="">
                  {!categoryId
                    ? 'Select a category first'
                    : filteredSubCategories.length === 0
                      ? 'No sub-categories in this category'
                      : 'Select a sub-category'}
                </option>
                {filteredSubCategories.map((sc) => (
                  <option key={sc.id} value={sc.id}>
                    {sc.name}
                  </option>
                ))}
              </select>
              {categoryId && filteredSubCategories.length === 0 && (
                <p className="mt-1 text-xs text-amber-600">Add a sub-category under this category first.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Product Type (ID Requirement)</label>
              <select
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                required
              >
                <option value="aadhaar">Aadhaar</option>
                <option value="pan">PAN</option>
                <option value="both">Both (Aadhaar + PAN)</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">Used during checkout to decide which identity form is mandatory.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Product Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const dataUrl = await readFileAsDataUrl(f);
                  setImageDataUrl(dataUrl);
                }}
                className="mt-1 block w-full text-sm text-gray-700"
              />
              <div className="mt-2">
                <ImageThumb src={imageDataUrl} alt="Product preview" />
              </div>
            </div>

            <div className="pt-1 flex gap-2">
              <button
                type="submit"
                className="inline-flex flex-1 items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                disabled={categories.length === 0 || subCategories.length === 0}
              >
                Add Product
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Product table */}
        <div className="lg:col-span-3 rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">All Products</h3>
            <div className="text-xs text-gray-500">{products.length} total</div>
          </div>

          {products.length === 0 ? (
            <div className="p-6 text-sm text-gray-600">No products yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Image</th>
                    <th className="text-left px-4 py-3 font-medium">Product</th>
                    <th className="text-left px-4 py-3 font-medium">Price</th>
                    <th className="text-left px-4 py-3 font-medium">Category</th>
                    <th className="text-left px-4 py-3 font-medium">Sub-Category</th>
                    <th className="text-left px-4 py-3 font-medium">Type</th>
                    <th className="text-right px-4 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((p) => {
                    const category = categoriesById.get(p.categoryId);
                    const subCategory = subCategoriesById.get(p.subCategoryId);
                    return (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <ImageThumb src={p.imageDataUrl} alt={p.name} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{p.name}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-900">₹{Number(p.price || 0).toFixed(2)}</td>
                        <td className="px-4 py-3 text-gray-700">{category?.name || '—'}</td>
                        <td className="px-4 py-3 text-gray-700">{subCategory?.name || '—'}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">
                            {String(p.productType || 'aadhaar').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-3">
                            <button
                              type="button"
                              onClick={() => openEdit(p)}
                              className="text-xs font-medium text-gray-700 hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteProduct(p.id)}
                              className="text-xs font-medium text-red-700 hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal open={!!editProduct} title="Edit Product" onClose={() => setEditProduct(null)}>
        <form onSubmit={saveEdit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Product Name</label>
            <input
              value={editForm.name}
              onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Price</label>
            <input
              value={editForm.price}
              onChange={(e) => setEditForm((p) => ({ ...p, price: e.target.value }))}
              type="number"
              min="0"
              step="0.01"
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Product Type</label>
            <select
              value={editForm.productType}
              onChange={(e) => setEditForm((p) => ({ ...p, productType: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
              required
            >
              <option value="aadhaar">Aadhaar</option>
              <option value="pan">PAN</option>
              <option value="both">Both</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={editForm.categoryId}
              onChange={(e) => setEditForm((p) => ({ ...p, categoryId: e.target.value, subCategoryId: '' }))}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
              required
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Sub-Category</label>
            <select
              value={editForm.subCategoryId}
              onChange={(e) => setEditForm((p) => ({ ...p, subCategoryId: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
              disabled={!editForm.categoryId || filteredSubCategoriesForEdit.length === 0}
              required
            >
              <option value="">
                {!editForm.categoryId
                  ? 'Select a category first'
                  : filteredSubCategoriesForEdit.length === 0
                    ? 'No sub-categories'
                    : 'Select a sub-category'}
              </option>
              {filteredSubCategoriesForEdit.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Product Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const dataUrl = await readFileAsDataUrl(f);
                setEditForm((p) => ({ ...p, imageDataUrl: dataUrl }));
              }}
              className="mt-1 block w-full text-sm text-gray-700"
            />
            <div className="mt-2">
              <ImageThumb src={editForm.imageDataUrl} alt="Product preview" />
            </div>
          </div>

          <div className="md:col-span-2 pt-2 flex gap-2">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setEditProduct(null)}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
