import { card } from "../components/card.js";
import { fmtTime, num, fmt1, clamp, norm } from "../format.js";
import { fetchHidro } from "../../services/hidroService.js";
import { renderHidroTable } from "../components/tableHidro.js";

function pickRow(rows, predicates) {
  for (const pred of predicates) {
    const found = rows.find(pred);
    if (found) return found;
  }
  return null;
}

export async function refreshHidro(ui, store) {
  if (ui.errH) ui.errH.textContent = "";

  const s = store.get();
  const limit = clamp(parseInt(s.limit || "48", 10), 1, 500);
  const codi = (s.codiHidro || "").trim();

  try {
    const rows = await fetchHidro({ codi, limit });

    if (ui.hidroCount) ui.hidroCount.textContent = String(rows.length);

    if (!rows.length) {
      if (ui.hidroSummary) ui.hidroSummary.textContent = "Sense registres.";
      if (ui.hidroCards) ui.hidroCards.innerHTML = "";
      if (ui.hidroTbody) ui.hidroTbody.innerHTML = "";
      return;
    }

    if (ui.hidroSummary) ui.hidroSummary.textContent = `${rows.length} registres`;

    const rowLlosa = pickRow(rows, [
      r => norm(r.nom).includes("llosa") || norm(r.nom).includes("cavall"),
      r => norm(r.codi).includes("llosa") || norm(r.codi).includes("cavall"),
    ]);

    const rowCardener = pickRow(rows, [
      r => norm(r.nom).includes("cardener"),
      r => norm(r.codi).includes("cardener"),
    ]);

    const rowValls = pickRow(rows, [
      r => norm(r.nom).includes("valls"),
      r => norm(r.codi).includes("valls"),
    ]);

    const instantLlosa = rowLlosa?.instant ?? null;
    const cap = num(rowLlosa?.capacitat_pct);

    let sortida = num(rowLlosa?.cabal_m3s);
    if (sortida == null) {
      const rowSortida = pickRow(rows, [
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
      const arrow = delta >= 0 ? "↑" : "↓";
      const txt = delta >= 0 ? "Entrada > sortida" : "Sortida > entrada";
      deltaHtml = `
        <span class="sep"></span>
        <span>Total entrada: <strong>${fmt1(entradaTotal)} m³/s</strong></span>
        <span>Sortida: <strong>${fmt1(sortida)} m³/s</strong></span>
        <span class="delta ${cls}">${arrow} Balanç: ${fmt1(delta)} m³/s · ${txt}</span>
      `;
    }

    if (ui.hidroCards) ui.hidroCards.innerHTML = "";

    const cCabal = card({
      title: "Cabal (balanç)",
      value: sortida == null ? "—" : fmt1(sortida),
      unit: "m³/s",
      badge: "Últim",
      subHtml: `
        ${instantLlosa ? `Hora: <strong>${fmtTime(instantLlosa)}</strong>` : ""}
        ${cabalCardener != null ? ` · Cardener: <strong>${fmt1(cabalCardener)} m³/s</strong>` : ""}
        ${cabalValls != null ? ` · Valls: <strong>${fmt1(cabalValls)} m³/s</strong>` : ""}
        ${deltaHtml}
      `,
    });
    cCabal.classList.add("card--tall");

    const cCap = card({
      title: "Capacitat",
      value: cap == null ? "—" : fmt1(cap),
      unit: "%",
      badge: "Últim",
      subHtml: `${rowLlosa?.nom ? `Estació: <strong>${rowLlosa.nom}</strong>` : ""}`,
    });

    const extras = [];
    if (cabalCardener != null) {
      extras.push(card({
        title: "Cardener (entrada)",
        value: fmt1(cabalCardener),
        unit: "m³/s",
        badge: "Riu",
        subHtml: rowCardener?.instant ? `Hora: <strong>${fmtTime(rowCardener.instant)}</strong>` : "",
      }));
    }
    if (cabalValls != null) {
      extras.push(card({
        title: "Valls (entrada)",
        value: fmt1(cabalValls),
        unit: "m³/s",
        badge: "Riu",
        subHtml: rowValls?.instant ? `Hora: <strong>${fmtTime(rowValls.instant)}</strong>` : "",
      }));
    }

    // Ordre: cabal (alta) + resta
    if (ui.hidroCards) ui.hidroCards.append(cCabal, cCap, ...extras);

    // Taula només si existeix (a la home no hi és)
    if (ui.hidroTbody) renderHidroTable(ui.hidroTbody, rows);
  } catch (e) {
    if (ui.errH) ui.errH.textContent = "Error hidro: " + (e.message || e);
  }
}
