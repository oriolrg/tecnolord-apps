'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  hashPassword, normalizeEmail, normalizeName, verifyPassword, csrfFor, digest,
} = require('../../services/identityService');
const { connection, parseArgs } = require('../../scripts/bootstrap-admin');
const { makeLocalMailOutbox } = require('../../services/localMailOutbox');
const fs = require('node:fs/promises');

test('password hash uses unique salt, verifies correctly, and never stores plaintext', async () => {
  const password = 'synthetic-passphrase-2026';
  const first = await hashPassword(password);
  const second = await hashPassword(password);
  assert.notEqual(first, second);
  assert.equal(first.includes(password), false);
  assert.equal(await verifyPassword(password, first), true);
  assert.equal(await verifyPassword('synthetic-wrong-2026', first), false);
  assert.equal(await verifyPassword(password, 'invalid-hash'), false);
});

test('identity inputs and local bootstrap guard reject unsafe values', async () => {
  assert.equal(normalizeEmail('  TEST@EXAMPLE.INVALID '), 'test@example.invalid');
  assert.equal(normalizeEmail('bad address'), null);
  assert.equal(normalizeName('  Usuari   Sintètic  '), 'Usuari Sintètic');
  assert.equal(normalizeName('x'), null);
  await assert.rejects(() => hashPassword('short'), TypeError);
  assert.deepEqual(parseArgs(['--user-id', '7', '--email', 'admin@example.invalid', '--audit-ref', 'synthetic-ue-01']), {
    userId: 7, email: 'admin@example.invalid', auditRef: 'synthetic-ue-01',
  });
  assert.throws(() => parseArgs(['--user-id', '0', '--email', 'admin@example.invalid', '--audit-ref', 'synthetic-ue-01']));
  assert.throws(() => connection({ METEOLORD_ENV: 'production', POSTGRES_HOST: 'db', POSTGRES_DB: 'meteolord_local' }));
  assert.throws(() => connection({ METEOLORD_ENV: 'test', POSTGRES_HOST: 'db', POSTGRES_DB: 'meteolord_prod' }));
  const csrf = csrfFor('synthetic-token');
  assert.equal(digest(csrf).length, 32);
});

test('local recovery outbox is private and refuses paths outside its allowlist', async () => {
  assert.throws(() => makeLocalMailOutbox('/home/user/mail.jsonl'));
  const file = `/tmp/meteolord-ue-mail-${process.pid}.jsonl`;
  const deliver = makeLocalMailOutbox(file);
  try {
    await deliver({ kind: 'password_reset', to: 'synthetic@example.invalid', token: 'synthetic-one-time-token' });
    const stat = await fs.stat(file);
    assert.equal(stat.mode & 0o077, 0);
    const messages = (await fs.readFile(file, 'utf8')).trim().split('\n').map((line) => JSON.parse(line));
    assert.deepEqual(messages, [{ kind: 'password_reset', to: 'synthetic@example.invalid', token: 'synthetic-one-time-token' }]);
  } finally { await fs.rm(file, { force: true }); }
});
