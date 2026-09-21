-- UE-T08: persistent location publication and monotonic map invalidation.
ALTER TABLE meteo.station_locations
  ADD COLUMN geo_policy_version TEXT NOT NULL DEFAULT 'ue-user-grid-v1',
  ADD COLUMN publication_consent_at TIMESTAMPTZ,
  ADD COLUMN consent_revoked_at TIMESTAMPTZ,
  ADD COLUMN revision BIGINT NOT NULL DEFAULT 0 CHECK (revision >= 0),
  ADD CONSTRAINT station_locations_geometry_policy_check CHECK (
    (publication_mode = 'HIDDEN' AND public_geometry IS NULL)
    OR (publication_mode <> 'HIDDEN' AND private_geometry IS NOT NULL AND public_geometry IS NOT NULL)
  ),
  ADD CONSTRAINT station_locations_private_bounds_check CHECK (
    private_geometry IS NULL OR (
      public.ST_X(private_geometry) BETWEEN -180 AND 180
      AND public.ST_Y(private_geometry) BETWEEN -90 AND 90
    )
  ),
  ADD CONSTRAINT station_locations_public_bounds_check CHECK (
    public_geometry IS NULL OR (
      public.ST_X(public_geometry) BETWEEN -180 AND 180
      AND public.ST_Y(public_geometry) BETWEEN -90 AND 90
    )
  );

CREATE TABLE meteo.map_catalog_state (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  revision BIGINT NOT NULL DEFAULT 1 CHECK (revision >= 1),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO meteo.map_catalog_state(id) VALUES (1);
