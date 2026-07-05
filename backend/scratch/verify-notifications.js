const db = require('../src/config/database');
const fs = require('fs');
const path = require('path');

async function verify() {
  try {
    const envPath = path.join(__dirname, 'environment.json');
    const env = JSON.parse(fs.readFileSync(envPath, 'utf8'));
    const buyerId = env.values.find((v) => v.key === 'buyerId').value;
    console.log('Querying database for notification preferences of buyer ID:', buyerId);

    // We updated offer_received / email to is_enabled = true (which is 1)
    // and payment_success / sms to is_enabled = false (which is 0)
    const [rows] = await db.query(
      'SELECT * FROM notification_preference WHERE buyer_id = ? AND notification_type IN (?, ?)',
      [buyerId, 'offer_received', 'payment_success']
    );
    console.log('Database Rows:', rows);

    process.exit(0);
  } catch (error) {
    console.error('Database query failed:', error);
    process.exit(1);
  }
}

verify();
