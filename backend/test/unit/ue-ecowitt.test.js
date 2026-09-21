'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  decryptSecrets, encryptSecrets, normalizeEcowittSecrets, parseConnectorKeyring,
} = require('../../services/connectorRegistryService');
const { ECOWITT_CONFIGURATION } = require('../../services/connectorRegistryService');
const { ecowittURLForConnector, fetchEcowittConnector, numberOrNull } = require('../../services/ecowittService');

test('UE-T06 encrypts connector secrets with station-bound AES-GCM and supports keyrings', () => {
  const oldKey = Buffer.alloc(32, 1);
  const ring = parseConnectorKeyring(`new:${Buffer.alloc(32, 2).toString('base64url')},old:${oldKey.toString('base64url')}`);
  assert.equal(ring.primaryKeyId, 'new');
  const secrets = { application_key: 'synthetic-app', api_key: 'synthetic-api', mac: 'synthetic-mac' };
  const encrypted = encryptSecrets(secrets, 7, 'old', oldKey);
  assert.deepEqual(decryptSecrets({
    ciphertext: encrypted.ciphertext, nonce: encrypted.nonce, auth_tag: encrypted.authTag, key_id: 'old',
  }, 7, ring), secrets);
  assert.throws(() => decryptSecrets({
    ciphertext: encrypted.ciphertext, nonce: encrypted.nonce, auth_tag: encrypted.authTag, key_id: 'old',
  }, 8, ring));
  assert.equal(encrypted.ciphertext.includes(Buffer.from('synthetic-api')), false);
});

test('UE-T06 accepts only fixed Ecowitt credentials and preserves numeric zero', async () => {
  const secrets = { application_key: 'synthetic-app', api_key: 'synthetic-api', mac: 'synthetic-mac' };
  assert.deepEqual(normalizeEcowittSecrets(secrets), secrets);
  assert.equal(normalizeEcowittSecrets({ ...secrets, url: 'https://evil.invalid' }), null);
  assert.equal(numberOrNull('0'), 0);
  assert.equal(numberOrNull(''), null);
  const url = new URL(ecowittURLForConnector(ECOWITT_CONFIGURATION, secrets));
  assert.equal(url.origin, 'https://api.ecowitt.net');
  assert.equal(url.searchParams.get('api_key'), secrets.api_key);
  let request;
  const result = await fetchEcowittConnector({ configuration: ECOWITT_CONFIGURATION, secrets }, async (input, init) => {
    request = { input: String(input), init };
    return { ok: true, status: 200, async json() { return { code: 0, data: { outdoor: { temperature: { value: '0' } } } }; } };
  });
  assert.equal(result.ok, true);
  assert.equal(request.init.redirect, 'error');
  assert.equal(new URL(request.input).origin, 'https://api.ecowitt.net');
});
