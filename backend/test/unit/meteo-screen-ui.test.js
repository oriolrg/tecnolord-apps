'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const SCREEN_PATH = path.resolve(__dirname, '../../../site/src/ui/screens/meteoScreen.js');
let sequence = 0;

class Element {
  constructor(tagName = 'div') {
    this.tagName = tagName;
    this.children = [];
    this.style = {};
    this.textContent = '';
    this.hidden = false;
    this.id = '';
  }

  append(...children) {
    this.children.push(...children);
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }

  replaceChildren(...children) {
    this.children = [...children];
  }

  querySelector(selector) {
    return selector === '.sub' ? this.sub : null;
  }
}

function num(value) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function fmt1(value) {
  const parsed = num(value);
  return parsed === null ? '—' : parsed.toFixed(1);
}

function buildDaySeries(rows, valueOf) {
  return rows.flatMap((row) => {
    const value = valueOf(row);
    return value === null ? [] : [{ t: new Date(row.instant ?? row.at), y: value }];
  });
}

function card(properties) {
  const element = new Element('div');
  element.card = properties;
  element.sub = properties.subHtml ? new Element('div') : null;
  return element;
}

function windAbbr16(degrees) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return directions[Math.round((((degrees % 360) + 360) % 360) / 22.5) % 16];
}

function windNameCa(degrees) {
  const names = ['Tramuntana', 'Gregal', 'Llevant', 'Xaloc', 'Migjorn', 'Llebeig', 'Ponent', 'Mestral'];
  return names[Math.round((((degrees % 360) + 360) % 360) / 45) % 8];
}

function windFromCa(degrees) {
  const names = ['Nord', 'Nord-est', 'Est', 'Sud-est', 'Sud', 'Sud-oest', 'Oest', 'Nord-oest'];
  return names[Math.round((((degrees % 360) + 360) % 360) / 45) % 8];
}

function deferred() {
  let resolve;
  const promise = new Promise((next) => { resolve = next; });
  return { promise, resolve };
}

function snapshot(name, values, historyItems = []) {
  return {
    station: { name },
    items: [{ instant: '2026-10-08T12:00:00.000Z', ...values }],
    historyItems,
    source: { freshness: 'FRESH', error: null },
  };
}

function emptySnapshot(name) {
  return {
    station: { name }, items: [], historyItems: [], source: { freshness: 'UNKNOWN', error: null },
  };
}

function makeUi() {
  return {
    err: new Element(), backGlobal: new Element(), cards: new Element(), summary: new Element(), last: new Element(),
  };
}

function cardByTitle(ui, title) {
  const result = ui.cards.children.find((element) => element.card?.title === title);
  assert.ok(result, `Missing card ${title}`);
  return result.card;
}

async function loadScreen(fetchStationCurrent, charts) {
  const source = fs.readFileSync(SCREEN_PATH, 'utf8')
    .replace('import { CONFIG } from "../../config.js";', 'const { CONFIG } = globalThis.__meteoScreenTest;')
    .replace('import { trackEvent } from "../../analytics.js";', 'const { trackEvent } = globalThis.__meteoScreenTest;')
    .replace('import { $ } from "../dom.js";', 'const { $ } = globalThis.__meteoScreenTest;')
    .replace('import { card } from "../components/card.js";', 'const { card } = globalThis.__meteoScreenTest;')
    .replace('import { num, fmt1, clamp, windAbbr16, windFromCa, fmtTime } from "../format.js";', 'const { num, fmt1, clamp, windAbbr16, windFromCa, fmtTime } = globalThis.__meteoScreenTest;')
    .replace('import { windNameCa } from "../format.js";', 'const { windNameCa } = globalThis.__meteoScreenTest;')
    .replace(/import \{[\s\S]*?\} from "\.\.\/\.\.\/services\/meteoService\.js";/, `
      const clearDefaultStation = async () => ({});
      const fetchMeteoPayload = async () => ({ items: [] });
      const fetchEstimationCurrent = async () => ({ items: [] });
      const fetchMeteoSession = async () => null;
      const fetchPublicView = async () => ({ config: {} });
      const fetchStationCatalog = async () => [];
      const fetchStationPreference = async () => ({});
      const setDefaultStation = async () => ({});
      const fetchStationCurrent = globalThis.__meteoScreenTest.fetchStationCurrent;`)
    .replace('import { renderLineChart, buildDaySeries } from "../components/lineChart.js";', 'const { renderLineChart, buildDaySeries } = globalThis.__meteoScreenTest;');

  const created = [];
  const priorDocument = global.document;
  global.document = { createElement(tagName) { const element = new Element(tagName); created.push(element); return element; } };
  globalThis.__meteoScreenTest = {
    CONFIG: { environment: 'local', syntheticData: false, defaultLimit: 48, autoRefreshMs: 30000 },
    trackEvent: () => {}, $: () => null, card, num, fmt1, clamp: (value, min, max) => Math.max(min, Math.min(max, value)),
    windAbbr16, windFromCa, windNameCa, fmtTime: () => '—', fetchStationCurrent,
    buildDaySeries,
    renderLineChart(canvas, points) { charts.push({ id: canvas.id, points }); },
  };
  const encoded = Buffer.from(`${source}\n// meteo-screen-test-${sequence += 1}`).toString('base64');
  try {
    const module = await import(`data:text/javascript;base64,${encoded}`);
    return {
      module,
      created,
      cleanup() {
        if (priorDocument === undefined) delete global.document;
        else global.document = priorDocument;
      },
    };
  } finally {
    delete globalThis.__meteoScreenTest;
  }
}

test('Meteo preserves the selected station name when current data arrives or is absent', async () => {
  let current = snapshot('Grafana Centre', { temp_c: 21, humitat_pct: 55 });
  const charts = [];
  const { module, cleanup } = await loadScreen(async () => current, charts);
  try {
    const ui = makeUi();
    const store = { get: () => ({ stationId: '11111111-1111-4111-8111-111111111111', limit: '48' }) };

    await module.refreshMeteo(ui, store, {});
    assert.equal(ui.summary.textContent, 'Grafana Centre · Observacions reals de MeteoLord · tecnolord.cat');

    current = emptySnapshot('Grafana Centre');
    await module.refreshMeteo(ui, store, {});
    assert.equal(ui.summary.textContent, 'Grafana Centre · Observacions reals de MeteoLord · tecnolord.cat');
    assert.equal(ui.last.textContent, 'Frescor desconeguda · Sense dades');
  } finally {
    cleanup();
  }
});

test('Meteo attaches charts only when a source has at least two valid same-day points', async () => {
  let current = snapshot('Grafana actual', { temp_c: 20, humitat_pct: 50 });
  const charts = [];
  const { module, created, cleanup } = await loadScreen(async () => current, charts);
  try {
    const ui = makeUi();
    const store = { get: () => ({ stationId: '22222222-2222-4222-8222-222222222222', limit: '48' }) };

    await module.refreshMeteo(ui, store, {});
    assert.deepEqual(created.filter((element) => element.tagName === 'canvas'), []);
    assert.deepEqual(charts, []);

    current = snapshot('Ecowitt amb sèrie', { temp_c: 21, humitat_pct: 52 }, [
      { instant: '2026-10-08T11:45:00.000Z', temp_c: 20, humitat_pct: 50 },
    ]);
    await module.refreshMeteo(ui, store, {});
    assert.deepEqual(charts.map((chart) => chart.id).sort(), ['chart-hum', 'chart-temp']);
  } finally {
    cleanup();
  }
});

test('Meteo clears sequential station data and ignores an outdated deferred response', async () => {
  const ecoId = '33333333-3333-4333-8333-333333333333';
  const grafanaId = '44444444-4444-4444-8444-444444444444';
  const delayedEco = deferred();
  let ecoCalls = 0;
  let grafanaCalls = 0;
  const currentByStation = async (stationId) => {
    if (stationId === ecoId && ecoCalls++ === 0) return delayedEco.promise;
    if (stationId === grafanaId && grafanaCalls++ === 0) {
      return snapshot('Grafana completa', {
        temp_c: 21, humitat_pct: 67, rain_24h: 7, vent_ms: 0, vent_rafega_ms: 0, vent_direccio_graus: 0,
      });
    }
    if (stationId === grafanaId) return snapshot('Grafana parcial', { temp_c: 19, humitat_pct: null, vent_ms: null });
    return snapshot('Ecowitt final', {
      temp_c: 12, humitat_pct: 41, pluja_diaria_mm: 3, vent_ms: 2, vent_rafega_ms: 3, vent_direccio_graus: 45,
    });
  };
  const charts = [];
  const { module, cleanup } = await loadScreen(currentByStation, charts);
  try {
    const ui = makeUi();
    const state = { stationId: ecoId, limit: '48' };
    const store = { get: () => state };
    let revision = 1;

    const outdated = module.refreshMeteo(ui, store, {}, { isCurrent: () => revision === 1 });
    state.stationId = grafanaId;
    revision = 2;
    await module.refreshMeteo(ui, store, {}, { isCurrent: () => revision === 2 });
    assert.equal(ui.summary.textContent.startsWith('Grafana completa'), true);
    assert.equal(cardByTitle(ui, 'Temperatura').value, '21.0');
    assert.equal(cardByTitle(ui, 'Humitat').value, 67);
    assert.equal(cardByTitle(ui, 'Pluja acumulada 24 h').value, '7.0');
    assert.match(cardByTitle(ui, 'Vent del Nord (Tramuntana)').subHtml, /0\.0 m\/s/);

    revision = 3;
    await module.refreshMeteo(ui, store, {}, { isCurrent: () => revision === 3 });
    assert.equal(ui.summary.textContent.startsWith('Grafana parcial'), true);
    assert.equal(cardByTitle(ui, 'Temperatura').value, '19.0');
    assert.equal(cardByTitle(ui, 'Humitat').value, '—');
    assert.equal(cardByTitle(ui, 'Pluja').value, '—');
    assert.match(cardByTitle(ui, 'Vent').subHtml, /Velocitat: <strong>— m\/s<\/strong>/);
    assert.match(cardByTitle(ui, 'Vent').subHtml, /Ràfega: <strong>— m\/s<\/strong>/);

    state.stationId = ecoId;
    revision = 4;
    await module.refreshMeteo(ui, store, {}, { isCurrent: () => revision === 4 });
    assert.equal(ui.summary.textContent.startsWith('Ecowitt final'), true);
    assert.equal(cardByTitle(ui, 'Temperatura').value, '12.0');
    assert.equal(cardByTitle(ui, 'Humitat').value, 41);
    assert.equal(cardByTitle(ui, 'Pluja').value, '—');
    assert.match(cardByTitle(ui, 'Pluja').subHtml, /Dia: <strong>3\.0 mm<\/strong>/);
    assert.match(cardByTitle(ui, 'Vent del Nord-est \(Gregal\)').subHtml, /Velocitat: <strong>2\.0 m\/s<\/strong>/);
    assert.match(cardByTitle(ui, 'Vent del Nord-est \(Gregal\)').subHtml, /Ràfega: <strong>3\.0 m\/s<\/strong>/);

    delayedEco.resolve(snapshot('Ecowitt antic', {
      temp_c: 99, humitat_pct: 99, pluja_diaria_mm: 99, vent_ms: 99, vent_rafega_ms: 99, vent_direccio_graus: 270,
    }));
    await outdated;
    assert.equal(ui.summary.textContent.startsWith('Ecowitt final'), true);
    assert.equal(ui.cards.children.some((element) => JSON.stringify(element.card).includes('99')), false);
  } finally {
    cleanup();
  }
});
