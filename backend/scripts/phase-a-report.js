#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const ARCHITECTURE = 'linux/amd64';
const STATUS_VALUES = new Set(['PASS', 'FAIL', 'NOT_RUN']);
const VERSION_KEYS = Object.freeze(['node', 'npm', 'docker', 'playwright', 'postgis', 'caddy']);
const IMAGE_KEYS = Object.freeze(['node', 'postgis', 'caddy', 'playwright']);
const CONTROL_NAMES = Object.freeze([
  'config-check',
  'deps-check',
  'static-check',
  'topology-check',
  'test-db-create',
  'migrate --target test',
  'fixtures --target test',
  'backend-check',
  'frontend-check',
  'health-check',
  'health-db-down-check',
  'tasks-check',
  'idempotency-check',
  'egress-check',
  'secrets-check',
  'defect-01-characterization',
  'frontend-regression',
  'test-cleanup',
  'report',
]);
const FORBIDDEN_TERMS = Object.freeze({
  sensitive: /(?:password|passwd|secret|token|api[_-]?key|authorization|cookie|credential|private[_-]?key)/i,
});
const VERSION_PATTERN = /^[A-Za-z0-9][A-Za-z0-9.+_-]{0,63}$/;
const COMMIT_PATTERN = /^[0-9a-f]{40}$/;
const RUN_ID_PATTERN = /^[0-9]{8}-[0-9]{6}-[0-9a-f]{7}$/;
const SHA256_PATTERN = /^sha256:[0-9a-f]{64}$/;

class ReportError extends Error {
  constructor(message, exitCode) {
    super(message);
    this.exitCode = exitCode;
  }
}

function fail(message, exitCode = 69) {
  throw new ReportError(message, exitCode);
}

function parseArgs(argv) {
  const allowed = new Set(['commit', 'run-id', 'evidence-root', 'input', 'output']);
  const args = {};

  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (!flag?.startsWith('--') || value == null || value.startsWith('--')) {
      fail('arguments must be provided as --name value pairs', 64);
    }
    const name = flag.slice(2);
    if (!allowed.has(name) || Object.hasOwn(args, name)) {
      fail('unknown or duplicate argument', 64);
    }
    args[name] = value;
  }

  for (const name of allowed) {
    if (!args[name]) fail(`missing required --${name} argument`, 64);
  }
  return args;
}

function assertExactKeys(value, expected, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail(`${label} must be an object`);
  }
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (actual.length !== wanted.length || actual.some((key, index) => key !== wanted[index])) {
    fail(`${label} contains missing or unsupported fields`);
  }
}

function resolveInside(root, candidate, label, mustExist = true) {
  const resolvedRoot = fs.realpathSync(root);
  const resolved = path.resolve(candidate);
  const relative = path.relative(resolvedRoot, resolved);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    fail(`${label} must be a file below the evidence root`, 64);
  }
  if (mustExist) {
    let stat;
    try {
      stat = fs.lstatSync(resolved);
    } catch {
      fail(`${label} does not exist`);
    }
    if (!stat.isFile() || stat.isSymbolicLink()) fail(`${label} must be a regular file`);
    const real = fs.realpathSync(resolved);
    const realRelative = path.relative(resolvedRoot, real);
    if (realRelative.startsWith('..') || path.isAbsolute(realRelative)) {
      fail(`${label} resolves outside the evidence root`);
    }
  } else {
    const parent = fs.realpathSync(path.dirname(resolved));
    const parentRelative = path.relative(resolvedRoot, parent);
    if (parentRelative.startsWith('..') || path.isAbsolute(parentRelative)) {
      fail(`${label} parent resolves outside the evidence root`, 64);
    }
    if (fs.existsSync(resolved) && fs.lstatSync(resolved).isSymbolicLink()) {
      fail(`${label} must not be a symbolic link`, 64);
    }
  }
  return { absolute: resolved, relative: relative.split(path.sep).join('/') };
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    fail('report input is missing or is not valid JSON');
  }
}

function validateVersions(versions) {
  assertExactKeys(versions, VERSION_KEYS, 'versions');
  const clean = {};
  for (const key of VERSION_KEYS) {
    const value = versions[key];
    if (typeof value !== 'string' || !VERSION_PATTERN.test(value) || FORBIDDEN_TERMS.sensitive.test(value)) {
      fail(`version ${key} is invalid`);
    }
    clean[key] = value;
  }
  return clean;
}

function parseImageLocks(repoRoot) {
  const lockPath = path.join(repoRoot, 'config', 'meteolord', 'images.lock.env');
  let source;
  try {
    source = fs.readFileSync(lockPath, 'utf8');
  } catch {
    fail('image lock file is missing');
  }

  const variableNames = {
    node: 'NODE_IMAGE',
    postgis: 'POSTGIS_IMAGE',
    caddy: 'CADDY_IMAGE',
    playwright: 'PLAYWRIGHT_IMAGE',
  };
  const digests = {};
  for (const key of IMAGE_KEYS) {
    const expression = new RegExp(`^${variableNames[key]}="[^"\\r\\n]+@(sha256:[0-9a-f]{64})"$`, 'm');
    const match = source.match(expression);
    if (!match || !SHA256_PATTERN.test(match[1])) fail(`image digest ${key} is missing or invalid`);
    digests[key] = match[1];
  }
  return digests;
}

function lockHash(repoRoot) {
  const lockPath = path.join(repoRoot, 'backend', 'package-lock.json');
  let contents;
  try {
    contents = fs.readFileSync(lockPath);
  } catch {
    fail('package lock file is missing');
  }
  return crypto.createHash('sha256').update(contents).digest('hex');
}

function validateArtifact(evidenceRoot, artifact, order) {
  if (typeof artifact !== 'string' || artifact.length === 0 || artifact.includes('\\')) {
    fail(`control ${order} artifact is invalid`);
  }
  if (FORBIDDEN_TERMS.sensitive.test(artifact)) fail(`control ${order} artifact name is not allowed`);
  const candidate = path.resolve(evidenceRoot, artifact);
  return resolveInside(evidenceRoot, candidate, `control ${order} artifact`).relative;
}

function validateControls(controls, evidenceRoot) {
  if (!Array.isArray(controls) || controls.length !== CONTROL_NAMES.length) {
    fail(`controls must contain exactly ${CONTROL_NAMES.length} entries`);
  }

  return controls.map((control, index) => {
    const order = index + 1;
    assertExactKeys(
      control,
      ['name', 'order', 'exit_code', 'status', 'artifact', 'duration_ms'],
      `control ${order}`
    );
    if (control.name !== CONTROL_NAMES[index] || control.order !== order) {
      fail(`control ${order} name or order is invalid`);
    }
    if (!STATUS_VALUES.has(control.status)) fail(`control ${order} status is invalid`);
    if (!Number.isInteger(control.duration_ms) || control.duration_ms < 0) {
      fail(`control ${order} duration is invalid`);
    }

    if (control.status === 'NOT_RUN') {
      if (control.exit_code !== null || control.artifact !== null || control.duration_ms !== 0) {
        fail(`control ${order} NOT_RUN fields are inconsistent`);
      }
      return { ...control };
    }

    if (!Number.isInteger(control.exit_code)) fail(`control ${order} exit code is invalid`);
    if (control.status === 'PASS' && control.exit_code !== 0) {
      fail(`control ${order} PASS requires exit code zero`);
    }
    if (control.status === 'FAIL' && control.exit_code === 0) {
      fail(`control ${order} FAIL requires a non-zero exit code`);
    }

    return {
      ...control,
      artifact: validateArtifact(evidenceRoot, control.artifact, order),
    };
  });
}

function gateStatus(controls) {
  if (controls.some((control) => control.status === 'FAIL')) return 'FAIL';
  if (controls.some((control) => control.status === 'NOT_RUN')) return 'NOT_RUN';
  return 'PASS';
}

function buildReport({ commit, runId, evidenceRoot, input, repoRoot }) {
  if (!COMMIT_PATTERN.test(commit)) fail('commit must be a full lowercase SHA', 64);
  if (!RUN_ID_PATTERN.test(runId) || runId.slice(-7) !== commit.slice(0, 7)) {
    fail('run-id is invalid or does not match the commit', 64);
  }
  assertExactKeys(input, ['versions', 'controls'], 'report input');
  const controls = validateControls(input.controls, evidenceRoot);
  return {
    commit,
    run_id: runId,
    architecture: ARCHITECTURE,
    versions: validateVersions(input.versions),
    digests: parseImageLocks(repoRoot),
    lock_hash: lockHash(repoRoot),
    gate_status: gateStatus(controls),
    controls,
  };
}

function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const repoRoot = path.resolve(__dirname, '..', '..');
  const evidenceRoot = fs.realpathSync(args['evidence-root']);
  const inputFile = resolveInside(evidenceRoot, args.input, 'report input');
  const outputFile = resolveInside(evidenceRoot, args.output, 'report output', false);
  const input = readJson(inputFile.absolute);
  const report = buildReport({
    commit: args.commit,
    runId: args['run-id'],
    evidenceRoot,
    input,
    repoRoot,
  });
  fs.writeFileSync(outputFile.absolute, `${JSON.stringify(report, null, 2)}\n`, {
    encoding: 'utf8',
    mode: 0o600,
  });
  fs.chmodSync(outputFile.absolute, 0o600);
  process.stdout.write(`phase-a-report: wrote ${outputFile.relative} (${report.gate_status})\n`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    const exitCode = error instanceof ReportError ? error.exitCode : 69;
    const message = error instanceof ReportError ? error.message : 'unexpected report error';
    process.stderr.write(`phase-a-report: ${message}\n`);
    process.exitCode = exitCode;
  }
}

module.exports = {
  ARCHITECTURE,
  CONTROL_NAMES,
  buildReport,
  main,
};
