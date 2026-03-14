import express from 'express';

import tableController from '../controllers/table/table.controller.js';
import { ROLES } from '../config/constants.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/authorize.middleware.js';

const router = express.Router();

router.get('/resolve/:tableNumber', tableController.resolveTableByNumber);

router.use(authMiddleware);
router.use(authorize([ROLES.TENANT_OWNER]));

router.post('/', tableController.createTable);
router.get('/', tableController.listTables);
router.put('/:tableId', tableController.updateTable);
router.delete('/:tableId', tableController.deleteTable);

export default router;
