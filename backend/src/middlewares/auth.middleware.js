import jwt from 'jsonwebtoken';

import env from '../config/env.js';
import { ROLES } from '../config/constants.js';
import Tenant from '../models/tenant.model.js';
import User from '../models/user.model.js';

async function authMiddleware(req, res, next) {
  try {
    const authorization = req.headers.authorization || '';
    const [scheme, token] = authorization.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({
        message: 'Unauthorized: missing or invalid bearer token.',
      });
    }

    let payload;
    try {
      payload = jwt.verify(token, env.jwtSecret);
    } catch (_error) {
      return res.status(401).json({
        message: 'Unauthorized: token is invalid or expired.',
      });
    }

    const user = await User.findById(payload.user_id).select('_id tenant_id full_name email role status');

    if (!user || user.status !== 'active') {
      return res.status(401).json({
        message: 'Unauthorized: account is not active.',
      });
    }

    if (user.tenant_id) {
      const tenant = await Tenant.findById(user.tenant_id).select('_id status');
      if (!tenant) {
        return res.status(401).json({
          message: 'Unauthorized: tenant not found.',
        });
      }
      if (tenant.status !== 'active') {
        return res.status(403).json({
          message: 'Forbidden: tenant is suspended.',
        });
      }
    }

    req.user = {
      user_id: String(user._id),
      tenant_id: user.tenant_id ? String(user.tenant_id) : null,
      role: user.role,
      full_name: user.full_name,
      email: user.email,
    };

    if (req.tenant && req.user.role !== ROLES.SUPER_ADMIN) {
      const requestTenantId = String(req.tenant.tenant_id);
      if (!req.user.tenant_id || req.user.tenant_id !== requestTenantId) {
        return res.status(403).json({
          message: 'Forbidden: tenant scope mismatch.',
        });
      }
    }

    return next();
  } catch (error) {
    return next(error);
  }
}

export default authMiddleware;
