const EMPTY_COLLECTION = Object.freeze({ type: 'FeatureCollection', features: [] });

export function resolveMapRuntime({ config, mapMode } = {}) {
  const mode = mapMode === undefined ? (config?.syntheticData ? 'synthetic' : 'real') : mapMode;
  if (!['synthetic', 'real'].includes(mode)) throw new TypeError('map_mode');
  if (config?.environment === 'production' && mode !== 'real') throw new TypeError('production_synthetic_map');
  return Object.freeze({
    mode,
    usesPmtiles: mode === 'synthetic',
    stylePath: mode === 'synthetic' ? '/meteo/map-assets/style.json' : '/meteo/map-assets/style.real.json',
    center: mode === 'synthetic' ? [-169, -55] : [1.7, 41.8],
    zoom: mode === 'synthetic' ? 5 : 8,
  });
}

export function canInitializeStationMap({ config, mapMode, allowProduction = false } = {}) {
  const runtime = resolveMapRuntime({ config, mapMode });
  return config?.environment === 'local'
    || (config?.environment === 'production' && allowProduction && runtime.mode === 'real');
}

function mapUrl(apiBase, path) {
  return `${apiBase}/v1/map/${path}`;
}

export const MAP_VARIABLES = Object.freeze({
  temperature: Object.freeze({ label: 'Temperatura', unit: '°C', fieldId: 'temperature' }),
  rain_24h: Object.freeze({ label: 'Pluja 24 h', unit: 'mm', fieldId: 'rain_24h' }),
  wind_speed: Object.freeze({ label: 'Vent', unit: 'km/h', fieldId: 'wind_speed' }),
  pressure: Object.freeze({ label: 'Pressió', unit: 'hPa', fieldId: 'pressure' }),
  humidity: Object.freeze({ label: 'Humitat', unit: '%', fieldId: 'humidity' }),
});

const DEFAULT_MAP_VARIABLE = 'temperature';

function featureId(feature) {
  return feature?.properties?.public_station_id || '';
}

function fieldFor(station, variable = DEFAULT_MAP_VARIABLE) {
  const definition = MAP_VARIABLES[variable] || MAP_VARIABLES[DEFAULT_MAP_VARIABLE];
  if (station?.map_values?.[definition.fieldId]) return station.map_values[definition.fieldId];
  const field = station?.sensors?.flatMap((sensor) => sensor.fields || [])
    .find((item) => item.field_id === definition.fieldId);
  return field || null;
}

function valueFor(station, variable) {
  return fieldFor(station, variable)?.current_value;
}

export function markerKind(station, variable = DEFAULT_MAP_VARIABLE) {
  const value = valueFor(station, variable);
  if (station?.access_scope) return 'private';
  if (!Number.isFinite(value)) return 'missing';
  if (variable !== DEFAULT_MAP_VARIABLE) return 'mild';
  if (value < 10) return 'cold';
  if (value > 25) return 'warm';
  return 'mild';
}

export function markerLabel(station, variable = DEFAULT_MAP_VARIABLE) {
  const definition = MAP_VARIABLES[variable] || MAP_VARIABLES[DEFAULT_MAP_VARIABLE];
  const value = valueFor(station, variable);
  return Number.isFinite(value)
    ? `${new Intl.NumberFormat('ca', { maximumFractionDigits: 1, useGrouping: false }).format(value)} ${definition.unit}`
    : '—';
}

export function mergeAuthorizedMapCollections(publicCollection, sessionCollection) {
  const merged = new Map();
  for (const feature of publicCollection?.features || []) merged.set(featureId(feature), feature);
  for (const feature of sessionCollection?.features || []) merged.set(featureId(feature), feature);
  return { type: 'FeatureCollection', features: [...merged.values()].filter((feature) => featureId(feature)) };
}

export function selectedMarkerIds(features, stationId) {
  if (!stationId) return new Set();
  return new Set((features || [])
    .filter((feature) => featureId(feature) === stationId)
    .map((feature) => `${feature.geometry.coordinates[0]},${feature.geometry.coordinates[1]}`));
}

export async function loadAuthorizedStationMap({ apiBase, signal, query = '' } = {}) {
  const suffix = query ? `?${query}` : '';
  const [publicResponse, sessionResponse] = await Promise.all([
    fetch(mapUrl(apiBase, `stations${suffix}`), { cache: 'no-store', signal }),
    fetch(mapUrl(apiBase, 'session-stations'), { credentials: 'same-origin', cache: 'no-store', signal }),
  ]);
  if (!publicResponse.ok) throw new Error('map_unavailable');
  const headerVersion = publicResponse.headers.get('X-Catalog-Version');
  const [publicCollection, sessionCollection] = await Promise.all([
    publicResponse.json(),
    sessionResponse.ok ? sessionResponse.json() : EMPTY_COLLECTION,
  ]);
  const versionResponse = await fetch(mapUrl(apiBase, 'catalog-version'), { cache: 'no-store', signal });
  if (!versionResponse.ok) throw new Error('map_unavailable');
  const version = await versionResponse.json();
  if (!headerVersion || headerVersion !== version.catalog_version) throw new Error('map_unverified');
  return {
    collection: mergeAuthorizedMapCollections(publicCollection, sessionCollection),
    privateById: new Map((sessionCollection.features || []).map((feature) => [featureId(feature), feature])),
    catalogVersion: headerVersion,
  };
}

export async function createStationMapCore({
  container,
  config,
  mapMode,
  allowProduction = false,
  selectedStationId = '',
  selectedVariable = DEFAULT_MAP_VARIABLE,
  onStationSelect = () => {},
  onCoincident = () => {},
  selectable = () => true,
  onStatus = () => {},
  onUnavailable = () => {},
} = {}) {
  if (!container || !canInitializeStationMap({ config, mapMode, allowProduction })) return null;
  const mapRuntime = resolveMapRuntime({ config, mapMode });
  let engine;
  let map;
  let collection = EMPTY_COLLECTION;
  let selectedId = selectedStationId;
  let markers = new Map();
  let mapVariable = MAP_VARIABLES[selectedVariable] ? selectedVariable : DEFAULT_MAP_VARIABLE;
  let destroyed = false;
  let initializationFailed = false;
  let unavailableNotified = false;
  let initializationTimer;

  function notifyUnavailable() {
    if (unavailableNotified) return;
    unavailableNotified = true;
    onUnavailable();
  }

  function failInitialization() {
    if (initializationFailed) return;
    initializationFailed = true;
    clearTimeout(initializationTimer);
    map?.remove();
    map = null;
    notifyUnavailable();
  }

  function selectedCoordinates() {
    return selectedMarkerIds(collection.features, selectedId);
  }

  function updateMarkerSelection() {
    const selected = selectedCoordinates();
    for (const [id, marker] of markers) {
      const button = marker.getElement();
      const active = selected.has(id.replace(/^point-/, ''));
      button.classList.toggle('selected', active);
      if (active) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    }
  }

  function clearMarkers() {
    for (const marker of markers.values()) marker.remove();
    markers = new Map();
  }

  function fit() {
    if (!map || !collection.features.length) return;
    const bounds = new engine.LngLatBounds();
    for (const feature of collection.features) bounds.extend(feature.geometry.coordinates);
    map.fitBounds(bounds, { padding: 48, maxZoom: 12, duration: 0 });
  }

  function renderMarkers() {
    if (!map?.getSource('stations')) return;
    const sourceFeatures = mapRuntime.usesPmtiles
      ? (map.isSourceLoaded('stations') ? map.querySourceFeatures('stations') : [])
      : collection.features.map((feature) => ({ properties: feature.properties, geometry: feature.geometry }));
    const visible = new Set();
    for (const sourceFeature of sourceFeatures) {
      const props = sourceFeature.properties;
      const cluster = Boolean(props.cluster);
      const original = cluster ? null : collection.features.find((feature) => featureId(feature) === props.public_station_id);
      const coordinates = original?.geometry.coordinates || sourceFeature.geometry.coordinates;
      const id = cluster ? `cluster-${props.cluster_id}` : `point-${coordinates.join(',')}`;
      if (visible.has(id)) continue;
      visible.add(id);
      if (markers.has(id)) continue;
      const stations = cluster ? [] : collection.features
        .filter((feature) => feature.geometry.coordinates[0] === coordinates[0] && feature.geometry.coordinates[1] === coordinates[1])
        .map((feature) => feature.properties);
      const station = stations[0];
      if (!cluster && !station) continue;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'map-marker';
      button.textContent = cluster ? String(props.point_count) : stations.length > 1 ? `${stations.length} estacions` : markerLabel(station, mapVariable);
      button.classList.add(cluster ? 'cluster' : markerKind(station, mapVariable));
      if (!cluster) button.classList.add(`variable-${mapVariable}`);
      const canSelect = !cluster && stations.length === 1 && selectable(station);
      button.setAttribute('aria-label', cluster ? `Amplia el grup de ${props.point_count} estacions`
        : stations.length > 1 ? `Tria entre ${stations.length} estacions coincidents`
          : canSelect ? `${station.public_name}: ${markerLabel(station, mapVariable)}` : `${station.public_name}: no seleccionable des d’aquesta vista`);
      if (!cluster && !canSelect && stations.length === 1) button.disabled = true;
      button.onclick = async () => {
        if (!cluster) {
          if (stations.length > 1) return onCoincident(stations);
          if (canSelect) return onStationSelect(station.public_station_id);
          return undefined;
        }
        try {
          const zoom = await map.getSource('stations').getClusterExpansionZoom(props.cluster_id);
          map.easeTo({ center: coordinates, zoom, duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 250 });
        } catch { onStatus('Consulta les estacions del grup a la llista.'); }
      };
      markers.set(id, new engine.Marker({ element: button }).setLngLat(coordinates).addTo(map));
    }
    for (const [id, marker] of markers) {
      if (!visible.has(id)) { marker.remove(); markers.delete(id); }
    }
    updateMarkerSelection();
  }

  try {
    engine = await import('/meteo/map-assets/maplibre-gl.mjs');
    const workerResponse = await fetch('/meteo/map-assets/maplibre-gl-worker.mjs');
    if (!workerResponse.ok) throw new Error('worker');
    engine.setWorkerUrl('/meteo/map-assets/maplibre-gl-worker.mjs');
    if (mapRuntime.usesPmtiles) {
      const protocol = new window.pmtiles.Protocol();
      engine.addProtocol('pmtiles', protocol.tile);
    }
    const styleResponse = await fetch(mapRuntime.stylePath, { cache: 'no-store' });
    if (!styleResponse.ok) throw new Error('style');
    const style = await styleResponse.json();
    if (mapRuntime.usesPmtiles) style.sources.synthetic.url = `pmtiles://${location.origin}/meteo/map-assets/map-a-synthetic.pmtiles`;
    map = new engine.Map({
      container,
      style,
      center: mapRuntime.center,
      zoom: mapRuntime.zoom,
      attributionControl: false,
      locale: { 'NavigationControl.ZoomIn': 'Amplia el mapa', 'NavigationControl.ZoomOut': 'Redueix el mapa' },
      transformRequest(url) {
        const candidate = new URL(url.replace(/^pmtiles:\/\//, ''), location.href);
        if (candidate.origin !== location.origin && (mapRuntime.usesPmtiles || candidate.origin !== 'https://tile.openstreetmap.org')) throw new Error('external_resource');
        return { url };
      },
    });
    map.addControl(new engine.NavigationControl({ showCompass: false }), 'top-right');
    map.getCanvas().setAttribute('aria-label', 'Mapa. Fes servir les fletxes per moure’t i + o − per ampliar o reduir.');
    await new Promise((resolve, reject) => {
      initializationTimer = setTimeout(() => {
        failInitialization();
        reject(new Error('map_timeout'));
      }, mapRuntime.usesPmtiles ? 8000 : 15000);
      map.on('error', (event) => {
        if (!mapRuntime.usesPmtiles) {
          onStatus('Algunes parts de la base cartogràfica no estan disponibles.');
          return;
        }
        failInitialization();
        reject(event?.error || new Error('map_error'));
      });
      map.on('load', () => {
        if (initializationFailed || destroyed) return;
        clearTimeout(initializationTimer);
        resolve();
      });
    });
    if (destroyed || initializationFailed || !map) return null;
    map.addSource('stations', { type: 'geojson', data: collection, cluster: mapRuntime.usesPmtiles, clusterRadius: 50, clusterMaxZoom: 14 });
    map.addLayer({ id: 'station-points', type: 'circle', source: 'stations', paint: { 'circle-radius': 1, 'circle-opacity': 0 } });
    map.on('render', renderMarkers);
    return {
      setCollection(next, { fit: shouldFit = false } = {}) {
        collection = next || EMPTY_COLLECTION;
        map.getSource('stations')?.setData(collection);
        if (shouldFit) fit();
        updateMarkerSelection();
      },
      setSelectedStation(id) {
        selectedId = id || '';
        updateMarkerSelection();
      },
      setVariable(variable) {
        if (!MAP_VARIABLES[variable] || variable === mapVariable) return;
        mapVariable = variable;
        clearMarkers();
        renderMarkers();
      },
      getVariable() { return mapVariable; },
      fit,
      destroy() {
        destroyed = true;
        clearMarkers();
        map?.remove();
        map = null;
      },
    };
  } catch {
    if (!destroyed) notifyUnavailable();
    return null;
  }
}
