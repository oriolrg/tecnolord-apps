import { CONFIG } from "../../config.js";
import { $ } from "../dom.js";
import { card } from "../components/card.js";
import { num, fmt1, clamp, fmtTime, norm } from "../format.js";
import { fetchHidro } from "../../services/hidroService.js";

function buildCabalsUI(root) {
  root.innerHTML = `
    <div class="wrap">
      <div class="status-row">
        <span class="pill"><span class="dot"></span><span id="hidro-last">Sense dades encara</span></span>
        <span id="hidro-err" class="err" role="alert" aria-live="polite"></span>
      </div>

      <div class="section-title">
        <h2>Cabals</h2>
        <p id="hidro-summary">—</p>
      </div>

      <div class="grid" id="hidro-cards"></div>
    </div>
  `;

  return {
    last: $("#hidro-last", root),
    err: $("#hidro-err", root),
    summary: $("#hidro-summary", root),
    cards: $("#hidro-cards", root),
  };
}

function pickRow(rows, predicates) {
  for (const pred of predicates) {
    const found = rows.find(pred);
    if (found) return found;
  }
  return null;
}

async function refreshCabals(ui, store) {
  if (ui.err) ui.err.textContent = "";

  const s = store.get();
  const codi = (s.codiHidro || "").trim();
  const limit = clamp(parseInt(s.limit || "48", 10), 1, 500);

  try {
    const hidroRows = await fetchHidro({ codi, limit });

    if (ui.cards) ui.cards.innerHTML = "";

    if (!hidroRows || !hidroRows.length) {
      if (ui.last) ui.last.textContent = "Sense registres.";
      if (ui.summary) ui.summary.textContent = codi ? `Codi: ${codi} · Sense dades` : "Sense dades";
      return;
    }

    const row0 = hidroRows[0];

    // “fa quant”
    if (ui.last) {
      const ts = row0?.timestamp || row0?.time || row0?.hora || row0?.datetime || row0?.date;
      if (ts) {
        const t = new Date(ts);
        const ageMs = Date.now() - t.getTime();
        const ageSec = Math.max(0, Math.round(ageMs / 1000));
        const ageTxt =
          ageSec < 60 ? `${ageSec} s` :
          ageSec < 3600 ? `${Math.round(ageSec / 60)} min` :
          `${Math.round(ageSec / 3600)} h`;
        if (ui.last) ui.last.textContent = `Dades actualitzades fa ${ageTxt}`;
      } else {
        if (ui.last) ui.last.textContent = "Dades disponibles";
      }
    }

    if (ui.summary) {
      ui.summary.textContent = codi
        ? `Codi: ${codi} · ${hidroRows.length} registres`
        : `${hidroRows.length} registres`;
    }

    // files “cards”
    const rowLvl = pickRow(hidroRows, [
      (r) => num(r?.nivell) != null || num(r?.level) != null,
      () => true,
    ]);

    const rowFlow = pickRow(hidroRows, [
      (r) => num(r?.cabal) != null || num(r?.flow) != null || num(r?.cabals) != null,
      () => true,
    ]);

    const tstamp = row0?.timestamp || row0?.time || row0?.hora || row0?.datetime || row0?.date;
    const tlabel = tstamp ? fmtTime(tstamp) : "—";

    const nivell = num(rowLvl?.nivell ?? rowLvl?.level);
    const cabal = num(rowFlow?.cabal ?? rowFlow?.cabals ?? rowFlow?.flow);

    const nom = norm(row0?.nom ?? row0?.name);
    const codiRow = norm(row0?.codi ?? row0?.code ?? row0?.codi_hidro);

    const items = [
      card({
        title: "Nivell",
        value: nivell == null ? "—" : fmt1(nivell),
        unit: "m",
        sub: `Hora: ${tlabel}`,
        badge: nom ? nom : "Últim",
      }),
      card({
        title: "Cabal",
        value: cabal == null ? "—" : fmt1(cabal),
        unit: "m³/s",
        sub: codiRow ? `Codi: ${codiRow}` : "—",
        badge: "Última lectura",
      }),
    ];

    if (ui.cards) {
      for (const html of items) {
        ui.cards.insertAdjacentHTML("beforeend", html);
      }
    }
  } catch (e) {
    if (ui.err) ui.err.textContent = "Error: " + (e.message || e);
  }
}

export function initCabalsScreen(root, store) {
  const ui = buildCabalsUI(root);

  let timer = null;
  if (store.get().auto) {
    timer = setInterval(() => refreshCabals(ui, store), CONFIG.autoRefreshMs);
  }

  refreshCabals(ui, store);

  return () => {
    if (timer) clearInterval(timer);
  };
}
