'use strict';

const crypto = require('node:crypto');
const { generalizeGeometry } = require('../providers/mapGeometry');
const { normalizeDescription, normalizeStationName, validPublicId } = require('./stationCatalogService');

const ADMIN_SOURCES = Object.freeze(['METEOLORD', 'GRAFANA']);
const ADMIN_PROVENANCE = Object.freeze(['ADMIN_VERIFIED', 'FIELD_SURVEY', 'SOURCE_DOCUMENT']);
const PUBLICATION_RADII = Object.freeze({
  HIDDEN: null, APPROX_100M: 100, APPROX_1KM: 1000, APPROX_5KM: 5000, APPROX_10KM: 10000,
});

function normalizedText(value, minimum, maximum) {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().replace(/\s+/g, ' ');
  return normalized.length >= minimum && normalized.length <= maximum && !/[\u0000-\u001f\u007f]/.test(normalized)
    ? normalized : null;
}

function normalizeManagedStation(input, { requireRevision = false } = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const name = normalizeStationName(input.name);
  const description = normalizeDescription(input.description);
  const source = ADMIN_SOURCES.includes(input.source_namespace) ? input.source_namespace : null;
  const externalId = normalizedText(input.external_id, 1, 120);
  const provenance = ADMIN_PROVENANCE.includes(input.provenance) ? input.provenance : null;
  const referenceLabel = input.reference_label === '' || input.reference_label == null
    ? null : normalizedText(input.reference_label, 1, 200);
  const revision = input.revision;
  if (!name || description === undefined || !source || !externalId || !provenance
      || (input.reference_label != null && input.reference_label !== '' && !referenceLabel)
      || !Number.isFinite(input.longitude) || input.longitude < -180 || input.longitude > 180
      || !Number.isFinite(input.latitude) || input.latitude < -90 || input.latitude > 90
      || !Number.isSafeInteger(input.accuracy_m) || input.accuracy_m < 0 || input.accuracy_m > 100000
      || (requireRevision && (!Number.isSafeInteger(revision) || revision < 0))) return null;
  return {
    name, description, source_namespace: source, external_id: externalId,
    longitude: input.longitude, latitude: input.latitude, accuracy_m: input.accuracy_m,
    provenance, reference_label: referenceLabel,
    ...(requireRevision ? { revision } : {}),
  };
}

function managedDto(row) {
  return {
    id: row.public_id,
    name: row.nom,
    description: row.description,
    lifecycle: row.lifecycle,
    visibility: row.visibility,
    revision: Number(row.revision),
    source: {
      namespace: row.source_namespace,
      external_id: row.external_id,
      status: row.binding_status,
    },
    location: {
      longitude: row.private_longitude == null ? null : Number(row.private_longitude),
      latitude: row.private_latitude == null ? null : Number(row.private_latitude),
      accuracy_m: row.accuracy_m == null ? null : Number(row.accuracy_m),
      provenance: row.provenance,
      reference_label: row.reference_label,
      publication_mode: row.publication_mode || 'HIDDEN',
      verified_at: row.verified_at ? new Date(row.verified_at).toISOString() : null,
    },
    override_fields: Array.isArray(row.override_fields) ? [...row.override_fields].sort() : [],
  };
}

const SELECT_MANAGED = `
  SELECT e.id,e.public_id,e.nom,e.description,e.lifecycle,e.visibility,e.revision,
    b.source_namespace,b.external_id,b.binding_status,
    l.publication_mode,l.accuracy_m,l.provenance,l.reference_label,l.verified_at,
    public.ST_X(l.private_geometry) AS private_longitude,
    public.ST_Y(l.private_geometry) AS private_latitude,
    ARRAY(SELECT o.field_key FROM meteo.manual_overrides o WHERE o.station_id=e.id ORDER BY o.field_key) AS override_fields
  FROM meteo.estacions e
  JOIN meteo.source_bindings b ON b.station_id=e.id AND b.binding_status='VALIDATED'
  LEFT JOIN meteo.station_locations l ON l.station_id=e.id
  WHERE e.management_kind='ADMIN'
`;

function makeAdminCatalogService({ pool, clock } = {}) {
  if (!pool?.query || typeof pool.connect !== 'function') throw new TypeError('Admin catalog transaction pool is required');
  const now = () => new Date(typeof clock === 'function' ? clock() : clock?.now ? clock.now() : Date.now());

  async function list() {
    const result = await pool.query(`${SELECT_MANAGED} ORDER BY e.nom,e.id`);
    return result.rows.map(managedDto);
  }

  async function get(publicId) {
    if (!validPublicId(publicId)) return null;
    const result = await pool.query(`${SELECT_MANAGED} AND e.public_id=$1 LIMIT 1`, [publicId]);
    return result.rowCount === 1 ? managedDto(result.rows[0]) : null;
  }

  async function create(actorId, input) {
    const value = normalizeManagedStation(input);
    if (!value) return { invalid: true };
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const station = await client.query(`
        INSERT INTO meteo.estacions(codi,nom,description,management_kind,lifecycle,visibility)
        VALUES ($1,$2,$3,'ADMIN','ACTIVE','PRIVATE') RETURNING id,public_id
      `, [`adm-${crypto.randomUUID()}`, value.name, value.description]);
      const stationId = station.rows[0].id;
      await client.query(`
        INSERT INTO meteo.source_bindings(
          station_id,source_namespace,external_id,binding_status,evidence_ref
        ) VALUES ($1,$2,$3,'VALIDATED',$4)
      `, [stationId, value.source_namespace, value.external_id, value.reference_label]);
      const instant = now();
      await client.query(`
        INSERT INTO meteo.station_locations(
          station_id,private_geometry,public_geometry,publication_mode,accuracy_m,provenance,
          reference_label,verified_at,geo_policy_version,revision,updated_at
        ) VALUES (
          $1,public.ST_SetSRID(public.ST_MakePoint($2,$3),4326),NULL,'HIDDEN',$4,$5,$6,
          $7::timestamptz,'ue-admin-catalog-v1',0,$7::timestamptz
        )
      `, [stationId, value.longitude, value.latitude, value.accuracy_m,
        value.provenance, value.reference_label, instant]);
      await client.query(`
        INSERT INTO meteo.audit_events(actor_user_id,action,resource_kind,resource_id,details)
        VALUES ($1,'ADMIN_STATION_CREATED','STATION',$2,$3::jsonb)
      `, [actorId, station.rows[0].public_id, JSON.stringify({
        source_namespace: value.source_namespace, external_id: value.external_id,
        accuracy_m: value.accuracy_m, provenance: value.provenance,
      })]);
      await client.query('COMMIT');
      return { station: await get(station.rows[0].public_id) };
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      if (error?.code === '23505') return { duplicate: true };
      throw error;
    } finally { client.release(); }
  }

  async function update(actorId, publicId, input) {
    if (!validPublicId(publicId)) return { notFound: true };
    const value = normalizeManagedStation(input, { requireRevision: true });
    if (!value) return { invalid: true };
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const currentResult = await client.query(`
        SELECT e.id,e.public_id,e.nom,e.description,e.lifecycle,e.visibility,e.revision,
          b.source_namespace,b.external_id,l.publication_mode,l.accuracy_m,l.provenance,l.reference_label,
          public.ST_X(l.private_geometry) AS private_longitude,
          public.ST_Y(l.private_geometry) AS private_latitude
        FROM meteo.estacions e
        JOIN meteo.source_bindings b ON b.station_id=e.id AND b.binding_status='VALIDATED'
        JOIN meteo.station_locations l ON l.station_id=e.id
        WHERE e.public_id=$1 AND e.management_kind='ADMIN' AND e.owner_id IS NULL AND e.lifecycle<>'RETIRED'
        FOR UPDATE OF e,b,l
      `, [publicId]);
      if (currentResult.rowCount !== 1) { await client.query('ROLLBACK'); return { notFound: true }; }
      const current = currentResult.rows[0];
      if (Number(current.revision) !== value.revision) { await client.query('ROLLBACK'); return { conflict: true }; }
      const fields = {
        name: [current.nom, value.name], description: [current.description, value.description],
        source_namespace: [current.source_namespace, value.source_namespace],
        external_id: [current.external_id, value.external_id],
        longitude: [Number(current.private_longitude), value.longitude],
        latitude: [Number(current.private_latitude), value.latitude],
        accuracy_m: [Number(current.accuracy_m), value.accuracy_m],
        provenance: [current.provenance, value.provenance],
        reference_label: [current.reference_label, value.reference_label],
      };
      const changed = Object.entries(fields).filter(([, [before, after]]) => before !== after).map(([key]) => key);
      if (changed.length === 0) { await client.query('COMMIT'); return { station: await get(publicId), unchanged: true }; }
      const radius = PUBLICATION_RADII[current.publication_mode] ?? null;
      const publicGeometry = radius === null ? null : generalizeGeometry({
        private_geometry: { type: 'Point', coordinates: [value.longitude, value.latitude] },
        geo_publication: 'APPROXIMATED', privacy_radius_m: radius,
      });
      if (radius !== null && !publicGeometry) { await client.query('ROLLBACK'); return { invalid: true }; }
      const instant = now();
      await client.query(`
        UPDATE meteo.estacions SET nom=$2,description=$3,revision=revision+1 WHERE id=$1
      `, [current.id, value.name, value.description]);
      await client.query(`
        UPDATE meteo.source_bindings SET source_namespace=$2,external_id=$3,evidence_ref=$4 WHERE station_id=$1 AND binding_status='VALIDATED'
      `, [current.id, value.source_namespace, value.external_id, value.reference_label]);
      await client.query(`
        UPDATE meteo.station_locations SET
          private_geometry=public.ST_SetSRID(public.ST_MakePoint($2,$3),4326),
          public_geometry=CASE WHEN $4::double precision IS NULL THEN NULL ELSE public.ST_SetSRID(public.ST_MakePoint($4,$5),4326) END,
          accuracy_m=$6,provenance=$7,reference_label=$8,verified_at=$9::timestamptz,
          geo_policy_version='ue-admin-catalog-v1',revision=revision+1,updated_at=$9::timestamptz
        WHERE station_id=$1
      `, [current.id, value.longitude, value.latitude,
        publicGeometry?.coordinates[0] ?? null, publicGeometry?.coordinates[1] ?? null,
        value.accuracy_m, value.provenance, value.reference_label, instant]);
      for (const field of changed) {
        await client.query(`
          INSERT INTO meteo.manual_overrides(station_id,field_key,value_json,changed_by,changed_at)
          VALUES ($1,$2,$3::jsonb,$4,$5::timestamptz)
          ON CONFLICT (station_id,field_key) DO UPDATE SET
            value_json=EXCLUDED.value_json,changed_by=EXCLUDED.changed_by,changed_at=EXCLUDED.changed_at
        `, [current.id, field, JSON.stringify({ value: fields[field][1], origin: 'ADMIN_CORRECTION' }), actorId, instant]);
      }
      if (current.visibility === 'PUBLIC') {
        await client.query('UPDATE meteo.map_catalog_state SET revision=revision+1,updated_at=$1 WHERE id=1', [instant]);
      }
      await client.query(`
        INSERT INTO meteo.audit_events(actor_user_id,action,resource_kind,resource_id,details)
        VALUES ($1,'ADMIN_STATION_CORRECTED','STATION',$2,$3::jsonb)
      `, [actorId, publicId, JSON.stringify({ fields: changed, revision: value.revision + 1 })]);
      await client.query('COMMIT');
      return { station: await get(publicId) };
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      if (error?.code === '23505') return { duplicate: true };
      throw error;
    } finally { client.release(); }
  }

  return { create, get, list, update };
}

module.exports = {
  ADMIN_PROVENANCE, ADMIN_SOURCES, makeAdminCatalogService, managedDto, normalizeManagedStation,
};
