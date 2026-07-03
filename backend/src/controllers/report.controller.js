const reportService = require('../services/report.service');

/**
 * POST /api/reports
 * File an abuse report.
 */
exports.fileReport = async (req, res) => {
  try {
    const { order_id, reported_user_id, reported_role, category, evidence_notes } = req.body;

    // Validate UUIDs
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!order_id || !UUID_REGEX.test(order_id)) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ field: 'order_id', message: 'Must be a valid UUID' }],
      });
    }

    if (!reported_user_id || !UUID_REGEX.test(reported_user_id)) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ field: 'reported_user_id', message: 'Must be a valid UUID' }],
      });
    }

    // Validate role
    const validRoles = ['buyer', 'expert'];
    if (!reported_role || !validRoles.includes(reported_role)) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ field: 'reported_role', message: 'Role must be either buyer or expert' }],
      });
    }

    // Validate category
    const validCategories = ['fraud', 'harassment', 'prohibited_item', 'fake_proof', 'other'];
    if (!category || !validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [
          { field: 'category', message: `Category must be one of: ${validCategories.join(', ')}` },
        ],
      });
    }

    const report = await reportService.createReport({
      reporterId: req.user.id,
      orderId: order_id,
      reportedUserId: reported_user_id,
      reportedRole: reported_role,
      category,
      evidenceNotes: evidence_notes ? evidence_notes.trim() : null,
    });

    return res.status(201).json({
      success: true,
      message: 'Your report has been submitted. Our team will review it within 24 hours.',
      data: report,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};
