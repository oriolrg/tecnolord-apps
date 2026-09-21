'use strict';

const crypto = require('node:crypto');
const { validPublicId } = require('./stationCatalogService');

const ECOWITT_CONFIGURATION = Object.freeze({
  endpoint: 'ECOWITT_V3_REAL_TIME',
  temp_unitid: '1',
  wind_speed_unitid: '8',
  rainfall_unitid: '12',
  pressure_unitid: '3',
});

function parseConnectorKeyring(serialized) {
  if (!serialized) return Object.freeze({ primaryKeyId: null, keys: new Map() });
  const keys = new Map();
  let primaryKeyId = null;
  for (const entry of serialized.split(',')) {
    const separator = entry.indexOf(':');
    if (separator < 1) throw new TypeError('Invalid connector keyring');
    const keyId = entry.slice(0, separator);
    const encoded = entry.slice(separator + 1);
    if (!/^[A-Za-z0-9_-]{1,32}$/.test(keyId) || keys.has(keyId)) throw new TypeError('Invalid connector key id');
    const key = Buffer.from(encoded, 'base64url');
    if (key.length !== 32) throw new TypeError('Connector keys must be 32 bytes');
    if (!primaryKeyId) primaryKeyId = keyId;
    keys.set(keyId, key);
  }
  return Object.freeze({ primaryKeyId, keys });
}

function normalizeKeyring(keyring) {
  if (!keyring) return parseConnectorKeyring();
  if (typeof keyring === 'string') return parseConnectorKeyring(keyring);
  const keys = keyring.keys instanceof Map ? keyring.keys : new Map(Object.entries(keyring.keys || {}));
  for (const [keyId, key] of keys) {
    if (!/^[A-Za-z0-9_-]{1,32}$/.test(keyId) || !Buffer.isBuffer(key) || key.length !== 32) {
      throw new TypeError('Invalid connector keyring');
    }
  }
  if (keyring.primaryKeyId && !keys.has(keyring.primaryKeyId)) throw new TypeError('Primary connector key is missing');
  return Object.freeze({ primaryKeyId: keyring.primaryKeyId || null, keys });
}

function normalizeEcowittSecrets(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const allowed = new Set(['application_key', 'api_key', 'mac']);
  if (Object.keys(input).some((key) => !allowed.has(key))) return null;
  const values = {};
  for (const key of allowed) {
    if (typeof input[key] !== 'string') return null;
    const value = input[key].trim();
    if (value.length < 3 || value.length > 256 || !/^[A-Za-z0-9:_-]+$/.test(value)) return null;
    values[key] = value;
  }
  return values;
}

function aad(stationId) {
  return Buffer.from(`meteolord:station:${stationId}:ECOWITT:v1`);
}

function ecowittExternalId(mac) {
  return `sha256:${crypto.createHash('sha256').update(mac.trim().toUpperCase()).digest('hex')}`;
}

function encryptSecrets(secrets, stationId, keyId, key) {
  const nonce = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, nonce);
  cipher.setAAD(aad(stationId));
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(secrets), 'utf8'), cipher.final()]);
  return { ciphertext, nonce, authTag: cipher.getAuthTag(), keyId };
}

function decryptSecrets(record, stationId, keyring) {
  const key = keyring.keys.get(record.key_id);
  if (!key) throw new Error('CONNECTOR_KEY_UNAVAILABLE');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, record.nonce);
  decipher.setAAD(aad(stationId));
  decipher.setAuthTag(record.auth_tag);
  const plaintext = Buffer.concat([decipher.update(record.ciphertext), decipher.final()]).toString('utf8');
  return JSON.parse(plaintext);
}

function connectorDto(row) {
  return {
    type: 'ECOWITT',
    enabled: row.enabled === true,
    status: row.status,
    configured: row.has_secret === true,
  };
}

function makeConnectorRegistryService({ pool, keyring } = {}) {
  if (!pool || typeof pool.query !== 'function') throw new TypeError('Connector registry pool is required');
  const normalizedKeyring = normalizeKeyring(keyring);

  async function getOwn(ownerId, publicId) {
    if (!validPublicId(publicId)) return null;
    const result = await pool.query(`
      SELECT c.enabled,c.status,(s.station_id IS NOT NULL) AS has_secret
      FROM meteo.estacions e
      LEFT JOIN meteo.station_connectors c ON c.station_id=e.id
      LEFT JOIN meteo.connector_secrets s ON s.station_id=e.id
      WHERE e.public_id=$1 AND e.owner_id=$2 AND e.management_kind='USER' AND e.lifecycle<>'RETIRED'
    `, [publicId, ownerId]);
    if (result.rowCount !== 1) return null;
    if (!result.rows[0].status) return { type: 'ECOWITT', enabled: false, status: 'UNCONFIGURED', configured: false };
    return connectorDto(result.rows[0]);
  }

  async function setEcowitt(ownerId, publicId, input) {
    if (!validPublicId(publicId)) return { notFound: true };
    const secrets = normalizeEcowittSecrets(input);
    if (!secrets) return { invalid: true };
    const keyId = normalizedKeyring.primaryKeyId;
    const key = normalizedKeyring.keys.get(keyId);
    if (!key) return { unavailable: true };
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const station = await client.query(`
        SELECT id FROM meteo.estacions
        WHERE public_id=$1 AND owner_id=$2 AND management_kind='USER' AND lifecycle<>'RETIRED'
        FOR UPDATE
      `, [publicId, ownerId]);
      if (station.rowCount !== 1) { await client.query('ROLLBACK'); return { notFound: true }; }
      const stationId = station.rows[0].id;
      const encrypted = encryptSecrets(secrets, stationId, keyId, key);
      await client.query(`
        INSERT INTO meteo.station_connectors(station_id,connector_type,configuration,enabled,status)
        VALUES ($1,'ECOWITT',$2,true,'READY')
        ON CONFLICT (station_id) DO UPDATE SET connector_type='ECOWITT',configuration=EXCLUDED.configuration,
          enabled=true,status='READY',updated_at=now()
      `, [stationId, JSON.stringify(ECOWITT_CONFIGURATION)]);
      await client.query(`
        INSERT INTO meteo.connector_secrets(station_id,ciphertext,nonce,auth_tag,key_id)
        VALUES ($1,$2,$3,$4,$5)
        ON CONFLICT (station_id) DO UPDATE SET ciphertext=EXCLUDED.ciphertext,nonce=EXCLUDED.nonce,
          auth_tag=EXCLUDED.auth_tag,key_id=EXCLUDED.key_id,updated_at=now()
      `, [stationId, encrypted.ciphertext, encrypted.nonce, encrypted.authTag, encrypted.keyId]);
      const binding = await client.query(`
        UPDATE meteo.source_bindings
        SET external_id=$2,binding_status='VALIDATED',evidence_ref='OWNER_CONNECTOR'
        WHERE station_id=$1 AND source_namespace='ECOWITT'
        RETURNING id
      `, [stationId, ecowittExternalId(secrets.mac)]);
      if (binding.rowCount === 0) {
        await client.query(`
          INSERT INTO meteo.source_bindings(station_id,source_namespace,external_id,binding_status,evidence_ref)
          VALUES ($1,'ECOWITT',$2,'VALIDATED','OWNER_CONNECTOR')
        `, [stationId, ecowittExternalId(secrets.mac)]);
      }
      await client.query('UPDATE meteo.estacions SET revision=revision+1 WHERE id=$1', [stationId]);
      await client.query('COMMIT');
      return { connector: { type: 'ECOWITT', enabled: true, status: 'READY', configured: true } };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally { client.release(); }
  }

  async function credentialsForStation(stationId) {
    const result = await pool.query(`
      SELECT c.configuration,c.enabled,c.status,s.ciphertext,s.nonce,s.auth_tag,s.key_id
      FROM meteo.station_connectors c JOIN meteo.connector_secrets s ON s.station_id=c.station_id
      WHERE c.station_id=$1 AND c.connector_type='ECOWITT' AND c.enabled=true AND c.status='READY'
    `, [stationId]);
    if (result.rowCount !== 1) return null;
    return { configuration: result.rows[0].configuration,
      secrets: decryptSecrets(result.rows[0], stationId, normalizedKeyring) };
  }

  async function rotateStation(stationId) {
    const keyId = normalizedKeyring.primaryKeyId;
    const key = normalizedKeyring.keys.get(keyId);
    if (!key) return false;
    const current = await pool.query('SELECT ciphertext,nonce,auth_tag,key_id FROM meteo.connector_secrets WHERE station_id=$1', [stationId]);
    if (current.rowCount !== 1) return false;
    if (current.rows[0].key_id === keyId) return true;
    const secrets = decryptSecrets(current.rows[0], stationId, normalizedKeyring);
    const encrypted = encryptSecrets(secrets, stationId, keyId, key);
    await pool.query(`
      UPDATE meteo.connector_secrets SET ciphertext=$2,nonce=$3,auth_tag=$4,key_id=$5,updated_at=now()
      WHERE station_id=$1 AND key_id=$6
    `, [stationId, encrypted.ciphertext, encrypted.nonce, encrypted.authTag, encrypted.keyId, current.rows[0].key_id]);
    return true;
  }

  return { credentialsForStation, getOwn, rotateStation, setEcowitt };
}

module.exports = {
  ECOWITT_CONFIGURATION,
  decryptSecrets,
  encryptSecrets,
  ecowittExternalId,
  makeConnectorRegistryService,
  normalizeEcowittSecrets,
  parseConnectorKeyring,
};
