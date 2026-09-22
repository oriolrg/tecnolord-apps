-- UE-T15: six explicit model reference points. Coordinates are WGS84 civic-centre
-- references, not weather-station locations. Andorra intentionally means Andorra la Vella.
INSERT INTO meteo.estimation_points(
  id,slug,label,reference_geometry,reference_label,reference_provenance,provider,enabled
) VALUES
  ('15000000-0000-4000-8000-000000000001','manresa','Manresa',public.ST_SetSRID(public.ST_MakePoint(1.82399,41.72815),4326),'Manresa','WGS84 civic-centre reference; reviewed 2026-09-21','OPEN_METEO',true),
  ('15000000-0000-4000-8000-000000000002','solsona','Solsona',public.ST_SetSRID(public.ST_MakePoint(1.51706,41.99389),4326),'Solsona','WGS84 civic-centre reference; reviewed 2026-09-21','OPEN_METEO',true),
  ('15000000-0000-4000-8000-000000000003','berga','Berga',public.ST_SetSRID(public.ST_MakePoint(1.84628,42.10429),4326),'Berga','WGS84 civic-centre reference; reviewed 2026-09-21','OPEN_METEO',true),
  ('15000000-0000-4000-8000-000000000004','vic','Vic',public.ST_SetSRID(public.ST_MakePoint(2.25486,41.93012),4326),'Vic','WGS84 civic-centre reference; reviewed 2026-09-21','OPEN_METEO',true),
  ('15000000-0000-4000-8000-000000000005','la-seu-durgell','La Seu d’Urgell',public.ST_SetSRID(public.ST_MakePoint(1.46144,42.35877),4326),'La Seu d’Urgell','WGS84 civic-centre reference; reviewed 2026-09-21','OPEN_METEO',true),
  ('15000000-0000-4000-8000-000000000006','andorra','Andorra',public.ST_SetSRID(public.ST_MakePoint(1.52184,42.50632),4326),'Andorra la Vella','WGS84 civic-centre reference fixed by UE-D03; reviewed 2026-09-21','OPEN_METEO',true);

UPDATE meteo.estimation_points
SET enabled=false,updated_at=now()
WHERE slug NOT IN ('manresa','solsona','berga','vic','la-seu-durgell','andorra');

UPDATE meteo.map_catalog_state SET revision=revision+1,updated_at=now() WHERE id=1;
