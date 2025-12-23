import { CONFIG } from "./config.js";
import { createCard } from "./card.js";
import { renderMeteoTable } from "./tableMeteo.js";
import { fetchMeteo } from "./services/meteoService.js";
import { fmtTime, fmt1, fmt0 } from "./utils/format.js";

function safe(v, fallback = "—") {
  return v == null || Number.isNaN(v) ? fallback : v;
}

function normalizeWindAbbr(deg) {
  if (deg == null || Number.isNaN(deg)) return "—";
  const d = ((deg % 360) + 360) % 360;
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const i = Math.round(d / 45) % 8;
  return dirs[i];
}

function renderWindRoseSvg(arrowDeg, degTxt, abbr) {
  const a = Number.isFinite(arrowDeg) ? arrowDeg : 0;
  return `
    <svg class="wind-rose" viewBox="0 0 120 120" aria-label="Brúixola del vent" role="img">
      <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,.16)" stroke-width="2"></circle>
      <circle cx="60" cy="60" r="40" fill="none" stroke="rgba(255,255,255,.10)" stroke-width="2"></circle>

      <text x="60" y="18" text-anchor="middle" font-size="10" fill="rgba(255,255,255,.75)">N</text>
      <text x="104" y="64" text-anchor="middle" font-size="10" fill="rgba(255,255,255,.75)">E</text>
      <text x="60" y="114" text-anchor="middle" font-size="10" fill="rgba(255,255,255,.75)">S</text>
      <text x="16" y="64" text-anchor="middle" font-size="10" fill="rgba(255,255,255,.75)">W</text>

      <g transform="translate(60 60) rotate(${a})">
        <path d="M0 -40 L6 -20 L0 -24 L-6 -20 Z" fill="rgba(255,255,255,.92)"></path>
        <line x1="0" y1="-24" x2="0" y2="34" stroke="rgba(255,255,255,.42)" stroke-width="2" />
      </g>

      <circle cx="60" cy="60" r="3" fill="rgba(255,255,255,.85)"></circle>

      <text x="60" y="67" text-anchor="middle" font-size="12" fill="rgba(255,255,255,.92)">${abbr}</text>
      <text x="60" y="82" text-anchor="middle" font-size="10" fill="rgba(255,255,255,.75)">${degTxt}</text>
    </svg>
  `;
}

export async function refreshMeteo(ui, store) {
  try {
    ui.err.textContent = "";
    const rows = await fetchMeteo(store.estacio, store.limit);

    const last = rows?.[0];
    ui.last.textContent = last?.hora ? fmtTime(last.hora) : "—";

    const temp = safe(last?.temp);
    const feel = safe(last?.sensacio);
    const dew = safe(last?.rosada);
    const hum = safe(last?.hum);
    const pRel = safe(last?.pressio_rel);
    const pAbs = safe(last?.pressio_abs);
    const uvi = safe(last?.uvi);
    const sol = safe(last?.solar);
    const rainRate = safe(last?.pluja_taxa);
    const rainDay = safe(last?.pluja_dia);
    const rain1h = safe(last?.pluja_1h);
    const rainMonth = safe(last?.pluja_mes);
    const rainYear = safe(last?.pluja_any);

    const wind = safe(last?.vent);
    const gust = safe(last?.rafega);
    const dir = last?.dir;

    const degTxt = dir == null || Number.isNaN(dir) ? "—" : `${fmt0(dir)}°`;
    const abbr = normalizeWindAbbr(dir);
    const arrowDeg = dir == null || Number.isNaN(dir) ? 0 : dir;

    const cards = [];

    cards.push(
      createCard({
        title: "Temperatura",
        value: temp === "—" ? "—" : `${fmt1(temp)} °C`,
        sub: feel === "—" ? "" : `Sensació: ${fmt1(feel)} °C`,
        icon: "temp"
      })
    );

    cards.push(
      createCard({
        title: "Humitat",
        value: hum === "—" ? "—" : `${fmt0(hum)} %`,
        sub: dew === "—" ? "" : `Rosada: ${fmt1(dew)} °C`,
        icon: "hum"
      })
    );

    cards.push(
      createCard({
        title: "Pressió",
        value: pRel === "—" ? "—" : `${fmt0(pRel)} hPa`,
        sub: pAbs === "—" ? "" : `Abs: ${fmt0(pAbs)} hPa`,
        icon: "press"
      })
    );

    cards.push(
      createCard({
        title: "Pluja",
        value: rainDay === "—" ? "—" : `${fmt1(rainDay)} mm`,
        subHtml: `
          ${rainRate === "—" ? "" : `Taxa: <strong>${fmt1(rainRate)}</strong> mm/h`}
          ${rain1h === "—" ? "" : `<br/>1h: <strong>${fmt1(rain1h)}</strong> mm`}
          ${rainMonth === "—" ? "" : `<br/>Mes: <strong>${fmt1(rainMonth)}</strong> mm`}
          ${rainYear === "—" ? "" : `<br/>Any: <strong>${fmt1(rainYear)}</strong> mm`}
        `,
        icon: "rain"
      })
    );

    cards.push(
      createCard({
        title: "UV",
        value: uvi === "—" ? "—" : `${fmt1(uvi)}`,
        sub: sol === "—" ? "" : `Solar: ${fmt0(sol)} W/m²`,
        icon: "uv"
      })
    );

    cards.push(
      createCard({
        title: "Vent",
        value: wind === "—" ? "—" : `${fmt1(wind)} m/s`,
        sub: gust === "—" ? "" : `Ràfega: ${fmt1(gust)} m/s`,
        subHtml: `
          <div class="wind-block">
            <div class="wind-rose-wrap">${renderWindRoseSvg(arrowDeg, degTxt.replace("°","°"), abbr)}</div>
          </div>
        `,
        icon: "wind",
        tall: true
      })
    );

    ui.meteoCards.innerHTML = cards.join("");

    if (ui.tblMeteo) renderMeteoTable(ui.tblMeteo, rows);
  } catch (e) {
    ui.err.textContent = e?.message || String(e);
    ui.meteoCards.innerHTML = "";
    if (ui.tblMeteo) ui.tblMeteo.innerHTML = "";
  }
}
