'use strict';

// A versioned directory preserves relative ES imports without a bundler.
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const DEFAULT_SITE = path.resolve(__dirname, '../../site');

function filesBelow(root, directory) {
  return fs.readdirSync(path.join(root, directory), { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name, 'en'))
    .flatMap((entry) => {
      const name = path.posix.join(directory, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`Symlinks are not build inputs: ${name}`);
      return entry.isDirectory() ? filesBelow(root, name) : [name];
    });
}

function buildMeteo({ source = DEFAULT_SITE, output } = {}) {
  if (!output) throw new Error('An output directory is required');
  source = path.resolve(source);
  output = path.resolve(output);
  if (output === source || output.startsWith(`${source}${path.sep}`)) throw new Error('Output must be outside site');
  if (fs.existsSync(output)) throw new Error('Output already exists; use a new directory');
  const files = ['index.html', 'runtime-config.production.js',
    ...['src', 'compte', 'mapa', 'map-assets', 'assets'].flatMap((dir) => filesBelow(source, dir))].sort();
  const contents = new Map(files.map((name) => [name, fs.readFileSync(path.join(source, name))]));
  const digest = createHash('sha256').update(fs.readFileSync(__filename));
  for (const [name, bytes] of contents) digest.update(name).update('\0').update(bytes).update('\0');
  const version = digest.digest('hex');
  const prefix = `/meteo/releases/${version}/`;
  const releaseRoot = path.join(output, 'releases', version);
  const write = (name, bytes) => {
    fs.mkdirSync(path.dirname(name), { recursive: true });
    fs.writeFileSync(name, bytes);
  };
  for (const [name, bytes] of contents) {
    if (name.endsWith('.html')) continue;
    // Runtime always remains at its stable, non-cacheable URL.
    if (name === 'runtime-config.production.js') {
      write(path.join(output, name), bytes);
      write(path.join(output, 'runtime-config.js'), bytes);
      continue;
    }
    const transformed = /\.(js|mjs|json|css)$/.test(name)
      ? bytes.toString().replaceAll('/meteo/map-assets/', `${prefix}map-assets/`)
      : bytes;
    write(path.join(releaseRoot, name), transformed);
    // Keep the manifest URL and icons stable for existing PWA installations.
    if (name.startsWith('assets/')) write(path.join(output, name), bytes);
  }
  for (const [name, bytes] of contents) {
    if (!name.endsWith('.html')) continue;
    const documentUrl = new URL(name, 'https://build.invalid/meteo/');
    const html = bytes.toString().replace(/\b(src|href)="([^"]+)"/g, (match, attr, value) => {
      const url = new URL(value, documentUrl);
      const relative = url.pathname.slice('/meteo/'.length);
      if (url.origin !== documentUrl.origin || !/^(src\/|map-assets\/|compte\/.*\.(?:js|css)$)/.test(relative)) return match;
      return `${attr}="${prefix}${relative}${url.search}${url.hash}"`;
    });
    write(path.join(output, name), html);
  }
  write(path.join(output, 'release.json'), `${JSON.stringify({ version })}\n`);
  return { version, output };
}

if (require.main === module) console.log(JSON.stringify(buildMeteo({ output: process.argv[2] })));
module.exports = { buildMeteo };
