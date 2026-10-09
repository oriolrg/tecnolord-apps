'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
function load(name) {
  const text = fs.readFileSync(path.resolve(__dirname, '../../../site/src', name), 'utf8');
  return import(`data:text/javascript;base64,${Buffer.from(text).toString('base64')}`);
}

test('header recovers name for USER and SUPERADMIN, clears on logout, never falls back to email', async () => {
  const { updateTecnolordHeaderSession } = await load('ui/components/tecnolordHeader.js');
  const attrs = {};
  const action = { setAttribute: (name, value) => { attrs[name] = value; } };
  const root = { querySelector: () => action };
  for (const role of ['USER', 'SUPERADMIN']) {
    updateTecnolordHeaderSession(root, { user: { name: '  Oriol Riu  ', role } });
    assert.equal(action.textContent, 'Oriol Riu');
    assert.equal(attrs['aria-label'], 'Compte de Oriol Riu');
  }
  updateTecnolordHeaderSession(root, null);
  assert.equal(action.textContent, 'Inicia sessió');
  updateTecnolordHeaderSession(root, { user: { name: '', email: 'private@example.invalid' } });
  assert.equal(action.textContent, 'El meu compte');
  updateTecnolordHeaderSession(root, { user: { name: '<b>Nom</b>' } });
  assert.equal(action.textContent, '<b>Nom</b>'); // Assigned as text, never innerHTML.
});

const oldVersion = 'a'.repeat(64);
const newVersion = 'b'.repeat(64);
const tick = () => new Promise((resolve) => setImmediate(resolve));
async function updates(t, fetcher, { url = `https://test.invalid/meteo/releases/${oldVersion}/src/main.js`, saved } = {}) {
  const { installClientUpdates } = await load('clientUpdates.js');
  const original = global.fetch;
  global.fetch = fetcher;
  t.after(() => { global.fetch = original; });
  const window = new EventTarget();
  const document = new EventTarget();
  document.visibilityState = 'visible';
  let reloads = 0;
  window.location = { reload: () => { reloads++; } };
  const storage = new Map(saved ? [['meteolord:last-reload', saved]] : []);
  window.sessionStorage = { getItem: (key) => storage.get(key), setItem: (key, value) => storage.set(key, value) };
  const dispose = installClientUpdates(url, window, document);
  t.after(dispose);
  await tick();
  return { window, document, dispose, reloads: () => reloads };
}

test('resume detects new release once, fetching metadata without cache; same version stays open', async (t) => {
  let version = oldVersion;
  const u = await updates(t, async (url, options) => {
    assert.equal(url, '/meteo/release.json');
    assert.equal(options.cache, 'no-store');
    return { ok: true, json: async () => ({ version }) };
  });
  assert.equal(u.reloads(), 0);
  version = newVersion;
  u.window.dispatchEvent(new Event('focus'));
  await tick();
  assert.equal(u.reloads(), 1);
  u.document.dispatchEvent(new Event('visibilitychange'));
  await tick();
  assert.equal(u.reloads(), 1);
});

test('offline release check preserves app, hidden document waits, disposed document cannot reload', async (t) => {
  let calls = 0;
  const u = await updates(t, async () => { calls++; throw new Error('offline'); });
  assert.equal(u.reloads(), 0);
  u.document.visibilityState = 'hidden';
  u.window.dispatchEvent(new Event('focus'));
  await tick();
  assert.equal(calls, 1);
  u.dispose();
  u.document.visibilityState = 'visible';
  u.window.dispatchEvent(new Event('pageshow'));
  await tick();
  assert.equal(calls, 1);
});

test('stale proxy response cannot cause a reload loop across documents', async (t) => {
  const u = await updates(t, async () => ({ ok: true, json: async () => ({ version: newVersion }) }), { saved: newVersion });
  assert.equal(u.reloads(), 0);
});

test('source preview does not request release metadata or alter local runtime', async (t) => {
  let calls = 0;
  const u = await updates(t, async () => { calls++; }, { url: 'https://test.invalid/meteo/src/main.js' });
  assert.equal(calls, 0);
  assert.equal(u.reloads(), 0);
});
