import express from 'express';

import tableController from '../controllers/table/table.controller.js';

const router = express.Router();

router.get('/resolve/:tableNumber', tableController.resolveTableByNumber);
router.post('/', tableController.createTable);
router.get('/', tableController.listTables);
router.put('/:tableId', tableController.updateTable);
router.delete('/:tableId', tableController.deleteTable);

export default router;
