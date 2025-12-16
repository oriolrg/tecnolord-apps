import { fmtTime, cell } from "../format.js";

export function renderHidroTable(tbody, rows) {
  tbody.innerHTML = rows.map((row) => {
    const instant = row.instant;
    const codi = row.codi ?? (row.estacio_id != null ? ("#" + row.estacio_id) : "");
    const nom = row.nom ?? "";
    const tipus = row.tipus ?? "";
    const cabal = row.cabal_m3s ?? "";
    const cap = row.capacitat_pct ?? "";
    const niv = row.nivell_m ?? "";
    return `
      <tr>
        <td>${fmtTime(instant)}</td>
        <td>${cell(codi)}</td>
        <td>${cell(nom)}</td>
        <td>${cell(tipus)}</td>
        <td>${cell(cabal)}</td>
        <td>${cell(cap)}</td>
        <td>${cell(niv)}</td>
      </tr>`;
  }).join("");
}
