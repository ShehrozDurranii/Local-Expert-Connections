const crypto = require('crypto');
const db = require('../config/database');

/**
 * File a safety/abuse report.
 *
 * @param {object} params
 * @param {string} params.reporterId - Authenticated buyer UUID
 * @param {string} params.orderId - Associated order UUID
 * @param {string} params.reportedUserId - Reported user UUID
 * @param {string} params.reportedRole - Role of the reported user ('buyer' or 'expert')
 * @param {string} params.category - Report category enum
 * @param {string|null} params.evidenceNotes - Explanation of evidence
 * @returns {Promise<object>} - Created report entry
 */
exports.createReport = async ({
  reporterId,
  orderId,
  reportedUserId,
  reportedRole,
  category,
  evidenceNotes,
}) => {
  // Verify order exists
  const [orderRows] = await db.query('SELECT buyer_id, expert_id FROM orders WHERE id = ?', [
    orderId,
  ]);

  if (orderRows.length === 0) {
    const error = new Error('Associated order not found');
    error.status = 404;
    throw error;
  }

  // Ensure the reporter is the buyer of this order
  if (orderRows[0].buyer_id !== reporterId) {
    const error = new Error('You do not have permission to file a report for this order');
    error.status = 403;
    throw error;
  }

  const reportId = crypto.randomUUID();

  await db.query(
    `INSERT INTO report (id, reporter_id, order_id, reported_user_id, reported_role, category, evidence_notes, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'open')`,
    [reportId, reporterId, orderId, reportedUserId, reportedRole, category, evidenceNotes || null]
  );

  // Fetch and return the created report
  const [rows] = await db.query(
    `SELECT id, reporter_id, order_id, reported_user_id, reported_role, category, evidence_notes, status, created_at
     FROM report WHERE id = ?`,
    [reportId]
  );

  return rows[0];
};
