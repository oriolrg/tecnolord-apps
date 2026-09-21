'use strict';

const { stationDto, validPublicId } = require('./stationCatalogService');

function validRevision(value) {
  return Number.isSafeInteger(value) && value >= 0;
}

function defaultStationDto(row) {
  if (!row?.public_id) return null;
  return stationDto(row, { canEdit: true });
}

function makeUserPreferenceService({ pool } = {}) {
  if (!pool || typeof pool.connect !== 'function') {
    throw new TypeError('User preference pool is required');
  }

  async function transaction(work) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await work(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }

  async function get(userId) {
    return transaction(async (client) => {
      const preference = await client.query(`
        SELECT p.default_station_id,p.revision,
          e.public_id,e.nom,e.description,e.lifecycle,e.visibility,e.revision AS station_revision,e.owner_id
        FROM auth.user_preferences p
        LEFT JOIN meteo.estacions e ON e.id=p.default_station_id
        WHERE p.user_id=$1 FOR UPDATE OF p
      `, [userId]);
      if (preference.rowCount === 0) {
        return { default_station: null, revision: 0, invalidated: false };
      }
      const row = preference.rows[0];
      const eligible = row.default_station_id != null
        && row.public_id
        && String(row.owner_id) === String(userId)
        && row.lifecycle === 'ACTIVE';
      if (row.default_station_id != null && !eligible) {
        const cleared = await client.query(`
          UPDATE auth.user_preferences
          SET default_station_id=NULL,revision=revision+1,updated_at=now()
          WHERE user_id=$1 RETURNING revision
        `, [userId]);
        return {
          default_station: null,
          revision: Number(cleared.rows[0].revision),
          invalidated: true,
        };
      }
      return {
        default_station: eligible ? defaultStationDto({ ...row, revision: row.station_revision }) : null,
        revision: Number(row.revision),
        invalidated: false,
      };
    });
  }

  async function setDefault(userId, input) {
    if (!validPublicId(input?.station_id) || !validRevision(input?.revision)) {
      return { invalid: true };
    }
    return transaction(async (client) => {
      const current = await client.query(
        'SELECT revision FROM auth.user_preferences WHERE user_id=$1 FOR UPDATE',
        [userId]
      );
      const revision = current.rowCount === 1 ? Number(current.rows[0].revision) : 0;
      if (revision !== input.revision) return { conflict: true };
      const station = await client.query(`
        SELECT id,public_id,nom,description,lifecycle,visibility,revision,owner_id
        FROM meteo.estacions
        WHERE public_id=$1 AND owner_id=$2 AND lifecycle='ACTIVE'
        LIMIT 1
      `, [input.station_id, userId]);
      if (station.rowCount !== 1) return { notFound: true };
      const updated = await client.query(`
        INSERT INTO auth.user_preferences AS current_preference(user_id,default_station_id,revision,updated_at)
        VALUES ($1,$2,1,now())
        ON CONFLICT (user_id) DO UPDATE
        SET default_station_id=EXCLUDED.default_station_id,
            revision=current_preference.revision+1,updated_at=now()
        RETURNING revision
      `, [userId, station.rows[0].id]);
      await client.query(`
        INSERT INTO meteo.audit_events(actor_user_id,action,resource_kind,resource_id,details)
        VALUES ($1,'DEFAULT_STATION_SET','USER_PREFERENCE',$2,$3::jsonb)
      `, [userId, String(userId), JSON.stringify({ station_id: input.station_id })]);
      return {
        preference: {
          default_station: defaultStationDto(station.rows[0]),
          revision: Number(updated.rows[0].revision),
          invalidated: false,
        },
      };
    });
  }

  async function clearDefault(userId, input) {
    if (!validRevision(input?.revision)) return { invalid: true };
    return transaction(async (client) => {
      const current = await client.query(
        'SELECT revision FROM auth.user_preferences WHERE user_id=$1 FOR UPDATE',
        [userId]
      );
      const revision = current.rowCount === 1 ? Number(current.rows[0].revision) : 0;
      if (revision !== input.revision) return { conflict: true };
      const updated = await client.query(`
        INSERT INTO auth.user_preferences AS current_preference(user_id,default_station_id,revision,updated_at)
        VALUES ($1,NULL,1,now())
        ON CONFLICT (user_id) DO UPDATE
        SET default_station_id=NULL,revision=current_preference.revision+1,updated_at=now()
        RETURNING revision
      `, [userId]);
      await client.query(`
        INSERT INTO meteo.audit_events(actor_user_id,action,resource_kind,resource_id,details)
        VALUES ($1,'DEFAULT_STATION_CLEARED','USER_PREFERENCE',$2,'{}'::jsonb)
      `, [userId, String(userId)]);
      return {
        preference: {
          default_station: null,
          revision: Number(updated.rows[0].revision),
          invalidated: false,
        },
      };
    });
  }

  return { clearDefault, get, setDefault };
}

module.exports = { defaultStationDto, makeUserPreferenceService, validRevision };
