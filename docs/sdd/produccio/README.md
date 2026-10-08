# Producció MeteoLord

Aquest directori separa l'estat observat de producció, el runbook operatiu i
les tasques executables.

- [STATE.md](STATE.md): estat actual i incidències conegudes.
- [PROD-CHECKPOINT-2026-10-01.md](PROD-CHECKPOINT-2026-10-01.md): evidència
  consolidada del checkpoint productiu.
- [PLAN.md](PLAN.md): runbook mínim per mantenir l'estat desplegat.
- [tasks/PROD-01.md](tasks/PROD-01.md): migració one-shot
  `COMPLETED / HISTORICAL`, no repetible sobre `meteo`.
- [tasks/PROD-02.md](tasks/PROD-02.md): cache mòbil `PENDING`.
- [tasks/PROD-03.md](tasks/PROD-03.md): collation `DEFERRED / PENDING`.
- La resta de tasques preparades no autoritzen cap execució contra producció.
- [Roadmap general](../ROADMAP-METEOLORD.md): ordre de continuació funcional.

La release funcional desplegada és la baseline immutable `321b8a5`. Els
canvis posteriors requereixen un nou commit i una nova release. El connector
Grafana intern i el refresh periòdic de cinc minuts són operatius; el refresh
sota demanda, l'històric Grafana i el vent continuen pendents.
