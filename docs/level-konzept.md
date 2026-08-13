# Konzept „Mehrebenen-Grammatik" — die Level-Konzeptrunde

Auftrag des Auftraggebers (wörtlich): „die level sind alle noch viel zu einfach.
aktuell nur wand oder loch oder grube das muss ueber mehr ebenen gehen mehr
kombinationen. der marketingagent und der leveldesigner sollen ein konzept
erarbeiten dass die level optimal zur zielgruppe passen und das anforderungslevel
so ist, dass man das spiel unbedingt wieder spielen moechte mit erfolgserlebnissen
ohne das es zu leicht ist und nicht so schwer dass man irgendwann deprimiert ist
aber man darf sich schon mal anstrengen."

Vier Wortmeldungen in echter Wechselrede, jeweils gegen die Dateien geprüft:
Inventur → Leveldesigner (Fassung 1) → Marketing-Kritik → Leveldesigner
(Fassung 2, entscheidungsreif) → Marketing-Schlussabnahme. Das Konzept ist
**abgenommen**; drei Streitpunkte der Schlussabnahme bleiben dokumentiert offen
(Abschnitt 8). Nichts davon ist umgesetzt — dieses Papier ist der abgestimmte Plan.

---

## 1. Auftrag und Befund

Die Inventur (Datenbasis: `src/levels/index.ts`, `welt2.ts`–`welt5.ts`,
`docs/messlauf.json`, PLANS-Tabelle in `tests/levels.test.ts`) beginnt mit einer
Zahl, die vorab zu klären war: Im Code stehen **65 Level**, nicht die beworbenen
66 — w2-13 kam hinzu, aber die Streichkandidaten der Design-Runde wurden ersetzt
statt gestrichen. Das Konzept schließt die Lücke nicht durch stilles Absenken des
Versprechens, sondern durch ein neues Level dort, wo die neue Mechanik wohnt
(w3-14, Abschnitt 5); Marketing hat diese Lösung ausdrücklich bestätigt.

**Hat der Auftraggeber recht mit „aktuell nur wand oder loch oder grube"?**
Wörtlich nein — das Repertoire umfasst rund zwölf Raumformen (Wand, Loch, Grube,
Naht-Platte, Ader/Sohle, Schacht, Kammer, Etage, Kaskade, Deckel, Pfeiler/Riegel,
Pfercht), und W3/W4 haben mit Kammern, Etagen und Kaskaden echte eigene Räume.
Aber der Befund trifft dreifach ins Schwarze:

Erstens stimmt er in Welt 1 fast wörtlich: Neun von zehn W1-Leveln sind „ein
flacher Boden plus genau ein Merkmal" — und W1 ist das Schaufenster des Spiels.
Zweitens stimmt er als Bauprinzip für das ganze Spiel: Fast jedes Level ist EIN
Boden mit EINEM Merkmal; Level, die zwei Raumformen kombinieren, gibt es nur
sieben von 65, und das sind fast ausschließlich die Weltprüfungen. Drittens
benennt er, was fehlt: keine verwinkelten Höhlensysteme, keine Räume mit zwei
Zugängen, keine Rundwege, keine begehbare Decke außer w2-13 — jede Karte ist in
einem Blick von links nach rechts lesbar.

Die Ebenen-Zählung macht das messbar: **50 von 65 Leveln verbinden höchstens zwei
Höhenebenen**, und die Mehrheit der Zwei-Ebenen-Level ist dasselbe Schema
(„Oberfläche plus Sohle darunter" oder „Boden plus Blockkuppe"). Mehrere der
wenigen 3+-Ebenen-Level sind zudem passiv: In w4-01, w4-07 und w5-01 läuft der
Pulk die Kaskade ohne eine einzige Zuweisung hinunter. Aktiv verbundene
Drei-Ebenen-Räume, in denen jede Verbindung ein eigener Arbeitsschritt ist, gibt
es in W1/W2 außer w2-13 keinen einzigen.

Bei den Werkzeugen dasselbe Bild: Von 28 möglichen Berufspaaren sind rund **16
unbespielt**. Der Miner ist im ganzen Spiel ein Solist; der Schirm arbeitet nie
nach der Landung; „klettere hin, dann grabe" existiert nicht ein einziges Mal.
Die bespielten Kombinationen konzentrieren sich auf zwei Grundakkorde —
basher+digger (Schacht und Stollen, achtmal) und bomber+blocker+builder
(Abgrund-Brücke, sechsmal). Dazu trägt dieselbe Millimeter-Naht acht von 65
Leveln, und **W5 erbt weiterhin zehn von fünfzehn Altplänen unverändert** — die
in der Design-Runde beschlossene Rot-Test-Abnahme wurde dort nicht erfüllt,
mehrere Muster stehen in dritter bis fünfter Portion im Spiel, und w3-13 und
w5-15 sind geometrisch identische Finale zweier Welten.

Zwei Randbefunde der Inventur, die das Konzept gleich mit heilt: **w4-07
„Gegenwind" ist kaputt** (die Musterlösung rettet 12/12 mit null Zuweisungen, der
inszenierte Kletterer ist Attrappe), und das Marge-≥-2-Gesetz ist in **17 Leveln
mit Marge 0 verletzt** — ausgerechnet in den Gaben-Leveln, wo ein einziger
Fehltipp die Quote kostet.

Das Fazit der Inventur in einem Satz: Der Auftraggeber irrt im Wortlaut und
trifft im Kern — das Spiel besitzt zwölf Raumformen, benutzt aber pro Level fast
immer nur eine, verbindet meist höchstens zwei Ebenen, spielt sechzehn von
achtundzwanzig Berufspaaren nie und wiederholt seine drei Lieblingsakkorde durch
alle fünf Welten.

## 2. Zielgruppe und Flow-Regeln

Marketing beschreibt die Zielgruppe als drei Ringe, vom Kern nach außen — Zahlen
nur, wo wir sie selbst gesetzt haben (`docs/leben-entwurf.md`), der Rest ist
Branchenwissen ohne erfundene Statistik.

**Ring 1 — das spielende Kind, ca. 6–11.** Spielt auf Familientablet oder
Elternhandy in Häppchen von 10–15 Minuten, 2–3 pro Tag (darauf ist das
Lebensbudget gebaut). Die Frustrationstoleranz ist asymmetrisch: hoch bei
erkanntem eigenem Fehler, nahe null bei Unklarheit. Kinder wiederholen ein
verstandenes Level gern fünfmal, ein unverstandenes keinmal — Lesbarkeit ist
deshalb die wichtigste Währung des ganzen Konzepts. **Ring 2 — der mitspielende
Elternteil, ca. 30–45.** Kennt das Genre aus den Neunzigern, ist unser
Multiplikator (Rezension, Familienchat, Installationsentscheidung) und die
Gruppe, für die die Drei-Sterne-Kür gebaut wird: Erstsieg mit dem Kind,
Perfektion allein am Abend. **Ring 3 — Casual-Puzzle-Erwachsene, 25–55.** Spielt
hochkant, einhändig, in Wartesituationen und vergleicht uns nicht mit anderen
Lemmings-Spielen, sondern mit Match-3 — also mit Spielen, die in drei Sekunden
lesbar sind.

Konsequenz: **Das Spiel wird auf Ring-1-Klarheit gebaut und mit Ring-2-Tiefe
veredelt** — Erstsieg mit Marge, Kür über Par. Zwei Branchen-Wahrheiten als
Prüfstein: Bindung entscheidet sich in den ersten ein, zwei Tagen (W1/W2 sind
darum wichtiger als W5, auch wenn W5 die meiste Arbeit bekommt), und der
stärkste Rückkehrgrund im Puzzle-Genre ist nicht die Belohnung, sondern der
ungelöste, verstandene Plan im Kopf.

Daraus die verbindlichen **Flow-Regeln** (von Marketing gefordert, vom Designer
als Abnahmegesetze übernommen):

Erstsieg im Median nach höchstens 2–3 echten Versuchen pro Normal-Level, 3–5 bei
Meisterstücken; „echt" heißt nach der Schnupperfrist und ohne Uhr-Niederlagen,
die planmäßig kein Leben kosten. **Kein Level darf im Familientest im Median
mehr als 2 Leben kosten** — bei 5 Leben pro Tag ist das die mathematische
Definition von Deprimierung in unserem System. Nach jeder Niederlage muss der
Spieler den Grund in einem Satz benennen können (Benennungs-Test, Gegenstück zum
Silhouetten-Test). Und spätestens jedes dritte Level ist ein sicherer Sieg — bei
3–4 Mehrebenen-Leveln pro Sitzung garantiert das mindestens ein Erfolgserlebnis
pro Sitzung, weshalb diese Frequenz in allen fünf Welten hart gilt, ausdrücklich
auch in W5. Ein Durchatmer ist dabei nie wieder ein Par-0-Durchlauf, sondern ein
bekannter Baustein in neuer Silhouette: Kompetenzgefühl, kein Leerlauf.

Marketing hat zusätzlich den eigentlichen Deprimierungs-Kern des
Mehrebenen-Designs benannt, die **Verkettungs-Falle**: Wer Schritt 4 von 4
verpatzt, hat drei gelungene Schritte umsonst gemacht. Die Antwort des Konzepts
sind drei Stützen — die Fehler-Sichtbarkeitsregel (jede Zuweisung zeigt Erfolg
oder Misserfolg binnen 13 Sekunden, damit der Zeitrücklauf sie erreicht), die
Niederlagen-Tafel mit Fortschritts-Ansage („Zwei von drei Ebenen verbunden —
nur der Stollen saß zu hoch") und die antippbare Minimap als Pflicht-Feature.
Zusammen verwandeln sie die Niederlage in einen Plan, und ein Plan ist ein
Rückkehrgrund. Der „einen Versuch noch"-Moment ist präzise dieser: der Moment,
in dem der Spieler beim Scheitern die Lösung sieht.

Die roten Linien aus dem Leben-Entwurf bleiben unberührt: kein Countdown, kein
Rückhol-Push, keine Schwierigkeitsspitze, die Leben in Monetarisierung treibt.
Härte kommt in diesem Konzept aus Verkettung und Lesbarkeit, niemals aus Uhr,
Quote oder Vorrat — die bleiben Messgrößen (Faktor × Musterlösung, Marge ≥ 2).

## 3. Die Raumgrammatik — acht Bausteine

Drei Leitsätze tragen die Grammatik. **Härte aus Verkettung, nicht aus Zahlen:**
Jedes Level ab Weltmitte verbindet mindestens zwei Raumformen über mindestens
zwei aktive Ebenen, und jede Ebenen-Verbindung ist ein eigener Arbeitsschritt.
**Das Normhöhen-Raster:** Die Physik (Sturztod 78 px, Bauer +24 px je 12 Steine)
quantisiert die Etagen — E48 ist hinab frei und hinauf mit 2 Bauern erreichbar
(die billige Etage), E72 ist hinab frei, hinauf nur per Kletterer oder
3-Bauer-Kette (die Einbahn-Etage, sie erzeugt Richtung ohne Tod), E96/E120 sind
hinab nur mit Schirm, hinauf nur mit Kletterer (die Gaben-Etage). Krumme
Abstände wie die 70 px in w4-07 sind künftig verboten: Jeder Abstand erklärt
selbst, welches Werkzeug er verlangt. **Das Lesefenster-Gesetz:** Jede einzelne
Entscheidung passt in ein Zoom-1-Fenster (180×120), der ganze Knoten aus zwei
verbundenen Ebenen in ein 300×200-Fenster (darum Normbreite 720 px statt 960),
jeder Baustein ist als Minimap-Silhouette erkennbar, und es gibt höchstens zwei
gleichzeitige Arbeitsfronten, die zweite auf gleicher Höhe oder direkt unter der
ersten.

Die acht Bausteine, jeweils als Wortskizze:

**B1 Etagenturm (Silhouette „Leiter").** Drei bis fünf Böden im E48/E72-Wechsel,
versetzt gelocht; der Pulk pendelt zwischen den Wänden, jede Etage verlangt eine
Grabung an der richtigen Stelle — und ab W3 liegt auf manchen Böden Stahl unter
dem naheliegenden Grabpunkt, dann muss die Miner-Schräge den Versatz holen. Der
geborene Hochformat-Baustein.

**B2 Galerie über der Halle (Silhouette „Balkon").** Oben ein schmaler Balkon,
darunter im Abstand E96 die große Kammer mit dem Ausgang; hinunter geht es nur
per Schirm, und nach der Landung ist die Arbeit nicht vorbei — die Halle ist zur
Ausgangsseite verschlossen, der Gelandete sticht sie durch (floater+basher, nie
zuvor gespielt). Der Spieler sieht das Ziel unter seinen Füßen: die sichtbare,
noch unverstandene Lösung, laut Marketing der stärkste „einen Versuch
noch"-Mechanismus des Genres.

**B3 Haarnadel (Silhouette „Haarnadel").** Oberfläche nach Osten bis zur Wand,
dort E72 hinab in einen Stollen, der nach Westen zurück unter dem Hinweg zur Tür
unter dem Eingang führt. Miner-Schräge trifft Basher-Stollen — die naheliegendste
nie gespielte Verkettung, dazu das emotionale Heimkehr-Motiv: Aus einer Karte
wird eine Geschichte.

**B4 Umweg-Schleife (Silhouette „Ring").** Der direkte Weg ist sichtbar
versperrt; ein Kletterer steigt über die Mauer und gräbt dahinter den Durchlass
für den Pulk auf. climber+digger bzw. climber+miner — der Baustein, der die
persönliche Gabe endlich mit Arbeit verkettet, statt sie als Transitticket zu
verbrauchen; der wartende Pulk vor der Mauer ist sichtbare Dramaturgie.

**B5 Kaskade, aktiviert (Silhouette „Treppe").** Die Treppenform bleibt, aber
jeder zweite Absatz verlangt einen Handgriff: eine E96-Stufe (Schirm), ein Spalt
(Bauer), ein Riegel (Basher). Aus dem passiven Hinunterlaufen wird ein
Werkzeug-Sampler entlang einer Linie — die geborene Durchatmer-Form, nie ein
Weltfinale.

**B6 Kammer mit zwei Zugängen (Silhouette „Doppeltor").** Eine Kammer im Fels,
erreichbar oben (Schacht, kostet Schirm) und seitlich (Stollen, kostet Basher
und Zeit). Beide Wege lösbar, aber nur einer hält Par — die erste echte
Routenwahl des Spiels und das Muster der Drei-Sterne-Kür: Der dritte Stern ist
eine andere Route, nicht dieselbe Route fehlerfreier. Beide Zugänge liegen in
einem 300×200-Fenster, sonst wäre es keine Wahl, sondern eine Suche.

**B7 Kaminzug (Silhouette „Kamin").** Zwei Wände bilden einen Schacht bis unter
die Felsdecke; der Kletterer steigt auf, kehrt am Deckel um und fällt unter 78 px
auf ein Innenpodest. w2-13 hat es bewiesen — es bleibt kein Einzelstück, sondern
wird W2-Grammatik. „Die Decke ist ein Weg" ist laut Marketing der eine Satz, der
das Spiel von jedem Klon unterscheidet; stärkste Werbe-Silhouette.

**B8 Weiche, überlebbar (Silhouette „Gabel").** Eine Kante teilt sich in E48
(alle überleben) und E96 (nur Schirm); ein Blocker vor der Gabel bestimmt, wer
wohin geht, und beide Wege laufen vor der Tür wieder zusammen. Der
Mehrpulk-Einstieg. Der tödliche Sortierer ist gestrichen — Tod als Sortierer ist
mit Herzschutz und Familienspiel unvereinbar.

Gestrichen sind außerdem die Millimeter-Naht als eigenständiges Level (achtmal
im Spiel ist genug; sie bleibt Zutat, nie mehr Hauptgericht — auf kleinen
Bildschirmen ist sie ein Feinmotorik-Filter, der genau Ring 1 aussiebt) und der
Schirmregen ab der zweiten Portion. Die Marketing-Rangfolge der Bausteine nach
Bindungswirkung (B2, B6, B7, B3 vorn; B4, B8, B1, B5 als Didaktik und Takt)
streicht keinen — sie steuert die Platzierung: Die Bindungsträger sitzen an
Weltmitten und -enden und in jedem Werbematerial, der Rest ist Takt und Lehre.

Zum Mehrpulk-Denken hält das Konzept fest, was ein Rätsel trägt und was nicht:
Der Blocker-Split trägt (zwei Fronten, Wiedervereinigung per Freisprengung,
darum Marge ≥ 3, damit die Sprengopfer nie die Quote fressen). Die Gaben-Weiche
trägt am schönsten — die Zuweisung von n Kletterern ist die Routenentscheidung,
reine Denkarbeit ohne Timing-Stress. Der Rate-Zeitversatz (Pionier-Moment) trägt
nur als Zutat, höchstens zweimal pro Welt. Zwei Fallhöhen tragen nur überlebbar.

## 4. Kombinationsmatrix

Von den sechzehn unbespielten Berufspaaren nimmt das Konzept **neun** in Dienst —
gezielt dort, wo ein Baustein sie erzwingt, nicht als Pflichtquote:

| Neue Kombination | Trägt Baustein | Debüt | Pointe |
|---|---|---|---|
| miner+basher | B3 Haarnadel | W3 | Schräge mündet in Stollen — die Ansatzhöhe entscheidet, ob der Stollen die Tür trifft |
| miner+digger | B1 Turm | W3/W4 | Stahlkappen zwingen pro Etage zur Wahl: senkrecht oder schräg |
| climber+digger | B4 Schleife | W2 | Gabe und Arbeit verkettet; der Pulk wartet sichtbar vor der Mauer |
| climber+miner | B4 schwer | W4 | der Durchlass ist eine Schräge auf die Ebene darunter |
| floater+basher | B2 Galerie | W3 | der Schirm arbeitet nach der Landung |
| floater+miner | B2-Variante | W4 | Landung in der Halle, Schräge zur tieferen Tür |
| blocker+basher | B3/B8 | W2 | der Blocker als Wender: alle starten ostwärts, der Weststollen braucht die Umkehr |
| bomber+digger | B6 | W4 | der Schacht endet vor einer Erdwand, die Bombe öffnet seitlich — der bisherige Köder wird Lösung |
| climber+bomber | B7 | W5 | Kaminzug mit gesprengtem Podestdeckel, erstmals außerhalb eines Finales |

Dazu in W5 zwei Tripel als Meisterstücke: climber+digger+builder (B4+B1) und
miner+basher+floater (B3+B2). Der Miner wird damit vom Solisten (heute viermal
solo) zum meistvernetzten Beruf — er ist das einzige Werkzeug, das Ebenen
diagonal verbindet, also der natürliche Motor einer Mehrebenen-Grammatik. Die
zwei alten Lieblingsakkorde (basher+digger, bomber+blocker+builder) bleiben
erlaubt, aber je höchstens zweimal pro Spielhälfte.

## 5. Staffelung über die fünf Welten

Jede Welt behält ihre Mechanik, bekommt einen Leitbaustein und ein Weltziel als
Satz; innerhalb der Welt gilt strikt einführen (Positionen 1–3: ein Baustein,
Marge ≥ 3) → kombinieren (Mitte: Baustein plus bekannter Akkord) → meistern
(letzte ein bis zwei: zwei Bausteine). Der Durchatmer-Takt gilt überall.

**W1 Grasland — „Das Spiel lernt Höhe."** Führt das Normhöhen-Raster ein (E48
erleben, E72 sehen) und B5 light. Der Lehrgang w1-01 bis w1-07 bleibt unantastbar
und lebensfrei; w1-08 wird Mini-B8 mit zwei echten Ebenen — das Store-Versprechen
„dieses Spiel wird räumlich" steht damit schon im Lehrgang. Acht Level bleiben,
zwei werden umgebaut, keines ersetzt.

**W2 Kristallklamm — „Die Decke ist ein Weg."** Führt B7 Kaminzug und B4
Schleife ein (climber+digger debütiert), dazu der blocker+basher-Wender. Die
verbliebenen W1-Klone w2-03/w2-04/w2-08 werden zu B7/B4-Einführungen umgebaut;
ab w2-05 kein Level mehr ohne genutzte Decke oder zweite Ebene. Acht bleiben,
drei Umbauten, zwei Ersatzbauten.

**W3 Rostwerk — „Stahl erzwingt den Umweg."** Führt B3 Haarnadel und B2 Galerie
ein (miner+basher und floater+basher debütieren). Die beste Substanz des Spiels
bleibt weitgehend stehen; w3-04 bekommt die Rate-Fenster-Fassung, w3-05 wird
entklont, w3-10 die bewiesene Quote 8/16. **Neu kommt w3-14 „Unter dem Hinweg"**
als Weltmeisterstück miner+basher — damit ist die beworbene 66 wieder wahr.

**W4 Frostklamm — „Wähle deinen Weg."** Führt B1 aktiv, B6 Routenwahl und die
Doppelfront ein (bomber+digger, climber+miner debütieren). w4-01 wird als Kaskade
aktiviert, **w4-07 repariert** (Absatz auf E96, der Kletterer wird echt, Par
misst neu), w4-10 wird Doppelfront-Blaupause; erstes Zwei-Fronten-Pflichtlevel.

**W5 Schlot — „Zwei Welten in einem Level."** Führt nichts Neues ein — jedes
Level verbindet zwei Bausteine aus zwei verschiedenen Welten. Die zehn grün
geerbten Altpläne werden durch **acht Ersatzbauten** ersetzt (darunter die zwei
Tripel-Meisterstücke); w5-15 wird vom w3-13-Zwilling getrennt (gespiegelt plus
B6-Zweitzugang — zwei Welten dürfen nicht mit demselben Meisterstück enden);
w5-10 bleibt nur nach bestandenem Rot-Test. Damit wird die in der Design-Runde
beschlossene, aber nicht erfüllte Rot-Test-Abnahme nachgeholt, nicht erneut
vertagt. Härtebudget und Durchatmer-Takt gelten unvermindert.

Die ehrliche Aufwandsbilanz (Fassung 2, korrigiert gegenüber Fassung 1):

| | W1 | W2 | W3 | W4 | W5 | Summe |
|---|---|---|---|---|---|---|
| unverändert | 8 | 8 | 10 | 8 | 5 | **39** |
| umgebaut | 2 | 3 | 3 | 5 | 2 | **15** |
| neu/ersetzt | 0 | 2 | 1 | 1 | 8 | **12** |
| Welt gesamt | 10 | 13 | 14 | 14 | 15 | **66** |

Dazu quer durch alle Welten 17 Wertkorrekturen (Marge-0-Heilungen — Werte, nie
Geometrie) und vier Code-Features. Der Schwerpunkt liegt bewusst auf W5, die
Auslieferung beginnt aber am anderen Ende (Abschnitt 7): Bindung entscheidet
sich im Frühspiel.

## 6. Messbares Anforderungsprofil

Kern der Abnahme ist die Profiltabelle je Weltdrittel. „Zug" ist eine Zuweisung
der Musterlösung (= Par-Basis); alle Werte werden im Familientest erhoben und in
`messlauf.json` protokolliert (neue Spalten `medianVersuche`, `medianLeben`,
`benennung`). Uhr und Quote folgen unverändert der Messregel — Uhr = Weltfaktor ×
Musterlösung (bei gesetzter Drossel mit gedrosselter Rate gemessen, damit die
Pionier-Wartezeit in der Messung steckt), Quote = Messung − Marge.

| Kriterium | Drittel A: einführen | Drittel B: kombinieren | Drittel C: meistern |
|---|---|---|---|
| Bausteine | genau 1 (neu) | 1 + bekannter Akkord | 2 (W5: aus 2 Welten) |
| Aktive Ebenen | 1–2 | ≥ 2 ab Weltmitte (Pflicht) | ≥ 2, max. 2 Fronten |
| Par (Züge) | ≤ 4 | ≤ 7 | ≤ 10 |
| Marge | ≥ 3 | ≥ 2 (Split ≥ 3) | ≥ 2 (Split ≥ 3) |
| Median Fehlversuche | ≤ 1 | 1–2 | 2–3 (Meisterstück 3–5) |
| Median Leben | ≤ 1 (W1: 0) | ≤ 1 | ≤ 2 (hart) |
| Lesbarkeit | Aufgabe ohne Scrollen in einem 300×200-Fenster; Silhouetten-Test 4/5 | Knoten in einem 300×200-Fenster; erste korrekte Zuweisung im Median ≤ 45 s nach „Los" | Startklappen-Lesemodus Pflicht; Minimap benennt beide Bausteine |
| Aha-Moment (Tester benennt korrigierten Plan UND startet freiwillig neu) | nicht gefordert | ≥ 1 | ≥ 1, plus Fortschritts-Ansage je Kettenschritt |
| Fehler-Sichtbarkeit | ≤ 13 s je Zuweisung | ≤ 13 s | ≤ 13 s; max. 2-Bauer-Ketten |
| Benennungs-Test | 4/5 | 4/5 | 4/5 |
| Kür-Route ≠ Erstsieg-Route | — | ab W3: zählt zur 4-pro-Welt-Quote | ab W3: Pflicht für mind. 1 Meisterstück |
| Härtebudget | 0–1 Verstärker | ≤ 1 Verstärker | ≤ 2 von {Uhrfaktor, Rate, Doppelfront} |

Kein Wert dieser Tabelle setzt eine Uhr oder Quote — es sind Prüfhürden, die
Uhr und Quote weiter aus der Messung entstehen lassen. Fällt ein Level durch,
wird Geometrie oder Lesbarkeit geändert und neu gemessen; Zahlen werden nie
direkt „passend gedreht".

Vier Regelungen verdienen die Begründung im Wortlaut, weil sie aus der
Wechselrede entstanden sind:

**Die Startklappe** (statt des von Marketing geforderten Uhrstarts bei erster
Zuweisung, dessen Mechanismus der Designer mit Spielgesetz zurückwies — Uhr und
Simulation brauchen dieselbe Nullsekunde, und Rate-Fenster-Level takten
deterministisch ab Levelstart): Jedes Level ab Weltmitte beginnt im Lesemodus —
Auslass zu, Uhr steht, Karte frei schwenkbar, Minimap antippbar; erst „Los"
öffnet die Klappe und startet Uhr und Simulation gemeinsam. Planen kostet
nichts; „Denken ist gratis" wird sichtbares Ritual statt unsichtbarer Regel.
Marketing hat diese Lösung in der Schlussabnahme als der eigenen Forderung
überlegen anerkannt.

**Die 13-Sekunden-Regel** (Präzisierung der Marketing-Forderung „kein Schritt
länger als das Rücklauffenster", die wörtlich physikalisch unerfüllbar wäre):
Jede Zuweisung der Musterlösung macht ihren Erfolg oder Misserfolg binnen 13
Sekunden sichtbar; in Ketten-Leveln höchstens 2-Bauer-Ketten. Sichtbarkeit des
Fehlers ist das, was wir verkaufen — nicht Teleport-Rücklauf.

**Das Härtebudget:** Höchstens zwei der drei Verstärker {Uhrfaktor der Welt,
Rate-Zutat, Doppelfront} pro Level; in W5 höchstens zwei Level zugleich Tripel
und Doppelfront, und die stehen nicht direkt hintereinander. Das ist die Antwort
auf die W5-Wand-Warnung — jede Zutat war einzeln begründet, die Summe war es
nicht.

**Die Kür-Quote** (statt der Marketing-Forderung „der dritte Stern ist immer
eine andere Route", die der Designer für B1/B5 konstruktiv und wegen des
Lesefensters zurückwies): Ab W3 tragen mindestens vier Level pro Welt eine
Par-Route, die von der Erstsieg-Route verschieden ist; B6 ist das Muster.

**Abnahmegesetze, Endstand:** (1) Musterlösung im Testlauf; (2) Uhr = Weltfaktor
× Messung, mit Drossel gemessen; (3) Quote = Messung − Marge ≥ 2, Split ≥ 3;
(4) Rot-Test bei geerbter Geometrie; (5) 44-px-Doktrin; (6) kein Akkord in
dritter Portion; (7) ≥ 2 aktive Ebenen ab Weltmitte; (8) Silhouetten-Test;
(9) Fehlversuchs-Metrik (Median ≤ 2–3 bzw. 3–5, ≤ 2 Leben) samt Benennungs-Test
4/5; (10) Fehler-Sichtbarkeit ≤ 13 s je Zuweisung, max. 2-Bauer-Ketten in
Kettenleveln; (11) Härtebudget und Durchatmer-Fenster von drei Leveln in allen
fünf Welten.

## 7. Umsetzungsplan in Paketen

Die Reihenfolge folgt der Retention-Logik: Frustsenkung vor Neubau, Frühspiel
vor Finale, W5 zuletzt — dort ist die meiste Arbeit, aber die geringste
Abwanderungsgefahr, denn wer W5 erreicht, ist gebunden. Jede Zwischenstufe ist
ein vollständig konsistentes Spiel.

**Paket 0 — Heilung und Werkzeuge** (0 neue Level, 17 Wertkorrekturen, 4
Code-Features). Die 17 Marge-0-Verstöße heilen (+1 Gabe oder −1 Quote, je nach
Messung); Niederlagen-Tafel mit Fortschritts-Ansage; Startklappe ab Weltmitte;
Minimap antippbar; `messlauf.json` erweitern. Messung: Familientest-Stichprobe
vorher/nachher, erwartet sinkende Median-Leben auf allen Gaben-Leveln. Rot-Tests:
keine (keine Geometrieänderung). Marketing hat den Vorrang dieses Pakets
ausdrücklich gefordert — es ist die billigste Frustsenkung der ganzen Liste.

**Paket 1 — Frühspiel W1+W2** (5 Umbauten, 2 Ersatzbauten). w1-08 → Mini-B8,
w1-10 gemäß beschlossener Fassung 2; w2-03/w2-04/w2-08 → B7/B4-Einführungen mit
blocker+basher-Wender; zwei W2-Ersatzbauten. Familientest für w1-08 als erstes
Mehrebenen-Erlebnis des Spiels. **Rot-Tests: w2-03, w2-04, w2-08** — der alte
W1-Klon-Plan muss unter der neuen Geometrie scheitern.

**Paket 2 — W3** (3 Umbauten, 1 neues Level). w3-04 Rate-Fenster-Fassung (Uhr
aus gedrosselter Messung); w3-05 entklonen; w3-10 Quote 8/16; **w3-14 „Unter dem
Hinweg" neu** — damit steht die 66. Messung: Profil C für w3-14 inklusive
13-s-Regel; Kür-Routen-Quote der Welt prüfen. **Rot-Tests: w3-05 und w3-14 gegen
alle Alt-Pläne aus PLANS.**

**Paket 3 — W4** (5 Umbauten, 1 Ersatzbau). w4-01 Kaskade aktivieren; w4-07
reparieren (Absatz auf E96, Par neu messen); w4-10 Doppelfront mit Marge ≥ 3;
w4-13/w4-14 Margen heilen; ein B6-Routenwahl-Ersatzbau. Messung: erstes
Zwei-Fronten-Pflichtlevel gegen das Lesefenster-Gesetz, Median-Leben ≤ 2 hart.
**Rot-Tests: w4-07** (der alte Trick ohne echten Kletterer muss scheitern)
**und w4-10.**

**Paket 4 — W5** (2 Umbauten, 8 Ersatzbauten). w5-15 vom w3-13-Zwilling trennen;
w5-10 nur nach bestandenem Rot-Test, sonst achter Ersatz; acht Ersatzbauten als
Zwei-Bausteine-Level nach Härtebudget, darunter die zwei Tripel. Messung:
Familientest für alle acht Ersatzbauten und beide Tripel zusätzlich zum Rot-Test
(der Rot-Test beweist Lösbarkeit, der Familientest Zumutbarkeit);
Durchatmer-Fenster über die ganze Welt. **Rot-Tests: jedes W5-Level einzeln —
der geerbte Plan muss unter den neuen Werten scheitern** (die beschlossene
K1-Abnahme der Design-Runde, jetzt nachgeholt).

**Paket 5 — Gesamtabnahme** (0 Level). Silhouetten- und Benennungs-Tests über
alle neuen und umgebauten Level mit Nichtspielern; Renderläufe der vier
Werbe-Silhouetten (Kamin, Galerie, Haarnadel, Turm) für Marketing; Endprüfung
der Bilanz und der Durchatmer-Fenster über Weltgrenzen. Für den Store gilt die
Marketing-Vorgabe: Kaminzug zuerst, Galerie zweitens, Haarnadel drittens — kein
W1-Flachland in den ersten drei Screenshots.

## 8. Offene Streitpunkte der Schlussabnahme

Marketing hat das Konzept in Fassung 2 abgenommen; von den dreizehn
Kritikpunkten der ersten Runde wurden elf voll übernommen und zwei mit
begründeter Änderung gelöst (13-s-Präzisierung, Startklappe statt Uhrstart,
Kür-Quote statt Kür-Pflicht — alle drei hat Marketing akzeptiert). **Drei Punkte
bleiben ausdrücklich strittig** und sind hier als abweichende Meinungen
festgehalten:

**Strittig 1 — W5-Umfang als Terminrisiko** (Marketing). Acht Ersatzbauten plus
Familientests sind das größte Einzelpaket ohne definierten Rückfallplan.
Marketing verlangt einen **Meilenstein-Check nach vier Ersatzbauten mit
Abbruchoption auf dreizehn W5-Level**, falls die Familientests Nacharbeit
erzwingen. Der Designer hat dazu nicht mehr Stellung genommen; der Check ist bei
Paket 4 einzuplanen.

**Strittig 2 — der 45-Sekunden-Wert in Drittel B ist ungetestet** (Marketing).
„Erste korrekte Zuweisung im Median ≤ 45 s nach Los" ist eine gesetzte Zahl ohne
Datenbasis — sie kann zu lasch oder zu streng sein. Marketing trägt sie als
vorläufigen Wert mit, verlangt aber **nach Paket 1 eine Kalibrierung aus echten
Familientest-Daten**, bevor sie Abnahmegesetz wird.

**Strittig 3 — Startklappe erst ab Weltmitte** (Marketing). Wenn der Lesemodus
Markenkern-Feature ist, sollten W1-Spieler ihn kennenlernen — genau dort
entscheidet sich die Bindung. Marketing akzeptiert die Staffelung vorläufig
(W1 braucht die Klappe mechanisch nicht), meldet aber an: **Fällt w1-08 im
Familientest bei „Verstehen vor Start" durch, kommt die Klappe auch nach W1.**

Der Marketing-Pitch der Schlussabnahme fasst zusammen, was das Konzept dem
Auftrag antwortet: Wuselwerk ist das Puzzle, das nie bestraft, sondern immer
antwortet — jedes Level zeigt seine Aufgabe, bevor man einen Finger rührt,
jede Niederlage sagt binnen Sekunden warum und wie weit man schon war, und der
dritte Stern flüstert, dass es noch einen klügeren Weg gibt. Anstrengen ja,
deprimieren nie; der Grund zum Wiederkommen ist der Plan im Kopf.

---

## Nächster Schritt für den Auftraggeber

Das Konzept ist entscheidungsreif und von beiden Rollen getragen. Ein
**„umsetzen"** startet Paket 1 (Frühspiel W1+W2); die Heilungen und
Code-Features aus Paket 0 werden dabei als Vorlauf im selben Zug erledigt, weil
Marketing ihren Vorrang zur Bedingung gemacht hat. Danach folgen die Pakete 2–5
in der beschriebenen Reihenfolge, jeweils mit Messlauf- und Rot-Test-Abnahme.
