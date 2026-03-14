import httpClient from './httpClient.js';

function toRawToken(token = '') {
  return String(token).replace(/^Bearer\s+/i, '').trim();
}

function authHeader(token) {
  return {
    Authorization: `Bearer ${toRawToken(token)}`,
  };
}

export async function fetchProductsBySlug(slug, token) {
  const response = await httpClient.get(`/${slug}/products`, {
    headers: authHeader(token),
  });
  return response.data;
}

export async function createProductBySlug(slug, payload, token) {
  const response = await httpClient.post(`/${slug}/products`, payload, {
    headers: authHeader(token),
  });
  return response.data;
}

export async function updateProductStatusBySlug(slug, productId, status, token) {
  const response = await httpClient.put(
    `/${slug}/products/${productId}`,
    { status },
    {
      headers: authHeader(token),
    }
  );
  return response.data;
}