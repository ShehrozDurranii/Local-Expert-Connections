const service = require('../services/request.service');

exports.getRequests = async (req, res) => {
  res.json(await service.getAll());
};

exports.createRequest = async (req, res) => {
  try {
    const result = await service.create(req.body);

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
