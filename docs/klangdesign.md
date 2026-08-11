# Klangdesign: Wuselwerk

**Auftrag:** *„neues musikdesign passend zum spiel für hintergrundmusik und
passenden effekttönen modern"*

**Was gesetzt bleibt:** die Tonfolgen beider Stücke (`docs/musik-abnahme.md`).
Melodie und Akkorde in `STUECKE` werden nicht angefasst. Alles andere —
Instrumentierung, Begleitung, Groove, Tempo, Klangfarben, Mischung, Geräusche,
Stingers, Umgebung — ist Gegenstand dieses Entwurfs.

---

## 0. Wovon dieses Dokument ausgeht: dem Bild

Bevor entschieden wird, wie etwas klingt, muss dastehen, wie es aussieht.
Aus `shots/03-lauft.png`, `shots/06-graebt.png`, `shots/12-atlas.png`:

- **Tag.** Heller Himmel, oben klares Blau, zum Horizont hin milchig aufgehellt,
  weiche Wolkenbänder. Kein Kontrast, keine harte Kante — Dunst.
- **Weite.** Drei gestaffelte Ebenen: ein blaugrauer Fernhügel (Luftperspektive),
  ein grüner Mittelhügel mit kleinen dunklen Bäumen, dann die Spielfläche. Der
  Blick geht weit.
- **Erde.** Satte warme Braunstufen, gefleckt mit Schollen und hellen Kieseln,
  nach unten wärmer werdend. Das ist gemalt, mit Pinselstruktur, nicht gerastert.
- **Gold.** Der Ausgang ist ein leuchtender Torbogen, cremig-golden, von innen
  hell. Er ist das einzige Objekt im Bild, das selbst Licht abgibt.
- **Grau und Gelb.** Der Einlass ist eine Maschine an zwei dünnen Masten, mit
  Warnstreifen. Sie gehört sichtbar nicht hierher — sie ist hergebracht worden.
- **Türkis und Violett.** Die Figur: ein kleiner Troll, violette Dreadlock-Mähne
  über türkiser Kleidung. Warm, kräftig, kindlich, nicht niedlich.

Vier Farben tragen also das Bild: Himmelblau, Erdbraun, Gold, Türkis/Violett.
Und ein Verfahren: gemalt, mit weichen Verläufen und ohne harte Kanten.

### Die ehrliche Frage: klingt das, was heute läuft, nach diesem Bild?

Nein. An neun Stellen nicht, und die meisten davon lassen sich benennen, ohne
über Geschmack zu reden:

| Was zu hören ist | Was im Bild steht |
|---|---|
| Ein Akkordeon in Musette-Stimmung trägt die Melodie | Kein Jahrmarkt. Eine Wiese unter freiem Himmel. |
| Eine Rechteckwelle verdoppelt die Melodie (Achtbit-Ebene) | Nichts im Bild ist gerastert. Alles ist gemalt. |
| Kick auf jede Viertel, Schüttelrohr auf jede Achtel | Der geradeste Groove, den es gibt. Ein Fitnessstudio, kein Spaziergang. |
| Alles sitzt exakt auf dem Raster | Ein Sequenzer. Nichts zieht, nichts lässt nach. |
| Nachhall: 0,34 s, für alle Welten derselbe | Eine Kiste. Im Bild reicht der Blick über drei Hügelketten. |
| Kein Echo, nirgends | Das billigste und deutlichste Merkmal moderner Produktion fehlt ganz. |
| Mono. Ein einziger Punkt. | „Breite Mischung" steht sogar in der alten Vorgabe. Geliefert ist ein Punkt. |
| Kick und Schüttelrohr sind Synthesizer-Bausteine | Der Boden ist Erde mit Kieseln. |
| Jeder der acht Takte klingt gleich | Ein gemaltes Bild hat Vorder- und Hintergrund. Die Musik hat nur Vordergrund. |

Dazu zwei Dinge, die man nicht sieht, aber merkt: Die Geräusche hängen an C-Dur
statt am laufenden Stück, und die Trippelschritte laufen mit festen 190 ms frei
gegen die Musik. Der konstanteste Klang im Spiel ist also der einzige, der nicht
im Takt ist.

---

## 1. Die Klangidentität in drei Sätzen

1. **Wuselwerk klingt nach warmem Tageslicht über einer Maschine, die im Boden
   arbeitet**: oben Holz, Glas und Atem in weiter, heller Luft — unten ein
   federnder Bass, der nie stillsteht.
2. Nach fünf Sekunden erkennt man es an drei Dingen: dem **Pling** (ein
   Holzstab, mit einer Glaskante angeschlagen, mit punktiertem Echo dahinter),
   dem **Puls aus Erde und Kies** statt aus einem Schlagzeug, und der **Luft**,
   in der beides steht.
3. Die Geräusche sind aus denselben drei Zutaten gebaut wie die Musik — Holz,
   Glas, Atem —, stehen im selben Raum und in der Tonart des laufenden Stücks:
   Ein grabender Wusling ist eine Spur im Arrangement, keine Zulieferung.

Das ist absichtlich in Material formuliert und nicht in Stimmung. „Verspielt und
modern" beschreibt kein Instrument und keine Entscheidung. „Holz mit Glaskante,
punktiertes Echo, Erde und Kies unten" beschreibt beides.

---

## 2. Was „modern" hier konkret heißt

Nicht als Stilrichtung, sondern als sechs Produktionsmittel. Zu jedem steht, was
heute davon eingelöst ist.

### 2.1 Raum statt Trockenheit

Moderne Spielmusik steht in einer Umgebung, nicht auf einem Tisch. Zwei
Nachhallwege statt einem:

- **Nähe** — der vorhandene kurze Federhall (0,34 s). Er klebt Musik und
  Geräusche zusammen und bleibt.
- **Luft** — ein zweiter, langer, dunkler Nachhall mit Vorlaufzeit, dessen
  Länge, Pegel und Dämpfung **je Welt** eingestellt werden. Die Wiese bekommt
  eine helle, weite, leise Luft (1,6 s), die Höhle eine lange, dunkle (2,9 s,
  bei 1,4 kHz gedämpft).

*Heute nicht eingelöst:* Es gibt nur die Nähe, und sie ist für alle Welten
gleich. Die Höhle klingt so trocken wie die Wiese.

### 2.2 Echo auf dem Tempo

Ein tempogekoppeltes Echo auf der Melodie ist das deutlichste einzelne Merkmal,
an dem man produzierte von programmierter Musik unterscheidet. Punktierte Achtel
(1,5 Schritte), Rückführung 0,3, im Rückweg gedämpft, damit die Wiederholungen
dunkler werden statt schriller.

*Heute nicht eingelöst:* gar nicht vorhanden.

### 2.3 Breite

Bass, Kick und Melodie stehen in der Mitte — das ist die Regel für kleine
Lautsprecher und sie bleibt. Alles andere wird gespreizt: die zwei verstimmten
Stimmen der Fläche nach links und rechts, die Sechzehntelfigur wechselseitig,
die Kiesel gestreut, die zwei Stimmen der Melodie um ±0,15 auseinander.

Die Spreizung ist **ausschließlich Pegelverteilung** — keine Verzögerung,
keine Phasendrehung. Zusammengelegt zu Mono ergibt sie exakt denselben Klang.
Das ist die einzige Art von Breite, die auf einem Handylautsprecher nichts
kostet.

*Heute nicht eingelöst:* Es gibt keinen einzigen Panoramaknoten im ganzen
Verzeichnis.

### 2.4 Groove statt Raster

Drei Eingriffe, alle deterministisch (feste Werte, kein Würfeln):

- **Der Puls wird zu 3-3-2.** Der Kick steht auf den Achteln 0, 3 und 6 statt
  auf jeder Viertel. Der Bass füllt genau die Achtel, die der Kick nicht nimmt
  (1, 2, 4, 5, 7) — die tiefe Lage bleibt also lückenlos belegt wie bisher, aber
  der **Akzent** wandert. Aus „vier gerade durch" wird ein Gang mit Federung.
- **Swing auf den Sechzehnteln.** Die zweite Sechzehntel jeder Achtel kommt 12 %
  später. Das ist Humanisierung, kein Shuffle — man hört es als Lockerheit, nicht
  als Stilzitat.
- **Mikroversatz.** Der Bass kommt 6 ms zu früh (er zieht), die Harmonie 14 ms zu
  spät (sie lehnt sich zurück), die Kiesel 3 ms zu früh. Feste Zahlen, immer
  dieselben. Genau das ist der Unterschied zwischen Spielern und einem Raster.

*Heute nicht eingelöst:* Kein einziges Ereignis liegt neben dem Raster.

### 2.5 Klangfarben aus dem Bild

Ein Schlagzeug kommt im Bild nicht vor, Erde und Kiesel schon. Also wird der
Puls daraus gebaut:

- **Kick → Erdschlag.** Derselbe Tonhöhenabsturz auf 150 Hz, aber mit weichem
  Ansatz und einem hölzernen Klopfen bei 900 Hz obendrauf statt eines
  Zischers bei 1800. Ein Fuß auf festgetretener Erde, kein Verstärkerkeller.
- **Schüttelrohr → Kies.** Zwei kurze Rauschkörner in getrennten Bändern (3,4 kHz
  und 7 kHz) mit leicht verschiedener Länge, gestreut im Panorama. Körnung statt
  „tss".
- **Bass → gezupft.** Sägezahn hinter einem Filter, der in 60 ms von der sechsten
  auf die anderthalbfache Grundfrequenz zufährt. Das ist ein angerissener
  Basston, kein Dreieck mit Hüllkurve — und genau das meint „federnder
  Fingered Bass".
- **Akkordeon → Okarina.** Rund, fast nur Grundton und schwacher zweiter
  Teilton, Anblasrauschen, langsam einsetzendes Vibrato, zwei Stimmen 6 Cent
  auseinander. Warm und kindlich, ohne Jahrmarkt.
- **Achtbit-Ebene → weg.** Ersatzlos. Ihre Aufgabe war, der Melodie eine Kante zu
  geben; die übernimmt der Pling, dessen Glasanteil dasselbe tut, aber zum Bild
  gehört.

*Heute nicht eingelöst:* alles davon.

### 2.6 Ein Frequenzbild, das für ein Telefon gebaut ist

Das bleibt, was es ist, und wird an einer Stelle ergänzt:

| Band | wem es gehört |
|---|---|
| unter 85 Hz | niemandem — Hochpass |
| 150–250 Hz | Fundament (Bass, Erdschlag, Fläche) |
| 250–800 Hz | Begleitfiguren, Körper der Harmonie |
| 800 Hz – 3 kHz | **allein der Melodie** |
| 3,5–5 kHz | gedämpft: −2,5 dB, breit. Dort sitzt die Eigenresonanz kleiner Lautsprecher, und dort klingt jede Synthese nach Plastik. |
| über 6 kHz | Kies, Glaskanten, Luft |

Dazu ein **Pumpen**: Fläche und Harmonie laufen über einen eigenen Zweig, dessen
Pegel bei jedem Erdschlag um gut 3 dB einbricht und in 120 ms zurückkommt. Das
ist der Grund, warum moderne Mischungen unten wuchtig klingen, ohne lauter zu
sein: Der Schlag bekommt jedes Mal den Platz ganz für sich.

---

## 3. Wie Musik und Geräusche eine Sache werden

Vier Bindemittel, drei davon neu.

1. **Derselbe Raum.** Beide Busse gehen durch Nähe *und* Luft. Bleibt.
2. **Dasselbe Material.** Holz, Glas, Atem. Der **Pling** ist in allen drei
   Schichten dasselbe Objekt: In der Musik ist er der Anschlag unter der
   Melodie und der Glitzer darüber, in den Geräuschen die Werkzeugwahl, der
   Knopf und jede Brückenstufe, im Stinger der Anschlag auf der Fanfare. *Neu.*
3. **Dieselbe Tonart — die des laufenden Stücks, nicht C.** Bisher steht alles
   Melodische der Geräusche in C-Dur pentatonisch, fest verdrahtet. Das geht bei
   zwei Welten gut, weil die C-Pentatonik zufällig vollständig in A-dorisch
   liegt. Bei der dritten Welt geht es schief, und zwar leise: Man hört nur, dass
   etwas nicht stimmt. Also bekommt jedes Stück seine eigene Fünftonleiter, und
   die Geräusche fragen das laufende Stück. *Neu — und durch einen Test
   abgesichert: Jede Geräuschstufe muss ein Ton sein, den die Melodie dieser
   Welt selbst benutzt.*
4. **Derselbe Takt.** Die Trippelschritte laufen künftig auf dem Achtelraster der
   Musik statt auf festen 190 ms. Der konstanteste Klang des Spiels — sechzig
   laufende Figuren — wird damit zur Perkussionsspur, statt gegen sie zu
   schweben. *Neu.*

Punkt 4 ist der, der am meisten ausmacht und am wenigsten kostet. Beim Spielen
hört man fast durchgehend Schritte; solange sie eine eigene Periode haben,
zerfällt das Klangbild in „Musik" und „Spiel", egal wie gut beides für sich ist.

---

## 4. Die Änderungen im Einzelnen, je mit einem hörbaren Grund

| # | Änderung | Grund, hörbar |
|---|---|---|
| 1 | Zweiter Nachhall („Luft"), je Welt eingestellt | Heute klingen Wiese und Höhle im selben Zimmer. Danach klingt die Höhle nach Höhle, weil der Nachhall dreimal so lang und bei 1,4 kHz gedämpft ist. |
| 2 | Tempogekoppeltes Echo (punktierte Achtel) auf Melodie, Glitzer, Fanfare | Ohne Echo endet jede Note dort, wo sie aufhört. Mit Echo hat die Melodie einen Nachsatz — und das Ohr erkennt darin sofort eine Produktion statt einer Wiedergabe. |
| 3 | Stereo: Fläche gespreizt, Figur wechselseitig, Kies gestreut, Melodie ±0,15 | Mono ist ein Punkt. Nach der Spreizung liegt die Melodie in der Mitte *vor* einem Feld, statt mittendrin. |
| 4 | Groove 3-3-2 statt vier Viertel | Vier gerade Viertel sind der Groove eines Metronoms. 3-3-2 ist ein Gang: zwei lange Schritte, ein kurzer. |
| 5 | Swing 12 % auf den Sechzehnteln | Gerade Sechzehntel sind eine Maschine. 12 % später ist keine Stilrichtung, sondern Lockerheit. |
| 6 | Mikroversatz: Bass −6 ms, Harmonie +14 ms, Kies −3 ms | Wenn alles auf derselben Millisekunde liegt, hört man einen Auslöser. Mit Versatz hört man Stimmen. |
| 7 | Kick → Erdschlag, Schüttelrohr → Kies | Der Boden im Bild ist Erde mit Kieseln. Ein Zischer bei 5,2 kHz gehört zu einer Hi-Hat, und die kommt im Bild nicht vor. |
| 8 | Bass → gezupfter Filterbass | Ein Dreieck mit Hüllkurve ist ein Ton. Ein Sägezahn hinter einem zufahrenden Filter ist ein *Anriss* — man hört den Finger. |
| 9 | Akkordeon → Okarina (Wiese) | Musette-Stimmung ist Jahrmarkt. Die Wiese ist keiner. |
| 10 | Achtbit-Ebene entfernt | Sie ist ein Zitat von 1991 und sitzt ausgerechnet im Fenster der Melodie. Im Bild ist nichts gerastert. |
| 11 | Pling als gemeinsames Zeichen in Musik, Geräusch und Stinger | Wiedererkennung entsteht durch Wiederholung *desselben* Objekts an mehreren Orten, nicht durch viele schöne Einzelklänge. |
| 12 | Pumpen: Fläche/Harmonie ducken unter jedem Erdschlag | Das ist der Klang, den „basslastig" wirklich meint: nicht mehr Pegel unten, sondern regelmäßig freigeräumter Platz. |
| 13 | Senke −2,5 dB bei 4,2 kHz | Dort hat ein Handylautsprecher seine Resonanz. Ohne die Senke klingt alles Synthetische dort nach Plastik. |
| 14 | Bogen über acht Takte (Figur und Fläche schwellen, Filter öffnet) | Heute klingt Takt 8 wie Takt 1. Danach hat die Schleife eine Richtung, und der Wiedereinstieg fällt nicht auf. |
| 15 | Tempo 126 → 120 (Wiese), 112 → 100 (Höhle) | 126 und 112 stammen aus einem Vorgabeblatt von 1991. 120 ist Schritttempo, und 250 ms je Achtel legt das ganze Echo- und Schrittraster auf runde Werte. 100 statt 112 macht aus der Höhle einen anderen *Ort* statt derselben Musik in Blau. |
| 16 | Geräusche in der Tonart des laufenden Stücks | Siehe §3.3. Heute klingt es zufällig richtig, morgen zufällig falsch. |
| 17 | Trippelschritte auf dem Achtelraster der Musik | Der häufigste Klang im Spiel läuft heute als einziger gegen den Takt. |
| 18 | Stinger folgt der Tonart der Welt | Eine Fanfare in C über einer Höhle in A ist heute noch verzeihlich, weil C-Dur die Paralleltonart ist. Bei Welt 3 ist sie es nicht mehr. |
| 19 | Pause: Tiefpass **und** mehr Luft | Ein Tiefpass allein klingt nach kaputtem Gerät. Tiefpass plus doppelte Luft klingt nach einem Schritt zurück — genau das, was eine Pause ist. |
| 20 | Ausgangsschimmer bekommt Gold: dritte Schicht, warme Mitte | Der Ausgang ist das einzige Objekt im Bild, das selbst leuchtet. Er klang bisher blau. |

---

## 5. Wo ich mich gegen die alte Vorgabe entscheide

Die Vorgabe (`wuslingemusiksoundprompt.md`) beschreibt einen Amiga-Tracker-Klang
von 1991, „modern produziert". Der heutige Auftrag lautet „modern". Wo beides
zieht, gewinnt der heutige Auftrag — und das Bild.

| Vorgabe | Entscheidung | Grund |
|---|---|---|
| „dünne 8-Bit-Ebene aus Square-Lead" | gestrichen | Nichts am Spiel ist mehr gerastert. Die Ebene ist ein Zitat ohne Gegenstand — und sie sitzt im Melodiefenster. |
| „Akkordeon trägt die Hookline" | Okarina | Jahrmarkt gegen Wiese. Siehe §0. |
| „12-Bit-Sampler-Crunch, Tape-Wow" | nur die Bandsättigung bleibt | Crunch und Wow sind Alterungszeichen. Ein gemaltes Bild in vollen Farben will keine simulierte Abnutzung. Die Sättigungskennlinie bleibt, weil sie zwei echte Aufgaben hat (Volumen und Übersteuerungsschutz). |
| „hüpfender Zwei-Viertel-Groove, 118–134 BPM" | 3-3-2 bei 120 / 100 BPM | Zwei Viertel gerade ist genau der Groove, der heute läuft und der nach Metronom klingt. |
| „Mono, 44,1 kHz, als OGG" | monokompatibles Stereo, alles synthetisiert | Dateien scheiden ohnehin aus (Einzeldatei). Mono*kompatibel* ja, Mono nein — Breite kostet auf dem Telefon nichts und gewinnt auf Kopfhörern alles. |
| „Suno/Udio-Prompts" | nicht anwendbar | Es wird nichts nachgeladen. Alles entsteht zur Laufzeit. |
| „Wassertropfen, Vogelrufe usw." | bleibt | Das ist gute Arbeit und passt zum Bild. |
| „Fundament 150–250 Hz, Melodie 800 Hz–3 kHz frei" | bleibt, unverändert | Das ist keine Stilfrage, sondern Physik des Zielgeräts. |

### Zur Frage „basslastiger, Richtung Trance"

Die beiden Wünsche ziehen **teilweise** auseinander, und die Trennlinie ist
scharf:

- Was von Trance trägt, ist der **Antrieb**: eine tiefe Lage, die nie stillsteht,
  und ein Puls, den man im Körper hat, bevor man ihn bemerkt. Das passt zu einem
  Echtzeitspiel mit laufender Uhr, und es bleibt — sogar stärker als bisher, weil
  der gezupfte Bass mehr Kante hat und das Pumpen ihm Platz macht.
- Was von Trance nicht trägt, ist das **Genre**: Supersaw-Flächen, Aufbauten,
  Abbrüche, 138 BPM, vier gerade Viertel. Das gehört in einen Club bei Nacht, und
  im Bild steht ein Mittag mit Wolken. Es liefe außerdem gegen die abgenommene
  Melodie, die ein Volkslied ist.

Also: **der Antrieb ja, das Genre nein.** Was der Auftraggeber mit „basslastiger"
gehört hat, wird hier nicht durch mehr Pegel unten eingelöst — der ist schon da
und ist auf einem Telefon auch nicht steigerbar —, sondern durch die zwei
Mittel, die auf kleinen Lautsprechern wirklich funktionieren: **Anriss** (der
gezupfte Filterbass hat einen hörbaren Anfang) und **Platz** (das Pumpen räumt
ihn 24-mal je Takt frei).

---

## 6. Was eine neue Themenwelt mindestens braucht

Damit Welt 3 nicht wie Welt 1 in einer anderen Farbe klingt, reicht kein neues
Stück. Es sind **fünf** Größen, und drei davon sind heute noch gar nicht je Welt
einstellbar:

| Größe | heute | künftig |
|---|---|---|
| Melodie und Akkorde | je Welt | bleibt |
| Tempo | je Welt | bleibt |
| Melodiestimme | je Welt | bleibt |
| **Raum** (Länge, Dämpfung, Pegel der Luft) | für alle gleich | **je Welt** |
| **Tonart der Geräusche** | fest C-Dur | **je Welt, aus dem Stück** |
| **Fanfarengrundton** | fest C | **je Welt, aus dem Stück** |
| **Material des Pulses** | für alle gleich | je Welt wählbar (Erde/Kies heute; Eis, Metall, Stein später) |

Die Faustregel dahinter: **Was gleich bleiben muss, ist der Pling und die tiefe
Lage — das ist die Identität. Was sich ändern muss, ist der Raum, die
Sustainstimme, das Tempo, die Tonart und das Material der Perkussion.** Eine
Welt, die nur eine neue Melodie mitbringt, ist keine neue Welt.

---

## 7. Woran das gemessen wird

Die sechs bestehenden Prüfungen in `scripts/smoke.mjs` gelten unverändert; die
wichtigste bleibt „Die Melodie behält ihr Fenster", weil eine treibende
Begleitung die Melodie zudecken kann, ohne dass irgendeine andere Prüfung
anschlägt.

Neu hinzu kommen zwei messbare Eigenschaften, weil dieser Entwurf zwei neue
Behauptungen aufstellt:

1. **Stereo, aber monokompatibel** (`scripts/smoke.mjs`). Gemessen wird die
   Differenz zwischen linkem und rechtem Kanal: Sie muss größer als null sein
   (sonst ist es kein Stereo) und darf einen Bruchteil der Summe nicht
   überschreiten (sonst kippt beim Zusammenlegen etwas weg). Eine reine
   Pegelverteilung kann das per Bauart einhalten; ein versehentlich eingebauter
   Phasentrick nicht.
2. **Die Geräusche stehen in der Tonart des Stücks** (`tests/musik.test.ts`).
   Jede Stufe der Geräuschleiter einer Welt muss ein Ton sein, den die Melodie
   dieser Welt selbst benutzt. Das ist die Prüfung, die verhindert, dass Welt 3
   mit einer Fünftonleiter ausgeliefert wird, die neben ihrem eigenen Stück
   steht.
