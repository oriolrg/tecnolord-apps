import { fmtTime, cell } from "../format.js";

export function renderMeteoTable(tbody, rows) {
  tbody.innerHTML = rows.map((row) => {
    const instant = row.instant ?? row.at;
    const temp_c = row.temp_c ?? row.temperature;
    const feels = row.sensacio_c ?? row.feels_like ?? row.feels_like_c;
    const dew = row.punt_rosada_c ?? row.dew_point ?? row.dew_point_c;
    const hum = row.humitat_pct ?? row.humidity;
    const pRel = row.pressio_rel_hpa ?? row.pressure_hpa ?? row.pressure_rel_hpa;
    const pAbs = row.pressio_abs_hpa ?? row.pressure_abs_hpa;
    const uvi = row.uvi;
    const solar = row.solar_wm2;
    const rainRate = row.taxa_pluja_mm_h ?? row.rain_rate_mmph;
    const rainDay = row.pluja_diaria_mm ?? row.rain_daily_mm ?? row.rain_mm;
    const rain1h = row.pluja_hora_mm ?? row.rain_hour_mm;
    const rainMonth = row.pluja_mes_mm ?? row.rain_month_mm;
    const rainYear = row.pluja_any_mm ?? row.rain_year_mm;
    const wind = row.vent_ms ?? row.wind_speed_ms;
    const gust = row.vent_rafega_ms ?? row.wind_gust_ms;
    const wdir = row.vent_direccio_graus ?? row.wind_dir_deg;

    return `
      <tr>
        <td>${fmtTime(instant)}</td>
        <td>${cell(temp_c)}</td>
        <td>${cell(feels)}</td>
        <td>${cell(dew)}</td>
        <td>${cell(hum)}</td>
        <td>${cell(pRel)}</td>
        <td>${cell(pAbs)}</td>
        <td>${cell(uvi)}</td>
        <td>${cell(solar)}</td>
        <td>${cell(rainRate)}</td>
        <td>${cell(rainDay)}</td>
        <td>${cell(rain1h)}</td>
        <td>${cell(rainMonth)}</td>
        <td>${cell(rainYear)}</td>
        <td>${cell(wind)}</td>
        <td>${cell(gust)}</td>
        <td>${cell(wdir)}</td>
      </tr>`;
  }).join("");
}
