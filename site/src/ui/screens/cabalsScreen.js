import { CONFIG } from "../../config.js";
import { $ } from "../dom.js";
import { card } from "../components/card.js";
import { num, fmt1, clamp, fmtTime, norm } from "../format.js";
import { fetchHidro } from "../../services/hidroService.js";
import { renderHidroTable } from "../components/tableHidro.js";
import { renderLineChart, buildDaySeries } from "../components/lineChart.js";

function buildCabalsUI(root) {
  root.innerHTML = `
    <div class="wrap">
      <div class="section-title">
        <h2>Cabals</h2>
        <p style="margin-top:6px; color: var(--muted);">Informació en temps real dels cabals i capacitat de la Llosa del Cavall.</p>
      </div>

      <!-- Selector de període -->
      <div class="period-selector">
        <button class="period-btn active" data-period="today" type="button">Avui</button>
        <button class="period-btn" data-period="yesterday" type="button">Ahir</button>
        <button class="period-btn" data-period="7days" type="button">7 dies</button>
        <button class="period-btn" data-period="30days" type="button">30 dies</button>
        <button class="period-btn" data-period="custom" type="button">Personalitzat</button>
      </div>

      <!-- Selector de dates personalitzat -->
      <div id="custom-dates-hidro" class="custom-dates" style="display:none;">
        <label>
          <span>Des de:</span>
          <input type="date" id="date-from-hidro" />
        </label>
        <label>
          <span>Fins:</span>
          <input type="date" id="date-to-hidro" />
        </label>
        <button class="btn" id="apply-custom-hidro" type="button">Aplicar</button>
      </div>

      <div class="status-row">
        <span class="pill"><span class="dot"></span><span id="hidro-last">Sense dades encara</span></span>
        <span id="hidro-err" class="err" role="alert" aria-live="polite"></span>
      </div>

      <!-- Cards principals (dades actuals) -->
      <div class="grid" id="hidro-cards"></div>

      <!-- Estadístiques del període -->
      <div class="stats-grid" id="hidro-stats"></div>

      <!-- Gràfiques -->
      <div class="charts-section">
        <h3>Evolució Capacitat (%)</h3>
        <div class="chart-container">
          <canvas id="chart-hidro-cap" style="width:100%; height:220px;"></canvas>
        </div>
      </div>

      <div class="charts-section">
        <h3>Evolució Cabal Sortida (m³/s)</h3>
        <div class="chart-container">
          <canvas id="chart-hidro-sortida" style="width:100%; height:220px;"></canvas>
        </div>
      </div>

      <div class="charts-section">
        <h3>Evolució Entrades - Cardener i Valls (m³/s)</h3>
        <div class="chart-container">
          <canvas id="chart-hidro-entrades" style="width:100%; height:220px;"></canvas>
        </div>
      </div>

      <!-- Taula detallada (plegable) -->
      <details style="margin-top:22px">
        <summary>Dades detallades (hidro) <span class="badge" id="hidro-count">0</span></summary>
        <div class="detail-body">
          <div class="table-wrap">
            <table id="tbl-hidro" aria-label="Taula d'hidrologia">
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
    last: $("#hidro-last", root),
    err: $("#hidro-err", root),
    cards: $("#hidro-cards", root),
    stats: $("#hidro-stats", root),
    count: $("#hidro-count", root),
    tbody: $("#tbl-hidro tbody", root),
    chartCap: $("#chart-hidro-cap", root),
    chartSortida: $("#chart-hidro-sortida", root),
    chartEntrades: $("#chart-hidro-entrades", root),
    periodButtons: root.querySelectorAll(".period-btn"),
    customDatesDiv: $("#custom-dates-hidro", root),
    dateFrom: $("#date-from-hidro", root),
    dateTo: $("#date-to-hidro", root),
    applyCustom: $("#apply-custom-hidro", root),
  };
}

function pickRow(rows, predicates) {
  for (const pred of predicates) {
    const found = rows.find(pred);
    if (found) return found;
  }
  return null;
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
    const ts = r.instant;
    if (!ts) return false;
    const d = new Date(ts);
    return d >= from && d <= to;
  });
}

function calculateHidroStats(rows) {
  // Filtra per tipus
  const llosaRows = rows.filter(r => 
    norm(r.nom).includes("llosa") || norm(r.nom).includes("cavall")
  );
  const cardenerRows = rows.filter(r => norm(r.nom).includes("cardener"));
  const vallsRows = rows.filter(r => norm(r.nom).includes("valls"));

  const caps = llosaRows.map(r => num(r.capacitat_pct)).filter(v => v != null);
  const sortides = llosaRows.map(r => num(r.cabal_m3s)).filter(v => v != null);
  const cardeners = cardenerRows.map(r => num(r.cabal_m3s)).filter(v => v != null);
  const valls = vallsRows.map(r => num(r.cabal_m3s)).filter(v => v != null);

  return {
    capMin: caps.length ? Math.min(...caps) : null,
    capMax: caps.length ? Math.max(...caps) : null,
    capAvg: caps.length ? caps.reduce((a,b) => a+b, 0) / caps.length : null,
    
    sortidaMin: sortides.length ? Math.min(...sortides) : null,
    sortidaMax: sortides.length ? Math.max(...sortides) : null,
    sortidaAvg: sortides.length ? sortides.reduce((a,b) => a+b, 0) / sortides.length : null,
    
    cardenerMin: cardeners.length ? Math.min(...cardeners) : null,
    cardenerMax: cardeners.length ? Math.max(...cardeners) : null,
    cardenerAvg: cardeners.length ? cardeners.reduce((a,b) => a+b, 0) / cardeners.length : null,
    
    vallsMin: valls.length ? Math.min(...valls) : null,
    vallsMax: valls.length ? Math.max(...valls) : null,
    vallsAvg: valls.length ? valls.reduce((a,b) => a+b, 0) / valls.length : null,
  };
}

function renderHidroStats(container, stats) {
  container.innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Capacitat (%)</div>
      <div class="stat-values">
        <span class="stat-max">Màx: ${stats.capMax != null ? fmt1(stats.capMax) + ' %' : '—'}</span>
        <span class="stat-avg">Mitjana: ${stats.capAvg != null ? fmt1(stats.capAvg) + ' %' : '—'}</span>
        <span class="stat-min">Mín: ${stats.capMin != null ? fmt1(stats.capMin) + ' %' : '—'}</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-label">Sortida (m³/s)</div>
      <div class="stat-values">
        <span class="stat-max">Màx: ${stats.sortidaMax != null ? fmt1(stats.sortidaMax) + ' m³/s' : '—'}</span>
        <span class="stat-avg">Mitjana: ${stats.sortidaAvg != null ? fmt1(stats.sortidaAvg) + ' m³/s' : '—'}</span>
        <span class="stat-min">Mín: ${stats.sortidaMin != null ? fmt1(stats.sortidaMin) + ' m³/s' : '—'}</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-label">Cardener (m³/s)</div>
      <div class="stat-values">
        <span class="stat-max">Màx: ${stats.cardenerMax != null ? fmt1(stats.cardenerMax) + ' m³/s' : '—'}</span>
        <span class="stat-avg">Mitjana: ${stats.cardenerAvg != null ? fmt1(stats.cardenerAvg) + ' m³/s' : '—'}</span>
        <span class="stat-min">Mín: ${stats.cardenerMin != null ? fmt1(stats.cardenerMin) + ' m³/s' : '—'}</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-label">Valls (m³/s)</div>
      <div class="stat-values">
        <span class="stat-max">Màx: ${stats.vallsMax != null ? fmt1(stats.vallsMax) + ' m³/s' : '—'}</span>
        <span class="stat-avg">Mitjana: ${stats.vallsAvg != null ? fmt1(stats.vallsAvg) + ' m³/s' : '—'}</span>
        <span class="stat-min">Mín: ${stats.vallsMin != null ? fmt1(stats.vallsMin) + ' m³/s' : '—'}</span>
      </div>
    </div>
  `;
}

async function refreshCabals(ui, store, period = 'today', customFrom = null, customTo = null) {
  if (ui.err) ui.err.textContent = "";

  const s = store.get();
  const codi = (s.codiHidro || "").trim();
  const limit = period === '30days' ? 500 : period === '7days' ? 350 : 200;

  try {
    const hidroRows = await fetchHidro({ codi, limit });

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

    // Filtrar dades pel període
    const filteredHidro = filterByPeriod(hidroRows, periodData.from, periodData.to);

    if (ui.count) ui.count.textContent = String(filteredHidro.length);
    if (ui.cards) ui.cards.innerHTML = "";

    if (!filteredHidro.length) {
      if (ui.last) ui.last.textContent = "Sense dades";
      return;
    }

    // --- CARDS AMB DADES ACTUALS (últim registre) ---
    const rowLlosa = pickRow(hidroRows, [
      r => norm(r.nom).includes("llosa") || norm(r.nom).includes("cavall"),
    ]);

    const rowCardener = pickRow(hidroRows, [
      r => norm(r.nom).includes("cardener"),
    ]);

    const rowValls = pickRow(hidroRows, [
      r => norm(r.nom).includes("valls"),
    ]);

    const cap = num(rowLlosa?.capacitat_pct);
    const cabalCardener = num(rowCardener?.cabal_m3s);
    const cabalValls = num(rowValls?.cabal_m3s);
    const entradaTotal = (cabalCardener ?? 0) + (cabalValls ?? 0);
    const sortida = num(rowLlosa?.cabal_m3s);
    const delta = (sortida == null ? null : (entradaTotal - sortida));

    let deltaHtml = "";
    if (sortida != null && (cabalCardener != null || cabalValls != null)) {
      const cls = delta >= 0 ? "ok" : "bad";
      const txt = delta >= 0 ? "S'omple" : "Es buida";
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
      badge: rowLlosa?.nom || "Últim",
      subHtml: `
        ${deltaHtml}
        ${rowLlosa?.instant ? `<span class="sep"></span>Hora: <strong>${fmtTime(rowLlosa.instant)}</strong>` : ""}
      `,
    });

    const cCap = card({
      title: "Capacitat",
      value: cap == null ? "—" : fmt1(cap),
      unit: "%",
      badge: rowLlosa?.nom || "Últim",
      subHtml: rowLlosa?.nom ? `Estació: <strong>${rowLlosa.nom}</strong>` : "",
    });

    const entradesParts = [];
    if (cabalCardener != null) {
      entradesParts.push(`
        <span>Cardener: <strong>${fmt1(cabalCardener)} m³/s</strong>
        ${rowCardener?.instant ? ` · <span class="muted">${fmtTime(rowCardener.instant)}</span>` : ""}
        </span>
      `);
    }
    if (cabalValls != null) {
      entradesParts.push(`
        <span>Valls: <strong>${fmt1(cabalValls)} m³/s</strong>
        ${rowValls?.instant ? ` · <span class="muted">${fmtTime(rowValls.instant)}</span>` : ""}
        </span>
      `);
    }

    const cEntrades = card({
      title: "Entrades (rius)",
      value: (cabalCardener == null && cabalValls == null) ? "—" : fmt1(entradaTotal),
      unit: "m³/s",
      badge: "Total",
      subHtml: entradesParts.length ? entradesParts.join(`<span class="sep"></span>`) : "",
    });

    if (ui.cards) ui.cards.append(cCabal, cCap, cEntrades);

    // Actualitzar temps
    const refInstant = rowCardener?.instant || rowValls?.instant || rowLlosa?.instant;
    if (refInstant) {
      const ageSec = Math.max(0, Math.round((Date.now() - new Date(refInstant).getTime()) / 1000));
      const ageTxt =
        ageSec < 60 ? `${ageSec} s` :
        ageSec < 3600 ? `${Math.round(ageSec / 60)} min` :
        `${Math.round(ageSec / 3600)} h`;
      if (ui.last) ui.last.textContent = `${periodData.label} · Actualitzat fa ${ageTxt}`;
    } else {
      if (ui.last) ui.last.textContent = periodData.label;
    }

    // --- ESTADÍSTIQUES DEL PERÍODE ---
    const stats = calculateHidroStats(filteredHidro);
    if (ui.stats) renderHidroStats(ui.stats, stats);

    // --- GRÀFIQUES ---
    if (filteredHidro.length > 1) {
      // Capacitat
      const llosaRows = filteredHidro.filter(r => 
        norm(r.nom).includes("llosa") || norm(r.nom).includes("cavall")
      );
      const capPts = buildDaySeries(llosaRows, r => num(r.capacitat_pct));

      if (ui.chartCap) {
        renderLineChart(ui.chartCap, capPts, {
          unit: '%',
          lineColor: '#10b981',
          formatY: v => fmt1(v)
        });
      }

      // Sortida
      const sortidaPts = buildDaySeries(llosaRows, r => num(r.cabal_m3s));
      if (ui.chartSortida) {
        renderLineChart(ui.chartSortida, sortidaPts, {
          unit: 'm³/s',
          lineColor: '#f59e0b',
          formatY: v => fmt1(v)
        });
      }

      // Entrades (múltiples línies - però com que renderLineChart només suporta 1, fem Cardener)
      const cardenerRows = filteredHidro.filter(r => norm(r.nom).includes("cardener"));
      const vallsRows = filteredHidro.filter(r => norm(r.nom).includes("valls"));
      
      const cardenerPts = buildDaySeries(cardenerRows, r => num(r.cabal_m3s));
      const vallsPts = buildDaySeries(vallsRows, r => num(r.cabal_m3s));

      // Combinem les dues sèries sumant-les (entrada total)
      const entradesPts = [];
      const allTimes = new Set([
        ...cardenerPts.map(p => p.t.getTime()),
        ...vallsPts.map(p => p.t.getTime())
      ]);

      Array.from(allTimes).sort((a,b) => a-b).forEach(time => {
        const cPt = cardenerPts.find(p => p.t.getTime() === time);
        const vPt = vallsPts.find(p => p.t.getTime() === time);
        const total = (cPt?.y ?? 0) + (vPt?.y ?? 0);
        if (total > 0) {
          entradesPts.push({ t: new Date(time), y: total });
        }
      });

      if (ui.chartEntrades) {
        renderLineChart(ui.chartEntrades, entradesPts, {
          unit: 'm³/s',
          lineColor: '#3b82f6',
          formatY: v => fmt1(v)
        });
      }
    }

    // --- TAULA ---
    if (ui.tbody) renderHidroTable(ui.tbody, filteredHidro);

  } catch (e) {
    if (ui.err) ui.err.textContent = "Error: " + (e.message || e);
  }
}

export function initCabalsScreen(root, store) {
  const ui = buildCabalsUI(root);
  let currentPeriod = 'today';

  // Event listeners pels botons de període
  ui.periodButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      ui.periodButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const period = btn.dataset.period;
      currentPeriod = period;

      if (period === 'custom') {
        ui.customDatesDiv.style.display = 'flex';
        const today = new Date().toISOString().split('T')[0];
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekAgoStr = weekAgo.toISOString().split('T')[0];
        ui.dateFrom.value = weekAgoStr;
        ui.dateTo.value = today;
      } else {
        ui.customDatesDiv.style.display = 'none';
        refreshCabals(ui, store, period);
      }
    });
  });

  if (ui.applyCustom) {
    ui.applyCustom.addEventListener('click', () => {
      const from = ui.dateFrom.value;
      const to = ui.dateTo.value;
      if (from && to) {
        refreshCabals(ui, store, 'custom', from, to);
      }
    });
  }

  let timer = null;
  if (store.get().auto) {
    timer = setInterval(() => {
      if (currentPeriod === 'today') {
        refreshCabals(ui, store, currentPeriod);
      }
    }, CONFIG.autoRefreshMs);
  }

  refreshCabals(ui, store, currentPeriod);

  return () => {
    if (timer) clearInterval(timer);
  };
}