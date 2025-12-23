import { card } from "../components/card.js";
import { fmtTime, num, fmt1, clamp, degToCompass, degToArrow, windAbbr16, windFromCa } from "../format.js";
import { windNameCa } from "../format.js";

import { fetchMeteo } from "../../services/meteoService.js";
import { renderMeteoTable } from "../components/tableMeteo.js";

export async function refreshMeteo(ui, store) {
  ui.err.textContent = "";

  const s = store.get();
  const estacio = (s.estacio || "").trim();
  const limit = clamp(parseInt(s.limit || "48", 10), 1, 500);

  try {
    const rows = await fetchMeteo({ estacio, limit });

    ui.meteoCount.textContent = String(rows.length);

    if (!rows.length) {
      ui.meteoSummary.textContent = "Sense registres.";
      ui.last.textContent = "Sense dades";
      ui.meteoCards.innerHTML = "";
      ui.meteoTbody.innerHTML = "";
      return;
    }

    const r0 = rows[0];
    const instant = r0.instant ?? r0.at;

    const temp_c = num(r0.temp_c ?? r0.temperature);
    const feels = num(r0.sensacio_c ?? r0.feels_like ?? r0.feels_like_c);
    const dew = num(r0.punt_rosada_c ?? r0.dew_point ?? r0.dew_point_c);

    const hum = num(r0.humitat_pct ?? r0.humidity);
    const pRel = num(r0.pressio_rel_hpa ?? r0.pressure_hpa ?? r0.pressure_rel_hpa);
    const pAbs = num(r0.pressio_abs_hpa ?? r0.pressure_abs_hpa);

    const uvi = num(r0.uvi);
    const solar = num(r0.solar_wm2);

    // Pluja
    const rainRate = num(r0.taxa_pluja_mm_h ?? r0.rain_rate_mmph);
    const rain1h = num(r0.pluja_hora_mm ?? r0.rain_hour_mm);
    const rainDay = num(r0.pluja_diaria_mm ?? r0.rain_daily_mm ?? r0.rain_mm);
    const rainWeek = num(r0.pluja_setmana_mm ?? r0.rain_week_mm);
    const rainEvent = num(r0.pluja_event_mm ?? r0.rain_event_mm);
    const rainMonth = num(r0.pluja_mes_mm ?? r0.rain_month_mm);
    const rainYear = num(r0.pluja_any_mm ?? r0.rain_year_mm);

    // Vent
    const wind = num(r0.vent_ms ?? r0.wind_speed_ms);
    const gust = num(r0.vent_rafega_ms ?? r0.wind_gust_ms);
    const wdir = num(r0.vent_direccio_graus ?? r0.wind_dir_deg);

    // direcció normalitzada (0..359)
    const deg =
      wdir == null || Number.isNaN(wdir)
        ? null
        : ((wdir % 360) + 360) % 360;

    // volem mostrar CAP ON VA el vent (invertim)
    const arrowDeg = deg == null ? null : (deg + 180) % 360;

    const degTxt = deg == null ? "—" : `${Math.round(deg)}°`;
    const abbr = deg == null ? "—" : windAbbr16(deg);
    const name = deg == null ? "" : windNameCa(deg);
    const fromTxt = deg == null ? "Vent" : `Vent del ${windFromCa(deg)} (${name})`;

    const ageSec = Math.max(0, Math.round((Date.now() - new Date(instant).getTime()) / 1000));
    const ageTxt =
      ageSec < 60 ? `${ageSec} s` :
      ageSec < 3600 ? `${Math.round(ageSec / 60)} min` :
      `${Math.round(ageSec / 3600)} h`;

    ui.last.textContent = `Dades actualitzades fa ${ageTxt}`;
    ui.meteoSummary.textContent = estacio ? `Estació: ${estacio} · ${rows.length} registres` : `${rows.length} registres`;

    // --- VENT: només mostrar línies si hi ha valor ---
    const windParts = [];
    if (wind != null) windParts.push(`Velocitat: <strong>${fmt1(wind)} m/s</strong>`);
    if (gust != null && !Number.isNaN(gust) && gust > 0 && (wind == null || Math.abs(gust - wind) > 0.05)) {
      windParts.push(`Ràfega: <strong>${fmt1(gust)} m/s</strong>`);
    }
    const windMetaHtml = windParts.length ? windParts.join(" · ") : "";

    // --- PLUJA: 3 blocs forecast-oriented, només si hi ha valor ---
    const plujaBlocks = [];

    // Pluja 1h (predictiu)
    if (rainRate != null || rain1h != null) {
      const parts = [];
      if (rainRate != null) parts.push(`Taxa: <strong>${fmt1(rainRate)} mm/h</strong>`);
      if (rain1h != null) parts.push(`1h: <strong>${fmt1(rain1h)} mm</strong>`);
      plujaBlocks.push(parts.join(" · "));
    }

    // Pluja dia
    if (rainDay != null) {
      plujaBlocks.push(`Dia: <strong>${fmt1(rainDay)} mm</strong>`);
    }

    // Context: setmana o event (si no hi ha setmana)
    const ctxVal = (rainWeek != null) ? { label: "Setmana", v: rainWeek } :
                   (rainEvent != null) ? { label: "Event", v: rainEvent } :
                   null;
    if (ctxVal) {
      plujaBlocks.push(`${ctxVal.label}: <strong>${fmt1(ctxVal.v)} mm</strong>`);
    }

    // Extra (opcional) mes/any si hi són
    const extraAcc = [];
    if (rainMonth != null) extraAcc.push(`Mes: <strong>${fmt1(rainMonth)} mm</strong>`);
    if (rainYear != null) extraAcc.push(`Any: <strong>${fmt1(rainYear)} mm</strong>`);
    if (extraAcc.length) plujaBlocks.push(extraAcc.join(" · "));

    ui.meteoCards.innerHTML = "";

    const cTemp = card({
      title: "Temperatura",
      value: fmt1(temp_c),
      unit: "°C",
      badge: "Última lectura",
      subHtml: `${feels != null ? `Sensació: <strong>${fmt1(feels)} °C</strong>` : ""}${dew != null ? ` · Rosada: <strong>${fmt1(dew)} °C</strong>` : ""}`,
    });

    const cHum = card({
      title: "Humitat",
      value: hum == null ? "—" : Math.round(hum),
      unit: "%",
      badge: "Última lectura",
      subHtml: "",
    });

    const cPress = card({
      title: "Pressió (rel.)",
      value: fmt1(pRel),
      unit: "hPa",
      badge: "Relativa",
      subHtml: `${pAbs != null ? `Abs.: <strong>${fmt1(pAbs)} hPa</strong>` : ""}`,
    });

    const cWind = card({
      title: fromTxt,
      value: "",
      unit: "",
      badge: "Direcció",
      className: "card--wind",
      subHtml: `
        <div class="wind-block">
          ${renderWindRoseSvg(arrowDeg, degTxt, abbr)}
        </div>
        ${windMetaHtml ? `<div class="wind-meta">${windMetaHtml}</div>` : ""}
      `,
    });
    cWind.classList.add("card--tall");

    // ✅ Card Pluja “intel·ligent” (només mostra el que existeix)
    const cRain = card({
      title: "Pluja",
      value: "—",
      unit: "",
      badge: "Forecast",
      subHtml: plujaBlocks.length ? plujaBlocks.join(`<span class="sep"></span>`) : "Sense dades de pluja",
    });

    const cUv = card({
      title: "UV",
      value: uvi == null ? "—" : Math.round(uvi),
      unit: "",
      badge: "Índex",
      subHtml: `${solar != null ? `Solar: <strong>${fmt1(solar)} W/m²</strong>` : ""}`,
    });

    // Ordre (mantinc el que ja tens)
    ui.meteoCards.append(cTemp, cHum, cPress, cWind, cRain, cUv);

    renderMeteoTable(ui.meteoTbody, rows);
  } catch (e) {
    ui.err.textContent = "Error meteo: " + (e.message || e);
  }
}

function renderWindRoseSvg(arrowDeg, centerTextTop, centerTextBottom) {
  return `
  <svg class="wind-rose" viewBox="0 0 100 100" aria-label="Rosa de vents" role="img">
    <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(96,165,250,.6)" stroke-width="2"/>

    <g transform="translate(50 50)">
      <polygon points="0,-42 -6,-16 0,-22 6,-16" fill="rgba(96,165,250,.85)"/>
      <polygon points="42,0 16,-6 22,0 16,6" fill="rgba(96,165,250,.85)"/>
      <polygon points="0,42 -6,16 0,22 6,16" fill="rgba(96,165,250,.85)"/>
      <polygon points="-42,0 -16,-6 -22,0 -16,6" fill="rgba(96,165,250,.85)"/>

      ${arrowDeg == null ? "" : `
        <g transform="rotate(${arrowDeg})">
          <polygon points="0,-32 -6,-46 0,-42 6,-46" fill="rgba(239,68,68,.95)"/>
        </g>
      `}

      <circle cx="0" cy="0" r="12" fill="rgba(255,255,255,.65)"></circle>
      <text x="0" y="-2" text-anchor="middle" font-size="10" font-weight="800">${centerTextTop || ""}</text>
      <text x="0" y="9" text-anchor="middle" font-size="8" font-weight="800" opacity=".8">${centerTextBottom || ""}</text>
    </g>

    <text x="50" y="12" text-anchor="middle" font-size="10" font-weight="800">N</text>
    <text x="88" y="54" text-anchor="middle" font-size="10" font-weight="800">E</text>
    <text x="50" y="96" text-anchor="middle" font-size="10" font-weight="800">S</text>
    <text x="12" y="54" text-anchor="middle" font-size="10" font-weight="800">W</text>
  </svg>`;
}
