import express from 'express';

import tenantRoutes from './tenant.routes.js';
import authRoutes from './auth.routes.js';
import productRoutes from './product.routes.js';
import orderRoutes from './order.routes.js';
import categoryRoutes from './category.routes.js';
import tableRoutes from './table.routes.js';
import paymentRoutes from './payment.routes.js';
import menuRoutes from './menu.routes.js';
import tenantMiddleware from '../middlewares/tenant.middleware.js';

const router = express.Router();

router.use('/tenants', tenantRoutes);
router.use('/auth', authRoutes);
router.use('/:slug/products', tenantMiddleware, productRoutes);
router.use('/:slug/orders', tenantMiddleware, orderRoutes);
router.use('/:slug/categories', tenantMiddleware, categoryRoutes);
router.use('/:slug/tables', tenantMiddleware, tableRoutes);
router.use('/:slug/payments', tenantMiddleware, paymentRoutes);
router.use('/:slug/menu', tenantMiddleware, menuRoutes);

export default router;
