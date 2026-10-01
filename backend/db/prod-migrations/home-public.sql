-- PROD-01: publish the existing LEGACY Ecowitt station without location/connector inference.
UPDATE meteo.estacions SET visibility='PUBLIC'
WHERE id=1 AND codi='home' AND nom='Casa' AND proveidor='ecowitt'
  AND activa=true AND management_kind='LEGACY' AND lifecycle='ACTIVE'
  AND owner_id IS NULL AND latitud IS NULL AND longitud IS NULL;
UPDATE meteo.public_view_config SET public_station_id=1 WHERE id=1;
