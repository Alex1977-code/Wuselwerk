# Spielkritik: Wuselwerk

**Stand: 12. August 2026.** Geprüft am gebauten Spiel (`npm run build:single`,
`dist/wuselwerk-single.html`) im echten Browser bei 390 × 844 (dreifach) und
844 × 390, über mehrere Level (w1-01, w1-03, w1-04, w1-05, w1-07), mit Sieg,
Niederlage, Lupe, Auswahl-Fächer, Sprengung, Pause und Weltkarte. Alle
Bildschirmabzüge liegen unter `art-src/proben/kritik-*.png` und sind im Text
verlinkt. **Der Klang lief in einer Umgebung ohne Lautsprecher** — bewertet ist
er über den Quelltext (`src/audio/`), die Messwerte der Rauchprobe und die
dokumentierten Abnahmen; was nur ein Ohr prüfen kann, ist unten ausdrücklich
als Prüfauftrag für einen Tester mit Kopfhörern formuliert.

Alle Empfehlungen halten die Projektvorgaben ein: eine einzige HTML-Datei ohne
Nachladen (Bilder nur als eingebettete Data-URIs, Klang nur synthetisiert),
deterministische Simulation (Abwechslung im Bild darf nur aus dem Zeichner
kommen, gesät je Figurennummer — nie `Math.random()` im Spielzustand), die
abgenommenen Notenfolgen in `src/audio/music.ts` bleiben unangetastet, keine
Markennamen, niemals grüne Haare mit blauer Tunika.

---

## 1. Kurzurteil

Wuselwerk fühlt sich heute wie ein ungewöhnlich gut durchdachtes Gerüst an, in
dem an einer Stelle schon ein fertiges Spiel wohnt: Die Steuerung — Fokuszeit,
Lupe, intelligentes Zielen, Auswahl-Fächer — ist die beste Arbeit im Projekt
und besser als in den meisten veröffentlichten Genrevertretern, und die
gebackene Chibi-Figur hat echten Charme. Drumherum ist aber vieles noch
Platzhalter: Der Boden ist gefärbtes Rauschen, Tür und Luke sind Rechtecke mit
Verlauf, die Weltkarte ist fast leer, das dramatischste Ereignis des Spiels
sieht aus wie vierzig orangefarbene Quadrate, und nach zehn Leveln ist Schluss.
Wer den Prototyp spielt, glaubt sofort, dass daraus ein empfehlenswertes Spiel
werden kann — er hält nur noch keins in der Hand.

---

## 2. Die drei Noten

### Grafik: 5/10

Es gibt eine tragfähige Bildidee (gemalter Tag, warme Erde, goldenes Tor, eine
Maschine, die nicht hierher gehört) und einen echten Hingucker: die Figur, aus
einem 3D-Modell gebacken, mit Signal-Stirnband und gezeichnetem Gerät je Beruf
(`kritik-13-lupe.png`). Ausgangsschein, Grasnarbe, frischer Bruchsaum und die
Übersichtskarte sind richtig gedacht. Aber die vier größten Flächen des Bildes
— Erde, Hintergrund-Hügel, Tür, Luke — bestehen aus den einfachsten
Canvas-Befehlen, die das Spiel kennt, und bei jedem Zoom (Lupe!) zerfällt das
Bild in Matsch (`kritik-15-nah.png`). Der Pulk besteht aus identischen,
taktgleichen Klonen, die Bedienleiste aus Drahtgitter-Symbolen, die Weltkarte
aus grauen Punkten in leerem Himmel, und die Einblendungen kennen weder
Übergang noch Feier. Das ist solide Prototypgrafik — von „ein anspruchsvoller
Spieler bemerkt nichts Fehlendes" trennt sie sichtbar viel.

### Sound: 7/10

Die höchste Note, und sie ist verdient — mit einem Vorbehalt. Der Aufbau ist
weit über Prototypniveau: zwei Hallwege (Nähe fest, „Luft" je Welt),
tempogekoppeltes Echo, monokompatibles Stereo, 3-3-2-Groove mit Swing und
Mikroversatz, Bandsättigung, Hochpass bei 85 Hz, Senke bei 4,2 kHz gegen den
Handylautsprecher-Plastikton — und die Geräusche stehen in der Tonart des
laufenden Stücks, die Trippelschritte auf dessen Achtelraster, die Brücke
spielt beim Bau eine aufsteigende Leiter, die Musik reagiert auf die Lage
(knappe Zeit: Melodie raus, Uhrentick rein). Ereignisabdeckung ist fast
vollständig, die Dichte- und Stimmenregeln sind durchdacht. Was fehlt, ist
benennbar: Menü und Weltkarte sind **stumm**, im ganzen Spiel ist nur **eines**
der beiden komponierten Stücke erreichbar, das Panorama wird **gewürfelt statt
geortet**, und die Fokuszeit — das Markenzeichen der Steuerung — hat keine
klangliche Entsprechung. Der Vorbehalt: **Die Klangfarbe blieb ungehört.** Ob
Drehleier, Streicher und Erdschlag auf einem echten Gerät tragen oder doch
nach Synthesizer klingen, kann nur ein Tester mit Kopfhörern sagen; die
bisherige Rückmeldungsgeschichte („zu laut, zu flötenartig, zu eintönig")
zeigt, dass hier schon zweimal nachgearbeitet werden musste.

### Spielspaß: 6/10

Der Kern trägt. Die Fokuszeit macht das Antippen einer 12-Pixel-Figur unter
Zeitdruck tatsächlich beherrschbar, der Fächer löst das Gedränge sauber auf
(`kritik-14-faecher.png`), die Levelreihe lehrt pro Level genau ein Konzept,
und das Drei-Sterne-System (Quote / alle / unter Par, Par erst nach dem ersten
Sieg sichtbar) ist klug. Aber: Es gibt **zehn** Level in **einer** Welt — ein
geübter Spieler ist in gut einer Stunde durch, und danach gibt es nichts, das
ihn zurückholt. Jeder Fehler ist endgültig (kein Zeitrücklauf, nur Neustart),
die Lupe verliert ihr laufendes Ziel aus dem Bild (`kritik-05-lupe.png`), ein
danebengegangener Tipp verpufft ohne jede Rückmeldung, vergebene Berufe sind im
Pulk kaum wiederzufinden (`kritik-10-bruecke.png`), und der Rammer verlangt ein
Timing-Fenster von wenigen Pixeln — eine offene Frage, die das Projekt selbst
im README stellt. Das Fundament ist ein 8, der heutige Umfang und die
Härtefälle drücken es auf 6.

---

## 3. Grafik — die Lücken zur 10

Sortiert nach Wirkung: was ein Spieler zuerst und am längsten sieht.

### G1. Boden: Erde, Fels, Stahl sind gefärbtes Rauschen — **groß**

- **Befund:** Die Erde ist eine Grundfarbe mit gleichverteiltem Korn und
  Tiefenverlauf (`terrainView.ts`). Auf Armlänge geht das durch
  (`kritik-04-lauft.png`), aber die Lupe vergrößert 2,5-fach und der Zoom
  3-fach — und genau dort, wo das Spiel selbst hinzoomt, wird der Boden zu
  weichgezeichnetem Schmirgelpapier ohne ein einziges benennbares Merkmal
  (`kritik-15-nah.png`). Der Stahl ist ein flacher Grauton mit Nietenpunkten
  (`kritik-17-quer.png`), der Fels eine gesprenkelte Platte, die vor dem Himmel
  wie ein schwebender Betonriegel endet — ohne Kante, ohne Saum
  (`kritik-18-tod.png`).
- **Soll:** Gemalte, kachelbare Materialtexturen (z. B. 128 × 128, als
  Data-URI eingebettet, in Weltkoordinaten abgetastet), mit Struktur auf drei
  Größenordnungen (Feuchtflecken, Steine und Wurzeln, Feinkorn). Prüfbar: Ein
  Abzug wie `kritik-15-nah.png` (Zoom 3) zeigt an der Grabkante
  **durchgeschnittenes Material** mit erkennbaren Kieseln statt Matsch; Erde
  und Fels sind auch in Graustufen unterscheidbar; der Stahl liest sich als
  Metall (Bahnen, Fase, Nietenreihe), nicht als Grauband. Der frische
  Bruchsaum und die Grasnarbe bleiben Code — sie hängen am Ort der Grabung.
  (Die ausgearbeiteten Prompts dafür stehen schon in `docs/grafik-luecken.md`
  §3.1–3.3.)

### G2. Hintergrund und Spielfläche verschwimmen — **mittel**

- **Befund:** Drei Parallaxebenen sind gebaut und bezahlt, aber die vorderste
  Hügelschicht ist eine große, glatte Grünfläche, auf der die Figuren optisch
  „laufen", obwohl sie Hintergrund ist. In `kritik-11-zuendschnur.png` und
  `kritik-18-tod.png` liegt unter der dünnen Terrainkruste eine riesige grüne
  Fläche — sie sieht begehbarer aus als mancher echte Boden. Die Bäume sind
  flache Vektor-Lollis mit Kerbe, alle aus derselben Form
  (`kritik-06-graebt.png`).
- **Soll:** Spielfläche und Kulisse trennen sich auf einen Blick: Hintergrund
  entsättigt/aufgehellt und leicht verdunstet (Luftperspektive konsequent bis
  zur vordersten Schicht), spielbares Terrain mit dunkler Konturlinie oder
  Randschatten am freien Rand. Prüfbar: Ein Level wie w1-07 in Graustufen —
  man zeigt mit dem Finger fehlerfrei, wo gelaufen werden kann. Dazu zwei,
  drei Baum-Silhouettenvarianten und Bewuchs-Tupfer, damit der Kamm nicht wie
  gestempelt wirkt.

### G3. Ausgangstür und Falltür sind Platzhalter — **mittel**

- **Befund:** Die zwei Fixpunkte jedes Levels. Die Tür ist ein cremefarbener
  Bogen aus drei Rechtecken — bei Zoom 3 ein riesiges, strukturloses Feld
  (`kritik-15-nah.png`, links unten). Die Luke ist ein grauer Kasten mit
  Warnstreifen an zwei Strichen (`kritik-04-lauft.png`); offen und geschlossen
  unterscheiden sich kaum, das erste Ereignis jeder Runde ist unsichtbar.
- **Soll:** Je ein gemaltes Objekt (eingebettet, `ppl` 4 wie das
  Figurenblatt): Tür mit steinernem Rahmen und zwei Lampen, deren Silhouette
  auch bei 16 Pixel Höhe und zu zwei Dritteln verdeckt als „das Ziel" liest;
  Luke mit zwei sichtbar herunterklappenden Flügeln und aufleuchtender
  Warnlampe. Der pulsierende Lichtschein bleibt Code. Prüfbar: Standbilder vor
  und nach „Falltür öffnen" unterscheiden sich aus dem Augenwinkel.

### G4. Der Pulk besteht aus taktgleichen Klonen — **klein**

- **Befund:** Alle Figuren tragen dieselbe Pose im selben Takt; in
  `kritik-15-nah.png` (rechts) überlagert sich eine Warteschlange zu einem
  einzigen mehrköpfigen Wesen, in `kritik-10-bruecke.png` marschieren fünf
  Paare synchron. Das nimmt dem „Wuseln" genau das Gewusel.
- **Soll:** Je Figur ein deterministischer Phasenversatz der Laufanimation und
  eine winzige Helligkeits-/Größenstreuung (±3 %), gesät aus der Figurennummer
  — reine Zeichnersache, kein Eingriff in die Simulation. Prüfbar: Ein
  Standbild mit acht Läufern zeigt mindestens vier verschiedene
  Beinstellungen.

### G5. Weltkarte: leerer Himmel, graue Punkte — **mittel**

- **Befund:** Die Karte ist ein Band aus Punkten in einem fast leeren
  Farbverlauf (`kritik-01-weltkarte.png`, `kritik-02-weltkarte-gescrollt.png`).
  Gesperrte Level sind nummernlose graue Scheiben, das Weltentor und die
  Belohnung sind ein winziges Spaten-Piktogramm, es gibt nichts zu entdecken
  und nichts, worauf man sich freut. Es gibt auch keinen Titelbildschirm — das
  Spiel beginnt kommentarlos auf dieser Karte (die Merkliste nennt beides).
- **Soll:** Der Bandabschnitt jeder Welt erzählt ihr Thema (Grasland: Wiese,
  Bäume, die Falltür-Maschine am Horizont), Levelpunkte tragen Nummern und
  Sterne, das Tor am Bandende ist ein gemaltes Objekt mit Belohnungstafel, die
  Figur auf dem aktuellen Punkt tritt von einem Bein aufs andere. Prüfbar: Ein
  Screenshot der Karte macht Lust auf Punkt 4, obwohl er gesperrt ist.

### G6. Effekte: die Sprengung ist das schwächste Bild des Spiels — **klein/mittel**

- **Befund:** Der lauteste, am sorgfältigsten vertonte Moment (eigener
  Countdown, Warnglühen — `kritik-11-zuendschnur.png`) zerfällt im Bild zu
  einer Handvoll einfarbiger Quadrate (`kritik-12-sprengung.png`). Kein Blitz,
  kein Rauch, keine Brandspur am Krater.
- **Soll:** Mehrstufig aus Code (kostet keine Bytes): 2 Bilder Weißblitz,
  Rauchbausch aus weichen Kreisen, Erdbrocken mit Drall, kurz nachdunkelnder
  Kraterrand; Schutt fällt schon (`schutt.ts`), er braucht nur Gesellschaft.
  Prüfbar: Ein Standbild wie `kritik-12` zeigt erkennbar „Explosion", nicht
  „Konfetti".

### G7. Bedienleiste: Drahtgitter statt Beruf — **mittel**

- **Befund:** Acht dünne Strichsymbole, die man lernen muss
  (`kritik-03-intro.png`); im Hochformat ohne Beschriftung, erst quer stehen
  Namen darunter (`kritik-17-quer.png`). Die Leiste selbst (Zustände,
  Schieber, Plakette) ist gut — es fehlt der gedrückte Zustand und ein Bild.
- **Soll:** Je Beruf ein kleines Porträt der Figur bei der Arbeit (aus dem
  vorhandenen Figurenblatt zusammensetzbar!), Knopf drückt sichtbar ein.
  Prüfbar: Ein Neuling benennt ohne Text sechs von acht Berufen richtig.

### G8. HUD- und Überblendungspolitur — **klein**

- **Befund:** Der Levelname kollidiert mit der Mitte-Spalte: „Unter dem
  Deckel" + „0/14" wird zu „Unter dem Decke0/14"
  (`kritik-11-zuendschnur.png`). Die Übersichtskarte liegt quer über dem
  Spielfeld und verdeckt die Ausgangsgegend (`kritik-17-quer.png`). Sieg- und
  Niederlagentafel erscheinen schlagartig, Sterne ploppen nicht, nichts blendet
  (`kritik-09-gewonnen.png`, `kritik-08-verloren.png`).
- **Soll:** Levelname wird gemessen und gekürzt („Unter dem De…"), Karte im
  Querformat halbtransparent oder ausweichend; Tafeln gleiten ein, Sterne
  erscheinen nacheinander mit dem vorhandenen Pling. Prüfbar: kein
  Textübereinander bei allen zehn Levelnamen; ein Siegvideo zeigt drei
  zeitversetzte Sternereignisse.

---

## 4. Sound — die Lücken zur 10

Vorweg als Rahmen: Punkte S1–S4 sind aus dem Code belegbar. **S5 ist der
Hörauftrag** — er entscheidet, ob die 7 nach oben oder unten korrigiert werden
muss, und blieb hier prinzipbedingt offen.

### S1. Menü und Weltkarte sind stumm — **klein**

- **Befund:** `startMusic()` läuft erst mit dem Level-Start (`game.ts`, Fälle
  `start`/`resume`); auf der Karte herrscht Stille, obwohl die Merkliste dort
  ausdrücklich Musik vorsieht. Der erste Eindruck des Spiels ist lautlos.
- **Soll:** Auf der Karte läuft das Stück der sichtbaren Welt in reduzierter
  Besetzung (etwa: Fläche, Bass, Melodie ohne Schlagwerk — die Abnahme erlaubt
  jede Instrumentierung), Übergang ins Level als Filterfahrt statt Neustart.
  Prüfbar mit Kopfhörern: Karte öffnen → Musik; Level starten → dieselbe
  Tonart, volleres Arrangement, kein Abriss.

### S2. Nur eines von zwei Stücken ist je zu hören — **mittel**

- **Befund:** Das Höhlenstück (A-dorisch, eigener Raum von 2,9 s, eigene
  Stimmen) ist komponiert, getestet — und unerreichbar: Alle zehn Level tragen
  `theme: 'grass'`. Ein Spieler hört über die gesamte Spielzeit eine einzige
  Acht-Takt-Schleife; die vier Durchgangsvarianten strecken sie, ersetzen aber
  keine zweite Farbe.
- **Soll:** Kurzfristig: Arrangement-Voreinstellungen je Etappe
  („Spaziergang" luftig, „Prüfung" dichter — alles rechte Spalte der Abnahme).
  Eigentlich: siehe Schritt 3 in §6 — mit Welt 2 kommt das zweite Stück von
  allein. Prüfbar: In einer Sitzung über drei Etappen klingt nicht dreimal
  dasselbe Arrangement.

### S3. Breite ja, Ortung nein — **klein/mittel**

- **Befund:** Jedes Grabgeräusch würfelt seinen Platz im Panorama
  (`sfx.ts`, `seite()`); die Tonschicht kennt keine Bildschirmstelle.
  `docs/klangdesign.md` §7.2 nennt die Ortung selbst „den größten einzelnen
  Gewinn, der hier noch liegt" — ein Feld `x` im `WorldEvent` genügt.
- **Soll:** Ereignisse tragen ihre Stelle relativ zum Sichtfenster (−1…+1);
  Grabungen links klingen links. Deterministisch unbedenklich: Der Wert fließt
  nur in die Tonschicht. Prüfbar mit Kopfhörern: zwei Gräber an beiden
  Levelenden, Kamera dazwischen — man hört, welcher wo arbeitet.

### S4. Stumme Momente, die klingen sollten — **klein**

- **Befund:** Ohne Klang sind heute: die Fokuszeit (Welt läuft auf 25 %, das
  Klangbild bleibt unverändert dicht), das Aufklappen der Falltür (nur die
  Figuren rufen), die Wende am Blocker (das häufigste sichtbare
  „Abprall"-Ereignis), die überlebte Landung nach hohem Sturz (nur der
  tödliche Aufprall klingt), das Erscheinen der Sterne im Ergebnis (die
  Fanfare läuft, aber die drei Sterne selbst sind stumm — passt zu G8).
- **Soll:** Fokuszeit: Musikbus dezent tiefpassgefiltert und 2–3 dB zurück,
  solange der Finger liegt (Arrangement, nicht Melodie — zulässig); Falltür:
  ein Klack plus Kettenrasseln; Blockerwende: sehr leiser Gummi-Tup (die
  Stempelfamilie existiert schon); Landung: gedämpfter Tapser. Prüfbar mit
  Kopfhörern: Finger aufs Glas → die Welt tritt hörbar einen Schritt zurück;
  Finger weg → sie kehrt zurück.

### S5. Der Hörauftrag: Klangfarbe und Mischung am Gerät — **klein (Prüfung), offen (Folgearbeit)**

- **Befund:** Alle Pegel-, Band- und Stereo-Messungen sind grün (Melodiefenster
  31–34 %, Scheitelfaktor ~2,5, Seite 21–22 % der Mitte). Aber Messwerte
  sichern den Bau, nicht die Schönheit — die drei bisherigen
  Spielerrückmeldungen betrafen alle Dinge, die kein Messwert meldete.
- **Soll (Checkliste für einen Tester mit Kopfhörern und Handylautsprecher):**
  1. Klingt die Drehleier nach Instrument oder nach Sägezahn mit Filter?
  2. Trägt der Erdschlag auf dem Gerätelautsprecher, oder verschwindet er?
  3. Nervt der Brücken-Aufstieg beim dritten Level noch nicht?
  4. Ist der Sprengcountdown wirklich der lauteste Ton (Vorgabe GDD §7)?
  5. Bleibt die Rettungskette bei zehn Rettungen in einer Sekunde eine
     Melodie, oder wird sie Brei?
  6. Ist die Lagenumschaltung bei knapper Zeit (Melodie raus, Uhrentick rein)
     als Dramaturgie hörbar, ohne dass man sie erklärt bekommt?
  7. iOS-Gegenprobe: keine Haptik verfügbar — fühlt sich das Spiel dort taub
     an, und braucht es dafür einen klanglichen Ausgleich (etwas mehr
     Bedienklang-Pegel)?

---

## 5. Spielspaß — die Lücken zur 10

### F1. Kein Zeitrücklauf: jeder Fehler kostet die ganze Runde — **groß**

- **Befund:** Ein verpatzter Brückenansatz in Sekunde 100 heißt: Neustart,
  100 Sekunden noch einmal. Das GDD führt den Rücklauf (§3.4) als Kernstück,
  die Technik ist ausdrücklich vorbereitet (`Terrain.clone()`, vollständig
  serialisierbarer Figurenzustand, deterministische Ticks) — gebaut ist er
  nicht. Auf dem Handy, wo ein Fehltipp auch mal vom Daumen kommt, ist das die
  teuerste einzelne Lücke im Spielgefühl.
- **Soll:** Halteknopf „10 Sekunden zurück", Schnappschüsse im Sekundenraster.
  Prüfbar: Beruf falsch vergeben → zurückspulen → anders vergeben → gewinnen,
  ohne Neustart; zwei Läufe mit Rücklauf enden im selben Zustands-Hash wie
  einer ohne.

### F2. Umfang: zehn Level, eine Welt, ein Nachmittag — **groß**

- **Befund:** Von 64 geplanten Leveln in fünf Welten existieren zehn in einer.
  Kein Tagesrätsel, kein Editor, keine Bestenliste (alles Merkliste/GDD §9) —
  nach dem letzten Stern gibt es keinen Grund zurückzukommen. Die
  Weltkarten-Infrastruktur (Band, Tore, Belohnungen) wartet sichtbar auf
  Inhalt (`kritik-02-weltkarte-gescrollt.png`).
- **Soll:** Als nächstes die Kristallklamm (12 Level): Sie aktiviert die
  fertige zweite Palette, das fertige zweite Musikstück samt Höhlenraum und
  die erste Belohnung mit Spürbarkeit („längere Uhr"). Prüfbar: Ein Spieler,
  der alles auf drei Sterne spielen will, ist länger als vier Stunden
  beschäftigt.

### F3. Zielhilfe-Härtefälle: Lupe, Fehltipp, Rammer — **mittel**

- **Befund:** Drei verwandte Reibungspunkte. (a) Die Lupe klebt am Finger,
  nicht am Ziel: Hält man still, läuft die anvisierte Figur aus dem
  vergrößerten Ausschnitt, während der Zielring unten brav mitläuft —
  `kritik-05-lupe.png` zeigt eine Lupe voll leeren Grases bei gültigem Ziel.
  (b) Ein Tipp ohne Treffer verpufft völlig stumm — kein Ton, kein Wackeln,
  man weiß nicht, ob man daneben lag oder der Beruf ungültig war. (c) Der
  Rammer greift nur mit Wand in Reichweite; das Projekt nennt das Fenster
  selbst „wenige Pixel" (README, Spieltest-Frage 1).
- **Soll:** (a) Die Lupe führt das gefangene Ziel weich nach (Zielring bleibt
  im Ausschnitt) — prüfbar: 1 s halten, Figur bleibt im Kreis. (b)
  Near-Miss-Rückmeldung: kurzer leiser Holzblock plus aufblitzender Leerring —
  prüfbar am Standbild. (c) Der Rammer merkt sich den Auftrag und beginnt,
  sobald die Wand in Reichweite kommt („vorgemerkt"-Markierung) — prüfbar:
  Tipp 20 Pixel vor der Wand führt zum Durchbruch.

### F4. Vergebene Berufe verschwinden im Pulk — **klein/mittel**

- **Befund:** Ein Blocker in einer Läufergruppe ist auf Spielgröße kaum zu
  finden (`kritik-10-bruecke.png` — er steht in der Menge und ist nur an der
  Armhaltung zu ahnen); das Stirnband ist das einzige Signal und aus der
  Distanz zu leise. Wer drei Kletterer vergeben will, zählt mühsam nach, wer
  schon einen hat.
- **Soll:** Bei aktivem Beruf in der Leiste tragen alle Figuren, die diesen
  Beruf schon haben, eine dezente Dauermarke (Punkt über dem Kopf im
  Bandton); die Vergabe selbst quittiert mit kurzem Aufblitzen plus
  aufsteigendem Symbol. Prüfbar: Standbild mit zwölf Figuren, zwei Blockern —
  man findet beide in einer Sekunde.

### F5. Einstieg: Text statt Hand — **klein/mittel**

- **Befund:** Das Erste-Mal-Erlebnis ist eine Texttafel
  (`kritik-03-intro.png`) und eine Hinweiszeile unter der Leiste. Die zwei
  Kerngesten (halten = Zeitlupe + Lupe; Fächer bei Gedränge) stehen nur als
  Fußnote der Einzeldatei-Seite. Wer den Text überliest, erlebt Level 4
  („sechs Schirme unter Zeitdruck") als unfair.
- **Soll:** In Level 1–3 je eine einmalige Gesten-Einblendung im Moment des
  Bedarfs (Zeigefinger-Symbol pulst über einer Figur, „halten"), abschaltbar,
  Fortschritt im vorhandenen Speicher. Prüfbar: Ein Neuling ohne Anleitung
  nutzt in Level 4 nachweislich die Fokuszeit (messbar an den Ticks).

### F6. Sterne kaufen nichts: Belohnungen bleiben abstrakt — **mittel**

- **Befund:** 30 Sterne sind sammelbar, aber nichts im Spiel fragt je danach;
  die einzige Belohnung (ein Gräber mehr) liegt hinter dem Abschluss aller
  zehn Level und ist auf der Karte nur ein Piktogramm. Zwischen Level 3 und
  Level 10 gibt es keinen Moment des „dafür lohnt es sich".
- **Soll:** Sterntore auf dem Band (Punkt 7 öffnet ab 12 ★ — übliche, faire
  Genre-Mechanik), Belohnungstafel am Tor mit Vorschau („+1 Gräber, für
  immer"), und die Schmuck-Belohnungen der Merkliste (Avatare, Goldband) als
  sichtbare Sammelziele. Prüfbar: Ein Spieler kann sagen, wofür er gerade
  spielt.

### F7. Querformat ist ein Anhängsel — **klein**

- **Befund:** Quer funktioniert alles, aber die Übersichtskarte verdeckt einen
  spürbaren Teil des schmalen Sichtfelds inklusive Ausgangsumgebung
  (`kritik-17-quer.png`), und der Wechsel Hoch/Quer wird nirgends angeboten
  oder erklärt — obwohl ein Seitenscroller quer sichtbar profitiert.
- **Soll:** Karte quer halbtransparent und in der Größe reduziert, bei
  Fingernähe ausweichend; ein Hinweis beim ersten Start quer. Prüfbar:
  Standbild quer, Ausgang im Bild — nichts Spielrelevantes verdeckt.

---

## 6. Die fünf wirksamsten Schritte insgesamt

In dieser Reihenfolge:

1. **Zeitrücklauf bauen (F1).** Die teuerste Spielgefühl-Lücke, die
   Technik liegt bereit, und er entschärft nebenbei F3 (Fehltipps) und die
   Härte von Level 4/9. Nichts anderes hebt den Spielspaß pro Arbeitstag so
   stark.
2. **Boden, Tür und Luke durch gemalte, eingebettete Grafik ersetzen
   (G1 + G3).** Die drei Flächen, auf die der Spieler dauernd schaut; die
   Prompts liegen fertig in `docs/grafik-luecken.md` (§3.1–3.5),
   das Byte-Budget ist durch die dort belegte Neukodierung des Figurenblatts
   doppelt gedeckt. Danach besteht das Spiel den Lupen-Test.
3. **Welt 2 „Kristallklamm" bauen (F2 + S2 + G-Palette).** Ein Schritt, drei
   Kategorien: verdoppelt den Inhalt, aktiviert das brachliegende zweite
   Musikstück samt Höhlen-Raumklang und die zweite Palette — und macht aus dem
   Weltkarten-Versprechen ein eingelöstes.
4. **Klang-Präsenzpaket (S1 + S3 + S4):** Kartenmusik, geortetes Panorama
   (ein Feld im `WorldEvent`), Fokuszeit-Filter und die vier stummen Momente.
   Vier kleine Eingriffe, zusammen der Sprung von „gut gebaut" zu „fühlt sich
   produziert an" — anschließend S5 mit Kopfhörern abnehmen.
5. **Sichtbarkeits- und Feierpaket (G4 + G8 + F4):** Phasenversatz im Pulk,
   Berufs-Dauermarken, Titelkürzung, einblendende Tafeln, nacheinander
   ploppende Sterne mit Pling. Lauter Kleinigkeiten; zusammen sind sie der
   Unterschied zwischen Prototyp und Produkt im ersten Eindruck.

---

## 7. Bildschirmabzüge dieser Prüfung

Alle unter `art-src/proben/`, aufgenommen am gebauten Einzeldatei-Spiel:

| Datei | zeigt |
|---|---|
| `kritik-01-weltkarte.png` | Weltkarte beim Start, Hochformat |
| `kritik-02-weltkarte-gescrollt.png` | Bandende Welt 1, gesperrte Punkte, Belohnungsmarke |
| `kritik-03-intro.png` | Leveltafel w1-01 mit Bedienleiste |
| `kritik-04-lauft.png` | w1-01 im Spiel: Luke, Läufer, Tür, Übersichtskarte |
| `kritik-05-lupe.png` | Lupe mit stillem Finger — Ziel aus dem Ausschnitt gelaufen |
| `kritik-06-graebt.png` | w1-01, Kamerafahrt, Baum- und Hügelkulisse |
| `kritik-07-pause.png` | Pausetafel |
| `kritik-08-verloren.png` | Niederlagentafel (Zeit abgelaufen, 0/10) |
| `kritik-09-gewonnen.png` | Siegtafel, zwei Sterne, Par-Zeile |
| `kritik-10-bruecke.png` | w1-03: Pulk mit Blocker — Suchbild |
| `kritik-11-zuendschnur.png` | w1-07: Sprengmeister glüht; Titel kollidiert mit Zähler |
| `kritik-12-sprengung.png` | Explosion: Partikelquadrate |
| `kritik-13-lupe.png` | Lupe mit nachgeführtem Finger — Figur groß und lesbar |
| `kritik-14-faecher.png` | Auswahl-Fächer mit zwei Kandidaten |
| `kritik-15-nah.png` | Zoom 3: Terrainmatsch, flache Tür, Klonreihe |
| `kritik-16-karte-quer.png` | Weltkarte im Querformat (Einzeldatei-Rahmen) |
| `kritik-17-quer.png` | w1-05 quer: Stahlband, Schrägbagger, Karte überdeckt Spielfeld |
| `kritik-18-tod.png` | w1-04: schwebender Felsriegel, Kulisse-Boden-Verwechslung |
