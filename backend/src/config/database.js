const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

function getSSLConfig() {
  if (process.env.DB_SSL !== 'true') return undefined;

  // Try reading CA cert from file (works locally and on traditional hosts)
  try {
    const caPath = path.join(__dirname, '../../ca.pem');
    const ca = fs.readFileSync(caPath);
    return { ca };
  } catch {
    // File not found (e.g., Vercel serverless) — connect with SSL but skip CA verification
    return { rejectUnauthorized: false };
  }
}

module.exports = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: getSSLConfig(),
});
