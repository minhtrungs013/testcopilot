import httpClient from './httpClient.js';

function toRawToken(token = '') {
  return String(token).replace(/^Bearer\s+/i, '').trim();
}

function authHeader(token) {
  return {
    Authorization: `Bearer ${toRawToken(token)}`,
  };
}

export async function fetchCategoriesBySlug(slug, token) {
  const response = await httpClient.get(`/${slug}/categories`, {
    headers: authHeader(token),
  });
  return response.data;
}

export async function createCategoryBySlug(slug, payload, token) {
  const response = await httpClient.post(`/${slug}/categories`, payload, {
    headers: authHeader(token),
  });
  return response.data;
}

export async function deleteCategoryBySlug(slug, categoryId, token) {
  const response = await httpClient.delete(`/${slug}/categories/${categoryId}`, {
    headers: authHeader(token),
  });
  return response.data;
}
