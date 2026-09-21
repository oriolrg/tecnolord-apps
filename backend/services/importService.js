'use strict';

const crypto = require('node:crypto');
const { ADMIN_SOURCES } = require('./adminCatalogService');
const { normalizeDescription, normalizeStationName } = require('./stationCatalogService');

const MAX_ROWS = 500;
const MAPPING_STATES = new Set(['VERIFIED', 'UNVERIFIED', 'UNKNOWN']);

function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
}

function boundedString(value, maximum) {
  return typeof value === 'string' && value.length <= maximum && !/[\u0000-\u001f\u007f]/.test(value) ? value.trim() : null;
}

function normalizeInventory(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)
      || !ADMIN_SOURCES.includes(input.source_namespace)
      || !Array.isArray(input.rows) || input.rows.length < 1 || input.rows.length > MAX_ROWS) return null;
  const rows = [];
  const codes = new Set();
  for (const raw of input.rows) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    const inventoryCode = boundedString(raw.inventory_code, 32);
    if (!inventoryCode || !/^[A-Z][A-Z0-9_-]{1,31}$/.test(inventoryCode) || codes.has(inventoryCode)) return null;
    codes.add(inventoryCode);
    const name = boundedString(raw.name, 200);
    const externalId = raw.external_id == null || raw.external_id === '' ? null : boundedString(raw.external_id, 120);
    const evidenceRef = boundedString(raw.evidence_ref, 200);
    const description = raw.description == null || raw.description === '' ? null : boundedString(raw.description, 500);
    const longitude = raw.longitude == null ? null : raw.longitude;
    const latitude = raw.latitude == null ? null : raw.latitude;
    const accuracy = raw.accuracy_m == null ? null : raw.accuracy_m;
    if (!name || (raw.external_id != null && raw.external_id !== '' && !externalId)
        || !evidenceRef || !MAPPING_STATES.has(raw.mapping_status)
        || (longitude !== null && !Number.isFinite(longitude))
        || (latitude !== null && !Number.isFinite(latitude))
        || (accuracy !== null && (!Number.isSafeInteger(accuracy) || accuracy < 0 || accuracy > 100000))) return null;
    rows.push({
      inventory_code: inventoryCode, name, description, external_id: externalId,
      mapping_status: raw.mapping_status, longitude, latitude, accuracy_m: accuracy,
      evidence_ref: evidenceRef,
    });
  }
  rows.sort((left, right) => left.inventory_code.localeCompare(right.inventory_code));
  return { source_namespace: input.source_namespace, rows };
}

function completeExternalId(namespace, value) {
  if (namespace === 'GRAFANA') return typeof value === 'string' && /^Meteo-[0-9]{3}-[0-9]{5,8}$/.test(value);
  return typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._:-]{2,119}$/.test(value);
}

function validateCandidate(namespace, row, duplicateIds = new Set()) {
  if (row.inventory_code.startsWith('TEST')) return { status: 'QUARANTINED', issue: 'TEST_STATION' };
  if (row.mapping_status !== 'VERIFIED') return { status: 'QUARANTINED', issue: 'MAPPING_UNVERIFIED' };
  if (!completeExternalId(namespace, row.external_id)) return { status: 'QUARANTINED', issue: 'INCOMPLETE_EXTERNAL_ID' };
  if (!normalizeStationName(row.name) || normalizeDescription(row.description) === undefined) {
    return { status: 'QUARANTINED', issue: 'INVALID_METADATA' };
  }
  const hasLongitude = row.longitude !== null;
  const hasLatitude = row.latitude !== null;
  if (hasLongitude !== hasLatitude || (!hasLongitude && row.accuracy_m !== null)
      || hasLongitude && (row.longitude < -180 || row.longitude > 180
      || row.latitude < -90 || row.latitude > 90 || row.accuracy_m === null)) {
    return { status: 'QUARANTINED', issue: 'INVALID_LOCATION' };
  }
  if (duplicateIds.has(row.external_id)) return { status: 'CONFLICT', issue: 'DUPLICATE_EXTERNAL_ID' };
  return { status: 'VALIDATED', issue: null };
}

function publicCandidate(candidate) {
  const { _before, _expected_revision, _applied_revision, ...visible } = candidate;
  return visible;
}

function batchDto(batch, rows) {
  return {
    id: String(batch.id), source_namespace: batch.source_namespace, content_hash: batch.content_hash,
    status: batch.batch_status, created_at: new Date(batch.created_at).toISOString(),
    applied_at: batch.applied_at ? new Date(batch.applied_at).toISOString() : null,
    counts: rows.reduce((counts, row) => {
      counts[row.row_status.toLowerCase()] = (counts[row.row_status.toLowerCase()] || 0) + 1;
      return counts;
    }, {}),
    rows: rows.map((row) => ({
      inventory_code: row.inventory_code, status: row.row_status, issue_code: row.issue_code,
      station_id: row.station_public_id || null, action: row.candidate?._action || null,
      candidate: publicCandidate(row.candidate || {}),
    })),
  };
}

class ImportConflict extends Error {}

function makeImportService({ pool, clock } = {}) {
  if (!pool?.query || typeof pool.connect !== 'function') throw new TypeError('Import transaction pool is required');
  const now = () => new Date(typeof clock === 'function' ? clock() : clock?.now ? clock.now() : Date.now());

  async function get(batchId, queryable = pool) {
    if (!/^[1-9][0-9]{0,18}$/.test(String(batchId || ''))) return null;
    const batchResult = await queryable.query('SELECT * FROM meteo.import_batches WHERE id=$1', [batchId]);
    if (batchResult.rowCount !== 1) return null;
    const rows = await queryable.query(`
      SELECT r.*,e.public_id AS station_public_id FROM meteo.import_rows r
      LEFT JOIN meteo.estacions e ON e.id=r.station_id
      WHERE r.batch_id=$1 ORDER BY r.inventory_code
    `, [batchId]);
    return batchDto(batchResult.rows[0], rows.rows);
  }

  async function list() {
    const result = await pool.query('SELECT id FROM meteo.import_batches ORDER BY id DESC LIMIT 50');
    return Promise.all(result.rows.map((row) => get(row.id)));
  }

  async function previousMappings(client, namespace) {
    const result = await client.query(`
      SELECT DISTINCT ON (r.inventory_code) r.inventory_code,r.station_id,r.candidate,e.revision,
        e.nom,e.description,b.external_id,
        public.ST_X(l.private_geometry) AS longitude,public.ST_Y(l.private_geometry) AS latitude,
        l.accuracy_m,l.reference_label
      FROM meteo.import_rows r
      JOIN meteo.import_batches ib ON ib.id=r.batch_id AND ib.batch_status='APPLIED'
      JOIN meteo.estacions e ON e.id=r.station_id AND e.management_kind='ADMIN'
      JOIN meteo.source_bindings b ON b.station_id=e.id AND b.source_namespace=ib.source_namespace AND b.binding_status='VALIDATED'
      LEFT JOIN meteo.station_locations l ON l.station_id=e.id
      WHERE ib.source_namespace=$1
      ORDER BY r.inventory_code,ib.id DESC
    `, [namespace]);
    return new Map(result.rows.map((row) => [row.inventory_code, row]));
  }

  async function stage(actorId, input) {
    const inventory = normalizeInventory(input);
    if (!inventory) return { invalid: true };
    const canonical = stable(inventory);
    const hash = crypto.createHash('sha256').update(canonical).digest('hex');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`${inventory.source_namespace}:${hash}`]);
      const existing = await client.query(`
        SELECT id FROM meteo.import_batches WHERE source_namespace=$1 AND content_hash=$2
      `, [inventory.source_namespace, hash]);
      if (existing.rowCount === 1) {
        await client.query('COMMIT');
        return { batch: await get(existing.rows[0].id), idempotent: true };
      }
      const inserted = await client.query(`
        INSERT INTO meteo.import_batches(source_namespace,content_hash,created_by)
        VALUES ($1,$2,$3) RETURNING *
      `, [inventory.source_namespace, hash, actorId]);
      const batch = inserted.rows[0];
      const previous = await previousMappings(client, inventory.source_namespace);
      const counts = new Map();
      for (const row of inventory.rows) if (row.external_id) counts.set(row.external_id, (counts.get(row.external_id) || 0) + 1);
      const duplicates = new Set([...counts].filter(([, count]) => count > 1).map(([id]) => id));
      for (const row of inventory.rows) {
        let { status, issue } = validateCandidate(inventory.source_namespace, row, duplicates);
        const candidate = { ...row };
        const prior = previous.get(row.inventory_code);
        if (status === 'VALIDATED' && prior) {
          if (prior.external_id !== row.external_id) {
            status = 'CONFLICT'; issue = 'SOURCE_ID_CHANGED';
          } else {
            const fields = {
              name: [prior.nom, normalizeStationName(row.name)],
              description: [prior.description, normalizeDescription(row.description)],
              ...(row.longitude === null ? {} : {
                longitude: [prior.longitude == null ? null : Number(prior.longitude), row.longitude],
                latitude: [prior.latitude == null ? null : Number(prior.latitude), row.latitude],
                accuracy_m: [prior.accuracy_m == null ? null : Number(prior.accuracy_m), row.accuracy_m],
                reference_label: [prior.reference_label, row.evidence_ref],
              }),
            };
            const changes = Object.entries(fields).filter(([, [before, after]]) => before !== after).map(([field]) => field);
            if (changes.length) {
              const overrides = await client.query(`
                SELECT field_key FROM meteo.manual_overrides WHERE station_id=$1 AND field_key=ANY($2::text[])
              `, [prior.station_id, changes]);
              if (overrides.rowCount) { status = 'CONFLICT'; issue = 'MANUAL_OVERRIDE_DIVERGENCE'; }
            }
            candidate._action = changes.length ? 'UPDATE' : 'NOOP';
            candidate._changes = changes;
            candidate._expected_revision = Number(prior.revision);
            candidate._before = Object.fromEntries(Object.entries(fields).map(([field, [before]]) => [field, before]));
          }
        } else if (status === 'VALIDATED') {
          const bound = await client.query(`
            SELECT 1 FROM meteo.source_bindings WHERE source_namespace=$1 AND external_id=$2
              AND binding_status='VALIDATED' LIMIT 1
          `, [inventory.source_namespace, row.external_id]);
          if (bound.rowCount) { status = 'CONFLICT'; issue = 'EXTERNAL_ID_ALREADY_BOUND'; }
          candidate._action = 'CREATE'; candidate._changes = [];
        }
        await client.query(`
          INSERT INTO meteo.import_rows(batch_id,inventory_code,candidate,row_status,station_id,issue_code)
          VALUES ($1,$2,$3::jsonb,$4,$5,$6)
        `, [batch.id, row.inventory_code, JSON.stringify(candidate), status, prior?.station_id || null, issue]);
      }
      const incomingCodes = new Set(inventory.rows.map((row) => row.inventory_code));
      for (const [code, prior] of previous) {
        if (incomingCodes.has(code)) continue;
        await client.query(`
          INSERT INTO meteo.import_rows(batch_id,inventory_code,candidate,row_status,station_id,issue_code)
          VALUES ($1,$2,$3::jsonb,'QUARANTINED',$4,'MISSING_FROM_BATCH')
        `, [batch.id, code, JSON.stringify({ ...publicCandidate(prior.candidate || {}), absent: true, _action: 'ABSENT' }), prior.station_id]);
      }
      await client.query('COMMIT');
      return { batch: await get(batch.id), idempotent: false };
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally { client.release(); }
  }

  async function apply(actorId, batchId) {
    if (!/^[1-9][0-9]{0,18}$/.test(String(batchId || ''))) return { notFound: true };
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const batchResult = await client.query('SELECT * FROM meteo.import_batches WHERE id=$1 FOR UPDATE', [batchId]);
      if (batchResult.rowCount !== 1) { await client.query('ROLLBACK'); return { notFound: true }; }
      const batch = batchResult.rows[0];
      if (batch.batch_status === 'APPLIED') { await client.query('COMMIT'); return { batch: await get(batchId), idempotent: true }; }
      if (batch.batch_status !== 'STAGED') { await client.query('ROLLBACK'); return { conflict: true }; }
      const rowsResult = await client.query(`SELECT * FROM meteo.import_rows WHERE batch_id=$1 ORDER BY id FOR UPDATE`, [batchId]);
      let created = 0; let updated = 0; let unchanged = 0;
      for (const row of rowsResult.rows.filter((item) => item.row_status === 'VALIDATED')) {
        const candidate = row.candidate;
        let stationId = row.station_id;
        let appliedRevision = candidate._expected_revision || 0;
        if (candidate._action === 'CREATE') {
          const station = await client.query(`
            INSERT INTO meteo.estacions(codi,nom,description,management_kind,lifecycle,visibility)
            VALUES ($1,$2,$3,'ADMIN','ACTIVE','PRIVATE') RETURNING id
          `, [`imp-${batch.source_namespace.toLowerCase()}-${row.inventory_code.toLowerCase()}`,
            normalizeStationName(candidate.name), normalizeDescription(candidate.description)]);
          stationId = station.rows[0].id;
          await client.query(`
            INSERT INTO meteo.source_bindings(station_id,source_namespace,external_id,binding_status,evidence_ref)
            VALUES ($1,$2,$3,'VALIDATED',$4)
          `, [stationId, batch.source_namespace, candidate.external_id, candidate.evidence_ref]);
          await client.query(`
            INSERT INTO meteo.station_locations(
              station_id,private_geometry,public_geometry,publication_mode,accuracy_m,provenance,
              reference_label,verified_at,geo_policy_version,revision,updated_at
            ) VALUES (
              $1,CASE WHEN $2::double precision IS NULL THEN NULL ELSE public.ST_SetSRID(public.ST_MakePoint($2,$3),4326) END,
              NULL,'HIDDEN',$4,'SOURCE_DOCUMENT',$5,$6::timestamptz,'ue-admin-catalog-v1',0,$6::timestamptz
            )
          `, [stationId, candidate.longitude, candidate.latitude, candidate.accuracy_m, candidate.evidence_ref, now()]);
          created += 1;
        } else if (candidate._action === 'UPDATE') {
          const station = await client.query(`
            SELECT revision FROM meteo.estacions WHERE id=$1 AND management_kind='ADMIN' AND owner_id IS NULL
              AND lifecycle<>'RETIRED' AND visibility='PRIVATE' FOR UPDATE
          `, [stationId]);
          if (station.rowCount !== 1 || Number(station.rows[0].revision) !== candidate._expected_revision) throw new ImportConflict();
          const overrides = await client.query(`
            SELECT 1 FROM meteo.manual_overrides WHERE station_id=$1 AND field_key=ANY($2::text[]) LIMIT 1
          `, [stationId, candidate._changes]);
          if (overrides.rowCount) throw new ImportConflict();
          await client.query('UPDATE meteo.estacions SET nom=$2,description=$3,revision=revision+1 WHERE id=$1',
            [stationId, normalizeStationName(candidate.name), normalizeDescription(candidate.description)]);
          if (candidate.longitude !== null) {
            await client.query(`
              UPDATE meteo.station_locations SET
                private_geometry=public.ST_SetSRID(public.ST_MakePoint($2,$3),4326),accuracy_m=$4,
                provenance='SOURCE_DOCUMENT',reference_label=$5,verified_at=$6::timestamptz,
                revision=revision+1,updated_at=$6::timestamptz WHERE station_id=$1
            `, [stationId, candidate.longitude, candidate.latitude, candidate.accuracy_m, candidate.evidence_ref, now()]);
          }
          appliedRevision = candidate._expected_revision + 1;
          updated += 1;
        } else { unchanged += 1; }
        await client.query(`
          UPDATE meteo.import_rows SET station_id=$2,row_status='APPLIED',issue_code=NULL,
            candidate=jsonb_set(candidate,'{_applied_revision}',$3::jsonb,true) WHERE id=$1
        `, [row.id, stationId, JSON.stringify(appliedRevision)]);
      }
      const instant = now();
      await client.query("UPDATE meteo.import_batches SET batch_status='APPLIED',applied_at=$2 WHERE id=$1", [batchId, instant]);
      await client.query(`
        INSERT INTO meteo.audit_events(actor_user_id,action,resource_kind,resource_id,details)
        VALUES ($1,'IMPORT_BATCH_APPLIED','IMPORT_BATCH',$2,$3::jsonb)
      `, [actorId, String(batchId), JSON.stringify({ created, updated, unchanged })]);
      await client.query('COMMIT');
      return { batch: await get(batchId), idempotent: false };
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      if (error instanceof ImportConflict || error?.code === '23505') return { conflict: true };
      throw error;
    } finally { client.release(); }
  }

  async function rollback(actorId, batchId) {
    if (!/^[1-9][0-9]{0,18}$/.test(String(batchId || ''))) return { notFound: true };
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const batchResult = await client.query("SELECT * FROM meteo.import_batches WHERE id=$1 FOR UPDATE", [batchId]);
      if (batchResult.rowCount !== 1) { await client.query('ROLLBACK'); return { notFound: true }; }
      const batch = batchResult.rows[0];
      if (batch.batch_status !== 'APPLIED') { await client.query('ROLLBACK'); return { conflict: true }; }
      const rows = await client.query("SELECT * FROM meteo.import_rows WHERE batch_id=$1 AND row_status='APPLIED' ORDER BY id FOR UPDATE", [batchId]);
      for (const row of rows.rows) {
        const candidate = row.candidate;
        const station = await client.query('SELECT revision FROM meteo.estacions WHERE id=$1 FOR UPDATE', [row.station_id]);
        if (station.rowCount !== 1 || Number(station.rows[0].revision) !== Number(candidate._applied_revision)) throw new ImportConflict();
        const changedAfter = await client.query(`
          SELECT 1 FROM meteo.manual_overrides WHERE station_id=$1 AND changed_at>$2 LIMIT 1
        `, [row.station_id, batch.applied_at]);
        if (changedAfter.rowCount) throw new ImportConflict();
        if (candidate._action === 'CREATE') {
          const dependencies = await client.query(`
            SELECT EXISTS(SELECT 1 FROM meteo.mesures WHERE estacio_id=$1)
              OR EXISTS(SELECT 1 FROM meteo.source_bindings b JOIN meteo.current_snapshots s ON s.binding_id=b.id WHERE b.station_id=$1) AS used
          `, [row.station_id]);
          if (dependencies.rows[0].used) throw new ImportConflict();
        }
      }
      for (const row of rows.rows) {
        const candidate = row.candidate;
        if (candidate._action === 'CREATE') {
          await client.query('DELETE FROM meteo.estacions WHERE id=$1', [row.station_id]);
        } else if (candidate._action === 'UPDATE') {
          const before = candidate._before || {};
          await client.query('UPDATE meteo.estacions SET nom=$2,description=$3,revision=revision+1 WHERE id=$1',
            [row.station_id, before.name, before.description]);
          if (Object.hasOwn(before, 'longitude')) {
            await client.query(`
              UPDATE meteo.station_locations SET
                private_geometry=CASE WHEN $2::double precision IS NULL THEN NULL ELSE public.ST_SetSRID(public.ST_MakePoint($2,$3),4326) END,
                accuracy_m=$4,reference_label=$5,revision=revision+1,updated_at=$6::timestamptz WHERE station_id=$1
            `, [row.station_id, before.longitude, before.latitude, before.accuracy_m, before.reference_label, now()]);
          }
        }
        await client.query("UPDATE meteo.import_rows SET row_status='QUARANTINED',issue_code='ROLLED_BACK' WHERE id=$1", [row.id]);
      }
      await client.query("UPDATE meteo.import_batches SET batch_status='REJECTED' WHERE id=$1", [batchId]);
      await client.query(`
        INSERT INTO meteo.audit_events(actor_user_id,action,resource_kind,resource_id,details)
        VALUES ($1,'IMPORT_BATCH_ROLLED_BACK','IMPORT_BATCH',$2,'{}'::jsonb)
      `, [actorId, String(batchId)]);
      await client.query('COMMIT');
      return { batch: await get(batchId) };
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      if (error instanceof ImportConflict) return { conflict: true };
      throw error;
    } finally { client.release(); }
  }

  return { apply, get, list, rollback, stage };
}

module.exports = {
  batchDto, completeExternalId, makeImportService, normalizeInventory, stable, validateCandidate,
};
