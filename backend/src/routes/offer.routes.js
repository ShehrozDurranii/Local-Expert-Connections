const router = require('express').Router();
const controller = require('../controllers/offer.controller');
const { authenticate } = require('../middleware/auth.middleware');

// GET /api/requests/:requestId/offers — protected
router.get('/requests/:requestId/offers', authenticate, controller.getOffers);

// POST /api/offers/:offerId/accept — protected
router.post('/offers/:offerId/accept', authenticate, controller.acceptOffer);

// POST /api/offers/:offerId/decline — protected
router.post('/offers/:offerId/decline', authenticate, controller.declineOffer);

module.exports = router;
