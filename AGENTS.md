# AGENTS.md — Tecnolord / MeteoLord

## Scope

This repository contains several Tecnolord applications.

For MeteoLord tasks:
- inspect only MeteoLord-related files;
- do not scan unrelated applications unless explicitly required;
- prefer the SDD documents listed below as sources of truth.

## MeteoLord sources of truth

General roadmap:
- docs/sdd/ROADMAP-METEOLORD.md

Users and stations:
- docs/sdd/fase-usuaris-estacions/DECISIONS.md
- docs/sdd/fase-usuaris-estacions/TASKS.md

Grafana multistation:
- docs/sdd/fase-grafana-multiestacio/STATE.md
- docs/sdd/fase-grafana-multiestacio/DECISIONS.md
- docs/sdd/fase-grafana-multiestacio/TASKS.md

Production:
- docs/sdd/produccio/STATE.md
- docs/sdd/produccio/PLAN.md
- docs/sdd/produccio/README.md

## Current production baseline

Production application baseline:
- release/commit: 321b8a5
- backend image: meteolord-backend-rc:321b8a5

Current catalog:
- 1 legacy Ecowitt station: code `home`, visible name `TecnoLord`
- 29 Grafana stations
- total: 30 stations

Grafana:
- current snapshots enabled
- periodic refresh every 15 minutes
- no Grafana history enabled
- wind integration is validated locally but is not included in the production baseline

PROD-01:
- COMPLETED / HISTORICAL
- do not rerun it

## Production safety

Never:
- run `docker compose down -v`;
- drop or recreate the production database;
- delete production volumes;
- touch `meteo_restore_test`;
- run fixtures in production;
- run `ALTER DATABASE ... REFRESH COLLATION VERSION`;
- perform global Docker prune;
- expose `.env`, passwords, tokens or API keys;
- make all Grafana stations public;
- enable Grafana history implicitly.

Do not operate production unless the task explicitly requires it.

## Development workflow

For each task:

1. Read only the relevant SDD/task documents.
2. Inspect the minimum required code.
3. Do not redesign previously accepted decisions unless a contradiction is found.
4. Keep changes scoped to the requested task.
5. Add or update focused tests.
6. Run applicable tests and `git diff --check`.
7. Report:
   - files changed;
   - tests run/results;
   - remaining issues;
   - `git status --short`.

Unless explicitly requested:
- do not `git add`;
- do not commit;
- do not push;
- do not SSH;
- do not modify production.

## Efficiency

Avoid broad repository discovery when the relevant files are already known.

Do not reread all SDD documentation for every task. Start from the task-specific
documents and expand only when needed.
