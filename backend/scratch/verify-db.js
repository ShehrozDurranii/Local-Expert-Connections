const db = require('../src/config/database');

async function verify() {
  try {
    const buyerId = 'cf7e7a8e-3c54-4f34-9097-7ce6fc154893';
    console.log('Querying database for buyer ID:', buyerId);

    const [buyerRows] = await db.query('SELECT * FROM buyer WHERE id = ?', [buyerId]);
    console.log('Buyer table record:', buyerRows[0]);

    const [profileRows] = await db.query('SELECT * FROM buyer_profile WHERE buyer_id = ?', [
      buyerId,
    ]);
    console.log('Buyer Profile table record:', profileRows[0]);

    process.exit(0);
  } catch (error) {
    console.error('Database query failed:', error);
    process.exit(1);
  }
}

verify();
