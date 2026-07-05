const db = require('../src/config/database');

const fs = require('fs');
const path = require('path');

async function verify() {
  try {
    const envPath = path.join(__dirname, 'environment.json');
    const env = JSON.parse(fs.readFileSync(envPath, 'utf8'));
    const buyerId = env.values.find((v) => v.key === 'buyerId').value;
    console.log('Querying database for buyer profile after update for ID:', buyerId);

    const [rows] = await db.query('SELECT * FROM buyer_profile WHERE buyer_id = ?', [buyerId]);
    console.log('Database Profile Row:', rows[0]);

    process.exit(0);
  } catch (error) {
    console.error('Database query failed:', error);
    process.exit(1);
  }
}

verify();
