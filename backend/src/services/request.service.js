const crypto = require('crypto');
const db = require('../config/database');

const requestQuery = `
  SELECT 
    r.id, 
    r.buyer_id, 
    c.name AS city, 
    cat.name AS category, 
    r.description, 
    r.budget, 
    r.timeline, 
    r.item_links, 
    r.status, 
    r.created_at
  FROM request r
  JOIN city c ON r.city_id = c.id
  JOIN category cat ON r.category_id = cat.id
`;

exports.getAll = async () => {
  const [rows] = await db.query(requestQuery);
  return rows;
};

exports.create = async (data) => {
  const { buyer_id, city_id, category_id, description, budget, timeline, item_links, status } =
    data;
  const id = data.id || crypto.randomUUID();

  // Validate city_id existence in database
  const [cityRows] = await db.query('SELECT name FROM city WHERE id = ?', [city_id]);
  if (cityRows.length === 0) {
    const error = new Error('City lookup record not found');
    error.status = 400;
    throw error;
  }

  // Validate category_id existence in database
  const [categoryRows] = await db.query('SELECT name FROM category WHERE id = ?', [category_id]);
  if (categoryRows.length === 0) {
    const error = new Error('Category lookup record not found');
    error.status = 400;
    throw error;
  }

  let mysqlTimeline = timeline;
  if (timeline) {
    const d = new Date(timeline);
    if (!isNaN(d.getTime())) {
      mysqlTimeline = d.toISOString().slice(0, 19).replace('T', ' ');
    }
  }

  await db.query(
    `
    INSERT INTO request
    (
      id,
      buyer_id,
      city_id,
      category_id,
      description,
      budget,
      timeline,
      item_links,
      status
    )
    VALUES (?,?,?,?,?,?,?,?,?)
    `,
    [
      id,
      buyer_id,
      city_id,
      category_id,
      description,
      budget,
      mysqlTimeline,
      item_links,
      status || 'draft',
    ]
  );

  return {
    id,
    buyer_id,
    city: cityRows[0].name,
    category: categoryRows[0].name,
    description,
    budget,
    timeline,
    item_links: item_links || null,
    status: status || 'draft',
    created_at: new Date().toISOString(),
  };
};

exports.getById = async (id) => {
  const [rows] = await db.query(requestQuery + ' WHERE r.id = ?', [id]);
  return rows[0];
};

exports.cancelRequest = async (id, buyerId) => {
  const [rows] = await db.query(
    `
    SELECT status, buyer_id
    FROM request
    WHERE id=?
    `,
    [id]
  );

  if (rows.length === 0) {
    const error = new Error('Request not found');
    error.status = 404;
    throw error;
  }

  // Ownership check: only request owner can cancel it
  if (rows[0].buyer_id !== buyerId) {
    const error = new Error('You do not have permission to cancel this request');
    error.status = 403;
    throw error;
  }

  const currentStatus = rows[0].status;

  if (currentStatus !== 'draft' && currentStatus !== 'submitted') {
    const error = new Error('Cannot cancel a request that already has an accepted offer');
    error.status = 400;
    throw error;
  }

  await db.query(
    `
    UPDATE request
    SET status='cancelled'
    WHERE id=?
    `,
    [id]
  );

  return {
    success: true,
    message: 'Request cancelled successfully',
  };
};

/**
 * Get paginated requests for a specific buyer.
 *
 * @param {string} buyerId - Buyer UUID
 * @param {string|null} status - Request status filter
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<object>} - Paginated requests
 */
exports.getBuyerRequests = async (buyerId, status, page, limit) => {
  const offset = (page - 1) * limit;
  let countQuery = 'SELECT COUNT(*) AS total FROM request WHERE buyer_id = ?';
  let dataQuery = `
    SELECT 
      r.id, 
      r.buyer_id, 
      c.name AS city, 
      cat.name AS category, 
      r.description, 
      r.budget, 
      r.timeline, 
      r.item_links, 
      r.status, 
      r.created_at
    FROM request r
    JOIN city c ON r.city_id = c.id
    JOIN category cat ON r.category_id = cat.id
    WHERE r.buyer_id = ?
  `;
  const params = [buyerId];

  if (status) {
    countQuery += ' AND status = ?';
    dataQuery += ' AND r.status = ?';
    params.push(status);
  }

  dataQuery += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';

  const [countRows] = await db.query(countQuery, params);
  const total = countRows[0].total;

  const [rows] = await db.query(dataQuery, [...params, limit, offset]);

  return {
    data: rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
