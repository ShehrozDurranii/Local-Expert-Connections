const express = require('express');
const router = express.Router();
const attachmentController = require('../controllers/attachment.controller');
const { authenticate } = require('../middleware/auth.middleware');

// GET /api/orders/:orderId/attachments — List non-quarantined attachments
router.get('/orders/:orderId/attachments', authenticate, attachmentController.getOrderAttachments);

// POST /api/orders/:orderId/attachments — Upload a file attachment
router.post(
  '/orders/:orderId/attachments',
  authenticate,
  attachmentController.uploadMiddleware,
  attachmentController.uploadAttachment
);

module.exports = router;
