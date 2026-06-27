const db = require('../config/database');

/**
 * Get buyer profile by buyer ID.
 * Performs a LEFT JOIN between `buyer` and `buyer_profile` to aggregate data.
 *
 * @param {string} buyerId - The buyer UUID
 * @returns {Promise<object|null>} - The profile object or null if not found
 */
exports.getByBuyerId = async (buyerId) => {
  const [rows] = await db.query(
    `SELECT 
      b.id AS buyer_id, 
      bp.name, 
      b.email, 
      b.phone, 
      bp.photo_url, 
      bp.languages, 
      bp.contact_preferences, 
      b.status, 
      b.created_at
     FROM buyer b
     LEFT JOIN buyer_profile bp ON b.id = bp.buyer_id
     WHERE b.id = ?`,
    [buyerId]
  );

  if (rows.length === 0) {
    return null;
  }

  return rows[0];
};

/**
 * Update buyer profile by buyer ID.
 * Dynamically updates only the provided and allowed fields in `buyer_profile`.
 *
 * @param {string} buyerId - The buyer UUID
 * @param {object} updateData - Key-value pairs of fields to update
 * @returns {Promise<boolean>} - True if profile was successfully updated, false otherwise
 */
exports.updateByBuyerId = async (buyerId, updateData) => {
  const allowedFields = ['name', 'photo_url', 'languages', 'contact_preferences'];
  const updates = [];
  const values = [];

  for (const key of allowedFields) {
    if (updateData[key] !== undefined) {
      updates.push(`${key} = ?`);
      values.push(updateData[key]);
    }
  }

  if (updates.length === 0) {
    return true; // Nothing to update is functionally a success
  }

  values.push(buyerId);

  const [result] = await db.query(
    `UPDATE buyer_profile 
     SET ${updates.join(', ')} 
     WHERE buyer_id = ?`,
    values
  );

  return result.affectedRows > 0;
};
