const service = require('../services/auth.service');

/**
 * POST /api/buyers/register
 * Creates a new buyer account and returns a JWT token.
 */
exports.register = async (req, res) => {
  try {
    const result = await service.register(req.body);

    res.status(201).json(result);
  } catch (error) {
    console.error('Register error:', error.message);

    const status = error.status || 500;

    res.status(status).json({
      success: false,
      message: error.message,
      errors: error.errors || undefined,
    });
  }
};

/**
 * POST /api/buyers/login
 * Authenticates a buyer and returns a JWT token.
 */
exports.login = async (req, res) => {
  try {
    const result = await service.login(req.body);

    res.status(200).json(result);
  } catch (error) {
    console.error('Login error:', error.message);

    const status = error.status || 500;

    res.status(status).json({
      success: false,
      message: error.message,
      errors: error.errors || undefined,
    });
  }
};
