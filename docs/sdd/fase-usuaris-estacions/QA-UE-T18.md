# QA UE-T18 — Gate final amb històrics i decisions adoptades

Data d’execució: 2026-09-23. Estat: **FETA**, amb límits de publicació i G06-09 declarats pendents.

## Resultat del gate final

El run aïllat definitiu `20260923-075000-98bf3dd` ha passat **19/19 controls**. Ha creat una BD PostGIS sintètica nova, ha aplicat les set migracions fins a 0007, ha carregat fixtures, ha comprovat backend, frontend, salut amb caiguda i recuperació de PostgreSQL, tasques, reexecució idempotent, egress, secrets, caracterització de zero, Playwright i neteja. El projecte temporal ha acabat sense contenidors, xarxes ni volums. Vegeu [gate-report.json](../../../artifacts/phase-a/98bf3dd1624e209c0bcdfef8c05ae9ec4e47450a/20260923-075000-98bf3dd/gate-report.json), [gate-run.txt](../../../artifacts/phase-a/98bf3dd1624e209c0bcdfef8c05ae9ec4e47450a/20260923-075000-98bf3dd/gate-run.txt) i [cleanup-verification.txt](../../../artifacts/phase-a/98bf3dd1624e209c0bcdfef8c05ae9ec4e47450a/20260923-075000-98bf3dd/cleanup-verification.txt).

El control Playwright del gate ha passat **13/13** recorreguts: shell, Meteo, Cabals, Històrics, Previsió, egress, CSP, etiquetes i navegació, edat de dades, gràfics, viewport 375 px, teclat i ping. Els onze recorreguts especialitzats UE-T01–17 també han passat consecutivament a 375 px, sense peticions externes ni errors de pàgina, inclosa la configuració de dues polítiques d’històric i la previsualització legacy. Vegeu [control 17](../../../artifacts/phase-a/98bf3dd1624e209c0bcdfef8c05ae9ec4e47450a/20260923-075000-98bf3dd/controls/17.txt) i [specialized-final.txt](../../../artifacts/phase-a/98bf3dd1624e209c0bcdfef8c05ae9ec4e47450a/20260923-075000-98bf3dd/specialized-final.txt).

La regressió Node amb totes les integracions actives ha passat **257/257**, 0 FAIL, 0 CANCELLED, 0 SKIP i 0 TODO. Inclou dues retencions diferents, estació sense política, concurrència, dades antigues, tall exacte, rollback d’una purga fallida amb continuació de les altres estacions, preservació legacy i matriu de lectura d’històric. Cobertura global: 95,16 % línies, 82,22 % branques i 91,80 % funcions. [Sortida TAP](../../../artifacts/phase-a/98bf3dd1624e209c0bcdfef8c05ae9ec4e47450a/20260923-074500-98bf3dd/coverage/tap-output.txt).

La BD local `meteolord_local` té la migració 0007 aplicada. El backend de `8088` s’ha restaurat després del gate i està `running healthy`. Una invocació autenticada del worker local ha retornat 200 amb `captures: []` i `purges: []`, perquè encara no hi ha cap política real activada; per tant la comprovació no ha escrit ni eliminat mesures.

## Traçabilitat final UE-R01–12

| Requisit | Acceptació | Evidència principal |
|---|---|---|
| UE-R01 | UE-CA01 | Identitat, sol·licitud, verificació, aprovació, recuperació i revocació a UE-T03/04 |
| UE-R02 | UE-CA02 | Catàleg propi, Ecowitt write-only, snapshots i retirada a UE-T05–07 |
| UE-R03 | UE-CA03 | Preferència persistent, selecció temporal i fallback a UE-T09 |
| UE-R04 | UE-CA04 | Estació i ordre/subconjunt de targetes globals a UE-T10 |
| UE-R05 | UE-CA05 | Geometria generalitzada, capa privada, revocació i superfícies coherents a UE-T08 |
| UE-R06 | UE-CA06 | Catàleg administrat, coordenades/procedència i auditoria a UE-T11 |
| UE-R07 | UE-CA07 | Inventari, dry-run, quarantena, conflictes i Grafana intern a UE-T12–14 |
| UE-R08 | UE-CA08 | Sis estimacions exactes i etiquetades a UE-T15 |
| UE-R09 | UE-CA09 | Zero/null, frescor, error parcial i separació observació/estimació a UE-T07/14/15 |
| UE-R10 | UE-CA10 | Matrius d’autorització, IDOR, CSRF, secrets, egress i rutes admin de UE-T03–17 |
| UE-R11 | UE-CA11 | Upgrade legacy, mode offline, 257/257, gate 19/19, Playwright 13/13 i onze recorreguts especialitzats |
| UE-R12 | UE-CA12 | Política per estació, 15/30 i 60/90, captura idempotent, retenció, previsualització legacy i lectura autoritzada a UE-T17 |

## Límits i requisits previs a una publicació

La fase funcional local queda verificada, però això no declara el sistema preparat per a producció. Grafana real continua `INTERNAL_ONLY` i sense persistència o republicació fins validar credencials, límits, catàleg accessible i drets de reutilització. El transport de correu continua sent la bústia sintètica local i s’ha de substituir abans de publicar. Les polítiques d’històric reals s’han d’activar explícitament per un administrador després de confirmar els drets de la font i configurar el planificador operatiu que invoqui el worker.

G06-09 continua **PENDENT** perquè requereix una auditoria manual WCAG 2.2 AA completa. El gate acredita navegació principal per teclat, etiquetes bàsiques, alternativa textual al mapa, viewport de 375 px sense desbordament, CSP i absència d’errors de pàgina; aquestes comprovacions no equivalen a una declaració de conformitat WCAG.
