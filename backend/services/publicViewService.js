'use strict';

const { stationDto, validPublicId } = require('./stationCatalogService');

const CARD_IDS = Object.freeze(['wind', 'temperature', 'rain', 'pressure', 'humidity', 'uv']);

function normalizeCardIds(value) {
  if (!Array.isArray(value) || value.length < 1 || value.length > CARD_IDS.length) return null;
  if (new Set(value).size !== value.length) return null;
  return value.every((item) => typeof item === 'string' && CARD_IDS.includes(item)) ? [...value] : null;
}

function project(row, { admin = false } = {}) {
  const eligible = row?.public_id && row.internal_only !== true
    && row.lifecycle === 'ACTIVE' && row.visibility === 'PUBLIC'
    && (row.management_kind !== 'USER' || (row.actiu && row.account_status === 'APPROVED'
      && row.email_verified_at && row.approved_at));
  return {
    station: eligible ? stationDto(row) : null,
    card_ids: normalizeCardIds(row?.card_ids) || [...CARD_IDS],
    revision: Number(row?.config_revision || 0),
    ...(admin ? { configured_station_id: row?.configured_public_id || null, eligible: !!eligible } : {}),
  };
}

function makePublicViewService({ pool } = {}) {
  if (!pool || typeof pool.query !== 'function') throw new TypeError('Public view pool is required');

  async function get(options) {
    const result = await pool.query(`
      SELECT c.card_ids,c.revision AS config_revision,e.public_id AS configured_public_id,
        e.public_id,e.nom,e.description,e.lifecycle,e.visibility,e.revision,e.management_kind,
        u.actiu,u.account_status,u.email_verified_at,u.approved_at,
        EXISTS(SELECT 1 FROM meteo.source_bindings internal_binding
          WHERE internal_binding.station_id=e.id AND internal_binding.source_namespace='GRAFANA'
            AND internal_binding.binding_status='VALIDATED') AS internal_only
      FROM meteo.public_view_config c
      LEFT JOIN meteo.estacions e ON e.id=c.public_station_id
      LEFT JOIN auth.usuaris u ON u.id=e.owner_id
      WHERE c.id=1
    `);
    return project(result.rows[0], options);
  }

  async function update(actorId, input) {
    const cards = normalizeCardIds(input?.card_ids);
    if (!validPublicId(input?.station_id) || !Number.isSafeInteger(input?.revision)
        || input.revision < 0 || !cards) return { invalid: true };
    const client = typeof pool.connect === 'function' ? await pool.connect() : pool;
    try {
      if (client !== pool) await client.query('BEGIN');
      const config = await client.query('SELECT revision FROM meteo.public_view_config WHERE id=1 FOR UPDATE');
      if (Number(config.rows[0].revision) !== input.revision) {
        if (client !== pool) await client.query('COMMIT');
        return { conflict: true };
      }
      const station = await client.query(`
        SELECT e.id FROM meteo.estacions e LEFT JOIN auth.usuaris u ON u.id=e.owner_id
        WHERE e.public_id=$1 AND e.lifecycle='ACTIVE' AND e.visibility='PUBLIC'
          AND NOT EXISTS (
            SELECT 1 FROM meteo.source_bindings internal_binding
            WHERE internal_binding.station_id=e.id AND internal_binding.source_namespace='GRAFANA'
              AND internal_binding.binding_status='VALIDATED'
          )
          AND (e.management_kind<>'USER' OR (
            u.actiu=true AND u.account_status='APPROVED'
            AND u.email_verified_at IS NOT NULL AND u.approved_at IS NOT NULL
          )) LIMIT 1
      `, [input.station_id]);
      if (station.rowCount !== 1) {
        if (client !== pool) await client.query('COMMIT');
        return { notFound: true };
      }
      await client.query(`
        UPDATE meteo.public_view_config
        SET public_station_id=$1,card_ids=$2::jsonb,revision=revision+1,updated_at=now()
        WHERE id=1
      `, [station.rows[0].id, JSON.stringify(cards)]);
      await client.query(`
        INSERT INTO meteo.audit_events(actor_user_id,action,resource_kind,resource_id,details)
        VALUES ($1,'PUBLIC_VIEW_UPDATED','PUBLIC_VIEW','1',$2::jsonb)
      `, [actorId, JSON.stringify({ station_id: input.station_id, card_ids: cards })]);
      if (client !== pool) await client.query('COMMIT');
      return { config: await get({ admin: true }) };
    } catch (error) {
      if (client !== pool) await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      if (client !== pool) client.release();
    }
  }

  return { get, update };
}

module.exports = { CARD_IDS, makePublicViewService, normalizeCardIds, project };
