const crypto = require('crypto');
const db = require('../config/database');

/**
 * Get the blocklist of a specific buyer.
 *
 * @param {string} buyerId - Authenticated buyer UUID
 * @returns {Promise<Array>} - List of blocked users
 */
exports.getBlocklist = async (buyerId) => {
  const [rows] = await db.query(
    `SELECT id, blocker_id, blocked_user_id, blocked_role, created_at
     FROM blocklist
     WHERE blocker_id = ?
     ORDER BY created_at DESC`,
    [buyerId]
  );
  return rows;
};

/**
 * Block a user (buyer or expert).
 *
 * @param {object} params
 * @param {string} params.buyerId - Authenticated blocker UUID
 * @param {string} params.blockedUserId - Target user UUID
 * @param {string} params.blockedRole - Target user role ('buyer' or 'expert')
 * @returns {Promise<object>} - Created blocklist entry
 */
exports.blockUser = async ({ buyerId, blockedUserId, blockedRole }) => {
  // Prevent blocking oneself
  if (buyerId === blockedUserId) {
    const error = new Error('You cannot block yourself');
    error.status = 400;
    throw error;
  }

  // Check if user is already blocked
  const [existingBlock] = await db.query(
    'SELECT id FROM blocklist WHERE blocker_id = ? AND blocked_user_id = ?',
    [buyerId, blockedUserId]
  );

  if (existingBlock.length > 0) {
    const error = new Error('User is already in your blocklist');
    error.status = 409;
    throw error;
  }

  const blockId = crypto.randomUUID();

  await db.query(
    `INSERT INTO blocklist (id, blocker_id, blocked_user_id, blocked_role)
     VALUES (?, ?, ?, ?)`,
    [blockId, buyerId, blockedUserId, blockedRole]
  );

  // Fetch and return the created entry
  const [rows] = await db.query(
    `SELECT id, blocker_id, blocked_user_id, blocked_role, created_at
     FROM blocklist WHERE id = ?`,
    [blockId]
  );

  return rows[0];
};

/**
 * Unblock a user.
 *
 * @param {string} buyerId - Authenticated blocker UUID
 * @param {string} blockedUserId - Target user UUID
 * @returns {Promise<boolean>} - Success flag
 */
exports.unblockUser = async (buyerId, blockedUserId) => {
  // Check if block entry exists
  const [existingBlock] = await db.query(
    'SELECT id FROM blocklist WHERE blocker_id = ? AND blocked_user_id = ?',
    [buyerId, blockedUserId]
  );

  if (existingBlock.length === 0) {
    const error = new Error('User not found in your blocklist');
    error.status = 404;
    throw error;
  }

  await db.query('DELETE FROM blocklist WHERE blocker_id = ? AND blocked_user_id = ?', [
    buyerId,
    blockedUserId,
  ]);

  return true;
};
