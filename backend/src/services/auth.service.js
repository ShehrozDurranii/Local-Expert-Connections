const db = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = '7d';

/**
 * Generates a signed JWT token for the given buyer.
 */
function signToken(buyerId) {
  return jwt.sign({ id: buyerId, role: 'buyer' }, process.env.JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });
}

/**
 * Register a new buyer account.
 *
 * Business rules (from OpenAPI + Schema):
 *   - At least one of email or phone is required
 *   - password min 8 chars, stored as bcrypt hash
 *   - name min 2 chars
 *   - Email and phone must be unique (409 if duplicate)
 *   - Inserts into both `buyer` and `buyer_profile` tables
 *   - Status defaults to 'active' (Phase 1 — no verification flow yet)
 *   - Returns signed JWT valid for 7 days
 */
exports.register = async (data) => {
  const { email, phone, password, name } = data;

  // ── Validation ─────────────────────────────────────────────
  const errors = [];

  if (!email && !phone) {
    errors.push({ field: 'email/phone', message: 'At least one of email or phone is required' });
  }

  if (!password || password.length < 8) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
  }

  if (!name || name.length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
  }

  if (errors.length > 0) {
    const error = new Error('Validation failed');
    error.status = 400;
    error.errors = errors;
    throw error;
  }

  // ── Check for duplicate email/phone ────────────────────────
  if (email) {
    const [existing] = await db.query('SELECT id FROM buyer WHERE email = ?', [email]);
    if (existing.length > 0) {
      const error = new Error('An account with this email already exists');
      error.status = 409;
      throw error;
    }
  }

  if (phone) {
    const [existing] = await db.query('SELECT id FROM buyer WHERE phone = ?', [phone]);
    if (existing.length > 0) {
      const error = new Error('An account with this phone number already exists');
      error.status = 409;
      throw error;
    }
  }

  // ── Create buyer ───────────────────────────────────────────
  const buyerId = crypto.randomUUID();
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  await db.query(
    `INSERT INTO buyer (id, email, phone, password_hash, status)
     VALUES (?, ?, ?, ?, 'active')`,
    [buyerId, email || null, phone || null, passwordHash]
  );

  // ── Create buyer profile ───────────────────────────────────
  await db.query(
    `INSERT INTO buyer_profile (buyer_id, name)
     VALUES (?, ?)`,
    [buyerId, name]
  );

  // ── Sign JWT ───────────────────────────────────────────────
  const token = signToken(buyerId);

  return {
    success: true,
    message: 'Account created successfully',
    data: {
      buyer_id: buyerId,
      token,
      expires_in: TOKEN_EXPIRY,
    },
  };
};

/**
 * Authenticate a buyer with email+password or phone+password.
 *
 * Business rules (from OpenAPI):
 *   - Provide email OR phone with password
 *   - Returns signed JWT valid for 7 days
 *   - Returns 401 for invalid credentials
 *   - Returns 403 for suspended/banned accounts
 *   - Failed attempts logged in audit_log (FR-AUTH-05)
 */
exports.login = async (data) => {
  const { email, phone, password } = data;

  // ── Validation ─────────────────────────────────────────────
  if (!email && !phone) {
    const error = new Error('Email or phone is required');
    error.status = 400;
    error.errors = [{ field: 'email/phone', message: 'Provide either email or phone' }];
    throw error;
  }

  if (!password) {
    const error = new Error('Password is required');
    error.status = 400;
    error.errors = [{ field: 'password', message: 'Password is required' }];
    throw error;
  }

  // ── Find buyer by email or phone ───────────────────────────
  let buyer;
  if (email) {
    const [rows] = await db.query('SELECT * FROM buyer WHERE email = ?', [email]);
    buyer = rows[0];
  } else {
    const [rows] = await db.query('SELECT * FROM buyer WHERE phone = ?', [phone]);
    buyer = rows[0];
  }

  if (!buyer) {
    // Log failed attempt
    await logAuditEvent(null, 'LOGIN_FAILED', 'buyer', null, null, {
      reason: 'Account not found',
      identifier: email || phone,
    });

    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  // ── Verify password ────────────────────────────────────────
  const passwordMatch = await bcrypt.compare(password, buyer.password_hash);

  if (!passwordMatch) {
    // Log failed attempt
    await logAuditEvent(buyer.id, 'LOGIN_FAILED', 'buyer', buyer.id, null, {
      reason: 'Invalid password',
    });

    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  // ── Check account status ───────────────────────────────────
  if (buyer.status === 'suspended' || buyer.status === 'banned') {
    // Log blocked login
    await logAuditEvent(buyer.id, 'LOGIN_BLOCKED', 'buyer', buyer.id, null, {
      reason: `Account ${buyer.status}`,
    });

    const error = new Error('Your account has been suspended. Contact support.');
    error.status = 403;
    throw error;
  }

  if (buyer.status === 'deleted') {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  // ── Log successful login ───────────────────────────────────
  await logAuditEvent(buyer.id, 'LOGIN_SUCCESS', 'buyer', buyer.id);

  // ── Sign JWT ───────────────────────────────────────────────
  const token = signToken(buyer.id);

  return {
    success: true,
    message: 'Login successful',
    data: {
      buyer_id: buyer.id,
      token,
      expires_in: TOKEN_EXPIRY,
    },
  };
};

/**
 * Logs an event to the audit_log table (FR-AUTH-05).
 */
async function logAuditEvent(
  actorId,
  action,
  entityType,
  entityId,
  beforeState = null,
  afterState = null
) {
  const logId = crypto.randomUUID();

  await db.query(
    `INSERT INTO audit_log (id, actor_id, actor_role, action, entity_type, entity_id, before_state, after_state)
     VALUES (?, ?, 'buyer', ?, ?, ?, ?, ?)`,
    [
      logId,
      actorId || '00000000-0000-0000-0000-000000000000',
      action,
      entityType,
      entityId,
      beforeState ? JSON.stringify(beforeState) : null,
      afterState ? JSON.stringify(afterState) : null,
    ]
  );
}
