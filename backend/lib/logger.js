'use strict';

const { currentRequestContext } = require('../middleware/requestContext');

const ALLOWED_FIELDS = Object.freeze([
  'timestamp',
  'level',
  'service',
  'operation',
  'correlation_id',
  'result',
  'duration_ms',
  'rows',
  'error_code',
]);
const ALLOWED_FIELD_SET = new Set(ALLOWED_FIELDS);
const LEVELS = new Set(['debug', 'info', 'warn', 'error']);
const REDACTED = '[REDACTED]';
const SECRET_PATTERNS = Object.freeze([
  /\b(?:authorization|cookie|password|passwd|secret|token|api[-_ ]?key|session)\b\s*[:=]\s*\S+/i,
  /\b(?:bearer|basic)\s+[a-z0-9._~+/=-]+/i,
  /[?&](?:key|token|access_token|api_key|password|secret)=/i,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/i,
  /\b(?:secret|credential)[-_ ]?canary\b/i,
]);

function looksLikeSecret(value) {
  return typeof value === 'string' && SECRET_PATTERNS.some((pattern) => pattern.test(value));
}

function safeString(value, maxLength = 128) {
  if (value === undefined || value === null) return undefined;
  const text = String(value);
  if (looksLikeSecret(text)) return REDACTED;
  return text.length <= maxLength ? text : `${text.slice(0, maxLength - 1)}…`;
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : undefined;
}

function normalizeTimestamp(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new TypeError('Logger clock returned an invalid timestamp');
  return date.toISOString();
}

function serializeLogEvent({ level, service, operation, fields = {}, timestamp }) {
  const normalizedLevel = LEVELS.has(level) ? level : 'info';
  const event = {
    timestamp: normalizeTimestamp(timestamp),
    level: normalizedLevel,
    service: safeString(service, 64) || 'meteolord-backend',
    operation: safeString(operation, 96) || 'unknown',
  };

  for (const field of ALLOWED_FIELDS.slice(4)) {
    if (!Object.hasOwn(fields, field)) continue;
    const value = field === 'duration_ms' || field === 'rows'
      ? safeNumber(fields[field])
      : safeString(fields[field], field === 'error_code' ? 64 : 128);
    if (value !== undefined) event[field] = value;
  }

  return JSON.stringify(event);
}

function createLogger({
  service = 'meteolord-backend',
  stream = process.stdout,
  clock = () => new Date(),
} = {}) {
  if (!stream || typeof stream.write !== 'function') {
    throw new TypeError('Logger stream must implement write()');
  }
  if (typeof clock !== 'function') throw new TypeError('Logger clock must be a function');

  function emit(level, operation, fields = {}) {
    const context = currentRequestContext();
    const contextualFields = context && fields.correlation_id === undefined
      ? { ...fields, correlation_id: context.correlation_id }
      : fields;
    const line = serializeLogEvent({
      level,
      service,
      operation,
      fields: contextualFields,
      timestamp: clock(),
    });
    stream.write(`${line}\n`);
    return line;
  }

  return Object.freeze({
    debug: (operation, fields) => emit('debug', operation, fields),
    info: (operation, fields) => emit('info', operation, fields),
    warn: (operation, fields) => emit('warn', operation, fields),
    error: (operation, fields) => emit('error', operation, fields),
  });
}

const NULL_LOGGER = Object.freeze({
  debug() {},
  info() {},
  warn() {},
  error() {},
});

function isLogger(logger) {
  return logger
    && ['debug', 'info', 'warn', 'error'].every((level) => typeof logger[level] === 'function');
}

module.exports = {
  ALLOWED_FIELDS,
  ALLOWED_FIELD_SET,
  NULL_LOGGER,
  REDACTED,
  createLogger,
  isLogger,
  looksLikeSecret,
  serializeLogEvent,
};
