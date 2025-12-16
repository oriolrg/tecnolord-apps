import { card } from "../components/card.js";
import { fmtTime, num, fmt1, clamp, degToCompass, degToArrow } from "../format.js";

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
    const rainRate = num(r0.taxa_pluja_mm_h ?? r0.rain_rate_mmph);
    const rainDay = num(r0.pluja_diaria_mm ?? r0.rain_daily_mm ?? r0.rain_mm);
    const rain1h = num(r0.pluja_hora_mm ?? r0.rain_hour_mm);
    const rainMonth = num(r0.pluja_mes_mm ?? r0.rain_month_mm);
    const rainYear = num(r0.pluja_any_mm ?? r0.rain_year_mm);
    const wind = num(r0.vent_ms ?? r0.wind_speed_ms);
    const gust = num(r0.vent_rafega_ms ?? r0.wind_gust_ms);
    const wdir = num(r0.vent_direccio_graus ?? r0.wind_dir_deg);
    const dirTxt = degToCompass(wdir);
    const dirArrow = degToArrow(wdir);
    const deg = (wdir == null || Number.isNaN(wdir))
    ? null
    : ((wdir % 360) + 360) % 360;
    const arrowDeg = deg ;




    const ageSec = Math.max(0, Math.round((Date.now() - new Date(instant).getTime()) / 1000));
    const ageTxt =
      ageSec < 60 ? `${ageSec} s` :
      ageSec < 3600 ? `${Math.round(ageSec/60)} min` :
      `${Math.round(ageSec/3600)} h`;

    ui.last.textContent = `Dades actualitzades fa ${ageTxt}`;

    ui.meteoSummary.textContent = estacio ? `Estació: ${estacio} · ${rows.length} registres` : `${rows.length} registres`;

    ui.meteoCards.innerHTML = "";
    ui.meteoCards.append(
      card({
        title: "Temperatura",
        value: fmt1(temp_c),
        unit: "°C",
        badge: "Última lectura",
        subHtml: `${feels != null ? `Sensació: <strong>${fmt1(feels)} °C</strong>` : ""}${dew != null ? ` · Rosada: <strong>${fmt1(dew)} °C</strong>` : ""}`,
      }),
      card({ title: "Humitat", value: hum == null ? "—" : Math.round(hum), unit: "%", badge: "Última lectura", subHtml: "" }),
      card({ title: "Pressió (rel.)", value: fmt1(pRel), unit: "hPa", badge: "Relativa", subHtml: `${pAbs != null ? `Abs.: <strong>${fmt1(pAbs)} hPa</strong>` : ""}` }),
      card({
        title: "Vent",
        value: "",       // 👈 important: evitem duplicat
        unit: "",
        badge: "Direcció",
        subHtml: `
          <div class="wind-card">
            <div class="wind-left">
              <div class="wind-deg">${deg == null ? "Sense dades" : `${Math.round(deg)}°`}</div>
              <div class="wind-meta">
                ${wind != null ? `Velocitat: <strong>${fmt1(wind)} m/s</strong>` : ""}
                ${gust != null ? ` · Ràfega: <strong>${fmt1(gust)} m/s</strong>` : ""}
              </div>
            </div>

           ${deg == null ? "" : `
            <svg class="wind-rose" viewBox="0 0 140 140" role="img" aria-label="Rosa de vents">
              <!-- gradients suaus -->
              <defs>
                <radialGradient id="roseGlow" cx="50%" cy="50%" r="60%">
                  <stop offset="0%" stop-color="rgba(96,165,250,.25)"/>
                  <stop offset="100%" stop-color="rgba(96,165,250,0)"/>
                </radialGradient>
              </defs>

              <!-- glow -->
              <circle cx="70" cy="70" r="58" fill="url(#roseGlow)"/>

              <!-- anell exterior -->
              <circle cx="70" cy="70" r="56" fill="none" stroke="rgba(96,165,250,.45)" stroke-width="2"/>

              <!-- rosa (8 puntes: llargues + curtes) -->
              <g transform="translate(70 70)">
                <!-- puntes llargues (N,E,S,W) -->
                ${[0,90,180,270].map(a=>`
                  <g transform="rotate(${a})">
                    <polygon points="0,-54 -10,-18 0,-26 10,-18" fill="rgba(96,165,250,.80)"/>
                  </g>
                `).join("")}

                <!-- puntes diagonals (NE,SE,SW,NW) -->
                ${[45,135,225,315].map(a=>`
                  <g transform="rotate(${a})">
                    <polygon points="0,-42 -9,-16 0,-22 9,-16" fill="rgba(96,165,250,.35)"/>
                  </g>
                `).join("")}

                <!-- cercle central -->
                <circle cx="0" cy="0" r="16" fill="rgba(0,0,0,.08)" stroke="rgba(96,165,250,.55)" stroke-width="2"/>
                <circle cx="0" cy="0" r="4" fill="rgba(96,165,250,.95)"/>

                <!-- agulla direcció (gira segons arrowDeg) -->
                <g transform="rotate(${arrowDeg})">
                  <polygon points="0,-50 -7,-30 0,-36 7,-30" fill="rgba(96,165,250,.95)"/>
                  <line x1="0" y1="-30" x2="0" y2="0" stroke="rgba(96,165,250,.95)" stroke-width="4" stroke-linecap="round"/>
                </g>
              </g>

              <!-- lletres principals -->
              <text x="70" y="14" text-anchor="middle" font-size="11" font-weight="800" fill="currentColor">N</text>
              <text x="126" y="74" text-anchor="middle" font-size="11" font-weight="800" fill="currentColor">E</text>
              <text x="70" y="136" text-anchor="middle" font-size="11" font-weight="800" fill="currentColor">S</text>
              <text x="14" y="74" text-anchor="middle" font-size="11" font-weight="800" fill="currentColor">W</text>

              
            </svg>
            `}


          </div>
        `,
      }),

      card({
        title: "Pluja (dia)",
        value: fmt1(rainDay),
        unit: "mm",
        badge: "Acumulada",
        subHtml: `${rainRate != null ? `Taxa: <strong>${fmt1(rainRate)} mm/h</strong>` : ""}${rain1h != null ? ` · 1h: <strong>${fmt1(rain1h)} mm</strong>` : ""}`,
      }),
      card({ title: "Pluja (mes)", value: fmt1(rainMonth), unit: "mm", badge: "Acumulada", subHtml: `${rainYear != null ? `Any: <strong>${fmt1(rainYear)} mm</strong>` : ""}` }),
      card({ title: "UV", value: uvi == null ? "—" : Math.round(uvi), unit: "", badge: "Índex", subHtml: `${solar != null ? `Solar: <strong>${fmt1(solar)} W/m²</strong>` : ""}` }),
    );

    renderMeteoTable(ui.meteoTbody, rows);
  } catch (e) {
    ui.err.textContent = "Error meteo: " + (e.message || e);
  }
}
