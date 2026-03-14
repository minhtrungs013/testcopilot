import express from 'express';

import menuController from '../controllers/menu/menu.controller.js';

const router = express.Router();

router.get('/', menuController.getMenu);

export default router;
