import { CONFIG } from "../../config.js";
import { $ } from "../dom.js";
import { card } from "../components/card.js";
import { num, fmt1, clamp, fmtTime, fmt2 } from "../format.js";
import { fetchMeteo } from "../../services/meteoService.js";

function buildMeteoUI(root) {
  root.innerHTML = `
    <div class="wrap">
      <div class="status-row">
        <span class="pill"><span class="dot"></span><span id="meteo-last">Sense dades encara</span></span>
        <span id="meteo-err" class="err" role="alert" aria-live="polite"></span>
      </div>

      <div class="section-title">
        <h2>Meteo</h2>
        <p id="meteo-summary"></p>
      </div>

      <div class="period-row" id="meteo-period-row">
        <label class="field">
          <span>Període</span>
          <select id="meteo-period" class="input">
            <option value="last24h">Últimes 24h</option>
            <option value="today">Avui</option>
            <option value="yesterday">Ahir</option>
            <option value="last7d">Últims 7 dies</option>
            <option value="last30d">Últims 30 dies</option>
            <option value="custom">Personalitzat</option>
          </select>
        </label>

        <label class="field period-custom is-hidden" id="meteo-from-wrap">
          <span>De</span>
          <input id="meteo-from" class="input" type="date" />
        </label>

        <label class="field period-custom is-hidden" id="meteo-to-wrap">
          <span>Fins</span>
          <input id="meteo-to" class="input" type="date" />
        </label>

        <button id="meteo-apply" class="btn btn--small" type="button">Aplicar</button>
      </div>

      <div class="grid" id="meteo-cards"></div>
    </div>
  `;

  return {
    period: $("#meteo-period", root),
    fromWrap: $("#meteo-from-wrap", root),
    toWrap: $("#meteo-to-wrap", root),
    dateFrom: $("#meteo-from", root),
    dateTo: $("#meteo-to", root),
    apply: $("#meteo-apply", root),

    last: $("#meteo-last", root),
    err: $("#meteo-err", root),
    summary: $("#meteo-summary", root),
    cards: $("#meteo-cards", root),
  };
}

async function refreshMeteo(ui, store) {
  if (ui.err) ui.err.textContent = "";

  const s = store.get();
  const estacio = (s.estacio || "").trim();
  const limit = clamp(parseInt(s.limit || "200", 10), 1, 5000);

  const period = (s.period || "last24h").trim();
  const date_from = (s.date_from || "").trim();
  const date_to = (s.date_to || "").trim();

  try {
    const meteoRows = await fetchMeteo({ estacio, limit, period, date_from, date_to });
    if (ui.cards) ui.cards.innerHTML = "";

    if (!meteoRows.length) {
      if (ui.summary) ui.summary.textContent = "Meteo: Sense registres.";
      if (ui.last) ui.last.textContent = "Sense dades";
      return;
    }

    const r0 = meteoRows[0];
    const instant = r0.instant ?? r0.at;

    // Avís si fa >24h que no hi ha dades recents
    if (instant && ui.err) {
      const ageH = (Date.now() - new Date(instant).getTime()) / 36e5;
      if (ageH > 24) {
        ui.err.textContent = `Avís: les dades més recents són de ${fmtTime(instant)} (>24h).`;
        ui.err.classList.add("warn");
      } else {
        ui.err.textContent = "";
        ui.err.classList.remove("warn");
      }
    }

    if (ui.summary) {
      ui.summary.textContent = estacio
        ? `Meteo · Estació: ${estacio} · ${meteoRows.length} registres`
        : `Meteo · ${meteoRows.length} registres`;
    }

    const cTemp = card({
      title: "Temperatura",
      value: (num(r0.temp_c) == null) ? "—" : fmt1(num(r0.temp_c)),
      unit: "°C",
      badge: "Últim",
      subHtml: `
        ${num(r0.humitat_pct) != null ? `<span>Humitat: <strong>${Math.round(num(r0.humitat_pct))}%</strong></span>` : ""}
        ${instant ? `<span class="sep"></span>Hora: <strong>${fmtTime(instant)}</strong>` : ""}
      `,
    });
    cTemp.classList.add("card--tall");

    const cVent = card({
      title: "Vent",
      value: (num(r0.vent_ms) == null) ? "—" : fmt2(num(r0.vent_ms)),
      unit: "m/s",
      badge: "Últim",
      subHtml: `
        ${num(r0.vent_rafega_ms) != null ? `<span>Ratxa: <strong>${fmt2(num(r0.vent_rafega_ms))}</strong> m/s</span>` : ""}
        ${num(r0.vent_direccio_graus) != null ? `<span class="sep"></span>Dir: <strong>${Math.round(num(r0.vent_direccio_graus))}°</strong>` : ""}
      `,
    });
    cVent.classList.add("card--tall", "card--wind");

    const cPluja = card({
      title: "Pluja",
      value: (num(r0.pluja_diaria_mm) == null) ? "—" : fmt1(num(r0.pluja_diaria_mm)),
      unit: "mm",
      badge: "Diària",
      subHtml: `
        ${num(r0.taxa_pluja_mm_h) != null ? `<span>Taxa: <strong>${fmt1(num(r0.taxa_pluja_mm_h))}</strong> mm/h</span>` : ""}
        ${num(r0.pluja_hora_mm) != null ? `<span class="sep"></span>1h: <strong>${fmt1(num(r0.pluja_hora_mm))}</strong> mm</span>` : ""}
      `,
    });

    if (ui.cards) ui.cards.append(cTemp, cVent, cPluja);

    if (instant) {
      const ageSec = Math.max(0, Math.round((Date.now() - new Date(instant).getTime()) / 1000));
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

export function initMeteoScreen(root, store) {
  const ui = buildMeteoUI(root);

  // Inicialitza controls de període
  if (ui.period) {
    const s = store.get();
    ui.period.value = (s.period || "last24h");
    if (ui.dateFrom) ui.dateFrom.value = (s.date_from || "");
    if (ui.dateTo) ui.dateTo.value = (s.date_to || "");

    const toggleCustom = () => {
      const isCustom = ui.period.value === "custom";
      ui.fromWrap?.classList.toggle("is-hidden", !isCustom);
      ui.toWrap?.classList.toggle("is-hidden", !isCustom);
    };
    toggleCustom();

    ui.period.addEventListener("change", toggleCustom);
    ui.apply?.addEventListener("click", () => {
      const period = ui.period.value;
      const date_from = ui.dateFrom?.value || "";
      const date_to = ui.dateTo?.value || "";
      store.set({ period, date_from, date_to });
      refreshMeteo(ui, store);
    });
  }

  let timer = null;
  if (store.get().auto) {
    timer = setInterval(() => refreshMeteo(ui, store), CONFIG.autoRefreshMs);
  }

  refreshMeteo(ui, store);

  return () => {
    if (timer) clearInterval(timer);
  };
}
