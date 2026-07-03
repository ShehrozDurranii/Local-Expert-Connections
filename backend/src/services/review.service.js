const crypto = require('crypto');
const db = require('../config/database');

/**
 * Retrieve the review submitted for an order.
 * Verifies order ownership by the buyer first.
 *
 * @param {string} buyerId - Authenticated buyer UUID
 * @param {string} orderId - Order UUID
 * @returns {Promise<object>} - Review details
 */
exports.getOrderReview = async (buyerId, orderId) => {
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

  // Fetch the review
  const [rows] = await db.query(
    `SELECT id, order_id, buyer_id, expert_id, rating, comment, moderation_status, created_at
     FROM review
     WHERE order_id = ?`,
    [orderId]
  );

  if (rows.length === 0) {
    const error = new Error('Review not found for this order');
    error.status = 404;
    throw error;
  }

  return rows[0];
};

/**
 * Submit a review for a completed/closed order.
 *
 * @param {object} params
 * @param {string} params.buyerId - Authenticated buyer UUID
 * @param {string} params.orderId - Order UUID
 * @param {number} params.rating - 1-5 star rating
 * @param {string|null} params.comment - Review text
 * @returns {Promise<object>} - Created review details
 */
exports.submitReview = async ({ buyerId, orderId, rating, comment }) => {
  // Verify order exists and belongs to the buyer
  const [orderRows] = await db.query('SELECT buyer_id, expert_id, state FROM orders WHERE id = ?', [
    orderId,
  ]);

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

  // Verify order state
  const allowedStates = ['completed', 'closed'];
  if (!allowedStates.includes(orderRows[0].state)) {
    const error = new Error('Order is not completed or closed');
    error.status = 400;
    throw error;
  }

  // Check if review already exists
  const [existingReview] = await db.query('SELECT id FROM review WHERE order_id = ?', [orderId]);

  if (existingReview.length > 0) {
    const error = new Error('A review for this order already exists');
    error.status = 409;
    throw error;
  }

  const reviewId = crypto.randomUUID();

  await db.query(
    `INSERT INTO review (id, order_id, buyer_id, expert_id, rating, comment)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [reviewId, orderId, buyerId, orderRows[0].expert_id, rating, comment || null]
  );

  // Fetch and return the created review
  const [rows] = await db.query(
    `SELECT id, order_id, buyer_id, expert_id, rating, comment, moderation_status, created_at
     FROM review
     WHERE id = ?`,
    [reviewId]
  );

  return rows[0];
};
