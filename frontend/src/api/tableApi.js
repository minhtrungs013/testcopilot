import httpClient from './httpClient.js';

export async function resolveTableByNumber(slug, tableNumber) {
  const response = await httpClient.get(`/${slug}/tables/resolve/${tableNumber}`);
  return response.data;
}