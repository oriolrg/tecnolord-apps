# QA UE-T16 — Verificació integrada i dossier de continuació

Data d’execució: 2026-09-23. Estat: **FETA**, amb G06-09 manual declarat pendent.

## Resultat del gate

La passada final `20260923-003500-98bf3dd` ha creat una BD PostGIS sintètica nova, ha aplicat les sis migracions, ha carregat fixtures, ha comprovat salut amb caiguda i recuperació de la BD, idempotència, tasques, egress, secrets, frontend i neteja. Els **19/19 controls han passat** i el projecte temporal no ha deixat contenidors, xarxes ni volums. El [report del gate](../../../artifacts/phase-a/98bf3dd1624e209c0bcdfef8c05ae9ec4e47450a/20260923-003500-98bf3dd/gate-report.json) i el [registre complet](../../../artifacts/phase-a/98bf3dd1624e209c0bcdfef8c05ae9ec4e47450a/20260923-003500-98bf3dd/gate-run.txt) en conserven l’evidència.

La regressió Playwright inclosa al gate ha passat **13/13** casos en un únic backend sintètic: portada, Meteo, Cabals, Històrics, Previsió, CSP i egress, edat de les dades, gràfics, viewport de 375 × 812 px sense desbordament, navegació per teclat i ping. El detall és al [control 17](../../../artifacts/phase-a/98bf3dd1624e209c0bcdfef8c05ae9ec4e47450a/20260923-003500-98bf3dd/controls/17.txt).

La suite Node completa s’ha executat dins Docker amb totes les variables `T10_INTEGRATION`, `T13_INTEGRATION`, `T15_INTEGRATION` i `UE_INTEGRATION` actives: **252/252 PASS**, 0 FAIL, 0 CANCELLED, 0 SKIP i 0 TODO. Cobertura global: 95,04 % línies, 82,13 % branques i 91,81 % funcions. Vegeu [tap-output.txt](../../../artifacts/phase-a/98bf3dd1624e209c0bcdfef8c05ae9ec4e47450a/20260923-004500-98bf3dd/coverage/tap-output.txt).

Els deu recorreguts especialitzats de navegador UE-T01–15 han passat en una execució neta a 375 px i sense peticions externes: offline i regressió de pantalles, compte/estacions/Ecowitt/admin, mapa privat, snapshots, preferències, vista pública, catàleg administrat, importació, Grafana intern i sis estimacions. Vegeu [specialized-final.txt](../../../artifacts/phase-a/98bf3dd1624e209c0bcdfef8c05ae9ec4e47450a/20260923-004500-98bf3dd/browser/specialized-final.txt).

## Regressions detectades i resoltes

La verificació integrada ha trobat tres regressions que les proves aïllades no mostraven:

- La visita anònima consultava `/api/v1/auth/me` i generava un `401` visible a la consola. El nou `GET /api/v1/auth/session` retorna 200 amb un estat anònim explícit; els endpoints protegits continuen retornant 401 sense sessió.
- Una BD sintètica creada des de zero carregava mesures però deixava buida la vista pública. El carregador configura la primera estació legacy sintètica com a fallback només quan el catàleg nou existeix i `public_station_id` encara és nul; mai sobreescriu l’elecció d’un administrador.
- La selecció tipada d’una estació només llegia el punt actual i els gràfics quedaven amb una mostra. Meteo combina ara lectura actual i historial autoritzat de la mateixa estació, elimina timestamps duplicats, ordena de més recent a més antic i respecta el límit triat.

El backend local `8088` s’ha reiniciat amb aquests canvis i queda `running healthy`. `/api/v1/auth/session` retorna 200 per a un visitant, `/api/v1/public-view` resol l’estació configurada i `/meteo/` continua disponible.

## Traçabilitat UE-R01–11

| Requisit | Acceptació | Evidència principal |
|---|---|---|
| UE-R01 | UE-CA01 | Integració d’identitat/onboarding, HTTP i recorregut de compte UE-T06 |
| UE-R02 | UE-CA02 | Integració ownership/Ecowitt/snapshots i recorreguts UE-T06/07 |
| UE-R03 | UE-CA03 | Integració i navegador UE-T09 |
| UE-R04 | UE-CA04 | Integració i navegador UE-T10 |
| UE-R05 | UE-CA05 | Integració de visibilitat i navegador UE-T08 |
| UE-R06 | UE-CA06 | Integració i navegador UE-T11 |
| UE-R07 | UE-CA07 | QA-UE-T12, integració/navegador UE-T13 i adaptador intern UE-T14 |
| UE-R08 | UE-CA08 | Unitari, HTTP, integració i navegador UE-T15 |
| UE-R09 | UE-CA09 | Unitari de normalització/frescor, snapshots i estimacions |
| UE-R10 | UE-CA10 | Matrius d’autorització, IDOR, CSRF, secrets, egress i vistes USER/admin |
| UE-R11 | UE-CA11 | Migració legacy, gate 19/19, Playwright 13/13 i deu recorreguts especialitzats |

UE-R12/UE-CA12 queden fora d’aquesta tasca i passen a UE-T17/18, tal com estableix l’ordre aprovat.

## Controls manuals i límits

G06-09 continua **PENDENT** perquè exigeix una auditoria manual WCAG 2.2 AA completa. Aquesta execució sí que acredita etiquetes accessibles bàsiques, navegació principal per teclat, alternativa textual al mapa, absència de desbordament a 375 px, cap error de pàgina i cap violació CSP, però no converteix aquestes comprovacions en una declaració de conformitat WCAG.

Grafana real continua deshabilitat i `INTERNAL_ONLY` fins confirmar credencials, límits i drets de persistència/republicació. El transport real de correu i el desplegament de producció tampoc formen part del gate local. La continuació executable és UE-T17, política d’històric administrada per estació.
