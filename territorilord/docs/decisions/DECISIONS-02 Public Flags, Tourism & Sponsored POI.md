# TerritoriLord — Decisions 02: Public Flags, Tourism & Sponsored POI

**Estat:** decisions funcionals v0.1
**Data:** 2026-09-18
**Complementa:** `DECISIONS-00.md` i `DECISIONS-01.md`

---

# 1. Creació de PublicFlagSite

## D-148 — Actors autoritzats

**Estat:** FIXAT

Els `PublicFlagSite` podran ser creats per:

* sistema;
* administrador;
* organismes turístics o altres actors expressament autoritzats.

Els usuaris normals no podran crear lliurement PublicFlagSite.

---

# 2. PublicFlagSite neutral

## D-149

**Estat:** FIXAT

Un `PublicFlagSite` pot trobar-se sense propietari.

Això pot produir-se:

* inicialment;
* per configuració;
* després de determinats esdeveniments futurs.

---

# 3. Captura d'un PublicFlagSite neutral

## D-150

**Estat:** FIXAT

Capturar un `PublicFlagSite` neutral requerirà:

```text
Activity vàlida
+
localització física correcta
+
mecànica d'orientació
```

La seva Defense inicial serà baixa.

No serà suficient passar-hi accidentalment.

---

# 4. UserFlag: Prestige i importància de lloc

## D-151

**Estat:** FIXAT

En una `UserFlag` es diferenciaran:

```text
FlagPrestige
```

i:

```text
LocationImportance
```

`FlagPrestige` pertany a la bandera i viatja amb ella.

`LocationImportance` pertany a la ubicació on està plantada.

---

# 5. Trasllat d'una UserFlag

## D-152

**Estat:** FIXAT

Quan una UserFlag canvia d'ubicació:

* conserva el seu historial;
* conserva `FlagPrestige`;
* conserva historial de propietaris;
* conserva captures i reconquestes.

Però:

```text
LocationImportance
```

de la nova ubicació començarà pràcticament des de zero i haurà de créixer amb l'ús real d'aquell nou punt.

---

# 6. Visites històriques

## D-153

**Estat:** FIXAT

La UserFlag conservarà estadístiques històriques globals.

Exemple:

```text
Visites històriques: 248
Ubicacions històriques: 4
Captures: 7
```

Però les visites de l'antiga ubicació no donaran automàticament importància territorial a la nova ubicació.

---

# 7. UserFlag abandonada després d'una captura

## D-154

**Estat:** FIXAT

Quan una UserFlag capturada no és replantada dins del termini:

```text
retorna a l'última ubicació
+
owner = NONE
+
Defense baixa
```

Qualsevol jugador podrà intentar capturar-la.

No hi haurà dret exclusiu de recuperació de l'antic propietari.

Es podrà mantenir en el futur un bonus limitat de reconquesta si l'equilibratge ho justifica.

---

# 8. PublicFlagSite i UserFlag pròxims

## D-155

**Estat:** FIXAT

Un `PublicFlagSite` i una `UserFlag` poden coexistir en una mateixa zona.

No s'imposa inicialment una distància mínima especial entre ambdós.

Si les proves mostren saturació visual o explotació del sistema, aquesta regla podrà revisar-se.

---

# 9. Pèrdua d'una UserFlag

## D-156

**Estat:** FIXAT

Perdre una UserFlag:

> no transfereix automàticament el territori proper al rival.

El territori conserva el seu propietari actual.

El jugador perd:

* la Flag;
* el bonus defensiu;
* altres efectes limitats associats a aquella bandera.

A partir d'aquí el territori pot quedar més vulnerable.

---

# 10. Captura d'un PublicFlagSite

## D-157

**Estat:** FIXAT

Capturar un PublicFlagSite:

> no captura automàticament territori adjacent.

La ruta física de l'Activity pot generar:

* pressió;
* conquesta neutral;
* altres efectes territorials normals.

La Flag i el territori continuen sent sistemes diferenciats.

---

# 11. Fog i PublicFlagSite

## D-158

**Estat:** FIXAT

La visibilitat global dependrà del tipus de `PublicFlagSite`.

Es podran definir, per exemple:

```text
PUBLIC_VISIBLE
FOG_DETECTED
FOG_HIDDEN
```

o sistema equivalent.

Exemple:

* gran atractiu turístic → pot ser visible globalment;
* objectiu PvP → només indici sota Fog;
* element especial → regla específica.

---

# 12. POI patrocinats

## D-159

**Estat:** FIXAT

Els POI patrocinats o oficials hauran d'estar clarament identificats com a tals.

No s'han de confondre amb POI comunitaris orgànics.

Poden provenir de:

* organisme turístic;
* administració;
* patrocinador;
* establiment;
* campanya.

---

# 13. Bonificació de POI patrocinat

## D-160

**Estat:** FIXAT conceptualment

Un POI patrocinat pot oferir una recompensa superior per visita.

Exemples:

* XP addicional;
* punts d'una campanya;
* Achievement;
* progressió turística;
* recompenses específiques de l'esdeveniment.

No donarà directament:

* AttackPower desproporcionat;
* Defense desproporcionada;
* territori automàtic.

---

# 14. QR patrocinat

## D-161

**Estat:** PORTA OBERTA / FIXAT CONCEPTUALMENT

Es deixa preparada la possibilitat que un POI patrocinat contingui un QR físic.

Flux conceptual:

```text
usuari arriba físicament al POI
        ↓
TerritoriLord comprova proximitat GPS
        ↓
usuari escaneja QR
        ↓
backend valida el token
        ↓
recompensa de campanya
```

---

# 15. QR no substitueix el GPS

## D-162

**Estat:** FIXAT

Escanejar un QR per si sol no demostra presència física suficient.

La recompensa important requerirà combinar:

```text
GPS / Activity / proximitat
+
QR vàlid
```

Això evita que una fotografia del QR compartida per internet concedeixi la recompensa des de qualsevol lloc.

---

# 16. QR validat al servidor

## D-163

**Estat:** FIXAT conceptualment

El QR no hauria de contenir simplement:

```text
poi=123
points=500
```

La validació s'haurà de realitzar al servidor.

El sistema podrà comprovar:

* campanya activa;
* POI correcte;
* usuari;
* proximitat;
* reutilització;
* expiració;
* límits.

---

# 17. Tipus de QR futurs

Es deixa oberta la possibilitat de:

### QR estàtic

Més fàcil de desplegar.

Necessita més proteccions contra còpies.

### QR dinàmic

Més segur però requereix infraestructura al lloc.

### Codi temporal

Pot utilitzar-se per esdeveniments o establiments.

No cal decidir ara quin model serà el definitiu.

---

# 18. Recompensa patrocinada

## D-164

**Estat:** FIXAT conceptualment

Un patrocinador podrà definir una recompensa limitada dins de la seva campanya.

Exemple:

```text
Visita física            + XP
QR validat               + bonus
Completa 5 POI           + badge
Completa ruta            + achievement
```

Els valors estaran controlats per TerritoriLord.

El patrocinador no podrà definir arbitràriament recompenses que trenquin l'equilibri global.

---

# 19. Possible model comercial

Aquesta mecànica deixa oberts productes com:

```text
Sponsored POI
Tourism Trail
Discovery Campaign
QR Challenge
Destination Collection
Local Business Challenge
```

---

# 20. Comerç i turisme local

En el futur també podria permetre experiències del tipus:

```text
visita mirador
↓
passa per museu
↓
arriba a establiment participant
↓
escaneja QR
↓
completa repte territorial
```

Això es considera una línia comercial futura, no funcionalitat del MVP.

---

# 21. Discovery Pass

## D-165

**Estat:** FIXAT

Quan expira un `DiscoveryAccess` o `VisitorPass`:

* desapareix la informació promocional que no s'ha guanyat físicament;
* es conserva tot allò realment descobert per l'usuari.

Per tant:

```text
DiscoveryAccess != PhysicalDiscovery
```

continua sent una distinció obligatòria.

---

# 22. Level

## D-166

**Estat:** PENDENT

No es decideix encara entre:

* progressió infinita;
* nivell finit;
* nivell finit + Prestige.

No és necessari resoldre-ho abans de les primeres fases del projecte.

---

# 23. Seasons

## D-167

**Estat:** FIXAT COM A OBERT

No es decideix encara si TerritoriLord tindrà temporades.

L'arquitectura no haurà d'impedir incorporar-les posteriorment.

No s'implementarà suport específic prematurament si no és necessari.

---

# 24. Teams / Clans

## D-168

**Estat:** FIXAT COM A EXTENSIÓ FUTURA

Es deixa oberta la possibilitat futura de:

* equips;
* clans;
* grups.

No es defineix encara:

* territori col·lectiu;
* propietat de Flags;
* defensa conjunta.

Les entitats bàsiques no s'han de dissenyar assumint que només existirà sempre joc individual, però tampoc s'ha d'implementar ara una capa d'equips.

---

# 25. Principi de monetització turística

TerritoriLord pot monetitzar:

> l'accés a experiències, contingut, pistes, reptes i descobriment.

No:

> el dret a guanyar el PvP.

---

# 26. Regla final per contingut patrocinat

Un contingut patrocinat pot ser:

```text
més visible
més informatiu
més recompensat en XP/progressió
part d'un repte
part d'una campanya
```

però no pot convertir-se en:

```text
paga → més AttackPower → guanya
```

sense trencar el principi no-pay-to-win.
