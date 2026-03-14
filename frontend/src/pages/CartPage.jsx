import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { submitOrderBySlug } from '../api/orderApi.js';
import { resolveTableByNumber } from '../api/tableApi.js';
import useTenantSlug from '../hooks/useTenantSlug.js';
import CustomerLayout from '../layouts/CustomerLayout.jsx';
import useCartStore from '../store/cartStore.js';

function CartPage() {
  const slug = useTenantSlug();
  const { tableNumber } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const items = useCartStore((state) => state.items);
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);
  const setItemQuantity = useCartStore((state) => state.setItemQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const setItemNote = useCartStore((state) => state.setItemNote);
  const clearCart = useCartStore((state) => state.clearCart);

  const [tableId, setTableId] = useState(searchParams.get('table_id') || '');
  const [resolvingTable, setResolvingTable] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const totalPrice = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);

  useEffect(() => {
    let mounted = true;

    async function resolveTable() {
      if (!tableNumber) {
        return;
      }

      try {
        setResolvingTable(true);
        const table = await resolveTableByNumber(slug, tableNumber);
        if (!mounted) {
          return;
        }
        setTableId(table.table_id);
      } catch (_error) {
        if (mounted) {
          setError('Cannot resolve table from QR path.');
        }
      } finally {
        if (mounted) {
          setResolvingTable(false);
        }
      }
    }

    resolveTable();

    return () => {
      mounted = false;
    };
  }, [slug, tableNumber]);

  async function handleSubmitOrder() {
    setError('');
    setSuccess('');

    if (!tableId.trim()) {
      setError('Please provide table_id before submitting.');
      return;
    }

    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    const payload = {
      table_id: tableId.trim(),
      items: items.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        note: item.note || '',
        selected_options: item.selected_options || [],
      })),
    };

    try {
      setSubmitting(true);
      const order = await submitOrderBySlug(slug, payload);
      clearCart();
      setSuccess(`Order submitted successfully. Code: ${order.order_code}`);
      setTimeout(() => {
        if (tableNumber) {
          navigate(`/${slug}/table/${tableNumber}`);
        } else {
          navigate(`/${slug}/menu?table_id=${encodeURIComponent(tableId.trim())}`);
        }
      }, 1200);
    } catch (apiError) {
      const message = apiError?.response?.data?.message || 'Failed to submit order.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <CustomerLayout>
      <main className="mx-auto w-full max-w-3xl px-4 pb-24 pt-6 md:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-brand-700">Your Cart</p>
            <h1 className="font-display text-3xl font-extrabold text-gray-900">Review Order</h1>
          </div>
          <Link
            to={
              tableNumber
                ? `/${slug}/table/${tableNumber}`
                : `/${slug}/menu${tableId ? `?table_id=${encodeURIComponent(tableId)}` : ''}`
            }
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700"
          >
            Back Menu
          </Link>
        </div>

        <section className="glass-card mb-4 rounded-2xl p-4">
          {tableNumber ? (
            <div className="text-sm text-gray-700">
              <p className="font-semibold">Table Number: {tableNumber}</p>
              <p className="mt-1 text-xs text-gray-600">
                {resolvingTable ? 'Resolving table from QR...' : `Resolved table_id: ${tableId || 'N/A'}`}
              </p>
            </div>
          ) : (
            <>
              <label htmlFor="table_id" className="mb-2 block text-sm font-semibold text-gray-700">
                Table ID
              </label>
              <input
                id="table_id"
                type="text"
                value={tableId}
                onChange={(event) => setTableId(event.target.value)}
                placeholder="Enter table_id from QR"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
            </>
          )}
        </section>

        {items.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center text-sm text-gray-600">Your cart is empty.</div>
        ) : (
          <section className="space-y-3">
            {items.map((item) => (
              <article key={item.id} className="glass-card rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-bold text-gray-900">{item.name}</h2>
                    <p className="text-sm text-gray-600">{item.price.toLocaleString()} VND / item</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="rounded-lg border border-red-200 px-2 py-1 text-xs font-bold text-red-600"
                  >
                    Remove
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => decreaseQuantity(item.id)}
                    className="h-8 w-8 rounded-lg border border-gray-300 text-sm font-bold"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(event) => setItemQuantity(item.id, Number(event.target.value))}
                    className="h-8 w-16 rounded-lg border border-gray-300 text-center text-sm font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => increaseQuantity(item.id)}
                    className="h-8 w-8 rounded-lg border border-gray-300 text-sm font-bold"
                  >
                    +
                  </button>
                </div>

                <textarea
                  value={item.note || ''}
                  onChange={(event) => setItemNote(item.id, event.target.value)}
                  placeholder="Note for kitchen (optional)"
                  rows={2}
                  className="mt-3 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
                />
              </article>
            ))}
          </section>
        )}

        <section className="glass-card mt-5 rounded-2xl p-4">
          <div className="flex items-center justify-between text-sm text-gray-700">
            <span>Total items</span>
            <span className="font-bold">{totalItems}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-base text-gray-900">
            <span className="font-semibold">Total price</span>
            <span className="font-display text-xl font-extrabold">{totalPrice.toLocaleString()} VND</span>
          </div>

          {error ? <p className="mt-3 text-sm font-semibold text-red-600">{error}</p> : null}
          {success ? <p className="mt-3 text-sm font-semibold text-green-700">{success}</p> : null}

          <button
            type="button"
            disabled={submitting || items.length === 0 || resolvingTable || !tableId}
            onClick={handleSubmitOrder}
            className="mt-4 w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Submitting...' : 'Submit Order'}
          </button>
        </section>
      </main>
    </CustomerLayout>
  );
}

export default CartPage;
