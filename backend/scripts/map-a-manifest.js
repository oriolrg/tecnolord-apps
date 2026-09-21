'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
const lockfile = fs.readFileSync(path.join(root, 'backend/package-lock.json'));
const lock = JSON.parse(lockfile);
const dependency = (name) => {
  const entry = lock.packages[`node_modules/${name}`];
  return { version: entry.version, integrity: entry.integrity, tarball_sha512_hex: Buffer.from(entry.integrity.slice('sha512-'.length), 'base64').toString('hex') };
};
const assets = ['maplibre-gl.mjs', 'maplibre-gl-shared.mjs', 'maplibre-gl-worker.mjs', 'maplibre-gl.css', 'pmtiles.js', 'style.json', 'map-a-synthetic.pmtiles']
  .map((name) => { const bytes = fs.readFileSync(path.join(root, 'site/map-assets', name)); return { name, size_bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') }; });
const result = { head, lockfile_sha256: createHash('sha256').update(lockfile).digest('hex'), maplibre: dependency('maplibre-gl'), pmtiles: dependency('pmtiles'), assets };
const output = path.join(root, 'artifacts/phase-a', head, 'map-a-completion/map-a/assets-manifest.json');
fs.writeFileSync(output, JSON.stringify(result, null, 2));
console.log(output);
