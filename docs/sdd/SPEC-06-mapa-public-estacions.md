📄 SPEC-06 v0.3 — Mapa públic d'estacions de MeteoLord
Versió: 0.3
Estat: CANDIDATA A QA DOCUMENTAL
Data: 2026-09-16
SPEC paraigua: SPEC-00 v0.5 — pendent d'aprovació i no disponible íntegrament
SPEC base de fase: SPEC-10 v0.3 — fase A aprovada
Descoberta relacionada: SPIKE-04 v1.1 — Grafana/i2CAT, viable amb condicions
Naturalesa: reconstrucció refinada; no autoritza PLAN-06 ni implementació.

0. Autoritat, fonts i límits
Aquesta especificació defineix el comportament públic desitjat del mapa d'estacions. No selecciona motor cartogràfic, llibreria de gràfiques, sistema de tiles, arquitectura, base de dades ni topologia. Aquestes decisions corresponen a un futur PLAN-06, després de QA documental i aprovació explícita.

Com que no es disposa del contingut complet de SPEC-00 v0.5, qualsevol requisit que en depengui es conserva com a REQ-00 i no es considera confirmat. INFERIT identifica una reconstrucció que no pot convertir-se en decisió d'implementació sense validació de producte.

HA DE, NO POT i BLOQUEJA són normatius.

PENDENT requereix una decisió abans del PLAN-06.

INFERIT és una proposta de treball, no una font normativa.

Marca	Significat
FET-REPO	fet confirmat en documentació o evidència versionada
REQ-00	requisit atribuït a SPEC-00 pendent de contrast íntegre
REQ-06	requisit propi d'aquesta SPEC
SPIKE-04	condició de la descoberta Grafana/i2CAT
INFERIT	reconstrucció pendent de validació
PENDENT	decisió oberta que bloqueja el seu àmbit
1. Objectiu
Definir un mapa públic que permeti a un visitant no autenticat:

consultar únicament estacions i dades autoritzades per a publicació;

identificar una estació i el seu estat de disponibilitat o qualitat;

veure un resum actual i accedir a una fitxa per URL directa;

usar una alternativa textual funcionalment equivalent al mapa;

filtrar o cercar només elements del catàleg públic;

no rebre, deduir ni enumerar dades INTERNAL_ONLY.

2. Abast i exclusions
Inclou: mapa amb marcadors públics, resum, fitxa, llista alternativa, filtres/cerca condicionats als contractes pendents, proves negatives de la frontera INTERNAL_ONLY i validació local amb fixtures sintètiques.

Exclou: identitat, sessions, rols i fluxos de propietari; alta o aprovació d'estacions; ingesta, retenció i adaptadors; Grafana/i2CAT al mapa públic; canvis d'esquema, infraestructura o desplegament; dades privades i promoció.

3. Frontera de publicació i INTERNAL_ONLY
3.1 Principi fail-closed
Tota estació o camp sense classificació pública explícita és INTERNAL_ONLY. La decisió d'inclusió és autoritativa al backend: el frontend no pot convertir una dada interna en pública mitjançant filtre, cache, paràmetre o estat de UI.

3.2 Superfícies cobertes
La frontera s'aplica a marcadors, llista, modal, fitxa, cerca, filtres, comptadors, agregats, API pública, cache, logs, errors, sitemap i metadades. Cap d'aquestes superfícies pot revelar existència, ubicació, sensor, valor, estat o error d'una font INTERNAL_ONLY.

3.3 Fonts
Font	Estat públic per defecte	Condició
Ecowitt d'usuari	PENDENT	consentiment i política de publicació aprovats
ACA/hidrologia	PENDENT	llicència i permís de republicació acreditats
Open-Meteo/previsió	PENDENT	contracte públic i procedència aprovats
Grafana/i2CAT	INTERNAL_ONLY	no apareix en cap superfície pública
Que una font sigui consultable no acredita per si mateix que es pugui republicar. Grafana/i2CAT no pot passar a públic en aquesta SPEC.

4. Contractes que s'han de resoldre
4.1 Catàleg i publicació — BLOQUEJANT
Cada entrada del catàleg ha de definir origen, elegibilitat de publicació, estat operatiu, estat de qualitat, precisió geogràfica autoritzada, identitat pública estable, data de classificació i procedència.

PENDENT: qui aprova, quins criteris usa, com es revoca una publicació i quina invalidació s'aplica a mapa, cerca, cache i fitxa. Els fluxos dependents de rols no poden entrar en acceptació fins a SPEC-01.

PENDENT: política per a estacions duplicades o properes (mateix lloc, diferent font). Cal definir un llindar de proximitat i una regla de prioritat.

4.2 Qualitat de dades — BLOQUEJANT
La SPEC ha de definir estats observables: DISPONIBLE, SENSE_DADES_RECENTS, SOSPITOSA, EN_REVISIO i NO_PUBLICABLE. Qualitat i visibilitat són eixos diferents.

Transicions d'estat:

text
DISPONIBLE ←→ SENSE_DADES_RECENTS
     ↓                ↓
SOSPITOSA ←──── EN_REVISIO
     ↓                ↓
NO_PUBLICABLE ←───────┘
PENDENT: límit d'antiguitat, rellotge de referència, dades futures, llindars de sospita, actor revisor i conseqüències per a cada superfície.

Els valors nuls són desconeguts/no disponibles; no s'interpolen ni es substitueixen silenciosament. Els zeros són diferents dels nuls. DEFECT-01 continua caracteritzat i no corregit: cap contracte públic pot afirmar que una mesura afectada és fiable fins que la seva semàntica es validi.

4.3 Fitxa i històrics — BLOQUEJANT PER A DADES REALS
La fitxa només pot mostrar camps classificats com a públics. Cal fixar camps obligatoris, precisió d'ubicació, font, períodes històrics, estadístiques, dades absents i zona horària. Les gràfiques no poden ser l'única forma d'accedir a l'històric: cal una descripció i representació textual o tabular.

4.4 Cartografia i requests — BLOQUEJANT
El contracte cartogràfic ha d'especificar requisits de llicència, disponibilitat, privacitat, accessibilitat, rendiment, cache i degradació segura, sense triar tecnologia.

La prohibició de requests externs des del navegador s'ha de reconciliar amb qualsevol capa cartogràfica abans del PLAN-06. Si la capa no està disponible, la llista textual i la fitxa pública han de continuar funcionant sense revelar dades internes.

4.5 Àmbit geogràfic — PENDENT
Cal decidir bounding box, zoom inicial, política d'ubicació aproximada i si la geolocalització del visitant existeix. No es pot demanar ni usar ubicació del visitant per defecte; qualsevol ús ha de ser exprés, reversible i justificat.

5. Requisits funcionals
ID	Requisit	Traça
RF-MAP-01	El mapa HA DE mostrar només estacions PUBLIC_ALLOWED.	REQ-00 / SPIKE-04
RF-MAP-02	Cada marcador HA DE comunicar identitat pública, estat i resum autoritzat.	REQ-00 / REQ-06
RF-MAP-03	Les operacions de mapa HAN DE tenir equivalent de teclat.	REQ-06
RF-MAP-04	El mapa HA DE mostrar data/hora de la informació presentada.	REQ-06
RF-MAP-05	El resum d'una estació (modal) HA DE ser accessible per punter i teclat, i HA DE mostrar: nom públic, temperatura actual, humitat actual, data/hora de l'última dada, estat de qualitat i botó "Veure fitxa completa".	REQ-06
RF-MAP-06	La fitxa HA DE tenir URL directa i estable, i HA DE mostrar: tots els camps públics, historial (amb alternativa textual), gràfiques, ubicació (segons consentiment) i font de les dades.	REQ-00
RF-MAP-07	La fitxa HA DE respectar la mateixa frontera pública que el mapa.	SPIKE-04
RF-MAP-08	HA D'existir una llista textual equivalent als marcadors visibles.	REQ-00 / REQ-06
RF-MAP-09	Filtres i cerca NO PODEN enumerar elements INTERNAL_ONLY.	SPIKE-04
RF-MAP-10	L'actualització automàtica HA DE poder-se pausar o desactivar.	REQ-06
RF-MAP-11	La despublicació HA DE retirar l'element de totes les superfícies públiques.	REQ-06
RF-MAP-12	Una font o camp sense classificació pública NO POT aparèixer públicament.	SPIKE-04
RF-MAP-13	Quan no hi ha estacions públiques, el mapa HA DE mostrar un missatge informatiu, no un mapa buit.	REQ-06
RF-MAP-14	Durant la càrrega inicial, HA DE mostrar un indicador d'estat (spinner, skeleton o equivalent).	REQ-06
RF-MAP-15	Si l'API falla, la llista alternativa HA DE romandre funcional amb les dades en cache o mostrar un error clar.	REQ-06
RF-MAP-16	El catàleg HA DE definir una política per a estacions duplicades o properes (< llindar a definir).	REQ-06
RF-MAP-17	La interfície del mapa HA D'estar disponible en català.	REQ-06
RF-MAP-18	El sitemap públic HA D'incloure només les URL de les fitxes públiques.	REQ-06
RF-MAP-19	Les fitxes d'estacions INTERNAL_ONLY NO PODEN aparèixer al sitemap.	REQ-06
6. Requisits no funcionals
ID	Requisit	Traça
RNF-MAP-01	El rendiment HA DE definir dataset, dispositiu, navegador, cache, mètrica i percentil.	REQ-06
RNF-MAP-02	La interfície HA DE ser usable amb teclat, focus visible i sense keyboard trap.	REQ-06
RNF-MAP-03	La conformitat objectiu HA DE ser WCAG 2.2 AA, llevat de requisit contractual contrari.	REQ-06
RNF-MAP-04	Mapa i llista HAN DE reflow sense pèrdua d'informació ni funcionalitat.	REQ-06
RNF-MAP-05	Color, mida o icona no poden ser l'únic canal d'estat.	REQ-06
RNF-MAP-06	Cap request de navegador pot anar a un origen no autoritzat.	SPIKE-04 / SPEC-10
RNF-MAP-07	Cap secret, valor intern ni dada INTERNAL_ONLY pot aparèixer en logs o errors públics.	SPIKE-04 / SPEC-10
RNF-MAP-08	La degradació del mapa HA DE conservar llista, cerca i fitxa pública.	REQ-06
RNF-MAP-09	El tractament d'ubicacions d'estacions d'usuaris HA DE complir el GDPR.	REQ-06
RNF-MAP-10	L'usuari HA DE poder: consultar quines dades seves són públiques, revocar el consentiment i sol·licitar l'eliminació de les seves dades.	REQ-06
RNF-MAP-11	La ubicació pública per defecte HA DE ser aproximada, no precisa.	REQ-06
RNF-MAP-12	El grau d'aproximació HA DE ser configurable per l'usuari (mínim X metres, a definir).	REQ-06
RNF-MAP-13	L'API pública HA DE tenir un límit de peticions per IP per evitar abús.	REQ-06
RNF-MAP-14	Si s'usa analytics, HA DE ser respectuós amb la privacitat (sense cookies, sense fingerprinting).	REQ-06
RNF-MAP-15	Abans de MAP-C (publicació), s'han d'executar tests de càrrega per validar el rendiment sota concurrència.	REQ-06
7. Criteris d'acceptació de MAP-A local
MAP-A és l'única fase que pot preparar-se abans de dades reals. Usa exclusivament fixtures sintètiques.

ID	Criteri
CA-MAP-01	El catàleg sintètic usa classificació pública explícita.
CA-MAP-02	Mapa, llista, resum i fitxa mostren el mateix conjunt públic.
CA-MAP-03	Proves negatives demostren absència d'elements INTERNAL_ONLY a totes les superfícies.
CA-MAP-04	Navegació de teclat, focus, diàleg i llista alternativa passen proves definides.
CA-MAP-05	Gràfiques o resums històrics sintètics tenen alternativa textual equivalent.
CA-MAP-06	No hi ha requests de navegador a origen no autoritzat.
CA-MAP-07	Proves E2E sintètiques passen sense violacions CSP.
CA-MAP-08	La interrupció de la capa cartogràfica no filtra dades i conserva llista i fitxa.
CA-MAP-09	L'estat buit, l'estat de càrrega i l'estat d'error es mostren correctament.
CA-MAP-10	Els duplicats d'estacions es mostren segons la política definida.
CA-MAP-11	La interfície és disponible en català.
CA-MAP-12	L'API pública té rate limiting actiu.
MAP-B i MAP-C no s'autoritzen amb aquest document.

8. Riscos
ID	Risc	Impacte	Mitigació requerida
R-MAP-01	Exposició de dades INTERNAL_ONLY	crític	filtre backend fail-closed i proves negatives
R-MAP-02	Ubicació precisa sense consentiment	alt	contracte de precisió i publicació
R-MAP-03	Nuls, zeros o dades sospitoses mal interpretades	alt	contracte de qualitat i DEFECT-01
R-MAP-04	Dependència cartogràfica incompatible amb zero egress	alt	política de request i fallback
R-MAP-05	Divergència entre mapa i llista textual	alt	contracte compartit i proves d'equivalència
R-MAP-06	Rendiment no reproduïble	mitjà	benchmark normatiu complet
R-MAP-07	Actors o rols no definits	alt	excloure'ls de MAP-A fins a SPEC-01
R-MAP-08	Incompliment GDPR	crític	contracte de privacitat i consentiment
R-MAP-09	Estacions duplicades visibles	mitjà	política de duplicats al catàleg
R-MAP-10	Abús de l'API pública	mitjà	rate limiting
9. Decisions pendents i gates
ID	Decisió	Estat	Bloqueja
DCF-02	classificació de camps, fonts i visibilitat	PENDENT	catàleg, fitxa i API pública
DCF-03	qualitat, sospita i revisió	PENDENT	dades reals i criteris de fitxa
DCF-04	històrics, agregació i retenció	PENDENT	gràfiques i estadístiques
DCF-07	requisits de motor cartogràfic	PENDENT	PLAN-06
DCF-08	àmbit geogràfic i ubicació	PENDENT	experiència inicial
DCF-09	consentiment, aprovació i despublicació	PENDENT	estacions d'usuari públiques
DCF-10	llicència i republicació de fonts externes	PENDENT	ACA/Open-Meteo públics
DCF-11	política de duplicats d'estacions	PENDENT	catàleg
DCF-12	idiomes suportats	PENDENT	interfície
No es pot iniciar PLAN-06 mentre DCF-02, DCF-03, DCF-07 i DCF-09 no tinguin resolució aprovada, o mentre l'MVP no els exclogui explícitament.

10. Pipeline SDD
Contrastar la SPEC amb el contingut complet de SPEC-00 v0.5.

Resoldre decisions amb producte, dades, privacitat, accessibilitat i cartografia.

Fer QA documental de SPEC-06.

Aprovar explícitament la SPEC-06.

Redactar PLAN-06.

Fer QA del PLAN-06, TASKS-06 i implementació local sintètica.

11. Referències
SPEC-00 v0.5 — font paraigua pendent de contrast íntegre.

SPEC-10 v0.3 — fase A local aprovada.

SPIKE-04 v1.1 — frontera INTERNAL_ONLY.

DEFECT-01 — semàntica de zeros Ecowitt caracteritzada, no corregida.

WCAG 2.2 i pràctiques WAI-ARIA — referència d'accessibilitat.

Spatial Data on the Web Best Practices — publicació de dades geoespacials.

GDPR (Reglament UE 2016/679) — protecció de dades personals.

12. Historial
Versió	Data	Canvi
0.1	2026-09-12	esborrany reconstruït a partir de fragments
0.2	2026-09-16	refinament: frontera fail-closed, bloquejos de contracte, accessibilitat, qualitat i cartografia
0.3	2026-09-16	afegits: estats buit/càrrega/error, duplicats d'estacions, GDPR, modal vs. fitxa, sitemap, rate limiting, idioma, tests de càrrega
