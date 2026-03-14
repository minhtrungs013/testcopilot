import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { login } from '../api/authApi.js';
import CustomerLayout from '../layouts/CustomerLayout.jsx';
import useAuthStore from '../store/authStore.js';

function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [tenantSlug, setTenantSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    try {
      setLoading(true);
      const result = await login({
        email,
        password,
        tenant_id: tenantId || undefined,
      });

      setSession({ token: result.token, user: result.user, tenantSlug });

      if (result.user.role === 'super_admin') {
        navigate('/admin/super');
        return;
      }

      if (result.user.role === 'tenant_owner') {
        navigate(tenantSlug ? `/${tenantSlug}/owner` : '/owner/setup');
        return;
      }

      navigate(tenantSlug ? `/${tenantSlug}/staff` : '/staff/setup');
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <CustomerLayout>
      <main className="mx-auto max-w-lg px-4 py-10">
        <h1 className="font-display text-3xl font-extrabold text-gray-900">Login</h1>
        <p className="mt-1 text-sm text-gray-600">Sign in for Super Admin, Owner, Staff, or Kitchen.</p>

        <form onSubmit={handleSubmit} className="glass-card mt-6 space-y-4 rounded-2xl p-5">
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            type="email"
            required
          />
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            type="password"
            required
          />
          <input
            value={tenantId}
            onChange={(event) => setTenantId(event.target.value)}
            placeholder="Tenant ID (required if duplicate email across tenants)"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            value={tenantSlug}
            onChange={(event) => setTenantSlug(event.target.value)}
            placeholder="Tenant slug for owner/staff routes (e.g. milk-tea-house)"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />

          {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <p className="text-center text-sm text-gray-600">
            Need owner account? <Link to="/auth/register-owner" className="font-bold text-brand-700">Register owner</Link>
          </p>
        </form>
      </main>
    </CustomerLayout>
  );
}

export default LoginPage;
