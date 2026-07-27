const milestoneService = require('../services/milestone.service');

/**
 * GET /api/orders/:orderId/milestones
 * Get milestone timeline for an order.
 */
exports.getOrderMilestones = async (req, res) => {
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

    const milestones = await milestoneService.getOrderMilestones(req.user.id, orderId);

    return res.status(200).json({
      success: true,
      data: milestones,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};
