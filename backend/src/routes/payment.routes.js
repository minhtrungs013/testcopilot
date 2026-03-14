import express from 'express';

import paymentController from '../controllers/payment/payment.controller.js';

const router = express.Router();

router.post('/', paymentController.createPayment);
router.get('/', paymentController.listPayments);

export default router;
