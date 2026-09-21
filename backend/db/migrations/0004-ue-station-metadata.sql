-- UE-T05: user-facing metadata remains separate from connector and location data.
ALTER TABLE meteo.estacions
  ADD COLUMN description TEXT
    CONSTRAINT estacions_description_length_check
      CHECK (description IS NULL OR char_length(description) <= 500);

