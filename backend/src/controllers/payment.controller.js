const paymentService = require('../services/payment.service');

/**
 * POST /api/orders/:orderId/payment
 * Fund escrow for an order.
 */
exports.fundEscrow = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { gateway_reference } = req.body;
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!orderId || !UUID_REGEX.test(orderId)) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ field: 'orderId', message: 'Must be a valid UUID' }],
      });
    }

    // Validate required field
    if (!gateway_reference || typeof gateway_reference !== 'string' || !gateway_reference.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ field: 'gateway_reference', message: 'Gateway reference is required' }],
      });
    }

    const payment = await paymentService.fundEscrow(req.user.id, orderId, gateway_reference.trim());

    return res.status(200).json({
      success: true,
      message: 'Escrow funded successfully',
      data: payment,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

/**
 * GET /api/orders/:orderId/payment
 * Get payment record for an order.
 */
exports.getPayment = async (req, res) => {
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

    const payment = await paymentService.getPayment(req.user.id, orderId);

    return res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};
