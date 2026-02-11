const express = require('express');
const { getWindowFromQuery } = require('../utils/periods');

function makeHidroRouter({ pool }) {
    const router = express.Router();  
    // ──────────────────────────────────────────────────────────
    // HIDRO (tal qual el teu original)
    router.get('/api/v1/hidro/darreres', async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit || '200', 10) || 200, 5000);
    const codi = req.query.codi || null;

    const mode = (req.query.mode || '').toLowerCase(); // "latest" | "range" | ""
    const ensure = String(req.query.ensure || '0') === '1';

    const { start, end, source } = getWindowFromQuery(req);
    const hasWindow = !!(start || end || (source !== 'none'));
    const effectiveMode = mode || (hasWindow ? 'latest' : 'raw');

    try {
        // 1. MODE RAW (Sense canvis)
        if (effectiveMode === 'raw') {
        const params = [];
        let where = '';
        if (codi) { where = 'WHERE e.codi = $1'; params.push(codi); }

        const sql = `
            SELECT
            h.id, h.instant, h.cabal_m3s, h.capacitat_pct, h.nivell_m, h.extres,
            e.codi, e.nom, e.tipus, e.id AS estacio_id,
            EXTRACT(EPOCH FROM (NOW() - h.instant)) / 3600 AS age_hours,
            (NOW() - h.instant) > INTERVAL '24 hours' AS is_stale,
            false AS is_fallback,
            false AS is_outside_range
            FROM lectures_hidro h
            JOIN estacions_hidro e ON e.id = h.estacio_id
            ${where}
            ORDER BY h.instant DESC
            LIMIT ${limit}
        `;
        const { rows } = await pool.query(sql, params);
        return res.json({ ok: true, items: rows });
        }

        // Preparació de filtres
        const wParams = [];
        const wConds = [];
        if (codi) { wParams.push(codi); wConds.push(`e.codi = $${wParams.length}`); }
        if (start) { wParams.push(start.toISOString()); wConds.push(`h.instant >= $${wParams.length}`); }
        if (end) { wParams.push(end.toISOString()); wConds.push(`h.instant < $${wParams.length}`); }
        const wWhere = wConds.length ? `WHERE ${wConds.join(' AND ')}` : '';

        // 2. MODE RANGE (Amb optimització de 5MB)
        if (effectiveMode === 'range') {
        const diffDays = (start && end) ? (end - start) / (1000 * 3600 * 24) : 0;
        let sqlAllRange;

        if (diffDays > 3) {
            // OPTIMITZACIÓ: Si són més de 3 dies, fem mitjanes per hora
            // Redueix dràsticament el pes del JSON (de 5MB a ~100KB)
            sqlAllRange = `
            SELECT
                date_trunc('hour', h.instant) AS instant,
                AVG(h.cabal_m3s) AS cabal_m3s,
                AVG(h.capacitat_pct) AS capacitat_pct,
                AVG(h.nivell_m) AS nivell_m,
                e.codi, e.nom, e.tipus, e.id AS estacio_id,
                false AS is_fallback,
                false AS is_outside_range
            FROM lectures_hidro h
            JOIN estacions_hidro e ON e.id = h.estacio_id
            ${wWhere}
            GROUP BY 1, e.codi, e.nom, e.tipus, e.id
            ORDER BY 1 DESC
            LIMIT ${limit}
            `;
        } else {
            // ORIGINAL: Dades minut a minut per a períodes curts
            sqlAllRange = `
            SELECT
                h.id, h.instant, h.cabal_m3s, h.capacitat_pct, h.nivell_m, h.extres,
                e.codi, e.nom, e.tipus, e.id AS estacio_id,
                EXTRACT(EPOCH FROM (NOW() - h.instant)) / 3600 AS age_hours,
                (NOW() - h.instant) > INTERVAL '24 hours' AS is_stale,
                false AS is_fallback,
                false AS is_outside_range
            FROM lectures_hidro h
            JOIN estacions_hidro e ON e.id = h.estacio_id
            ${wWhere}
            ORDER BY h.instant DESC
            LIMIT ${limit}
            `;
        }

        const rangeRes = await pool.query(sqlAllRange, wParams);
        let items = rangeRes.rows;

        // Lògica de fallback i ensure (Sense canvis)
        if (!ensure) return res.json({ ok: true, items });

        const targets = [
            process.env.ACA_CODI_CARDENER,
            process.env.ACA_CODI_VALLS,
            process.env.ACA_CODI_LLOSA,
        ].filter(Boolean);

        let targetCodis = targets;
        if (!targetCodis.length) {
            const allStations = await pool.query(`SELECT codi FROM estacions_hidro WHERE activa = true`);
            targetCodis = allStations.rows.map(r => r.codi);
        }

        const present = new Set(items.map(r => r.codi));
        const missing = targetCodis.filter(c => !present.has(c));
        if (!missing.length) return res.json({ ok: true, items });

        const sqlLatestMissing = `
            WITH wanted AS (SELECT unnest($1::text[]) AS codi),
            latest AS (
            SELECT DISTINCT ON (e.codi)
                h.id, h.instant, h.cabal_m3s, h.capacitat_pct, h.nivell_m, h.extres,
                e.codi, e.nom, e.tipus, e.id AS estacio_id
            FROM wanted w
            JOIN estacions_hidro e ON e.codi = w.codi
            JOIN lectures_hidro h ON h.estacio_id = e.id
            ORDER BY e.codi, h.instant DESC
            )
            SELECT l.*,
            EXTRACT(EPOCH FROM (NOW() - l.instant)) / 3600 AS age_hours,
            (NOW() - l.instant) > INTERVAL '24 hours' AS is_stale,
            true AS is_fallback, true AS is_outside_range
            FROM latest l
        `;
        const missRes = await pool.query(sqlLatestMissing, [missing]);
        items = items.concat(missRes.rows);
        items.sort((a, b) => new Date(b.instant).getTime() - new Date(a.instant).getTime());

        return res.json({ ok: true, items });
        }

        // 3. MODE LATEST (Sense canvis, la lògica de fallback és necessària)
        {
        const targets = [
            process.env.ACA_CODI_CARDENER,
            process.env.ACA_CODI_VALLS,
            process.env.ACA_CODI_LLOSA,
        ].filter(Boolean);

        if (codi) {
            const sqlLatestInRange = `
            SELECT
                h.id, h.instant, h.cabal_m3s, h.capacitat_pct, h.nivell_m, h.extres,
                e.codi, e.nom, e.tipus, e.id AS estacio_id,
                EXTRACT(EPOCH FROM (NOW() - h.instant)) / 3600 AS age_hours,
                (NOW() - h.instant) > INTERVAL '24 hours' AS is_stale,
                false AS is_fallback,
                false AS is_outside_range
            FROM lectures_hidro h
            JOIN estacions_hidro e ON e.id = h.estacio_id
            ${wWhere}
            ORDER BY h.instant DESC
            LIMIT 1
            `;
            const inRange = await pool.query(sqlLatestInRange, wParams);
            if (inRange.rows.length) return res.json({ ok: true, items: inRange.rows, fallback: false });

            const sqlFallback = `
            SELECT
                h.id, h.instant, h.cabal_m3s, h.capacitat_pct, h.nivell_m, h.extres,
                e.codi, e.nom, e.tipus, e.id AS estacio_id,
                EXTRACT(EPOCH FROM (NOW() - h.instant)) / 3600 AS age_hours,
                (NOW() - h.instant) > INTERVAL '24 hours' AS is_stale,
                true AS is_fallback,
                true AS is_outside_range
            FROM lectures_hidro h
            JOIN estacions_hidro e ON e.id = h.estacio_id
            WHERE e.codi = $1
            ORDER BY h.instant DESC
            LIMIT 1
            `;
            const fb = await pool.query(sqlFallback, [codi]);
            return res.json({ ok: true, items: fb.rows, fallback: true });
        }

        let targetCodis = targets;
        if (!targetCodis.length) {
            const allStations = await pool.query(`SELECT codi FROM estacions_hidro WHERE activa = true`);
            targetCodis = allStations.rows.map(r => r.codi);
        }

        const sql = `
            WITH wanted AS (SELECT unnest($1::text[]) AS codi),
            in_range AS (
            SELECT DISTINCT ON (e.codi)
                h.id, h.instant, h.cabal_m3s, h.capacitat_pct, h.nivell_m, h.extres,
                e.codi, e.nom, e.tipus, e.id AS estacio_id,
                false AS is_fallback,
                false AS is_outside_range
            FROM wanted w
            JOIN estacions_hidro e ON e.codi = w.codi
            JOIN lectures_hidro h ON h.estacio_id = e.id
            ${start ? `WHERE h.instant >= $2` : ''} ${start && end ? 'AND' : ''} ${end ? `h.instant < $3` : ''}
            ORDER BY e.codi, h.instant DESC
            ),
            missing AS (
            SELECT w.codi FROM wanted w LEFT JOIN in_range r ON r.codi = w.codi WHERE r.codi IS NULL
            ),
            fallback AS (
            SELECT DISTINCT ON (e.codi)
                h.id, h.instant, h.cabal_m3s, h.capacitat_pct, h.nivell_m, h.extres,
                e.codi, e.nom, e.tipus, e.id AS estacio_id,
                true AS is_fallback,
                true AS is_outside_range
            FROM missing m
            JOIN estacions_hidro e ON e.codi = m.codi
            JOIN lectures_hidro h ON h.estacio_id = e.id
            ORDER BY e.codi, h.instant DESC
            )
            SELECT
            x.*,
            EXTRACT(EPOCH FROM (NOW() - x.instant)) / 3600 AS age_hours,
            (NOW() - x.instant) > INTERVAL '24 hours' AS is_stale
            FROM (
            SELECT * FROM in_range
            UNION ALL
            SELECT * FROM fallback
            ) x
            ORDER BY x.codi;
        `;

        const params = [targetCodis];
        if (start) params.push(start.toISOString());
        if (end) params.push(end.toISOString());

        const { rows } = await pool.query(sql, params);
        return res.json({ ok: true, items: rows });
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ ok:false, error:'db query error' });
    }
    });
    return router;
}
module.exports = { makeHidroRouter };