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
      if (ui.hidroCards) ui.hidroCards.innerHTML = "";
      if (ui.hidroTbody) ui.hidroTbody.innerHTML = "";
      return;
    }

    // --- Identificació estacions clau ---
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

    // Capacitat pantà (si existeix)
    const cap = num(rowLlosa?.capacitat_pct);

    // Sortida (preferentment la de la Llosa; si no, buscar "sortida")
    let sortida = num(rowLlosa?.cabal_m3s);
    let instantSortida = rowLlosa?.instant ?? null;

    if (sortida == null) {
      const rowSortida = pickRow(rows, [
        r => norm(r.nom).includes("sortida") && (norm(r.nom).includes("llosa") || norm(r.nom).includes("cavall")),
        r => norm(r.codi).includes("sortida") && (norm(r.codi).includes("llosa") || norm(r.codi).includes("cavall")),
        r => norm(r.nom).includes("sortida"),
        r => norm(r.codi).includes("sortida"),
      ]);
      sortida = num(rowSortida?.cabal_m3s);
      instantSortida = rowSortida?.instant ?? instantSortida;
    }

    // Entrades (rius)
    const cabalCardener = num(rowCardener?.cabal_m3s);
    const cabalValls = num(rowValls?.cabal_m3s);

    const entradaTotal = (cabalCardener ?? 0) + (cabalValls ?? 0);
    const delta = (sortida == null ? null : (entradaTotal - sortida));

    // --- HTML de balanç ---
    let balancHtml = "";
    if (sortida != null && (cabalCardener != null || cabalValls != null)) {
      const cls = delta >= 0 ? "ok" : "bad";
      const arrow = delta >= 0 ? "↑" : "↓";
      const txt = delta >= 0 ? "S'està omplint" : "S'està buidant";
      balancHtml = `
        <span class="sep"></span>
        <span>Entrada total: <strong>${fmt1(entradaTotal)} m³/s</strong></span>
        <span>Sortida: <strong>${fmt1(sortida)} m³/s</strong></span>
        <span class="delta ${cls}">${arrow} Balanç: ${fmt1(delta)} m³/s · ${txt}</span>
      `;
    } else {
      // si falta alguna peça, igualment mostrem el que tenim
      const parts = [];
      if (cabalCardener != null || cabalValls != null) parts.push(`Entrada total: <strong>${fmt1(entradaTotal)} m³/s</strong>`);
      if (sortida != null) parts.push(`Sortida: <strong>${fmt1(sortida)} m³/s</strong>`);
      balancHtml = parts.length ? `<span class="sep"></span><span>${parts.join(" · ")}</span>` : "";
    }

    if (ui.hidroCards) ui.hidroCards.innerHTML = "";

    // --- CARD 1 (principal): Fluxos pantà (entrada + sortida + balanç) ---
    // Valor gran = Entrada total (és el que vols prioritzar).
    const cFluxos = card({
      title: "Pantà (fluxos)",
      value: (cabalCardener == null && cabalValls == null) ? "—" : fmt1(entradaTotal),
      unit: "m³/s",
      badge: "Entrada total",
      subHtml: `
        ${instantSortida ? `Hora: <strong>${fmtTime(instantSortida)}</strong>` : ""}
        ${cabalCardener != null ? ` · Cardener: <strong>${fmt1(cabalCardener)} m³/s</strong>` : ""}
        ${cabalValls != null ? ` · Valls: <strong>${fmt1(cabalValls)} m³/s</strong>` : ""}
        ${balancHtml}
      `,
    });
    cFluxos.classList.add("card--tall");

    // --- CARD 2: Capacitat ---
    const cCap = card({
      title: "Capacitat",
      value: cap == null ? "—" : fmt1(cap),
      unit: "%",
      badge: "Últim",
      subHtml: `${rowLlosa?.nom ? `Estació: <strong>${rowLlosa.nom}</strong>` : ""}`,
    });

    // --- Cards “detall” (opcionals): rius individuals, al final ---
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

    // ✅ Ordre nou (prioritat):
    // 1) Fluxos (entrada+sortida+balanç)
    // 2) Capacitat
    // 3) Detall rius
    if (ui.hidroCards) ui.hidroCards.append(cFluxos, cCap, ...extras);

    // Taula (si existeix a la pantalla actual)
    if (ui.hidroTbody) renderHidroTable(ui.hidroTbody, rows);
  } catch (e) {
    if (ui.errH) ui.errH.textContent = "Error hidro: " + (e.message || e);
  }
}
