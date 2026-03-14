import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import OwnerShell from '../components/OwnerShell.jsx';
import { fetchOwnerOrderStatsBySlug } from '../api/orderApi.js';
import useAuthStore from '../store/authStore.js';

function OwnerDashboardPage() {
  const { slug } = useParams();
  const token = useAuthStore((state) => state.token);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }),
    []
  );

  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      if (!token) {
        return;
      }

      setLoading(true);
      setError('');

      try {
        const data = await fetchOwnerOrderStatsBySlug(slug, token);
        if (isMounted) {
          setStats(data);
        }
      } catch (apiError) {
        if (isMounted) {
          setError(apiError?.response?.data?.message || 'Failed to load owner stats.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadStats();

    return () => {
      isMounted = false;
    };
  }, [slug, token]);

  const statCards = [
    { label: 'Total Orders', value: stats?.total_orders ?? 0 },
    { label: 'Paid Orders', value: stats?.paid_orders ?? 0 },
    { label: 'Active Orders', value: stats?.active_orders ?? 0 },
    { label: 'Total Revenue', value: currencyFormatter.format(stats?.total_revenue ?? 0) },
  ];

  return (
    <OwnerShell slug={slug} title="Owner Dashboard">
      {error ? <p className="mb-4 text-sm font-semibold text-red-600">{error}</p> : null}

      {loading ? (
        <section className="glass-card rounded-2xl p-5 text-sm text-gray-600">Loading statistics...</section>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <article key={card.label} className="glass-card rounded-2xl p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">{card.label}</p>
              <p className="mt-2 font-display text-3xl font-black text-gray-900">{card.value}</p>
            </article>
          ))}
        </section>
      )}

      <section className="mt-5 grid gap-4 md:grid-cols-2">
        <article className="glass-card rounded-2xl p-4">
          <h2 className="font-display text-xl font-bold text-gray-900">Manage Menu</h2>
          <p className="mt-1 text-sm text-gray-600">Create and organize categories, products, and stock status.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold hover:bg-gray-100" to={`/${slug}/owner/categories`}>
              Go to Categories
            </Link>
            <Link className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold hover:bg-gray-100" to={`/${slug}/owner/products`}>
              Go to Products
            </Link>
          </div>
        </article>

        <article className="glass-card rounded-2xl p-4">
          <h2 className="font-display text-xl font-bold text-gray-900">Manage Operation</h2>
          <p className="mt-1 text-sm text-gray-600">Manage tables with QR and staff accounts in dedicated pages.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold hover:bg-gray-100" to={`/${slug}/owner/tables`}>
              Go to Tables
            </Link>
            <Link className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold hover:bg-gray-100" to={`/${slug}/owner/staff`}>
              Go to Staff
            </Link>
          </div>
        </article>
      </section>
    </OwnerShell>
  );
}

export default OwnerDashboardPage;