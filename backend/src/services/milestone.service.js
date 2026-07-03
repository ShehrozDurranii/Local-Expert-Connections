const db = require('../config/database');

/**
 * Retrieve the milestone timeline for a specific order.
 * Verifies order ownership by the buyer first.
 *
 * @param {string} buyerId - Authenticated buyer UUID
 * @param {string} orderId - Order UUID
 * @returns {Promise<Array>} - List of milestone transitions
 */
exports.getOrderMilestones = async (buyerId, orderId) => {
  // Verify order exists and belongs to the buyer
  const [orderRows] = await db.query('SELECT buyer_id FROM orders WHERE id = ?', [orderId]);

  if (orderRows.length === 0) {
    const error = new Error('Order not found');
    error.status = 404;
    throw error;
  }

  if (orderRows[0].buyer_id !== buyerId) {
    const error = new Error('You do not have permission to access this resource');
    error.status = 403;
    throw error;
  }

  // Fetch milestones in chronological order
  const [rows] = await db.query(
    `SELECT id, order_id, state, notes, created_at
     FROM milestone
     WHERE order_id = ?
     ORDER BY created_at ASC`,
    [orderId]
  );

  return rows;
};
