const crypto = require('crypto');
const db = require('../config/database');

/**
 * Fund escrow for an order.
 * Order must be in 'accepted' state. Creates a payment record and moves order to 'funded'.
 *
 * @param {string} buyerId - Authenticated buyer UUID
 * @param {string} orderId - Order UUID
 * @param {string} gatewayReference - Transaction ID from external payment gateway
 * @returns {Promise<object>} - Created payment record
 */
exports.fundEscrow = async (buyerId, orderId, gatewayReference) => {
  // Verify order exists and buyer owns it
  const [orderRows] = await db.query(
    'SELECT id, buyer_id, offer_id, state FROM orders WHERE id = ?',
    [orderId]
  );

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

  if (orderRows[0].state !== 'accepted') {
    const error = new Error('Order is not in accepted state. Cannot fund escrow.');
    error.status = 400;
    throw error;
  }

  // Check if payment already exists for this order
  const [existingPayment] = await db.query('SELECT id FROM payment WHERE order_id = ?', [orderId]);

  if (existingPayment.length > 0) {
    const error = new Error('Escrow has already been funded for this order');
    error.status = 400;
    throw error;
  }

  // Get the offer price to calculate payment amounts
  const [offerRows] = await db.query('SELECT price FROM offer WHERE id = ?', [
    orderRows[0].offer_id,
  ]);
  const baseAmount = Number(offerRows[0].price);
  const platformFee = 0.0; // Platform fee logic can be added later
  const totalAmount = baseAmount + platformFee;

  const paymentId = crypto.randomUUID();
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Insert payment record with captured status
    await connection.query(
      `INSERT INTO payment (id, order_id, base_amount, platform_fee, total_amount, escrow_status, gateway_reference, captured_at)
       VALUES (?, ?, ?, ?, ?, 'captured', ?, NOW())`,
      [paymentId, orderId, baseAmount, platformFee, totalAmount, gatewayReference]
    );

    // 2. Update order state to funded
    await connection.query("UPDATE orders SET state = 'funded' WHERE id = ?", [orderId]);

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  // Return the created payment record
  const [paymentRows] = await db.query(
    `SELECT id, order_id, base_amount, platform_fee, total_amount, escrow_status, gateway_reference, captured_at, released_at, refund_amount
     FROM payment WHERE id = ?`,
    [paymentId]
  );

  return {
    ...paymentRows[0],
    base_amount: Number(paymentRows[0].base_amount),
    platform_fee: Number(paymentRows[0].platform_fee),
    total_amount: Number(paymentRows[0].total_amount),
  };
};

/**
 * Get payment record for an order.
 *
 * @param {string} buyerId - Authenticated buyer UUID
 * @param {string} orderId - Order UUID
 * @returns {Promise<object>} - Payment record
 */
exports.getPayment = async (buyerId, orderId) => {
  // Verify order exists and buyer owns it
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

  const [rows] = await db.query(
    `SELECT id, order_id, base_amount, platform_fee, total_amount, escrow_status, gateway_reference, captured_at, released_at, refund_amount
     FROM payment WHERE order_id = ?`,
    [orderId]
  );

  if (rows.length === 0) {
    const error = new Error('No payment record found for this order');
    error.status = 404;
    throw error;
  }

  return {
    ...rows[0],
    base_amount: Number(rows[0].base_amount),
    platform_fee: Number(rows[0].platform_fee),
    total_amount: Number(rows[0].total_amount),
  };
};
