import asyncHandler from '../../utils/asyncHandler.js';
import paymentService from '../../services/payment/payment.service.js';

const createPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.createPayment(req.body, req.tenant);
  res.status(201).json(payment);
});

const listPayments = asyncHandler(async (req, res) => {
  const payments = await paymentService.listPayments(req.tenant);
  res.status(200).json(payments);
});

export default {
  createPayment,
  listPayments,
};
