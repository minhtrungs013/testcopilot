import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import OwnerShell from '../components/OwnerShell.jsx';
import {
  createUserBySlug,
  fetchUsersBySlug,
  updateUserStatusBySlug,
} from '../api/userApi.js';
import useAuthStore from '../store/authStore.js';

function OwnerStaffPage() {
  const { slug } = useParams();
  const token = useAuthStore((state) => state.token);

  const [staffAccounts, setStaffAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [staffForm, setStaffForm] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'staff',
  });

  async function refreshStaffAccounts() {
    if (!token) {
      setStaffAccounts([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await fetchUsersBySlug(slug, token);
      setStaffAccounts(Array.isArray(data) ? data : []);
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to load staff accounts.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshStaffAccounts();
  }, [slug, token]);

  async function handleCreateStaffAccount(event) {
    event.preventDefault();

    if (!staffForm.email.trim() || !staffForm.password || !staffForm.full_name.trim()) {
      setError('Please fill email, password, and full name for staff account.');
      return;
    }

    try {
      await createUserBySlug(
        slug,
        {
          email: staffForm.email.trim(),
          password: staffForm.password,
          full_name: staffForm.full_name.trim(),
          role: staffForm.role,
        },
        token
      );
      setStaffForm({ email: '', password: '', full_name: '', role: 'staff' });
      await refreshStaffAccounts();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to create staff account.');
    }
  }

  async function handleToggleStaffStatus(user) {
    try {
      const nextStatus = user.status === 'active' ? 'inactive' : 'active';
      await updateUserStatusBySlug(slug, user._id, nextStatus, token);
      await refreshStaffAccounts();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to update staff status.');
    }
  }

  return (
    <OwnerShell slug={slug} title="Staff Management">
      {error ? <p className="mb-4 text-sm font-semibold text-red-600">{error}</p> : null}

      <section className="glass-card rounded-2xl p-4">
        <h2 className="font-display text-xl font-bold">Create Staff Account</h2>
        <form onSubmit={handleCreateStaffAccount} className="mt-3 grid gap-2 md:grid-cols-4">
          <input
            value={staffForm.email}
            onChange={(event) => setStaffForm((state) => ({ ...state, email: event.target.value }))}
            placeholder="Email"
            type="email"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            required
          />
          <input
            value={staffForm.password}
            onChange={(event) => setStaffForm((state) => ({ ...state, password: event.target.value }))}
            placeholder="Password"
            type="password"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            minLength={6}
            required
          />
          <input
            value={staffForm.full_name}
            onChange={(event) => setStaffForm((state) => ({ ...state, full_name: event.target.value }))}
            placeholder="Full name"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            required
          />
          <div className="flex gap-2">
            <select
              value={staffForm.role}
              onChange={(event) => setStaffForm((state) => ({ ...state, role: event.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="staff">Staff</option>
              <option value="kitchen">Kitchen</option>
            </select>
            <button type="submit" className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-bold text-white">
              Add
            </button>
          </div>
        </form>
      </section>

      <section className="glass-card mt-5 rounded-2xl p-4">
        <h2 className="font-display text-xl font-bold">Staff Accounts</h2>

        {loading ? <p className="mt-3 text-sm text-gray-600">Loading staff accounts...</p> : null}

        {!loading && staffAccounts.length === 0 ? (
          <p className="mt-3 text-sm text-gray-600">No staff account yet.</p>
        ) : null}

        <div className="mt-3 space-y-2">
          {staffAccounts.map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2"
            >
              <div>
                <p className="text-sm font-semibold">
                  {user.full_name} ({user.role})
                </p>
                <p className="text-xs text-gray-600">
                  {user.email} | {user.status}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggleStaffStatus(user)}
                className="rounded-lg border border-gray-300 px-2 py-1 text-xs font-bold"
              >
                {user.status === 'active' ? 'Set inactive' : 'Set active'}
              </button>
            </div>
          ))}
        </div>
      </section>
    </OwnerShell>
  );
}

export default OwnerStaffPage;
