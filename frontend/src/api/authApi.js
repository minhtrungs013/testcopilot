import httpClient from './httpClient.js';

export async function login(payload) {
  const response = await httpClient.post('/auth/login', payload);
  return response.data;
}

export async function registerTenantOwner(payload) {
  const response = await httpClient.post('/auth/register-owner', payload);
  return response.data;
}
