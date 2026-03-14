import { useEffect, useState } from 'react';

import { createTenant, fetchTenants, updateTenantStatus } from '../api/tenantApi.js';
import CustomerLayout from '../layouts/CustomerLayout.jsx';
import useAuthStore from '../store/authStore.js';

function SuperAdminDashboardPage() {
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);

  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    slug: '',
    owner_name: '',
    owner_email: '',
    owner_password: '',
    plan: 'free',
  });

  async function loadTenants() {
    try {
      setLoading(true);
      const data = await fetchTenants(token);
      setTenants(Array.isArray(data) ? data : []);
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to load tenants.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTenants();
  }, []);

  async function handleCreateTenant(event) {
    event.preventDefault();
    setError('');

    try {
      await createTenant(form, token);
      setForm({
        name: '',
        slug: '',
        owner_name: '',
        owner_email: '',
        owner_password: '',
        plan: 'free',
      });
      await loadTenants();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to create tenant.');
    }
  }

  async function handleToggleStatus(tenant) {
    const nextStatus = tenant.status === 'active' ? 'suspended' : 'active';
    try {
      await updateTenantStatus(tenant._id, nextStatus, token);
      await loadTenants();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to update status.');
    }
  }

  return (
    <CustomerLayout>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-5 flex items-center justify-between">
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-brand-700">Super Admin</p>
            <h1 className="font-display text-3xl font-extrabold text-gray-900">Tenant Management</h1>
          </div>
          <button type="button" onClick={logout} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold">
            Logout
          </button>
        </header>

        <form onSubmit={handleCreateTenant} className="glass-card mb-5 grid gap-3 rounded-2xl p-4 md:grid-cols-2 lg:grid-cols-3">
          <input value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} placeholder="Tenant name" className="rounded-lg border border-gray-300 px-3 py-2 text-sm" required />
          <input value={form.slug} onChange={(e) => setForm((s) => ({ ...s, slug: e.target.value }))} placeholder="Tenant slug" className="rounded-lg border border-gray-300 px-3 py-2 text-sm" required />
          <input value={form.owner_name} onChange={(e) => setForm((s) => ({ ...s, owner_name: e.target.value }))} placeholder="Owner name" className="rounded-lg border border-gray-300 px-3 py-2 text-sm" required />
          <input value={form.owner_email} onChange={(e) => setForm((s) => ({ ...s, owner_email: e.target.value }))} placeholder="Owner email" className="rounded-lg border border-gray-300 px-3 py-2 text-sm" type="email" required />
          <input value={form.owner_password} onChange={(e) => setForm((s) => ({ ...s, owner_password: e.target.value }))} placeholder="Owner password" className="rounded-lg border border-gray-300 px-3 py-2 text-sm" type="password" required />
          <select value={form.plan} onChange={(e) => setForm((s) => ({ ...s, plan: e.target.value }))} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value="free">free</option>
            <option value="basic">basic</option>
            <option value="pro">pro</option>
          </select>
          <button type="submit" className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-bold text-white">Create Tenant</button>
        </form>

        {error ? <p className="mb-4 text-sm font-semibold text-red-600">{error}</p> : null}
        {loading ? <p className="text-sm text-gray-600">Loading tenants...</p> : null}

        <div className="space-y-3">
          {tenants.map((tenant) => (
            <article key={tenant._id} className="glass-card flex items-center justify-between rounded-xl p-3">
              <div>
                <p className="font-semibold text-gray-900">{tenant.name}</p>
                <p className="text-xs text-gray-600">slug: {tenant.slug} | plan: {tenant.plan}</p>
              </div>
              <button type="button" onClick={() => handleToggleStatus(tenant)} className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-bold">
                {tenant.status === 'active' ? 'Suspend' : 'Activate'}
              </button>
            </article>
          ))}
        </div>
      </main>
    </CustomerLayout>
  );
}

export default SuperAdminDashboardPage;
