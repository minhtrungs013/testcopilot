import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

import User from '../../models/user.model.js';
import ApiError from '../../utils/ApiError.js';

const STAFF_ROLES = ['staff', 'kitchen'];

function getTenantId(tenant) {
  const tenantId = tenant?.tenant_id;
  if (!tenantId || !mongoose.Types.ObjectId.isValid(String(tenantId))) {
    throw new ApiError(400, 'Invalid tenant context.');
  }
  return String(tenantId);
}

function sanitizeUser(userDoc) {
  return {
    _id: String(userDoc._id),
    tenant_id: userDoc.tenant_id ? String(userDoc.tenant_id) : null,
    full_name: userDoc.full_name,
    email: userDoc.email,
    role: userDoc.role,
    status: userDoc.status,
    createdAt: userDoc.createdAt,
    updatedAt: userDoc.updatedAt,
  };
}

async function createStaffAccount(payload, tenant) {
  const tenantId = getTenantId(tenant);
  const { full_name, email, password, role = 'staff', status = 'active' } = payload;

  if (!full_name || !email || !password) {
    throw new ApiError(400, 'full_name, email, and password are required.');
  }

  const normalizedRole = String(role).trim();
  if (!STAFF_ROLES.includes(normalizedRole)) {
    throw new ApiError(400, 'role must be staff or kitchen.');
  }

  const normalizedStatus = String(status).trim();
  if (!['active', 'inactive'].includes(normalizedStatus)) {
    throw new ApiError(400, 'status must be active or inactive.');
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existed = await User.findOne({ tenant_id: tenantId, email: normalizedEmail }).select('_id');
  if (existed) {
    throw new ApiError(409, 'Email already exists in this tenant.');
  }

  const hashedPassword = await bcrypt.hash(String(password), 10);
  const created = await User.create({
    tenant_id: tenantId,
    full_name: String(full_name).trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role: normalizedRole,
    status: normalizedStatus,
  });

  return sanitizeUser(created);
}

async function listStaffAccounts(tenant) {
  const tenantId = getTenantId(tenant);

  const users = await User.find({
    tenant_id: tenantId,
    role: { $in: STAFF_ROLES },
  })
    .select('_id tenant_id full_name email role status createdAt updatedAt')
    .sort({ createdAt: -1 });

  return users.map((user) => sanitizeUser(user));
}

async function updateStaffStatus(userId, status, tenant) {
  const tenantId = getTenantId(tenant);

  if (!mongoose.Types.ObjectId.isValid(String(userId))) {
    throw new ApiError(400, 'Invalid userId.');
  }

  const normalizedStatus = String(status || '').trim();
  if (!['active', 'inactive'].includes(normalizedStatus)) {
    throw new ApiError(400, 'status must be active or inactive.');
  }

  const updated = await User.findOneAndUpdate(
    {
      _id: userId,
      tenant_id: tenantId,
      role: { $in: STAFF_ROLES },
    },
    { status: normalizedStatus },
    { new: true }
  ).select('_id tenant_id full_name email role status createdAt updatedAt');

  if (!updated) {
    throw new ApiError(404, 'Staff account not found.');
  }

  return sanitizeUser(updated);
}

export default {
  createStaffAccount,
  listStaffAccounts,
  updateStaffStatus,
};
