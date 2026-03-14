import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import OwnerShell from '../components/OwnerShell.jsx';
import {
  createCategoryBySlug,
  deleteCategoryBySlug,
  fetchCategoriesBySlug,
} from '../api/categoryApi.js';
import useAuthStore from '../store/authStore.js';

function OwnerCategoriesPage() {
  const { slug } = useParams();
  const token = useAuthStore((state) => state.token);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categoryName, setCategoryName] = useState('');

  async function refreshCategories() {
    if (!token) {
      setCategories([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await fetchCategoriesBySlug(slug, token);
      setCategories(Array.isArray(data) ? data : []);
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to load categories.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshCategories();
  }, [slug, token]);

  async function handleCreateCategory(event) {
    event.preventDefault();
    if (!categoryName.trim()) {
      return;
    }

    try {
      await createCategoryBySlug(slug, { name: categoryName.trim() }, token);
      setCategoryName('');
      await refreshCategories();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to create category.');
    }
  }

  async function handleDeleteCategory(categoryId) {
    try {
      await deleteCategoryBySlug(slug, categoryId, token);
      await refreshCategories();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to delete category.');
    }
  }

  return (
    <OwnerShell slug={slug} title="Category Management">
      {error ? <p className="mb-4 text-sm font-semibold text-red-600">{error}</p> : null}

      <section className="glass-card rounded-2xl p-4">
        <h2 className="font-display text-xl font-bold">Create Category</h2>
        <form onSubmit={handleCreateCategory} className="mt-3 flex gap-2">
          <input
            value={categoryName}
            onChange={(event) => setCategoryName(event.target.value)}
            placeholder="New category name"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <button type="submit" className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-bold text-white">
            Add
          </button>
        </form>
      </section>

      <section className="glass-card mt-5 rounded-2xl p-4">
        <h2 className="font-display text-xl font-bold">Categories</h2>

        {loading ? <p className="mt-3 text-sm text-gray-600">Loading categories...</p> : null}

        {!loading && categories.length === 0 ? (
          <p className="mt-3 text-sm text-gray-600">No categories yet.</p>
        ) : null}

        <div className="mt-3 space-y-2">
          {categories.map((category) => (
            <div
              key={category._id}
              className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2"
            >
              <span className="text-sm font-semibold">{category.name}</span>
              <button
                type="button"
                onClick={() => handleDeleteCategory(category._id)}
                className="rounded-lg border border-red-200 px-2 py-1 text-xs font-bold text-red-600"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </section>
    </OwnerShell>
  );
}

export default OwnerCategoriesPage;
