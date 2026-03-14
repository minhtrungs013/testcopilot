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

export async function updateProductBySlug(slug, productId, payload, token) {
  const response = await httpClient.put(`/${slug}/products/${productId}`, payload, {
    headers: authHeader(token),
  });
  return response.data;
}

export async function deleteProductBySlug(slug, productId, token) {
  const response = await httpClient.delete(`/${slug}/products/${productId}`, {
    headers: authHeader(token),
  });
  return response.data;
}

export async function updateProductStatusBySlug(slug, productId, status, token) {
  return updateProductBySlug(slug, productId, { status }, token);
}