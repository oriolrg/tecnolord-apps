import { CONFIG } from "../../config.js";
import { $ } from "../dom.js";
import { card } from "../components/card.js";
import { num, fmt1, clamp, windAbbr16, windFromCa, fmtTime } from "../format.js";
import { windNameCa } from "../format.js";
import { fetchMeteo } from "../../services/meteoService.js";
import { renderLineChart, buildDaySeries } from "../components/lineChart.js";

function buildMeteoUI(root) {
  root.innerHTML = `
    <div class="wrap">

      <div class="section-title">
        <h2 class="meteo-h2">
          Meteo
          <span id="meteo-last" class="meteo-last">—</span>
        </h2>
        <span id="meteo-err" class="err" role="alert" aria-live="polite"></span>
        <p id="meteo-summary"></p>
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

async function refreshMeteo(ui, store) {
  if (ui.err) ui.err.textContent = "";

  const s = store.get();
  const estacio = (s.estacio || "").trim();
  const limit = clamp(parseInt(s.limit || "48", 10), 1, 500);

  try {
    const meteoRows = await fetchMeteo({ estacio, limit });
    if (ui.cards) ui.cards.innerHTML = "";

    if (!meteoRows.length) {
      if (ui.summary) ui.summary.textContent = "Meteo: Sense registres.";
      if (ui.last) ui.last.textContent = "Sense dades";
      return;
    }

    const r0 = meteoRows[0];
    const instant = r0.instant ?? r0.at;

    const temp_c = num(r0.temp_c ?? r0.temperature);
    const feels = num(r0.sensacio_c ?? r0.feels_like ?? r0.feels_like_c);
    const dew = num(r0.punt_rosada_c ?? r0.dew_point ?? r0.dew_point_c);

    const hum = num(r0.humitat_pct ?? r0.humidity);
    const pRel = num(r0.pressio_rel_hpa ?? r0.pressure_hpa ?? r0.pressure_rel_hpa);
    const pAbs = num(r0.pressio_abs_hpa ?? r0.pressure_abs_hpa);

    const uvi = num(r0.uvi);
    const solar = num(r0.solar_wm2);

    const rainRate = num(r0.taxa_pluja_mm_h ?? r0.rain_rate_mmph);
    const rainDay = num(r0.pluja_diaria_mm ?? r0.rain_daily_mm ?? r0.rain_mm);
    const rain1h = num(r0.pluja_hora_mm ?? r0.rain_hour_mm);
    const rainWeek = num(r0.pluja_setmana_mm ?? r0.rain_week_mm);
    const rainEvent = num(r0.pluja_event_mm ?? r0.rain_event_mm);
    const rainMonth = num(r0.pluja_mes_mm ?? r0.rain_month_mm);
    const rainYear = num(r0.pluja_any_mm ?? r0.rain_year_mm);

    const wind = num(r0.vent_ms ?? r0.wind_speed_ms);
    const gust = num(r0.vent_rafega_ms ?? r0.wind_gust_ms);
    const wdir = num(r0.vent_direccio_graus ?? r0.wind_dir_deg);

    const deg = wdir == null || Number.isNaN(wdir) ? null : ((wdir % 360) + 360) % 360;
    const degTxt = deg == null ? "—" : `${Math.round(deg)}°`;
    const abbr = deg == null ? "—" : windAbbr16(deg);
    const name = deg == null ? "" : windNameCa(deg);
    const fromTxt = deg == null ? "Vent" : `Vent del ${windFromCa(deg)} (${name})`;

    const ageSec = Math.max(0, Math.round((Date.now() - new Date(instant).getTime()) / 1000));
    const ageTxt =
      ageSec < 60 ? `${ageSec} s` :
      ageSec < 3600 ? `${Math.round(ageSec / 60)} min` :
      `${Math.round(ageSec / 3600)} h`;

    if (ui.last) ui.last.textContent = `Dades actualitzades fa ${ageTxt}`;
    /*if (ui.summary) {
      ui.summary.textContent = estacio
        ? `Meteo · Estació: ${estacio} · ${meteoRows.length} registres`
        : `Meteo · ${meteoRows.length} registres`;
    }*/

    // extremes del dia (tal com ho tenies)
    const d0 = new Date(instant);
    const y0 = d0.getFullYear();
    const m0 = d0.getMonth();
    const day0 = d0.getDate();

    let tMin = null;
    let tMax = null;

    for (const r of meteoRows) {
      const t = num(r.temp_c ?? r.temperature);
      if (t == null || Number.isNaN(t)) continue;

      const ts = r.instant ?? r.at;
      if (!ts) continue;

      const d = new Date(ts);
      if (d.getFullYear() !== y0 || d.getMonth() !== m0 || d.getDate() !== day0) continue;

      tMin = tMin == null ? t : Math.min(tMin, t);
      tMax = tMax == null ? t : Math.max(tMax, t);
    }

    const extremesHtml =
      (tMin == null && tMax == null)
        ? ""
        : ` · <span class="temp-max">Màx: ${tMax == null ? "—" : fmt1(tMax)} °C</span> · <span class="temp-min">Mín: ${tMin == null ? "—" : fmt1(tMin)} °C</span>`;

    const windVal = (wind == null || Number.isNaN(wind)) ? "—" : fmt1(wind);
    const gustVal = (gust == null || Number.isNaN(gust)) ? "—" : fmt1(gust);

    const windMetaHtml = `
      Velocitat: <strong>${windVal} m/s</strong>
      · Ràfega: <strong>${gustVal} m/s</strong>
    `;

    // --- Cards (ordre prioritari) ---

    // 1) Vent (compacte: NO ocupa 2 files)
    const cWind = card({
      title: fromTxt,
      value: "",
      unit: "",
      //badge: "Direcció",
      className: "card--wind",
      subHtml: `
        <div class="wind-block">
          ${renderWindRoseSvg(deg, degTxt, abbr)}
        </div>
        <div class="wind-meta">${windMetaHtml}</div>
      `,
    });
    // Important: NO fem .card--tall aquí

    // 2) Temperatura
    const cTemp = card({
      title: "Temperatura",
      value: fmt1(temp_c),
      unit: "°C",
      //badge: "Última lectura",
      subHtml:
        `${feels != null ? `Sensació: <strong>${fmt1(feels)} °C</strong>` : "Sensació: <strong>—</strong>"}`
        + `${dew != null ? ` · Rosada: <strong>${fmt1(dew)} °C</strong>` : " · Rosada: <strong>—</strong>"}`
        + `${extremesHtml}`,
    });

    // 3) Pluja (compacta + “Més” plegable)
    const rainMainValue = (rainRate == null || Number.isNaN(rainRate)) ? "—" : fmt1(rainRate);
    const rainMainUnit = "mm/h";

    const dayTxt = (rainDay == null || Number.isNaN(rainDay)) ? "—" : fmt1(rainDay);
    const h1Txt = (rain1h == null || Number.isNaN(rain1h)) ? "—" : fmt1(rain1h);

    const weekTxt = (rainWeek == null || Number.isNaN(rainWeek)) ? null : fmt1(rainWeek);
    const eventTxt = (rainEvent == null || Number.isNaN(rainEvent)) ? null : fmt1(rainEvent);
    const monthTxt = (rainMonth == null || Number.isNaN(rainMonth)) ? null : fmt1(rainMonth);
    const yearTxt = (rainYear == null || Number.isNaN(rainYear)) ? null : fmt1(rainYear);

    const moreParts = [];
    if (eventTxt) moreParts.push(`Event: <strong>${eventTxt} mm</strong>`);
    if (h1Txt !== "—") moreParts.push(`Hora: <strong>${h1Txt} mm</strong>`);
    if (weekTxt) moreParts.push(`Setmana: <strong>${weekTxt} mm</strong>`);
    if (yearTxt) moreParts.push(`Any: <strong>${yearTxt} mm</strong>`);


    const moreHtml = moreParts.length
      ? `
        <details class="tl-details" style="margin-top:8px;">
          <summary>Més detalls</summary>
          <div class="tl-details__body">
            ${moreParts.join(`<span class="dot-sep">·</span>`)}
          </div>
        </details>
      `
      : "";

    const monthInlineTxt = (rainMonth == null || Number.isNaN(rainMonth)) ? "—" : fmt1(rainMonth);

    const cRain = card({
      title: "Pluja",
      value: rainMainValue,
      unit: rainMainUnit,
      subHtml: `
        <div class="meta-row">
          <span>Dia: <strong>${dayTxt} mm</strong></span>
          <span class="dot-sep">·</span>
          <span>Mes: <strong>${monthInlineTxt} mm</strong></span>
        </div>
        ${moreHtml}
      `,
    });


    // 4) Pressió
    const cPress = card({
      title: "Pressió (rel.)",
      value: fmt1(pRel),
      unit: "hPa",
      //badge: "Relativa",
      subHtml: `${pAbs != null ? `Abs.: <strong>${fmt1(pAbs)} hPa</strong>` : ""}`,
    });

    // 5) Humitat
    const cHum = card({
      title: "Humitat",
      value: hum == null ? "—" : Math.round(hum),
      unit: "%",
      //badge: "Última lectura",
      subHtml: `<span class="muted">Evolució d’avui</span>`,
    });

    // 6) UV
    const cUv = card({
      title: "Índex UV",
      value: uvi == null ? "—" : Math.round(uvi),
      unit: "",
      //badge: "Índex",
      subHtml: `${solar != null ? `Solar: <strong>${fmt1(solar)} W/m²</strong>` : ""}`,
    });

    function attachChart(cardEl, id) {
      const sub = cardEl.querySelector(".sub");
      if (!sub) return null;

      const wrap = document.createElement("div");
      wrap.style.marginTop = "10px";

      const canvas = document.createElement("canvas");
      canvas.id = id;
      canvas.style.width = "100%";
      canvas.style.height = "140px";

      wrap.appendChild(canvas);
      sub.appendChild(wrap);
      return canvas;
    }

    // Charts a les cards que toquen (vent i UV no en tenen ara)
    const cvTemp = attachChart(cTemp, "chart-temp");
    const cvRain = attachChart(cRain, "chart-rain");
    const cvPress = attachChart(cPress, "chart-press");
    const cvHum = attachChart(cHum, "chart-hum");

    // Append final en l’ordre desitjat
    if (ui.cards) ui.cards.append(cWind, cTemp, cRain, cPress, cHum, cUv);

    // --- Charts (només dades del dia en curs) ---
    const t0 = r0.instant ?? r0.at;
    if (t0 && (cvTemp || cvPress || cvRain || cvHum)) {
      const dd0 = new Date(t0);
      const yy0 = dd0.getFullYear();
      const mm0 = dd0.getMonth();
      const dayy0 = dd0.getDate();

      const todayRows = meteoRows.filter((r) => {
        const ts = r.instant ?? r.at;
        if (!ts) return false;
        const d = new Date(ts);
        return d.getFullYear() === yy0 && d.getMonth() === mm0 && d.getDate() === dayy0;
      });

      const tempPts = buildDaySeries(todayRows, (r) => num(r.temp_c ?? r.temperature));
      const pressPts = buildDaySeries(todayRows, (r) => num(r.pressio_rel_hpa ?? r.pressure_hpa ?? r.pressure_rel_hpa));
      const rainPts = buildDaySeries(todayRows, (r) => num(r.pluja_diaria_mm ?? r.rain_daily_mm ?? r.rain_mm));
      const humPts = buildDaySeries(todayRows, (r) => num(r.humitat_pct ?? r.humidity));

      if (cvTemp) {
        renderLineChart(cvTemp, tempPts, {
          unit: "°C",
          lineColor: "#60a5fa",
          formatY: (v) => (Math.round(v * 10) / 10).toString(),
        });
      }

      if (cvPress) {
        renderLineChart(cvPress, pressPts, {
          lineColor: "#60a5fa",
          formatY: (v) => String(Math.round(v)),
        });
      }

      if (cvRain) {
        renderLineChart(cvRain, rainPts, {
          unit: "mm",
          lineColor: "#60a5fa",
          formatY: (v) => (Math.round(v * 10) / 10).toString(),
        });
      }

      if (cvHum) {
        renderLineChart(cvHum, humPts, {
          lineColor: "#60a5fa",
          formatY: (v) => String(Math.round(v)),
        });
      }
    }

  } catch (e) {
    if (ui.err) ui.err.textContent = "Error: " + (e.message || e);
  }
}

function renderWindRoseSvg(deg, centerTextTop, centerTextBottom) {
  const arrow = deg == null ? "" : `
    <g transform="rotate(${deg}) translate(0,-46) rotate(180)">
      <polygon points="0,0 -6,14 0,10 6,14" fill="rgba(239,68,68,.95)"/>
    </g>
  `;

  return `
  <svg class="wind-rose" viewBox="0 0 100 100" aria-label="Rosa de vents" role="img">
    <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(96,165,250,.6)" stroke-width="2"/>
    <g transform="translate(50 50)">
      <polygon points="0,-42 -6,-16 0,-22 6,-16" fill="rgba(96,165,250,.85)"/>
      <polygon points="42,0 16,-6 22,0 16,6" fill="rgba(96,165,250,.85)"/>
      <polygon points="0,42 -6,16 0,22 6,16" fill="rgba(96,165,250,.85)"/>
      <polygon points="-42,0 -16,-6 -22,0 -16,6" fill="rgba(96,165,250,.85)"/>
      ${arrow}
      <circle cx="0" cy="0" r="12" fill="currentColor" opacity="0.25"></circle>
      <text x="0" y="-2" text-anchor="middle" font-size="10" font-weight="800" fill="currentColor">${centerTextTop || ""}</text>
      <text x="0" y="9" text-anchor="middle" font-size="8" font-weight="800" opacity=".8" fill="currentColor">${centerTextBottom || ""}</text>
    </g>

    <text x="50" y="12" text-anchor="middle" font-size="10" font-weight="800" fill="currentColor">N</text>
    <text x="88" y="54" text-anchor="middle" font-size="10" font-weight="800" fill="currentColor">E</text>
    <text x="50" y="96" text-anchor="middle" font-size="10" font-weight="800" fill="currentColor">S</text>
    <text x="12" y="54" text-anchor="middle" font-size="10" font-weight="800" fill="currentColor">W</text>
  </svg>`;
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
