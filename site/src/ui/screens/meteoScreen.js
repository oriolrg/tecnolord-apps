import { CONFIG } from "../../config.js";
import { $ } from "../dom.js";
import { card } from "../components/card.js";
import { num, fmt1, clamp, windAbbr16, windFromCa, fmtTime, norm } from "../format.js";
import { windNameCa } from "../format.js";
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
        <p id="meteo-summary">—</p>
      </div>
      <div class="grid" id="meteo-cards"></div>
    </div>
  `;

  return {
    last: $("#meteo-last", root),
    err: $("#meteo-err", root),
    summary: $("#meteo-summary", root),
    cards: $("#meteo-cards", root),
  };
}

function pickRow(rows, predicates) {
  for (const pred of predicates) {
    const found = rows.find(pred);
    if (found) return found;
  }
  return null;
}

async function refreshMeteo(ui, store) {
  if (ui.err) ui.err.textContent = "";

  const s = store.get();
  const estacio = (s.estacio || "").trim();
  const limit = clamp(parseInt(s.limit || "48", 10), 1, 500);

  try {
    const meteoRows = await fetchMeteo({ estacio, limit });

    if (ui.cards) ui.cards.innerHTML = "";

    if (!meteoRows || !meteoRows.length) {
      if (ui.last) ui.last.textContent = "Sense registres.";
      if (ui.summary) ui.summary.textContent = estacio ? `Estació: ${estacio} · Sense dades` : "Sense dades";
      return;
    }

    // Triar una fila "representativa" per cards (prioritzant la més recent)
    const row0 = meteoRows[0];

    // “fa quant” (basat en data/hora de la fila 0)
    if (ui.last) {
      const ts = row0?.timestamp || row0?.time || row0?.hora || row0?.datetime || row0?.date;
      if (ts) {
        const t = new Date(ts);
        const ageMs = Date.now() - t.getTime();
        const ageSec = Math.max(0, Math.round(ageMs / 1000));
        const ageTxt =
          ageSec < 60 ? `${ageSec} s` :
          ageSec < 3600 ? `${Math.round(ageSec / 60)} min` :
          `${Math.round(ageSec / 3600)} h`;
        ui.last.textContent = `Dades actualitzades fa ${ageTxt}`;
      } else {
        ui.last.textContent = "Dades disponibles";
      }
    }

    if (ui.summary) {
      ui.summary.textContent = estacio
        ? `Estació: ${estacio} · ${meteoRows.length} registres`
        : `${meteoRows.length} registres`;
    }

    // predicats “cards” (intenta trobar valors amb sentit)
    const rowWind = pickRow(meteoRows, [
      (r) => num(r?.wind_speed) != null || num(r?.vent) != null,
      (r) => num(r?.wind_gust) != null || num(r?.rafega) != null,
      () => true,
    ]);

    const rowRain = pickRow(meteoRows, [
      (r) => num(r?.rain_rate) != null || num(r?.taxa_pluja) != null,
      (r) => num(r?.rain_day) != null || num(r?.pluja_dia) != null,
      () => true,
    ]);

    const rowSolar = pickRow(meteoRows, [
      (r) => num(r?.uv) != null || num(r?.uvi) != null,
      (r) => num(r?.solar) != null,
      () => true,
    ]);

    const rowPress = pickRow(meteoRows, [
      (r) => num(r?.pressure_rel) != null || num(r?.pressio_rel) != null,
      (r) => num(r?.pressure_abs) != null || num(r?.pressio_abs) != null,
      () => true,
    ]);

    const rowHum = pickRow(meteoRows, [
      (r) => num(r?.humidity) != null || num(r?.hum) != null,
      () => true,
    ]);

    const rowTemp = pickRow(meteoRows, [
      (r) => num(r?.temp) != null || num(r?.temperature) != null,
      (r) => num(r?.feelslike) != null || num(r?.sensacio) != null,
      () => true,
    ]);

    const tstamp = row0?.timestamp || row0?.time || row0?.hora || row0?.datetime || row0?.date;
    const tlabel = tstamp ? fmtTime(tstamp) : "—";

    const temp = num(rowTemp?.temp ?? rowTemp?.temperature);
    const feel = num(rowTemp?.feelslike ?? rowTemp?.sensacio);
    const dew = num(rowTemp?.dewpoint ?? rowTemp?.rosada);
    const hum = num(rowHum?.humidity ?? rowHum?.hum);

    const pressRel = num(rowPress?.pressure_rel ?? rowPress?.pressio_rel);
    const pressAbs = num(rowPress?.pressure_abs ?? rowPress?.pressio_abs);

    const uv = num(rowSolar?.uv ?? rowSolar?.uvi);
    const solar = num(rowSolar?.solar);

    const rainRate = num(rowRain?.rain_rate ?? rowRain?.taxa_pluja);
    const rainDay = norm(rowRain?.rain_day ?? rowRain?.pluja_dia);
    const rain1h = norm(rowRain?.rain_1h ?? rowRain?.pluja_1h);
    const rainMonth = norm(rowRain?.rain_month ?? rowRain?.pluja_mes);
    const rainYear = norm(rowRain?.rain_year ?? rowRain?.pluja_any);

    const wind = num(rowWind?.wind_speed ?? rowWind?.vent);
    const gust = num(rowWind?.wind_gust ?? rowWind?.rafega);
    const dir = num(rowWind?.wind_dir ?? rowWind?.dir);

    const dirTxt = dir == null ? "—" : `${Math.round(dir)}°`;
    const windName = dir == null ? "" : windNameCa(dir);
    const windFrom = dir == null ? "" : windFromCa(dir);
    const windAbbr = dir == null ? "" : windAbbr16(dir);

    const items = [
      card({
        title: "Temperatura",
        value: temp == null ? "—" : fmt1(temp),
        unit: "°C",
        sub: `Hora: ${tlabel}`,
        badge: "Última lectura",
      }),
      card({
        title: "Sensació",
        value: feel == null ? "—" : fmt1(feel),
        unit: "°C",
        sub: dew == null ? "—" : `Rosada: ${fmt1(dew)} °C`,
        badge: "Percepció",
      }),
      card({
        title: "Humitat",
        value: hum == null ? "—" : String(Math.round(hum)),
        unit: "%",
        sub: pressRel == null ? "—" : `Pressió rel: ${Math.round(pressRel)} hPa`,
        badge: "Ambient",
      }),
      card({
        title: "Pressió",
        value: pressRel == null ? "—" : String(Math.round(pressRel)),
        unit: "hPa",
        sub: pressAbs == null ? "—" : `Abs: ${Math.round(pressAbs)} hPa`,
        badge: "Baròmetre",
      }),
      card({
        title: "UVI",
        value: uv == null ? "—" : String(Math.round(uv)),
        unit: "",
        sub: solar == null ? "—" : `Solar: ${Math.round(solar)} W/m²`,
        badge: "Radiació",
      }),
      card({
        title: "Pluja",
        value: rainRate == null ? "—" : fmt1(rainRate),
        unit: "mm/h",
        sub: rainDay == null ? "—" : `Dia: ${rainDay}`,
        badge: "Precipitació",
      }),
      card({
        title: "Vent",
        value: wind == null ? "—" : fmt1(wind),
        unit: "m/s",
        sub: gust == null ? (dir == null ? "—" : `${dirTxt} · ${windAbbr} ${windFrom} ${windName}`) : `Ràfega: ${fmt1(gust)} m/s`,
        badge: "Direcció",
      }),
      card({
        title: "Acumulats",
        value: rain1h == null ? "—" : rain1h,
        unit: "1h",
        sub: `${rainMonth == null ? "—" : `Mes: ${rainMonth}`} · ${rainYear == null ? "—" : `Any: ${rainYear}`}`,
        badge: "Pluja",
      }),
    ];

    if (ui.cards) {
      for (const html of items) {
        ui.cards.insertAdjacentHTML("beforeend", html);
      }
    }
  } catch (e) {
    if (ui.err) ui.err.textContent = "Error: " + (e.message || e);
  }
}

export function initMeteoScreen(root, store) {
  const ui = buildMeteoUI(root);

  let timer = null;
  if (store.get().auto) {
    timer = setInterval(() => refreshMeteo(ui, store), CONFIG.autoRefreshMs);
  }

  refreshMeteo(ui, store);

  return () => {
    if (timer) clearInterval(timer);
  };
}
