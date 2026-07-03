const crypto = require('crypto');
const db = require('../config/database');

/**
 * Retrieve all non-quarantined attachments for an order.
 * Verifies order ownership by the buyer first.
 *
 * @param {string} buyerId - Authenticated buyer UUID
 * @param {string} orderId - Order UUID
 * @returns {Promise<Array>} - List of attachments
 */
exports.getOrderAttachments = async (buyerId, orderId) => {
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

  // Fetch attachments excluding quarantined files
  const [rows] = await db.query(
    `SELECT id, order_id, proof_id, message_id, file_url, file_type, file_size_bytes, uploaded_by, uploader_role, scan_status, created_at
     FROM attachment
     WHERE order_id = ? AND scan_status != 'quarantined'
     ORDER BY created_at DESC`,
    [orderId]
  );

  return rows.map((att) => ({
    ...att,
    file_size_bytes: att.file_size_bytes ? Number(att.file_size_bytes) : null,
  }));
};

/**
 * Upload a file attachment linked to either a message or proof submission.
 * Verifies order ownership and existence of linked resources.
 *
 * @param {object} params
 * @param {string} params.buyerId - Authenticated buyer UUID
 * @param {string} params.orderId - Order UUID
 * @param {string} params.fileUrl - Public/local path of the uploaded file
 * @param {string} params.fileType - Enum: image, video, pdf, receipt
 * @param {number} params.fileSizeBytes - File size in bytes
 * @param {string|null} params.messageId - Optional message UUID link
 * @param {string|null} params.proofId - Optional proof UUID link
 * @returns {Promise<object>} - Created attachment record
 */
exports.createAttachment = async ({
  buyerId,
  orderId,
  fileUrl,
  fileType,
  fileSizeBytes,
  messageId,
  proofId,
}) => {
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

  // Validate that either messageId or proofId is provided
  if (!messageId && !proofId) {
    const error = new Error('Attachment must be linked to either a message or a proof submission');
    error.status = 400;
    throw error;
  }

  // Validate messageId if provided
  if (messageId) {
    const [msgRows] = await db.query('SELECT id FROM message WHERE id = ? AND order_id = ?', [
      messageId,
      orderId,
    ]);
    if (msgRows.length === 0) {
      const error = new Error('Linked message not found in this order');
      error.status = 404;
      throw error;
    }
  }

  // Validate proofId if provided
  if (proofId) {
    const [proofRows] = await db.query('SELECT id FROM proof WHERE id = ? AND order_id = ?', [
      proofId,
      orderId,
    ]);
    if (proofRows.length === 0) {
      const error = new Error('Linked proof not found in this order');
      error.status = 404;
      throw error;
    }
  }

  const id = crypto.randomUUID();

  await db.query(
    `INSERT INTO attachment (id, order_id, proof_id, message_id, file_url, file_type, file_size_bytes, uploaded_by, uploader_role, scan_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'buyer', 'pending')`,
    [id, orderId, proofId || null, messageId || null, fileUrl, fileType, fileSizeBytes, buyerId]
  );

  // Retrieve and return the created record
  const [rows] = await db.query(
    `SELECT id, order_id, proof_id, message_id, file_url, file_type, file_size_bytes, uploaded_by, uploader_role, scan_status, created_at
     FROM attachment WHERE id = ?`,
    [id]
  );

  return {
    ...rows[0],
    file_size_bytes: rows[0].file_size_bytes ? Number(rows[0].file_size_bytes) : null,
  };
};
