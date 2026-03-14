import express from 'express';

import orderController from '../controllers/order/order.controller.js';
import { ROLES } from '../config/constants.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/authorize.middleware.js';

const router = express.Router();

router.post('/', orderController.createOrder);
router.use(authMiddleware);
router.get('/stats', authorize([ROLES.TENANT_OWNER]), orderController.getOwnerOrderStats);
router.get('/pending', authorize([ROLES.STAFF, ROLES.KITCHEN]), orderController.listPendingOrders);
router.patch('/:orderId/status', authorize([ROLES.STAFF]), orderController.updateOrderStatus);

export default router;
