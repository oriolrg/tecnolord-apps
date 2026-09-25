# MeteoLord — Producció i futura beta

Aquest directori és el punt d'entrada canònic per a la preparació segura de
MeteoLord en preproducció i producció.

## Estat actual

- PR01 PASS — inventari read-only complet.
- PR02 PASS — backup creat i estructuralment validat.
- PR03 PASS — restore verificat a `meteo_restore_test`.
- NEXT: PR04 — schema diff i pla de migració RC sobre clon.

No s'ha desplegat `meteo-beta.tecnolord.cat`, no s'ha executat cap migració RC
sobre el restore i no s'ha modificat la BD productiva.

## Documents

- [Pla de producció](PLAN.md): flux complet, gates i regles de seguretat.
- [Estat operacional](STATE.md): baseline, backup vigent, riscos i següent pas.
- [Tasca PR01](tasks/PR01.md): especificació read-only original.
- [Evidència PR01](evidence/PR01-production-inventory.json): inventari de
  servidor, runtime, dades i riscos.
- [Evidència PR02](evidence/PR02-backup-verification.json): artefacte, checksum
  i cobertura del backup.
- [Evidència PR03](evidence/PR03-restore-verification.json): procediment de
  restore i invariants comprovats.
- [Preparació PR04](tasks/PR04.md) i
  [pla candidat](tasks/PR04-migration-candidate.md): material preparatori que
  encara no representa un gate PR04 executat.

## Regla operativa

```text
meteo → backup → meteo_restore_test (pristine) → meteo_beta (treball)
```

`meteo_restore_test` és immutable. Tota migració posterior s'ha de provar en
una nova `meteo_beta`, amb comparació d'invariants abans i després.

La documentació exclou passwords, tokens, API keys, cookies, hashes de sessió,
emails i altres dades personals.
