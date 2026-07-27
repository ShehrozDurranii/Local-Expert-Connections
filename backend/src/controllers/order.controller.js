const orderService = require('../services/order.service');

/**
 * GET /api/buyers/:buyerId/orders
 * List all orders for a buyer with optional state filter and pagination.
 */
exports.getBuyerOrders = async (req, res) => {
  try {
    const { buyerId } = req.params;
    const { state } = req.query;
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    // Validate buyerId
    if (!buyerId || !UUID_REGEX.test(buyerId)) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ field: 'buyerId', message: 'Must be a valid UUID' }],
      });
    }

    // Ownership check: buyer can only view their own orders
    if (req.user.id !== buyerId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource',
      });
    }

    // Validate state query param (if provided)
    const validStates = [
      'accepted',
      'funded',
      'in_progress',
      'proof_submitted',
      'completed',
      'disputed',
      'refunded',
      'cancelled',
      'closed',
    ];
    if (state && !validStates.includes(state)) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ field: 'state', message: `State must be one of: ${validStates.join(', ')}` }],
      });
    }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);

    const result = await orderService.getBuyerOrders(buyerId, state || null, page, limit);

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
 * GET /api/orders/:orderId
 * Get order details by ID.
 */
exports.getOrderById = async (req, res) => {
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

    const order = await orderService.getOrderById(req.user.id, orderId);

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};
