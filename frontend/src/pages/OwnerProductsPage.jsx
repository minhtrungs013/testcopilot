import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import OwnerShell from '../components/OwnerShell.jsx';
import { fetchCategoriesBySlug } from '../api/categoryApi.js';
import {
  createProductBySlug,
  fetchProductsBySlug,
  updateProductStatusBySlug,
} from '../api/productApi.js';
import useAuthStore from '../store/authStore.js';

function OwnerProductsPage() {
  const { slug } = useParams();
  const token = useAuthStore((state) => state.token);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [productForm, setProductForm] = useState({
    category_id: '',
    name: '',
    description: '',
    price: '',
  });

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }),
    []
  );

  async function refreshData() {
    if (!token) {
      setCategories([]);
      setProducts([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [categoryData, productData] = await Promise.all([
        fetchCategoriesBySlug(slug, token),
        fetchProductsBySlug(slug, token),
      ]);
      setCategories(Array.isArray(categoryData) ? categoryData : []);
      setProducts(Array.isArray(productData) ? productData : []);
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshData();
  }, [slug, token]);

  async function handleCreateProduct(event) {
    event.preventDefault();

    if (!productForm.category_id || !productForm.name.trim()) {
      setError('Please select category and product name.');
      return;
    }

    try {
      await createProductBySlug(
        slug,
        {
          category_id: productForm.category_id,
          name: productForm.name.trim(),
          description: productForm.description.trim(),
          price: Number(productForm.price),
          status: 'active',
          image: '',
          options: [],
        },
        token
      );
      setProductForm({ category_id: '', name: '', description: '', price: '' });
      await refreshData();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to create product.');
    }
  }

  async function handleToggleProductStatus(product) {
    try {
      const nextStatus = product.status === 'active' ? 'out_of_stock' : 'active';
      await updateProductStatusBySlug(slug, product._id, nextStatus, token);
      await refreshData();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to update product status.');
    }
  }

  return (
    <OwnerShell slug={slug} title="Product Management">
      {error ? <p className="mb-4 text-sm font-semibold text-red-600">{error}</p> : null}

      <section className="glass-card rounded-2xl p-4">
        <h2 className="font-display text-xl font-bold">Create Product</h2>
        <form onSubmit={handleCreateProduct} className="mt-3 space-y-2">
          <select
            value={productForm.category_id}
            onChange={(event) => setProductForm((state) => ({ ...state, category_id: event.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            required
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
          <input
            value={productForm.name}
            onChange={(event) => setProductForm((state) => ({ ...state, name: event.target.value }))}
            placeholder="Product name"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            required
          />
          <input
            value={productForm.description}
            onChange={(event) => setProductForm((state) => ({ ...state, description: event.target.value }))}
            placeholder="Description"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            value={productForm.price}
            onChange={(event) => setProductForm((state) => ({ ...state, price: event.target.value }))}
            placeholder="Price"
            type="number"
            min="0"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            required
          />
          <button type="submit" className="w-full rounded-lg bg-gray-900 px-3 py-2 text-sm font-bold text-white">
            Create Product
          </button>
        </form>
      </section>

      <section className="glass-card mt-5 rounded-2xl p-4">
        <h2 className="font-display text-xl font-bold">Products</h2>

        {loading ? <p className="mt-3 text-sm text-gray-600">Loading products...</p> : null}

        {!loading && products.length === 0 ? (
          <p className="mt-3 text-sm text-gray-600">No products yet.</p>
        ) : null}

        <div className="mt-3 space-y-2">
          {products.map((product) => (
            <div
              key={product._id}
              className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2"
            >
              <div>
                <p className="text-sm font-semibold">{product.name}</p>
                <p className="text-xs text-gray-600">
                  {currencyFormatter.format(product.price || 0)} | {product.status}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggleProductStatus(product)}
                className="rounded-lg border border-gray-300 px-2 py-1 text-xs font-bold"
              >
                {product.status === 'active' ? 'Mark out_of_stock' : 'Mark active'}
              </button>
            </div>
          ))}
        </div>
      </section>
    </OwnerShell>
  );
}

export default OwnerProductsPage;
