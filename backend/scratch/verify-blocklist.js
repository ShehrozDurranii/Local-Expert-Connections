const db = require('../src/config/database');
const fs = require('fs');
const path = require('path');

async function verify() {
  try {
    const envPath = path.join(__dirname, 'environment.json');
    const env = JSON.parse(fs.readFileSync(envPath, 'utf8'));
    const buyerId = env.values.find((v) => v.key === 'buyerId').value;
    console.log('Querying blocklist in database for blocker ID:', buyerId);

    const [rows] = await db.query('SELECT * FROM blocklist WHERE blocker_id = ?', [buyerId]);
    console.log('Database Rows:', rows);

    process.exit(0);
  } catch (error) {
    console.error('Database query failed:', error);
    process.exit(1);
  }
}

verify();
