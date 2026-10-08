import { CONFIG } from "../../config.js";
import { trackEvent } from "../../analytics.js";
import { $ } from "../dom.js";
import { card } from "../components/card.js";
import { num, fmt1, clamp, windAbbr16, windFromCa, fmtTime } from "../format.js";
import { windNameCa } from "../format.js";
import {
  clearDefaultStation,
  fetchMeteoPayload,
  fetchEstimationCurrent,
  fetchMeteoSession,
  fetchPublicView,
  fetchStationCatalog,
  fetchStationCurrent,
  fetchStationPreference,
  setDefaultStation,
} from "../../services/meteoService.js";
import { renderLineChart, buildDaySeries } from "../components/lineChart.js";
import { createStationMapCore, loadAuthorizedStationMap } from "../components/stationMapCore.js";

function buildMeteoUI(root) {
  const stationMap = ['local', 'production'].includes(CONFIG.environment) ? `
      <section id="meteo-station-map-panel" class="meteo-station-map-panel" aria-labelledby="meteo-station-map-title">
        <div class="meteo-station-map-heading"><div><p>VISTA D'ESTACIONS</p><h3 id="meteo-station-map-title">Mapa d'estacions accessibles</h3></div></div>
        <div id="meteo-station-map" class="meteo-station-map" role="region" aria-label="Mapa interactiu d'estacions"></div>
        <p id="meteo-station-map-status" class="meteo-station-map-status" role="status">Carregant mapa…</p>
      </section>` : '';
  const externalResources = CONFIG.externalLinksEnabled ? `
      <div id="meteo-support" style="margin-top: 40px; margin-bottom: 20px; padding: 0 10px;">
        <div style="background: white; border-radius: 15px; padding: 20px; border: 1px solid #edf2f7; text-align: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <h4 style="font-size: 0.75rem; color: #a0aec0; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 800;">
            <i class="fas fa-satellite-dish"></i> Equipament
          </h4>
          <p style="font-size: 0.85rem; color: #4a5568; line-height: 1.5; margin-bottom: 15px;">
            Vols tenir la teva pròpia estació meteorològica a casa?
            Comprant des d'aquí ens <strong>ajudes a mantenir tecnolord.cat</strong> i les dades lliures.
          </p>
          <a data-umami-event="Click Amazon - Meteo" href="https://amzn.to/4kJcsCt" target="_blank" rel="noopener"
             style="display: inline-block; background: #3182ce; color: white; padding: 12px 20px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 0.9rem;">
            <i class="fab fa-amazon"></i> Veure estació a Amazon
          </a>
          <p style="font-size: 0.7rem; color: #cbd5e0; margin-top: 12px; font-style: italic;">
            <i class="fas fa-heart" style="color: #e53e3e;"></i> Gràcies pel teu suport
          </p>
        </div>
      </div>
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px dashed #cbd5e0; text-align: center;">
        <p style="font-size: 0.8rem; color: #718096; margin-bottom: 10px;">Explora altres serveis Tecnolord:</p>
        <div style="display: flex; justify-content: center; gap: 15px;">
          <a href="https://tecnolord.cat/meteo" data-umami-event="Anem a Meteo"
             style="text-decoration: none; font-size: 0.75rem; color: #3182ce; font-weight: bold;">
            <img src="https://tecnolord.cat/meteo/assets/icons/favicon-96x96.png" style="width: 20px; height: 20px; border-radius: 4px;" alt="Anar a">
            METEO Temps Real
          </a>
          <a href="https://tecnolord.cat/pap/" data-umami-event="Anem a PaP"
             style="text-decoration: none; font-size: 0.75rem; color: #48bb78; font-weight: bold;">
            <img src="https://tecnolord.cat/pap/icon-512.png" style="width: 20px; height: 20px; border-radius: 4px;" alt="Anar a">
            PaP SANT LLORENÇ
          </a>
          <a href="https://tecnolord.cat/orientatrack" data-umami-event="Anem a Orientatrack"
             style="text-decoration: none; font-size: 0.75rem; color: #ed8936; font-weight: bold;">
            <img src="https://tecnolord.cat/orientatrack/icons/icon-512x512.png" style="width: 20px; height: 20px; border-radius: 4px;" alt="Anar a">
            ORIENTATRACK (v. Beta)
          </a>
        </div>
      </div>` : "";

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

      <div class="meteo-station-picker">
        <label for="meteo-station">Estació</label>
        <select id="meteo-station" aria-describedby="meteo-station-help">
          <option value="">Estació pública principal</option>
        </select>
        <div class="meteo-station-actions">
          <button id="meteo-default-set" type="button" hidden>Estableix com a predeterminada</button>
          <button id="meteo-default-clear" type="button" class="secondary" hidden>Utilitza la vista pública per defecte</button>
        </div>
        <span id="meteo-station-help">La selecció del selector o de l’URL és temporal.</span>
        <span id="meteo-preference-status" class="meteo-preference-status" role="status" aria-live="polite"></span>
        <button id="meteo-back-global" type="button" class="secondary meteo-back-global" hidden>Torna a la vista pública</button>
      </div>

      ${stationMap}
      <div class="grid" id="meteo-cards"></div>

      ${externalResources}
    </div>
  `;

  return {
    last: $("#meteo-last", root),
    err: $("#meteo-err", root),
    summary: $("#meteo-summary", root),
    cards: $("#meteo-cards", root),
    station: $("#meteo-station", root),
    setDefault: $("#meteo-default-set", root),
    clearDefault: $("#meteo-default-clear", root),
    preferenceStatus: $("#meteo-preference-status", root),
    backGlobal: $("#meteo-back-global", root),
    map: $("#meteo-station-map", root),
    mapStatus: $("#meteo-station-map-status", root),
  };
}

export function selectStation({ stationId, store, stationControl, map, updatePreferenceControls, refresh }) {
  store.set({ stationId: stationId || "" });
  const url = new URL(location.href);
  if (stationId) url.searchParams.set("station_id", stationId);
  else url.searchParams.delete("station_id");
  history.replaceState(null, "", url);
  if (stationControl) stationControl.value = stationId || "";
  map?.setSelectedStation(stationId || "");
  updatePreferenceControls?.();
  return refresh?.();
}

export async function refreshMeteo(ui, store, publicView, { signal, isCurrent = () => true } = {}) {
  if (ui.err) ui.err.textContent = "";
  if (ui.backGlobal) ui.backGlobal.hidden = true;
  if (ui.cards) ui.cards.replaceChildren();
  if (ui.summary) ui.summary.textContent = "";
  if (ui.last) ui.last.textContent = "Carregant…";

  const s = store.get();
  const estacio = (s.estacio || "").trim();
  const selectedStationId = (s.stationId || "").trim();
  const stationId = selectedStationId || publicView?.station?.id || "";
  const estimationId = selectedStationId.startsWith("estimation:") ? selectedStationId.slice(11) : "";
  const limit = clamp(parseInt(s.limit || "48", 10), 1, 500);

  try {
    const stationPayload = estimationId
      ? await fetchEstimationCurrent(estimationId, { signal })
      : stationId ? await fetchStationCurrent(stationId, limit, { signal }) : null;
    const globalPayload = stationId ? null : await fetchMeteoPayload({ estacio, limit, signal });
    if (!isCurrent() || signal?.aborted) return;
    const meteoRows = stationPayload?.items || globalPayload?.items || [];
    const freshness = stationPayload?.source?.freshness;
    const hideCurrentValues = freshness === "OBSOLETE" || freshness === "UNKNOWN";
    const chartRows = [];
    const chartInstants = new Set();
    const chartCandidates = stationPayload
      ? [...(hideCurrentValues ? [] : meteoRows), ...(stationPayload.historyItems || [])]
      : meteoRows;
    for (const row of chartCandidates) {
      const rowInstant = row.instant ?? row.at;
      if (!rowInstant || chartInstants.has(rowInstant)) continue;
      chartInstants.add(rowInstant);
      chartRows.push(row);
    }

    // Tracking: refresh OK (sense dades)
    trackEvent(CONFIG, "meteo_refresh_ok", { limit, has_station: !!(stationId || estacio) });

    const isEstimation = !!stationPayload?.estimation;
    const realObservations = CONFIG.environment === 'local' && !CONFIG.syntheticData
      ? 'Observacions reals de MeteoLord · tecnolord.cat'
      : '';
    if (stationPayload?.station && ui.summary) {
      ui.summary.textContent = realObservations
        ? `${stationPayload.station.name} · ${realObservations}`
        : stationPayload.station.name;
    }
    if (isEstimation && ui.summary) {
      const freshness = stationPayload.source?.freshness;
      const freshnessLabel = freshness === "STALE" ? " · dades antigues"
        : freshness === "OBSOLETE" ? " · dades obsoletes"
          : freshness === "UNKNOWN" || freshness === "UNAVAILABLE" ? " · frescor desconeguda" : "";
      ui.summary.textContent = `Estimació · ${stationPayload.estimation.name} · referència: ${stationPayload.estimation.reference.label} · Open-Meteo${freshnessLabel}`;
    }
    if ((stationPayload?.source?.error || stationPayload?.source?.status === "ERROR") && ui.err) {
      ui.err.textContent = meteoRows.length
        ? "La font no respon; es mostra l’última lectura disponible."
        : "La font no respon i ara mateix no hi ha cap lectura disponible.";
    }

    if (!meteoRows.length) {
      if (ui.summary && !isEstimation && !stationPayload?.station) {
        ui.summary.textContent = globalPayload?.status === "no_public_station"
          ? "Cap estació pública configurada."
          : "Meteo: Sense registres.";
      }
      if (ui.last) {
        ui.last.textContent = freshness === "OBSOLETE" ? "Dades obsoletes · Sense lectura actual"
          : freshness === "UNKNOWN" ? "Frescor desconeguda · Sense dades"
            : freshness === "STALE" ? "Dades antigues · Sense lectura actual"
              : "Sense dades";
      }
      return;
    }

    const r0 = meteoRows[0];
    const instant = r0.instant ?? r0.at;
    const currentNumber = (value) => hideCurrentValues ? null : num(value);

    const temp_c = currentNumber(r0.temp_c ?? r0.temperature);
    const feels = currentNumber(r0.sensacio_c ?? r0.feels_like ?? r0.feels_like_c);
    const dew = currentNumber(r0.punt_rosada_c ?? r0.dew_point ?? r0.dew_point_c);

    const hum = currentNumber(r0.humitat_pct ?? r0.humidity);
    const pRel = currentNumber(r0.pressio_rel_hpa ?? r0.pressure_hpa ?? r0.pressure_rel_hpa);
    const pAbs = currentNumber(r0.pressio_abs_hpa ?? r0.pressure_abs_hpa);

    const uvi = currentNumber(r0.uvi);
    const solar = currentNumber(r0.solar_wm2);

    const rainRate = currentNumber(r0.taxa_pluja_mm_h ?? r0.rain_rate_mmph);
    const rainDay = currentNumber(r0.pluja_diaria_mm ?? r0.rain_daily_mm ?? r0.rain_mm);
    const rain1h = currentNumber(r0.pluja_hora_mm ?? r0.rain_hour_mm);
    const rainWeek = currentNumber(r0.pluja_setmana_mm ?? r0.rain_week_mm);
    const rainEvent = currentNumber(r0.pluja_event_mm ?? r0.rain_event_mm);
    const rainMonth = currentNumber(r0.pluja_mes_mm ?? r0.rain_month_mm);
    const rainYear = currentNumber(r0.pluja_any_mm ?? r0.rain_year_mm);
    const hasRain24h = Object.prototype.hasOwnProperty.call(r0, "rain_24h");
    const rain24h = currentNumber(r0.rain_24h);
    const hasTemperature24h = Object.prototype.hasOwnProperty.call(r0, "temp_min_24h_c")
      || Object.prototype.hasOwnProperty.call(r0, "temp_max_24h_c");
    const tempMin24h = currentNumber(r0.temp_min_24h_c);
    const tempMax24h = currentNumber(r0.temp_max_24h_c);

    const wind = currentNumber(r0.vent_ms ?? r0.wind_speed_ms);
    const gust = currentNumber(r0.vent_rafega_ms ?? r0.wind_gust_ms);
    const wdir = currentNumber(r0.vent_direccio_graus ?? r0.wind_dir_deg);

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

    const freshnessLabel = freshness === "STALE" ? " · dades antigues"
      : freshness === "OBSOLETE" ? " · dades obsoletes"
        : freshness === "UNKNOWN" ? " · frescor desconeguda" : "";
    if (ui.last) ui.last.textContent = `Dades actualitzades fa ${ageTxt}${freshnessLabel}`;
    if (ui.summary && !stationPayload?.station && realObservations) {
      ui.summary.textContent = realObservations;
    }
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

    for (const r of chartRows) {
      const t = num(r.temp_c ?? r.temperature);
      if (t == null || Number.isNaN(t)) continue;

      const ts = r.instant ?? r.at;
      if (!ts) continue;

      const d = new Date(ts);
      if (d.getFullYear() !== y0 || d.getMonth() !== m0 || d.getDate() !== day0) continue;

      tMin = tMin == null ? t : Math.min(tMin, t);
      tMax = tMax == null ? t : Math.max(tMax, t);
    }

    const extremesHtml = hasTemperature24h
      ? ` · <span class="temp-max">Màx. 24 h: ${tempMax24h == null ? "—" : fmt1(tempMax24h)} °C</span> · <span class="temp-min">Mín. 24 h: ${tempMin24h == null ? "—" : fmt1(tempMin24h)} °C</span>`
      : (tMin == null && tMax == null)
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
      title: isEstimation ? "Temperatura · Estimació" : "Temperatura",
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

    const cRain = hasRain24h
      ? card({
        title: "Pluja acumulada 24 h",
        value: rain24h == null ? "—" : fmt1(rain24h),
        unit: "",
        subHtml: "",
      })
      : card({
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
    const cPress = pRel == null && pAbs == null ? null : card({
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
      if (!cardEl) return null;
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

    function appendCards() {
      if (!ui.cards) return;
      const allCards = { wind: cWind, temperature: cTemp, rain: cRain, pressure: cPress, humidity: cHum, uv: cUv };
      const cardIds = selectedStationId
        ? Object.keys(allCards)
        : (publicView?.card_ids || Object.keys(allCards));
      ui.cards.append(...cardIds.map((id) => allCards[id]).filter(Boolean));
    }

    // --- Charts (només dades del dia en curs) ---
    const t0 = r0.instant ?? r0.at;
    if (t0) {
      const dd0 = new Date(t0);
      const yy0 = dd0.getFullYear();
      const mm0 = dd0.getMonth();
      const dayy0 = dd0.getDate();

      const todayRows = chartRows.filter((r) => {
        const ts = r.instant ?? r.at;
        if (!ts) return false;
        const d = new Date(ts);
        return d.getFullYear() === yy0 && d.getMonth() === mm0 && d.getDate() === dayy0;
      });

      const tempPts = buildDaySeries(todayRows, (r) => num(r.temp_c ?? r.temperature));
      const pressPts = buildDaySeries(todayRows, (r) => num(r.pressio_rel_hpa ?? r.pressure_hpa ?? r.pressure_rel_hpa));
      const rainPts = buildDaySeries(todayRows, (r) => num(r.pluja_diaria_mm ?? r.rain_daily_mm ?? r.rain_mm));
      const humPts = buildDaySeries(todayRows, (r) => num(r.humitat_pct ?? r.humidity));

      // No reservem espai per a un gràfic que no pot mostrar una sèrie.
      // Això depèn només dels punts disponibles, no de la font de l'estació.
      const cvTemp = tempPts.length >= 2 ? attachChart(cTemp, "chart-temp") : null;
      const cvRain = !hasRain24h && rainPts.length >= 2 ? attachChart(cRain, "chart-rain") : null;
      const cvPress = pressPts.length >= 2 ? attachChart(cPress, "chart-press") : null;
      const cvHum = humPts.length >= 2 ? attachChart(cHum, "chart-hum") : null;

      appendCards();

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
    } else appendCards();

  } catch (e) {
    if (e?.name === "AbortError" || !isCurrent() || signal?.aborted) return;
    if (ui.err) ui.err.textContent = e?.status === 404 && selectedStationId
      ? "Aquesta estació no està disponible o no hi tens accés."
      : "No s’han pogut carregar les dades meteorològiques.";
    if (ui.backGlobal && e?.status === 404 && selectedStationId) ui.backGlobal.hidden = false;
    trackEvent(CONFIG, "meteo_refresh_error", { msg: String(e && (e.message || e)) });
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

  // Tracking: screen view
  trackEvent(CONFIG, "screen_view", { screen: "meteo" });

  let disposed = false;
  let timer = null;
  let accessController = null;
  let accessRevision = 0;
  let refreshController = null;
  let refreshRevision = 0;
  let preferenceApplied = false;
  let stations = [];
  let session = null;
  let stationMap = null;
  let stationMapController = null;
  let stationMapRevision = 0;
  let preference = { default_station: null, revision: 0, invalidated: false };
  let publicView = { station: null, card_ids: ['wind', 'temperature', 'rain', 'pressure', 'humidity', 'uv'], revision: 0 };
  const selectedFromUrl = new URL(location.href).searchParams.has("station_id");

  function clearSelectedStation() {
    selectStation({ stationId: "", store, stationControl: ui.station, map: stationMap, updatePreferenceControls });
  }

  function runRefresh() {
    refreshController?.abort();
    const controller = new AbortController();
    const revision = ++refreshRevision;
    refreshController = controller;
    return refreshMeteo(ui, store, publicView, {
      signal: controller.signal,
      isCurrent: () => !disposed && revision === refreshRevision,
    });
  }

  function selectCurrentStation(stationId) {
    return selectStation({
      stationId, store, stationControl: ui.station, map: stationMap,
      updatePreferenceControls, refresh: runRefresh,
    });
  }

  async function refreshStationMap() {
    if (!ui.map || !['local', 'production'].includes(CONFIG.environment)) return;
    stationMapController?.abort();
    const controller = new AbortController();
    const revision = ++stationMapRevision;
    stationMapController = controller;
    try {
      if (!stationMap) {
        stationMap = await createStationMapCore({
          container: ui.map,
          config: CONFIG,
          mapMode: "real",
          allowProduction: true,
          selectedStationId: store.get().stationId,
          selectable: (station) => station.resource_kind === "STATION",
          onStationSelect: selectCurrentStation,
          onStatus: (message) => { if (ui.mapStatus) ui.mapStatus.textContent = message; },
          onUnavailable: () => { if (ui.mapStatus) ui.mapStatus.textContent = "El mapa no està disponible en aquest entorn."; },
        });
      }
      if (!stationMap || disposed || controller.signal.aborted || revision !== stationMapRevision) return;
      const result = await loadAuthorizedStationMap({ apiBase: CONFIG.apiBase, signal: controller.signal });
      if (disposed || controller.signal.aborted || revision !== stationMapRevision) return;
      stationMap.setCollection(result.collection, { fit: true });
      stationMap.setSelectedStation(store.get().stationId);
      if (ui.mapStatus) ui.mapStatus.textContent = result.collection.features.length
        ? "" : "No hi ha estacions accessibles amb coordenades autoritzades.";
    } catch (error) {
      if (error?.name === "AbortError" || disposed || revision !== stationMapRevision) return;
      if (ui.mapStatus) ui.mapStatus.textContent = "No s’ha pogut carregar el mapa d’estacions.";
    }
  }

  function renderStationOptions() {
    if (!ui.station) return;
    ui.station.replaceChildren();
    const globalOption = document.createElement("option");
    globalOption.value = "";
    globalOption.textContent = publicView.station
      ? `Vista pública · ${publicView.station.name}`
      : "Estació pública principal";
    ui.station.append(globalOption);
    const selected = store.get().stationId || "";
    for (const station of stations) {
      const option = document.createElement("option");
      option.value = station.id;
      option.textContent = `${station.name}${station.kind === "ESTIMATION" ? " · Estimació" : station.visibility === "PRIVATE" ? " · privada" : ""}`;
      ui.station.append(option);
    }
    if (selected && !stations.some((station) => station.id === selected)) {
      const unavailable = document.createElement("option");
      unavailable.value = selected;
      unavailable.textContent = "Estació seleccionada no disponible";
      ui.station.append(unavailable);
    }
    ui.station.value = selected;
  }

  function updatePreferenceControls() {
    const selected = stations.find((station) => station.id === store.get().stationId);
    const canDefault = !!session && !!selected?.owned && selected.lifecycle === "ACTIVE";
    if (ui.setDefault) {
      ui.setDefault.hidden = !session;
      ui.setDefault.disabled = !canDefault
        || preference.default_station?.id === selected?.id;
    }
    if (ui.clearDefault) {
      ui.clearDefault.hidden = !session || !preference.default_station;
    }
  }

  async function reloadAccess() {
    accessController?.abort();
    refreshController?.abort();
    refreshRevision += 1;
    const controller = new AbortController();
    const revision = ++accessRevision;
    accessController = controller;
    if (ui.cards) ui.cards.replaceChildren();
    if (ui.summary) ui.summary.textContent = "";
    if (ui.last) ui.last.textContent = "Carregant…";

    try {
      const [nextSession, nextPublicView] = await Promise.all([
        fetchMeteoSession({ signal: controller.signal }).catch((error) => {
          if (error?.name === "AbortError") throw error;
          return null;
        }),
        fetchPublicView({ signal: controller.signal }).catch((error) => {
          if (error?.name === "AbortError") throw error;
          return publicView;
        }),
      ]);
      const isSuperadmin = nextSession?.user?.role === "SUPERADMIN";
      const [nextStations, nextPreference] = await Promise.all([
        fetchStationCatalog({
          includeOwn: !!nextSession, includeAdmin: isSuperadmin, signal: controller.signal,
        }).catch((error) => {
          if (error?.name === "AbortError") throw error;
          return [];
        }),
        nextSession
          ? fetchStationPreference({ signal: controller.signal }).catch((error) => {
            if (error?.name === "AbortError") throw error;
            return { default_station: null, revision: 0, invalidated: false };
          })
          : Promise.resolve({ default_station: null, revision: 0, invalidated: false }),
      ]);
      if (disposed || controller.signal.aborted || revision !== accessRevision) return;

      session = nextSession;
      publicView = nextPublicView;
      stations = nextStations;
      preference = nextPreference;
      const selectedId = store.get().stationId || "";
      if (selectedId && !stations.some((station) => station.id === selectedId)) clearSelectedStation();
      if (!preferenceApplied && !selectedFromUrl && !store.get().stationId && preference.default_station) {
        store.set({ stationId: preference.default_station.id });
      }
      preferenceApplied = true;
      if (preference.invalidated && ui.preferenceStatus) {
        ui.preferenceStatus.textContent = "La teva estació predeterminada ja no està disponible. Es mostra la vista pública.";
      }
      renderStationOptions();
      updatePreferenceControls();
      stationMap?.setSelectedStation(store.get().stationId);
      refreshStationMap();
      await runRefresh();
    } catch (error) {
      if (error?.name === "AbortError" || disposed || revision !== accessRevision) return;
      renderStationOptions();
      await runRefresh();
    }
  }

  function bootstrap() {
    // La vista pública existent no depèn de les capacitats opcionals de compte.
    // Això manté la càrrega immediata durant una actualització gradual del backend.
    if (!store.get().stationId) runRefresh();
    reloadAccess();
  }

  const onStationChange = () => {
    selectCurrentStation(ui.station.value);
  };
  ui.station?.addEventListener("change", onStationChange);

  const onSetDefault = async () => {
    const stationId = store.get().stationId;
    if (!session || !stationId) return;
    ui.setDefault.disabled = true;
    if (ui.preferenceStatus) ui.preferenceStatus.textContent = "Desant la preferència…";
    try {
      preference = await setDefaultStation(stationId, preference.revision, session.csrf_token);
      if (ui.preferenceStatus) ui.preferenceStatus.textContent = "Estació predeterminada desada per al teu compte.";
    } catch (error) {
      if (ui.preferenceStatus) ui.preferenceStatus.textContent = error?.status === 409
        ? "La preferència ha canviat en un altre dispositiu. Recarrega la pàgina."
        : "No s’ha pogut desar aquesta preferència.";
    }
    updatePreferenceControls();
  };
  const onClearDefault = async () => {
    if (!session) return;
    ui.clearDefault.disabled = true;
    try {
      preference = await clearDefaultStation(preference.revision, session.csrf_token);
      if (ui.preferenceStatus) ui.preferenceStatus.textContent = "La vista pública serà la predeterminada.";
    } catch (error) {
      if (ui.preferenceStatus) ui.preferenceStatus.textContent = error?.status === 409
        ? "La preferència ha canviat en un altre dispositiu. Recarrega la pàgina."
        : "No s’ha pogut actualitzar la preferència.";
    }
    updatePreferenceControls();
  };
  const onBackGlobal = () => {
    selectCurrentStation("");
    renderStationOptions();
  };
  ui.setDefault?.addEventListener("click", onSetDefault);
  ui.clearDefault?.addEventListener("click", onClearDefault);
  ui.backGlobal?.addEventListener("click", onBackGlobal);

  const onAccessMayHaveChanged = () => reloadAccess();
  const onVisibilityChange = () => {
    if (document.visibilityState === "visible") reloadAccess();
  };
  window.addEventListener("storage", onAccessMayHaveChanged);
  window.addEventListener("focus", onAccessMayHaveChanged);
  document.addEventListener("visibilitychange", onVisibilityChange);

  bootstrap();
  if (store.get().auto) timer = setInterval(runRefresh, CONFIG.autoRefreshMs);

  return () => {
    disposed = true;
    accessController?.abort();
    refreshController?.abort();
    stationMapController?.abort();
    stationMap?.destroy();
    ui.station?.removeEventListener("change", onStationChange);
    ui.setDefault?.removeEventListener("click", onSetDefault);
    ui.clearDefault?.removeEventListener("click", onClearDefault);
    ui.backGlobal?.removeEventListener("click", onBackGlobal);
    window.removeEventListener("storage", onAccessMayHaveChanged);
    window.removeEventListener("focus", onAccessMayHaveChanged);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    if (timer) clearInterval(timer);
  };
}
