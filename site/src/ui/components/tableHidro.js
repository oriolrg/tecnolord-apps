import { fmtTime, cell } from "../format.js";

export function renderHidroTable(tbody, rows) {
  tbody.innerHTML = rows
    .map((row) => {
      const instant = row.instant;
      const codi = row.codi ?? (row.estacio_id != null ? ("#" + row.estacio_id) : "");
      const nom = row.nom ?? "";
      const tipus = row.tipus ?? "";
      const cabal = row.cabal_m3s ?? "";
      const cap = row.capacitat_pct ?? "";

      return `
        <tr>
          <td class="col-time" data-label="Hora">${fmtTime(instant)}</td>
          <td class="col-codi" data-label="Codi">${cell(codi)}</td>
          <td class="col-nom" data-label="Nom">${cell(nom)}</td>
          <td class="col-tipus" data-label="Tipus">${cell(tipus)}</td>
          <td class="col-cabal" data-label="Cabal (m³/s)">${cell(cabal)}</td>
          <td class="col-cap" data-label="Capacitat (%)">${cell(cap)}</td>
        </tr>`;
    })
    .join("");
}
