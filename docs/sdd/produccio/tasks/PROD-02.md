# PROD-02 — Diagnòstic i política de cache mòbil

## Estat

**PENDING.** No iniciada a 2026-10-04. La versió antiga observada en alguns
mòbils no s'ha diagnosticat ni resolt.

## Objectiu i motivació

Determinar per què alguns mòbils serveixen una versió antiga mentre
l'escriptori mostra la release actual, i definir una política de cache que
actualitzi de manera fiable el shell i la configuració sense desactivar
indiscriminadament la cache d'assets immutables.

## Dependències i precondicions

- checkpoint productiu 2026-10-01;
- reproducció controlada abans de modificar configuració;
- inventari de Caddy, headers, `index.html`, `runtime-config.js`, JS/CSS,
  query strings, ETag/Last-Modified i service worker/PWA si existeix.

No depèn de H11–H14 ni d'UE-T19 i es pot diagnosticar en paral·lel.

## Implementació prevista

1. Capturar una reproducció en mòbil o navegador equivalent amb network/cache.
2. Identificar l'objecte antic i la capa que el reté.
3. Definir revalidació/no-cache per HTML i configuració runtime.
4. Aplicar cache llarga només a assets realment fingerprinted/versionats.
5. Afegir una prova de canvi de versió entre dos deploys.

Fitxers probables: configuració Caddy, HTML, runtime config, pipeline d'assets
i proves HTTP/E2E. La causa real decidirà l'abast.

## Tests i PASS

- reproducció inicial documentada;
- headers i versions verificats per `/meteo/` i `/meteo/compte/`;
- navegador amb cache prèvia obté la versió nova sense esborrat manual;
- assets immutables mantenen cache eficient quan tenen versió;
- desktop i mòbil PASS, sense regressió offline ni CSP.

## Risc i reversió

Una política massa agressiva pot servir HTML antic amb JS nou o incrementar
trànsit. Revertir només headers/versionat de PROD-02; conservar la release i
les dades. No tocar BD.
