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

    if (!hidroRows.length) {
      if (ui.summary) ui.summary.textContent = "Hidro: Sense registres.";
      if (ui.last) ui.last.textContent = "Sense dades";
      return;
    }

    if (ui.summary) {
      ui.summary.textContent = codi
        ? `Hidro · Codi: ${codi} · ${hidroRows.length} registres`
        : `Hidro · ${hidroRows.length} registres`;
    }

    const rowLlosa = pickRow(hidroRows, [
      r => norm(r.nom).includes("llosa") || norm(r.nom).includes("cavall"),
      r => norm(r.codi).includes("llosa") || norm(r.codi).includes("cavall"),
    ]);

    const rowCardener = pickRow(hidroRows, [
      r => norm(r.nom).includes("cardener"),
      r => norm(r.codi).includes("cardener"),
    ]);

    const rowValls = pickRow(hidroRows, [
      r => norm(r.nom).includes("valls"),
      r => norm(r.codi).includes("valls"),
    ]);

    const instantLlosa = rowLlosa?.instant ?? null;
    const cap = num(rowLlosa?.capacitat_pct);

    let sortida = num(rowLlosa?.cabal_m3s);
    if (sortida == null) {
      const rowSortida = pickRow(hidroRows, [
        r => norm(r.nom).includes("sortida") && (norm(r.nom).includes("llosa") || norm(r.nom).includes("cavall")),
        r => norm(r.codi).includes("sortida") && (norm(r.codi).includes("llosa") || norm(r.codi).includes("cavall")),
      ]);
      sortida = num(rowSortida?.cabal_m3s);
    }

    const cabalCardener = num(rowCardener?.cabal_m3s);
    const cabalValls = num(rowValls?.cabal_m3s);
    const entradaTotal = (cabalCardener ?? 0) + (cabalValls ?? 0);
    const delta = (sortida == null ? null : (entradaTotal - sortida));

    let deltaHtml = "";
    if (sortida != null && (cabalCardener != null || cabalValls != null)) {
      const cls = delta >= 0 ? "ok" : "bad";
      const txt = delta >= 0 ? "S'omple" : "Es buida";
      deltaHtml = `
        <span class="sep"></span>
        <span>Entrada: <strong>${fmt1(entradaTotal)} m³/s</strong></span>
        <span>Sortida: <strong>${fmt1(sortida)} m³/s</strong></span>
        <span class="delta ${cls}">${txt}</span>
      `;
    }

    const cCabal = card({
      title: "Cabal (balanç)",
      value: sortida == null ? "—" : fmt1(sortida),
      unit: "m³/s",
      badge: rowLlosa?.nom ? rowLlosa.nom : "Últim",
      subHtml: `
        ${deltaHtml}
        ${instantLlosa ? `<span class="sep"></span>Hora: <strong>${fmtTime(instantLlosa)}</strong>` : ""}
      `,
    });
    cCabal.classList.add("card--tall", "card--wind");

    const cCap = card({
      title: "Capacitat",
      value: cap == null ? "—" : fmt1(cap),
      unit: "%",
      badge: rowLlosa?.nom ? rowLlosa.nom : "Últim",
      subHtml: `${rowLlosa?.nom ? `Estació: <strong>${rowLlosa.nom}</strong>` : ""}`,
    });
    cCap.classList.add("card--tall", "card--wind");

    const entradesParts = [];
    if (cabalCardener != null) {
      entradesParts.push(
        `Cardener: <strong>${fmt1(cabalCardener)} m³/s</strong>${rowCardener?.instant ? ` · <span class="muted">${fmtTime(rowCardener.instant)}</span>` : ""}`
      );
    }
    if (cabalValls != null) {
      entradesParts.push(
        `Valls: <strong>${fmt1(cabalValls)} m³/s</strong>${rowValls?.instant ? ` · <span class="muted">${fmtTime(rowValls.instant)}</span>` : ""}`
      );
    }

    const cEntrades = card({
      title: "Entrades (rius)",
      value: (cabalCardener == null && cabalValls == null) ? "—" : fmt1(entradaTotal),
      unit: "m³/s",
      badge: "Total",
      subHtml: entradesParts.length ? entradesParts.join(`<span class="sep"></span>`) : "",
    });

    // IMPORTANT: append DOM nodes (NO strings)
    if (ui.cards) ui.cards.append(cCabal, cCap, cEntrades);

    if (instantLlosa) {
      const ageSec = Math.max(0, Math.round((Date.now() - new Date(instantLlosa).getTime()) / 1000));
      const ageTxt =
        ageSec < 60 ? `${ageSec} s` :
        ageSec < 3600 ? `${Math.round(ageSec / 60)} min` :
        `${Math.round(ageSec / 3600)} h`;
      if (ui.last) ui.last.textContent = `Dades actualitzades fa ${ageTxt}`;
    } else {
      if (ui.last) ui.last.textContent = "Dades disponibles";
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
