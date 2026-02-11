// backend/utils/previ.js
function normalizeOpenMeteoModel(raw) {
  const s = String(raw ?? '').trim().toLowerCase();
  if (!s) return null;

  const map = {
    'best': 'best_match',
    'bestmatch': 'best_match',
    'best_match': 'best_match',
    'default': 'best_match',
    'icon': 'icon_global',
    'icon-global': 'icon_global',
    'icon_global': 'icon_global',
    'icon eu': 'icon_eu',
    'icon-eu': 'icon_eu',
    'icon_eu': 'icon_eu',
    'icon d2': 'icon_d2',
    'icon-d2': 'icon_d2',
    'icon_d2': 'icon_d2',
    'icon seamless': 'icon_seamless',
    'icon-seamless': 'icon_seamless',
    'icon_seamless': 'icon_seamless',
  };

  if (map[s]) return map[s];
  if (/^[a-z0-9_]+$/.test(s)) return s;
  return null;
}

module.exports = { normalizeOpenMeteoModel };
