const messageService = require('../services/message.service');

/**
 * GET /api/orders/:orderId/messages
 * Get paginated chat history for an order.
 */
exports.getOrderMessages = async (req, res) => {
  try {
    const { orderId } = req.params;
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!orderId || !UUID_REGEX.test(orderId)) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ field: 'orderId', message: 'Must be a valid UUID' }],
      });
    }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);

    const result = await messageService.getOrderMessages(req.user.id, orderId, page, limit);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

/**
 * POST /api/orders/:orderId/messages
 * Send a new chat message.
 */
exports.sendMessage = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { content } = req.body;
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!orderId || !UUID_REGEX.test(orderId)) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ field: 'orderId', message: 'Must be a valid UUID' }],
      });
    }

    // Validate content
    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ field: 'content', message: 'Message content is required' }],
      });
    }

    if (content.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ field: 'content', message: 'Message content must not exceed 2000 characters' }],
      });
    }

    const message = await messageService.sendMessage(req.user.id, orderId, content.trim());

    return res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};
