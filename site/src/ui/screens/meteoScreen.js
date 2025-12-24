// meteoScreen.js
import { card } from "../components/card.js";
import { num, fmt1, clamp, windAbbr16, windFromCa, fmtTime, norm } from "../format.js";
import { windNameCa } from "../format.js";

import { fetchMeteo } from "../../services/meteoService.js";
import { fetchHidro } from "../../services/hidroService.js";

// Helpers HIDRO
function pickRow(rows, predicates) {
  for (const pred of predicates) {
    const found = rows.find(pred);
    if (found) return found;
  }
  return null;
}

export async function refreshMeteo(ui, store) {
  if (ui.err) ui.err.textContent = "";
  if (ui.errH) ui.errH.textContent = "";

  const s = store.get();
  const estacio = (s.estacio || "").trim();
  const codi = (s.codiHidro || "").trim();
  const limit = clamp(parseInt(s.limit || "48", 10), 1, 500);

  try {
    // en aquest screen carreguem meteo + hidro per poder pintar totes les cards
    const [meteoRows, hidroRows] = await Promise.all([
      fetchMeteo({ estacio, limit }),
      fetchHidro({ codi, limit }),
    ]);

    // --- METEO CARDS ---
    if (ui.meteoCount) ui.meteoCount.textContent = String(meteoRows.length);

    if (ui.meteoCards) ui.meteoCards.innerHTML = "";

    if (!meteoRows.length) {
      if (ui.meteoSummary) ui.meteoSummary.textContent = "Meteo: Sense registres.";
      if (ui.last) ui.last.textContent = "Sense dades";
    } else {
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

      // PLUJA
      const rainRate = num(r0.taxa_pluja_mm_h ?? r0.rain_rate_mmph);
      const rainDay = num(r0.pluja_diaria_mm ?? r0.rain_daily_mm ?? r0.rain_mm);
      const rain1h = num(r0.pluja_hora_mm ?? r0.rain_hour_mm);
      const rainWeek = num(r0.pluja_setmana_mm ?? r0.rain_week_mm);
      const rainEvent = num(r0.pluja_event_mm ?? r0.rain_event_mm);
      const rainMonth = num(r0.pluja_mes_mm ?? r0.rain_month_mm);
      const rainYear = num(r0.pluja_any_mm ?? r0.rain_year_mm);

      // VENT
      const wind = num(r0.vent_ms ?? r0.wind_speed_ms);
      const gust = num(r0.vent_rafega_ms ?? r0.wind_gust_ms);
      const wdir = num(r0.vent_direccio_graus ?? r0.wind_dir_deg);

      const deg =
        wdir == null || Number.isNaN(wdir)
          ? null
          : ((wdir % 360) + 360) % 360;

      const degTxt = deg == null ? "—" : `${Math.round(deg)}°`;
      const abbr = deg == null ? "—" : windAbbr16(deg);
      const name = deg == null ? "" : windNameCa(deg);
      const fromTxt = deg == null ? "Vent" : `Vent del ${windFromCa(deg)} (${name})`;

      // age
      const ageSec = Math.max(0, Math.round((Date.now() - new Date(instant).getTime()) / 1000));
      const ageTxt =
        ageSec < 60 ? `${ageSec} s` :
        ageSec < 3600 ? `${Math.round(ageSec / 60)} min` :
        `${Math.round(ageSec / 3600)} h`;

      if (ui.last) ui.last.textContent = `Dades actualitzades fa ${ageTxt}`;


      // EXTREMES DEL DIA
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

      // vent meta
      const windVal = (wind == null || Number.isNaN(wind)) ? "—" : fmt1(wind);
      const gustVal = (gust == null || Number.isNaN(gust)) ? "—" : fmt1(gust);

      const windMetaHtml = `
        Velocitat: <strong>${windVal} m/s</strong>
        · Ràfega: <strong>${gustVal} m/s</strong>
      `;

      // pluja
      const rainMainValue = (rainRate == null || Number.isNaN(rainRate)) ? "—" : fmt1(rainRate);
      const rainMainUnit = "mm/h";

      const plujaLines = [];
      const dayTxt = (rainDay == null || Number.isNaN(rainDay)) ? "—" : fmt1(rainDay);
      plujaLines.push(`Dia: <strong>${dayTxt} mm</strong>`);
      if (rain1h != null && !Number.isNaN(rain1h)) plujaLines.push(`<span class="muted">1h: ${fmt1(rain1h)} mm</span>`);
      if (rainWeek != null && !Number.isNaN(rainWeek)) plujaLines.push(`<span class="muted">Setmana: ${fmt1(rainWeek)} mm</span>`);
      if (rainEvent != null && !Number.isNaN(rainEvent)) plujaLines.push(`<span class="muted">Event: ${fmt1(rainEvent)} mm</span>`);
      if (rainMonth != null && !Number.isNaN(rainMonth)) plujaLines.push(`<span class="muted">Mes: ${fmt1(rainMonth)} mm</span>`);
      if (rainYear != null && !Number.isNaN(rainYear)) plujaLines.push(`<span class="muted">Any: ${fmt1(rainYear)} mm</span>`);

      const cTemp = card({
        title: "Temperatura",
        value: fmt1(temp_c),
        unit: "°C",
        badge: "Última lectura",
        subHtml:
          `${feels != null ? `Sensació: <strong>${fmt1(feels)} °C</strong>` : "Sensació: <strong>—</strong>"}`
          + `${dew != null ? ` · Rosada: <strong>${fmt1(dew)} °C</strong>` : " · Rosada: <strong>—</strong>"}`
          + `${extremesHtml}`,
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
            ${renderWindRoseSvg(deg, degTxt, abbr)}
          </div>
          <div class="wind-meta">${windMetaHtml}</div>
        `,
      });
      cWind.classList.add("card--tall");

      const cRain = card({
        title: "Pluja",
        value: rainMainValue,
        unit: rainMainUnit,
        badge: "Taxa",
        subHtml: plujaLines.join(`<span class="sep"></span>`),
      });
      cRain.classList.add("card--tall");

      const cUv = card({
        title: "UV",
        value: uvi == null ? "—" : Math.round(uvi),
        unit: "",
        badge: "Índex",
        subHtml: `${solar != null ? `Solar: <strong>${fmt1(solar)} W/m²</strong>` : ""}`,
      });

      if (ui.meteoCards) ui.meteoCards.append(cTemp, cHum, cPress, cWind, cRain, cUv);
    }

    // --- HIDRO CARDS ---
    if (ui.hidroCount) ui.hidroCount.textContent = String(hidroRows.length);

    if (ui.hidroCards) ui.hidroCards.innerHTML = "";

    if (!hidroRows.length) {
      if (ui.hidroSummary) ui.hidroSummary.textContent = "Hidro: Sense registres.";
    } else {
      if (ui.hidroSummary) {
        ui.hidroSummary.textContent = codi
          ? `Hidro · Codi: ${codi} · ${hidroRows.length} registres`
          : `Hidro · ${hidroRows.length} registres`;
      }

      const rowLlosa = pickRow(hidroRows, [
        r => norm(r.nom).includes("llosa") || norm(r.nom).includes("cavall"),
        r => norm(r.codi).includes("llosa") || norm(r.codi).includes("cavall"),
      ]);

      const rowCardener = pickRow(hidroRows, [
        r => norm(r.nom).includes("cardener"),
        r => norm(r.codi).includes("cardener"),
      ]);

      const rowValls = pickRow(hidroRows, [
        r => norm(r.nom).includes("valls"),
        r => norm(r.codi).includes("valls"),
      ]);

      const instantLlosa = rowLlosa?.instant ?? null;
      const cap = num(rowLlosa?.capacitat_pct);

      let sortida = num(rowLlosa?.cabal_m3s);
      if (sortida == null) {
        const rowSortida = pickRow(hidroRows, [
          r => norm(r.nom).includes("sortida") && (norm(r.nom).includes("llosa") || norm(r.nom).includes("cavall")),
          r => norm(r.codi).includes("sortida") && (norm(r.codi).includes("llosa") || norm(r.codi).includes("cavall")),
        ]);
        sortida = num(rowSortida?.cabal_m3s);
      }

      const cabalCardener = num(rowCardener?.cabal_m3s);
      const cabalValls = num(rowValls?.cabal_m3s);
      const entradaTotal = (cabalCardener ?? 0) + (cabalValls ?? 0);
      const delta = (sortida == null ? null : (entradaTotal - sortida));

      let deltaHtml = "";
      if (sortida != null && (cabalCardener != null || cabalValls != null)) {
        const cls = delta >= 0 ? "ok" : "bad";
        const txt = delta >= 0 ? "S’omple" : "Es buida";
        deltaHtml = `
          <span class="sep"></span>
          <span>Entrada: <strong>${fmt1(entradaTotal)} m³/s</strong></span>
          <span>Sortida: <strong>${fmt1(sortida)} m³/s</strong></span>
          <span class="delta ${cls}">${txt}</span>
        `;
      }

      const cCabal = card({
        title: "Cabal (balanç)",
        value: sortida == null ? "—" : fmt1(sortida),
        unit: "m³/s",
        badge: rowLlosa?.nom ? rowLlosa.nom : "Últim",
        subHtml: `
          ${deltaHtml}
          ${instantLlosa ? `<span class="sep"></span>Hora: <strong>${fmtTime(instantLlosa)}</strong>` : ""}
        `,
      });
      cCabal.classList.add("card--tall", "card--wind");

      const cCap = card({
        title: "Capacitat",
        value: cap == null ? "—" : fmt1(cap),
        unit: "%",
        badge: rowLlosa?.nom ? rowLlosa.nom : "Últim",
        subHtml: `${rowLlosa?.nom ? `Estació: <strong>${rowLlosa.nom}</strong>` : ""}`,
      });
      cCap.classList.add("card--tall", "card--wind");

      const entradesParts = [];
      if (cabalCardener != null) {
        entradesParts.push(
          `Cardener: <strong>${fmt1(cabalCardener)} m³/s</strong>${rowCardener?.instant ? ` · <span class="muted">${fmtTime(rowCardener.instant)}</span>` : ""}`
        );
      }
      if (cabalValls != null) {
        entradesParts.push(
          `Valls: <strong>${fmt1(cabalValls)} m³/s</strong>${rowValls?.instant ? ` · <span class="muted">${fmtTime(rowValls.instant)}</span>` : ""}`
        );
      }

      const cEntrades = card({
        title: "Entrades (rius)",
        value: (cabalCardener == null && cabalValls == null) ? "—" : fmt1(entradaTotal),
        unit: "m³/s",
        badge: "Total",
        subHtml: entradesParts.length ? entradesParts.join(`<span class="sep"></span>`) : "",
      });

      if (ui.hidroCards) ui.hidroCards.append(cCabal, cCap, cEntrades);
    }
  } catch (e) {
    if (ui.err) ui.err.textContent = "Error cards: " + (e.message || e);
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
