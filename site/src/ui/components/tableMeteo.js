import { fmtTime, fmt1, num, cell } from "../format.js";

export function renderMeteoTable(tbody, rows) {
  tbody.innerHTML = rows
    .map((r) => {
      const instant = r.instant ?? r.at;

      const temp = num(r.temp_c ?? r.temperature);
      const feels = num(r.sensacio_c ?? r.feels_like ?? r.feels_like_c);
      const dew = num(r.punt_rosada_c ?? r.dew_point ?? r.dew_point_c);
      const hum = num(r.humitat_pct ?? r.humidity);

      const pRel = num(r.pressio_rel_hpa ?? r.pressure_hpa ?? r.pressure_rel_hpa);
      const pAbs = num(r.pressio_abs_hpa ?? r.pressure_abs_hpa);

      const uvi = num(r.uvi);
      const solar = num(r.solar_wm2);

      const rainRate = num(r.taxa_pluja_mm_h ?? r.rain_rate_mmph);
      const rainDay = num(r.pluja_diaria_mm ?? r.rain_daily_mm ?? r.rain_mm);
      const rain1h = num(r.pluja_hora_mm ?? r.rain_hour_mm);
      const rainMonth = num(r.pluja_mes_mm ?? r.rain_month_mm);
      const rainYear = num(r.pluja_any_mm ?? r.rain_year_mm);

      const wind = num(r.vent_ms ?? r.wind_speed_ms);
      const gust = num(r.vent_rafega_ms ?? r.wind_gust_ms);
      const dir = num(r.vent_direccio_graus ?? r.wind_dir_deg);

      return `
        <tr>
          <td class="col-time" data-label="Hora">${fmtTime(instant)}</td>

          <td class="col-temp" data-label="Temp (°C)">${cell(temp == null ? "" : fmt1(temp))}</td>
          <td class="col-feels" data-label="Sensació (°C)">${cell(feels == null ? "" : fmt1(feels))}</td>
          <td class="col-dew" data-label="Rosada (°C)">${cell(dew == null ? "" : fmt1(dew))}</td>
          <td class="col-hum" data-label="Hum (%)">${cell(hum == null ? "" : Math.round(hum))}</td>

          <td class="col-press-rel" data-label="Pressió rel (hPa)">${cell(pRel == null ? "" : fmt1(pRel))}</td>
          <td class="col-press-abs" data-label="Pressió abs (hPa)">${cell(pAbs == null ? "" : fmt1(pAbs))}</td>

          <td class="col-uvi" data-label="UVI">${cell(uvi == null ? "" : Math.round(uvi))}</td>
          <td class="col-solar" data-label="Solar (W/m²)">${cell(solar == null ? "" : fmt1(solar))}</td>

          <td class="col-rainrate" data-label="Taxa pluja (mm/h)">${cell(rainRate == null ? "" : fmt1(rainRate))}</td>
          <td class="col-rainday" data-label="Pluja dia (mm)">${cell(rainDay == null ? "" : fmt1(rainDay))}</td>
          <td class="col-rain1h" data-label="Pluja 1h (mm)">${cell(rain1h == null ? "" : fmt1(rain1h))}</td>
          <td class="col-rainmonth" data-label="Pluja mes (mm)">${cell(rainMonth == null ? "" : fmt1(rainMonth))}</td>
          <td class="col-rainyear" data-label="Pluja any (mm)">${cell(rainYear == null ? "" : fmt1(rainYear))}</td>

          <td class="col-wind" data-label="Vent (m/s)">${cell(wind == null ? "" : fmt1(wind))}</td>
          <td class="col-gust" data-label="Ràfega (m/s)">${cell(gust == null ? "" : fmt1(gust))}</td>
          <td class="col-dir" data-label="Dir (°)">${cell(dir == null ? "" : Math.round(dir))}</td>
        </tr>`;
    })
    .join("");
}
