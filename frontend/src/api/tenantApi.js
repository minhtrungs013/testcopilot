import httpClient from './httpClient.js';

function toRawToken(token = '') {
  return String(token).replace(/^Bearer\s+/i, '').trim();
}

function authHeader(token) {
  return {
    Authorization: `Bearer ${toRawToken(token)}`,
  };
}

export async function createTenant(payload, token) {
  const response = await httpClient.post('/tenants', payload, {
    headers: authHeader(token),
  });
  return response.data;
}

export async function fetchTenants(token) {
  const response = await httpClient.get('/tenants', {
    headers: authHeader(token),
  });
  return response.data;
}

export async function updateTenantStatus(tenantId, status, token) {
  const response = await httpClient.put(
    `/tenants/${tenantId}/status`,
    { status },
    {
      headers: authHeader(token),
    }
  );
  return response.data;
}