const jwt = require('jsonwebtoken');

/**
 * Authentication middleware — verifies JWT Bearer token.
 *
 * Reads the Authorization header, validates the token signature and expiry,
 * then attaches the decoded payload to `req.user` for downstream use.
 *
 * Expected header format:
 *   Authorization: Bearer <token>
 *
 * Attached payload:
 *   req.user = { id: "<buyer_uuid>", role: "buyer" }
 */
exports.authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authorization token is required',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid or malformed token',
    });
  }
};
