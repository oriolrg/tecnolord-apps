function parsePeriodWindow(period) {
  const now = new Date();
  const end = now;
  let start = null;

  const startOfTodayUTC = () =>
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));

  switch ((period || '').toLowerCase()) {
    case 'last24h':
      start = new Date(now.getTime() - 24 * 3600 * 1000);
      return { start, end };
    case 'today':
      start = startOfTodayUTC();
      return { start, end };
    case 'yesterday': {
      const s = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1, 0, 0, 0));
      const e = startOfTodayUTC();
      return { start: s, end: e };
    }
    case 'last7d':
      start = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
      return { start, end };
    case 'last30d':
      start = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
      return { start, end };
    default:
      return { start: null, end: null };
  }
}

function parseFromTo(from, to) {
  const start = from ? new Date(from) : null;
  const end = to ? new Date(to) : null;
  if (start && Number.isNaN(start.getTime())) return { start: null, end: null };
  if (end && Number.isNaN(end.getTime())) return { start: null, end: null };
  return { start, end };
}

function getWindowFromQuery(req) {
  const period = req.query.period || null;
  const from = req.query.from || null;
  const to = req.query.to || null;

  if (from || to) return { ...parseFromTo(from, to), source: 'fromto' };
  if (period) return { ...parsePeriodWindow(period), source: 'period' };
  return { start: null, end: null, source: 'none' };
}

module.exports = { parsePeriodWindow, parseFromTo, getWindowFromQuery };
