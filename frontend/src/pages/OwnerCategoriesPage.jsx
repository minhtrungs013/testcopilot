import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import ConfirmModal from '../components/ConfirmModal.jsx';
import EntityForm from '../components/EntityForm.jsx';
import Modal from '../components/Modal.jsx';
import OwnerShell from '../components/OwnerShell.jsx';
import {
  createCategoryBySlug,
  deleteCategoryBySlug,
  fetchCategoriesBySlug,
  updateCategoryBySlug,
} from '../api/categoryApi.js';
import useAuthStore from '../store/authStore.js';

function OwnerCategoriesPage() {
  const { slug } = useParams();
  const token = useAuthStore((state) => state.token);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [createForm, setCreateForm] = useState({ name: '' });
  const [editForm, setEditForm] = useState({ id: '', name: '' });

  const categoryFields = [
    {
      name: 'name',
      placeholder: 'Category name',
      required: true,
    },
  ];

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

  function openCreateModal() {
    setCreateForm({ name: '' });
    setIsCreateOpen(true);
  }

  function openEditModal(category) {
    setEditForm({ id: String(category._id), name: String(category.name || '') });
    setIsEditOpen(true);
  }

  async function handleCreateCategory(event) {
    event.preventDefault();
    if (!createForm.name.trim()) {
      return;
    }

    try {
      setBusy(true);
      await createCategoryBySlug(slug, { name: createForm.name.trim() }, token);
      setIsCreateOpen(false);
      setCreateForm({ name: '' });
      await refreshCategories();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to create category.');
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdateCategory(event) {
    event.preventDefault();
    if (!editForm.id || !editForm.name.trim()) {
      return;
    }

    try {
      setBusy(true);
      await updateCategoryBySlug(slug, editForm.id, { name: editForm.name.trim() }, token);
      setIsEditOpen(false);
      setEditForm({ id: '', name: '' });
      await refreshCategories();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to update category.');
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteCategory() {
    if (!deleteTarget?._id) {
      return;
    }

    try {
      setBusy(true);
      await deleteCategoryBySlug(slug, deleteTarget._id, token);
      setDeleteTarget(null);
      await refreshCategories();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to delete category.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <OwnerShell slug={slug} title="Category Management">
      {error ? <p className="mb-4 text-sm font-semibold text-red-600">{error}</p> : null}

      <section className="glass-card rounded-2xl p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-xl font-bold">Create Category</h2>
          <button
            type="button"
            onClick={openCreateModal}
            className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-bold text-white"
          >
            Add Category
          </button>
        </div>
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
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(category)}
                  className="rounded-lg border border-blue-300 px-2 py-1 text-xs font-bold text-blue-700"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(category)}
                  className="rounded-lg border border-red-200 px-2 py-1 text-xs font-bold text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Modal isOpen={isCreateOpen} title="Add Category" onClose={() => (busy ? null : setIsCreateOpen(false))}>
        <EntityForm
          fields={categoryFields}
          values={createForm}
          onChange={(name, value) => setCreateForm((state) => ({ ...state, [name]: value }))}
          submitLabel="Create"
          onSubmit={handleCreateCategory}
          onCancel={() => setIsCreateOpen(false)}
          disabled={busy}
        />
      </Modal>

      <Modal isOpen={isEditOpen} title="Edit Category" onClose={() => (busy ? null : setIsEditOpen(false))}>
        <EntityForm
          fields={categoryFields}
          values={editForm}
          onChange={(name, value) => setEditForm((state) => ({ ...state, [name]: value }))}
          submitLabel="Save"
          onSubmit={handleUpdateCategory}
          onCancel={() => setIsEditOpen(false)}
          disabled={busy}
        />
      </Modal>

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Category"
        message={`Delete category ${deleteTarget?.name || ''}?`}
        confirmLabel="Delete"
        onConfirm={handleDeleteCategory}
        onClose={() => setDeleteTarget(null)}
        busy={busy}
      />
    </OwnerShell>
  );
}

export default OwnerCategoriesPage;
