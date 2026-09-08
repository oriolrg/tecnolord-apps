'use strict';

const REQUIRED_VARIABLES = [
  'METEOLORD_ENV',
  'METEOLORD_PROVIDER_MODE',
  'METEOLORD_ALLOW_SYNTHETIC',
  'METEOLORD_EXTERNAL_NETWORK',
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'INGEST_API_KEY',
];

const SAFE_IDENTIFIER = /^[a-z][a-z0-9_]{0,62}$/;
const SAFE_SYNTHETIC_SECRET = /^[A-Za-z0-9_-]{12,128}$/;
const PRODUCTION_MARKER = /(?:^|[._-])(?:prod|production|produccio|productiu)(?:$|[._-])/i;

function normalizedValue(environment, name) {
  const value = environment[name];
  return typeof value === 'string' ? value.trim() : '';
}

function addExactValueError(errors, environment, name, expected) {
  const value = normalizedValue(environment, name);
  if (value && value !== expected) {
    errors.push(`${name} must use the required local-only value`);
  }
}

function validateLocalConfig(environment = process.env) {
  const errors = [];

  for (const name of REQUIRED_VARIABLES) {
    if (!Object.prototype.hasOwnProperty.call(environment, name)) {
      errors.push(`${name} is required`);
    } else if (!normalizedValue(environment, name)) {
      errors.push(`${name} must not be empty`);
    }
  }

  for (const name of REQUIRED_VARIABLES) {
    const value = normalizedValue(environment, name);
    if (value && PRODUCTION_MARKER.test(value)) {
      errors.push(`${name} contains a forbidden production indicator`);
    }
  }

  addExactValueError(errors, environment, 'METEOLORD_ENV', 'local');
  addExactValueError(errors, environment, 'METEOLORD_PROVIDER_MODE', 'synthetic');
  addExactValueError(errors, environment, 'METEOLORD_ALLOW_SYNTHETIC', 'true');
  addExactValueError(errors, environment, 'METEOLORD_EXTERNAL_NETWORK', 'deny');
  addExactValueError(errors, environment, 'DB_HOST', 'db');
  addExactValueError(errors, environment, 'DB_PORT', '5432');

  for (const name of ['DB_NAME', 'DB_USER']) {
    const value = normalizedValue(environment, name);
    if (value && !SAFE_IDENTIFIER.test(value)) {
      errors.push(`${name} has invalid local identifier syntax`);
    }
  }

  for (const name of ['DB_PASSWORD', 'INGEST_API_KEY']) {
    const value = normalizedValue(environment, name);
    if (value && !SAFE_SYNTHETIC_SECRET.test(value)) {
      errors.push(`${name} must be a 12-128 character synthetic token`);
    } else if (value && !/(?:local|synthetic)/i.test(value)) {
      errors.push(`${name} must be explicitly marked as local or synthetic`);
    }
  }

  return { ok: errors.length === 0, errors };
}

function runCli() {
  const result = validateLocalConfig(process.env);

  if (result.ok) {
    console.log('Local configuration is valid and fail-closed.');
    return 0;
  }

  console.error('Local configuration rejected:');
  for (const error of result.errors) {
    console.error(`- ${error}`);
  }
  return 64;
}

if (require.main === module) {
  process.exitCode = runCli();
}

module.exports = {
  REQUIRED_VARIABLES,
  validateLocalConfig,
};
