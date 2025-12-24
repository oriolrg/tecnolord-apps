// hidroScreen.js
import { clamp } from "../format.js";
import { fetchMeteo } from "../../services/meteoService.js";
import { fetchHidro } from "../../services/hidroService.js";
import { renderMeteoTable } from "../components/tableMeteo.js";
import { renderHidroTable } from "../components/tableHidro.js";

// --- VISTA: TAULA METEO + TAULA HIDRO (SEGUIDES) ---
// IMPORTANT: aquest screen NO pinta les cards (les pinta meteoScreen)
export async function refreshHidro(ui, store) {
  if (ui.err) ui.err.textContent = "";
  if (ui.errH) ui.errH.textContent = "";

  const s = store.get();

  const estacio = (s.estacio || "").trim();
  const codi = (s.codiHidro || "").trim();
  const limit = clamp(parseInt(s.limit || "48", 10), 1, 500);

  try {
    const [meteoRows, hidroRows] = await Promise.all([
      fetchMeteo({ estacio, limit }),
      fetchHidro({ codi, limit }),
    ]);

    // counts (si existeixen)
    if (ui.meteoCount) ui.meteoCount.textContent = String(meteoRows.length);
    if (ui.hidroCount) ui.hidroCount.textContent = String(hidroRows.length);

    // neteja cards (aquest screen no en pinta)
    if (ui.meteoCards) ui.meteoCards.innerHTML = "";
    if (ui.hidroCards) ui.hidroCards.innerHTML = "";

    // neteja tbodies
    if (ui.meteoTbody) ui.meteoTbody.innerHTML = "";
    if (ui.hidroTbody) ui.hidroTbody.innerHTML = "";

    // summary texts (opcional)
    if (ui.meteoSummary) {
      ui.meteoSummary.textContent = meteoRows.length
        ? (estacio ? `Meteo · Estació: ${estacio} · ${meteoRows.length} registres` : `Meteo · ${meteoRows.length} registres`)
        : "Meteo: Sense registres.";
    }
    if (ui.hidroSummary) {
      ui.hidroSummary.textContent = hidroRows.length
        ? (codi ? `Hidro · Codi: ${codi} · ${hidroRows.length} registres` : `Hidro · ${hidroRows.length} registres`)
        : "Hidro: Sense registres.";
    }

    // pinta taules seguides
    if (ui.meteoTbody && meteoRows.length) renderMeteoTable(ui.meteoTbody, meteoRows);
    if (ui.hidroTbody && hidroRows.length) renderHidroTable(ui.hidroTbody, hidroRows);
  } catch (e) {
    // un sol lloc d’error (per no duplicar)
    if (ui.err) ui.err.textContent = "Error meteo/hidro (taules): " + (e.message || e);
  }
}
