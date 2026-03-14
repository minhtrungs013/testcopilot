import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { createCategoryBySlug, deleteCategoryBySlug, fetchCategoriesBySlug } from '../api/categoryApi.js';
import { createProductBySlug, fetchProductsBySlug, updateProductStatusBySlug } from '../api/productApi.js';
import CustomerLayout from '../layouts/CustomerLayout.jsx';
import useAuthStore from '../store/authStore.js';

function OwnerDashboardPage() {
  const { slug } = useParams();
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [productForm, setProductForm] = useState({
    category_id: '',
    name: '',
    description: '',
    price: '',
  });

  async function refreshData() {
    try {
      setError('');
      const [categoryData, productData] = await Promise.all([
        fetchCategoriesBySlug(slug, token),
        fetchProductsBySlug(slug, token),
      ]);
      setCategories(Array.isArray(categoryData) ? categoryData : []);
      setProducts(Array.isArray(productData) ? productData : []);
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to load owner dashboard data.');
    }
  }

  useEffect(() => {
    refreshData();
  }, [slug]);

  async function handleCreateCategory(event) {
    event.preventDefault();
    if (!categoryName.trim()) return;
    try {
      await createCategoryBySlug(slug, { name: categoryName.trim() }, token);
      setCategoryName('');
      refreshData();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to create category.');
    }
  }

  async function handleDeleteCategory(categoryId) {
    try {
      await deleteCategoryBySlug(slug, categoryId, token);
      refreshData();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to delete category.');
    }
  }

  async function handleCreateProduct(event) {
    event.preventDefault();
    try {
      await createProductBySlug(
        slug,
        {
          category_id: productForm.category_id,
          name: productForm.name,
          description: productForm.description,
          price: Number(productForm.price),
          status: 'active',
          image: '',
          options: [],
        },
        token
      );
      setProductForm({ category_id: '', name: '', description: '', price: '' });
      refreshData();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to create product.');
    }
  }

  async function toggleProductStatus(product) {
    try {
      const next = product.status === 'active' ? 'out_of_stock' : 'active';
      await updateProductStatusBySlug(slug, product._id, next, token);
      refreshData();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to update product status.');
    }
  }

  return (
    <CustomerLayout>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-5 flex items-center justify-between">
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-brand-700">Tenant Owner</p>
            <h1 className="font-display text-3xl font-extrabold text-gray-900">Owner Dashboard ({slug})</h1>
          </div>
          <button type="button" onClick={logout} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold">
            Logout
          </button>
        </header>

        {error ? <p className="mb-4 text-sm font-semibold text-red-600">{error}</p> : null}

        <section className="grid gap-4 md:grid-cols-2">
          <div className="glass-card rounded-2xl p-4">
            <h2 className="font-display text-xl font-bold">Categories</h2>
            <form onSubmit={handleCreateCategory} className="mt-3 flex gap-2">
              <input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="New category name" className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              <button type="submit" className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-bold text-white">Add</button>
            </form>
            <div className="mt-3 space-y-2">
              {categories.map((category) => (
                <div key={category._id} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
                  <span className="text-sm font-semibold">{category.name}</span>
                  <button type="button" onClick={() => handleDeleteCategory(category._id)} className="text-xs font-bold text-red-600">Delete</button>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4">
            <h2 className="font-display text-xl font-bold">Create Product</h2>
            <form onSubmit={handleCreateProduct} className="mt-3 space-y-2">
              <select value={productForm.category_id} onChange={(e) => setProductForm((s) => ({ ...s, category_id: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" required>
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>{category.name}</option>
                ))}
              </select>
              <input value={productForm.name} onChange={(e) => setProductForm((s) => ({ ...s, name: e.target.value }))} placeholder="Product name" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" required />
              <input value={productForm.description} onChange={(e) => setProductForm((s) => ({ ...s, description: e.target.value }))} placeholder="Description" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              <input value={productForm.price} onChange={(e) => setProductForm((s) => ({ ...s, price: e.target.value }))} placeholder="Price" type="number" min="0" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" required />
              <button type="submit" className="w-full rounded-lg bg-gray-900 px-3 py-2 text-sm font-bold text-white">Create Product</button>
            </form>
          </div>
        </section>

        <section className="glass-card mt-5 rounded-2xl p-4">
          <h2 className="font-display text-xl font-bold">Products</h2>
          <div className="mt-3 space-y-2">
            {products.map((product) => (
              <div key={product._id} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
                <div>
                  <p className="text-sm font-semibold">{product.name}</p>
                  <p className="text-xs text-gray-600">{product.price?.toLocaleString()} VND | {product.status}</p>
                </div>
                <button type="button" onClick={() => toggleProductStatus(product)} className="rounded-lg border border-gray-300 px-2 py-1 text-xs font-bold">
                  {product.status === 'active' ? 'Mark out_of_stock' : 'Mark active'}
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </CustomerLayout>
  );
}

export default OwnerDashboardPage;