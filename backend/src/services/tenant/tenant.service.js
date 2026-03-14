import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

import { ROLES } from '../../config/constants.js';
import Tenant from '../../models/tenant.model.js';
import User from '../../models/user.model.js';
import ApiError from '../../utils/ApiError.js';

async function createTenant(payload) {
  const {
    name,
    slug,
    owner_name,
    owner_email,
    owner_password,
    phone,
    address,
    plan = 'free',
  } = payload;

  if (!name || !slug || !owner_name || !owner_email || !owner_password) {
    throw new ApiError(
      400,
      'name, slug, owner_name, owner_email, and owner_password are required.'
    );
  }

  const normalizedSlug = String(slug).trim().toLowerCase();
  const normalizedOwnerEmail = String(owner_email).trim().toLowerCase();

  const existingTenant = await Tenant.findOne({ slug: normalizedSlug }).select('_id');
  if (existingTenant) {
    throw new ApiError(409, 'Tenant slug already exists.');
  }

  const tenant = await Tenant.create({
    name: String(name).trim(),
    slug: normalizedSlug,
    owner_name: String(owner_name).trim(),
    phone: String(phone || '').trim(),
    address: String(address || '').trim(),
    plan,
    status: 'active',
  });

  try {
    const hashedPassword = await bcrypt.hash(String(owner_password), 10);
    await User.create({
      tenant_id: tenant._id,
      full_name: String(owner_name).trim(),
      email: normalizedOwnerEmail,
      password: hashedPassword,
      role: ROLES.TENANT_OWNER,
      status: 'active',
    });
  } catch (error) {
    await Tenant.deleteOne({ _id: tenant._id });
    if (error?.code === 11000) {
      throw new ApiError(409, 'Tenant owner email already exists in this tenant.');
    }
    throw error;
  }

  return tenant;
}

async function listTenants() {
  return Tenant.find({}).sort({ createdAt: -1 });
}

async function updateTenantStatus(tenantId, status) {
  if (!mongoose.Types.ObjectId.isValid(tenantId)) {
    throw new ApiError(400, 'Invalid tenantId.');
  }

  if (!['active', 'suspended'].includes(status)) {
    throw new ApiError(400, 'status must be active or suspended.');
  }

  const tenant = await Tenant.findByIdAndUpdate(tenantId, { status }, { new: true });
  if (!tenant) {
    throw new ApiError(404, 'Tenant not found.');
  }

  return tenant;
}

export default {
  createTenant,
  listTenants,
  updateTenantStatus,
};
