import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import ConfirmModal from '../components/ConfirmModal.jsx';
import EntityForm from '../components/EntityForm.jsx';
import Modal from '../components/Modal.jsx';
import OwnerShell from '../components/OwnerShell.jsx';
import { fetchCategoriesBySlug } from '../api/categoryApi.js';
import {
  createProductBySlug,
  deleteProductBySlug,
  fetchProductsBySlug,
  updateProductBySlug,
  updateProductStatusBySlug,
} from '../api/productApi.js';
import useAuthStore from '../store/authStore.js';

function OwnerProductsPage() {
  const { slug } = useParams();
  const token = useAuthStore((state) => state.token);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [createForm, setCreateForm] = useState({
    category_id: '',
    name: '',
    description: '',
    price: '',
    status: 'active',
  });
  const [editForm, setEditForm] = useState({
    id: '',
    category_id: '',
    name: '',
    description: '',
    price: '',
    status: 'active',
  });

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }),
    []
  );

  const productFields = useMemo(
    () => [
      {
        name: 'category_id',
        type: 'select',
        required: true,
        options: [
          { value: '', label: 'Select category' },
          ...categories.map((category) => ({
            value: String(category._id),
            label: category.name,
          })),
        ],
      },
      {
        name: 'name',
        placeholder: 'Product name',
        required: true,
      },
      {
        name: 'description',
        placeholder: 'Description',
      },
      {
        name: 'price',
        type: 'number',
        min: 0,
        placeholder: 'Price',
        required: true,
      },
      {
        name: 'status',
        type: 'select',
        options: [
          { value: 'active', label: 'active' },
          { value: 'out_of_stock', label: 'out_of_stock' },
        ],
      },
    ],
    [categories]
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

    if (!createForm.category_id || !createForm.name.trim()) {
      setError('Please select category and product name.');
      return;
    }

    try {
      setBusy(true);
      await createProductBySlug(
        slug,
        {
          category_id: createForm.category_id,
          name: createForm.name.trim(),
          description: createForm.description.trim(),
          price: Number(createForm.price),
          status: createForm.status,
          image: '',
          options: [],
        },
        token
      );
      setCreateForm({
        category_id: '',
        name: '',
        description: '',
        price: '',
        status: 'active',
      });
      setIsCreateOpen(false);
      await refreshData();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to create product.');
    } finally {
      setBusy(false);
    }
  }

  async function handleToggleProductStatus() {
    if (!statusTarget?._id) {
      return;
    }

    try {
      setBusy(true);
      const nextStatus = statusTarget.status === 'active' ? 'out_of_stock' : 'active';
      await updateProductStatusBySlug(slug, statusTarget._id, nextStatus, token);
      setStatusTarget(null);
      await refreshData();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to update product status.');
    } finally {
      setBusy(false);
    }
  }

  function startEditProduct(product) {
    setError('');
    setIsEditOpen(true);
    setEditForm({
      id: String(product._id),
      category_id: String(product.category_id || ''),
      name: String(product.name || ''),
      description: String(product.description || ''),
      price: String(product.price ?? ''),
      status: String(product.status || 'active'),
    });
  }

  function cancelEditProduct() {
    setIsEditOpen(false);
    setEditForm({
      id: '',
      category_id: '',
      name: '',
      description: '',
      price: '',
      status: 'active',
    });
  }

  async function handleSaveProductEdit(event) {
    event.preventDefault();

    if (!editForm.id) {
      return;
    }

    if (!editForm.category_id || !editForm.name.trim()) {
      setError('Please select category and product name before saving.');
      return;
    }

    try {
      setBusy(true);
      await updateProductBySlug(
        slug,
        editForm.id,
        {
          category_id: editForm.category_id,
          name: editForm.name.trim(),
          description: editForm.description.trim(),
          price: Number(editForm.price),
          status: editForm.status,
        },
        token
      );
      cancelEditProduct();
      await refreshData();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to update product.');
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteProduct() {
    if (!deleteTarget?._id) {
      return;
    }

    try {
      setBusy(true);
      await deleteProductBySlug(slug, deleteTarget._id, token);
      if (editForm.id === String(deleteTarget._id)) {
        cancelEditProduct();
      }
      setDeleteTarget(null);
      await refreshData();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to delete product.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <OwnerShell slug={slug} title="Product Management">
      {error ? <p className="mb-4 text-sm font-semibold text-red-600">{error}</p> : null}

      <section className="glass-card rounded-2xl p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-xl font-bold">Create Product</h2>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-bold text-white"
          >
            Add Product
          </button>
        </div>
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
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setStatusTarget(product)}
                  className="rounded-lg border border-gray-300 px-2 py-1 text-xs font-bold"
                >
                  {product.status === 'active' ? 'Mark out_of_stock' : 'Mark active'}
                </button>
                <button
                  type="button"
                  onClick={() => startEditProduct(product)}
                  className="rounded-lg border border-blue-300 px-2 py-1 text-xs font-bold text-blue-700"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(product)}
                  className="rounded-lg border border-red-200 px-2 py-1 text-xs font-bold text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Modal isOpen={isCreateOpen} title="Add Product" onClose={() => (busy ? null : setIsCreateOpen(false))}>
        <EntityForm
          fields={productFields}
          values={createForm}
          onChange={(name, value) => setCreateForm((state) => ({ ...state, [name]: value }))}
          submitLabel="Create"
          onSubmit={handleCreateProduct}
          onCancel={() => setIsCreateOpen(false)}
          disabled={busy}
        />
      </Modal>

      <Modal isOpen={isEditOpen} title="Edit Product" onClose={() => (busy ? null : cancelEditProduct())}>
        <EntityForm
          fields={productFields}
          values={editForm}
          onChange={(name, value) => setEditForm((state) => ({ ...state, [name]: value }))}
          submitLabel="Save"
          onSubmit={handleSaveProductEdit}
          onCancel={cancelEditProduct}
          disabled={busy}
        />
      </Modal>

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Product"
        message={`Delete product ${deleteTarget?.name || ''}?`}
        confirmLabel="Delete"
        onConfirm={handleDeleteProduct}
        onClose={() => setDeleteTarget(null)}
        busy={busy}
      />

      <ConfirmModal
        isOpen={Boolean(statusTarget)}
        title="Change Product Status"
        message={`Change status of ${statusTarget?.name || ''} to ${
          statusTarget?.status === 'active' ? 'out_of_stock' : 'active'
        }?`}
        confirmLabel="Update Status"
        onConfirm={handleToggleProductStatus}
        onClose={() => setStatusTarget(null)}
        busy={busy}
      />
    </OwnerShell>
  );
}

export default OwnerProductsPage;
