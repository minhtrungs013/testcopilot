import asyncHandler from '../../utils/asyncHandler.js';
import tenantService from '../../services/tenant/tenant.service.js';

const createTenant = asyncHandler(async (req, res) => {
  const tenant = await tenantService.createTenant(req.body);
  res.status(201).json(tenant);
});

const listTenants = asyncHandler(async (_req, res) => {
  const tenants = await tenantService.listTenants();
  res.status(200).json(tenants);
});

const updateTenantStatus = asyncHandler(async (req, res) => {
  const tenant = await tenantService.updateTenantStatus(req.params.tenantId, req.body.status);
  res.status(200).json(tenant);
});

export default {
  createTenant,
  listTenants,
  updateTenantStatus,
};
