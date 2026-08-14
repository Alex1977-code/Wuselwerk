# Abnahme: die Melodien

**Stand:** abgenommen. Rückmeldung im Wortlaut: *„melodie passt, merken"*.

Dieses Dokument hält fest, was abgenommen ist, damit es nicht bei der nächsten
Änderung am Klang unbemerkt mitwandert. Die Melodien sind ab hier **gesetzt**:
Wer sie ändern will, fragt vorher. Alles andere an der Musik — Instrumentierung,
Begleitung, Groove, Mischung — ist ausdrücklich **nicht** mit abgenommen und darf
weiterentwickelt werden.

Quelle: `src/audio/music.ts`, Konstante `STUECKE`.
Abgesichert durch: `tests/musik.test.ts`.

Seit §8 hat **jedes Level ein eigenes Stück** (`src/audio/musikbau.ts`). Die
Stücke in `STUECKE` bleiben, was sie sind: das abgenommene Stück ihrer Welt, der
Nullpunkt des Verfahrens (Level 1 baut es Note für Note wieder) und der Rückfall
für Weltkarte, Vorspann und unbekannte Level.

---

## 1. Was genau abgenommen ist

| abgenommen | nicht abgenommen |
|---|---|
| die Tonfolgen beider Stücke | welche Stimme sie spielt |
| die Notenlängen und der Phrasenbau | Tempo, Lautstärke, Klangfarbe |
| die Akkordfolge je Takt | Begleitfiguren, Perkussion, Bass |
| die Tonart und der Ambitus | Mischung und Nachhall |

---

## 2. Welt 1 — Wiese

C-Dur mit lydischer Farbe, Grundton 261,63 Hz.

Das Tempo steht hier bewusst **nicht** mehr: Es ist laut Tabelle oben nicht mit
abgenommen, und es hat sich seither geändert (126 → 120, siehe
`docs/klangdesign.md` §4). Eine Zahl, die in zwei Dokumenten steht und nur in
einem gepflegt wird, ist schlimmer als keine. Der geltende Wert steht in
`STUECKE`.
Halbtöne über dem Grundton; die Zahl in Klammern ist die Länge in Achteln.

| Takt | Melodie | Akkord |
|---|---|---|
| 1 | G(2) G(1) A(1) G(2) E(2) | C |
| 2 | F(2) E(2) D(3) —(1) | F |
| 3 | G(2) G(1) A(1) G(2) C′(2) | C |
| 4 | H(2) A(2) G(4) | G |
| 5 | C′(2) H(1) A(1) G(2) **Fis**(2) | C |
| 6 | G(4) E(2) D(2) | G |
| 7 | G(2) G(1) A(1) G(2) E(2) | F |
| 8 | D(2) E(2) C(4) | G |

**Warum sie trägt.** Das Kopfmotiv **G–G–A–G** steht in Takt 1, 3 und 7 und wird
jedes Mal anders weitergeführt: einmal abwärts nach E, einmal aufwärts nach C′,
einmal nach Hause. Nicht die Menge der Töne macht eine Melodie, sondern die
Wiederkehr — beim dritten Mal weiß das Ohr schon, was kommt, und wird dann doch
überrascht.

Das **Fis** in Takt 5 ist die übermäßige Quarte, die lydische Farbe. Ein einziger
Ton außerhalb der Tonleiter gibt einem Achttakter mehr Gesicht als jede
Verzierung.

Takt 8 steht auf der **Dominante**, während die Melodie schon auf dem Grundton
liegt. Diese Reibung zieht die Schleife herum; ein Stück, das auf seinem eigenen
Schlusston zur Ruhe kommt, fängt nicht wieder an.

---

## 3. Welt 2 — Höhle

A-dorisch, Grundton 220 Hz. Zum Tempo siehe die Anmerkung bei Welt 1.

| Takt | Melodie | Akkord |
|---|---|---|
| 1 | A(2) C(2) D(2) E(2) | Am |
| 2 | D(2) C(2) H(4) | G |
| 3 | A(2) C(2) D(2) G(2) | Am |
| 4 | **Fis**(4) E(4) | D |
| 5 | A′(2) G(2) Fis(2) E(2) | G |
| 6 | D(4) C(4) | C |
| 7 | A(2) C(2) D(2) C(2) | D |
| 8 | H(2) A(6) | Am |

**Warum sie trägt.** Derselbe Bau, andere Tonleiter. Das Kopfmotiv **A–C–D**
kehrt in Takt 1, 3 und 7 wieder — dreitönig, nicht viertönig: Der vierte Ton ist
genau die Stelle, an der variiert wird.

Der Unterschied zwischen dorisch und Moll ist ein einziger Ton, die **große
Sexte (Fis)**. Sie steht an der auffälligsten Stelle des Stücks: Takt 4, allein,
lang gehalten, über einem D-Dur-Akkord. Dorisch ist die Tonart, die traurig
anfängt und dann doch nicht traurig ist — das passt zu einer Höhle, die
neugierig sein soll und nicht bedrohlich.

---

## 4. Herkunft und Rechte

Beide Melodien sind **eigene Kompositionen**. Aus dem Vorbild von 1991 ist
weder eine Melodie noch ein Klang übernommen.

Das Rezept jenes Spiels — gemeinfreie Volkslieder und Klassik neu arrangieren —
ist nachgemacht, nicht das Ergebnis: Eine Melodie aus dem 18. Jahrhundert ist
frei, ein fremdes Arrangement davon nicht, und die eigenen Melodien jenes Spiels
erst recht nicht.

---

## 5. Was die Tests festhalten

`tests/musik.test.ts` prüft am Notentext, was still kaputtginge:

1. **Jeder Takt ist genau voll.** Ein Takt mit neun Achteln verschöbe die
   Melodie ab dem zweiten Durchlauf für immer gegen die Akkorde — man hörte nur,
   dass etwas nicht stimmt, ohne zu wissen, was.
2. **Das Kopfmotiv kehrt wieder** (mindestens zweimal, gemessen über drei Töne).
3. **Die Phrasen atmen** — es gibt lange Töne an den Phrasenenden.
4. **Die Lage bleibt singbar** — höchstens zwei Oktaven Umfang.
5. **Die Melodiestimme kann halten.** Ein Stabspiel kann das nicht; eine Melodie
   daraus ist eine Folge von Punkten statt einer Linie, und genau das klang
   vorher nach Piepen.

Die Tests sichern den **Bau**, nicht die Schönheit. Ob eine Melodie schön ist,
kann kein Test sagen — dafür steht oben die Abnahme.

Seit §8 kommt eine zweite Hälfte dazu, die dasselbe über **jedes gebaute Level**
prüft: Gesetzestreue (`pruefe()`), Determinismus, kein Stück zweimal in einer
Welt, Frequenzbänder, Geräuschleiter, Flächenfarbe im Modus, und dass Level 1
das abgenommene Weltstück wiederherstellt. Bei siebzig Stücken tritt das
Gegenrechnen an die Stelle des Hinsehens.

---

## 6. Was sich seit der Abnahme geändert hat

Nichts an den Melodien. Alles andere ist neu gemacht worden; der Entwurf dazu
steht in `docs/klangdesign.md`. Die Punkte, die man am ehesten für eine
Änderung an der Abnahme halten könnte, und warum sie keine sind:

| geändert | war das abgenommen? |
|---|---|
| Wiese: Akkordeon → Okarina | Nein — „welche Stimme sie spielt" steht ausdrücklich in der rechten Spalte. |
| Tempo 126 → 120 und 112 → 100 | Nein — „Tempo, Lautstärke, Klangfarbe". |
| Kick auf jede Viertel → Puls 3-3-2 | Nein — „Begleitfiguren, Perkussion, Bass". |
| Achtbit-Ebene entfernt | Nein — sie ist Instrumentierung, keine Melodie. |

Die Tonfolgen und die Akkordfolge in `STUECKE` sind Note für Note dieselben wie
am Tag der Abnahme.

---

## 7. Die zweite Rückmeldung: „zu laut, zu flötenartig, zu eintönig"

Drei Beobachtungen aus dem Spielen, und alle drei betreffen die rechte Spalte —
also das, was ausdrücklich nicht mit abgenommen ist. Sie stehen hier trotzdem,
weil jemand sonst beim nächsten Blick auf `STUECKE` denkt, die Melodie sei
angefasst worden.

| Rückmeldung | was daran wirklich falsch war | was geändert wurde |
|---|---|---|
| „zu laut" | Der Musikbus stand auf 0,7. Das kam aus dem Auftrag „mehr Volumen, basslastiger" — richtig gewollt, an der falschen Stelle umgesetzt: Der Bus hebt **alles** an, auch das, was kein Gewicht bekommen sollte. Auf einem Telefon ging die Musik damit über die Geräusche, und die Geräusche sind die Rückmeldung des Spiels. | `MUSIK_PEGEL` 0,7 → 0,5. Was „basslastig" wirklich trägt — Bassschiene, Anriss im Bass, Pumpe unter dem Schlag — bleibt unverändert. |
| „zu flötenartig" | Eine richtige Beobachtung über den **Bau** der Stimmen, nicht über ihren Pegel. Die Okarina ist ein Helmholtz-Resonator und hat fast nur den Grundton; die Klarinette ist eine gedackte Röhre und hat nur die ungeraden Teiltöne. Beide waren aus gutem Grund gewählt (sie stellen das Melodiefenster nicht zu) — und beide sind damit per Konstruktion flötenähnlich. | Neue führende Stimmen: **Drehleier** (Wiese) und **Streicher** (Höhle). Gestrichene Saiten, also alle Teiltöne, gefiltert statt ungebremst. Okarina und Klarinette bleiben als Zweitstimmen. |
| „zu eintönig" | Nicht die Melodie — sie hat Kopfmotiv, Mittelteil und drei verschiedene Antworten. Die **Schleife** war es: acht Takte, rund zwanzig Sekunden, in einem Level zehnmal hintereinander Note für Note gleich. | `DURCHGAENGE`: vier Umläufe mit wechselnder Melodiestimme, einem Bruch im dritten (zwei Takte ohne Schlagwerk), umgekehrter Sechzehntelfigur und einer Oktavdopplung im vierten. |

**An den Melodien ist auch hier nichts geändert.** Der Stimmwechsel gibt
dieselben Töne an ein anderes Instrument weiter — das ist, was ein Orchester in
der Wiederholung tut. Die Oktavdopplung ist eine zusätzliche Stimme, keine
Transposition: Die abgenommene Lage bleibt genau, wo sie war, und das ist hier
nicht nur eine Formalie — eine Transposition nach unten hätte die Melodie unter
800 Hz gedrückt und damit in das Band, das der Begleitung gehört.

---

## 8. Musik je Level — das Verfahren („Weg D")

Ab hier gibt es **ein eigenes Stück je Level**, nicht mehr eines je Welt.
Erzeugt wird es in `src/audio/musikbau.ts`, abgesichert durch
`tests/musik.test.ts` (Abschnitt „Ein eigenes Stück je Level", läuft über
**alle** gebauten Level).

Der Grund ist Arithmetik: Fünfzehn Level einer Welt teilten sich einen
Achttakter von rund zwanzig Sekunden. Wer eine Welt durchspielt, hört ihn ein
paar hundert Mal. Der Bogen über vier Umläufe (§7) hat das gelindert, aber nicht
behoben — er wechselt das Arrangement, nicht den Notentext.

### 8.1 Was das Verfahren ist

**Motivfamilie je Welt, Arrangement je Level.** Jede Welt bringt einen Baukasten
mit — Kopf, Kopfrhythmen, Wendungen, Antworten, Mittelteile, Läufe, Schlüsse,
Kadenzen, Farben. Je Level wird daraus nach einer Formgrammatik (fünf Formen wie
`K A K A M M K S`) ein Stück montiert. Verschoben und gespiegelt wird auf
**Leiterstufen**, nicht auf Halbtönen: eine Zeile weiter in derselben Tonart,
nicht einen Halbton daneben.

Kein freier Generator. Die Teile sind einzeln abgenommen, und **Eintrag 0 jeder
Tabelle ist der Baustein aus dem abgenommenen Weltstück**. Der Zähler eines
ersten Levels ist null, also baut Level 1 jeder Welt Note für Note das Stück,
das schon vorher lief — samt Kadenz, Farbe, Stimmen, Figur und Bogenplan. Ein
Test hält genau das fest. Die Abnahme von §1 bis §3 gilt damit unverändert
weiter; sie ist der Nullpunkt des Verfahrens und nicht sein Nebenprodukt.

Die Erzeugung ist eine **reine Funktion der Level-Id**. Kein `Math.random`: Ein
Level, das bei jedem Start anders klingt, ist kein Level mit Musik.

### 8.2 Was je Welt fest bleibt, was je Level wechselt

| fest je Welt | wechselt je Level |
|---|---|
| Grundton (`grund`) und Tempo (`bpm`) | Form, Kopfrhythmus, Wendungen |
| Geräuschleiter (`sfxStufen`), Fanfarengrund | Antworten, Mittelteil, Lauf, Schluss |
| Modus (`leiter`) und Motivfamilie | Kadenz und Flächenfarbe |
| die führende Melodiestimme | Zweitstimme, Harmoniestimme |
| der Puls 3-3-2, Bass, Kies, Versatz | Sechzehntelfigur, Harmoniedichte, Bogenplan |

### 8.3 Warum Transposition und Tempo *nicht* je Level wechseln

Das ist die eine Entscheidung, die man beim Lesen für eine Auslassung halten
könnte. Sie ist eine Entscheidung:

1. **Der Grundton ist die Tonart der Welt, nicht des Levels.** `tonart()` reicht
   Grundton, Geräuschleiter und Fanfarengrund an `sfx.ts` und `stinger.ts`
   weiter — jeder Werkzeugklang, jedes Plopp, jede Fanfare hängt daran. Wechselt
   der Grundton je Level, hat eine Welt keine Tonart mehr, sondern fünfzehn, und
   das häufigste Geräusch des Spiels wandert beim Levelwechsel mit. Genau
   deshalb lesen `tonart()` und `schrittDauer()` weiter `STUECKE[Welt]` und nicht
   das laufende Levelstück.
2. **Das Tempo ist das Kennzeichen des Ortes.** Die Welten liegen auf 88 bis 132
   Viertel je Minute, in Abständen von zwölf und mehr. Streuten die Level um
   ihre Welt herum, überlappten die Bänder, und der Puls sagt nicht mehr, wo man
   ist. Dazu hängt an 120 ein rundes Raster: eine Achtel von genau 250 ms, auf
   der Echo (375 ms) und Trippelschritte (`schrittDauer`) sitzen.
3. **Die führende Stimme** bleibt aus demselben Grund fest: Sie ist das, woran
   man eine Welt in einer Sekunde erkennt. Die *Zweitstimme* darf wechseln — sie
   ist der Kontrast, nicht das Gesicht.

### 8.4 Der Harmonie-Befund und seine Behebung

Beim Umbau nachgerechnet und bestätigt: Die Harmoniespur hat ihre Zusatztöne
(`farbe`) als **festes Halbtonintervall** über die Akkordwurzel gelegt. Über dem
Grundton ist das richtig — dort ist die Farbe abgenommen —, über jeder anderen
Wurzel war es Glück. Gezählt über die acht Takte jedes abgenommenen Weltstücks —
und zu hören war der Ton in jedem gezählten Takt doppelt: Die Fläche liegt den
ganzen Takt darauf, die gezupfte Harmonie greift ihn auf den Achteln 1 und 5:

| Welt | Takte mit modusfremdem Ton | Beispiel |
|---|---|---|
| grass, sonnenhang, wipfel | 0 von 8 | — |
| **crystal** | **5 von 8** | über der Wurzel 10 (G) ein B, wo A-dorisch das H hat |
| **rust** | **5 von 8** | über der Wurzel 10 (F) ein Es statt E |
| **frost** | **6 von 8** | über der Wurzel 8 (C) ein Dis statt D |
| **magma** | **4 von 8** | über der Wurzel 1 (Es) ein E statt F |

Dass die drei Grünwelten heil blieben, ist kein Verdienst, sondern Dur: Über den
Wurzeln 0, 5 und 7 ist die große Terz zufällig immer leitereigen. Beim ersten
Moll-Stück hielt der Zufall nicht mehr. Das ist ein falscher Ton im Band 250 bis
800 Hz, zweimal je Takt, seit der ersten Auslieferung — dieselbe leise Sorte
Fehler, die `sfxStufen` schon einmal hatte: Man hört, dass etwas nicht stimmt,
ohne zu wissen, was.

**Die Behebung.** `farbe` zählt jetzt in **Leiterstufen** statt in Halbtönen:
„zwei Stufen über der Wurzel" heißt die Terz *dieses Modus* — groß oder klein,
je nachdem, wo die Wurzel steht (`farbTon` in `musikbau.ts`). Ein modusfremder
Flächenton ist damit nicht mehr formulierbar. Die Umrechnung der bestehenden
Werte ist verlustfrei: `[3, 7]` in der Höhle wird `[2, 4]`, also weiter Terz und
Quinte; über der Tonika klingt beides gleich, über allen anderen Wurzeln klingt
nur die neue Lesart im Modus. Zwei Tests halten es fest — einer prüft, dass kein
Ton der Harmoniespur außerhalb der Leiter liegt, der andere hält die Zahlen der
Tabelle oben fest, damit der Befund nicht als Behauptung im Kommentar steht.

War das abgenommen? Nein. Die Akkordfolge je Takt ist abgenommen (§1, linke
Spalte), die Begleitfiguren sind es ausdrücklich nicht (rechte Spalte). Geändert
hat sich kein Akkord, sondern die Stimmführung der Fläche darüber.

### 8.5 Zwei weitere Berichtigungen aus demselben Anlass

| geändert | war das abgenommen? |
|---|---|
| Wipfelweide: Zweitstimme Okarina → Drehleier | Nein — „welche Stimme sie spielt". Panflöte und Okarina sind beide geblasen; der Stimmwechsel im zweiten Umlauf war deshalb kaum zu hören, der Bau lief leer. Gepaart gehören eine obertonreiche und eine obertonarme Stimme. |
| Deckungspflicht der Montage auch über die Ableitung | Neu, kein Eingriff in Abgenommenes. Im Schlot (phrygisch) tragen nur Mittelteil und Lauf die kleine Septime, und die Geräuschleiter braucht sie. Eine Sequenz eine Stufe nach *unten* nahm sie aus jedem Baustein — drei von fünfzehn Leveln hatten danach kein C mehr, und alle Spielgeräusche standen neben ihrer Musik. Findet die Montage mit der gewählten Ableitung kein taugliches Stück, rücken jetzt auch die übrigen Ableitungen nach. Jedes Level, dessen Ableitung trägt, bleibt Note für Note dasselbe. |
