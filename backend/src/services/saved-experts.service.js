const crypto = require('crypto');
const db = require('../config/database');

/**
 * List saved experts for a buyer with pagination.
 *
 * @param {string} buyerId - The buyer UUID
 * @param {number} page - Page number (1-based)
 * @param {number} limit - Number of records per page
 * @returns {Promise<object>} - Paginated response object
 */
exports.listSaved = async (buyerId, page, limit) => {
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;
  const offset = (pageNum - 1) * limitNum;

  // Get total count
  const [countRows] = await db.query(
    `SELECT COUNT(*) AS total FROM saved_expert WHERE buyer_id = ?`,
    [buyerId]
  );
  const total = countRows[0].total;

  // Get paginated rows
  const [rows] = await db.query(
    `SELECT id, buyer_id, expert_id, created_at 
     FROM saved_expert 
     WHERE buyer_id = ? 
     ORDER BY created_at DESC 
     LIMIT ? OFFSET ?`,
    [buyerId, limitNum, offset]
  );

  const totalPages = Math.ceil(total / limitNum);

  return {
    data: rows,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
    },
  };
};

/**
 * Bookmark/save an expert profile for a buyer.
 *
 * @param {string} buyerId - The buyer UUID
 * @param {string} expertId - The expert UUID
 * @returns {Promise<boolean>} - True if saved successfully
 */
exports.saveExpert = async (buyerId, expertId) => {
  // Check duplicate
  const [existing] = await db.query(
    `SELECT 1 FROM saved_expert WHERE buyer_id = ? AND expert_id = ?`,
    [buyerId, expertId]
  );

  if (existing.length > 0) {
    const error = new Error('Expert already in saved list');
    error.status = 409;
    throw error;
  }

  const id = crypto.randomUUID();
  await db.query(
    `INSERT INTO saved_expert (id, buyer_id, expert_id) 
     VALUES (?, ?, ?)`,
    [id, buyerId, expertId]
  );

  return true;
};

/**
 * Remove an expert from a buyer's saved list.
 *
 * @param {string} buyerId - The buyer UUID
 * @param {string} expertId - The expert UUID
 * @returns {Promise<boolean>} - True if record was found and deleted
 */
exports.removeExpert = async (buyerId, expertId) => {
  const [result] = await db.query(
    `DELETE FROM saved_expert 
     WHERE buyer_id = ? AND expert_id = ?`,
    [buyerId, expertId]
  );

  return result.affectedRows > 0;
};
