const service = require('../services/request.service');

exports.getRequests = async (req, res) => {
  res.json(await service.getAll());
};

exports.createRequest = async (req, res) => {
  try {
    const result = await service.create({
      ...req.body,
      buyer_id: req.user.id,
    });

    res.status(201).json(result);
    console.log(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
};

exports.getRequestById = async (req, res) => {
  try {
    const result = await service.getById(req.params.id);

    res.status(200).json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
};

exports.cancelRequest = async (req, res) => {
  try {
    const result = await service.cancelRequest(req.params.requestId);

    res.status(200).json(result);
  } catch (error) {
    console.error(error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getBuyerRequests = async (req, res) => {
  try {
    const { buyerId } = req.params;

    // Ownership check: buyer can only view their own requests
    if (req.user.id !== buyerId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource',
      });
    }

    const status = req.query.status || null;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);

    const result = await service.getBuyerRequests(buyerId, status, page, limit);

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
