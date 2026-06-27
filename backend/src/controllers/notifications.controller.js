const service = require('../services/notifications.service');

/**
 * GET /api/buyers/:buyerId/notifications
 * Retrieves the notification preferences of the authenticated buyer.
 */
exports.getPreferences = async (req, res) => {
  try {
    const { buyerId } = req.params;

    // Authorization Check
    if (req.user.id !== buyerId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource',
      });
    }

    const preferences = await service.getPreferences(buyerId);

    res.status(200).json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * PUT /api/buyers/:buyerId/notifications
 * Updates one or more notification preferences for the authenticated buyer.
 * Enforces business rule FR-NOTIF-02: security_alert cannot be disabled.
 */
exports.updatePreferences = async (req, res) => {
  try {
    const { buyerId } = req.params;
    const { preferences } = req.body;

    // Authorization Check
    if (req.user.id !== buyerId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource',
      });
    }

    // Validation Check
    if (!preferences || !Array.isArray(preferences)) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [
          {
            field: 'preferences',
            message: 'Preferences must be an array',
          },
        ],
      });
    }

    const errors = [];

    for (let i = 0; i < preferences.length; i++) {
      const pref = preferences[i];
      const indexStr = `preferences[${i}]`;

      if (!pref.notification_type || !service.NOTIFICATION_TYPES.includes(pref.notification_type)) {
        errors.push({
          field: `${indexStr}.notification_type`,
          message: 'Invalid notification type',
        });
      }

      if (!pref.channel || !service.CHANNELS.includes(pref.channel)) {
        errors.push({
          field: `${indexStr}.channel`,
          message: 'Invalid channel',
        });
      }

      if (pref.is_enabled === undefined || typeof pref.is_enabled !== 'boolean') {
        errors.push({
          field: `${indexStr}.is_enabled`,
          message: 'is_enabled must be a boolean',
        });
      }

      // Enforce Business Rule FR-NOTIF-02
      if (
        pref.notification_type === 'security_alert' &&
        (pref.is_enabled === false || pref.is_enabled === 0)
      ) {
        errors.push({
          field: `${indexStr}.is_enabled`,
          message: 'Security alert notifications cannot be disabled',
        });
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    await service.updatePreferences(buyerId, preferences);

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
