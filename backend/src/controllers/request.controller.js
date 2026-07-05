const service = require('../services/request.service');

exports.getRequests = async (req, res) => {
  res.json(await service.getAll());
};

exports.createRequest = async (req, res) => {
  try {
    const { city_id, category_id, description, budget, timeline } = req.body;

    const errors = [];
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    // Validate city_id
    if (!city_id || !UUID_REGEX.test(city_id)) {
      errors.push({ field: 'city_id', message: 'Must be a valid UUID' });
    }

    // Validate category_id
    if (!category_id || !UUID_REGEX.test(category_id)) {
      errors.push({ field: 'category_id', message: 'Must be a valid UUID' });
    }

    // Validate description
    if (!description || typeof description !== 'string' || description.trim().length < 20) {
      errors.push({
        field: 'description',
        message: 'Description must be at least 20 characters long',
      });
    }

    // Validate budget
    if (budget === undefined || budget === null || typeof budget !== 'number' || budget < 0) {
      errors.push({ field: 'budget', message: 'Budget must be a non-negative number' });
    }

    // Validate timeline
    if (!timeline || isNaN(Date.parse(timeline))) {
      errors.push({ field: 'timeline', message: 'Timeline must be a valid date-time string' });
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    const result = await service.create({
      ...req.body,
      buyer_id: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: 'Request created and submitted successfully',
      data: result,
    });
  } catch (error) {
    console.error(error);

    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

exports.getRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!id || !UUID_REGEX.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ field: 'id', message: 'Must be a valid UUID' }],
      });
    }

    const result = await service.getById(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(error);

    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

exports.cancelRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!requestId || !UUID_REGEX.test(requestId)) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ field: 'requestId', message: 'Must be a valid UUID' }],
      });
    }

    const result = await service.cancelRequest(requestId, req.user.id);

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);

    return res.status(error.status || 400).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

exports.getBuyerRequests = async (req, res) => {
  try {
    const { buyerId } = req.params;
    const { status } = req.query;
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    // Validate buyerId
    if (!buyerId || !UUID_REGEX.test(buyerId)) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ field: 'buyerId', message: 'Must be a valid UUID' }],
      });
    }

    // Ownership check: buyer can only view their own requests
    if (req.user.id !== buyerId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource',
      });
    }

    // Validate status query param (if provided)
    const validStatuses = ['draft', 'submitted', 'offered', 'accepted', 'cancelled', 'closed'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [
          { field: 'status', message: `Status must be one of: ${validStatuses.join(', ')}` },
        ],
      });
    }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);

    const result = await service.getBuyerRequests(buyerId, status || null, page, limit);

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
