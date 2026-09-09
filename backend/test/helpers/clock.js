'use strict';

const DEFAULT_FIXED_NOW = '2030-01-15T12:00:00.000Z';

function parseInstant(value) {
  const milliseconds = Date.parse(value);
  if (!Number.isFinite(milliseconds) || new Date(milliseconds).toISOString() !== value) {
    throw new TypeError('Fixed clock instant must be a canonical ISO-8601 UTC string');
  }
  return milliseconds;
}

function createFixedClock(initialInstant = DEFAULT_FIXED_NOW) {
  let currentMilliseconds = parseInstant(initialInstant);

  return Object.freeze({
    now() {
      return new Date(currentMilliseconds);
    },
    nowIso() {
      return new Date(currentMilliseconds).toISOString();
    },
    advance(milliseconds) {
      if (!Number.isSafeInteger(milliseconds) || milliseconds < 0) {
        throw new TypeError('Clock advance must be a non-negative safe integer');
      }
      currentMilliseconds += milliseconds;
      return new Date(currentMilliseconds);
    },
  });
}

module.exports = { DEFAULT_FIXED_NOW, createFixedClock };
