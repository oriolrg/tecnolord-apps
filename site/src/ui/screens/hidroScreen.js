import { CONFIG } from "./config.js";
import { createCard } from "./card.js";
import { renderHidroTable } from "./tableHidro.js";
import { fetchHidro } from "./services/hidroService.js";
import { fmtTime, fmt1 } from "./utils/format.js";

function pickRow(rows, code) {
  return rows?.find((r) => String(r?.codi) === String(code)) || null;
}

export async function refreshHidro(ui, store) {
  try {
    ui.errH.textContent = "";
    const rows = await fetchHidro(store.hidroCode, CONFIG.HIDRO_LIMIT);

    const last = rows?.[0];
    const lastTime = last?.hora ? fmtTime(last.hora) : "—";

    const rowSortida = pickRow(rows, store.hidroCode);
    const rowCardener = pickRow(rows, CONFIG.HIDRO_CARDENER);
    const rowValls = pickRow(rows, CONFIG.HIDRO_VALLS);
    const rowLlosa = pickRow(rows, CONFIG.HIDRO_LLOSA);

    const sortida = rowSortida?.cabal != null ? rowSortida.cabal : null;
    const inCardener = rowCardener?.cabal != null ? rowCardener.cabal : null;
    const inValls = rowValls?.cabal != null ? rowValls.cabal : null;

    const totalEntrada =
      (inCardener ?? 0) + (inValls ?? 0);

    let delta = null;
    if (sortida != null) delta = totalEntrada - sortida;

    let deltaHtml = "";
    if (delta != null) {
      const sign = delta >= 0 ? "+" : "";
      deltaHtml = `<br/><span class="muted">Balanç:</span> <strong>${sign}${fmt1(delta)} m³/s</strong>`;
    }

    const cards = [];

    cards.push(
      createCard({
        title: "Cabal (balanç)",
        value: sortida == null ? "—" : `${fmt1(sortida)} m³/s`,
        sub: lastTime === "—" ? "" : "",
        subHtml: `
          ${rowLlosa && rowLlosa["capacitat_pct"] != null ? `Capacitat: <strong>${fmt1(rowLlosa["capacitat_pct"])}%</strong>` : ""}
          ${rowLlosa && rowLlosa["nom"] ? `<br/>Estació: <strong>${rowLlosa["nom"]}</strong>` : ""}
          ${deltaHtml}
          <br/>Total entrada: <strong>${fmt1(totalEntrada)} m³/s</strong>
          <br/>Sortida: <strong>${sortida == null ? "—" : fmt1(sortida)} m³/s</strong>
        `,
        icon: "water"
      })
    );

    cards.push(
      createCard({
        title: "Cardener (entrada)",
        value: inCardener == null ? "—" : `${fmt1(inCardener)} m³/s`,
        sub: rowCardener?.nom ? rowCardener.nom : "",
        icon: "river"
      })
    );

    cards.push(
      createCard({
        title: "Valls (entrada)",
        value: inValls == null ? "—" : `${fmt1(inValls)} m³/s`,
        sub: rowValls?.nom ? rowValls.nom : "",
        icon: "river"
      })
    );

    ui.hidroCards.innerHTML = cards.join("");

    if (ui.tblHidro) renderHidroTable(ui.tblHidro, rows);
  } catch (e) {
    ui.errH.textContent = e?.message || String(e);
    ui.hidroCards.innerHTML = "";
    if (ui.tblHidro) ui.tblHidro.innerHTML = "";
  }
}
