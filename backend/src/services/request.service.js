const crypto = require('crypto');
const db = require('../config/database');

exports.getAll = async () => {
  const [rows] = await db.query('SELECT * FROM request');
  return rows;
};

exports.create = async (data) => {
  const { buyer_id, city_id, category_id, description, budget, timeline, item_links, status } =
    data;
  const id = data.id || crypto.randomUUID();

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
    message: 'Request created successfully',
    id,
  };
};

exports.getById = async (id) => {
  const [rows] = await db.query(
    `
    SELECT *
    FROM request
    WHERE id=?
    `,
    [id]
  );

  return rows[0];
};

exports.cancelRequest = async (id) => {
  const [rows] = await db.query(
    `
    SELECT status
    FROM request
    WHERE id=?
    `,
    [id]
  );

  if (rows.length === 0) {
    throw new Error('Request not found');
  }

  const currentStatus = rows[0].status;

  if (currentStatus !== 'draft' && currentStatus !== 'submitted') {
    throw new Error('Cannot cancel a request that already has an accepted offer');
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
