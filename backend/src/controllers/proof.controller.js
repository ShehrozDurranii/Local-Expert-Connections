const proofService = require('../services/proof.service');

/**
 * GET /api/orders/:orderId/proof
 * Get proof submission for an order.
 */
exports.getProof = async (req, res) => {
  try {
    const { orderId } = req.params;
    const proof = await proofService.getProofByOrderId(req.user.id, orderId);

    return res.status(200).json({
      success: true,
      data: proof,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

/**
 * POST /api/orders/:orderId/proof/:proofId/approve
 * Approve proof submission.
 */
exports.approveProof = async (req, res) => {
  try {
    const { orderId, proofId } = req.params;
    await proofService.approveProof(req.user.id, orderId, proofId);

    return res.status(200).json({
      success: true,
      message: 'Proof approved. Payment released to expert.',
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

/**
 * POST /api/orders/:orderId/proof/:proofId/reject
 * Reject proof submission.
 */
exports.rejectProof = async (req, res) => {
  try {
    const { orderId, proofId } = req.params;
    const { rejection_reason } = req.body;

    // Validate rejection reason
    if (
      !rejection_reason ||
      typeof rejection_reason !== 'string' ||
      rejection_reason.trim().length < 10
    ) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [
          {
            field: 'rejection_reason',
            message: 'Rejection reason must be at least 10 characters long',
          },
        ],
      });
    }

    await proofService.rejectProof(req.user.id, orderId, proofId, rejection_reason.trim());

    return res.status(200).json({
      success: true,
      message: 'Proof rejected. Expert notified to resubmit.',
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};
