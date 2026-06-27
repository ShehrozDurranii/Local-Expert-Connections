const router = require('express').Router();
const controller = require('../controllers/notifications.controller');
const { authenticate } = require('../middleware/auth.middleware');

// GET /api/buyers/:buyerId/notifications — protected
router.get('/:buyerId/notifications', authenticate, controller.getPreferences);

// PUT /api/buyers/:buyerId/notifications — protected
router.put('/:buyerId/notifications', authenticate, controller.updatePreferences);

module.exports = router;
