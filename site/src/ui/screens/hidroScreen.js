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
  // ✅ si has amagat/eliminat el panell, errH pot no existir
  if (ui.errH) ui.errH.textContent = "";

  const s = store.get();
  const codi = (s.codiHidro || "").trim();
  const limit = clamp(parseInt(s.limit || "48", 10), 1, 500);

  const qs = { limit };
  if (codi) qs.codi = codi;

  try {
    const rows = await fetchHidro(qs);

    if (ui.hidroCount) ui.hidroCount.textContent = String(rows.length);

    if (!rows.length) {
      if (ui.hidroSummary) ui.hidroSummary.textContent = "Sense registres.";
      if (ui.hidroCards) ui.hidroCards.innerHTML = "";
      if (ui.hidroTbody) ui.hidroTbody.innerHTML = "";
      return;
    }

    if (ui.hidroSummary) {
      ui.hidroSummary.textContent = codi ? `Codi: ${codi} · ${rows.length} registres` : `${rows.length} registres`;
    }

    // Identificació de registres clau
    const rowLlosa = pickRow(rows, [
      (r) => norm(r.nom).includes("llosa") || norm(r.nom).includes("cavall"),
      (r) => norm(r.codi).includes("llosa") || norm(r.codi).includes("cavall"),
    ]);

    const rowCardener = pickRow(rows, [
      (r) => norm(r.nom).includes("cardener"),
      (r) => norm(r.codi).includes("cardener"),
    ]);

    const rowValls = pickRow(rows, [
      (r) => norm(r.nom).includes("valls"),
      (r) => norm(r.codi).includes("valls"),
    ]);

    // Valors
    const instantLlosa = rowLlosa?.instant ?? null;
    const cap = num(rowLlosa?.capacitat_pct);

    let sortida = num(rowLlosa?.cabal_m3s);

    if (sortida == null) {
      const rowSortida = pickRow(rows, [
        (r) => norm(r.nom).includes("sortida") && (norm(r.nom).includes("llosa") || norm(r.nom).includes("cavall")),
        (r) => norm(r.codi).includes("sortida") && (norm(r.codi).includes("llosa") || norm(r.codi).includes("cavall")),
      ]);
      sortida = num(rowSortida?.cabal_m3s);
    }

    const cabalCardener = num(rowCardener?.cabal_m3s);
    const cabalValls = num(rowValls?.cabal_m3s);

    const entradaTotal = (cabalCardener ?? 0) + (cabalValls ?? 0);
    const delta = sortida == null ? null : (entradaTotal - sortida);

    // % d’ompliment per al fons (mateix % a totes les cards d’hidro)
    const fill = cap == null || Number.isNaN(cap) ? 0 : Math.max(0, Math.min(100, cap));
    const hydroFillClass = "card-fill card-fill-hydro";
    const hydroFillStyle = `--fill:${fill}`;

    let deltaHtml = "";
    if (sortida != null && (cabalCardener != null || cabalValls != null)) {
      const cls = delta >= 0 ? "ok" : "bad";
      const arrow = delta >= 0 ? "↑" : "↓";
      const txt = delta >= 0 ? "Omplint" : "Sortida > entrada";
      deltaHtml = `
        <span class="sep"></span>
        <span>Total entrada: <strong>${fmt1(entradaTotal)} m³/s</strong></span>
        <span>Sortida: <strong>${fmt1(sortida)} m³/s</strong></span>
        <span class="delta ${cls}">${arrow} Balanç: ${fmt1(delta)} m³/s · ${txt}</span>
      `;
    } else {
      const inParts = [];
      if (cabalCardener != null) inParts.push(`Cardener: <strong>${fmt1(cabalCardener)} m³/s</strong>`);
      if (cabalValls != null) inParts.push(`Valls: <strong>${fmt1(cabalValls)} m³/s</strong>`);
      if (inParts.length) deltaHtml = `<span class="sep"></span>${inParts.join(" · ")}`;
    }

    if (ui.hidroCards) {
      ui.hidroCards.innerHTML = "";

      ui.hidroCards.append(
        card({
          title: "Cabal (balanç)",
          value: sortida == null ? "—" : fmt1(sortida),
          unit: "m³/s",
          badge: "Última lectura",
          className: hydroFillClass,
          style: hydroFillStyle,
          subHtml: `
            ${instantLlosa ? `Hora: <strong>${fmtTime(instantLlosa)}</strong>` : ""}
            ${cabalCardener != null ? ` · Cardener: <strong>${fmt1(cabalCardener)} m³/s</strong>` : ""}
            ${cabalValls != null ? ` · Valls: <strong>${fmt1(cabalValls)} m³/s</strong>` : ""}
            ${deltaHtml}
          `,
        }),

        card({
          title: "Capacitat",
          value: cap == null ? "—" : fmt1(cap),
          unit: "%",
          badge: "Última lectura",
          className: hydroFillClass,
          style: hydroFillStyle,
          subHtml: `${rowLlosa?.nom ? `Estació: <strong>${rowLlosa.nom}</strong>` : ""}`,
        })
      );

      if (cabalCardener != null) {
        ui.hidroCards.append(
          card({
            title: "Cardener (entrada)",
            value: fmt1(cabalCardener),
            unit: "m³/s",
            badge: "Riu",
            className: hydroFillClass,
            style: hydroFillStyle,
            subHtml: rowCardener?.instant ? `Hora: <strong>${fmtTime(rowCardener.instant)}</strong>` : "",
          })
        );
      }

      if (cabalValls != null) {
        ui.hidroCards.append(
          card({
            title: "Valls (entrada)",
            value: fmt1(cabalValls),
            unit: "m³/s",
            badge: "Riu",
            className: hydroFillClass,
            style: hydroFillStyle,
            subHtml: rowValls?.instant ? `Hora: <strong>${fmtTime(rowValls.instant)}</strong>` : "",
          })
        );
      }
    }

    if (ui.hidroTbody) renderHidroTable(ui.hidroTbody, rows);
  } catch (e) {
    if (ui.errH) ui.errH.textContent = "Error hidro: " + (e.message || e);
  }
}
