const router = require('express').Router();
const controller = require('../controllers/request.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/', authenticate, controller.getRequests);
router.get('/:id', authenticate, controller.getRequestById);
router.post('/', authenticate, controller.createRequest);
router.patch('/:requestId/cancel', authenticate, controller.cancelRequest);

module.exports = router;
