const db = require('../src/config/database');

async function list() {
  try {
    const [rows] = await db.query('DESCRIBE saved_expert');
    console.log('Columns:', rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
list();
