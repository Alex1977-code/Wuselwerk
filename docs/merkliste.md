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
- ✅ **Avatare** zur Auswahl: **zwölf gemalte Porträts** vom Blatt
  (`src/art/ui/avatare.webp`, Zeichner `src/render/avatare.ts`, Liste
  `src/profil.ts`) — je Variante eigene Haarfarbe, Haarsilhouette und
  Scheibenfarbe nach der korrigierten Prompt-Liste (grafikbedarf §3.9).
  Die alte Ringfarbwahl bleibt als Rückfall, solange das Blatt nicht
  entschlüsselt ist.
- ✅ Grafikbedarf vom Grafik-Subagenten: `docs/grafikbedarf.md`.

## Spieler und Bestenliste

- ✅ **Spielername + Avatar**, lokal, Profil-Tafel auf der Karte.
- ✅ **Bilanz dieses Geräts** (Level, Sterne) in der Profil-Tafel.
- ⬜ **Weltweite Bestenliste mit Platzanzeige** — braucht Server, Konten und
  geprüfte Ergebnisse. Warum, und wie der saubere Ausbaupfad aussieht
  (Replay der deterministischen Simulation): `docs/bestenliste-entwurf.md`.
