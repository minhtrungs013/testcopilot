import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

import env from '../config/env.js';
import { ROLES } from '../config/constants.js';
import Tenant from '../models/tenant.model.js';
import User from '../models/user.model.js';
import { setSocketServer, tenantRoom } from './gateway.js';

function extractToken(socket) {
  const authToken = socket.handshake.auth?.token;
  if (authToken) {
    return String(authToken).replace(/^Bearer\s+/i, '').trim();
  }

  const headerToken = socket.handshake.headers?.authorization;
  if (headerToken) {
    return String(headerToken).replace(/^Bearer\s+/i, '').trim();
  }

  return '';
}

function createSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
    },
  });

  setSocketServer(io);

  io.use(async (socket, next) => {
    try {
      const token = extractToken(socket);
      if (!token) {
        return next(new Error('Unauthorized: missing token.'));
      }

      const payload = jwt.verify(token, env.jwtSecret);
      const user = await User.findById(payload.user_id).select('_id tenant_id role status');

      if (!user || user.status !== 'active') {
        return next(new Error('Unauthorized: account is not active.'));
      }

      if (user.tenant_id) {
        const tenant = await Tenant.findById(user.tenant_id).select('_id status');
        if (!tenant || tenant.status !== 'active') {
          return next(new Error('Forbidden: tenant is not active.'));
        }
      }

      socket.data.user = {
        user_id: String(user._id),
        tenant_id: user.tenant_id ? String(user.tenant_id) : null,
        role: user.role,
      };

      return next();
    } catch (_error) {
      return next(new Error('Unauthorized: invalid token.'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('join-tenant', (tenantId, ack) => {
      const user = socket.data.user || {};
      const isSuperAdmin = user.role === ROLES.SUPER_ADMIN;

      let normalizedTenantId = null;
      if (isSuperAdmin) {
        if (!tenantId) {
          if (typeof ack === 'function') {
            ack({ ok: false, message: 'tenant_id is required for super_admin.' });
          }
          return;
        }
        normalizedTenantId = String(tenantId);
      } else {
        if (!user.tenant_id) {
          if (typeof ack === 'function') {
            ack({ ok: false, message: 'No tenant assigned to this account.' });
          }
          return;
        }

        if (tenantId && String(tenantId) !== String(user.tenant_id)) {
          if (typeof ack === 'function') {
            ack({ ok: false, message: 'Forbidden: tenant mismatch.' });
          }
          return;
        }

        normalizedTenantId = String(user.tenant_id);
      }

      const previousTenantId = socket.data.tenant_id;

      if (previousTenantId && previousTenantId !== normalizedTenantId) {
        socket.leave(tenantRoom(previousTenantId));
      }

      socket.data.tenant_id = normalizedTenantId;
      socket.join(tenantRoom(normalizedTenantId));

      if (typeof ack === 'function') {
        ack({ ok: true, room: tenantRoom(normalizedTenantId) });
      }
    });

    socket.on('call-staff', (payload = {}, ack) => {
      const tenantId = socket.data.tenant_id;

      if (!tenantId) {
        if (typeof ack === 'function') {
          ack({ ok: false, message: 'Socket has not joined a tenant room.' });
        }
        return;
      }

      const eventPayload = {
        tenant_id: tenantId,
        table_id: payload.table_id ? String(payload.table_id) : null,
        message: String(payload.message || '').trim(),
        requested_at: new Date().toISOString(),
      };

      io.to(tenantRoom(tenantId)).emit('call-staff', eventPayload);

      if (typeof ack === 'function') {
        ack({ ok: true });
      }
    });

    socket.on('disconnect', () => {});
  });

  return io;
}

export default createSocketServer;
