const router = require('express').Router();
const controller = require('../controllers/profile.controller');
const { authenticate } = require('../middleware/auth.middleware');

// GET /api/buyers/:buyerId/profile — protected
router.get('/:buyerId/profile', authenticate, controller.getProfile);

// PUT /api/buyers/:buyerId/profile — protected
router.put('/:buyerId/profile', authenticate, controller.updateProfile);

module.exports = router;
