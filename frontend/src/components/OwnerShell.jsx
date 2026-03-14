import { NavLink } from 'react-router-dom';

import CustomerLayout from '../layouts/CustomerLayout.jsx';
import useAuthStore from '../store/authStore.js';

const OWNER_NAV_ITEMS = [
  { to: '', label: 'Dashboard', end: true },
  { to: 'categories', label: 'Categories' },
  { to: 'products', label: 'Products' },
  { to: 'tables', label: 'Tables' },
  { to: 'staff', label: 'Staff' },
];

function OwnerShell({ slug, title, children }) {
  const logout = useAuthStore((state) => state.logout);

  return (
    <CustomerLayout>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-brand-700">Tenant Owner</p>
            <h1 className="font-display text-3xl font-extrabold text-gray-900">{title}</h1>
            <p className="mt-1 text-sm text-gray-600">Tenant: {slug}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold"
          >
            Logout
          </button>
        </header>

        <nav className="mb-5 flex flex-wrap gap-2">
          {OWNER_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.label}
              to={`/${slug}/owner${item.to ? `/${item.to}` : ''}`}
              end={item.end}
              className={({ isActive }) =>
                `rounded-lg border px-3 py-2 text-sm font-semibold ${
                  isActive
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {children}
      </main>
    </CustomerLayout>
  );
}

export default OwnerShell;
