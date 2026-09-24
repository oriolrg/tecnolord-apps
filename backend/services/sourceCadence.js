'use strict';

const DEFAULT_SOURCE_INTERVAL_SECONDS = Object.freeze({
  ECOWITT: 15 * 60,
  GRAFANA: 15 * 60,
});

const FRESH_INTERVALS = 2;
const STALE_INTERVALS = 8;

function booleanSetting(environment, name, fallback = false) {
  const value = environment?.[name];
  if (value === undefined) return fallback;
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new TypeError(`${name} must be true or false`);
}

function positiveIntegerSetting(environment, name, fallback) {
  const value = environment?.[name];
  if (value === undefined) return fallback;
  if (typeof value !== 'string' || !/^[1-9][0-9]*$/.test(value)) {
    throw new TypeError(`${name} must be a positive integer in seconds`);
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed)) {
    throw new TypeError(`${name} must be a positive integer in seconds`);
  }
  return parsed;
}

function resolveSourceCadenceConfig(environment = process.env) {
  return Object.freeze({
    grafanaEnabled: booleanSetting(environment, 'METEOLORD_GRAFANA_INTERNAL_ENABLED'),
    intervals: Object.freeze({
      ECOWITT: DEFAULT_SOURCE_INTERVAL_SECONDS.ECOWITT,
      GRAFANA: positiveIntegerSetting(
        environment,
        'METEOLORD_GRAFANA_INTERVAL_SECONDS',
        DEFAULT_SOURCE_INTERVAL_SECONDS.GRAFANA,
      ),
    }),
  });
}

function freshnessAt(
  observedAt,
  now = new Date(),
  intervalSeconds = DEFAULT_SOURCE_INTERVAL_SECONDS.ECOWITT,
) {
  const observed = new Date(observedAt);
  const current = new Date(now);
  if (Number.isNaN(observed.getTime()) || Number.isNaN(current.getTime())) return 'UNKNOWN';
  if (!Number.isSafeInteger(intervalSeconds) || intervalSeconds <= 0) {
    throw new TypeError('Source interval must be a positive integer in seconds');
  }
  const age = Math.max(0, current.getTime() - observed.getTime());
  const intervalMs = intervalSeconds * 1000;
  if (age <= FRESH_INTERVALS * intervalMs) return 'FRESH';
  if (age <= STALE_INTERVALS * intervalMs) return 'STALE';
  return 'OBSOLETE';
}

module.exports = {
  DEFAULT_SOURCE_INTERVAL_SECONDS,
  FRESH_INTERVALS,
  STALE_INTERVALS,
  freshnessAt,
  resolveSourceCadenceConfig,
};
