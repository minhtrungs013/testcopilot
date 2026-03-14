import httpClient from './httpClient.js';

export async function fetchMenuBySlug(slug) {
  const response = await httpClient.get(`/${slug}/menu`);
  return response.data;
}
