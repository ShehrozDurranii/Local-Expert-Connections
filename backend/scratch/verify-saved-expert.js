const db = require('../src/config/database');
const fs = require('fs');
const path = require('path');

async function verify() {
  try {
    const envPath = path.join(__dirname, 'environment.json');
    const env = JSON.parse(fs.readFileSync(envPath, 'utf8'));
    const buyerId = env.values.find((v) => v.key === 'buyerId').value;
    console.log('Querying database for saved experts of buyer ID:', buyerId);

    const [rows] = await db.query(
      'SELECT * FROM saved_expert WHERE buyer_id = ? AND expert_id = ?',
      [buyerId, '550e8400-e29b-41d4-a716-446655440099']
    );
    console.log('Database Rows:', rows);

    process.exit(0);
  } catch (error) {
    console.error('Database query failed:', error);
    process.exit(1);
  }
}

verify();
