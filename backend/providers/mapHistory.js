'use strict';

const PERIODS = { '24h': 24, '7d': 168, '30d': 720 };
const METHODS = new Set(['mean', 'sum', 'min', 'max', 'last', 'circular', 'counter_diff']);
const RESOLUTIONS = { raw: 0, hourly: 3600000, daily: 86400000 };
function invalid() { throw new RangeError('invalid_history_query'); }

function resolveHistoryQuery(profile, { period = '24h', start, end } = {}, now = Date.now()) {
  if (!profile || profile.history_enabled !== true || !profile.retention_policy_ref) return null;
  if (!profile.profile_version || profile.default_period !== '24h'
    || !Array.isArray(profile.allowed_periods) || !profile.allowed_periods.includes(period)
    || !Array.isArray(profile.allowed_resolutions) || !METHODS.has(profile.aggregation_method)
    || profile.pre_aggregation_transform !== null
    || !['UTC', 'station'].includes(profile.timezone_policy)
    || !['null', 'partial'].includes(profile.missing_data_policy)
    || !Number.isFinite(profile.min_coverage_policy) || profile.min_coverage_policy < 0 || profile.min_coverage_policy > 1
    || !Number.isInteger(profile.max_points_policy) || profile.max_points_policy < 1) invalid();
  let to = now, from, resolution;
  if (period === 'custom') {
    if (typeof start !== 'string' || typeof end !== 'string'
      || !start.endsWith('Z') || !end.endsWith('Z')) invalid();
    from = Date.parse(start); to = Date.parse(end);
    if (!Number.isFinite(from) || !Number.isFinite(to) || to <= from) invalid();
    const rule = profile.custom_resolution_rules?.find((entry) =>
      Number.isInteger(entry.max_window_hours) && entry.max_window_hours > 0 && (to - from) <= entry.max_window_hours * 3600000);
    if (!rule) invalid();
    resolution = rule.resolution;
  } else {
    if (!PERIODS[period]) invalid();
    from = to - PERIODS[period] * 3600000;
    resolution = profile.resolution_policy?.[period];
  }
  const maxHours = PERIODS[profile.max_query_window];
  if (!maxHours || to - from > maxHours * 3600000 || to > now
    || !Object.hasOwn(RESOLUTIONS, resolution) || !profile.allowed_resolutions.includes(resolution)
    || (resolution === 'raw' && !profile.raw_history_allowed)) invalid();
  // MAP-A profiles use UTC. Station calendars require a declared zone; do not
  // silently aggregate station days as UTC (notably at DST boundaries).
  if (profile.timezone_policy === 'station' && profile.timezone !== 'UTC') invalid();
  return { from, to, resolution, timezone: 'UTC' };
}

function aggregate(values, method) {
  if (!values.length) return null;
  switch (method) {
    case 'sum': return values.reduce((a, b) => a + b, 0);
    case 'min': return Math.min(...values);
    case 'max': return Math.max(...values);
    case 'last': return values.at(-1);
    case 'circular': {
      const sin = values.reduce((a, b) => a + Math.sin(b * Math.PI / 180), 0);
      const cos = values.reduce((a, b) => a + Math.cos(b * Math.PI / 180), 0);
      return Math.hypot(sin, cos) < 1e-10 ? null : (Math.atan2(sin, cos) * 180 / Math.PI + 360) % 360;
    }
    case 'counter_diff': {
      if (values.length < 2) return null;
      let sum = 0;
      for (let i = 1; i < values.length; i++) {
        if (values[i] < values[i - 1]) return null; // Reset has no declared transform.
        sum += values[i] - values[i - 1];
      }
      return sum;
    }
    default: return values.reduce((a, b) => a + b, 0) / values.length;
  }
}

function buildHistory({ field, profile, observations = [], query = {}, now = Date.now(), intervalSeconds = 300 }) {
  if (!field || field.publication_class !== 'PUBLIC_ALLOWED' || field.defect_01_affected !== false
    || !field.history_profile_id || field.history_profile_id !== profile?.history_profile_id) return null;
  const range = resolveHistoryQuery(profile, query, now);
  if (!range) return null;
  if (!(intervalSeconds > 0)) invalid();
  const filtered = observations.filter((row) => row.publication_class === 'PUBLIC_ALLOWED'
    && row.defect_01_affected === false && row.quality === 'OK'
    && Number.isFinite(row.value) && Date.parse(row.instant) >= range.from && Date.parse(row.instant) < range.to)
    .sort((a, b) => Date.parse(a.instant) - Date.parse(b.instant));
  const unique = [...new Map(filtered.map((row) => [row.instant, row])).values()];
  let buckets;
  if (range.resolution === 'raw') {
    buckets = unique.map((row) => ({ instant: row.instant, value: row.value, n_valid: 1, n_expected: 1, coverage: 1, partial: false }));
  } else {
    const step = RESOLUTIONS[range.resolution];
    if (Math.ceil((range.to - range.from) / step) + 1 > profile.max_points_policy) invalid();
    buckets = [];
    for (let t = Math.floor(range.from / step) * step; t < range.to; t += step) {
      const rows = unique.filter((row) => Date.parse(row.instant) >= t && Date.parse(row.instant) < t + step);
      const n_expected = Math.ceil((Math.min(t + step, range.to) - Math.max(t, range.from)) / (intervalSeconds * 1000));
      const n_valid = rows.length, coverage = Math.min(1, n_valid / n_expected);
      const partial = coverage < profile.min_coverage_policy;
      buckets.push({ instant: new Date(t).toISOString(), value: partial && profile.missing_data_policy === 'null'
        ? null : aggregate(rows.map((row) => row.value), profile.aggregation_method), n_valid, n_expected, coverage, partial });
    }
  }
  if (buckets.length > profile.max_points_policy) invalid();
  return { period: query.period || '24h', resolution: range.resolution, timezone: range.timezone,
    profile_version: profile.profile_version, unit: field.unit, buckets };
}
module.exports = { resolveHistoryQuery, aggregate, buildHistory };
