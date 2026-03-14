import express from 'express';

import tenantController from '../controllers/tenant/tenant.controller.js';
import { ROLES } from '../config/constants.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/authorize.middleware.js';

const router = express.Router();

router.use(authMiddleware);
router.use(authorize([ROLES.SUPER_ADMIN]));

router.post('/', tenantController.createTenant);
router.get('/', tenantController.listTenants);
router.put('/:tenantId/status', tenantController.updateTenantStatus);

export default router;
