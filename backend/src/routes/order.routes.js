const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticate } = require('../middleware/auth.middleware');

// GET /api/buyers/:buyerId/orders — List all orders for a buyer
router.get('/buyers/:buyerId/orders', authenticate, orderController.getBuyerOrders);

// GET /api/orders/:orderId — Get order details
router.get('/orders/:orderId', authenticate, orderController.getOrderById);

module.exports = router;
