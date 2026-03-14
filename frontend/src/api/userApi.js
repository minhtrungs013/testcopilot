import httpClient from './httpClient.js';

function authConfig(token) {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

export async function fetchUsersBySlug(slug, token) {
  const response = await httpClient.get(`/${slug}/users`, authConfig(token));
  return response.data;
}

export async function createUserBySlug(slug, payload, token) {
  const response = await httpClient.post(`/${slug}/users`, payload, authConfig(token));
  return response.data;
}

export async function updateUserStatusBySlug(slug, userId, status, token) {
  const response = await httpClient.patch(`/${slug}/users/${userId}/status`, { status }, authConfig(token));
  return response.data;
}
