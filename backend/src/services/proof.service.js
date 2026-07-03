const db = require('../config/database');

/**
 * Retrieve the submitted proof of service for a specific order.
 * Available when the order has a proof record.
 *
 * @param {string} buyerId - Authenticated buyer UUID
 * @param {string} orderId - Order UUID
 * @returns {Promise<object>} - Proof details with non-quarantined attachments
 */
exports.getProofByOrderId = async (buyerId, orderId) => {
  // Verify order exists and belongs to the buyer
  const [orderRows] = await db.query('SELECT buyer_id, state FROM orders WHERE id = ?', [orderId]);

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

  // Fetch the proof submission
  const [proofRows] = await db.query(
    `SELECT id, order_id, milestone_id, notes, approval_status, rejection_reason, submitted_at
     FROM proof
     WHERE order_id = ?
     ORDER BY submitted_at DESC LIMIT 1`,
    [orderId]
  );

  if (proofRows.length === 0) {
    const error = new Error('Proof submission not found for this order');
    error.status = 404;
    throw error;
  }

  const proof = proofRows[0];

  // Fetch non-quarantined attachments linked to this proof
  const [attachmentRows] = await db.query(
    `SELECT id, file_url, file_type, file_size_bytes, scan_status, uploader_role, created_at
     FROM attachment
     WHERE proof_id = ? AND scan_status != 'quarantined'`,
    [proof.id]
  );

  proof.attachments = attachmentRows.map((att) => ({
    ...att,
    file_size_bytes: att.file_size_bytes ? Number(att.file_size_bytes) : null,
  }));

  return proof;
};

/**
 * Approve the proof of service for an order.
 * Triggers state updates in a transaction.
 *
 * @param {string} buyerId - Authenticated buyer UUID
 * @param {string} orderId - Order UUID
 * @param {string} proofId - Proof UUID
 * @returns {Promise<boolean>} - Success flag
 */
exports.approveProof = async (buyerId, orderId, proofId) => {
  // Verify order and proof exist and belong to the buyer
  const [orderRows] = await db.query('SELECT buyer_id, state FROM orders WHERE id = ?', [orderId]);

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

  const [proofRows] = await db.query(
    'SELECT id, approval_status FROM proof WHERE id = ? AND order_id = ?',
    [proofId, orderId]
  );

  if (proofRows.length === 0) {
    const error = new Error('Proof not found');
    error.status = 404;
    throw error;
  }

  if (proofRows[0].approval_status !== 'pending') {
    const error = new Error('Proof is not in pending state');
    error.status = 400;
    throw error;
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Update proof approval status
    await connection.query(`UPDATE proof SET approval_status = 'approved' WHERE id = ?`, [proofId]);

    // 2. Update payment escrow status to 'released' and set released_at
    await connection.query(
      `UPDATE payment SET escrow_status = 'released', released_at = NOW() WHERE order_id = ?`,
      [orderId]
    );

    // 3. Update order state to 'completed' and set completed_at
    await connection.query(
      `UPDATE orders SET state = 'completed', completed_at = NOW() WHERE id = ?`,
      [orderId]
    );

    // 4. Update request status to 'closed' since order is completed
    const [requestRows] = await db.query(
      `SELECT r.id FROM request r JOIN offer o ON o.request_id = r.id JOIN orders ord ON ord.offer_id = o.id WHERE ord.id = ?`,
      [orderId]
    );
    if (requestRows.length > 0) {
      await connection.query(`UPDATE request SET status = 'closed' WHERE id = ?`, [
        requestRows[0].id,
      ]);
    }

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Reject the proof of service for an order.
 *
 * @param {string} buyerId - Authenticated buyer UUID
 * @param {string} orderId - Order UUID
 * @param {string} proofId - Proof UUID
 * @param {string} rejectionReason - Rejection explanation
 * @returns {Promise<boolean>} - Success flag
 */
exports.rejectProof = async (buyerId, orderId, proofId, rejectionReason) => {
  // Verify order and proof exist and belong to the buyer
  const [orderRows] = await db.query('SELECT buyer_id, state FROM orders WHERE id = ?', [orderId]);

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

  const [proofRows] = await db.query(
    'SELECT id, approval_status FROM proof WHERE id = ? AND order_id = ?',
    [proofId, orderId]
  );

  if (proofRows.length === 0) {
    const error = new Error('Proof not found');
    error.status = 404;
    throw error;
  }

  if (proofRows[0].approval_status !== 'pending') {
    const error = new Error('Proof is not in pending state');
    error.status = 400;
    throw error;
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Update proof approval status and rejection reason
    await connection.query(
      `UPDATE proof SET approval_status = 'rejected', rejection_reason = ? WHERE id = ?`,
      [rejectionReason, proofId]
    );

    // 2. Revert order state to 'in_progress'
    await connection.query(`UPDATE orders SET state = 'in_progress' WHERE id = ?`, [orderId]);

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
