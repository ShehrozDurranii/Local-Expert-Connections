const db = require('../config/database');

/**
 * List all orders for a buyer with optional state filter and pagination.
 *
 * @param {string} buyerId - Authenticated buyer UUID
 * @param {string|null} state - Optional order state filter
 * @param {number} page - Page number (1-indexed)
 * @param {number} limit - Results per page
 * @returns {Promise<object>} - Paginated orders list
 */
exports.getBuyerOrders = async (buyerId, state, page, limit) => {
  const offset = (page - 1) * limit;

  let countQuery = 'SELECT COUNT(*) AS total FROM orders WHERE buyer_id = ?';
  let dataQuery = `SELECT id, buyer_id, expert_id, offer_id, state, created_at, completed_at, cancelled_at
     FROM orders WHERE buyer_id = ?`;
  const params = [buyerId];

  if (state) {
    countQuery += ' AND state = ?';
    dataQuery += ' AND state = ?';
    params.push(state);
  }

  dataQuery += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';

  const [countRows] = await db.query(countQuery, params);
  const total = countRows[0].total;

  const dataParams = [...params, limit, offset];
  const [rows] = await db.query(dataQuery, dataParams);

  return {
    data: rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get a single order by ID with ownership verification.
 *
 * @param {string} buyerId - Authenticated buyer UUID
 * @param {string} orderId - Order UUID
 * @returns {Promise<object>} - Order details
 */
exports.getOrderById = async (buyerId, orderId) => {
  const [rows] = await db.query(
    `SELECT id, buyer_id, expert_id, offer_id, state, created_at, completed_at, cancelled_at
     FROM orders
     WHERE id = ?`,
    [orderId]
  );

  if (rows.length === 0) {
    const error = new Error('Order not found');
    error.status = 404;
    throw error;
  }

  if (rows[0].buyer_id !== buyerId) {
    const error = new Error('You do not have permission to access this resource');
    error.status = 403;
    throw error;
  }

  return rows[0];
};
