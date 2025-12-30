import { CONFIG } from "../../config.js";
import { $ } from "../dom.js";
import { num, fmt1, clamp } from "../format.js";
import { fetchMeteo } from "../../services/meteoService.js";
import { fetchHidro } from "../../services/hidroService.js";
import { renderMeteoTable } from "../components/tableMeteo.js";
import { renderHidroTable } from "../components/tableHidro.js";
import { renderLineChart, buildDaySeries } from "../components/lineChart.js";

function buildHistoricsUI(root) {
  root.innerHTML = `
    <div class="wrap">
      <div class="section-title">
        <h2>Històrics</h2>
        <p style="margin-top:6px; color: var(--muted);">Visualitza l'evolució de les dades meteorològiques i hidrològiques.</p>
      </div>

      <!-- Selector de període -->
      <div class="period-selector">
        <button class="period-btn active" data-period="today" type="button">Avui</button>
        <button class="period-btn" data-period="yesterday" type="button">Ahir</button>
        <button class="period-btn" data-period="7days" type="button">7 dies</button>
        <button class="period-btn" data-period="30days" type="button">30 dies</button>
        <button class="period-btn" data-period="custom" type="button">Personalitzat</button>
      </div>

      <!-- Selector de dates personalitzat (inicialment amagat) -->
      <div id="custom-dates" class="custom-dates" style="display:none;">
        <label>
          <span>Des de:</span>
          <input type="date" id="date-from" />
        </label>
        <label>
          <span>Fins:</span>
          <input type="date" id="date-to" />
        </label>
        <button class="btn" id="apply-custom" type="button">Aplicar</button>
      </div>

      <div class="status-row">
        <span class="pill"><span class="dot"></span><span id="hist-period">Avui</span></span>
        <span id="hist-err" class="err" role="alert" aria-live="polite"></span>
      </div>

      <!-- Estadístiques Meteo -->
      <div class="stats-grid" id="meteo-stats"></div>

      <!-- Gràfiques Meteo -->
      <div class="charts-section">
        <h3>Evolució Temperatura</h3>
        <div class="chart-container">
          <canvas id="chart-hist-temp" style="width:100%; height:220px;"></canvas>
        </div>
      </div>

      <div class="charts-section">
        <h3>Evolució Pluja Event (acumulat)</h3>
        <div class="chart-container">
          <canvas id="chart-hist-rain" style="width:100%; height:220px;"></canvas>
        </div>
      </div>

      <div class="charts-section">
        <h3>Evolució Pressió</h3>
        <div class="chart-container">
          <canvas id="chart-hist-press" style="width:100%; height:220px;"></canvas>
        </div>
      </div>

      <div class="charts-section">
        <h3>Evolució Humitat</h3>
        <div class="chart-container">
          <canvas id="chart-hist-hum" style="width:100%; height:220px;"></canvas>
        </div>
      </div>

      <!-- Taules detallades (plegables) -->
      <details style="margin-top:22px">
        <summary>Dades detallades (meteo) <span class="badge" id="hist-meteo-count">0</span></summary>
        <div class="detail-body">
          <div class="table-wrap">
            <table id="tbl-hist-meteo" aria-label="Taula de mesures meteorològiques">
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Temp (°C)</th>
                  <th>Sensació (°C)</th>
                  <th>Rosada (°C)</th>
                  <th>Hum (%)</th>
                  <th>Pressió rel (hPa)</th>
                  <th>Pressió abs (hPa)</th>
                  <th>UVI</th>
                  <th>Solar (W/m²)</th>
                  <th>Taxa pluja (mm/h)</th>
                  <th>Pluja dia</th>
                  <th>Pluja 1h</th>
                  <th>Pluja mes</th>
                  <th>Pluja any</th>
                  <th>Vent (m/s)</th>
                  <th>Ràfega (m/s)</th>
                  <th>Dir (°)</th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>
        </div>
      </details>

      <details style="margin-top:14px">
        <summary>Dades detallades (hidro) <span class="badge" id="hist-hidro-count">0</span></summary>
        <div class="detail-body">
          <div class="table-wrap">
            <table id="tbl-hist-hidro" aria-label="Taula d'hidrologia">
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Codi</th>
                  <th>Nom</th>
                  <th>Tipus</th>
                  <th>Cabal (m³/s)</th>
                  <th>Capacitat (%)</th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>
        </div>
      </details>
    </div>
  `;

  return {
    err: $("#hist-err", root),
    periodLabel: $("#hist-period", root),
    meteoStats: $("#meteo-stats", root),
    meteoCount: $("#hist-meteo-count", root),
    hidroCount: $("#hist-hidro-count", root),
    meteoTbody: $("#tbl-hist-meteo tbody", root),
    hidroTbody: $("#tbl-hist-hidro tbody", root),
    chartTemp: $("#chart-hist-temp", root),
    chartRain: $("#chart-hist-rain", root),
    chartPress: $("#chart-hist-press", root),
    chartHum: $("#chart-hist-hum", root),
    periodButtons: root.querySelectorAll(".period-btn"),
    customDatesDiv: $("#custom-dates", root),
    dateFrom: $("#date-from", root),
    dateTo: $("#date-to", root),
    applyCustom: $("#apply-custom", root),
  };
}

function calculatePeriod(period) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch(period) {
    case 'today':
      return { from: today, to: now, label: 'Avui' };
    
    case 'yesterday':
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayEnd = new Date(today);
      return { from: yesterday, to: yesterdayEnd, label: 'Ahir' };
    
    case '7days':
      const week = new Date(today);
      week.setDate(week.getDate() - 7);
      return { from: week, to: now, label: 'Últims 7 dies' };
    
    case '30days':
      const month = new Date(today);
      month.setDate(month.getDate() - 30);
      return { from: month, to: now, label: 'Últims 30 dies' };
    
    default:
      return { from: today, to: now, label: 'Avui' };
  }
}

function filterByPeriod(rows, from, to) {
  return rows.filter(r => {
    const ts = r.instant ?? r.at;
    if (!ts) return false;
    const d = new Date(ts);
    return d >= from && d <= to;
  });
}

function calculateStats(rows) {
  const temps = rows.map(r => num(r.temp_c ?? r.temperature)).filter(v => v != null);
  const hums = rows.map(r => num(r.humitat_pct ?? r.humidity)).filter(v => v != null);
  const press = rows.map(r => num(r.pressio_rel_hpa ?? r.pressure_hpa ?? r.pressure_rel_hpa)).filter(v => v != null);
  const rains = rows.map(r => num(r.pluja_event_mm ?? r.rain_event_mm)).filter(v => v != null);

  return {
    tempMin: temps.length ? Math.min(...temps) : null,
    tempMax: temps.length ? Math.max(...temps) : null,
    tempAvg: temps.length ? temps.reduce((a,b) => a+b, 0) / temps.length : null,
    
    humMin: hums.length ? Math.min(...hums) : null,
    humMax: hums.length ? Math.max(...hums) : null,
    humAvg: hums.length ? hums.reduce((a,b) => a+b, 0) / hums.length : null,
    
    pressMin: press.length ? Math.min(...press) : null,
    pressMax: press.length ? Math.max(...press) : null,
    pressAvg: press.length ? press.reduce((a,b) => a+b, 0) / press.length : null,
    
    rainMax: rains.length ? Math.max(...rains) : null,
  };
}

function renderStats(container, stats) {
  container.innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Temperatura</div>
      <div class="stat-values">
        <span class="stat-max">Màx: ${stats.tempMax != null ? fmt1(stats.tempMax) + ' °C' : '—'}</span>
        <span class="stat-avg">Mitjana: ${stats.tempAvg != null ? fmt1(stats.tempAvg) + ' °C' : '—'}</span>
        <span class="stat-min">Mín: ${stats.tempMin != null ? fmt1(stats.tempMin) + ' °C' : '—'}</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-label">Humitat</div>
      <div class="stat-values">
        <span class="stat-max">Màx: ${stats.humMax != null ? Math.round(stats.humMax) + ' %' : '—'}</span>
        <span class="stat-avg">Mitjana: ${stats.humAvg != null ? Math.round(stats.humAvg) + ' %' : '—'}</span>
        <span class="stat-min">Mín: ${stats.humMin != null ? Math.round(stats.humMin) + ' %' : '—'}</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-label">Pressió</div>
      <div class="stat-values">
        <span class="stat-max">Màx: ${stats.pressMax != null ? fmt1(stats.pressMax) + ' hPa' : '—'}</span>
        <span class="stat-avg">Mitjana: ${stats.pressAvg != null ? fmt1(stats.pressAvg) + ' hPa' : '—'}</span>
        <span class="stat-min">Mín: ${stats.pressMin != null ? fmt1(stats.pressMin) + ' hPa' : '—'}</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-label">Pluja Event</div>
      <div class="stat-values">
        <span class="stat-max">Màxim acumulat: ${stats.rainMax != null ? fmt1(stats.rainMax) + ' mm' : '—'}</span>
      </div>
    </div>
  `;
}

async function refreshHistorics(ui, store, period = 'today', customFrom = null, customTo = null) {
  if (ui.err) ui.err.textContent = "";

  const s = store.get();
  const estacio = (s.estacio || "").trim();
  const codi = (s.codiHidro || "").trim();
  
  // Demanem més dades per tenir històric
  const limit = period === '30days' ? 500 : period === '7days' ? 350 : 200;

  try {
    const [meteoRows, hidroRows] = await Promise.all([
      fetchMeteo({ estacio, limit }),
      fetchHidro({ codi, limit }),
    ]);

    // Calcular període
    let periodData;
    if (period === 'custom' && customFrom && customTo) {
      periodData = {
        from: new Date(customFrom),
        to: new Date(customTo),
        label: `${customFrom} a ${customTo}`
      };
    } else {
      periodData = calculatePeriod(period);
    }

    if (ui.periodLabel) ui.periodLabel.textContent = periodData.label;

    // Filtrar dades pel període
    const filteredMeteo = filterByPeriod(meteoRows, periodData.from, periodData.to);
    const filteredHidro = filterByPeriod(hidroRows, periodData.from, periodData.to);

    if (ui.meteoCount) ui.meteoCount.textContent = String(filteredMeteo.length);
    if (ui.hidroCount) ui.hidroCount.textContent = String(filteredHidro.length);

    // Calcular estadístiques
    const stats = calculateStats(filteredMeteo);
    if (ui.meteoStats) renderStats(ui.meteoStats, stats);

    // Renderitzar taules
    if (ui.meteoTbody) renderMeteoTable(ui.meteoTbody, filteredMeteo);
    if (ui.hidroTbody) renderHidroTable(ui.hidroTbody, filteredHidro);

    // Renderitzar gràfiques
    if (filteredMeteo.length > 1) {
      const tempPts = buildDaySeries(filteredMeteo, r => num(r.temp_c ?? r.temperature));
      const rainPts = buildDaySeries(filteredMeteo, r => num(r.pluja_event_mm ?? r.rain_event_mm));
      const pressPts = buildDaySeries(filteredMeteo, r => num(r.pressio_rel_hpa ?? r.pressure_hpa ?? r.pressure_rel_hpa));
      const humPts = buildDaySeries(filteredMeteo, r => num(r.humitat_pct ?? r.humidity));

      if (ui.chartTemp) {
        renderLineChart(ui.chartTemp, tempPts, {
          unit: '°C',
          lineColor: '#f59e0b',
          formatY: v => fmt1(v)
        });
      }

      if (ui.chartRain) {
        renderLineChart(ui.chartRain, rainPts, {
          unit: 'mm',
          lineColor: '#3b82f6',
          formatY: v => fmt1(v)
        });
      }

      if (ui.chartPress) {
        renderLineChart(ui.chartPress, pressPts, {
          unit: 'hPa',
          lineColor: '#8b5cf6',
          formatY: v => fmt1(v)
        });
      }

      if (ui.chartHum) {
        renderLineChart(ui.chartHum, humPts, {
          unit: '%',
          lineColor: '#06b6d4',
          formatY: v => Math.round(v).toString()
        });
      }
    }

  } catch (e) {
    if (ui.err) ui.err.textContent = "Error: " + (e.message || e);
  }
}

export function initHistoricsScreen(root, store) {
  const ui = buildHistoricsUI(root);
  let currentPeriod = 'today';

  // Event listeners pels botons de període
  ui.periodButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Actualitzar botons actius
      ui.periodButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const period = btn.dataset.period;
      currentPeriod = period;

      // Mostrar/amagar selector personalitzat
      if (period === 'custom') {
        ui.customDatesDiv.style.display = 'flex';
        
        // Inicialitzar dates per defecte
        const today = new Date().toISOString().split('T')[0];
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekAgoStr = weekAgo.toISOString().split('T')[0];
        
        ui.dateFrom.value = weekAgoStr;
        ui.dateTo.value = today;
      } else {
        ui.customDatesDiv.style.display = 'none';
        refreshHistorics(ui, store, period);
      }
    });
  });

  // Event listener pel botó aplicar dates personalitzades
  if (ui.applyCustom) {
    ui.applyCustom.addEventListener('click', () => {
      const from = ui.dateFrom.value;
      const to = ui.dateTo.value;
      
      if (from && to) {
        refreshHistorics(ui, store, 'custom', from, to);
      }
    });
  }

  // Timer per auto-refresh (només si estem a "Avui")
  let timer = null;
  if (store.get().auto) {
    timer = setInterval(() => {
      if (currentPeriod === 'today') {
        refreshHistorics(ui, store, currentPeriod);
      }
    }, CONFIG.autoRefreshMs);
  }

  // Càrrega inicial
  refreshHistorics(ui, store, currentPeriod);

  return () => {
    if (timer) clearInterval(timer);
  };
}