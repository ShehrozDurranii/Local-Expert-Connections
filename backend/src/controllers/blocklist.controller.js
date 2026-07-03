const blocklistService = require('../services/blocklist.service');

/**
 * GET /api/buyers/:buyerId/blocklist
 * Get buyer's blocklist.
 */
exports.getBlocklist = async (req, res) => {
  try {
    const { buyerId } = req.params;

    // Ownership check: buyer can only view their own blocklist
    if (req.user.id !== buyerId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource',
      });
    }

    const blocklist = await blocklistService.getBlocklist(buyerId);

    return res.status(200).json({
      success: true,
      data: blocklist,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

/**
 * POST /api/buyers/:buyerId/blocklist
 * Block a user.
 */
exports.blockUser = async (req, res) => {
  try {
    const { buyerId } = req.params;
    const { blocked_user_id, blocked_role } = req.body;

    // Ownership check
    if (req.user.id !== buyerId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource',
      });
    }

    // Validate inputs
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!blocked_user_id || !UUID_REGEX.test(blocked_user_id)) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ field: 'blocked_user_id', message: 'Must be a valid UUID' }],
      });
    }

    const validRoles = ['buyer', 'expert'];
    if (!blocked_role || !validRoles.includes(blocked_role)) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ field: 'blocked_role', message: 'Role must be either buyer or expert' }],
      });
    }

    const blockEntry = await blocklistService.blockUser({
      buyerId,
      blockedUserId: blocked_user_id,
      blockedRole: blocked_role,
    });

    return res.status(201).json({
      success: true,
      message: 'User blocked successfully',
      data: blockEntry,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

/**
 * DELETE /api/buyers/:buyerId/blocklist/:blockedUserId
 * Unblock a user.
 */
exports.unblockUser = async (req, res) => {
  try {
    const { buyerId, blockedUserId } = req.params;

    // Ownership check
    if (req.user.id !== buyerId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource',
      });
    }

    await blocklistService.unblockUser(buyerId, blockedUserId);

    return res.status(200).json({
      success: true,
      message: 'User unblocked successfully',
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};
