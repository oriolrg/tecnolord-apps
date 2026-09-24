'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  DEFAULT_SOURCE_INTERVAL_SECONDS,
  freshnessAt,
  resolveSourceCadenceConfig,
} = require('../../services/sourceCadence');

const NOW = new Date('2026-09-23T12:00:00.000Z');

test('H05A keeps Ecowitt and the confirmed Grafana default at fifteen minutes', () => {
  assert.deepEqual(DEFAULT_SOURCE_INTERVAL_SECONDS, { ECOWITT: 900, GRAFANA: 900 });
  assert.deepEqual(resolveSourceCadenceConfig({}), {
    grafanaEnabled: false,
    intervals: { ECOWITT: 900, GRAFANA: 900 },
  });
});

test('G01 reads an explicit Grafana cadence without enabling Grafana', () => {
  assert.deepEqual(resolveSourceCadenceConfig({ METEOLORD_GRAFANA_INTERVAL_SECONDS: '420' }), {
    grafanaEnabled: false,
    intervals: { ECOWITT: 900, GRAFANA: 420 },
  });
});

test('G01 activation is strict and invalid cadence values fail at configuration time', () => {
  assert.equal(resolveSourceCadenceConfig({ METEOLORD_GRAFANA_INTERNAL_ENABLED: 'true' }).grafanaEnabled, true);
  assert.throws(
    () => resolveSourceCadenceConfig({ METEOLORD_GRAFANA_INTERNAL_ENABLED: 'TRUE' }),
    /METEOLORD_GRAFANA_INTERNAL_ENABLED/,
  );
  for (const value of ['', '0', '-1', '1.5', '9007199254740992']) {
    assert.throws(
      () => resolveSourceCadenceConfig({ METEOLORD_GRAFANA_INTERVAL_SECONDS: value }),
      /METEOLORD_GRAFANA_INTERVAL_SECONDS/,
    );
  }
});

test('G01 preserves the existing exact two/eight interval freshness contract', () => {
  assert.equal(freshnessAt(new Date(NOW - 2 * 300_000), NOW, 300), 'FRESH');
  assert.equal(freshnessAt(new Date(NOW - 2 * 300_000 - 1), NOW, 300), 'STALE');
  assert.equal(freshnessAt(new Date(NOW - 8 * 300_000), NOW, 300), 'STALE');
  assert.equal(freshnessAt(new Date(NOW - 8 * 300_000 - 1), NOW, 300), 'OBSOLETE');
  assert.equal(freshnessAt('invalid', NOW, 300), 'UNKNOWN');
});

test('H05A applies the existing freshness contract to the confirmed Grafana cadence', () => {
  assert.equal(freshnessAt(new Date(NOW - 2 * 900_000), NOW, 900), 'FRESH');
  assert.equal(freshnessAt(new Date(NOW - 2 * 900_000 - 1), NOW, 900), 'STALE');
  assert.equal(freshnessAt(new Date(NOW - 8 * 900_000), NOW, 900), 'STALE');
  assert.equal(freshnessAt(new Date(NOW - 8 * 900_000 - 1), NOW, 900), 'OBSOLETE');
});
