# QA UE-T12 — Revalidació acotada de Grafana/i2CAT

Data d'execució: 2026-09-21. Estat: **FETA — resultat CONDICIONAL**. La prova s'ha executat des de l'entorn local MeteoLord, només en memòria, sense credencials, persistència, importació ni publicació de valors.

## Abast executat

El script [check-grafana-spike.js](../../../backend/scripts/check-grafana-spike.js) fixa al backend la URL, el datasource, la mètrica i una allowlist de dos sensors. El client no pot proporcionar URL ni PromQL. La prova aplica:

- dues consultes de temperatura: `Meteo-001-3100044` i `Meteo-007-3100206`;
- finestra màxima de 15 minuts;
- `maxDataPoints=20` i `intervalMs=300000`;
- timeout de 15 segons;
- resposta màxima d'1 MiB;
- sortida sanejada sense valors meteorològics ni cos cru de la resposta.

## Resultat observat

El dashboard i `POST /api/ds/query` van respondre HTTP `200` sense autenticació. El datasource UID observat continua sent `SWLXFBHvz`. Cada sensor va retornar un frame amb un camp temporal i un camp numèric, arrays aparellables, timestamps ordenats i almenys un valor finit dins la finestra sol·licitada.

La primera consulta va retornar també un punt alineat fora del límit exacte de la finestra. Un futur adaptador haurà de filtrar explícitament timestamps després d'aparellar-los, encara que Grafana/Prometheus hagi acceptat el rang.

L'esquema del frame actual no declara la unitat (`unit: null`). La temperatura en °C continua sent una interpretació del panell i de l'evidència anterior, no una unitat autodescrita per aquesta resposta. La pluja roman desactivada perquè la semàntica i la unitat encara no estan confirmades.

Els identificadors continuen sent candidats de l'inventari: `Meteo-001-3100044` ↔ `MLW28` i `Meteo-007-3100206` ↔ `MLW04`. Aquesta comprovació tècnica no valida per si sola la ubicació física ni autoritza una fusió per nom.

## Drets i publicació

Es conserva l'abast registrat a [SPIKE-04](../SPIKE-04-descoberta-grafana-i2cat.md): prova i desenvolupament interns autoritzats segons la comunicació de l'usuari, però sense document escrit que ampliï l'autorització a ingesta productiva, retenció o republicació. L'accés anònim tècnic tampoc equival a una llicència de dades.

Després de la prova:

- `meteo.source_bindings` conté **0** files `GRAFANA` a la base local;
- `/api/v1/map/stations`, `/api/v1/stations` i `/api/v1/public-view` responen `200` i no contenen `GRAFANA`;
- no s'ha creat cap estació, snapshot, mesura o fitxer amb valors reals;
- només s'ha desat l'[extracte sanejat](evidence/UE-T12-grafana-sanitized-2026-09-21.json).

## Conclusió

El contracte tècnic continua sent viable per desenvolupar un connector intern: dashboard, datasource, endpoint i frames han estat revalidats. El resultat és **CONDICIONAL** perquè falten l'abast escrit de consulta automatitzada/persistència, els límits de freqüència acordats, les unitats autodescrites completes i qualsevol autorització de republicació. UE-T14 no podrà activar ingesta real ni superfícies públiques fins que aquestes condicions quedin resoltes; pot continuar amb contractes i fixtures interns.
