const express = require('express');
const router = express.Router();
const milestoneController = require('../controllers/milestone.controller');
const { authenticate } = require('../middleware/auth.middleware');

// GET /api/orders/:orderId/milestones — Get milestone timeline for an order
router.get('/orders/:orderId/milestones', authenticate, milestoneController.getOrderMilestones);

module.exports = router;
