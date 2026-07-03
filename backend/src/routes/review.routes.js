const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { authenticate } = require('../middleware/auth.middleware');

// GET /api/orders/:orderId/review — Get order review
router.get('/orders/:orderId/review', authenticate, reviewController.getOrderReview);

// POST /api/orders/:orderId/review — Submit review
router.post('/orders/:orderId/review', authenticate, reviewController.submitReview);

module.exports = router;
