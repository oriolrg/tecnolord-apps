import { CONFIG } from "../../config.js";
import { trackEvent } from "../../analytics.js";
import { fetchPrevi } from "../../services/previService.js";
import { card } from "../components/card.js";
import { renderLineChart } from "../components/lineChart.js";
import { fmt1 } from "../format.js";

function forecastPoints(items) {
  return items
    .filter((item) => item.valid_time && item.temp_c != null)
    .map((item) => ({ t: new Date(item.valid_time), y: Number(item.temp_c) }));
}

async function refreshPrevi(ui) {
  ui.error.textContent = "";
  try {
    const payload = await fetchPrevi();
    const items = Array.isArray(payload?.items) ? payload.items : [];
    if (!items.length) {
      ui.status.textContent = "Sense dades";
      return;
    }

    const first = items[0];
    const temperature = card({
      title: "Temperatura prevista",
      value: fmt1(first.temp_c),
      unit: "°C",
      subHtml: `Humitat: <strong>${first.hum_pct ?? "—"}%</strong> · Pluja: <strong>${fmt1(first.rain_mm)} mm</strong>`,
    });
    const wind = card({
      title: "Vent previst",
      value: fmt1(first.wind_ms),
      unit: "m/s",
      subHtml: `Direcció: <strong>${first.wind_dir ?? "—"}°</strong>`,
    });
    const chartCard = card({
      title: "Evolució 48 h",
      value: "",
      subHtml: '<canvas id="chart-previ-temp" style="width:100%;height:180px"></canvas>',
      className: "card--tall",
    });

    ui.cards.replaceChildren(temperature, wind, chartCard);
    ui.status.textContent = `${payload.run?.source || "previsió"} · ${payload.run?.station || "estació"}`;
    const canvas = chartCard.querySelector("#chart-previ-temp");
    renderLineChart(canvas, forecastPoints(items), { unit: "°C" });
    trackEvent(CONFIG, "previ_refresh_ok", { points: items.length });
  } catch (error) {
    ui.error.textContent = "No s’ha pogut carregar la previsió.";
    trackEvent(CONFIG, "previ_refresh_error", { code: "LOAD_FAILED" });
  }
}

export function initPreviScreen(root) {
  root.innerHTML = `
    <div class="wrap">
      <div class="section-title">
        <h2>Previsió</h2>
        <p id="previ-status">Carregant dades sintètiques…</p>
        <span id="previ-err" class="err" role="alert" aria-live="polite"></span>
      </div>
      <div class="grid" id="previ-cards"></div>
    </div>
  `;

  const ui = {
    status: root.querySelector("#previ-status"),
    error: root.querySelector("#previ-err"),
    cards: root.querySelector("#previ-cards"),
  };
  refreshPrevi(ui);
  trackEvent(CONFIG, "screen_view", { screen: "previ" });
  return () => {};
}
