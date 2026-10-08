# PROD-03 — Collation PostgreSQL

## Estat

**DEFERRED / PENDING.** Incidència coneguda a 2026-10-04; no forma part del
següent bloc funcional. La base registra collation 2.41 i el sistema ofereix
2.31. No s'ha executat `REFRESH COLLATION VERSION`.

## Objectiu

Analitzar la divergència entre collation registrada 2.41 i sistema 2.31,
identificar objectes/índexs afectats i preparar una correcció provada en clon.

## Dependències i precondicions

- backup nou i verificat;
- inventari read-only de collation, índexs i objectes dependents;
- clon restaurat i aïllat;
- procediment de verificació i reversió.

## Implementació prevista

Primer diagnòstic read-only; després candidat sobre clon. No executar
`ALTER DATABASE meteo REFRESH COLLATION VERSION` automàticament ni barrejar
aquesta feina amb una release funcional.

## Tests i PASS

Comparar ordenació/índexs abans i després al clon, reconstruir només els
objectes demostrats, executar regressió completa i documentar rollback.
Producció només pot considerar-se en una tasca posterior explícitament
autoritzada.

## Riscos i reversió

Canvis de collation poden invalidar índexs o alterar ordenacions. La reversió
és restaurar el clon durant l'assaig; no hi ha cap acció productiva en
PROD-03 mentre estigui DEFERRED.
