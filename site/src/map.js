const $ = (selector) => document.querySelector(selector);
const EMPTY = { type: 'FeatureCollection', features: [] };
const statusLabels = { FRESCA: 'Dades recents', SENSE_DADES_RECENTS: 'Sense dades recents', OBSOLETA: 'Dada obsoleta', SOSPITOSA: 'Dada sospitosa · no fiable', EN_REVISIO: 'En revisió' };
const fieldLabels = { temperature: 'Temperatura', humidity: 'Humitat' };
const units = { 'synthetic-celsius': '°C', 'synthetic-percent': '%', celsius: '°C', percent: '%' };
const decimal = new Intl.NumberFormat('ca', { maximumFractionDigits: 1 });
const time = (value) => value ? new Intl.DateTimeFormat('ca', { dateStyle: 'short', timeStyle: 'short', timeZone: 'UTC' }).format(new Date(value)) + ' UTC' : 'Hora desconeguda';
const fields = (station) => station.sensors.flatMap((sensor) => sensor.fields);
const temperature = (station) => fields(station).find((field) => field.field_id === 'temperature');
const formatted = (field) => Number.isFinite(field?.current_value) ? `${decimal.format(field.current_value)} ${units[field.unit] || field.unit}` : '—';
const fieldStatus = (field) => [field.review === 'EN_REVISIO' ? statusLabels.EN_REVISIO : '', field.quality === 'SOSPITOSA' ? statusLabels.SOSPITOSA : '', statusLabels[field.freshness]].filter(Boolean).join(' · ');
const stationStatus = (station) => [...new Set(fields(station).map(fieldStatus))].join(' · ') || 'Sense mesures publicables';
function node(tag, text, className) {
  const element = document.createElement(tag);
  if (text !== undefined) element.textContent = text;
  if (className) element.className = className;
  return element;
}
function stationUrl(id) {
  const url = new URL(location.href);
  url.searchParams.set('station', id);
  return `${url.pathname}${url.search}`;
}
let config, collection = EMPTY, privateById = new Map(), catalogVersion, map, engine, markers = new Map(), generation = 0, controller;
let mapLoadTimer, selectedId = new URL(location.href).searchParams.get('station');
let directDetailPending = Boolean(selectedId);
let polling = false;
const dialog = $('#station-dialog');
const filterToggle = $('#filter-toggle');
const moreFilters = $('#more-filters');
const narrowScreen = matchMedia('(max-width: 760px)');
function syncFilterToggle() {
  const active = [$('#field-filter').value, $('#freshness-filter').value].filter(Boolean).length;
  filterToggle.firstChild.textContent = active ? `Més filtres (${active}) ` : 'Més filtres ';
  if (!narrowScreen.matches) {
    moreFilters.hidden = false;
    filterToggle.setAttribute('aria-expanded', 'true');
  }
}
filterToggle.addEventListener('click', () => {
  moreFilters.hidden = !moreFilters.hidden;
  filterToggle.setAttribute('aria-expanded', String(!moreFilters.hidden));
});
narrowScreen.addEventListener('change', () => {
  moreFilters.hidden = narrowScreen.matches;
  filterToggle.setAttribute('aria-expanded', String(!moreFilters.hidden));
});
moreFilters.hidden = narrowScreen.matches;
filterToggle.setAttribute('aria-expanded', String(!moreFilters.hidden));
$('#close-dialog').onclick = () => dialog.close();
dialog.addEventListener('keydown', (event) => {
  if (event.key !== 'Tab') return;
  const controls = [...dialog.querySelectorAll('button:not([disabled]), a[href], input, select, [tabindex="0"]')];
  const first = controls[0], last = controls.at(-1);
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
});

async function api(path, signal) {
  const response = await fetch(`${config.apiBase}/v1/map/${path}`, { cache: 'no-store', signal });
  if (!response.ok) throw new Error(response.status === 404 ? 'not_found' : 'unavailable');
  const version = response.headers.get('X-Catalog-Version');
  if (!version) throw new Error('unverified');
  return { value: await response.json(), version };
}
function clearData() {
  collection = EMPTY; privateById = new Map(); catalogVersion = null;
  $('#station-list').replaceChildren(); $('#station-count').textContent = '0';
  $('#summary-count').textContent = '—'; $('#summary-range').textContent = '—';
  $('#detail').replaceChildren(); $('#detail').hidden = true;
  if (dialog.open) dialog.close();
  updateMap(false);
}
function fitMap() {
  if (!map || !collection.features.length) return;
  const bounds = new engine.LngLatBounds();
  collection.features.forEach((feature) => bounds.extend(feature.geometry.coordinates));
  map.fitBounds(bounds, { padding: 65, maxZoom: 12, duration: 0 });
}
$('#fit-map').onclick = fitMap;
function updateMap(fit = true) {
  for (const marker of markers.values()) marker.remove();
  markers.clear();
  const source = map?.getSource('stations');
  if (!source) return;
  source.setData(collection);
  if (fit) fitMap();
}
function mapUnavailable() {
  clearTimeout(mapLoadTimer);
  if (map) { map.remove(); map = null; }
  markers.clear();
  $('#map').hidden = true;
  $('#map-status').textContent = 'El mapa no està disponible. Pots consultar totes les estacions, cercar-les i obrir les fitxes a la llista.';
  $('#fit-map').disabled = true;
}
function showCoincident(stations) {
  const content = $('#dialog-content'); content.replaceChildren();
  const title = node('h2', 'Estacions en aquesta ubicació'); title.id = 'dialog-title'; content.append(title);
  content.append(node('p', 'Comparteixen una ubicació pública aproximada. Tria una estació.'));
  const options = node('div', undefined, 'dialog-options');
  for (const station of stations) {
    const button = node('button', `${station.public_name} · ${formatted(temperature(station))}`);
    button.onclick = () => showSummary(station.public_station_id); options.append(button);
  }
  content.append(options); if (!dialog.open) dialog.showModal();
}
function renderMarkers() {
  if (!map?.getSource('stations') || !map.isSourceLoaded('stations')) return;
  const visible = new Set();
  for (const feature of map.querySourceFeatures('stations')) {
    const props = feature.properties, cluster = Boolean(props.cluster);
    const original = cluster ? null : collection.features.find((item) => item.properties.public_station_id === props.public_station_id);
    const coordinates = original?.geometry.coordinates || feature.geometry.coordinates;
    const id = cluster ? `cluster-${props.cluster_id}` : `point-${coordinates.join(',')}`;
    if (visible.has(id)) continue;
    visible.add(id);
    if (markers.has(id)) continue;
    const stations = cluster ? [] : collection.features.filter((item) => item.geometry.coordinates[0] === coordinates[0] && item.geometry.coordinates[1] === coordinates[1]).map((item) => item.properties);
    const station = stations[0];
    if (!cluster && !station) continue;
    const value = temperature(station || { sensors: [] });
    const button = node('button', cluster ? String(props.point_count) : stations.length > 1 ? `${stations.length} estacions` : formatted(value), 'map-marker');
    button.type = 'button';
    button.classList.add(cluster ? 'cluster' : station.access_scope ? 'private' : !Number.isFinite(value?.current_value) ? 'missing' : value.current_value < 10 ? 'cold' : value.current_value > 25 ? 'warm' : 'mild');
    button.setAttribute('aria-label', cluster ? `Amplia el grup de ${props.point_count} estacions` : stations.length > 1 ? `Tria entre ${stations.length} estacions coincidents` : `${station.public_name}: ${formatted(value)}. ${stationStatus(station)}`);
    button.onclick = async () => {
      if (!cluster) return stations.length > 1 ? showCoincident(stations) : showSummary(station.public_station_id);
      try {
        const zoom = await map.getSource('stations').getClusterExpansionZoom(props.cluster_id);
        map.easeTo({ center: coordinates, zoom, duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 250 });
      } catch { $('#map-status').textContent = 'Consulta les estacions del grup a la llista.'; }
    };
    markers.set(id, new engine.Marker({ element: button }).setLngLat(coordinates).addTo(map));
  }
  for (const [id, marker] of markers) if (!visible.has(id)) { marker.remove(); markers.delete(id); }
}
async function initMap() {
  mapLoadTimer = setTimeout(mapUnavailable, config.syntheticData ? 8000 : 15000);
  try {
    engine = await import('/meteo/map-assets/maplibre-gl.mjs');
    const workerResponse = await fetch('/meteo/map-assets/maplibre-gl-worker.mjs');
    if (!workerResponse.ok) throw new Error('worker');
    engine.setWorkerUrl('/meteo/map-assets/maplibre-gl-worker.mjs');
    if (config.syntheticData) {
      const protocol = new window.pmtiles.Protocol();
      engine.addProtocol('pmtiles', protocol.tile);
    }
    const response = await fetch(config.syntheticData ? '/meteo/map-assets/style.json' : '/meteo/map-assets/style.real.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('style');
    const style = await response.json();
    if (config.syntheticData) style.sources.synthetic.url = `pmtiles://${location.origin}/meteo/map-assets/map-a-synthetic.pmtiles`;
    map = new engine.Map({ container: 'map', style, center: config.syntheticData ? [-169, -55] : [1.7, 41.8], zoom: config.syntheticData ? 5 : 8, attributionControl: false, locale: { 'NavigationControl.ZoomIn': 'Amplia el mapa', 'NavigationControl.ZoomOut': 'Redueix el mapa' },
      transformRequest(url) {
        const candidate = new URL(url.replace(/^pmtiles:\/\//, ''), location.href);
        if (candidate.origin !== location.origin && (config.syntheticData || candidate.origin !== 'https://tile.openstreetmap.org')) throw new Error('external_resource');
        return { url };
      } });
    map.addControl(new engine.NavigationControl({ showCompass: false }), 'top-right');
    map.getCanvas().setAttribute('aria-label', 'Mapa. Fes servir les fletxes per moure’t i + o − per ampliar o reduir.');
    map.on('error', () => {
      if (config.syntheticData) mapUnavailable();
      else $('#map-status').textContent = 'Algunes parts de la base cartogràfica no estan disponibles. Les dades continuen a la llista.';
    });
    map.on('load', () => {
      if (!map) return;
      map.addSource('stations', { type: 'geojson', data: collection, cluster: config.syntheticData, clusterRadius: 50, clusterMaxZoom: 14 });
      map.addLayer({ id: 'station-points', type: 'circle', source: 'stations', paint: { 'circle-radius': 1, 'circle-opacity': 0 } });
      map.on('render', renderMarkers);
      map.on('idle', () => {
        if (!map?.isSourceLoaded('stations')) return;
        $('#map-status').textContent = collection.features.length ? '' : 'No hi ha estacions amb aquests filtres.';
        clearTimeout(mapLoadTimer);
        document.documentElement.dataset.mapReady = 'true';
        performance.mark('map-interactive');
      });
      fitMap();
    });
  } catch { mapUnavailable(); }
}
function stationContent(station, titleId) {
  const fragment = document.createDocumentFragment();
  const title = node('h2', station.public_name); title.id = titleId; fragment.append(title);
  fragment.append(node('p', stationStatus(station), 'status-tag'));
  fragment.append(node('p', station.access_scope ? 'Vista privada: coordenada exacta visible només amb la teva sessió.' : 'Ubicació aproximada, no exacta.'));
  const grid = node('dl', undefined, 'data-grid');
  for (const field of fields(station)) {
    const item = node('div'); item.append(node('dt', fieldLabels[field.field_id] || field.field_id), node('dd', formatted(field)), node('p', fieldStatus(field)));
    if (field.current_value === null && Number.isFinite(field.last_value)) item.append(node('p', `Darrer valor històric: ${decimal.format(field.last_value)} ${units[field.unit] || field.unit}`));
    grid.append(item);
  }
  fragment.append(grid, node('p', `Observació: ${time(station.observed_at)}`), node('p', `Identificador públic: ${station.public_station_id}`), node('p', `Font: ${station.provenance.source} · ${station.provenance.licence_or_legal_basis_ref}`));
  return fragment;
}
async function verifiedStation(id) {
  if (privateById.has(id)) {
    const feature = privateById.get(id);
    return { ...feature.properties, public_geometry: feature.geometry };
  }
  const epoch = generation;
  const result = await api(`stations/${encodeURIComponent(id)}`);
  const verification = await api('catalog-version');
  if (epoch !== generation) throw new Error('superseded');
  if (result.version !== catalogVersion || verification.value.catalog_version !== result.version) {
    clearData(); throw new Error('unverified');
  }
  return result.value;
}
async function showSummary(id) {
  const content = $('#dialog-content'); content.replaceChildren();
  const title = node('h2', 'Carregant el resum…'); title.id = 'dialog-title'; content.append(title);
  if (!dialog.open) dialog.showModal();
  try {
    const station = await verifiedStation(id);
    if (!dialog.open) return;
    content.replaceChildren(stationContent(station, 'dialog-title'));
    const link = node('a', 'Obre la fitxa completa →'); link.href = stationUrl(id); content.append(link);
  } catch {
    title.textContent = 'No es pot verificar aquesta estació. Actualitza les dades.';
  }
}
async function showDetail(id, focus = false) {
  const detail = $('#detail'); detail.hidden = false;
  detail.replaceChildren(node('p', 'Carregant la fitxa…'));
  try {
    const station = await verifiedStation(id);
    if (id !== selectedId) return;
    detail.replaceChildren(stationContent(station, 'detail-title'));
    const title = $('#detail-title'); title.tabIndex = -1;
    if (focus) title.focus();
    if (!config.syntheticData) return;
    const historyTitle = node('h3', 'Historial de temperatura'); detail.append(historyTitle);
    const historyStatus = node('p', 'Consultant l’historial…'); detail.append(historyStatus);
    const controls = node('form');
    const label = node('label', 'Període '), select = node('select'); select.setAttribute('aria-label', 'Període de l’historial');
    for (const [value, text] of [['24h', '24 hores'], ['7d', '7 dies'], ['30d', '30 dies']]) { const option = node('option', text); option.value = value; select.append(option); }
    label.append(select); controls.append(label); detail.append(controls);
    const output = node('div', undefined, 'history-table'); detail.append(output);
    let request = 0;
    const loadHistory = async () => {
      const ticket = ++request; output.replaceChildren(); historyStatus.textContent = 'Consultant l’historial…';
      try {
        const result = await api(`stations/${encodeURIComponent(id)}/history/temperature?period=${select.value}`);
        if (ticket !== request || id !== selectedId) return;
        const check = await api('catalog-version');
        if (result.version !== catalogVersion || check.value.catalog_version !== result.version) { clearData(); return; }
        historyStatus.textContent = `Resolució: ${result.value.resolution} · UTC. Les absències no s’interpolen.`;
        const table = node('table'); table.append(node('caption', 'Mesures i cobertura de cada interval'));
        const head = node('thead'), header = node('tr');
        ['Instant (UTC)', 'Temperatura', 'Cobertura'].forEach((text) => { const cell = node('th', text); cell.scope = 'col'; header.append(cell); }); head.append(header); table.append(head);
        const body = node('tbody');
        for (const bucket of result.value.buckets) { const row = node('tr'); row.append(node('td', time(bucket.instant)), node('td', bucket.value === null ? '—' : `${decimal.format(bucket.value)} °C`), node('td', `${bucket.n_valid}/${bucket.n_expected} · ${Math.round(bucket.coverage * 100)} %${bucket.partial ? ' · parcial' : ''}`)); body.append(row); }
        table.append(body); output.append(table);
      } catch (error) { if (ticket === request) historyStatus.textContent = error.message === 'not_found' ? 'No hi ha historial públic disponible per a aquesta estació.' : 'No s’ha pogut verificar l’historial.'; }
    };
    select.onchange = loadHistory; controls.onsubmit = (event) => event.preventDefault(); await loadHistory();
  } catch { detail.replaceChildren(node('p', 'Estació no disponible o catàleg no verificable.')); }
}
function renderList() {
  $('.list-panel').classList.toggle('long-list', collection.features.length > 6);
  const fragment = document.createDocumentFragment();
  for (const { properties: station } of collection.features) {
    const item = node('li'), top = node('div', undefined, 'station-top');
    const button = node('button', station.public_name, 'station-name'); button.type = 'button'; button.onclick = () => showSummary(station.public_station_id);
    top.append(button, node('span', formatted(temperature(station)), 'temperature'));
    item.append(top, node('p', station.access_scope ? `${stationStatus(station)} · Vista privada` : stationStatus(station), 'status-tag'));
    item.append(node('p', `${time(station.observed_at)} · ${station.geo_publication === 'APPROXIMATED' ? 'Ubicació aproximada' : 'Ubicació exacta'}`, 'station-meta'));
    const link = node('a', 'Veure fitxa →', 'station-link'); link.href = stationUrl(station.public_station_id);
    item.append(link); fragment.append(item);
  }
  if (!collection.features.length) fragment.append(node('li', 'No hi ha estacions amb aquests filtres. Prova una altra cerca.', 'empty'));
  $('#station-list').replaceChildren(fragment); $('#station-count').textContent = String(collection.features.length);
}
function filtersQuery() {
  const params = new URLSearchParams();
  for (const [key, value] of new FormData($('#filters'))) if (value) params.set(key, value);
  return params;
}
async function refresh({ fit = false } = {}) {
  const epoch = ++generation;
  controller?.abort(); controller = new AbortController();
  $('#status').dataset.state = 'loading';
  $('#status').textContent = 'Carregant estacions…';
  try {
    const query = filtersQuery();
    const [result, summary, ownMap, adminMap] = await Promise.all([
      api(`stations?${query}`, controller.signal),
      api(`summary?${query}`, controller.signal),
      fetch(`${config.apiBase}/v1/me/map?${query}`, { credentials: 'same-origin', cache: 'no-store', signal: controller.signal })
        .then((response) => response.ok ? response.json() : EMPTY),
      fetch(`${config.apiBase}/v1/admin/map?${query}`, { credentials: 'same-origin', cache: 'no-store', signal: controller.signal })
        .then((response) => response.ok ? response.json() : EMPTY),
    ]);
    const check = await api('catalog-version', controller.signal);
    if (epoch !== generation) return;
    if (check.value.catalog_version !== result.version || summary.version !== result.version
      || summary.value.count !== result.value.features.length) throw new Error('unverified');
    if (catalogVersion && catalogVersion !== result.version && dialog.open) dialog.close();
    const privateCollection = adminMap.features.length ? adminMap : ownMap;
    privateById = new Map(privateCollection.features.map((feature) => [feature.properties.public_station_id, feature]));
    collection = { type: 'FeatureCollection', features: [
      ...result.value.features.filter((feature) => !privateById.has(feature.properties.public_station_id)),
      ...privateCollection.features,
    ] }; catalogVersion = result.version;
    renderList(); updateMap(fit);
    $('#summary-count').textContent = String(summary.value.count);
    $('#summary-range').textContent = Number.isFinite(summary.value.temperature_min) && Number.isFinite(summary.value.temperature_max)
      ? `${decimal.format(summary.value.temperature_min)}–${decimal.format(summary.value.temperature_max)} °C` : 'Sense dades recents';
    $('#status').dataset.state = 'ok';
    $('#status').textContent = config.syntheticData ? 'Catàleg sintètic verificat' : `Dades reals · ${summary.value.sources.join(' i ')}`;
    if (selectedId) { await showDetail(selectedId, directDetailPending); directDetailPending = false; }
    document.documentElement.dataset.listReady = 'true';
  } catch (error) {
    if (epoch !== generation || error.name === 'AbortError') return;
    clearData(); $('#status').dataset.state = 'error'; $('#status').textContent = 'No s’ha pogut verificar el catàleg. Torna-ho a provar amb «Actualitza ara».';
  }
}
$('#filters').onsubmit = (event) => {
  event.preventDefault();
  const params = filtersQuery(); if (selectedId) params.set('station', selectedId);
  history.replaceState(null, '', `${location.pathname}?${params}`);
  syncFilterToggle();
  if (narrowScreen.matches && !moreFilters.hidden) {
    moreFilters.hidden = true;
    filterToggle.setAttribute('aria-expanded', 'false');
    $('#search').focus();
  }
  clearData(); refresh({ fit: true });
};
$('#filters').onreset = () => setTimeout(() => { syncFilterToggle(); $('#filters').requestSubmit(); }, 0);
$('#refresh').onclick = () => refresh();
document.addEventListener('click', (event) => {
  const link = event.target.closest('a.station-link, #dialog-content a');
  if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
  event.preventDefault(); history.pushState(null, '', link.href); selectedId = new URL(link.href).searchParams.get('station');
  directDetailPending = false;
  if (dialog.open) dialog.close(); showDetail(selectedId, true);
});
window.addEventListener('popstate', () => { selectedId = new URL(location.href).searchParams.get('station'); if (selectedId) showDetail(selectedId); else $('#detail').hidden = true; });
window.addEventListener('offline', () => { ++generation; controller?.abort(); clearData(); $('#status').dataset.state = 'error'; $('#status').textContent = 'Sense connexió. El catàleg no es pot verificar.'; });
async function poll() {
  if (polling || !config) return;
  polling = true;
  try {
    const check = await api('catalog-version');
    if (catalogVersion !== check.value.catalog_version) {
      ++generation; controller?.abort(); clearData();
      if ($('#auto-refresh').checked) await refresh();
      else { $('#status').dataset.state = 'error'; $('#status').textContent = 'El catàleg ha canviat. Prem «Actualitza ara» per consultar-lo.'; }
    } else if ($('#auto-refresh').checked) await refresh();
  } catch { ++generation; controller?.abort(); clearData(); $('#status').dataset.state = 'error'; $('#status').textContent = 'No es pot verificar el catàleg. Actualitza les dades quan torni la connexió.'; }
  finally { polling = false; }
}
try {
  ({ CONFIG: config } = await import('./config.js'));
  if (config.environment !== 'local') throw new Error('disabled');
  if (!config.syntheticData) {
    $('.demo-tag').textContent = 'Dades reals';
    $('.demo-meta span:last-child').textContent = 'MeteoLord: observació · Open-Meteo: estimació de model';
    $('.overview-stat span').textContent = 'Punts';
    $('.map-heading h2').textContent = 'Temperatures dels punts del mapa';
    $('.search-field label').textContent = 'Cerca un punt';
    $('#search').placeholder = 'Nom del punt…';
    $('#filters').setAttribute('aria-label', 'Cerca de punts meteorològics');
    $('#list-heading').textContent = 'Punts meteorològics';
    $('.list-note').textContent = 'Una observació pròpia i estimacions de model, segons la font disponible.';
    $('.map-caption').textContent = 'Ubicació de MeteoLord aproximada. Els altres punts són valors de model, no lectures d’estacions. Fonts: ';
    const modelCredit = node('a', 'Open-Meteo (CC BY 4.0)');
    modelCredit.href = 'https://open-meteo.com/';
    modelCredit.target = '_blank'; modelCredit.rel = 'noopener noreferrer';
    const attribution = node('a', '© OpenStreetMap contributors');
    attribution.href = 'https://www.openstreetmap.org/copyright';
    attribution.target = '_blank'; attribution.rel = 'noopener noreferrer';
    $('.map-caption').append(modelCredit, document.createTextNode(' · Mapa: '), attribution);
    $('footer').textContent = 'MeteoLord · Consulta local de dades reals · Hores en UTC';
  }
  const params = new URL(location.href).searchParams;
  for (const key of ['q', 'sensor', 'freshness']) if (params.has(key)) $('#filters').elements.namedItem(key).value = params.get(key);
  syncFilterToggle();
  await Promise.all([initMap(), refresh({ fit: true })]);
  setInterval(poll, 30000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) poll(); });
} catch {
  clearData(); $('#status').dataset.state = 'error'; $('#status').textContent = 'El mapa requereix una configuració local vàlida.';
  mapUnavailable();
}
