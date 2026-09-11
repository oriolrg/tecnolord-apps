'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { ALLOWED_FIELD_SET, REDACTED, createLogger } = require('../../lib/logger');
const { createTaskRunner } = require('../../routes/tasks');
const { createApp } = require('../../server');
const { createFixedClock } = require('../helpers/clock');

const CANARY = ['secret', 'canary', 't17', '9f7c2a61'].join('-');
const FIXED_TIME = '2030-01-15T12:00:00.000Z';

function captureLogger() {
  const lines = [];
  const logger = createLogger({
    clock: () => new Date(FIXED_TIME),
    stream: { write: (line) => lines.push(line) },
  });
  return { lines, logger };
}

function parseAndValidateJsonl(lines) {
  assert.ok(lines.length > 0, 'expected at least one log line');
  return lines.map((line) => {
    assert.ok(line.endsWith('\n'), 'each event must end with one newline');
    assert.equal(line.trim().split('\n').length, 1, 'each event must occupy one JSONL line');
    const event = JSON.parse(line);
    for (const field of Object.keys(event)) {
      assert.ok(ALLOWED_FIELD_SET.has(field), `forbidden log field: ${field}`);
    }
    assert.equal(event.timestamp, FIXED_TIME);
    return event;
  });
}

async function withServer({ logger, pool, correlationIdFactory }, callback) {
  const app = createApp({
    environment: { METEOLORD_ENV: 'test' },
    pool,
    httpClient: async () => { throw new Error('provider access is forbidden in log tests'); },
    clock: createFixedClock(),
    logger,
    correlationIdFactory,
  });
  const server = await new Promise((resolve) => {
    const listener = app.listen(0, '127.0.0.1', () => resolve(listener));
  });
  try {
    await callback(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
}

function readArtifactText(root) {
  if (!root || !fs.existsSync(root)) return '';
  const content = [];
  const pending = [root];
  while (pending.length) {
    const current = pending.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const target = path.join(current, entry.name);
      if (entry.isDirectory()) pending.push(target);
      else if (entry.isFile()) content.push(fs.readFileSync(target, 'utf8'));
    }
  }
  return content.join('\n');
}

test('logger emits strict JSONL allowlist and redacts secret-like allowed values', () => {
  const { lines, logger } = captureLogger();
  logger.error('security.probe', {
    correlation_id: 'corr_t17_direct_0001',
    result: 'error',
    duration_ms: 1.25,
    rows: 0,
    error_code: `secret=${CANARY}`,
    headers: { authorization: CANARY },
    cookies: CANARY,
    query: `?key=${CANARY}`,
    payload: { value: CANARY },
    stack: CANARY,
  });

  const [event] = parseAndValidateJsonl(lines);
  assert.equal(event.error_code, REDACTED);
  assert.ok(!lines.join('').includes(CANARY));
  assert.ok(!Object.hasOwn(event, 'headers'));
  assert.ok(!Object.hasOwn(event, 'payload'));
  assert.ok(!Object.hasOwn(event, 'stack'));
});

test('HTTP ok/error logs use unique propagated correlation IDs without request secrets', async () => {
  const { lines, logger } = captureLogger();
  let sequence = 0;
  const ids = [];
  const responseText = [];
  const pool = {
    async query() {
      throw new Error(`database failure ${CANARY}`);
    },
  };

  await withServer({
    logger,
    pool,
    correlationIdFactory: () => `corr_t17_http_${String(++sequence).padStart(4, '0')}`,
  }, async (baseUrl) => {
    const ping = await fetch(`${baseUrl}/api/ping?key=${encodeURIComponent(CANARY)}`, {
      headers: {
        authorization: `Bearer ${CANARY}`,
        cookie: `session=${CANARY}`,
      },
    });
    ids.push(ping.headers.get('x-correlation-id'));
    responseText.push(await ping.text());
    assert.equal(ping.status, 200);

    const health = await fetch(`${baseUrl}/health`, {
      headers: { 'x-correlation-id': CANARY },
    });
    ids.push(health.headers.get('x-correlation-id'));
    responseText.push(await health.text());
    assert.equal(health.status, 503);

    const mesures = await fetch(`${baseUrl}/api/v1/mesures/darreres?token=${encodeURIComponent(CANARY)}`);
    ids.push(mesures.headers.get('x-correlation-id'));
    responseText.push(await mesures.text());
    assert.equal(mesures.status, 500);
  });

  await new Promise((resolve) => setImmediate(resolve));
  const events = parseAndValidateJsonl(lines);
  const httpEvents = events.filter((event) => event.operation === 'http.request');
  const healthEvent = events.find((event) => event.operation === 'health.database');
  const queryEvent = events.find((event) => event.operation === 'route.mesures');
  assert.equal(new Set(ids).size, 3);
  assert.deepEqual(ids, ['corr_t17_http_0001', 'corr_t17_http_0002', 'corr_t17_http_0003']);
  assert.deepEqual(httpEvents.map((event) => event.correlation_id), ids);
  assert.deepEqual(httpEvents.map((event) => event.result), ['HTTP_200', 'HTTP_503', 'HTTP_500']);
  assert.equal(healthEvent.correlation_id, ids[1]);
  assert.equal(healthEvent.error_code, 'DB_UNAVAILABLE');
  assert.equal(queryEvent.correlation_id, ids[2]);
  assert.equal(queryEvent.error_code, 'DB_QUERY_FAILED');
  assert.ok(!lines.join('').includes(CANARY));
  assert.ok(!responseText.join('').includes(CANARY));
});

test('task ok/error logs preserve correlation and never serialize thrown errors', async () => {
  const { lines, logger } = captureLogger();
  const runner = createTaskRunner({
    pullEcowittAndSave: async () => ({ id: 1 }),
    pullACAAndSave: async () => { throw new Error(`provider failure ${CANARY}`); },
    pullPreviAndSave: async () => ({ id: 2 }),
    logger,
  });

  await runner('ecowitt', { correlation_id: 'corr_t17_task_0001' });
  await assert.rejects(
    runner('aca', { correlation_id: 'corr_t17_task_0002' }),
    /provider failure/
  );

  const events = parseAndValidateJsonl(lines);
  assert.deepEqual(events.map((event) => event.correlation_id), [
    'corr_t17_task_0001',
    'corr_t17_task_0002',
  ]);
  assert.deepEqual(events.map((event) => event.result), ['ok', 'error']);
  assert.equal(events[1].error_code, 'TASK_EXECUTION_FAILED');
  assert.ok(!lines.join('').includes(CANARY));
});

test('T17 evidence contains no synthetic canary', () => {
  const artifactText = readArtifactText(process.env.T17_EVIDENCE_DIR);
  assert.ok(!artifactText.includes(CANARY));
});
