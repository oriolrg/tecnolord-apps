# TerritoriLord — Validation Pack 00

**Estat:** paquet de validació externa v0.1
**Data:** 2026-09-18
**Projecte:** TerritoriLord

---

# 1. Objectiu

Aquest document defineix com presentar i validar TerritoriLord amb persones externes abans i durant el desenvolupament.

L'objectiu no és aconseguir que el validador digui:

> «M'agrada la idea.»

L'objectiu és descobrir:

* què entén;
* què no entén;
* què li interessa;
* què li sobra;
* què el faria sortir físicament;
* què el faria tornar a utilitzar l'app;
* què percep com injust;
* què pagaria o contractaria;
* quins problemes no hem detectat.

---

# 2. Principi de validació

Cal evitar preguntes dirigides com:

> «Et motivaria conquerir territori?»

perquè suggereixen la resposta esperada.

És millor preguntar:

> «Què et faria decidir per on sortir la propera vegada?»

o:

> «Quina part d'aquesta proposta creus que utilitzaries realment?»

---

# 3. Perfils de validador

No tots els validadors han d'avaluar el mateix.

Es diferencien inicialment quatre perfils.

## A — Usuari esportiu

Exemples:

* runner;
* trail runner;
* senderista;
* ciclista;
* MTB.

Ha de validar principalment:

* motivació;
* activitat;
* mapa;
* exploració;
* territori;
* PvP;
* ús del mòbil.

---

## B — Usuari outdoor / orientació

Exemples:

* orientació;
* excursionisme;
* muntanya;
* geocaching;
* navegació GPS.

Ha de validar especialment:

* Fog;
* descoberta;
* orientació;
* precisió;
* banderes;
* seguretat física.

---

## C — Turisme / administració / territori

Exemples:

* tècnic de turisme;
* ajuntament;
* oficina de turisme;
* consell comarcal;
* organisme de promoció territorial.

Ha de validar:

* DiscoveryAccess;
* TourismCampaign;
* POI;
* rutes;
* campanyes;
* analítica;
* utilitat territorial;
* model comercial.

---

## D — Col·laborador / soci / perfil tècnic

Ha de validar:

* coherència general;
* diferenciació;
* viabilitat;
* riscos;
* escalabilitat conceptual;
* oportunitats de col·laboració.

---

# 4. Presentació curta del projecte

Abans de preguntar, la persona ha de rebre només la informació necessària.

Text recomanat:

TerritoriLord és una aplicació que converteix l'activitat física i el territori real en un joc persistent.

Quan camines, corres o pedales pots descobrir mapa, conquerir territori, trobar punts d'interès i interactuar amb banderes.

Algunes zones del mapa no mostren tota la informació fins que hi vas físicament.

Les rutes circulars poden generar territori.

Les banderes poden ser descobertes, defensades o atacades mitjançant activitats reals i una petita mecànica d'orientació.

També es planteja una capa turística que permeti a municipis o altres entitats crear rutes, punts d'interès i reptes físics.

La idea principal és que l'aplicació et doni una raó per decidir:

> «Avui vull anar cap allà.»

---

# 5. Informació que NO s'ha de donar inicialment

Abans de recollir les primeres impressions, no explicar en profunditat:

* fórmules;
* Power;
* Defense;
* H3;
* arquitectura;
* totes les excepcions;
* monetització completa;
* anti-cheat detallat.

Primer interessa saber què entén espontàniament.

---

# 6. Primera reacció

Preguntar abans d'entrar en detall:

1. Com explicaries amb les teves paraules què és TerritoriLord?

2. Quina creus que és la funcionalitat principal?

3. Quina part t'ha cridat més l'atenció?

4. Hi ha alguna part que no hagis entès?

5. A quina aplicació o experiència existent t'ha recordat?

L'última pregunta serveix per detectar referents mentals del validador.

---

# 7. Motivació esportiva

Preguntar:

* Com decideixes actualment per on sortir a caminar/córrer/pedalar?
* Repeteixes habitualment les mateixes rutes?
* Què et faria provar-ne una de nova?
* Utilitzes alguna aplicació durant o després de l'activitat?
* Què hi consultes realment?
* Hi ha alguna funcionalitat que et faci tornar sovint a aquella aplicació?

Després explicar Exploration/Fog/Territory.

Preguntar:

* Quina d'aquestes mecàniques creus que influiria més en la teva ruta?
* Quina ignoraries?
* Què creus que acabaries fent repetidament?
* Què creus que deixaria de tenir gràcia després de pocs dies?

---

# 8. Validació del Fog of War

Presentar conceptualment:

```text id="28az1n"
Zona coneguda       Zona desconeguda

────────────        ███████████
🚩 bandera          ███ 🚩? ███
🏔 cim              ███  ?  ███
────────────        ███████████
```

Preguntar:

* Què creus que significa `🚩?`?
* Et dona prou informació per decidir anar-hi?
* Voldries veure més informació?
* Quina informació no voldries que et revelessin?
* Et molestaria tornar a perdre informació actual d'una zona que fa molt temps que no visites?

No explicar la resposta correcta fins després.

---

# 9. Validació d'Exploration vs Knowledge

Explicar:

> El sistema recordarà permanentment que has estat en una zona, però la informació actual sobre què hi passa pot quedar obsoleta si no hi tornes.

Preguntar:

* Ho perceps com dues coses diferents?
* Té sentit que el mapa recordi els llocs visitats però no l'estat actual?
* Què esperaries continuar veient després d'un any?
* Què et semblaria injust que desaparegués?

---

# 10. Validació territorial

Mostrar una ruta circular sobre un mapa.

Explicar només:

> Una ruta circular pot permetre controlar part del territori que queda dins.

Preguntar:

* Sense més explicacions, quina zona esperaries guanyar?
* Què esperaries que passés amb les cel·les parcialment tallades?
* Et semblaria correcte obtenir tot l'interior?
* Què passaria, segons tu, si la ruta fos enorme?

Aquestes respostes són especialment útils per `EXP-04` i `EXP-05`.

---

# 11. Validació de PublicFlagSite

Explicar:

> Hi ha punts públics fixos que poden canviar de propietari però mai de lloc.

Exemple:

```text id="7z78rt"
🚩 Cim / Coll / lloc emblemàtic
```

Preguntar:

* Què esperaries obtenir en capturar-lo?
* Esperaries que també canviés el territori del voltant?
* Què et faria voler controlar aquest punt?
* Et semblaria interessant veure el seu historial?

---

# 12. Validació de UserFlag

Explicar:

> També pots crear banderes pròpies. Aquestes sí que poden ser robades i transportades.

Preguntar abans d'explicar més:

* Què esperaries que passés si algú te la roba?
* On creus que podria portar-la?
* Què et motivaria a recuperar-la?
* Et semblaria més interessant que una bandera fixa o menys?

Després explicar:

```text id="6yhj7v"
captura
↓
bandera transportada
↓
nova Activity
↓
replantació
```

i tornar a preguntar si el flux és comprensible.

---

# 13. Validació de l'orientació

Presentar l'escenari:

> Has descobert una bandera però no tens la coordenada exacta. L'app et porta aproximadament a la zona i l'has de localitzar físicament.

Preguntar:

* Et sembla divertit o una molèstia?
* Quina ajuda voldries tenir?
* Quina ajuda faria que deixés de ser orientació?
* Quant temps estaries disposat a buscar un punt?
* Miraries constantment el mòbil?

No suggerir inicialment:

* radi;
* brúixola;
* metres;
* pistes progressives.

---

# 14. Error d'orientació

Explicar:

> Si marques una ubicació clarament incorrecta, l'atac perd eficiència. Si el GPS és massa imprecís, no hi ha penalització.

Preguntar:

* Et sembla just?
* Què esperaries que passés després d'un error?
* Quants intents et semblarien raonables?
* Preferiries perdre força, temps o simplement tornar a buscar?

Les respostes no impliquen adopció automàtica de la proposta.

---

# 15. Validació del PvP

Presentar:

```text id="tnz8n8"
planifico atac
↓
surto
↓
trobo bandera
↓
continuo Activity
↓
acabo
↓
es resol
```

Preguntar:

* Entens per què no es resol immediatament quan trobes la bandera?
* Et generaria interès haver de completar tota la ruta?
* Et faria ràbia descobrir al final que no has guanyat?
* Quina informació necessitaries abans de decidir atacar?

---

# 16. Notificació al defensor

Presentar:

> Quan algú valida l'atac, el propietari rep «La teva bandera està sent atacada», però no pot eliminar-la ni veure on és l'atacant.

Preguntar:

* Quina seria la teva primera reacció?
* Et generaria emoció o frustració?
* Voldries rebre aquesta notificació?
* Quina informació voldries veure?
* Quina informació creus que no s'hauria de mostrar?

---

# 17. Jugadors no competitius

Pregunta especialment important:

> Si no t'interessés competir contra altres persones, què quedaria de TerritoriLord que encara utilitzaries?

No suggerir inicialment POI, cims o exploració.

Observar què identifica la persona espontàniament.

Després presentar:

* Exploration;
* Fog;
* Summit;
* POI;
* historial;
* TourismCampaign.

---

# 18. Validació de baixa densitat

Preguntar:

> Si fossis gairebé l'únic jugador de la teva zona, continuaria interessant-te?

Demanar:

* què faltaria?
* què continuaria funcionant?
* quan deixaria de tenir sentit?

Aquesta resposta és crítica per al llançament inicial.

---

# 19. Turisme

Per perfils generals, presentar:

> Una destinació pot mostrar pistes de llocs interessants sense considerar-los ja descoberts.

Exemple:

> Descobreix 8 indrets del municipi.

Preguntar:

* ho faries si estiguessis de vacances?
* què necessitaries com a recompensa?
* preferiries ruta fixa o descobrir-los lliurement?
* què faria que semblés publicitat?
* què faria que semblés una activitat interessant?

---

# 20. Validació amb organisme turístic

Per tècnics de turisme, preguntar primer pel seu problema actual:

* Com promocioneu actualment llocs menys coneguts?
* Teniu dificultats per distribuir visitants?
* Com promocioneu rutes?
* Podeu saber si la gent visita realment els punts?
* Feu campanyes gamificades?
* Quines dades us serien útils?

Només després presentar TerritoriLord.

---

# 21. Proposta turística

Exemple:

```text id="llpr9x"
Campanya:
"Descobreix 8 indrets del municipi"

→ mapa amb pistes
→ ruta opcional
→ visita física
→ QR en alguns punts
→ recompensa
→ badge / col·lecció
```

Preguntar:

* On hi veus utilitat real?
* Quin tipus de lloc promocionaries?
* Quin públic hi participaria?
* Qui gestionaria els continguts?
* Quins resultats necessitaries mesurar?
* Contractaries una campanya així?
* Amb quin objectiu concret?

No preguntar directament:

> Quant pagaries?

fins que s'hagi confirmat que existeix valor.

---

# 22. Comerç local

Presentar:

> Un comerç participant pot tenir un POI patrocinat i un QR físic que només dona recompensa si el servidor confirma que l'usuari és realment al lloc.

Preguntar:

* quin tipus de comerç podria tenir interès?
* què podria oferir a canvi?
* què faria que resultés molest?
* quin benefici necessitaria veure el comerciant?

---

# 23. QR + GPS

Mostrar:

```text id="w61g0x"
QR
+
geolocalització
+
backend
=
visita validada
```

Preguntar:

* et genera algun problema de privacitat?
* esperaries haver d'acceptar alguna cosa explícitament?
* et semblaria natural dins una ruta turística?
* ho faries en un comerç?

---

# 24. Privacitat

No començar explicant les nostres solucions.

Preguntar:

> Quines dades et preocuparia compartir en una aplicació així?

Observar si apareixen espontàniament:

* casa;
* horaris;
* track;
* ubicació actual;
* lloc de treball.

Després explicar:

* track privat per defecte;
* inici/final sensibles;
* sense ubicació rival en temps real.

Preguntar si encara detecta algun risc.

---

# 25. Seguretat física

Preguntar:

* creus que alguna mecànica podria portar algú a entrar on no toca?
* què passaria amb propietat privada?
* què passaria amb un punt perillós?
* què hauria de poder denunciar un usuari?

Aquest feedback pot descobrir problemes que no apareixen en una revisió purament tècnica.

---

# 26. Comprensió de conceptes

Demanar al validador que expliqui amb les seves paraules:

```text id="v31j3o"
Exploration
Fog
Territory
PublicFlagSite
UserFlag
Attack
Defense
```

Si no pot explicar-los correctament:

> el problema pot ser de UX o vocabulari, encara que el model funcional sigui coherent.

---

# 27. Priorització espontània

Presentar aquestes funcionalitats sense ordre de preferència:

* mapa explorat;
* Fog;
* territori;
* PublicFlagSites;
* UserFlags;
* orientació;
* PvP;
* cims;
* POI;
* historial;
* campanyes turístiques.

Preguntar:

> Si només en poguessis conservar tres, quines conservaries?

Després:

> Quina eliminaria primer?

Això força prioritats reals.

---

# 28. Retenció

Una de les preguntes més importants:

> Després de provar TerritoriLord durant una setmana, què creus que et faria tornar la setmana següent?

I:

> Què creus que faria que deixessis d'utilitzar-lo?

Registrar les respostes literalment quan sigui possible.

---

# 29. Comparació amb aplicacions actuals

Preguntar:

* Quines apps utilitzes actualment per esport/outdoor?
* Què hi fas?
* Què t'agrada?
* Què t'irrita?
* Quina continuaries utilitzant encara que utilitzessis TerritoriLord?
* Què hauria de fer TerritoriLord per merèixer una app més al teu mòbil?

Aquesta última pregunta és especialment important.

---

# 30. Disposició a pagar — consumidor

Només després d'haver validat interès.

Preguntar:

> Hi ha alguna funcionalitat de les que has vist que consideraries suficientment útil per pagar?

Si respon sí:

> Quina?

Després:

> Preferiries pagament únic, subscripció o pagar només per determinades experiències?

No suggerir preus inicialment.

---

# 31. Disposició a contractar — B2B/B2G

Per entitats:

> Aquesta eina solucionaria algun problema que tingueu actualment?

Si sí:

* quin?
* qui prendria la decisió?
* quin departament l'utilitzaria?
* seria una campanya puntual o recurrent?
* quines dades necessitaríeu per justificar-ne el cost?

Això és més útil inicialment que preguntar simplement:

> «Quant pagaríeu?»

---

# 32. Col·laboradors tècnics

Preguntar:

* quina part perceps més difícil?
* on veus més risc?
* què prototiparies primer?
* què no construiries encara?
* quina decisió consideres més irreversible?
* què creus que estem sobreenginyeritzant?

No proporcionar les nostres pròpies respostes abans.

---

# 33. Compradors / socis

Preguntar:

* quin problema creus que resol?
* qui creus que és el primer client?
* quin és el principal factor diferencial?
* què impedeix que sigui només una feature d'una altra app?
* què hauria de demostrar un MVP perquè t'interessés més?
* quin risc et faria descartar-lo?

---

# 34. Pregunta final obligatòria

A tots els perfils:

> **Què no t'he preguntat i creus que hauria de preocupar-me?**

Aquesta pregunta pot produir alguns dels feedbacks més valuosos.

---

# 35. No discutir amb el validador

Quan una persona no entén alguna cosa:

No respondre immediatament:

> «No, és que realment funciona així...»

Primer registrar:

```text id="p4wn4r"
què ha entès
```

perquè la confusió mateixa és evidència.

Després es pot explicar la mecànica correcta.

---

# 36. No vendre durant la validació

Si l'objectiu és validar:

> no intentar convèncer.

Una crítica com:

> «Jo això no ho faria mai.»

és més útil que una resposta educada com:

> «Sí, sembla interessant.»

---

# 37. Registre de sessió

Cada sessió pot generar:

```text id="jpk65n"
VALIDATION-SESSION-XXX
```

amb:

* perfil;
* data;
* context;
* experiència esportiva;
* productes que utilitza;
* observacions;
* respostes;
* confusions;
* idees espontànies;
* riscos;
* conclusions.

Evitar recollir dades personals innecessàries.

---

# 38. Classificació del feedback

Cada observació pot classificar-se com:

```text id="61t8wr"
COMPREHENSION
MOTIVATION
GAMEPLAY
TECHNICAL
PRIVACY
SAFETY
TOURISM
BUSINESS
UX
OTHER
```

---

# 39. Força de l'evidència

No convertir una opinió individual en una decisió.

Distingir:

```text id="jnxduy"
1 persona ho diu
```

de:

```text id="umlj3v"
patró repetit entre perfils independents
```

I també distingir:

```text id="h500pi"
"crec que ho faria"
```

de:

```text id="7g5clt"
"ho ha fet durant una prova real"
```

El comportament observat pesa més que la intenció declarada.

---

# 40. Escala de findings

Les conclusions poden etiquetar-se:

## SIGNAL

Observació interessant però insuficient.

## PATTERN

Apareix repetidament.

## ISSUE

Problema clar que cal resoldre.

## OPPORTUNITY

Ús o necessitat no prevista.

## VALIDATED

Hipòtesi suportada per evidència suficient.

---

# 41. Decisions després del feedback

El feedback no modifica automàticament el producte.

Flux:

```text id="8a8sgb"
feedback
↓
pattern
↓
analysis
↓
decision
↓
update docs
```

Especialment si entra en conflicte amb una decisió ja `FIXAT`.

---

# 42. Primer grup de validació recomanat

Abans de disposar del MVP, és suficient un grup petit però variat.

Interessaria tenir persones de:

```text id="w4w2pz"
running / trail
senderisme
ciclisme / MTB
orientació / outdoor
perfil poc competitiu
turisme
perfil tècnic/producte
```

No és necessari buscar una mostra estadística en aquesta fase.

L'objectiu és detectar problemes grans i hipòtesis falses.

---

# 43. Quan existeixi prototip

El procés canvia.

En lloc d'explicar:

> «imagina que...»

es demanarà:

> «fes-ho.»

Observar:

* on toca;
* què busca;
* on dubta;
* què interpreta;
* quan mira el mapa;
* quan deixa de mirar-lo.

No ajudar abans que sigui necessari.

---

# 44. Validació al carrer

Quan existeixi una versió funcional, les sessions més valuoses seran:

```text id="50ptrr"
donar objectiu
↓
deixar sortir usuari
↓
observar Activity
↓
entrevista posterior
```

No interrompre constantment l'activitat per fer preguntes.

---

# 45. Preguntes post-Activity

Després d'una prova real:

* què intentaves fer?
* què ha passat?
* què t'ha sorprès?
* què t'ha molestat?
* què no has entès?
* quina part ha tingut més gràcia?
* què faries ara si poguessis continuar?
* per on sortiries la propera vegada?

La darrera pregunta és una de les mètriques qualitatives centrals de TerritoriLord.

---

# 46. Indicador principal de producte

Una de les validacions més importants no és:

```text id="lb8s5i"
temps dins l'app
```

sinó:

```text id="ec73tt"
TerritoriLord
↓
genera una nova Activity física
```

El producte funciona quan:

> una informació del mapa provoca una decisió real de sortir.

---

# 47. Validació del core loop

El core es considerarà prometedor quan diferents usuaris mostrin espontàniament el comportament:

```text id="p7a7ay"
veig alguna cosa
↓
em genera curiositat/objectiu
↓
surto
↓
aconsegueixo resultat
↓
el nou mapa em genera un altre objectiu
```

---

# 48. Senyals d'alerta

Caldrà revisar el producte si repetidament apareixen patrons com:

* «No entenc per què ha passat això.»
* «Sempre faria la mateixa ruta.»
* «No miraria aquesta part del mapa.»
* «És massa complicat.»
* «He d'estar massa pendent del mòbil.»
* «Sense altres jugadors no serveix.»
* «Perdre això em faria abandonar.»
* «No aniria fins allà només per això.»
* «Em preocupa que sàpiguen on visc.»

Aquests feedbacks són més importants que opinions sobre colors o disseny visual inicial.

---

# 49. Senyals positius

Especialment valuosos:

* el validador proposa espontàniament una ruta;
* pregunta què hi ha sota una zona de Fog;
* vol recuperar una Flag;
* pensa en un lloc real on plantaria una UserFlag;
* identifica llocs del seu municipi per una TourismCampaign;
* proposa un comerç o POI real;
* pregunta quan podrà provar-ho.

No constitueixen per si sols validació comercial, però indiquen que la mecànica connecta amb comportaments reals.

---

# 50. Resultat d'una ronda

Després de diverses sessions cal generar:

```text id="dh5j3p"
VALIDATION-REPORT-XX
```

amb:

1. perfils entrevistats;
2. hipòtesis;
3. patrons;
4. problemes;
5. oportunitats;
6. contradiccions;
7. decisions afectades;
8. experiments nous;
9. recomanacions.

---

# 51. Què no ha de decidir un validador

Un usuari extern no decideix directament:

* arquitectura;
* H3;
* PostgreSQL;
* MapLibre;
* fórmula matemàtica exacta.

Pot aportar evidència que faci reconsiderar-les.

Però la decisió continua sent de producte/enginyeria.

---

# 52. Paquet per cada perfil

## Usuari esportiu

Utilitzar principalment:

```text id="8p6i82"
sections 4–18
24–29
45–49
```

## Turisme

Utilitzar principalment:

```text id="rpqp57"
sections 4
19–23
31
34
```

## Col·laborador tècnic

Utilitzar:

```text id="3ao4qu"
informe resum
+
GAME-SCENARIOS
+
EXPERIMENTS
+
section 32
```

## Possible comprador / soci

Utilitzar:

```text id="5ne27a"
informe resum executiu
+
model de negoci
+
roadmap
+
section 33
```

---

# 53. Principi final

> **La validació no serveix per demostrar que la idea és bona. Serveix per descobrir on la idea és incorrecta abans que sigui car canviar-la.**

L'objectiu de cada sessió és sortir-ne amb més informació, no amb més acord.
