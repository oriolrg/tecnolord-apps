# Biblioteca Tecnolord

Aplicacio Next.js independent per servir `/biblioteca` i `/biblioteca/admin`.

## Variables

- `BIBLIOTECA_DATABASE_URL`: URL PostgreSQL.
- `BIBLIOTECA_ADMIN_EMAIL`: email de l'administrador inicial.
- `BIBLIOTECA_ADMIN_PASSWORD`: contrasenya inicial per executar el seed.
- `BIBLIOTECA_ADMIN_NAME`: nom visible opcional.
- `BIBLIOTECA_UPLOADS_DIR`: directori intern d'imatges. En Docker es fixa a `/app/uploads`.
- `BIBLIOTECA_MAX_IMAGE_BYTES`: mida maxima d'imatge en bytes. Per defecte, `2097152`.

## Primer desplegament

```bash
docker compose build biblioteca_web
docker compose up -d biblioteca_web caddy
docker compose run --rm \
  -e BIBLIOTECA_ADMIN_PASSWORD \
  biblioteca_web npm run db:seed
```

Les migracions s'apliquen automaticament en arrencar el contenidor.
`BIBLIOTECA_ADMIN_PASSWORD` nomes s'ha de passar al proces de seed, no al runtime permanent de `biblioteca_web`.

## Imatges

Les imatges dels articles es desen fora de la capa efimera del contenidor:

```yaml
./biblioteca/uploads:/app/uploads
```

La URL publica de cada imatge passa per Next.js:

```text
/biblioteca/api/uploads/<nom-intern>
```

Formats permesos inicialment:

- JPEG
- PNG
- WebP

No es permet SVG per defecte.

## Copies de seguretat

Per conservar completament la Biblioteca cal copiar:

- la base de dades PostgreSQL;
- el directori `biblioteca/uploads`.

En restaurar, cal recuperar primer PostgreSQL i despres tornar a deixar `biblioteca/uploads` muntat al servei `biblioteca_web`.
