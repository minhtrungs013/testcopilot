import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { registerTenantOwner } from '../api/authApi.js';
import CustomerLayout from '../layouts/CustomerLayout.jsx';
import useAuthStore from '../store/authStore.js';

function RegisterOwnerPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);

  const [form, setForm] = useState({
    tenant_id: '',
    full_name: '',
    email: '',
    password: '',
    tenant_slug: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    try {
      setLoading(true);
      const result = await registerTenantOwner({
        tenant_id: form.tenant_id,
        full_name: form.full_name,
        email: form.email,
        password: form.password,
      });

      setSession({ token: result.token, user: result.user, tenantSlug: form.tenant_slug });
      navigate(form.tenant_slug ? `/${form.tenant_slug}/owner` : '/owner/setup');
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Register owner failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <CustomerLayout>
      <main className="mx-auto max-w-lg px-4 py-10">
        <h1 className="font-display text-3xl font-extrabold text-gray-900">Register Tenant Owner</h1>

        <form onSubmit={handleSubmit} className="glass-card mt-6 space-y-4 rounded-2xl p-5">
          <input value={form.tenant_id} onChange={(e) => updateField('tenant_id', e.target.value)} placeholder="Tenant ID" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" required />
          <input value={form.full_name} onChange={(e) => updateField('full_name', e.target.value)} placeholder="Full name" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" required />
          <input value={form.email} onChange={(e) => updateField('email', e.target.value)} placeholder="Email" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" type="email" required />
          <input value={form.password} onChange={(e) => updateField('password', e.target.value)} placeholder="Password" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" type="password" required />
          <input value={form.tenant_slug} onChange={(e) => updateField('tenant_slug', e.target.value)} placeholder="Tenant slug (for owner route)" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />

          {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}

          <button type="submit" disabled={loading} className="w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white">
            {loading ? 'Registering...' : 'Register Owner'}
          </button>

          <p className="text-center text-sm text-gray-600">
            Already have account? <Link to="/auth/login" className="font-bold text-brand-700">Login</Link>
          </p>
        </form>
      </main>
    </CustomerLayout>
  );
}

export default RegisterOwnerPage;
