const express = require('express');
const router = express.Router();
const blocklistController = require('../controllers/blocklist.controller');
const { authenticate } = require('../middleware/auth.middleware');

// GET /api/buyers/:buyerId/blocklist — Get blocklist
router.get('/buyers/:buyerId/blocklist', authenticate, blocklistController.getBlocklist);

// POST /api/buyers/:buyerId/blocklist — Block a user
router.post('/buyers/:buyerId/blocklist', authenticate, blocklistController.blockUser);

// DELETE /api/buyers/:buyerId/blocklist/:blockedUserId — Unblock a user
router.delete(
  '/buyers/:buyerId/blocklist/:blockedUserId',
  authenticate,
  blocklistController.unblockUser
);

module.exports = router;
