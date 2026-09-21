'use strict';

const { validPublicId } = require('./stationCatalogService');
const { freshnessAt } = require('./snapshotService');
const { generalizeGeometry } = require('../providers/mapGeometry');

const MODES = Object.freeze({ APPROX_1KM: 1000, APPROX_5KM: 5000, APPROX_10KM: 10000, HIDDEN: null });

function normalizeLocation(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  if (!Object.hasOwn(MODES, input.mode)) return null;
  if (!Number.isFinite(input.longitude) || input.longitude < -180 || input.longitude > 180
    || !Number.isFinite(input.latitude) || input.latitude < -90 || input.latitude > 90) return null;
  if (typeof input.publish !== 'boolean' || typeof input.consent !== 'boolean') return null;
  if (!Number.isSafeInteger(input.revision) || input.revision < 0) return null;
  if (input.publish && input.consent !== true) return null;
  const radius = MODES[input.mode];
  const privateGeometry = { type: 'Point', coordinates: [input.longitude, input.latitude] };
  const publicGeometry = radius === null ? null : generalizeGeometry({
    private_geometry: privateGeometry,
    geo_publication: 'APPROXIMATED',
    privacy_radius_m: radius,
  });
  if (radius !== null && !publicGeometry) return null;
  return { mode: input.mode, publish: input.publish, consent: input.consent, radius, privateGeometry, publicGeometry };
}

function ownerLocationDto(row) {
  return {
    mode: row.publication_mode || 'HIDDEN',
    longitude: row.private_longitude == null ? null : Number(row.private_longitude),
    latitude: row.private_latitude == null ? null : Number(row.private_latitude),
    accuracy_m: row.accuracy_m == null ? null : Number(row.accuracy_m),
    published: row.visibility === 'PUBLIC',
    consented: row.publication_consent_at != null && row.consent_revoked_at == null,
    policy_version: row.geo_policy_version || 'ue-user-grid-v1',
  };
}

function mapField(fieldId, unit, value, observedAt, now) {
  const freshness = freshnessAt(observedAt, now);
  const publicFreshness = freshness === 'FRESH' ? 'FRESCA'
    : freshness === 'STALE' ? 'SENSE_DADES_RECENTS' : 'OBSOLETA';
  const valid = Number.isFinite(value);
  return {
    field_id: fieldId,
    unit,
    quality: valid ? 'OK' : 'SOSPITOSA',
    freshness: publicFreshness,
    review: 'NORMAL',
    reliable: valid && freshness === 'FRESH',
    current_value: valid && freshness !== 'OBSOLETE' ? value : null,
    last_value: valid ? value : null,
  };
}

function mapFeature(row, { exact = false, now = new Date() } = {}) {
  const coordinates = exact
    ? [Number(row.private_longitude), Number(row.private_latitude)]
    : [Number(row.public_longitude), Number(row.public_latitude)];
  const values = row.values_json || {};
  const sensors = [{
    sensor_id: `${String(row.source_namespace || 'ecowitt').toLowerCase()}-outdoor`,
    fields: [
      mapField('temperature', 'celsius', values.temp_c, row.observed_at, now),
      mapField('humidity', 'percent', values.humitat_pct, row.observed_at, now),
    ],
  }];
  const properties = {
    public_station_id: row.public_id,
    public_name: row.nom,
    geo_publication: exact ? 'EXACT' : 'APPROXIMATED',
    sensors,
    observed_at: row.observed_at ? new Date(row.observed_at).toISOString() : null,
    provenance: {
      source: row.source_namespace || 'ECOWITT',
      licence_or_legal_basis_ref: row.management_kind === 'ADMIN'
        ? (row.reference_label || row.location_provenance || 'ADMIN_CATALOG') : 'OWNER_CONSENT',
    },
    catalog_version: `ue-map-${row.catalog_revision}`,
  };
  if (exact) {
    properties.access_scope = row.access_scope;
    properties.visibility = row.visibility;
  }
  return { type: 'Feature', id: row.public_id, geometry: { type: 'Point', coordinates }, properties };
}

function makeStationLocationService({ pool, clock } = {}) {
  if (!pool?.query) throw new TypeError('Station location pool is required');
  const now = () => new Date(typeof clock === 'function' ? clock() : clock?.now ? clock.now() : Date.now());

  async function getOwn(ownerId, publicId) {
    if (!validPublicId(publicId)) return null;
    const result = await pool.query(`
      SELECT e.revision,e.visibility,l.publication_mode,l.accuracy_m,l.geo_policy_version,
        l.publication_consent_at,l.consent_revoked_at,
        public.ST_X(l.private_geometry) AS private_longitude,
        public.ST_Y(l.private_geometry) AS private_latitude
      FROM meteo.estacions e LEFT JOIN meteo.station_locations l ON l.station_id=e.id
      WHERE e.public_id=$1 AND e.owner_id=$2 AND e.management_kind='USER' AND e.lifecycle<>'RETIRED'
    `, [publicId, ownerId]);
    if (result.rowCount !== 1) return null;
    return { revision: Number(result.rows[0].revision), location: ownerLocationDto(result.rows[0]) };
  }

  async function updateOwn(ownerId, publicId, input) {
    if (!validPublicId(publicId)) return { notFound: true };
    const normalized = normalizeLocation(input);
    if (!normalized) return { invalid: true };
    if (!pool.connect) throw new TypeError('Station location transaction support is required');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const stationResult = await client.query(`
        SELECT e.id,e.revision,e.lifecycle,e.visibility,u.account_status,u.email_verified_at,u.approved_at,
          EXISTS(SELECT 1 FROM meteo.station_connectors c WHERE c.station_id=e.id AND c.enabled=true AND c.status='READY') AS connector_ready,
          EXISTS(SELECT 1 FROM meteo.source_bindings b JOIN meteo.current_snapshots s ON s.binding_id=b.id
            WHERE b.station_id=e.id AND b.binding_status='VALIDATED' AND s.observed_at IS NOT NULL) AS snapshot_ready
        FROM meteo.estacions e JOIN auth.usuaris u ON u.id=e.owner_id
        WHERE e.public_id=$1 AND e.owner_id=$2 AND e.management_kind='USER' AND e.lifecycle<>'RETIRED'
        FOR UPDATE
      `, [publicId, ownerId]);
      if (stationResult.rowCount !== 1) { await client.query('ROLLBACK'); return { notFound: true }; }
      const station = stationResult.rows[0];
      if (Number(station.revision) !== input.revision) { await client.query('ROLLBACK'); return { conflict: true }; }
      if (normalized.publish && (station.lifecycle !== 'ACTIVE' || station.account_status !== 'APPROVED'
        || !station.email_verified_at || !station.approved_at || !station.connector_ready || !station.snapshot_ready)) {
        await client.query('ROLLBACK');
        return { gate: true };
      }
      const instant = now();
      await client.query(`
        INSERT INTO meteo.station_locations(
          station_id,private_geometry,public_geometry,publication_mode,accuracy_m,provenance,
          geo_policy_version,publication_consent_at,consent_revoked_at,revision,updated_at
        ) VALUES (
          $1,public.ST_SetSRID(public.ST_MakePoint($2,$3),4326),
          CASE WHEN $4::double precision IS NULL THEN NULL ELSE public.ST_SetSRID(public.ST_MakePoint($4,$5),4326) END,
          $6,$7,'OWNER_DECLARED','ue-user-grid-v1',
          CASE WHEN $8 THEN $9::timestamptz ELSE NULL END,CASE WHEN $8 THEN NULL ELSE $9::timestamptz END,1,$9::timestamptz
        )
        ON CONFLICT (station_id) DO UPDATE SET
          private_geometry=EXCLUDED.private_geometry,public_geometry=EXCLUDED.public_geometry,
          publication_mode=EXCLUDED.publication_mode,accuracy_m=EXCLUDED.accuracy_m,provenance=EXCLUDED.provenance,
          geo_policy_version=EXCLUDED.geo_policy_version,
          publication_consent_at=CASE WHEN $8 THEN COALESCE(meteo.station_locations.publication_consent_at,$9::timestamptz) ELSE NULL END,
          consent_revoked_at=CASE WHEN $8 THEN NULL ELSE $9::timestamptz END,
          revision=meteo.station_locations.revision+1,updated_at=$9::timestamptz
      `, [station.id, normalized.privateGeometry.coordinates[0], normalized.privateGeometry.coordinates[1],
        normalized.publicGeometry?.coordinates[0] ?? null, normalized.publicGeometry?.coordinates[1] ?? null,
        normalized.mode, normalized.radius, normalized.publish && normalized.consent, instant]);
      const updated = await client.query(`
        UPDATE meteo.estacions SET visibility=$2,revision=revision+1
        WHERE id=$1 RETURNING revision,visibility
      `, [station.id, normalized.publish ? 'PUBLIC' : 'PRIVATE']);
      if (station.visibility === 'PUBLIC' || normalized.publish) {
        await client.query('UPDATE meteo.map_catalog_state SET revision=revision+1,updated_at=$1 WHERE id=1', [instant]);
      }
      await client.query(`
        INSERT INTO meteo.audit_events(actor_user_id,action,resource_kind,resource_id,details)
        VALUES ($1,$2,'STATION',$3,$4)
      `, [ownerId, normalized.publish ? 'STATION_PUBLISHED' : station.visibility === 'PUBLIC' ? 'STATION_UNPUBLISHED' : 'STATION_LOCATION_UPDATED',
        publicId, JSON.stringify({ publication_mode: normalized.mode, accuracy_m: normalized.radius })]);
      await client.query('COMMIT');
      return { revision: Number(updated.rows[0].revision), visibility: updated.rows[0].visibility };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally { client.release(); }
  }

  const MAP_SELECT = `
    SELECT e.id,e.public_id,e.nom,e.visibility,e.management_kind,b.source_namespace,s.observed_at,s.values_json,
      l.provenance AS location_provenance,l.reference_label,
      public.ST_X(l.private_geometry) AS private_longitude,public.ST_Y(l.private_geometry) AS private_latitude,
      public.ST_X(l.public_geometry) AS public_longitude,public.ST_Y(l.public_geometry) AS public_latitude,
      c.revision AS catalog_revision
    FROM meteo.estacions e
    JOIN meteo.station_locations l ON l.station_id=e.id
    JOIN meteo.source_bindings b ON b.station_id=e.id AND b.binding_status='VALIDATED'
    JOIN meteo.current_snapshots s ON s.binding_id=b.id
    CROSS JOIN meteo.map_catalog_state c
  `;

  async function publicRows() {
    const result = await pool.query(`${MAP_SELECT}
      LEFT JOIN auth.usuaris u ON u.id=e.owner_id
      WHERE e.lifecycle='ACTIVE' AND e.visibility='PUBLIC'
        AND b.source_namespace<>'GRAFANA'
        AND (e.management_kind<>'USER' OR (
          u.account_status='APPROVED' AND u.actiu=true
          AND u.email_verified_at IS NOT NULL AND u.approved_at IS NOT NULL
        ))
        AND l.publication_mode<>'HIDDEN' AND l.public_geometry IS NOT NULL
        AND (e.management_kind<>'USER' OR (
          l.publication_consent_at IS NOT NULL AND l.consent_revoked_at IS NULL
        ))
      ORDER BY e.nom,e.id
    `);
    return result.rows;
  }

  async function catalogVersion() {
    const result = await pool.query('SELECT revision FROM meteo.map_catalog_state WHERE id=1');
    return `ue-map-${result.rows[0]?.revision || 1}`;
  }

  async function publicCollection() {
    const rows = await publicRows();
    return { type: 'FeatureCollection', features: rows.map((row) => mapFeature(row, { now: now() })) };
  }

  async function publicStation(publicId) {
    if (!validPublicId(publicId)) return null;
    const rows = await publicRows();
    const row = rows.find((candidate) => String(candidate.public_id) === publicId);
    if (!row) return null;
    const feature = mapFeature(row, { now: now() });
    return { ...feature.properties, public_geometry: feature.geometry };
  }

  async function privateCollection(actor, all = false) {
    const params = [];
    const predicate = all ? '' : 'AND e.owner_id=$1';
    if (!all) params.push(actor.id);
    const result = await pool.query(`${MAP_SELECT}
      WHERE e.lifecycle<>'RETIRED' AND l.private_geometry IS NOT NULL ${predicate}
      ORDER BY e.nom,e.id
    `, params);
    return {
      type: 'FeatureCollection',
      features: result.rows.map((row) => mapFeature({ ...row, access_scope: all ? 'ADMIN' : 'OWNER' }, { exact: true, now: now() })),
    };
  }

  return { catalogVersion, getOwn, privateCollection, publicCollection, publicStation, updateOwn };
}

module.exports = { MODES, makeStationLocationService, mapFeature, normalizeLocation };
