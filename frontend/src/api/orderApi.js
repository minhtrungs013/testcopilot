import httpClient from './httpClient.js';

function toRawToken(token = '') {
  return String(token).replace(/^Bearer\s+/i, '').trim();
}

export async function submitOrderBySlug(slug, payload) {
  const response = await httpClient.post(`/${slug}/orders`, payload);
  return response.data;
}

export async function fetchPendingOrdersBySlug(slug, token) {
  const rawToken = toRawToken(token);
  const response = await httpClient.get(`/${slug}/orders/pending`, {
    headers: {
      Authorization: `Bearer ${rawToken}`,
    },
  });
  return response.data;
}

export async function updateOrderStatusBySlug(slug, orderId, status, token) {
  const rawToken = toRawToken(token);
  const response = await httpClient.patch(
    `/${slug}/orders/${orderId}/status`,
    { status },
    {
      headers: {
        Authorization: `Bearer ${rawToken}`,
      },
    }
  );

  return response.data;
}