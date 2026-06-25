const router = require('express').Router();
const controller = require('../controllers/request.controller');

router.get('/', controller.getRequests);
router.get('/:id', controller.getRequestById);
router.post('/', controller.createRequest);
router.patch('/:requestId/cancel', controller.cancelRequest);

module.exports = router;
