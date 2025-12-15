import React, { useMemo, useState } from 'react';
import axios from 'axios';
import config from '../../../config/api';

// Category.jsx
// Admin UI for:
// - Category: { id, name, imageDataUrl }
// - SubCategory: { id, categoryId, name, imageDataUrl }
// Images are uploaded using <input type="file" /> and stored as base64 DataURL.

const makeId = () => `${Date.now()}_${Math.random().toString(16).slice(2)}`;

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
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Close
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export default function Category({
  categories,
  setCategories,
  subCategories,
  setSubCategories,
  products,
  setProducts,
}) {
  // Category form
  const [categoryName, setCategoryName] = useState('');
  const [categoryImageDataUrl, setCategoryImageDataUrl] = useState('');

  // Sub-category form
  const [subCategoryName, setSubCategoryName] = useState('');
  const [subCategoryImageDataUrl, setSubCategoryImageDataUrl] = useState('');
  const [subCategoryCategoryId, setSubCategoryCategoryId] = useState('');

  // Edit modals
  const [editCategory, setEditCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryImageDataUrl, setEditCategoryImageDataUrl] = useState('');

  const [editSubCategory, setEditSubCategory] = useState(null);
  const [editSubCategoryName, setEditSubCategoryName] = useState('');
  const [editSubCategoryImageDataUrl, setEditSubCategoryImageDataUrl] = useState('');

  const categoriesById = useMemo(() => {
    const map = new Map();
    for (const c of categories) map.set(c.id, c);
    return map;
  }, [categories]);

  const subCategoriesByCategoryId = useMemo(() => {
    const map = new Map();
    for (const sc of subCategories) {
      const list = map.get(sc.categoryId) || [];
      list.push(sc);
      map.set(sc.categoryId, list);
    }
    for (const [k, list] of map.entries()) {
      list.sort((a, b) => a.name.localeCompare(b.name));
      map.set(k, list);
    }
    return map;
  }, [subCategories]);

  const onCategoryFile = async (file) => {
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    setCategoryImageDataUrl(dataUrl);
  };

  const onSubCategoryFile = async (file) => {
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    setSubCategoryImageDataUrl(dataUrl);
  };

  const addCategory = async (e) => {
    e.preventDefault();

    const name = categoryName.trim();
    if (!name) return;

    const exists = categories.some((c) => String(c.name || '').toLowerCase() === name.toLowerCase());
    if (exists) {
      window.alert('Category already exists.');
      return;
    }

    // Persist to DB (admin auth)
    let newCategory = { id: makeId(), name, imageDataUrl: categoryImageDataUrl || '' };
    try {
      const res = await axios.post(
        `${config.apiUrl}/api/categories`,
        { name, imageUrl: categoryImageDataUrl || '' },
        { headers: getAdminHeaders() },
      );
      if (res.data?.success && res.data.category) {
        newCategory = {
          id: String(res.data.category._id),
          name: res.data.category.name,
          slug: res.data.category.slug,
          imageDataUrl: res.data.category.imageUrl || '',
        };
      }
    } catch (err) {
      // If backend fails, keep localStorage demo working.
      console.error('Failed to create category in DB (fallback to local):', err);
    }

    setCategories((prev) => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)));

    setCategoryName('');
    setCategoryImageDataUrl('');

    // Make it easier to add sub-categories immediately
    setSubCategoryCategoryId(newCategory.id);
  };

  const addSubCategory = async (e) => {
    e.preventDefault();

    const name = subCategoryName.trim();
    if (!name) return;
    if (!subCategoryCategoryId) {
      window.alert('Please select a parent category first.');
      return;
    }

    const exists = subCategories.some(
      (sc) => sc.categoryId === subCategoryCategoryId && sc.name.toLowerCase() === name.toLowerCase(),
    );

    if (exists) {
      window.alert('Sub-category already exists in this category.');
      return;
    }

    // Persist to DB
    let newSubCategory = {
      id: makeId(),
      name,
      categoryId: subCategoryCategoryId,
      imageDataUrl: subCategoryImageDataUrl || '',
    };

    try {
      const res = await axios.post(
        `${config.apiUrl}/api/subcategories`,
        { name, categoryId: subCategoryCategoryId, imageUrl: subCategoryImageDataUrl || '' },
        { headers: getAdminHeaders() },
      );
      if (res.data?.success && res.data.subCategory) {
        newSubCategory = {
          id: String(res.data.subCategory._id),
          name: res.data.subCategory.name,
          slug: res.data.subCategory.slug,
          categoryId: String(res.data.subCategory.categoryId),
          imageDataUrl: res.data.subCategory.imageUrl || '',
        };
      }
    } catch (err) {
      console.error('Failed to create sub-category in DB (fallback to local):', err);
    }

    setSubCategories((prev) => [...prev, newSubCategory]);
    setSubCategoryName('');
    setSubCategoryImageDataUrl('');
  };

  const openEditCategory = (c) => {
    setEditCategory(c);
    setEditCategoryName(c.name || '');
    setEditCategoryImageDataUrl(c.imageDataUrl || '');
  };

  const saveEditCategory = async (e) => {
    e.preventDefault();
    if (!editCategory) return;
    const name = editCategoryName.trim();
    if (!name) return;

    // Persist to DB if we have a slug
    try {
      const slug = editCategory.slug;
      if (slug) {
        await axios.put(
          `${config.apiUrl}/api/categories/${slug}`,
          { name, imageUrl: editCategoryImageDataUrl || '' },
          { headers: getAdminHeaders() },
        );
      }
    } catch (err) {
      console.error('Failed to update category in DB (still updating local):', err);
    }

    setCategories((prev) =>
      prev
        .map((c) =>
          c.id === editCategory.id
            ? { ...c, name, imageDataUrl: editCategoryImageDataUrl || '' }
            : c,
        )
        .sort((a, b) => a.name.localeCompare(b.name)),
    );

    setEditCategory(null);
  };

  const openEditSubCategory = (sc) => {
    setEditSubCategory(sc);
    setEditSubCategoryName(sc.name || '');
    setEditSubCategoryImageDataUrl(sc.imageDataUrl || '');
  };

  const saveEditSubCategory = async (e) => {
    e.preventDefault();
    if (!editSubCategory) return;
    const name = editSubCategoryName.trim();
    if (!name) return;

    try {
      await axios.put(
        `${config.apiUrl}/api/subcategories/${editSubCategory.id}`,
        { name, imageUrl: editSubCategoryImageDataUrl || '' },
        { headers: getAdminHeaders() },
      );
    } catch (err) {
      console.error('Failed to update sub-category in DB (still updating local):', err);
    }

    setSubCategories((prev) =>
      prev.map((sc) =>
        sc.id === editSubCategory.id
          ? { ...sc, name, imageDataUrl: editSubCategoryImageDataUrl || '' }
          : sc,
      ),
    );

    setEditSubCategory(null);
  };

  const deleteCategory = async (categoryId) => {
    const category = categoriesById.get(categoryId);
    const ok = window.confirm(
      `Delete category "${category?.name || 'Unknown'}"?\n\nThis will remove sub-categories and products under it.`,
    );
    if (!ok) return;

    const subIds = new Set(subCategories.filter((sc) => sc.categoryId === categoryId).map((sc) => sc.id));

    // Delete from DB if we have a slug
    try {
      if (category?.slug) {
        await axios.delete(`${config.apiUrl}/api/categories/${category.slug}`, { headers: getAdminHeaders() });
      }
    } catch (err) {
      console.error('Failed to delete category from DB (still deleting local):', err);
    }

    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    setSubCategories((prev) => prev.filter((sc) => sc.categoryId !== categoryId));

    // Also remove products for data integrity
    if (Array.isArray(products) && typeof setProducts === 'function') {
      setProducts((prev) => prev.filter((p) => p.categoryId !== categoryId && !subIds.has(p.subCategoryId)));
    }

    if (subCategoryCategoryId === categoryId) setSubCategoryCategoryId('');
  };

  const deleteSubCategory = async (subCategoryId) => {
    const ok = window.confirm('Delete this sub-category? This will remove products under it.');
    if (!ok) return;

    try {
      await axios.delete(`${config.apiUrl}/api/subcategories/${subCategoryId}`, { headers: getAdminHeaders() });
    } catch (err) {
      console.error('Failed to delete sub-category from DB (still deleting local):', err);
    }

    setSubCategories((prev) => prev.filter((sc) => sc.id !== subCategoryId));

    if (Array.isArray(products) && typeof setProducts === 'function') {
      setProducts((prev) => prev.filter((p) => p.subCategoryId !== subCategoryId));
    }
  };

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="p-5 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Category & Sub-Category</h2>
        <p className="mt-1 text-sm text-gray-600">
          Add categories and sub-categories with image upload (base64) and manage them.
        </p>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Category */}
        <div className="rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900">Add Category</h3>
          <form onSubmit={addCategory} className="mt-3 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Category Name</label>
              <input
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="e.g. Aadhaar Services"
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onCategoryFile(e.target.files?.[0])}
                className="mt-1 block w-full text-sm text-gray-700"
              />
              <div className="mt-2">
                <ImageThumb src={categoryImageDataUrl} alt="Category preview" />
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Add Category
            </button>
          </form>
        </div>

        {/* Add Sub-Category */}
        <div className="rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900">Add Sub-Category</h3>
          <form onSubmit={addSubCategory} className="mt-3 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Parent Category</label>
              <select
                value={subCategoryCategoryId}
                onChange={(e) => setSubCategoryCategoryId(e.target.value)}
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Sub-Category Name</label>
              <input
                value={subCategoryName}
                onChange={(e) => setSubCategoryName(e.target.value)}
                placeholder="e.g. Update / Correction"
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Sub-Category Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onSubCategoryFile(e.target.files?.[0])}
                className="mt-1 block w-full text-sm text-gray-700"
              />
              <div className="mt-2">
                <ImageThumb src={subCategoryImageDataUrl} alt="Sub-category preview" />
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
            >
              Add Sub-Category
            </button>
          </form>
        </div>
      </div>

      {/* Categories list */}
      <div className="border-t border-gray-200">
        <div className="p-5">
          <h3 className="text-sm font-semibold text-gray-900">All Categories</h3>
          <p className="mt-1 text-xs text-gray-500">Sub-categories are displayed under their parent category.</p>

          {categories.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed border-gray-300 p-6 text-sm text-gray-600">
              No categories yet. Add your first category above.
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {categories.map((c) => {
                const children = subCategoriesByCategoryId.get(c.id) || [];
                return (
                  <div key={c.id} className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <ImageThumb src={c.imageDataUrl} alt={c.name} />
                        <div>
                          <div className="font-semibold text-gray-900">{c.name}</div>
                          <div className="text-xs text-gray-500">
                            {children.length} sub-categor{children.length === 1 ? 'y' : 'ies'}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => openEditCategory(c)}
                          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteCategory(c.id)}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 p-4">
                      {children.length === 0 ? (
                        <div className="text-sm text-gray-500">No sub-categories yet.</div>
                      ) : (
                        <ul className="space-y-2">
                          {children.map((sc) => (
                            <li
                              key={sc.id}
                              className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                            >
                              <div className="flex items-center gap-3">
                                <ImageThumb src={sc.imageDataUrl} alt={sc.name} />
                                <span className="text-sm text-gray-900">{sc.name}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => openEditSubCategory(sc)}
                                  className="text-xs font-medium text-gray-700 hover:underline"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteSubCategory(sc.id)}
                                  className="text-xs font-medium text-red-700 hover:underline"
                                >
                                  Delete
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Edit Category Modal */}
      <Modal
        open={!!editCategory}
        title="Edit Category"
        onClose={() => setEditCategory(null)}
      >
        <form onSubmit={saveEditCategory} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Category Name</label>
            <input
              value={editCategoryName}
              onChange={(e) => setEditCategoryName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const dataUrl = await readFileAsDataUrl(f);
                setEditCategoryImageDataUrl(dataUrl);
              }}
              className="mt-1 block w-full text-sm text-gray-700"
            />
            <div className="mt-2">
              <ImageThumb src={editCategoryImageDataUrl} alt="Category preview" />
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditCategory(null)}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Sub-Category Modal */}
      <Modal
        open={!!editSubCategory}
        title="Edit Sub-Category"
        onClose={() => setEditSubCategory(null)}
      >
        <form onSubmit={saveEditSubCategory} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Sub-Category Name</label>
            <input
              value={editSubCategoryName}
              onChange={(e) => setEditSubCategoryName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Sub-Category Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const dataUrl = await readFileAsDataUrl(f);
                setEditSubCategoryImageDataUrl(dataUrl);
              }}
              className="mt-1 block w-full text-sm text-gray-700"
            />
            <div className="mt-2">
              <ImageThumb src={editSubCategoryImageDataUrl} alt="Sub-category preview" />
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditSubCategory(null)}
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
