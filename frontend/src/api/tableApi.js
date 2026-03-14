import httpClient from './httpClient.js';

function toRawToken(token = '') {
  return String(token).replace(/^Bearer\s+/i, '').trim();
}

function authHeader(token) {
  return {
    Authorization: `Bearer ${toRawToken(token)}`,
  };
}

export async function resolveTableByNumber(slug, tableNumber) {
  const response = await httpClient.get(`/${slug}/tables/resolve/${tableNumber}`);
  return response.data;
}

export async function fetchTablesBySlug(slug, token) {
  const response = await httpClient.get(`/${slug}/tables`, {
    headers: authHeader(token),
  });
  return response.data;
}

export async function createTableBySlug(slug, payload, token) {
  const response = await httpClient.post(`/${slug}/tables`, payload, {
    headers: authHeader(token),
  });
  return response.data;
}

export async function deleteTableBySlug(slug, tableId, token) {
  const response = await httpClient.delete(`/${slug}/tables/${tableId}`, {
    headers: authHeader(token),
  });
  return response.data;
}