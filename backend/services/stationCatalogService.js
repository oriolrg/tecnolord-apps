'use strict';

const crypto = require('node:crypto');

function normalizeStationName(value) {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().replace(/\s+/g, ' ');
  return normalized.length >= 2 && normalized.length <= 100 ? normalized : null;
}

function normalizeDescription(value) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim().replace(/\s+/g, ' ');
  return normalized.length <= 500 ? normalized || null : undefined;
}

function validPublicId(value) {
  return typeof value === 'string'
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function stationDto(row, { canEdit = false } = {}) {
  return {
    id: row.public_id,
    name: row.nom,
    description: row.description,
    lifecycle: row.lifecycle,
    visibility: row.visibility,
    revision: Number(row.revision),
    can_edit: canEdit,
  };
}

function makeStationCatalogService({ pool } = {}) {
  if (!pool || typeof pool.query !== 'function') throw new TypeError('Station catalog pool is required');

  async function listOwn(userId) {
    const result = await pool.query(`
      SELECT public_id,nom,description,lifecycle,visibility,revision
      FROM meteo.estacions WHERE owner_id=$1 AND management_kind='USER'
      ORDER BY CASE lifecycle WHEN 'ACTIVE' THEN 0 WHEN 'DRAFT' THEN 1 ELSE 2 END, id
    `, [userId]);
    return result.rows.map((row) => stationDto(row, { canEdit: row.lifecycle !== 'RETIRED' }));
  }

  async function listAllForAdmin() {
    const result = await pool.query(`
      SELECT public_id,nom,description,lifecycle,visibility,revision
      FROM meteo.estacions ORDER BY id
    `);
    return result.rows.map((row) => stationDto(row));
  }

  async function listPublic() {
    const result = await pool.query(`
      SELECT e.public_id,e.nom,e.description,e.lifecycle,e.visibility,e.revision
      FROM meteo.estacions e LEFT JOIN auth.usuaris u ON u.id=e.owner_id
      WHERE e.lifecycle='ACTIVE' AND e.visibility='PUBLIC'
        AND NOT EXISTS (
          SELECT 1 FROM meteo.source_bindings internal_binding
          WHERE internal_binding.station_id=e.id AND internal_binding.source_namespace='GRAFANA'
            AND internal_binding.binding_status='VALIDATED'
        )
        AND (e.management_kind<>'USER' OR (
          u.actiu=true AND u.account_status='APPROVED'
          AND u.email_verified_at IS NOT NULL AND u.approved_at IS NOT NULL
        ))
      ORDER BY e.nom,e.id
    `);
    return result.rows.map((row) => stationDto(row));
  }

  async function create(ownerId, input) {
    const name = normalizeStationName(input?.name);
    const description = normalizeDescription(input?.description);
    if (!name || description === undefined) return null;
    const code = `usr-${crypto.randomUUID()}`;
    const result = await pool.query(`
      INSERT INTO meteo.estacions(
        codi,nom,description,creat_per_usuari,owner_id,management_kind,lifecycle,visibility
      ) VALUES ($1,$2,$3,$4,$4,'USER','DRAFT','PRIVATE')
      RETURNING public_id,nom,description,lifecycle,visibility,revision
    `, [code, name, description, ownerId]);
    return stationDto(result.rows[0], { canEdit: true });
  }

  async function update(ownerId, publicId, input) {
    if (!validPublicId(publicId)) return { notFound: true };
    if (!Number.isSafeInteger(input?.revision) || input.revision < 0) return { invalid: true };
    const name = normalizeStationName(input.name);
    const description = normalizeDescription(input.description);
    if (!name || description === undefined) return { invalid: true };
    const result = await pool.query(`
      WITH updated AS (
        UPDATE meteo.estacions SET nom=$3,description=$4,revision=revision+1
        WHERE public_id=$1 AND owner_id=$2 AND management_kind='USER'
          AND lifecycle<>'RETIRED' AND revision=$5
        RETURNING public_id,nom,description,lifecycle,visibility,revision
      ), bumped AS (
        UPDATE meteo.map_catalog_state SET revision=revision+1,updated_at=now()
        WHERE id=1 AND EXISTS(SELECT 1 FROM updated WHERE visibility='PUBLIC')
      )
      SELECT public_id,nom,description,lifecycle,visibility,revision FROM updated
    `, [publicId, ownerId, name, description, input.revision]);
    if (result.rowCount === 1) return { station: stationDto(result.rows[0], { canEdit: true }) };
    const exists = await pool.query(`
      SELECT revision FROM meteo.estacions
      WHERE public_id=$1 AND owner_id=$2 AND management_kind='USER' AND lifecycle<>'RETIRED'
    `, [publicId, ownerId]);
    return exists.rowCount === 1 ? { conflict: true } : { notFound: true };
  }

  async function retire(ownerId, publicId, revision) {
    if (!validPublicId(publicId)) return { notFound: true };
    if (!Number.isSafeInteger(revision) || revision < 0) return { invalid: true };
    const result = await pool.query(`
      WITH candidate AS (
        SELECT id,visibility AS previous_visibility FROM meteo.estacions
        WHERE public_id=$1 AND owner_id=$2 AND management_kind='USER'
          AND lifecycle<>'RETIRED' AND revision=$3 FOR UPDATE
      ), updated AS (
        UPDATE meteo.estacions e SET lifecycle='RETIRED',visibility='PRIVATE',revision=e.revision+1
        FROM candidate WHERE e.id=candidate.id
        RETURNING e.public_id,e.nom,e.description,e.lifecycle,e.visibility,e.revision,candidate.previous_visibility
      ), bumped AS (
        UPDATE meteo.map_catalog_state SET revision=revision+1,updated_at=now()
        WHERE id=1 AND EXISTS(SELECT 1 FROM updated WHERE previous_visibility='PUBLIC')
      )
      SELECT public_id,nom,description,lifecycle,visibility,revision FROM updated
    `, [publicId, ownerId, revision]);
    if (result.rowCount === 1) return { station: stationDto(result.rows[0]) };
    const exists = await pool.query(`
      SELECT revision FROM meteo.estacions
      WHERE public_id=$1 AND owner_id=$2 AND management_kind='USER' AND lifecycle<>'RETIRED'
    `, [publicId, ownerId]);
    return exists.rowCount === 1 ? { conflict: true } : { notFound: true };
  }

  async function accessible({ publicId, code, actor, dataOnly = false } = {}) {
    if ((!publicId && !code) || (publicId && !validPublicId(publicId))) return null;
    const actorId = actor?.id || null;
    const isAdmin = actor?.role === 'SUPERADMIN';
    const result = await pool.query(`
      SELECT e.id,e.codi,e.public_id,e.nom,e.description,e.lifecycle,e.visibility,e.revision,e.owner_id
      FROM meteo.estacions e LEFT JOIN auth.usuaris u ON u.id=e.owner_id
      WHERE ${publicId ? 'e.public_id=$1' : 'e.codi=$1'}
        AND ($4::boolean=false OR e.lifecycle<>'RETIRED')
        AND (
          ($2::bigint IS NOT NULL AND e.owner_id=$2)
          OR $3::boolean=true
          OR (e.lifecycle='ACTIVE' AND e.visibility='PUBLIC' AND (
            NOT EXISTS (
              SELECT 1 FROM meteo.source_bindings internal_binding
              WHERE internal_binding.station_id=e.id AND internal_binding.source_namespace='GRAFANA'
                AND internal_binding.binding_status='VALIDATED'
            ) AND (
              e.management_kind<>'USER' OR (
              u.actiu=true AND u.account_status='APPROVED'
              AND u.email_verified_at IS NOT NULL AND u.approved_at IS NOT NULL
              )
            )
          ))
        )
      LIMIT 1
    `, [publicId || code, actorId, isAdmin, dataOnly]);
    return result.rows.length === 1 ? result.rows[0] : null;
  }

  async function globalPublic() {
    const result = await pool.query(`
      SELECT e.id,e.codi,e.public_id,e.nom,e.description,e.lifecycle,e.visibility,e.revision,e.owner_id
      FROM meteo.public_view_config c JOIN meteo.estacions e ON e.id=c.public_station_id
      LEFT JOIN auth.usuaris u ON u.id=e.owner_id
      WHERE c.id=1 AND e.lifecycle='ACTIVE' AND e.visibility='PUBLIC'
        AND NOT EXISTS (
          SELECT 1 FROM meteo.source_bindings internal_binding
          WHERE internal_binding.station_id=e.id AND internal_binding.source_namespace='GRAFANA'
            AND internal_binding.binding_status='VALIDATED'
        )
        AND (e.management_kind<>'USER' OR (
          u.actiu=true AND u.account_status='APPROVED'
          AND u.email_verified_at IS NOT NULL AND u.approved_at IS NOT NULL
        ))
    `);
    return result.rows.length === 1 ? result.rows[0] : null;
  }

  return { accessible, create, globalPublic, listAllForAdmin, listOwn, listPublic, retire, update };
}

module.exports = {
  makeStationCatalogService,
  normalizeDescription,
  normalizeStationName,
  stationDto,
  validPublicId,
};
