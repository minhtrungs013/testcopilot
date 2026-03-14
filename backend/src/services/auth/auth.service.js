import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

import env from '../../config/env.js';
import { ROLES } from '../../config/constants.js';
import Tenant from '../../models/tenant.model.js';
import User from '../../models/user.model.js';
import ApiError from '../../utils/ApiError.js';

function signAccessToken(user) {
  return jwt.sign(
    {
      user_id: String(user._id),
      tenant_id: user.tenant_id ? String(user.tenant_id) : null,
      role: user.role,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

function buildAuthResponse(userDoc) {
  return {
    token: signAccessToken(userDoc),
    user: {
      id: String(userDoc._id),
      tenant_id: userDoc.tenant_id ? String(userDoc.tenant_id) : null,
      full_name: userDoc.full_name,
      email: userDoc.email,
      role: userDoc.role,
      status: userDoc.status,
    },
  };
}

async function registerTenantOwner(payload) {
  const { tenant_id, full_name, email, password } = payload;

  if (!tenant_id || !full_name || !email || !password) {
    throw new ApiError(400, 'tenant_id, full_name, email, and password are required.');
  }

  if (!mongoose.Types.ObjectId.isValid(tenant_id)) {
    throw new ApiError(400, 'Invalid tenant_id.');
  }

  const tenant = await Tenant.findById(tenant_id).select('_id status');
  if (!tenant) {
    throw new ApiError(404, 'Tenant not found.');
  }

  if (tenant.status !== 'active') {
    throw new ApiError(403, 'Tenant is suspended.');
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existingOwner = await User.findOne({ tenant_id: tenant._id, email: normalizedEmail }).select('_id');
  if (existingOwner) {
    throw new ApiError(409, 'Email already exists in this tenant.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const owner = await User.create({
    tenant_id: tenant._id,
    full_name: String(full_name).trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role: ROLES.TENANT_OWNER,
    status: 'active',
  });

  return buildAuthResponse(owner);
}

async function login(payload) {
  const { email, password, tenant_id } = payload;

  if (!email || !password) {
    throw new ApiError(400, 'email and password are required.');
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  let user = null;

  if (tenant_id) {
    if (!mongoose.Types.ObjectId.isValid(tenant_id)) {
      throw new ApiError(400, 'Invalid tenant_id.');
    }
    user = await User.findOne({ email: normalizedEmail, tenant_id });
  } else {
    const users = await User.find({ email: normalizedEmail }).limit(2);
    if (users.length > 1) {
      throw new ApiError(400, 'Multiple accounts found. Please provide tenant_id.');
    }
    user = users[0] || null;
  }

  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  if (user.status !== 'active') {
    throw new ApiError(403, 'User is inactive.');
  }

  if (user.tenant_id) {
    const tenant = await Tenant.findById(user.tenant_id).select('_id status');
    if (!tenant) {
      throw new ApiError(404, 'Tenant not found for this account.');
    }
    if (tenant.status !== 'active') {
      throw new ApiError(403, 'Tenant is suspended.');
    }
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  return buildAuthResponse(user);
}

export default {
  registerTenantOwner,
  login,
};
