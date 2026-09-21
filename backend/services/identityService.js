'use strict';

const crypto = require('node:crypto');
const { promisify } = require('node:util');

const scryptAsync = promisify(crypto.scrypt);
const SCRYPT_OPTIONS = Object.freeze({ N: 131072, r: 8, p: 1, maxmem: 256 * 1024 * 1024 });
const SESSION_IDLE_MS = 30 * 60 * 1000;
const SESSION_ABSOLUTE_MS = 12 * 60 * 60 * 1000;
const TOKEN_LIFETIME_MS = 30 * 60 * 1000;
const COOKIE_NAME = 'ml_session';
let activeHashes = 0;
const hashWaiters = [];

async function withHashSlot(operation) {
  if (activeHashes >= 2) await new Promise((resolve) => hashWaiters.push(resolve));
  activeHashes += 1;
  try { return await operation(); }
  finally {
    activeHashes -= 1;
    hashWaiters.shift()?.();
  }
}

function digest(token) {
  return crypto.createHash('sha256').update(token).digest();
}

function csrfFor(sessionToken) {
  return crypto.createHmac('sha256', sessionToken).update('meteolord-csrf-v1').digest('base64url');
}

function normalizeEmail(email) {
  if (typeof email !== 'string') return null;
  const normalized = email.trim().toLowerCase();
  return normalized.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) ? normalized : null;
}

function validatePassword(password) {
  return typeof password === 'string'
    && password.length >= 12
    && Buffer.byteLength(password, 'utf8') <= 1024;
}

function normalizeName(name) {
  if (typeof name !== 'string') return null;
  const normalized = name.trim().replace(/\s+/g, ' ');
  return normalized.length >= 2 && normalized.length <= 100 ? normalized : null;
}

async function derive(password, salt) {
  return withHashSlot(() => scryptAsync(password, salt, 64, SCRYPT_OPTIONS));
}

async function hashPassword(password) {
  if (!validatePassword(password)) throw new TypeError('Password must be 12 to 1024 bytes');
  const salt = crypto.randomBytes(16);
  const key = await derive(password, salt);
  return `scrypt$${SCRYPT_OPTIONS.N}$${SCRYPT_OPTIONS.r}$${SCRYPT_OPTIONS.p}$${salt.toString('base64url')}$${key.toString('base64url')}`;
}

async function verifyPassword(password, encoded) {
  if (typeof password !== 'string' || Buffer.byteLength(password, 'utf8') > 1024) return false;
  const parts = typeof encoded === 'string' ? encoded.split('$') : [];
  if (parts.length !== 6 || parts[0] !== 'scrypt'
      || Number(parts[1]) !== SCRYPT_OPTIONS.N
      || Number(parts[2]) !== SCRYPT_OPTIONS.r
      || Number(parts[3]) !== SCRYPT_OPTIONS.p) return false;
  const salt = Buffer.from(parts[4], 'base64url');
  const expected = Buffer.from(parts[5], 'base64url');
  if (salt.length !== 16 || expected.length !== 64) return false;
  const actual = await derive(password, salt);
  return crypto.timingSafeEqual(actual, expected);
}

function sessionCookie(token, { secure }) {
  const attributes = [`${COOKIE_NAME}=${token}`, 'Path=/api/v1', 'HttpOnly', 'SameSite=Lax', 'Max-Age=43200'];
  if (secure) attributes.push('Secure');
  return attributes.join('; ');
}

function clearSessionCookie({ secure }) {
  const attributes = [`${COOKIE_NAME}=`, 'Path=/api/v1', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0'];
  if (secure) attributes.push('Secure');
  return attributes.join('; ');
}

function readSessionToken(req) {
  const cookie = req.headers.cookie;
  if (typeof cookie !== 'string' || cookie.length > 4096) return null;
  const entry = cookie.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE_NAME}=`));
  const token = entry?.slice(COOKIE_NAME.length + 1);
  return token && /^[A-Za-z0-9_-]{43}$/.test(token) ? token : null;
}

function makeIdentityService({ pool, now = Date.now, mailAdapter } = {}) {
  if (!pool || typeof pool.query !== 'function') throw new TypeError('Identity pool is required');
  if (typeof now !== 'function') throw new TypeError('Identity clock is required');

  async function login(email, password) {
    const normalized = normalizeEmail(email);
    if (!normalized || typeof password !== 'string' || Buffer.byteLength(password, 'utf8') > 1024) return null;
    const result = await pool.query(`
      SELECT u.id, u.email, u.nom, u.actiu, u.account_status, u.application_role,
             u.email_verified_at, u.approved_at, c.password_hash
      FROM auth.usuaris u LEFT JOIN auth.credentials c ON c.user_id=u.id
      WHERE lower(u.email)= $1 LIMIT 2
    `, [normalized]);
    const account = result.rowCount === 1 ? result.rows[0] : null;
    const verified = account?.password_hash ? await verifyPassword(password, account.password_hash) : false;
    if (!account?.password_hash) await derive(password, Buffer.alloc(16));
    if (!verified || !account.actiu || account.account_status !== 'APPROVED'
        || !account.email_verified_at || !account.approved_at) return null;
    const token = crypto.randomBytes(32).toString('base64url');
    const csrfToken = csrfFor(token);
    const issuedAt = new Date(now());
    await pool.query(`
      INSERT INTO auth.sessions(user_id, token_hash, csrf_hash, created_at, last_seen_at, expires_at)
      VALUES ($1,$2,$3,$4,$4,$5)
    `, [account.id, digest(token), digest(csrfToken), issuedAt,
      new Date(issuedAt.getTime() + SESSION_ABSOLUTE_MS)]);
    return { token, csrfToken, user: { id: account.id, email: account.email, name: account.nom, role: account.application_role } };
  }

  async function current(token) {
    if (!token) return null;
    const result = await pool.query(`
      SELECT s.id AS session_id, s.csrf_hash, s.last_seen_at, s.expires_at,
             u.id, u.email, u.nom, u.actiu, u.account_status, u.application_role,
             u.email_verified_at, u.approved_at
      FROM auth.sessions s JOIN auth.usuaris u ON u.id=s.user_id
      WHERE s.token_hash=$1 AND s.revoked_at IS NULL
    `, [digest(token)]);
    if (result.rowCount !== 1) return null;
    const record = result.rows[0];
    const timestamp = now();
    if (!record.actiu || record.account_status !== 'APPROVED'
        || !record.email_verified_at || !record.approved_at
        || Date.parse(record.expires_at) <= timestamp
        || Date.parse(record.last_seen_at) + SESSION_IDLE_MS <= timestamp) return null;
    await pool.query('UPDATE auth.sessions SET last_seen_at=$2 WHERE id=$1', [record.session_id, new Date(timestamp)]);
    return {
      sessionId: record.session_id,
      csrfHash: record.csrf_hash,
      csrfToken: csrfFor(token),
      user: { id: record.id, email: record.email, name: record.nom, role: record.application_role },
    };
  }

  function validCsrf(currentSession, supplied) {
    if (!currentSession || typeof supplied !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(supplied)) return false;
    const hash = digest(supplied);
    return crypto.timingSafeEqual(hash, currentSession.csrfHash);
  }

  async function logout(currentSession) {
    await pool.query('UPDATE auth.sessions SET revoked_at=now() WHERE id=$1 AND revoked_at IS NULL', [currentSession.sessionId]);
  }

  async function requestRecovery(email) {
    if (!mailAdapter) return false;
    const normalized = normalizeEmail(email);
    if (!normalized) return true;
    const user = await pool.query(`
      SELECT id, email FROM auth.usuaris
      WHERE lower(email)=$1 AND account_status='APPROVED' AND actiu=true
        AND email_verified_at IS NOT NULL AND approved_at IS NOT NULL LIMIT 2
    `, [normalized]);
    if (user.rowCount !== 1) return true;
    const token = crypto.randomBytes(32).toString('base64url');
    await pool.query(`
      INSERT INTO auth.account_tokens(user_id, token_hash, purpose, expires_at)
      VALUES ($1,$2,'RESET_PASSWORD',$3)
    `, [user.rows[0].id, digest(token), new Date(now() + TOKEN_LIFETIME_MS)]);
    await mailAdapter({ kind: 'password_reset', to: user.rows[0].email, token });
    return true;
  }

  async function requestRegistration({ email, name, password } = {}) {
    if (!mailAdapter) return { unavailable: true };
    const normalizedEmail = normalizeEmail(email);
    const normalizedName = normalizeName(name);
    if (!normalizedEmail || !normalizedName || !validatePassword(password)) return { invalid: true };
    const hash = await hashPassword(password);
    const token = crypto.randomBytes(32).toString('base64url');
    const client = await pool.connect();
    let createdUserId;
    try {
      await client.query('BEGIN');
      await client.query('SELECT pg_advisory_xact_lock(71011, hashtext($1))', [normalizedEmail]);
      const existing = await client.query('SELECT id FROM auth.usuaris WHERE lower(email)=$1 LIMIT 1', [normalizedEmail]);
      if (existing.rowCount !== 0) {
        await client.query('ROLLBACK');
        return { accepted: true };
      }
      const inserted = await client.query(`
        INSERT INTO auth.usuaris(email,nom,actiu,account_status)
        VALUES ($1,$2,true,'PENDING_EMAIL') RETURNING id
      `, [normalizedEmail, normalizedName]);
      createdUserId = inserted.rows[0].id;
      await client.query('INSERT INTO auth.credentials(user_id,password_hash) VALUES ($1,$2)', [createdUserId, hash]);
      await client.query(`
        INSERT INTO auth.account_tokens(user_id,token_hash,purpose,expires_at)
        VALUES ($1,$2,'VERIFY_EMAIL',$3)
      `, [createdUserId, digest(token), new Date(now() + TOKEN_LIFETIME_MS)]);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally { client.release(); }
    try {
      await mailAdapter({ kind: 'verify_email', to: normalizedEmail, token });
    } catch (error) {
      // A failed delivery must not strand a new account in PENDING_EMAIL.
      await pool.query("DELETE FROM auth.usuaris WHERE id=$1 AND account_status='PENDING_EMAIL'", [createdUserId]);
      throw error;
    }
    return { accepted: true };
  }

  async function verifyEmail(token) {
    if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(token)) return false;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const found = await client.query(`
        SELECT t.id, t.user_id FROM auth.account_tokens t
        JOIN auth.usuaris u ON u.id=t.user_id
        WHERE t.token_hash=$1 AND t.purpose='VERIFY_EMAIL' AND t.consumed_at IS NULL
          AND t.expires_at>$2 AND u.account_status='PENDING_EMAIL' AND u.actiu=true
        FOR UPDATE OF t, u
      `, [digest(token), new Date(now())]);
      if (found.rowCount !== 1) { await client.query('ROLLBACK'); return false; }
      await client.query(`
        UPDATE auth.usuaris SET account_status='PENDING_APPROVAL', email_verified_at=$2
        WHERE id=$1
      `, [found.rows[0].user_id, new Date(now())]);
      await client.query('UPDATE auth.account_tokens SET consumed_at=$2 WHERE id=$1', [found.rows[0].id, new Date(now())]);
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally { client.release(); }
  }

  async function listManagedAccounts() {
    const result = await pool.query(`
      SELECT id, email, nom, account_status, email_verified_at
      FROM auth.usuaris
      WHERE account_status IN ('PENDING_EMAIL', 'PENDING_APPROVAL', 'APPROVED') AND actiu=true
      ORDER BY id DESC LIMIT 200
    `);
    return result.rows.map((row) => ({ id: row.id, email: row.email, name: row.nom,
      status: row.account_status, verified_at: row.email_verified_at }));
  }

  async function decideAccount({ actorId, targetId, action }) {
    if (!['approve', 'reject', 'suspend'].includes(action)
        || !Number.isSafeInteger(Number(targetId)) || Number(targetId) < 1
        || String(actorId) === String(targetId)) return false;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const found = await client.query(`
        SELECT id, account_status, email_verified_at, actiu, application_role
        FROM auth.usuaris WHERE id=$1 FOR UPDATE
      `, [targetId]);
      const account = found.rows[0];
      if (!account || account.application_role === 'SUPERADMIN' || !account.actiu
          || (action === 'approve' && (account.account_status !== 'PENDING_APPROVAL' || !account.email_verified_at))
          || (action === 'reject' && !['PENDING_EMAIL', 'PENDING_APPROVAL'].includes(account.account_status))
          || (action === 'suspend' && account.account_status !== 'APPROVED')) {
        await client.query('ROLLBACK');
        return false;
      }
      if (action === 'approve') {
        const credential = await client.query('SELECT user_id FROM auth.credentials WHERE user_id=$1', [targetId]);
        if (credential.rowCount !== 1) { await client.query('ROLLBACK'); return false; }
      }
      const status = action === 'approve' ? 'APPROVED' : action === 'reject' ? 'REJECTED' : 'SUSPENDED';
      await client.query(`
        UPDATE auth.usuaris SET account_status=$2,
          approved_at=CASE WHEN $2='APPROVED' THEN $3 ELSE approved_at END
        WHERE id=$1
      `, [targetId, status, new Date(now())]);
      if (action !== 'approve') {
        await client.query('UPDATE auth.sessions SET revoked_at=$2 WHERE user_id=$1 AND revoked_at IS NULL', [targetId, new Date(now())]);
      }
      if (action === 'suspend') {
        const unpublished = await client.query(`
          UPDATE meteo.estacions SET visibility='PRIVATE', revision=revision+1
          WHERE owner_id=$1 AND visibility='PUBLIC'
        `, [targetId]);
        if (unpublished.rowCount > 0) {
          await client.query('UPDATE meteo.map_catalog_state SET revision=revision+1,updated_at=$1 WHERE id=1', [new Date(now())]);
        }
      }
      await client.query(`
        INSERT INTO meteo.audit_events(actor_user_id,action,resource_kind,resource_id)
        VALUES ($1,$2,'USER',$3)
      `, [actorId, `ACCOUNT_${action.toUpperCase()}`, String(targetId)]);
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally { client.release(); }
  }

  async function resetPassword(token, newPassword) {
    if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(token) || !validatePassword(newPassword)) return false;
    const hash = await hashPassword(newPassword);
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query(`
        SELECT t.id, t.user_id FROM auth.account_tokens t JOIN auth.usuaris u ON u.id=t.user_id
        WHERE t.token_hash=$1 AND t.purpose='RESET_PASSWORD' AND t.consumed_at IS NULL
          AND t.expires_at>$2 AND u.account_status='APPROVED' AND u.actiu=true
          AND u.email_verified_at IS NOT NULL AND u.approved_at IS NOT NULL
        FOR UPDATE OF t
      `, [digest(token), new Date(now())]);
      if (result.rowCount !== 1) { await client.query('ROLLBACK'); return false; }
      const record = result.rows[0];
      await client.query(`
        INSERT INTO auth.credentials(user_id,password_hash) VALUES ($1,$2)
        ON CONFLICT (user_id) DO UPDATE SET password_hash=EXCLUDED.password_hash, updated_at=now()
      `, [record.user_id, hash]);
      await client.query('UPDATE auth.account_tokens SET consumed_at=now() WHERE id=$1', [record.id]);
      await client.query('UPDATE auth.sessions SET revoked_at=now() WHERE user_id=$1 AND revoked_at IS NULL', [record.user_id]);
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally { client.release(); }
  }

  return { login, current, validCsrf, logout, requestRecovery, resetPassword,
    requestRegistration, verifyEmail, listManagedAccounts, decideAccount };
}

module.exports = {
  COOKIE_NAME,
  clearSessionCookie,
  csrfFor,
  digest,
  hashPassword,
  makeIdentityService,
  normalizeEmail,
  normalizeName,
  readSessionToken,
  sessionCookie,
  validatePassword,
  verifyPassword,
};
