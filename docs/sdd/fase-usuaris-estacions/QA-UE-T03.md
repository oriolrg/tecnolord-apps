# Evidència UE-T03 — identitat i sessions locals

Data: 2026-09-18. Estat: **FETA** amb comptes sintètics. Aquesta evidència cobreix la base d’identitat; el registre públic verificat es va completar després a [UE-T04](QA-UE-T04.md).

[identityService.js](../../../backend/services/identityService.js) aplica scrypt amb salt únic, sessions opaques amb només digest a BD, caducitat absoluta de 12 h i inactivitat de 30 min, CSRF per mutacions de sessió, tokens de recuperació d'un sol ús i revocació de sessions en canviar contrasenya. [identity.js](../../../backend/routes/identity.js) comprova Origin en mutacions i limita intents d'entrada. Les cookies són HttpOnly/SameSite=Lax i Secure fora de local/test. [bootstrap-admin.js](../../../backend/scripts/bootstrap-admin.js) només eleva un usuari verificat, aprovat i amb credencial existent a BD local/test autoritzada, amb lock i auditoria; repetir-ho és idempotent. No depèn de l'email d'ingesta ni de l'ordre de registre.

La [pantalla de compte](../../../site/compte/index.html) permet entrar, sortir i demanar recuperació. En local, els missatges de recuperació s'escriuen al fitxer privat `/tmp/meteolord-mail-outbox.jsonl` amb permisos 0600; el token no apareix en respostes ni logs. En tests, l'adaptador de correu és injectat. En producció, la recuperació resta desactivada fins configurar transport de correu real.

## Proves executades

| Comanda / context | Resultat |
|---|---|
| `node test/unit/ue-identity.test.js` | 3 PASS, 0 FAIL: hash/salt, inputs, guards del bootstrap i bústia privada |
| `UE_INTEGRATION=1 node test/integration/ue-identity.test.js` en DB Docker sintètica | 1 PASS, 0 FAIL: admin validat, pendent rebutjat, origin/CSRF, login/me, expiració idle, recuperació, reset d'un sol ús, revocació i logout |
| `node scripts/check-ue-account-browser.js` | PASS: Chrome headless 375 px, login/logout/recuperació, 0 egress i 0 errors de pàgina |
| `npm test` amb T10/T13/T15/UE_INTEGRATION activats en Docker amb site/config muntats | 198 PASS, 0 FAIL, 0 SKIP |
| `git diff --check` | PASS |

El test de navegació de la pantalla de compte usa respostes d'API simulades per comprovar el formulari. El contracte HTTP real i la BD es comproven al test d'integració separat. Aquest increment no incloïa correu de producció, registre públic ni gestió d'estacions; l’alta pública correspon a la tasca posterior UE-T04. No s'ha desplegat res.
