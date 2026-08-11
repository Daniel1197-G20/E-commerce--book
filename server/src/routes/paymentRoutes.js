const express = require('express');
const paymentService = require('../services/paymentService');
const { protect } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');

const router = express.Router();

router.post('/initialize', protect, asyncHandler(async (req, res) => {
  const result = await paymentService.initializePayment(req.user.id, req.body);
  success(res, result, 'Payment initialized');
}));

router.get('/verify/:reference', protect, asyncHandler(async (req, res) => {
  const result = await paymentService.confirmPayment(req.params.reference);
  success(res, result, 'Payment verified');
}));

// Webhook — no auth, Paystack signature verified via HMAC SHA512
router.post('/webhook', asyncHandler(async (req, res) => {
  const signature = req.headers['x-paystack-signature'];
  await paymentService.handleWebhook(req.body, signature, req.rawBody);
  res.status(200).send('OK');
}));

module.exports = router;
