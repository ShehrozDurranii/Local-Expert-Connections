const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth.middleware');

// POST /api/orders/:orderId/payment — Fund escrow
router.post('/orders/:orderId/payment', authenticate, paymentController.fundEscrow);

// GET /api/orders/:orderId/payment — Get payment record
router.get('/orders/:orderId/payment', authenticate, paymentController.getPayment);

module.exports = router;
