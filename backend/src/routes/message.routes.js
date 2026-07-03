const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const { authenticate } = require('../middleware/auth.middleware');

// GET /api/orders/:orderId/messages — Get chat history
router.get('/orders/:orderId/messages', authenticate, messageController.getOrderMessages);

// POST /api/orders/:orderId/messages — Send message
router.post('/orders/:orderId/messages', authenticate, messageController.sendMessage);

module.exports = router;
