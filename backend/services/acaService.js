// backend/services/acaService.js

const ACA_RIVER_URL =
  'http://aplicacions.aca.gencat.cat/aetr/vishid/v2/data/public/rivergauges/river_flow_6min';
const ACA_RESERVOIR_URL =
  'http://aplicacions.aca.gencat.cat/aetr/vishid/v2/data/public/reservoir/capacity_6min';

function makeAcaService({ pool, assegurarHidro }) {
  async function pullACAAndSave() {
    const [riversRes, reservoirsRes] = await Promise.all([
      fetch(ACA_RIVER_URL),
      fetch(ACA_RESERVOIR_URL),
    ]);
    if (!riversRes.ok) throw new Error('aca rivers status ' + riversRes.status);
    if (!reservoirsRes.ok) throw new Error('aca reservoirs status ' + reservoirsRes.status);

    const rivers = await riversRes.json();
    const reservoirs = await reservoirsRes.json();

    function indexBySiteCode(data) {
      const m = new Map();
      if (!data) return m;

      if (Array.isArray(data)) {
        for (const it of data) {
          const code = it?.siteCode ?? it?.codi ?? it?.code;
          if (code) m.set(String(code).trim(), it);
        }
        return m;
      }

      if (typeof data === 'object') {
        for (const [k, v] of Object.entries(data)) {
          if (!v) continue;
          if (typeof v === 'object') {
            const code = v.siteCode ?? v.codi ?? v.code ?? k;
            m.set(String(code).trim(), v);
          }
        }
      }
      return m;
    }

    const riversByCode = indexBySiteCode(rivers);
    const reservoirsByCode = indexBySiteCode(reservoirs);

    const getPath = (obj, tokens) => {
      try {
        return tokens.reduce(
          (a, k) => (a && a[k] !== undefined && a[k] !== null) ? a[k] : undefined,
          obj
        );
      } catch { return undefined; }
    };
    const firstOf = (obj, listOfPaths) => {
      for (const p of listOfPaths) {
        const v = getPath(obj, p);
        if (v !== undefined && v !== null) return v;
      }
      return null;
    };
    const toNum = v => (v === null || v === '' || v === undefined ? null : Number(v));

    const CODE_CARD = process.env.ACA_CODI_CARDENER;
    const CODE_VALLS = process.env.ACA_CODI_VALLS;
    const CODE_LLOSA = process.env.ACA_CODI_LLOSA;

    const CODE_LLOSA_FLOW = process.env.ACA_CODI_LLOSA_CABAL || CODE_LLOSA;
    const CODE_LLOSA_CAP = process.env.ACA_CODI_LLOSA_CAPACITAT || CODE_LLOSA;

    const SITES = [
      { siteCode: CODE_CARD,  name: process.env.ACA_NOM_CARDENER || 'Cardener', tipusPreferit: 'riu',   flowKey: CODE_CARD, capKey: null },
      { siteCode: CODE_VALLS, name: process.env.ACA_NOM_VALLS    || 'Valls',    tipusPreferit: 'riu',   flowKey: CODE_VALLS, capKey: null },
      { siteCode: CODE_LLOSA, name: process.env.ACA_NOM_LLOSA    || 'La Llosa del Cavall', tipusPreferit: 'panta',
        flowKey: CODE_LLOSA_FLOW, capKey: CODE_LLOSA_CAP },
    ].filter(s => s.siteCode);

    const nowIso = new Date().toISOString();
    const results = [];

    for (const s of SITES) {
      const rObj = s.flowKey
        ? (riversByCode.get(String(s.flowKey).trim()) ?? rivers?.[s.flowKey] ?? null)
        : null;
      const zObj = s.capKey
        ? (reservoirsByCode.get(String(s.capKey).trim()) ?? reservoirs?.[s.capKey] ?? null)
        : null;

      const flowVal = toNum(firstOf(rObj, [
        ['popup','river_flow','value'],
        ['popup','flux_riu','value'],
        ['popup','cabal_riu','value'],
        ['finestra emergent','river_flow','valor'],
        ['finestra emergent','flux_riu','valor'],
        ['finestra emergent','cabal_riu','valor'],
        ['emergent','river_flow','valor'],
        ['emergent','flux_riu','valor'],
        ['emergent','cabal_riu','valor'],
        ['finestra','flux_riu','valor'],
        ['finestra','cabal_riu','valor'],
      ]));

      const capVal = toNum(firstOf(zObj, [
        ['popup','capacity','value'],
        ['popup','capacitat','valor'],
        ['finestra emergent','capacitat','valor'],
        ['emergent','capacitat','valor'],
        ['element emergent','capacitat','valor'],
      ]));

      const levelVal = toNum(firstOf(zObj, [
        ['popup','level','value'],
        ['finestra emergent','nivell','valor'],
        ['emergent','nivell','valor'],
      ]));

      const flowTs = firstOf(rObj, [
        ['popup','river_flow','time'], ['popup','flux_riu','time'], ['popup','cabal_riu','time'],
        ['finestra emergent','river_flow','hora'], ['finestra emergent','flux_riu','hora'], ['finestra emergent','cabal_riu','hora'],
        ['emergent','river_flow','hora'], ['emergent','flux_riu','hora'], ['emergent','cabal_riu','hora'],
      ]);
      const capTs = firstOf(zObj, [
        ['popup','capacity','time'], ['popup','capacitat','hora'],
        ['finestra emergent','capacitat','hora'],
        ['emergent','capacitat','hora'],
        ['element emergent','capacitat','hora'],
      ]);
      const instant = (flowTs || capTs || nowIso);

      if (flowVal === null && capVal === null && levelVal === null) {
        console.warn('[ACA] sense valors per', s.siteCode, { flowKey: s.flowKey, capKey: s.capKey });
        continue;
      }

      const tipusCalc =
        (flowVal !== null && capVal === null) ? 'riu' :
        (capVal  !== null && flowVal === null) ? 'panta' : (s.tipusPreferit || 'panta');

      const estacioId = await assegurarHidro(s.siteCode, tipusCalc, s.name);

      const sql = `
        INSERT INTO lectures_hidro (estacio_id, instant, cabal_m3s, capacitat_pct, nivell_m, extres)
        VALUES ($1,$2,$3,$4,$5,$6)
        ON CONFLICT (estacio_id, instant) DO UPDATE
        SET cabal_m3s     = COALESCE(lectures_hidro.cabal_m3s, EXCLUDED.cabal_m3s),
            capacitat_pct = COALESCE(lectures_hidro.capacitat_pct, EXCLUDED.capacitat_pct),
            nivell_m      = COALESCE(lectures_hidro.nivell_m, EXCLUDED.nivell_m),
            extres        = COALESCE(lectures_hidro.extres, EXCLUDED.extres)
        RETURNING id
      `;
      const extres = { river_raw: rObj ?? null, reservoir_raw: zObj ?? null };
      const { rows } = await pool.query(sql, [
        estacioId, new Date(instant).toISOString(),
        flowVal, capVal, levelVal,
        JSON.stringify(extres),
      ]);

      results.push({ codi: s.siteCode, id: rows[0]?.id || null, cabal_m3s: flowVal, capacitat_pct: capVal, nivell_m: levelVal, ts: instant });
    }

    return { ok: true, inserts: results };
  }

  return { pullACAAndSave };
}

module.exports = { makeAcaService };
