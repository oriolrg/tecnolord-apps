'use strict';

function assessField(field, profile, observedAt, now) {
  const interval = profile?.expected_update_interval_s;
  const freshness_limit_s = Math.max(1800, 3 * (interval || 0));
  const obsolete_limit_s = Math.max(86400, 12 * (interval || 0));
  const instant = Date.parse(observedAt), age = (now - instant) / 1000;
  const freshness = !Number.isFinite(instant) ? 'SENSE_DADES_RECENTS'
    : age > obsolete_limit_s ? 'OBSOLETA' : age > freshness_limit_s ? 'SENSE_DADES_RECENTS' : 'FRESCA';
  const value = field.current_value;
  const suspicious = !profile || field.unit !== profile.unit || !Number.isFinite(instant) || age < -300
    || (value !== null && (!Number.isFinite(value)
      || (profile.valid_range && (value < profile.valid_range[0] || value > profile.valid_range[1]))
      || (field.field_id === 'humidity' && (value < 0 || value > 100))))
    || (Number.isFinite(field.previous_value) && Number.isFinite(profile?.max_rate_of_change)
      && Math.abs(value - field.previous_value) > profile.max_rate_of_change);
  const review = field.review_state === 'EN_REVISIO' || (Array.isArray(field.recent_quality)
    && field.recent_quality.slice(-5).filter((state) => state === 'SOSPITOSA').length >= 3);
  return { quality: suspicious ? 'SOSPITOSA' : 'OK', freshness,
    review: review ? 'EN_REVISIO' : 'NORMAL', freshness_limit_s, obsolete_limit_s,
    reliable: !suspicious && !review && interval > 0 && freshness === 'FRESCA',
    current_value: review || freshness !== 'FRESCA' ? null : value,
    last_value: review ? null : value };
}
module.exports = { assessField };
