const express = require('express');
const router = express.Router();
const proofController = require('../controllers/proof.controller');
const { authenticate } = require('../middleware/auth.middleware');

// GET /api/orders/:orderId/proof — Get proof submission
router.get('/orders/:orderId/proof', authenticate, proofController.getProof);

// POST /api/orders/:orderId/proof/:proofId/approve — Approve proof
router.post('/orders/:orderId/proof/:proofId/approve', authenticate, proofController.approveProof);

// POST /api/orders/:orderId/proof/:proofId/reject — Reject proof
router.post('/orders/:orderId/proof/:proofId/reject', authenticate, proofController.rejectProof);

module.exports = router;
