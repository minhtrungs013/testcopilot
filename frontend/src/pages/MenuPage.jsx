import { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import { fetchMenuBySlug } from '../api/menuApi.js';
import CartBar from '../components/CartBar.jsx';
import CategoryTabs from '../components/CategoryTabs.jsx';
import ProductCard from '../components/ProductCard.jsx';
import useTenantSlug from '../hooks/useTenantSlug.js';
import CustomerLayout from '../layouts/CustomerLayout.jsx';
import useCartStore from '../store/cartStore.js';

function MenuPage() {
  const slug = useTenantSlug();
  const { tableNumber } = useParams();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [menu, setMenu] = useState({ tenant: null, categories: [] });
  const [activeCategoryId, setActiveCategoryId] = useState('');

  const addItem = useCartStore((state) => state.addItem);
  const totalItems = useCartStore((state) => state.getTotalItems());
  const totalPrice = useCartStore((state) => state.getTotalPrice());
  const cartPath = tableNumber
    ? `/${slug}/table/${tableNumber}/cart${location.search || ''}`
    : `/${slug}/cart${location.search || ''}`;

  useEffect(() => {
    let mounted = true;

    async function loadMenu() {
      setLoading(true);
      setError('');

      try {
        const data = await fetchMenuBySlug(slug);
        if (!mounted) {
          return;
        }
        setMenu(data);
        setActiveCategoryId(data.categories?.[0]?.id || '');
      } catch (_error) {
        if (mounted) {
          setError('Cannot load menu. Please try again.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadMenu();

    return () => {
      mounted = false;
    };
  }, [slug]);

  const activeCategory = useMemo(
    () => menu.categories.find((category) => category.id === activeCategoryId) || menu.categories[0],
    [menu.categories, activeCategoryId]
  );

  return (
    <CustomerLayout>
      <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 md:px-6">
      <header className="mb-5 enter-fade">
        <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-brand-700">Table Menu</p>
        <h1 className="font-display text-3xl font-extrabold text-gray-900 md:text-4xl">
          {menu.tenant?.name || 'Restaurant'}
        </h1>
        <p className="mt-1 text-sm text-gray-600">Scan. Tap. Enjoy.</p>
      </header>

      {loading ? (
        <div className="glass-card rounded-2xl p-8 text-center text-sm text-gray-600">Loading menu...</div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      {!loading && !error && menu.categories.length > 0 ? (
        <section className="space-y-4">
          <CategoryTabs
            categories={menu.categories}
            activeId={activeCategory?.id}
            onChange={setActiveCategoryId}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(activeCategory?.products || []).map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={addItem} />
            ))}
          </div>
        </section>
      ) : null}

      {!loading && !error && menu.categories.length === 0 ? (
        <div className="glass-card rounded-2xl p-6 text-center text-sm text-gray-600">
          No active products available.
        </div>
      ) : null}

        <CartBar totalItems={totalItems} totalPrice={totalPrice} to={cartPath} />
      </main>
    </CustomerLayout>
  );
}

export default MenuPage;