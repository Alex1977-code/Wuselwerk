# Merkliste

Gesammelte Vorhaben. Was erledigt ist, bleibt mit Verweis stehen — die Liste
ist auch das Gedächtnis dafür, **wo** etwas umgesetzt wurde.

## Name und Titel — erledigt

- ✅ **Fünf Buchstaben** für die Figur: **WUSEL**, Nachsatz „die
  Wuselwerker" (Stil „Sonic – the Hedgehog"). Titelbildschirm mit Parade,
  Schirmspringer und wippendem Schriftzug: `src/render/titel.ts`.

## Weltauswahl — erledigt

- ✅ **Senkrecht**: Das Band läuft die Hochachse hinauf, die erste Welt
  unten, Aufstieg über Hang-Terrassen (`src/render/weltkarte.ts`,
  `welten.ts`, Nachtrag in `docs/weltkarte-entwurf.md`).
- ✅ **Musik schon auf der Karte** (seit der Kritikrunde, Besetzung
  „karte").

## Leben und Versuche — Grundsystem erledigt

- ✅ Tagesbudget **5 Leben** (Marketing-Untersuchung samt Regeln und
  Warnungen: `docs/leben-entwurf.md`), Abzug nur bei Niederlage oder
  Abbruch nach 30 s, Mitternachts-Reset, Herz-Chip auf der Karte.
- ✅ Fenster bei leerem Vorrat: **Video ansehen → 1 Leben**, höchstens 3 am
  Tag — in dieser Fassung ehrlich ohne Werbefilm.
- ✅ **Testmodus** unbegrenzt: `?test` an der Adresse.
- ⬜ **Echte Werbevideos** — erst mit Parental Gate (siehe Entwurf, Warnung 1).
- ⬜ **Kaufbare Pakete** gegen Geld — braucht Store-Anbindung.

## Leveldesign

- ✅ **Schwierigkeitskurve nach der Design-Runde** (Auftrag: „zu einfach,
  wiederholen sich ab Welt 1"): Plan in `docs/leveldesign-runde.md`, alle
  vier Pakete umgesetzt — Herzschutzregel + lebensfreier Lehrgang,
  Messlauf (`docs/messlauf.json`) und Rot-Test-Harness, Zahlenpass
  W1–W5, fünf Blaupausen (eine im Messlauf ehrlich widerlegt und durch
  die Ostwache ersetzt), w2-13 neu, drei W5-Ersatzlevel (Glutregen,
  Kessel, Kaskade und Steg), sieben Rot-Tests.
- ✅ **Feinentklonung, Rest**: w2-06 (Nahtversatz, war schon rot),
  w2-08 (44er-Spalt verlangt die Kette), w2-12 (Schlucht +20, alte
  Brücke zu kurz), w3-05 (Tür westlich + Ostwache) — je mit Rot-Test.
  w2-03 und w2-10 sind bewusst Zweitübersetzungen ohne Rot-Test:
  Klettern ist dauerhaft, jede Geometrie, die den geerbten Kletterplan
  schlüge, schlüge jeden Plan — dort schärft der Werkzeugschnitt.
- ✅ **Mehrebenen-Konzept, Paket 0+1** (`docs/level-konzept.md`):
  Paket 0 — 16 Margen-Heilungen (Quote = Messung − 2, w2-05 als
  dokumentierte Taktgeber-Ausnahme), Niederlagen-Tafel mit
  Fortschritts-Ansage, Startklappe/Lesemodus ab Weltmitte (Karte frei,
  Uhr steht, „Los" öffnet), Minimap im Lesemodus antippbar. Paket 1 —
  w1-08 „Die Weiche" als Mini-B8 (E48/E96 auf dem Normraster, schwebende
  Platten), w2-03 „Der Kamin" (B7 + Grabungs-Finale), w2-04 „Die hohle
  Mauer" (B4-Schleife, climber+digger-Debüt, zwei Grabungen derselben
  Figur), w2-06 „Durch zwei Böden" (B1 im Kleinen, Stahl erzwingt den
  Versatz), w2-07 „Über den Deckel" (man läuft AUF dem Deckel zur Tür),
  w2-08 „Gegenstrom" (Wender, blocker+basher-Debüt). Vier neue
  Rot-Tests, alle Werte aus dem Messlauf. w1-10 trug die beschlossene
  Fassung 2 bereits.
- ✅ **Mehrebenen-Konzept, Paket 2** (Welt 3): w3-04 „Taktstrasse" als
  Rate-Fenster-Fassung (Musterlösung drosselt, Uhr an der gedrosselten
  Messung geeicht — rettet nebenbei 19 statt 18, Marge 2); w3-05 → „Die
  Galerie" (B2, floater+basher-Debüt: der Schirm arbeitet nach der
  Landung, zwei Rot-Tests); **w3-14 „Unter dem Hinweg" neu** (B3
  Haarnadel, miner+basher-Debüt: Riegel, Westschräge auf die Stahlsohle,
  Stollen zurück unter dem Hinweg zur Tür unter dem Eingang; Gräber als
  Stahl-Köder). Abnahme wörtlich nach Konzept: Rot-Test gegen **alle 65
  Altpläne** — er fand einen echten Trivialpfad (Einzelschräge zur
  Kammer), der mit Blech vor dem Riegel und einer Stahl-Ostwand
  geschlossen wurde. Damit ist die beworbene **66** wieder wahr.
- ✅ **Mehrebenen-Konzept, Paket 3** (Welt 4): w4-01 „Die Kante" als
  aktivierte Kaskade (B5: Riegel-Rammung, dann der Schacht aufs
  Zwischenbord, bevor die sichtbare 120er-Ostkante erreichbar wird; alle
  krummen 70er der Welt auf das Normraster gehoben); w4-06 → **„Das
  Doppeltor"** (B6-Routenwahl-Ersatzbau statt des erklärten
  w4-02-Klons: Stollen vom Eisboden hält das Par, der Firn-Spalt mit
  Grube, Wächter und Freisprengung ist schneller, kostet aber zwei
  Vergaben mehr und ein Leben — bomber+digger, der bisherige Köder wird
  Lösung; beide Routen grün getestet); w4-07 „Gegenwind" repariert
  (die alte Fassung rettete 12/12 mit null Zuweisungen, weil die
  Stufenkante über dem Pfeilerkopf lag — jetzt Pfeiler 96, Kletterer
  echt, Par neu gemessen auf 8); w4-10 „Vier Kanten" als **erstes
  Zwei-Fronten-Pflichtlevel** (der Schacht im Firn-Fleck teilt den Pulk
  nach Fallrichtung; die Ostfront gräbt sich im Sohlen-Stollen unter der
  Terrasse zurück — niemand kann sterben, Marge 3). Dazu w4-04 als
  nachgeholte Marge-Heilung (Messlauf zeigte Marge 1); w4-13/w4-14
  waren schon in Paket 0 bzw. der Design-Runde geheilt. Sechs neue
  Rot-Tests (darunter die beiden Konzept-Pflichten w4-07 gegen den
  Attrappen-Trick und w4-10 gegen beide Ein-Front-Altpläne), Uhren auf
  W4-Faktor 1,4 geeicht. **Zwei Blaupausen ehrlich widerlegt:** Die
  „Wiedervereinigung per Freisprengung" nach Blocker-Split kollabiert in
  diesem Regelwerk (Tür fängt eine Laufrichtung immer von selbst; die
  Fallrichtungs-Weiche des Schachts trägt den Split stattdessen), und
  die Bauer-Kette aus der Grube trägt nie — eine vom Boden steigende
  Rampe hat unter ihren ersten Stufen eine Tasche, wer westlich des
  Fußes pendelt, kommt nie zum Einstieg (gemessen; Bergung darum als
  Sohlen-Stollen). Auch die Raster-Arithmetik des Konzepts war zu
  optimistisch: Ein Bauer steigt 12, ein Kettenglied 10 — „E48 mit zwei
  Bauern" hieße in Wahrheit fünf.
- ✅ **Mehrebenen-Konzept, Paket 4** (Welt 5, das größte Paket): Die
  Weltregel heißt jetzt wörtlich „Zwei Welten in einem Level". **Acht
  Ersatzbauten** für die acht verbliebenen Koordinaten-Klone: w5-01
  „Die Gabel im Krater" (B5+B8), w5-02 „Unter der Kruste" (B1-Krusten +
  B3-Schräge — das nie gespielte Paar miner+digger), w5-03 „Galerie in
  der Glut" (Durchatmer: B2 gespiegelt, ein Schirm für jeden, niemand
  kann sterben), w5-05 „Schacht und Stollen" (B6 in der Urfassung:
  Schacht kostet Schirm, Stollen hält das Par — beide Routen grün
  getestet), w5-06 „Der Deckelpfad" (Durchatmer: B7-Deckel), **w5-07
  „Schleife und Steg"** (Tripel 1 climber+digger+builder: Dreierkette
  über den Spalt-Pfercht, dann die bewiesene hohle Mauer; die
  Pfercht-Gefangenen werden per Kletterer geborgen), w5-09 „Kaminzug"
  (climber+bomber-Debüt: Kaminzug mit gesprengtem Podestdeckel,
  Blankeis-Rand schützt die Fall-Linie, der Wächter ist der
  Sprenganker), **w5-11 „Unter der Galerie"** (Tripel 2
  floater+miner+basher: Schirm, Ostschräge, Sohlen-Stollen — das
  w3-14-Fenster gespiegelt). **Zwei Umbauten:** w5-12 „Zwei Hände"
  (Westspalt 44 — die geerbte Zweierkette kippt in den Pfercht), w5-15
  „Prüfung im Schlot" (gespiegelt plus B6-Zweitzugang: die Firn-Luke
  im Blech über dem Riegel hält das Par, Naht und Riegel bleiben als
  bewiesene Zweitroute — zwei Welten enden nicht mehr mit demselben
  Meisterstück). Die **K1-Abnahme ist nachgeholt**: Jedes W5-Level hat
  seinen Rot-Test gegen den geerbten Quellplan (zehn neue, fünf
  bestehende). Der Marketing-Meilenstein-Check nach vier Ersatzbauten
  (Strittig 1) fiel positiv aus: Margen 4/3/3/3, Uhren auf Faktor 1,4,
  keine Tode in den Musterlösungen — kein Abbruch auf dreizehn Level
  nötig. Nebenbei geheilt: w5-14 (Marge 1 → 2) und die Keeper-Uhren
  w5-04 (Faktor 1,12 → 1,4) und w5-10 (1,13 → 1,4). Neue Messbefunde
  dokumentiert: der 120er-Kettenfall am offenen Doppelschacht (w5-02,
  vier Tote im ersten Wurf — Etage 2 darum 48 dünn), der 95er-
  Kuppensturz der Zweierkette (w5-07, darum Dreierkette und flacher
  Pfercht) und die Ein-Punkt-Falle der Rammer-Vormerkung über
  gefrästem Boden (w5-11: nur mit Fuß auf der Stahlsohle).
- ✅ **Mehrebenen-Konzept, Paket 5 — Gesamtabnahme**
  (`docs/gesamtabnahme.md`): Messregeln über alle 66 Level bestanden und
  als Abnahme-Asserts im Messlauf-Test verankert (Marge ≥ 2,
  Drittel-A ≥ 3, Uhrfaktor ≥ 1,3, Überschuss ≥ 1; Ausnahme w2-05
  dokumentiert). Zehn letzte Wertheilungen (w2-01, w3-01, w3-02, w4-02,
  w4-12-Uhr, w5-06/12/13/14-Vorräte, w1-04-Musterlösung). Alle vier
  Weltgrenzen öffnen mit einem sicheren Sieg; drei Anspannungs-Strecken
  begründet dokumentiert, w5-09..11 als Familientest-Beobachtungspunkt.
  Nichtspieler-Panel (drei Prüfer): Benennungs-Test 22/22, blinde
  Lesbarkeit 16/22 (die sechs sind Meisterstücke — das Bild zeigt die
  Aufgabe, nicht die Antwort); ein Verwechslungspaar innerhalb einer
  Welt (w4-01/w4-07) als Grafik-Feinschliff notiert. Vier
  Werbe-Renderläufe nach Store-Vorgabe (Kaminzug w5-09, Galerie w3-05,
  Haarnadel w3-14, Turm w5-02). **Damit ist das Level-Konzept
  vollständig umgesetzt** — offen bleibt nur, was echte Menschen
  brauchen: der Familientest.
- ✅ **Spieltest-Runde** (Panel bedient den echten Build im Browser,
  Bericht in `docs/gesamtabnahme.md` §6): Fand einen **Blocker**, den
  keine Papierprüfung sehen konnte — in vier Balkon-Leveln (w3-05,
  w5-03, w5-10, w5-11) starb der unbeaufsichtigte Pulk binnen 34–45
  Sekunden über der Kante, darunter ausgerechnet die Baustein-Einführung
  und ein ausgewiesener Durchatmer. Geheilt mit der **Schuttlippe** an
  der Kante (zwölf hoch: über Stufenhöhe, unter Rammtiefe): Der Pulk
  wartet sicher, bis der Rammer das Tor schlägt — die W4-Pferchtregel,
  jetzt auch in W2/W3/W5. Dazu zwei Bedienfallen entschärft: Der
  „Los"-Knopf des Lesemodus überdeckte die Übersichtskarte (Kartentipp
  und Zoomgeste starteten das Level), und der Totenkopf zündete ohne
  Rückfrage neben der Pause — jetzt schärft der erste Tipp, der zweite
  zündet.
- ✅ **Spieltest-Runde, zweite Hälfte** (Erstkontakt und Systeme,
  `docs/gesamtabnahme.md` §6b): Der **stumme Tipp** ist behoben — wer
  ohne Berufswahl ins Spielfeld tippt, sieht die vorrätigen Knöpfe
  aufleuchten; auch der Griff nach einer Figur, die gerade nicht kann,
  bekommt sein sichtbares Nein. Der **Lesemodus gilt jetzt für jedes
  Level, das nicht ins Bild passt** (statt „ab Weltmitte") — der von
  Marketing vorgesehene Fall Strittig 3 ist eingetreten. **w1-03 „Der
  Abgrund"** bekommt einen Schluchtgrund 72 tief: überlebbar, ohne
  Rückweg (die Testperson scheiterte sechsmal mit 20/20 Toten). Die
  **Niederlagen-Ansage** lief aus dem Bild und zeigte dadurch falsche
  Zahlen — sie bricht jetzt um, die Tafel wächst mit. Das **Sterntor**
  antwortet auf einen Tipp („Noch 6 Sterne — dann öffnet sich das
  Tor."), und seine Plakette liegt über der Wanderfigur statt darunter.

- 🔄 **Auf hundert Level** (Auftrag: „gerne anspruchsvoll und über mehr
  Ebenen, Ziel sind 100 Level"). **Zwei Entscheidungen vom 19.08.2026:**
  Die Zahl heisst **104, nicht 100** — Welt 1 ist beim Neubau von 10 auf 14
  gewachsen, und kein gemessenes Level wird weggeworfen, nur damit eine Zahl
  rund aussieht. Und die **Weltkarten-Grafik kommt nach Welt 7**, nicht
  davor. Konzept abgenommen und dokumentiert
  (`docs/welt-6-7-konzept.md`) — zwei neue Welten in der Grasland-Familie,
  **w6 Sonnenhang** (Terrassen im Nachmittagslicht, Leitbaustein B1
  Etagenturm, getragen von der aufwärts begehbaren Baggerschräge) und
  **w7 Wipfelweide** (ein Wald von oben, Leitbaustein B7 Kaminzug, die
  Decke ist der Gegner), zu je 17 Leveln. Drei Leveldesigner haben
  unabhängig entworfen, ein Chef-Designer abgenommen — und dabei einen
  Rechenfehler aller drei Entwürfe korrigiert: **Ein Bauer hebt zwölf
  Bildpunkte, nicht vierundzwanzig** (im Code nachgerechnet), was jede
  Kettenlänge im Papier verdoppelte. **Fundament gebaut:** zwei ThemeIds,
  zwei Paletten (getrennt durch das Licht, nicht die Grundfarbe:
  Nachmittagssonne von Westen mit Horizont gegen Blattlicht von oben ohne
  Horizont), zwei Ambiente-Betten, zwei Musikstücke, Kartendekor und
  Weltregistrierung. **Gebaut und gemessen: die ersten drei Level**
  (Sonnenhang 1–3, Uhrfaktor 1,41–1,43, Marge 3, Überschuss 4–5) — damit
  hat das Spiel **69 Level**. Der Rest wird Level für Level nachgezogen;
  die Karte meldet nur, was gemessen ist.

## Grafik

- ✅ Der **Hintergrund im Spiel**: Anmutung **dreidimensionaler und
  moderner** — sechs Maßnahmen nach Grafik-Direktion (Dunst-Höhenverlauf,
  Himmelskörper mit Bloom, Nebelbänke auf eigener Parallaxe-Ebene, Korn
  gegen Banding, Vignette, statische Lichtbahnen), alles vorgebacken,
  `src/render/scene.ts`.
- ✅ **Gelieferte Grafiken eingebaut** (Lieferung in `grafik/`, Aufbereitung
  `scripts/grafik-aufbereiten.py`, Blätter in `src/art/ui/`): drei
  Kulissenbänder (entfärbt, zur Laufzeit je Welt eingefärbt, gespiegelt
  gekachelt — `src/render/kulisse.ts`), Wolkenband, Erd-Reliefkachel
  (nur Boden-Welten, `terrainView.ts`), gemalte Berufsknöpfe, Titelbild +
  Wortmarke (`titel.ts`), Welttafeln als Kopfplatten, Weltembleme
  (Kopfzeile + Torbogen), Bild-Laternen und Belohnungsembleme auf der
  Karte (`weltkarte.ts`). Jeder Abnehmer behält den prozeduralen Rückfall.
  **Bewusst nicht eingebaut:** `avatar_1/2` (nur zwei der zwölf Varianten,
  noch die Zu-gleich-Fassung — wartet auf die korrigierten Prompts aus
  grafikbedarf §3.9), `schirm_2D`/`Schirm_3D.glb` (Thema der
  Backe-Pipeline, §3.10), `symbol` (App-Icon kommt weiter aus dem GLB),
  `tafel` (§3.13, Mechanik fehlt noch), `kulisse_saum` (§3.11 — „erst
  zeigen, dann entscheiden": nimmt Spielfläche).
- ✅ Die **Posenknöpfe unten**: Symbol trägt die Lesbarkeit, Figur bei der
  Arbeit daneben, wo Platz ist (Rückmeldungsrunde nach der Kritik).
- ✅ **Berufsleiste neu** (Befund: „die Grafiken der Berufsleiste sind
  leider nicht selbsterklärend"). Die Ursache war messbar: Acht Knöpfe
  nebeneinander sind auf einem 390 Punkte breiten Telefon
  fünfunddreissig breit, und der Name wurde erst ab sechsundfünfzig
  gezeichnet — die Bedingung war nie erfüllt, seit es die Leiste gibt.
  Drei Änderungen: **vier mal zwei statt acht nebeneinander** (jeder Knopf
  fünfundsiebzig breit, Preis rund vierzig Punkte Spielfeldhöhe); auf
  jedem Knopf steht jetzt der **Name** in einer Grösse für alle
  (Kurzform `SKILL_KNOPF`, jede die Wurzel des vollen Namens, den die
  Hinweiszeile beim Wählen ausschreibt); und jeder Beruf, der die Figur
  durch die Welt trägt, bekommt eine **Richtungsmarke** — dieselbe kleine
  Scheibe, nur gedreht: Kletterer hinauf, Brückenbauer schräg hinauf,
  Rammer geradeaus, Schrägbagger schräg hinab, Gräber hinab, und die
  Steigungen der beiden Schrägen sind die echten aus der Simulation (1:2).
  Die drei ohne Marke sagen mit dem Fehlen ebenfalls etwas Wahres. Die
  arbeitende Figur ist vom Knopf verschwunden: Vier Bilder auf
  fünfundsiebzig Punkten heben sich gegenseitig auf. `layout.ts`,
  `hud.ts`, `icons.ts`, Abnahme `tests/leiste.test.ts` (jeder Knopf trägt
  auf jedem Gerät seinen Namen — hoch wie quer, iPhone SE bis Tablett).
- ✅ **Kletterzug angestrengt** (Befund: „beim Hochklettern muss die Figur
  sich sichtbar mit einem Ruck Stück für Stück hochziehen, das muss
  angestrengt aussehen, die Haare müssen mehr im Takt des Rucks
  wackeln"). Der Ruck war schon da, aber unsichtbar, und die Bildfolge
  hat gezeigt warum: Die vier gebackenen Kletterbilder unterscheiden sich
  fast nicht — sie zeigen eine Figur, die an der Wand *hängt*. Vier
  Änderungen in `kletterZug`: Der Zwischenschritt zwischen zwei
  Simulationspunkten (`w.timer % CLIMB_INTERVAL`) vervierfacht die
  Auflösung der Bewegung; der Aufschwung bekommt **Überschwung** (die
  Figur schiesst über den Griff und fällt darauf zurück); der Körper
  **kippt und längt sich** um den Fusspunkt; und für die Dauer des Rucks
  leiht sich der Kletterer die **Bilder des Hochziehens** — die einzige
  Reihe im Blatt mit einem Arm, der ausgreift. Deren eigene Grundneigung
  (0,20 gegen 0,06) wird dabei genau verrechnet, sonst liegt die Figur
  während jedes Zugs halb waagerecht an der Wand. Das Haar schwingt jetzt
  mit dreifacher Stärke nach und pendelt in den Halt hinein aus statt am
  Zugende abzureissen. `src/render/scene.ts`, Abnahme
  `tests/klettern.test.ts`.
- ✅ **Avatare** zur Auswahl: **zwölf gemalte Porträts** vom Blatt
  (`src/art/ui/avatare.webp`, Zeichner `src/render/avatare.ts`, Liste
  `src/profil.ts`) — je Variante eigene Haarfarbe, Haarsilhouette und
  Scheibenfarbe nach der korrigierten Prompt-Liste (grafikbedarf §3.9).
  Die alte Ringfarbwahl bleibt als Rückfall, solange das Blatt nicht
  entschlüsselt ist.
- ✅ **Weltkarte detaillierter** (Auftrag „mehr Detaillierung, mehr
  Grafiken"): Jede Terrasse trägt jetzt eigenes Dekor in der Sprache ihrer
  Welt — Grasland Bäume, Büsche und Zäune, Kristallklamm Schollen,
  Rostwerk Schrotttürme, Frostklamm Tannen, Schlot rauchende Schlote. Die
  Requisiten stehen in der abgedunkelten Farbe ihrer eigenen Terrasse
  (Luftperspektive: fern wird blasser UND kontrastärmer) und werden mit
  ihr gezeichnet, sodass die nächstnähere Terrasse ihre Füße überdeckt —
  daraus wird aus drei Farbbändern eine Landschaft mit Tiefe. Dazu ein
  Himmelskörper mit Hof je Welt (abwechselnd links/rechts, er sagt auch,
  woher das Licht auf die Terrassen fällt), die **gemalten** Wolken- und
  Kulissenbänder statt gezeichneter Kreise (dieselben Blätter wie im
  Spiel, je Welt eingefärbt gebacken und zwischengespeichert) — und die
  Wegmitte bleibt frei, damit nie etwas auf Punkten, Sternen oder Figur
  steht. Alles deterministisch gestreut: Kein `Math.random` je Bild, sonst
  wanderten die Bäume sechzigmal in der Sekunde. `src/render/weltkarte.ts`.
- ✅ **Gesicht der Figur repariert** (Befund: „die Figur hat Fehler").
  Der Figur hingen drei blaue Keile über den Augen — Ponyfransen, die auf
  der Haut endeten statt am Haaransatz. Das Bemerkenswerte: Der Code kannte
  die Regel und schrieb sie auf („die Spitzen bleiben oberhalb von -0,2
  Achsen, damit sie nie in die Augen hängen") und brach sie im selben
  Atemzug — die Tabelle stand auf -0,08, -0,14 und -0,06, und der
  Gesichtspunkt liegt auf **Augenhöhe**. Diese Figur hat keine freie Stirn,
  die Haarkante sitzt auf den Brauen; zwischen Ansatz und Auge ist kein
  Platz für eine Franse. Pony und vordere Kotelette sind deshalb ersatzlos
  weg — die Silhouette brechen Zackenkamm und Randkranz ohnehin. Dazu:
  Scheitellinien und Glanzstrich zurückgenommen (sie lasen sich als
  aufgemaltes Y), Randkranz enger an die Kuppel. Und der Haarschwung des
  Kletterzugs dreht jetzt **nur noch den Kamm**: Die gesichtsnahen Strähnen
  hängen an einem Kopf, der gebacken ist und stillsteht. `src/render/band.ts`,
  `src/render/atlas.ts`, Abnahme `tests/figur.test.ts` — sie misst den
  Zeichner mit einem Aufnahme-Kontext aus und hält fest, dass keine Haarform
  bis auf Augenhöhe reicht, bei keiner Drehung und keinem Schwung.
- ✅ **Eigene Hintergrundmusik je Level** (Auftrag: „jedes level bekommt eine
  eigene hintergrundmusik"). Statt eines Stücks je Welt-Thema montiert
  `src/audio/musikbau.ts` je Level ein Stück aus einer **Motivfamilie**:
  Kopf, Wendungen, Antworten, Mittelteile, Läufe, Schlüsse, Kadenzen und
  Flächenfarben — jeder Baustein einzeln abgenommen, nur der Zusammenbau
  ist erzeugt. Damit ist jeder Takt, den ein Kind hört, einmal von einem
  Menschen geschrieben worden; ein freier Generator besteht jedes Gesetz
  und kann trotzdem nicht wissen, ob ein Lied gut ist. Dazu diatonische
  Operatoren (Sequenz und Umkehrung auf Leiterstufen), eine Formgrammatik
  und drei Kopfrhythmen. Feste Welt-Identität: Tonart, Tempo,
  Geräuschleiter und Fanfare wechseln **nicht** je Level — `tonart()`
  reicht sie an Geräusche und Stinger weiter, die Welt hätte sonst keine
  Tonart mehr. `docs/musik-abnahme.md` §8. Abnahme: elf neue Tests über
  **alle** gebauten Level.
  **Nebenbefund, seit der ersten Auslieferung im Spiel:** Die Harmoniespur
  spielte modusfremde Töne — Kristallklamm in 5 von 8 Takten, Rostwerk
  5/8, Frostklamm 6/8, Schlot 4/8. In der Höhle stand über B ein Cis,
  während das Stück in A-dorisch läuft. Ursache war die Flächenfarbe als
  festes Halbtonintervall über der Akkordwurzel; jetzt steht sie in
  **Leiterstufen**, damit ein modusfremder Ton nicht mehr formulierbar ist.
- ✅ Grafikbedarf vom Grafik-Subagenten: `docs/grafikbedarf.md`.
- 🔨 **Welt 1 neu — Berufs-Grundkurs und Prüfung** (Auftrag: „in welt 1
  hätte ich gern level zum basics lernen jeden berufs und danach muss das
  anspruchsvoll werden, ab level drei braucht es mindestens 3 berufe").
  Der abgenommene Bauplan von Leveldesigner, Marketing und Chefdesigner
  steht in `docs/welt-1-neu.md`: vierzehn Level statt zehn, Level 1 und 2
  mit je genau **einem** Knopf, Level 3 bis 8 mit je **einem neuen plus
  zwei gelernten** Berufen — zwei bekannte plus ein neuer sind exakt die
  geforderten drei, damit fällt der Grundkurs mit der Regel zusammen statt
  vor ihr zu liegen. Level 9 bis 14 kombinieren ohne Neuzugang.
  Eingebaut sind bereits die zwei Entscheidungen, die nicht an der
  Levelzahl hängen: **ganz Welt 1 ist lebensfrei** (vorher nur w1-01 bis
  w1-07 — kein Spieler darf seine allererste Sitzung an der Lebensgrenze
  beenden) und der **Erkundungs-Freibetrag**, der die erste Niederlage in
  einem noch nie gewonnenen Level überall einmalig gratis macht. Das ist
  die Brücke zwischen Lemminge-Härte und Tagesbudget: 1991 kostete ein
  Neustart nichts, bei uns fünf Leben am Tag — Härte plus Budget ohne
  Freibetrag ergäbe ein feindseliges System.
  **Offen:** Die vierzehn Level stehen gebaut in `src/levels/welt1.ts`,
  sind aber noch **nicht verdrahtet**. Sechs messen grün, sieben nicht;
  die gefundenen Ursachen und die Musterlösungen stehen im Kopf der Datei
  und in `tests/welt1-plaene.ts`. Ausgeliefert wird erst, was der Messlauf
  bestätigt hat.

## Spieler und Bestenliste

- ✅ **Spielername + Avatar**, lokal, Profil-Tafel auf der Karte.
- ✅ **Bilanz dieses Geräts** (Level, Sterne) in der Profil-Tafel.
- ⬜ **Weltweite Bestenliste mit Platzanzeige** — braucht Server, Konten und
  geprüfte Ergebnisse. Warum, und wie der saubere Ausbaupfad aussieht
  (Replay der deterministischen Simulation): `docs/bestenliste-entwurf.md`.
