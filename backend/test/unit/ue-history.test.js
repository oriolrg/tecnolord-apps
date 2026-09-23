'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { policyInput } = require('../../services/stationHistoryService');

test('UE-T17 validates history cadence, retention and optimistic revision boundaries', () => {
  assert.deepEqual(policyInput({ enabled: true, capture_interval_minutes: 5, retention_days: 1, revision: 0 }),
    { enabled: true, capture_interval_minutes: 5, retention_days: 1, revision: 0 });
  assert.ok(policyInput({ enabled: false, capture_interval_minutes: 1440, retention_days: 3650, revision: 8 }));
  for (const input of [
    null,
    { enabled: 'true', capture_interval_minutes: 15, retention_days: 30, revision: 0 },
    { enabled: true, capture_interval_minutes: 4, retention_days: 30, revision: 0 },
    { enabled: true, capture_interval_minutes: 1441, retention_days: 30, revision: 0 },
    { enabled: true, capture_interval_minutes: 15, retention_days: 0, revision: 0 },
    { enabled: true, capture_interval_minutes: 15, retention_days: 3651, revision: 0 },
    { enabled: true, capture_interval_minutes: 15, retention_days: 30, revision: -1 },
  ]) assert.equal(policyInput(input), null);
});

