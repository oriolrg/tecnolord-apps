# Biblioteca Tecnolord

Aplicacio Next.js independent per servir `/biblioteca` i `/biblioteca/admin`.

## Variables

- `BIBLIOTECA_DATABASE_URL`: URL PostgreSQL.
- `BIBLIOTECA_ADMIN_EMAIL`: email de l'administrador inicial.
- `BIBLIOTECA_ADMIN_PASSWORD`: contrasenya inicial per executar el seed.
- `BIBLIOTECA_ADMIN_NAME`: nom visible opcional.

## Primer desplegament

```bash
docker compose build biblioteca_web
docker compose up -d biblioteca_web caddy
docker compose exec biblioteca_web npm run db:seed
```

Les migracions s'apliquen automaticament en arrencar el contenidor.
