'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const pairs = [
  ['body', '#242830', '#f7f9ff'], ['muted', '#667182', '#ffffff'],
  ['note', '#576476', '#f7f8fd'], ['caption', '#667182', '#ffffff'],
  ['link', '#2366bf', '#ffffff'], ['primary', '#ffffff', '#2769c1'],
  ['marker-cold', '#ffffff', '#266b91'], ['marker-mild', '#ffffff', '#1c6753'],
  ['marker-warm', '#ffffff', '#a3481c'], ['marker-missing', '#ffffff', '#5d6566'],
  ['focus', '#a2470a', '#f7f8fd'], ['control-border', '#7d8ba1', '#ffffff'],
];
function luminance(hex) {
  const parts = hex.match(/[0-9a-f]{2}/gi).map((part) => parseInt(part, 16) / 255);
  const [r, g, b] = parts.map((c) => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4);
  return .2126 * r + .7152 * g + .0722 * b;
}
const results = pairs.map(([name, foreground, background]) => {
  const values = [luminance(foreground), luminance(background)].sort((a,b) => b-a);
  const ratio = (values[0]+.05)/(values[1]+.05);
  return { name, foreground, background, ratio, pass: ratio >= (['focus', 'control-border'].includes(name) ? 3 : 4.5) };
});
const output = path.resolve(__dirname, '../../artifacts/phase-a', require('node:child_process').execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), 'map-a-completion/map-a/contrast.json');
fs.writeFileSync(output, JSON.stringify({ result: results.every((row) => row.pass) ? 'PASS' : 'FAIL', results }, null, 2));
console.log(JSON.stringify(results, null, 2));
assert.ok(results.every((row) => row.pass));
