const router = require('express').Router();
const controller = require('../controllers/saved-experts.controller');
const { authenticate } = require('../middleware/auth.middleware');

// GET /api/buyers/:buyerId/saved-experts — protected
router.get('/:buyerId/saved-experts', authenticate, controller.getSavedExperts);

// POST /api/buyers/:buyerId/saved-experts — protected
router.post('/:buyerId/saved-experts', authenticate, controller.saveExpert);

// DELETE /api/buyers/:buyerId/saved-experts/:expertId — protected
router.delete('/:buyerId/saved-experts/:expertId', authenticate, controller.removeSavedExpert);

module.exports = router;
