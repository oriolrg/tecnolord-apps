'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

async function loadScheduler() {
  const source = require('node:fs').readFileSync(
    require('node:path').resolve(__dirname, '../../../site/src/ui/screenRefresh.js'), 'utf8',
  );
  const encoded = Buffer.from(`${source}\n//# sourceURL=screen-refresh-test.js`).toString('base64');
  return import(`data:text/javascript;base64,${encoded}`);
}

function harness(active = false) {
  const window = new EventTarget();
  const document = new EventTarget();
  document.visibilityState = 'visible';
  const root = { classList: { contains: (name) => name === 'active' && active } };
  global.window = window;
  global.document = document;
  return { window, document, root, setActive(value) { active = value; } };
}

test('hidden screens do not refresh until they become active, then refresh once', async () => {
  const { installScreenRefresh } = await loadScheduler();
  const h = harness(false);
  let calls = 0;
  const scheduler = installScreenRefresh({ root: h.root, intervalMs: 20, initialRefresh: true, refresh: () => { calls += 1; } });
  h.window.dispatchEvent(new Event('meteo:screen-active'));
  await new Promise((resolve) => setTimeout(resolve, 5));
  assert.equal(calls, 0);
  h.setActive(true);
  h.window.dispatchEvent(new Event('meteo:screen-active'));
  await new Promise((resolve) => setTimeout(resolve, 5));
  assert.equal(calls, 1);
  scheduler.dispose();
  delete global.window;
  delete global.document;
});

test('concurrent refresh requests are coalesced into one in-flight call', async () => {
  const { installScreenRefresh } = await loadScheduler();
  const h = harness(true);
  let calls = 0;
  let release;
  const scheduler = installScreenRefresh({
    root: h.root,
    intervalMs: 1000,
    refresh: () => {
      calls += 1;
      return new Promise((resolve) => { release = resolve; });
    },
  });
  const first = scheduler.refreshNow();
  const second = scheduler.refreshNow();
  assert.equal(first, second);
  assert.equal(calls, 1);
  release();
  await first;
  scheduler.dispose();
  delete global.window;
  delete global.document;
});
