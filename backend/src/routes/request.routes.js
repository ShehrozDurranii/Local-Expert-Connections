const express = require('express');
const router = express.Router();
const controller = require('../controllers/request.controller');
const { authenticate } = require('../middleware/auth.middleware');

// GET /api/buyers/:buyerId/requests — List all requests by a buyer
router.get('/buyers/:buyerId/requests', authenticate, controller.getBuyerRequests);

// GET /api/requests — Get all requests
router.get('/requests', authenticate, controller.getRequests);

// GET /api/requests/:id — Get request by ID
router.get('/requests/:id', authenticate, controller.getRequestById);

// POST /api/requests — Create request
router.post('/requests', authenticate, controller.createRequest);

// PATCH /api/requests/:requestId/cancel — Cancel request
router.patch('/requests/:requestId/cancel', authenticate, controller.cancelRequest);

module.exports = router;
