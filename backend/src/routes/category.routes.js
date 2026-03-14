import express from 'express';

import categoryController from '../controllers/category/category.controller.js';
import { ROLES } from '../config/constants.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/authorize.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', authorize([ROLES.TENANT_OWNER]), categoryController.createCategory);
router.get('/', authorize([ROLES.TENANT_OWNER]), categoryController.listCategories);
router.put('/:categoryId', authorize([ROLES.TENANT_OWNER]), categoryController.updateCategory);
router.delete('/:categoryId', authorize([ROLES.TENANT_OWNER]), categoryController.deleteCategory);

export default router;
