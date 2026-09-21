# Inventari inicial a contrastar — Grafana / i2CAT

Font: PDF de l'usuari «Estacions - llista (2).pdf», una pàgina, llegit com a text i imatge el 2026-09-18. SHA-256 `90cf25a73a84a7e6730c6a8650a9027b3c3e013769de2150fa2e0d12b0ae9fec`. Document d'evidència, **no importació executada ni catàleg validat**. Colors sense llegenda: no se'n dedueix estat. Totes les coordenades són desconegudes; cap municipi/anotació es transforma automàticament en un punt.

«Complet aparent» descriu la sintaxi transcrita, no confirma existència, disponibilitat ni correspondència. Totes les entrades requereixen comprovació de mapping, drets i ubicació. Els tres TEST romanen en quarantena de prova fins revisió expressa.

| Codi | ID transcrit | Nom | Anotació PDF / incidència |
|---|---|---|---|
| TEST01 | Meteo-003-3100338 | Cal Reli | estacio_prova |
| TEST02 | 004? 014? | Meteocat | Referència; ambigu |
| TEST03 | ? | Cal Reli | i2cat satèlit; desconegut |
| MLW01 | Meteo-002-3100007 | Can Pernals | — |
| MLW02 | Meteo-013-3300161 | Forat Bòfia | — |
| MLW03 | Meteo-021-000070 | Masia Guixerons | batery?? |
| MLW04 | Meteo-007-3100206 | El Vancell | — |
| MLW05 | Meteo-011-3300274 | Sallord | — |
| MLW06 | Meteo-019-4000143 | Prat Formiu | — |
| MLW07 | Meteo-012-3300391 | El Collell | — |
| MLW08 | Meteo-009-3100496 | Casa Valielles | low |
| MLW09 | Meteo-023-00386 | Casa Ginebres | — |
| MLW10 | — | Vivenda Particular | capolat |
| MLW11 | — | Vivenda Particular | montmajor |
| MLW12 | — | Escola | Navès |
| MLW13 | Meteo-015-4000206 | Duocastella | — |
| MLW14 | Meteo-017-4000161 | Casa Ventolra | — |
| MLW15 | — | Moli de Postils | Navès |
| MLW16 | Meteo-016-4000258 | Apartaments Casafont | — |
| MLW17 | Meteo-024-00225 | Cal Samarrà | — |
| MLW18 | Meteo-010-54000046 | Font d'Estivella | — |
| MLW19 | Meteo-022-00368 | Cap del Verd | — |
| MLW20 | Meteo-018-4000158 | Can Sans-Can Costa | low |
| MLW21 | — | Terreny Desconegut | — |
| MLW22 | — | Casa La Mora | Navès |
| MLW23 | — | Taravil | Capolat |
| MLW24 | — | Prat Parceris | La Coma |
| MLW25 | Meteo-005-5310489 | El Planars | low? |
| MLW26 | Meteo-026- | Cal Sec | identificador incomplet |
| MLW27 | — | Coll de Port | La Coma |
| MLW28 | Meteo-001-3100044 | Granja Vaques | — |
| MLW29 | Meteo-025-00279 | Codó | — |
| MLW30 | — | Serra Guixers | Guixers |
| MLW31 | — | Terreny Desconegut | Lladurs |
| MLW32 | Meteo-020-4000245 | El Jou | la coma |

35 files: 32 MLW i 3 TEST. Dins MLW: 20 IDs aparentment complets, 1 incomplet i 11 absents. TEST: 1 aparentment complet i 2 ambigus/desconeguts. Zero ubicacions verificades a partir del PDF.

## Contrast amb la descoberta anterior

[SPIKE-04](../SPIKE-04-descoberta-grafana-i2cat.md) recull resposta observada el 2026-09-02 per Meteo-001-3100044 i Meteo-007-3100206: candidats MLW28 i MLW04, a revalidar, no prova actual de correspondència física. Altres candidats històrics: Casa La Mora → Meteo-008-3100134; Coll de Port → Meteo-027- (incomplet); Serra Guixers → Meteo-028-300127. No omplir els buits del PDF amb aquests candidats sense evidència. MLW25 diu «El Planars» al PDF i «El Planàs» al document anterior: conservar ambdós literals com a discrepància, no crear dues estacions ni fusionar per nom.

Comprovació actual: s'ha intentat accedir al [dashboard](https://grafana.commonscloud.coop/d/i2cat-public-jul27/vall-de-lord) i a [metadades del dashboard](https://grafana.commonscloud.coop/api/dashboards/uid/i2cat-public-jul27). L'eina de consulta no hi ha pogut accedir; no s'ha obtingut resposta verificable de la font ni s'ha executat POST de dades. Això no demostra indisponibilitat, 403 ni canvi d'autenticació. UE-T12 revalidarà de manera acotada el contracte històric i els drets d'ús.

Cada futura fila staging tindrà namespace d'inventari + codi immutable, nom original, ID original/candidat, estat del mapping, evidència, geometria nullable i procedència. L'identificador intern d'estació és independent del sensor i del codi MLW. Entrades desconegudes mai es publiquen per completar un mapa visualment.
