const service = require('../services/profile.service');

/**
 * GET /api/buyers/:buyerId/profile
 * Retrieves full profile details of the authenticated buyer.
 */
exports.getProfile = async (req, res) => {
  try {
    const { buyerId } = req.params;

    // Authorization: Only the user can view their own profile
    if (req.user.id !== buyerId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource',
      });
    }

    const profile = await service.getByBuyerId(buyerId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Buyer profile not found',
      });
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * PUT /api/buyers/:buyerId/profile
 * Performs a partial update on the buyer's profile info.
 */
exports.updateProfile = async (req, res) => {
  try {
    const { buyerId } = req.params;
    const updateData = req.body;

    // Authorization: Only the user can update their own profile
    if (req.user.id !== buyerId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource',
      });
    }

    // Input Validation
    const errors = [];

    if (updateData.photo_url) {
      try {
        new URL(updateData.photo_url);
      } catch (err) {
        errors.push({
          field: 'photo_url',
          message: 'Must be a valid URI',
        });
      }
    }

    if (updateData.name !== undefined && updateData.name.trim().length < 2) {
      errors.push({
        field: 'name',
        message: 'Name must be at least 2 characters',
      });
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    const updated = await service.updateByBuyerId(buyerId, updateData);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Buyer profile not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
