const orderService = require('../services/order.service');

/**
 * GET /api/buyers/:buyerId/orders
 * List all orders for a buyer with optional state filter and pagination.
 */
exports.getBuyerOrders = async (req, res) => {
  try {
    const { buyerId } = req.params;

    // Ownership check: buyer can only view their own orders
    if (req.user.id !== buyerId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource',
      });
    }

    const state = req.query.state || null;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);

    const result = await orderService.getBuyerOrders(buyerId, state, page, limit);

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
