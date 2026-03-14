import express from 'express';

import productController from '../controllers/product/product.controller.js';
import { ROLES } from '../config/constants.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/authorize.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', authorize([ROLES.TENANT_OWNER]), productController.createProduct);
router.get('/', authorize([ROLES.TENANT_OWNER]), productController.listProducts);
router.put('/:productId', authorize([ROLES.TENANT_OWNER]), productController.updateProduct);
router.delete('/:productId', authorize([ROLES.TENANT_OWNER]), productController.deleteProduct);

export default router;
