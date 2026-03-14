import { useCallback, useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';

import {
  fetchPendingOrdersBySlug,
  updateOrderStatusBySlug,
} from '../api/orderApi.js';
import useTenantSlug from '../hooks/useTenantSlug.js';
import CustomerLayout from '../layouts/CustomerLayout.jsx';
import useAuthStore from '../store/authStore.js';

const ORDER_STATUS_FLOW = ['pending', 'confirmed', 'preparing', 'served', 'paid'];

function getNextStatus(currentStatus) {
  const currentIndex = ORDER_STATUS_FLOW.indexOf(currentStatus);
  if (currentIndex === -1) {
    return null;
  }

  return ORDER_STATUS_FLOW[currentIndex + 1] || null;
}

function parseJwtPayload(token) {
  const rawToken = String(token || '').replace(/^Bearer\s+/i, '').trim();
  if (!rawToken) {
    return null;
  }

  const tokenParts = rawToken.split('.');
  if (tokenParts.length < 2) {
    return null;
  }

  try {
    const base64 = tokenParts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const payload = JSON.parse(atob(padded));
    return payload;
  } catch (_error) {
    return null;
  }
}

function StaffDashboardPage() {
  const slug = useTenantSlug();

  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [socketStatus, setSocketStatus] = useState('disconnected');

  const tokenPayload = useMemo(() => parseJwtPayload(token), [token]);
  const tenantId = user?.tenant_id || (tokenPayload?.tenant_id ? String(tokenPayload.tenant_id) : '');
  const rawToken = useMemo(() => String(token || '').replace(/^Bearer\s+/i, '').trim(), [token]);
  const isKitchen = user?.role === 'kitchen';

  const refreshOrders = useCallback(async () => {
    if (!token) {
      setGroups([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await fetchPendingOrdersBySlug(slug, token);
      setGroups(Array.isArray(data) ? data : []);
    } catch (apiError) {
      const message = apiError?.response?.data?.message || 'Failed to load pending orders.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [slug, token]);

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  useEffect(() => {
    if (!tenantId || !rawToken) {
      setSocketStatus('disconnected');
      return undefined;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';
    const socket = io(socketUrl, {
      transports: ['websocket'],
      reconnection: true,
      auth: {
        token: rawToken,
      },
    });

    socket.on('connect', () => {
      setSocketStatus('connected');
      socket.emit('join-tenant', undefined, (ack) => {
        if (!ack?.ok) {
          setSocketStatus('join_failed');
        }
      });
    });

    socket.on('connect_error', () => {
      setSocketStatus('auth_failed');
    });

    socket.on('disconnect', () => {
      setSocketStatus('disconnected');
    });

    socket.on('new-order', () => {
      refreshOrders();
    });

    socket.on('update-order-status', () => {
      refreshOrders();
    });

    socket.on('call-staff', () => {
      refreshOrders();
    });

    return () => {
      socket.disconnect();
    };
  }, [tenantId, rawToken, refreshOrders]);

  const totalOrders = useMemo(
    () => groups.reduce((sum, group) => sum + (group.orders?.length || 0), 0),
    [groups]
  );

  async function handleUpdateStatus(orderId, nextStatus) {
    if (!token) {
      setError('Token is required.');
      return;
    }

    try {
      await updateOrderStatusBySlug(slug, orderId, nextStatus, token);
      await refreshOrders();
    } catch (apiError) {
      const message = apiError?.response?.data?.message || 'Failed to update order status.';
      setError(message);
    }
  }

  return (
    <CustomerLayout>
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 md:px-6">
        <header className="mb-5 flex items-center justify-between">
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-brand-700">Staff Dashboard</p>
          <h1 className="font-display text-3xl font-extrabold text-gray-900 md:text-4xl">Realtime Orders</h1>
          <p className="mt-1 text-sm text-gray-600">
            Socket: <span className="font-semibold">{socketStatus}</span> | Total active orders:{' '}
            <span className="font-semibold">{totalOrders}</span>
          </p>
          </div>
          <div className="flex items-end gap-2">
            <span className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700">
              Role: {user?.role || 'N/A'} | Tenant: {tenantId || 'N/A'}
            </span>
            <button type="button" onClick={logout} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold">
              Logout
            </button>
          </div>
        </header>

        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="glass-card rounded-2xl p-5 text-sm text-gray-600">Loading orders...</div>
        ) : null}

        {!loading && groups.length === 0 ? (
          <div className="glass-card rounded-2xl p-5 text-sm text-gray-600">No pending, confirmed, preparing, or served orders.</div>
        ) : null}

        <section className="space-y-4">
          {groups.map((group) => (
            <article key={group.table_id} className="glass-card rounded-2xl p-4">
              <div className="mb-3 flex items-center justify-between border-b border-brand-100 pb-2">
                <h2 className="font-display text-xl font-bold text-gray-900">
                  Table {group.table_number ?? 'N/A'}
                </h2>
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
                  {group.orders?.length || 0} orders
                </span>
              </div>

              <div className="space-y-3">
                {(group.orders || []).map((order) => (
                  <div key={order._id} className="rounded-xl border border-brand-100 bg-white/80 p-3">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <div>
                        <p className="font-semibold text-gray-900">{order.order_code}</p>
                        <p className="text-xs text-gray-600">
                          {new Date(order.createdAt).toLocaleTimeString()} - {order.items?.length || 0} items
                        </p>
                      </div>
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-bold uppercase text-gray-700">
                        {order.status}
                      </span>
                    </div>

                    <ul className="mb-2 space-y-1 text-sm text-gray-700">
                      {(order.items || []).map((item, itemIndex) => (
                        <li key={`${order._id}-${itemIndex}`}>
                          {item.quantity} x {item.product_name}
                        </li>
                      ))}
                    </ul>

                    {!isKitchen ? (
                      (() => {
                        const nextStatus = getNextStatus(order.status);
                        if (!nextStatus) {
                          return <p className="text-xs font-semibold text-gray-500">No further action available.</p>;
                        }

                        return (
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(order._id, nextStatus)}
                              className="rounded-lg border border-gray-300 px-2 py-1 text-xs font-semibold text-gray-700"
                            >
                              Mark {nextStatus}
                            </button>
                          </div>
                        );
                      })()
                    ) : (
                      <p className="text-xs font-semibold text-gray-500">Kitchen mode: view-only</p>
                    )}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      </main>
    </CustomerLayout>
  );
}

export default StaffDashboardPage;
