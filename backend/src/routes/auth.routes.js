import express from 'express';

import authController from '../controllers/auth/auth.controller.js';

const router = express.Router();

router.post('/register-owner', authController.registerTenantOwner);
router.post('/login', authController.login);

export default router;
