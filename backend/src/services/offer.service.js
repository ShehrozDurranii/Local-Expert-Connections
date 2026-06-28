const crypto = require('crypto');
const db = require('../config/database');

/**
 * Retrieve all expert offers submitted for a given request.
 * Verifies request ownership first.
 *
 * @param {string} buyerId - Authenticated buyer ID
 * @param {string} requestId - Request UUID
 * @returns {Promise<Array>} - List of offers
 */
exports.getOffersByRequestId = async (buyerId, requestId) => {
  // Verify request exists and is owned by the buyer
  const [requestRows] = await db.query('SELECT buyer_id FROM request WHERE id = ?', [requestId]);

  if (requestRows.length === 0) {
    const error = new Error('Request not found');
    error.status = 404;
    throw error;
  }

  if (requestRows[0].buyer_id !== buyerId) {
    const error = new Error('You do not have permission to access this resource');
    error.status = 403;
    throw error;
  }

  // Get offers
  const [rows] = await db.query(
    `SELECT id, request_id, expert_id, price, eta, scope_notes, status, created_at
     FROM offer
     WHERE request_id = ?
     ORDER BY created_at DESC`,
    [requestId]
  );

  // Convert decimal to number for price
  return rows.map((row) => ({
    ...row,
    price: Number(row.price),
  }));
};

/**
 * Accepts a specific expert offer.
 * Changes offer state, declines competing offers, creates order, and changes request state inside a transaction.
 *
 * @param {string} buyerId - Authenticated buyer ID
 * @param {string} offerId - Offer UUID
 * @returns {Promise<object>} - Created order details
 */
exports.acceptOffer = async (buyerId, offerId) => {
  // Query offer and join request to verify ownership and collect details
  const [rows] = await db.query(
    `SELECT o.id, o.status, o.expert_id, o.request_id, r.buyer_id
     FROM offer o
     JOIN request r ON o.request_id = r.id
     WHERE o.id = ?`,
    [offerId]
  );

  if (rows.length === 0) {
    const error = new Error('Offer not found');
    error.status = 404;
    throw error;
  }

  const offer = rows[0];

  if (offer.buyer_id !== buyerId) {
    const error = new Error('You do not have permission to access this resource');
    error.status = 403;
    throw error;
  }

  if (offer.status !== 'pending') {
    const error = new Error('Offer is already accepted, declined, or expired');
    error.status = 400;
    throw error;
  }

  const orderId = crypto.randomUUID();
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Update this offer status to accepted
    await connection.query("UPDATE offer SET status = 'accepted' WHERE id = ?", [offerId]);

    // 2. Decline all other pending offers on the same request
    await connection.query(
      "UPDATE offer SET status = 'declined' WHERE request_id = ? AND id != ? AND status = 'pending'",
      [offer.request_id, offerId]
    );

    // 3. Create a new order record
    await connection.query(
      `INSERT INTO orders (id, buyer_id, expert_id, offer_id, state) 
       VALUES (?, ?, ?, ?, 'accepted')`,
      [orderId, buyerId, offer.expert_id, offerId]
    );

    // 4. Update request status to accepted
    await connection.query("UPDATE request SET status = 'accepted' WHERE id = ?", [
      offer.request_id,
    ]);

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  // Fetch the newly created order to return
  const [orderRows] = await db.query(
    `SELECT id, buyer_id, expert_id, offer_id, state, created_at, completed_at, cancelled_at
     FROM orders
     WHERE id = ?`,
    [orderId]
  );

  return orderRows[0];
};

/**
 * Declines a specific expert offer.
 *
 * @param {string} buyerId - Authenticated buyer ID
 * @param {string} offerId - Offer UUID
 * @returns {Promise<boolean>} - True if declined successfully
 */
exports.declineOffer = async (buyerId, offerId) => {
  // Query offer and join request to verify ownership and collect details
  const [rows] = await db.query(
    `SELECT o.id, o.status, r.buyer_id
     FROM offer o
     JOIN request r ON o.request_id = r.id
     WHERE o.id = ?`,
    [offerId]
  );

  if (rows.length === 0) {
    const error = new Error('Offer not found');
    error.status = 404;
    throw error;
  }

  const offer = rows[0];

  if (offer.buyer_id !== buyerId) {
    const error = new Error('You do not have permission to access this resource');
    error.status = 403;
    throw error;
  }

  if (offer.status !== 'pending') {
    const error = new Error('Offer is already accepted, declined, or expired');
    error.status = 400;
    throw error;
  }

  await db.query("UPDATE offer SET status = 'declined' WHERE id = ?", [offerId]);

  return true;
};
