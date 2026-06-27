const crypto = require('crypto');
const db = require('../config/database');

const NOTIFICATION_TYPES = [
  'offer_received',
  'offer_accepted',
  'payment_success',
  'payment_failure',
  'milestone_update',
  'proof_submitted',
  'dispute_opened',
  'refund_issued',
  'message_received',
  'security_alert',
];

const CHANNELS = ['in_app', 'email', 'sms', 'push'];

/**
 * Retrieve notification preferences for the buyer.
 * Auto-initializes any missing combinations with default `is_enabled = true`.
 *
 * @param {string} buyerId - The buyer UUID
 * @returns {Promise<Array>} - Array of preference objects
 */
exports.getPreferences = async (buyerId) => {
  const [rows] = await db.query(
    `SELECT id, notification_type, channel, is_enabled 
     FROM notification_preference 
     WHERE buyer_id = ?`,
    [buyerId]
  );

  const existingCombos = new Set(rows.map((r) => `${r.notification_type}:${r.channel}`));
  const missing = [];

  for (const type of NOTIFICATION_TYPES) {
    for (const channel of CHANNELS) {
      if (!existingCombos.has(`${type}:${channel}`)) {
        missing.push({
          id: crypto.randomUUID(),
          buyer_id: buyerId,
          notification_type: type,
          channel: channel,
          is_enabled: true,
        });
      }
    }
  }

  if (missing.length > 0) {
    const insertValues = [];
    const placeholders = [];
    for (const item of missing) {
      placeholders.push('(?, ?, ?, ?, ?)');
      insertValues.push(
        item.id,
        item.buyer_id,
        item.notification_type,
        item.channel,
        item.is_enabled ? 1 : 0
      );
    }

    await db.query(
      `INSERT INTO notification_preference (id, buyer_id, notification_type, channel, is_enabled) 
       VALUES ${placeholders.join(', ')}`,
      insertValues
    );

    // Fetch the complete set of preferences again
    const [updatedRows] = await db.query(
      `SELECT id, notification_type, channel, is_enabled 
       FROM notification_preference 
       WHERE buyer_id = ?`,
      [buyerId]
    );

    return updatedRows.map((r) => ({
      id: r.id,
      notification_type: r.notification_type,
      channel: r.channel,
      is_enabled: Boolean(r.is_enabled),
    }));
  }

  return rows.map((r) => ({
    id: r.id,
    notification_type: r.notification_type,
    channel: r.channel,
    is_enabled: Boolean(r.is_enabled),
  }));
};

/**
 * Update one or more notification preferences in bulk transaction.
 *
 * @param {string} buyerId - The buyer UUID
 * @param {Array} preferences - Array of preference objects to update
 * @returns {Promise<boolean>} - True if transaction completed successfully
 */
exports.updatePreferences = async (buyerId, preferences) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    for (const pref of preferences) {
      const { notification_type, channel, is_enabled } = pref;
      const id = crypto.randomUUID();

      await connection.query(
        `INSERT INTO notification_preference (id, buyer_id, notification_type, channel, is_enabled)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE is_enabled = VALUES(is_enabled)`,
        [id, buyerId, notification_type, channel, is_enabled ? 1 : 0]
      );
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
exports.NOTIFICATION_TYPES = NOTIFICATION_TYPES;
exports.CHANNELS = CHANNELS;
