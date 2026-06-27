const service = require('../services/saved-experts.service');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUUID(uuid) {
  return UUID_REGEX.test(uuid);
}

/**
 * GET /api/buyers/:buyerId/saved-experts
 * Returns the paginated list of bookmarked experts for this buyer.
 */
exports.getSavedExperts = async (req, res) => {
  try {
    const { buyerId } = req.params;
    const { page, limit } = req.query;

    // Authorization Check
    if (req.user.id !== buyerId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource',
      });
    }

    const result = await service.listSaved(buyerId, page, limit);

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Error listing saved experts:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * POST /api/buyers/:buyerId/saved-experts
 * Bookmarks an expert profile for later reference.
 */
exports.saveExpert = async (req, res) => {
  try {
    const { buyerId } = req.params;
    const { expert_id } = req.body;

    // Authorization Check
    if (req.user.id !== buyerId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource',
      });
    }

    // Input Validation
    if (!expert_id || !isValidUUID(expert_id)) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [
          {
            field: 'expert_id',
            message: 'Must be a valid UUID',
          },
        ],
      });
    }

    await service.saveExpert(buyerId, expert_id);

    res.status(201).json({
      success: true,
      message: 'Expert saved to bookmarks',
    });
  } catch (error) {
    console.error('Error saving expert:', error);

    const status = error.status || 500;
    res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * DELETE /api/buyers/:buyerId/saved-experts/:expertId
 * Removes an expert bookmark.
 */
exports.removeSavedExpert = async (req, res) => {
  try {
    const { buyerId, expertId } = req.params;

    // Authorization Check
    if (req.user.id !== buyerId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource',
      });
    }

    // Input Validation
    if (!expertId || !isValidUUID(expertId)) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [
          {
            field: 'expertId',
            message: 'Must be a valid UUID in path parameters',
          },
        ],
      });
    }

    const removed = await service.removeExpert(buyerId, expertId);

    if (!removed) {
      return res.status(404).json({
        success: false,
        message: 'Expert not found in saved list',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Expert removed from saved list',
    });
  } catch (error) {
    console.error('Error removing saved expert:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
