const db = require('../src/config/database');

async function verify() {
  try {
    console.log('Querying database for recent audit logs...');
    const [rows] = await db.query(
      "SELECT * FROM audit_log WHERE action LIKE 'LOGIN_%' ORDER BY created_at DESC LIMIT 10"
    );
    console.log('Recent Login Audit Logs:');
    rows.forEach((row) => {
      console.log(JSON.stringify(row));
    });
    process.exit(0);
  } catch (error) {
    console.error('Database query failed:', error);
    process.exit(1);
  }
}

verify();
