create schema if not exists ml;

create table if not exists ml.predictions (
  id bigserial primary key,
  station_id text not null,
  ts timestamptz not null,
  target text not null,
  y_hat double precision not null,
  meta jsonb default '{}'::jsonb,
  unique (station_id, ts, target)
);

create table if not exists ml.features (
  station_id text not null,
  ts timestamptz not null,
  key text not null,
  val double precision,
  primary key (station_id, ts, key)
);
