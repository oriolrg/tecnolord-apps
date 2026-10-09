'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '../../..');
const RUNNER = path.join(ROOT, 'scripts/deploy-meteolord-frontend.sh');

function copy(source, destination) {
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'meteo-frontend-deploy-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const repo = path.join(root, 'repo');
  const site = path.join(repo, 'site');
  const source = path.join(root, 'source');
  const state = path.join(root, 'state');
  const bin = path.join(root, 'bin');
  fs.mkdirSync(bin, { recursive: true });
  copy(path.join(ROOT, 'Caddyfile'), path.join(repo, 'Caddyfile'));
  for (const relative of ['index.html', 'compte/index.html', 'mapa/index.html', 'assets/icons/site.webmanifest']) {
    fs.mkdirSync(path.dirname(path.join(site, relative)), { recursive: true });
    fs.writeFileSync(path.join(site, relative), `legacy ${relative}\n`);
  }
  copy(path.join(ROOT, 'scripts/frontend/build-meteo.js'), path.join(source, 'scripts/frontend/build-meteo.js'));
  fs.cpSync(path.join(ROOT, 'site'), path.join(source, 'site'), { recursive: true });
  const packagePath = path.join(root, 'release-source.tar.gz');
  const packed = spawnSync('tar', ['-czf', packagePath, '-C', source, '.'], { encoding: 'utf8' });
  assert.equal(packed.status, 0, packed.stderr);

  const docker = path.join(bin, 'docker');
  fs.writeFileSync(docker, `#!/usr/bin/env bash
set -euo pipefail
if [[ "$1" == image && "$2" == inspect ]]; then exit 0; fi
[[ "$1" == run ]]
workspace=''; output=''
for arg in "$@"; do
  case "$arg" in
    type=bind,src=*,dst=/workspace,readonly) workspace="\${arg#type=bind,src=}"; workspace="\${workspace%,dst=/workspace,readonly}" ;;
    type=bind,src=*,dst=/output) output="\${arg#type=bind,src=}"; output="\${output%,dst=/output}" ;;
  esac
done
target="\${@: -1}"
target="\${target#/output}"
node "$workspace/scripts/frontend/build-meteo.js" "$output$target" >/dev/null
`);
  fs.chmodSync(docker, 0o755);
  const curl = path.join(bin, 'curl');
  fs.writeFileSync(curl, `#!/usr/bin/env bash
if [[ " $* " == *" --head "* ]]; then
  printf "HTTP/1.1 200 OK\\r\\nCache-Control: no-store, max-age=0\\r\\n\\r\\n"
else
  version="$(grep -oE '[0-9a-f]{64}' "$METEOLORD_SITE_DIR/release.json" 2>/dev/null | head -n1 || true)"
  printf '{"version":"%s"}\\n' "$version"
fi
`);
  fs.chmodSync(curl, 0o755);
  return { root, repo, site, source, state, bin, packagePath };
}

function run(f, args, extraEnv = {}) {
  return spawnSync('bash', [RUNNER, ...args], {
    encoding: 'utf8',
    env: {
      ...process.env,
      PATH: `${f.bin}:${process.env.PATH}`,
      METEOLORD_DEPLOY_TEST_MODE: '1',
      METEOLORD_SITE_DIR: f.site,
      METEOLORD_NODE_IMAGE: 'test-node:local',
      ...extraEnv,
    },
  });
}

function args(f, mode) {
  return [`--${mode}`, '--repo-dir', f.repo, '--state-dir', f.state, '--base-url', 'http://test.invalid', '--package', f.packagePath];
}

function release(site) {
  return JSON.parse(fs.readFileSync(path.join(site, 'release.json'), 'utf8')).version;
}

test('check builds and validates a package with Docker but does not publish it', (t) => {
  const f = fixture(t);
  const stableBefore = new Map(['index.html', 'compte/index.html', 'mapa/index.html', 'assets/icons/site.webmanifest']
    .map((relative) => [relative, fs.readFileSync(path.join(f.site, relative))]));
  const result = run(f, args(f, 'check'));
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /CHECK_PASS release=[0-9a-f]{64}/);
  assert.equal(fs.existsSync(path.join(f.site, 'release.json')), false);
  assert.equal(fs.existsSync(path.join(f.site, 'releases')), false);
  for (const [relative, contents] of stableBefore) {
    assert.deepEqual(fs.readFileSync(path.join(f.site, relative)), contents, `--check changed ${relative}`);
  }
});

test('check can build an explicit commit without changing a dirty checkout', (t) => {
  const f = fixture(t);
  fs.cpSync(path.join(f.source, 'site'), f.site, { recursive: true, force: true });
  copy(path.join(f.source, 'scripts/frontend/build-meteo.js'), path.join(f.repo, 'scripts/frontend/build-meteo.js'));
  for (const command of [
    ['init'], ['config', 'user.email', 'test@example.invalid'], ['config', 'user.name', 'Test'],
    ['add', 'Caddyfile', 'site', 'scripts/frontend/build-meteo.js'], ['commit', '-m', 'source'],
  ]) {
    const result = spawnSync('git', ['-C', f.repo, ...command], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
  }
  fs.writeFileSync(path.join(f.repo, 'checkout-local-note.txt'), 'intentionally dirty\n');
  const commit = spawnSync('git', ['-C', f.repo, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).stdout.trim();
  const result = run(f, ['--check', '--repo-dir', f.repo, '--state-dir', f.state, '--base-url', 'http://test.invalid', '--commit', commit]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, new RegExp(`SOURCE commit=${commit}`));
  assert.equal(fs.readFileSync(path.join(f.repo, 'checkout-local-note.txt'), 'utf8'), 'intentionally dirty\n');
  assert.match(spawnSync('git', ['-C', f.repo, 'status', '--porcelain'], { encoding: 'utf8' }).stdout, /checkout-local-note/);
});

test('deploy is atomic at release.json, repeatable, and rollback restores the first unversioned site', (t) => {
  const f = fixture(t);
  const original = fs.readFileSync(path.join(f.site, 'index.html'), 'utf8');
  const deployed = run(f, args(f, 'deploy'));
  assert.equal(deployed.status, 0, deployed.stderr || deployed.stdout);
  assert.match(deployed.stdout, /DEPLOY_PASS/);
  const version = release(f.site);
  assert.match(version, /^[0-9a-f]{64}$/);
  assert.ok(fs.existsSync(path.join(f.site, 'releases', version, 'SHA256SUMS')));
  assert.match(fs.readFileSync(path.join(f.site, 'index.html'), 'utf8'), new RegExp(`/releases/${version}/`));
  assert.ok(fs.existsSync(path.join(f.state, 'last-success-backup')));

  const repeated = run(f, args(f, 'deploy'));
  assert.equal(repeated.status, 0, repeated.stderr);
  assert.match(repeated.stdout, /DEPLOY_NO_CHANGES/);

  const rollback = run(f, ['--rollback', '--repo-dir', f.repo, '--state-dir', f.state]);
  assert.equal(rollback.status, 0, rollback.stderr);
  assert.match(rollback.stdout, /ROLLBACK_PASS/);
  assert.equal(fs.readFileSync(path.join(f.site, 'index.html'), 'utf8'), original);
  assert.equal(fs.existsSync(path.join(f.site, 'release.json')), false);
  assert.ok(fs.existsSync(path.join(f.site, 'releases', version)), 'rollback never deletes versioned resources');
});

test('a failure after stable files leaves a recoverable pending backup and never activates release.json', (t) => {
  const f = fixture(t);
  const original = fs.readFileSync(path.join(f.site, 'index.html'), 'utf8');
  const failed = run(f, args(f, 'deploy'), { METEOLORD_DEPLOY_TEST_FAIL_AFTER_STABLE: '1' });
  assert.notEqual(failed.status, 0);
  assert.match(failed.stderr, /injected failure after stable files/);
  assert.equal(fs.existsSync(path.join(f.site, 'release.json')), false);
  assert.ok(fs.existsSync(path.join(f.state, 'pending-backup')));

  const rollback = run(f, ['--rollback', '--repo-dir', f.repo, '--state-dir', f.state]);
  assert.equal(rollback.status, 0, rollback.stderr);
  assert.equal(fs.readFileSync(path.join(f.site, 'index.html'), 'utf8'), original);
  assert.equal(fs.existsSync(path.join(f.site, 'release.json')), false);
});

test('runner requires a cache contract, uses an exclusive lock, Docker without network, and never invokes Git pull', () => {
  const source = fs.readFileSync(RUNNER, 'utf8');
  assert.match(source, /flock -n 9/);
  assert.match(source, /DEFAULT_NODE_IMAGE=node:20-alpine/);
  assert.match(source, /docker run --rm --network none/);
  assert.match(source, /--read-only --cap-drop ALL --security-opt no-new-privileges/);
  assert.match(source, /git -C "\$REPO_DIR" archive/);
  assert.doesNotMatch(source, /^\s*git\s+pull\b|^\s*docker(?:\s+compose|-compose)\s+up\b|^\s*psql\b|^\s*migrate\b/im);
  assert.match(source, /release\.json is deliberately restored last/);
  assert.match(source, /required Meteo Cache-Control contract/);
});
