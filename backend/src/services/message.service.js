const crypto = require('crypto');
const db = require('../config/database');

/**
 * Retrieve paginated chat messages for an order, sorted by timestamp ascending.
 * Verifies order ownership by the buyer first.
 *
 * @param {string} buyerId - Authenticated buyer UUID
 * @param {string} orderId - Order UUID
 * @param {number} page - Page number (1-indexed)
 * @param {number} limit - Messages per page
 * @returns {Promise<object>} - Paginated messages
 */
exports.getOrderMessages = async (buyerId, orderId, page, limit) => {
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

  const offset = (page - 1) * limit;

  // Count total messages
  const [countRows] = await db.query('SELECT COUNT(*) AS total FROM message WHERE order_id = ?', [
    orderId,
  ]);
  const total = countRows[0].total;

  // Retrieve messages sorted ascending by timestamp (or ID if timestamps match)
  const [rows] = await db.query(
    `SELECT id, order_id, sender_id, sender_role, content, is_reported, timestamp
     FROM message
     WHERE order_id = ?
     ORDER BY timestamp ASC, id ASC
     LIMIT ? OFFSET ?`,
    [orderId, limit, offset]
  );

  // Map boolean flag correctly
  const data = rows.map((row) => ({
    ...row,
    is_reported: !!row.is_reported,
  }));

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Send a new chat message for an order.
 * Verifies order ownership by the buyer.
 *
 * @param {string} buyerId - Authenticated buyer UUID
 * @param {string} orderId - Order UUID
 * @param {string} content - Message text
 * @returns {Promise<object>} - Created message details
 */
exports.sendMessage = async (buyerId, orderId, content) => {
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

  const messageId = crypto.randomUUID();

  await db.query(
    `INSERT INTO message (id, order_id, sender_id, sender_role, content)
     VALUES (?, ?, ?, 'buyer', ?)`,
    [messageId, orderId, buyerId, content]
  );

  // Fetch and return the created message
  const [messageRows] = await db.query(
    `SELECT id, order_id, sender_id, sender_role, content, is_reported, timestamp
     FROM message
     WHERE id = ?`,
    [messageId]
  );

  return {
    ...messageRows[0],
    is_reported: !!messageRows[0].is_reported,
  };
};
