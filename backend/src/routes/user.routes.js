import express from 'express';

import userController from '../controllers/user/user.controller.js';
import { ROLES } from '../config/constants.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/authorize.middleware.js';

const router = express.Router();

router.use(authMiddleware);
router.use(authorize([ROLES.TENANT_OWNER]));

router.post('/', userController.createStaffAccount);
router.get('/', userController.listStaffAccounts);
router.patch('/:userId/status', userController.updateStaffStatus);

export default router;