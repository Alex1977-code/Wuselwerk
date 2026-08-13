import type { ThemeId } from '../levels/types';
import type { AudioEngine } from './engine';
import {
  akkordeon,
  bass,
  erdschlag,
  flaeche,
  glocke,
  kalimba,
  kies,
  klarinette,
  leier,
  okarina,
  panfloete,
  pizzicato,
  pling,
  streicher,
  tick,
  ukulele,
  woodblock,
} from './instrumente';

/**
 * Begleitmusik, zur Laufzeit erzeugt.
 *
 * ## Woher die Melodien kommen — und woher nicht
 *
 * Das Vorbild von 1991 hat gemeinfreie Volkslieder und Klassik **neu
 * arrangiert**. Das ist das Rezept, nicht das Ergebnis: Eine Melodie aus dem
 * 18. Jahrhundert ist frei, das fremde Arrangement nicht, und die eigenen
 * Melodien jenes Spiels erst recht nicht. Hier stehen deshalb **eigene
 * Melodien im gleichen Geist** — kurze, singbare Achttakter mit Volksliedbau.
 *
 * ## Was den Wiedererkennungswert traegt
 *
 * Nicht die Melodie, sondern Instrumentierung, Groove und Klangtextur. Deshalb
 * liegt das Gewicht hier auf den Klangfarben (`instrumente.ts`), auf dem
 * Puls und auf dem gemeinsamen Federhall, durch den Musik und Geraeusche gehen.
 *
 * ## Zwei Sorten Musik in einem Stueck
 *
 * Ueber dem Ganzen liegt ein Volkslied — Achttakter, Kopfmotiv, gehaltene
 * Stimme. Darunter laeuft eine **Maschine**: ein Puls im Dreier-Dreier-Zweier,
 * ein Bass, der jede uebrige Achtel besetzt, eine gehaltene Flaeche und eine
 * Sechzehntelfigur.
 *
 * Dass beides zusammengeht, liegt an einer strengen Aufteilung des Frequenz-
 * bandes und nicht am Zufall: Die Maschine bleibt **unter** 800 Hz, die Melodie
 * darueber. Wo beide dasselbe Band beanspruchen, gewinnt keiner — man dreht nur
 * lauter, bis alles zu laut ist.
 *
 * ## Was diese Fassung von einem Sequenzer unterscheidet
 *
 * Vorher lag jedes Ereignis exakt auf dem Raster und der Puls stand auf jeder
 * Viertel. Das ist der Klang einer Maschine, die Noten abspielt. Drei Eingriffe
 * machen daraus Musik, und alle drei sind **deterministisch** — feste Zahlen,
 * kein Wuerfeln:
 *
 * 1. **Der Puls ist 3-3-2** (`PULS`). Der Schlag steht auf den Achteln 0, 3 und
 *    6 statt auf jeder Viertel. Die tiefe Lage bleibt trotzdem lueckenlos
 *    belegt, weil der Bass genau die Achteln nimmt, die der Schlag frei laesst.
 *    Es aendert sich also nicht die Dichte, sondern der **Akzent** — und damit
 *    aus „vier gerade durch" ein Gang mit Federung wird.
 * 2. **Swing auf den Sechzehnteln** (`SCHWUNG`). Die zweite Sechzehntel jeder
 *    Achtel kommt gut ein Zehntel spaeter. Das ist Lockerheit, kein Shuffle.
 * 3. **Mikroversatz** (`VERSATZ`). Der Bass zieht (6 ms zu frueh), die Harmonie
 *    lehnt sich zurueck (14 ms zu spaet), der Kies zieht leicht mit. Wenn alles
 *    auf derselben Millisekunde liegt, hoert man einen Ausloeser; mit Versatz
 *    hoert man Stimmen.
 *
 * Dazu zwei Dinge aus der Mischung, die hier ausgeloest werden: Bei jedem Schlag
 * weicht der Pad-Zweig kurz zurueck (`AudioEngine.pumpe`) — das ist, was
 * „basslastig" auf einem Telefon wirklich heisst —, und die Melodie geht in ein
 * tempogekoppeltes Echo (`AudioEngine.setEcho`).
 *
 * ## Zwei Boegen, einer ueber dem anderen
 *
 * **Der kleine**, ueber acht Takte: Kies und Sechzehntelfigur schwellen an und
 * fallen beim Wiedereinstieg zurueck (`bogen`). Ohne das klingt Takt 8 wie
 * Takt 1, und der Punkt, an dem die Schleife herumkommt, ist die auffaelligste
 * Stelle des Stuecks.
 *
 * **Der grosse**, ueber vier Durchgaenge (`DURCHGAENGE`): Die Melodie wandert
 * zwischen zwei Stimmen, einmal faellt das Schlagwerk zwei Takte lang aus, die
 * Sechzehntelfigur kehrt ihre Richtung um, und am Ende kommt eine Oktave
 * darueber. Das ist die Antwort auf „zu eintoenig" — der kleine Bogen allein
 * reicht nicht, weil ein Level mehrere Minuten dauert und der Achttakter nur
 * zwanzig Sekunden.
 *
 * ## Die Ebenen
 *
 * Sieben Spuren, die einzeln zu- und abgeschaltet werden: Schlag, Bass, Flaeche,
 * Kies, Sechzehntelfigur, Harmonie, Melodie, dazu der Glitzer. Das ist
 * der Unterschied zu 1991 — dort lief ein Band, hier reagiert die Musik auf die
 * Lage:
 *
 * | Lage | was passiert |
 * |---|---|
 * | Normal | alle Spuren |
 * | Restzeit unter 30 % | Kies auf jede Achtel, Uhrentick dazu, Melodie raus, alles einen Halbton hoeher |
 * | Letzte zehn Sekunden | nur noch Bass und Tick |
 * | Pause | Tiefpass auf 400 Hz und doppelte Luft statt Stille — die Musik rueckt weg, statt abzureissen |
 * | Alle gerettet, Level laeuft noch | Glitzer verdoppelt, Glockengirlande darueber |
 */

/**
 * Ein Ton: Halbtöne über dem Grundton (null = Pause) und Länge in Achteln.
 *
 * **Die Tonfolgen in `STUECKE` sind abgenommen** (`docs/musik-abnahme.md`).
 * Wer sie ändern will, fragt vorher. Instrumentierung, Begleitung, Groove und
 * Mischung sind ausdruecklich nicht mit abgenommen und duerfen sich bewegen.
 */
type Note = readonly [number | null, number];

/**
 * Die Stimmen, die eine Melodie **halten** koennen.
 *
 * Ein Stabspiel steht hier nicht: Es kann keinen Ton halten, und eine Melodie
 * aus lauter abfallenden Anschlaegen piekst nur vor sich hin. Den Anschlag gibt
 * ohnehin das Stabspiel darunter dazu — siehe `update`.
 */
const STIMMEN = { akkordeon, klarinette, panfloete, okarina, leier, streicher } as const;
type StimmName = keyof typeof STIMMEN;

interface Stueck {
  melodie: readonly Note[];
  /** Akkordgrundton je Takt, in Halbtönen. */
  akkorde: readonly number[];
  /** Zusätzliche Töne des Akkords für die Harmoniespur. */
  farbe: readonly number[];
  bpm: number;
  /** Frequenz des Grundtons. */
  grund: number;
  /**
   * Wer die Melodie **haelt**, und wer sie im naechsten Durchgang uebernimmt.
   *
   * Zwei Stimmen statt einer, und das ist die Antwort auf „zu eintoenig". Eine
   * Achttaktschleife, die immer gleich klingt, wird nach dem dritten Umlauf zur
   * Tapete — nicht weil die Melodie schlecht waere, sondern weil **nichts
   * passiert**. In einem Orchester gibt man die Melodie in der Wiederholung
   * weiter; genau das tut `DURCHGAENGE`.
   *
   * `stimme` fuehrt, `zweitStimme` antwortet. Sie muessen sich hoerbar
   * unterscheiden, sonst ist der Wechsel keiner — gepaart sind deshalb eine
   * obertonreiche (gestrichen) und eine obertonarme (geblasen).
   */
  melodieStimme: StimmName;
  zweitStimme: StimmName;
  harmonieStimme: 'ukulele' | 'kalimba';
  /**
   * Die Fuenftonleiter, in der die **Geraeusche** dieser Welt stehen.
   *
   * Bisher hingen alle Spielgeraeusche fest an C-Dur pentatonisch. Bei diesen
   * zwei Welten geht das gut, aber nur durch einen Zufall: Die C-Pentatonik
   * (C D E G A) liegt vollstaendig in A-dorisch. Bei der dritten Welt haelt der
   * Zufall nicht mehr, und der Fehler ist einer von der leisen Sorte — man hoert
   * nur, dass etwas nicht stimmt, ohne zu wissen, was.
   *
   * Deshalb bringt jedes Stueck seine eigene Leiter mit, und `tonart()` reicht
   * sie an `sfx.ts` und `stinger.ts` weiter. Abgesichert durch einen Test:
   * **Jede Stufe muss ein Ton sein, den die Melodie dieser Welt selbst
   * benutzt** — dann kann eine Geraeuschleiter gar nicht neben ihrem Stueck
   * stehen.
   */
  sfxStufen: readonly number[];
  /**
   * Grundton der Fanfare, in Halbtoenen ueber `grund`.
   *
   * Eine Fanfare muss in Dur stehen, sonst ist sie kein Sieg. Bei einem Stueck
   * in Dur ist das der Grundton selbst; bei einem in Moll oder dorisch ist es
   * die **Paralleltonart** — der Ton drei Halbtoene darueber. Dass beide Welten
   * dadurch heute auf C landen, ist ein Ergebnis und keine Voraussetzung.
   */
  fanfareGrund: number;
}

const TAKT = 8;

/**
 * Der Puls: Dreier–Dreier–Zweier.
 *
 * Acht Achtel, Schlag auf 0, 3 und 6. Das ist die aelteste und verbreitetste
 * Synkope ueberhaupt, und sie tut hier genau eine Sache: Sie nimmt dem Stueck
 * das Metronom, ohne ihm den Antrieb zu nehmen. Vier gerade Viertel sind ein
 * Zaehlwerk; drei–drei–zwei ist ein Gang — zwei lange Schritte, ein kurzer, und
 * dann faellt man von selbst in den naechsten Takt.
 *
 * Der Bass besetzt genau die uebrigen Achtel (1, 2, 4, 5, 7). Damit bleibt die
 * Eigenschaft erhalten, an der die alte Fassung haengt und die auf einem
 * Handylautsprecher entscheidet: **Nie liegen zwei tiefe Toene gleichzeitig.**
 * Das Ohr hoert eine durchgehende tiefe Linie, und trotzdem matscht unten
 * nichts zusammen.
 */
export const PULS: readonly boolean[] = [true, false, false, true, false, false, true, false];

/**
 * Was der Bass auf den uebrigen Achteln spielt: Halbtoene ueber dem
 * Akkordgrundton und Pegelfaktor.
 *
 * Nur Grundton und Quinte — dieselbe Begruendung wie bei `ARPEGGIO`: Diese
 * Figur laeuft ueber alle Akkorde beider Stuecke, die Wiese in Dur, die Hoehle
 * in dorisch. Die Terz waere in der Hoehle der falsche Ton, Grundton und Quinte
 * passen ueber jeden Dreiklang jeder Tonart.
 *
 * Die Quinte steht auf 5 und 7, also auf den beiden Achteln, die in die naechste
 * schwere Zeit hineinfuehren. Das ist der aelteste Zug einer Basslinie: Ein Ton,
 * der nicht der Grundton ist, **will irgendwohin**, und das Ohr hoert das als
 * Zug nach vorn. Eine Linie aus lauter Grundtoenen steht nur da.
 */
export const BASSFIGUR: readonly (readonly [number, number] | null)[] = [
  null,      // 0 — Schlag
  [0, 0.72], // 1   Nachschlag zur Eins
  [0, 1.0],  // 2   zweite Viertel, voll
  null,      // 3 — Schlag
  [0, 1.0],  // 4   dritte Viertel, voll
  [7, 0.78], // 5   Quinte, hebt an
  null,      // 6 — Schlag
  [7, 0.95], // 7   Quinte, zieht in den naechsten Takt
];

/**
 * Kies auf den Achteln, die der Schlag frei laesst — mit Pegelmuster.
 *
 * Dieselbe Rhythmik wie der Bass, nur zwei Oktaven weiter oben. Dass sich beide
 * Schichten einig sind, wo „daneben" ist, macht den Groove lesbar: Es gibt genau
 * zwei Sorten Zeit in diesem Takt, und beide Enden des Frequenzbandes sagen
 * dasselbe darueber.
 */
const KIES_MUSTER: readonly number[] = [0, 1.0, 0.6, 0, 0.9, 0.6, 0, 1.0];

/**
 * Wie weit die zweite Sechzehntel nach hinten rutscht, als Anteil einer Achtel.
 *
 * 0,06 einer Achtel sind 12 % einer Sechzehntel. Das ist die Groessenordnung, in
 * der man es als **Lockerheit** hoert und nicht als Stilzitat; ab etwa einem
 * Drittel wird daraus ein Shuffle, und der wuerde gegen die abgenommene Melodie
 * laufen, die gerade Achtel hat.
 */
const SCHWUNG = 0.06;

/**
 * Mikroversatz in Sekunden. Negativ heisst frueher.
 *
 * Das ist der Unterschied zwischen einer Band und einem Auslöser. Ein Bassist
 * zieht, ein Rhythmusgitarrist lehnt sich zurueck; keiner von beiden trifft die
 * Millisekunde des Schlagzeugers, und genau daran erkennt das Ohr Menschen. Die
 * Werte sind fest und nicht gewuerfelt — es geht um eine **Haltung**, und die
 * ist bei jedem Takt dieselbe.
 *
 * Der Schlag steht auf null, weil er das Raster *ist*. Die Melodie auch: Sie
 * traegt die Aussage, und eine verschobene Melodie klingt nicht locker, sondern
 * falsch.
 */
const VERSATZ = { bass: -0.006, kies: -0.003, harmonie: 0.014 } as const;

export const STUECKE: Record<ThemeId, Stueck> = {
  /**
   * Welt 1 — Wiese.
   *
   * Achttakter mit Volksliedbau: **ein Kopfmotiv, das dreimal wiederkehrt**
   * (G–G–A–G, Takt 1, 3 und 7), jedes Mal mit einer anderen Antwort, und
   * dazwischen ein Mittelteil, der einmal woanders hingeht. Genau daran haengt
   * die Mitsummbarkeit: Nicht die Menge der Toene macht eine Melodie, sondern
   * die Wiederkehr. Die vorherige Fassung hatte keine — sie lief acht Takte
   * lang geradeaus und war deshalb nach dem Hoeren wieder weg.
   *
   * Zwei weitere Dinge, die eine Melodie zur Melodie machen und hier drinstehen:
   * Die Phrasen enden auf **langen** Toenen (Atempausen; ohne sie hoert man kein
   * Ende und damit auch keinen Anfang), und der Mittelteil bringt das Fis — die
   * uebermaessige Quarte, die lydische Farbe. Ein einziger Ton ausserhalb der
   * Tonleiter gibt einem Achttakter mehr Gesicht als jede Verzierung.
   */
  grass: {
    melodie: [
      // Kopf, Antwort abwaerts: G G A G E | F E D —
      [7, 2], [7, 1], [9, 1], [7, 2], [4, 2],
      [5, 2], [4, 2], [2, 3], [null, 1],
      // Kopf, Antwort aufwaerts: G G A G C' | H A G —
      [7, 2], [7, 1], [9, 1], [7, 2], [12, 2],
      [11, 2], [9, 2], [7, 4],
      // Mittelteil, mit dem Fis: C' H A G Fis | G — E D
      [12, 2], [11, 1], [9, 1], [7, 2], [6, 2],
      [7, 4], [4, 2], [2, 2],
      // Kopf zum dritten Mal, Schluss nach Hause: G G A G E | D E C —
      [7, 2], [7, 1], [9, 1], [7, 2], [4, 2],
      [2, 2], [4, 2], [0, 4],
    ],
    // Der letzte Takt steht auf der Dominante, waehrend die Melodie schon auf
    // dem Grundton liegt. Diese Reibung zieht die Schleife herum — ein Stueck,
    // das auf seinem eigenen Schlusston zur Ruhe kommt, faengt nicht wieder an.
    akkorde: [0, 5, 0, 7, 0, 7, 5, 7],
    farbe: [4, 7],
    // 120 statt 126. Die 126 stammen aus einem Vorgabeblatt von 1991 und nicht
    // aus diesem Spiel. Zwei Gruende fuer 120, und beide sind nachpruefbar:
    //
    // 1. **Schritttempo.** 120 Viertel je Minute ist der Gang eines Menschen.
    //    Das Level heisst „Spaziergang", und die Figuren laufen darin herum.
    // 2. **Rundes Raster.** Eine Achtel dauert damit genau 250 ms. Daran haengt
    //    mehr, als es aussieht: das Echo (punktierte Achtel, 375 ms) und die
    //    Trippelschritte, die jetzt auf demselben Achtelraster laufen statt auf
    //    freien 190 ms (`schrittDauer`).
    bpm: 120,
    grund: 261.63,
    // Drehleier statt Okarina — „zu floetenartig" war eine richtige
    // Beobachtung ueber den Bau der alten Stimme, nicht ueber ihren Pegel.
    // Die Begruendung im Einzelnen steht bei `leier` in `instrumente.ts`.
    melodieStimme: 'leier',
    zweitStimme: 'okarina',
    harmonieStimme: 'ukulele',
    // C-Dur pentatonisch. Jede Stufe kommt in der Melodie oben vor.
    sfxStufen: [0, 2, 4, 7, 9],
    fanfareGrund: 0,
  },
  /**
   * Welt 6 — Sonnenhang.
   *
   * Dasselbe Volkslied wie im Grasland, vier Stunden spaeter am Tag: Die
   * Melodie bleibt, weil die Welt in derselben Familie steht und der Spieler
   * das hoeren soll — aber sie steht einen Ganzton tiefer, geht langsamer und
   * traegt statt der Drehleier die Okarina. So klingt Nachmittag: dieselbe
   * Wiese, muedere Luft.
   */
  sonnenhang: {
    melodie: [
      // Kopf, Antwort abwaerts: G G A G E | F E D —
      [7, 2], [7, 1], [9, 1], [7, 2], [4, 2],
      [5, 2], [4, 2], [2, 3], [null, 1],
      // Kopf, Antwort aufwaerts: G G A G C' | H A G —
      [7, 2], [7, 1], [9, 1], [7, 2], [12, 2],
      [11, 2], [9, 2], [7, 4],
      // Mittelteil, mit dem Fis: C' H A G Fis | G — E D
      [12, 2], [11, 1], [9, 1], [7, 2], [6, 2],
      [7, 4], [4, 2], [2, 2],
      // Kopf zum dritten Mal, Schluss nach Hause: G G A G E | D E C —
      [7, 2], [7, 1], [9, 1], [7, 2], [4, 2],
      [2, 2], [4, 2], [0, 4],
    ],
    // Der letzte Takt steht auf der Dominante, waehrend die Melodie schon auf
    // dem Grundton liegt. Diese Reibung zieht die Schleife herum — ein Stueck,
    // das auf seinem eigenen Schlusston zur Ruhe kommt, faengt nicht wieder an.
    akkorde: [0, 5, 0, 7, 0, 7, 5, 7],
    farbe: [4, 7],
    // 120 statt 126. Die 126 stammen aus einem Vorgabeblatt von 1991 und nicht
    // aus diesem Spiel. Zwei Gruende fuer 120, und beide sind nachpruefbar:
    //
    // 1. **Schritttempo.** 120 Viertel je Minute ist der Gang eines Menschen.
    //    Das Level heisst „Spaziergang", und die Figuren laufen darin herum.
    // 2. **Rundes Raster.** Eine Achtel dauert damit genau 250 ms. Daran haengt
    //    mehr, als es aussieht: das Echo (punktierte Achtel, 375 ms) und die
    //    Trippelschritte, die jetzt auf demselben Achtelraster laufen statt auf
    //    freien 190 ms (`schrittDauer`).
    bpm: 104,
    grund: 233.08,
    // Drehleier statt Okarina — „zu floetenartig" war eine richtige
    // Beobachtung ueber den Bau der alten Stimme, nicht ueber ihren Pegel.
    // Die Begruendung im Einzelnen steht bei `leier` in `instrumente.ts`.
    melodieStimme: 'okarina',
    zweitStimme: 'leier',
    harmonieStimme: 'ukulele',
    // C-Dur pentatonisch. Jede Stufe kommt in der Melodie oben vor.
    sfxStufen: [0, 2, 4, 7, 9],
    fanfareGrund: 0,
  },
  /**
   * Welt 7 — Wipfelweide.
   *
   * Das Schlussstueck. Dieselbe Volksliedform, aber eine Quinte TIEFER
   * gegruendet und leicht beschleunigt: Die Hoehe traegt hier das
   * Instrument, nicht der Grundton — eine hoch gestimmte Begleitung liefe
   * der Melodie ins Fenster (800 Hz bis 3 kHz gehoeren ihr allein, und ein
   * Test besteht darauf). Man ist oben, die Luft ist duenner, und die
   * Panfloete fuehrt: ein Blasinstrument aus Rohr, das nach Wind zwischen
   * Halmen klingt, waehrend unten die Kalimba das Blattwerk zupft. Das
   * Kopfmotiv bleibt erkennbar; das hundertste Level soll klingen wie das
   * erste, nur hoeher.
   */
  wipfel: {
    melodie: [
      // Kopf, Antwort abwaerts: G G A G E | F E D —
      [7, 2], [7, 1], [9, 1], [7, 2], [4, 2],
      [5, 2], [4, 2], [2, 3], [null, 1],
      // Kopf, Antwort aufwaerts: G G A G C' | H A G —
      [7, 2], [7, 1], [9, 1], [7, 2], [12, 2],
      [11, 2], [9, 2], [7, 4],
      // Mittelteil, mit dem Fis: C' H A G Fis | G — E D
      [12, 2], [11, 1], [9, 1], [7, 2], [6, 2],
      [7, 4], [4, 2], [2, 2],
      // Kopf zum dritten Mal, Schluss nach Hause: G G A G E | D E C —
      [7, 2], [7, 1], [9, 1], [7, 2], [4, 2],
      [2, 2], [4, 2], [0, 4],
    ],
    // Der letzte Takt steht auf der Dominante, waehrend die Melodie schon auf
    // dem Grundton liegt. Diese Reibung zieht die Schleife herum — ein Stueck,
    // das auf seinem eigenen Schlusston zur Ruhe kommt, faengt nicht wieder an.
    akkorde: [0, 5, 0, 7, 0, 7, 5, 7],
    farbe: [4, 7],
    // 120 statt 126. Die 126 stammen aus einem Vorgabeblatt von 1991 und nicht
    // aus diesem Spiel. Zwei Gruende fuer 120, und beide sind nachpruefbar:
    //
    // 1. **Schritttempo.** 120 Viertel je Minute ist der Gang eines Menschen.
    //    Das Level heisst „Spaziergang", und die Figuren laufen darin herum.
    // 2. **Rundes Raster.** Eine Achtel dauert damit genau 250 ms. Daran haengt
    //    mehr, als es aussieht: das Echo (punktierte Achtel, 375 ms) und die
    //    Trippelschritte, die jetzt auf demselben Achtelraster laufen statt auf
    //    freien 190 ms (`schrittDauer`).
    bpm: 126,
    grund: 196.0,
    // Drehleier statt Okarina — „zu floetenartig" war eine richtige
    // Beobachtung ueber den Bau der alten Stimme, nicht ueber ihren Pegel.
    // Die Begruendung im Einzelnen steht bei `leier` in `instrumente.ts`.
    melodieStimme: 'panfloete',
    zweitStimme: 'okarina',
    harmonieStimme: 'kalimba',
    // C-Dur pentatonisch. Jede Stufe kommt in der Melodie oben vor.
    sfxStufen: [0, 2, 4, 7, 9],
    fanfareGrund: 0,
  },
  /**
   * Welt 2 — Hoehle. Derselbe Bau, andere Tonleiter: dorisch auf A.
   *
   * Der Unterschied zu Moll ist ein einziger Ton, die **grosse Sexte** (Fis).
   * Sie steht hier an der auffaelligsten Stelle — Takt 4, allein, lang gehalten,
   * ueber einem D-Dur-Akkord. Dorisch ist die Tonart, die traurig anfaengt und
   * dann doch nicht traurig ist; das passt zu einer Hoehle, die neugierig sein
   * soll und nicht bedrohlich.
   */
  crystal: {
    melodie: [
      // Kopf: A C D E | D C H —
      [0, 2], [3, 2], [5, 2], [7, 2],
      [5, 2], [3, 2], [2, 4],
      // Kopf, Antwort auf die dorische Sexte: A C D G | Fis — E —
      [0, 2], [3, 2], [5, 2], [10, 2],
      [9, 4], [7, 4],
      // Mittelteil, von oben herab: A' G Fis E | D — C —
      [12, 2], [10, 2], [9, 2], [7, 2],
      [5, 4], [3, 4],
      // Kopf zum dritten Mal, Schluss: A C D C | H A — —
      [0, 2], [3, 2], [5, 2], [3, 2],
      [2, 2], [0, 6],
    ],
    akkorde: [0, 10, 0, 5, 10, 3, 5, 0],
    farbe: [3, 7],
    // 100 statt 112. Der alte Abstand zur Wiese war elf Prozent — hoerbar, aber
    // zu wenig, um die Hoehle zu einem anderen **Ort** zu machen statt zu
    // derselben Musik in Blau. Mit 100 gegen 120 sind es sechzehn Prozent, und
    // dazu kommt der laengere, dunklere Raum (`ambiente.ts`).
    //
    // Dass die Melodie dabei nicht schleppt, liegt am Bau des Stuecks: Ihre
    // Noten sind fast durchweg Viertel, waehrend die Sechzehntelfigur darunter
    // weiterlaeuft. Langsame Harmonie ueber schneller Oberflaeche — so bleibt
    // ein langsames Stueck in Bewegung, ohne hektisch zu werden.
    bpm: 100,
    grund: 220,
    // Streicher statt Klarinette, aus demselben Grund: Eine gedackte Roehre hat
    // nur die ungeraden Teiltoene und liegt damit naeher an einer Floete als an
    // allem anderen. Die Klarinette bleibt als Zweitstimme.
    melodieStimme: 'streicher',
    zweitStimme: 'klarinette',
    harmonieStimme: 'kalimba',
    // A-Moll pentatonisch. Jede Stufe kommt in der Melodie oben vor — und alle
    // fuenf liegen in A-dorisch, das ist derselbe Tonvorrat.
    sfxStufen: [0, 3, 5, 7, 10],
    // Drei Halbtoene ueber A ist C. Die Paralleltonart, also die Durfarbe, die
    // zu diesem Stueck gehoert.
    fanfareGrund: 3,
  },
  /**
   * Welt 3 — Rostwerk. Ein **Arbeitslied**: mixolydisch auf G, also Dur mit
   * kleiner Septime — die Tonart der Werkbank, kraeftig, aber nie feierlich.
   * Derselbe Volksliedbau wie ueberall (Kopfmotiv dreimal, Mittelteil einmal
   * woanders): Das Kopfmotiv ist ein Ruf ueber zwei Takte, die kleine Septime
   * (F) traegt den Mittelteil, und der Schluss holt den Ruf nach Hause.
   * Eigene Erfindung, wie alle Stuecke hier — nichts davon stammt aus einem
   * Vorbild.
   */
  rust: {
    melodie: [
      // Ruf: G G H A G | D — C H
      [0, 2], [0, 1], [4, 1], [2, 2], [0, 2],
      [7, 4], [5, 2], [4, 2],
      // Ruf, Antwort abwaerts: G G H A C | H A G —
      [0, 2], [0, 1], [4, 1], [2, 2], [5, 2],
      [4, 2], [2, 2], [0, 4],
      // Mittelteil mit der kleinen Septime: F E D C | D — E —
      [10, 2], [9, 2], [7, 2], [5, 2],
      [7, 4], [9, 4],
      // Ruf zum dritten Mal, Schluss: G G H A F | E D G —
      [0, 2], [0, 1], [4, 1], [2, 2], [10, 2],
      [9, 2], [7, 2], [0, 4],
    ],
    // Pendel zwischen G und F — die mixolydische Kadenz. Der letzte Takt
    // steht wieder auf G: Ein Arbeitslied kommt heim und faengt neu an.
    akkorde: [0, 10, 0, 5, 10, 5, 10, 0],
    farbe: [4, 10],
    // 112: schneller als die Wiese, langsamer als der Schlot — Hammertakt.
    bpm: 112,
    grund: 196,
    melodieStimme: 'akkordeon',
    zweitStimme: 'okarina',
    harmonieStimme: 'ukulele',
    // G-Dur pentatonisch; jede Stufe kommt in der Melodie vor.
    sfxStufen: [0, 2, 4, 7, 9],
    fanfareGrund: 0,
  },
  /**
   * Welt 4 — Frostklamm. Reines Moll (aeolisch) auf E, langsam und glasig:
   * Die Melodie steigt in Terzschritten wie Atem in kalter Luft und faellt
   * in der dritten Phrase aus der Hoehe zurueck. Die Kaelte kommt nicht aus
   * der Tonart allein, sondern aus der Besetzung — Panfloete ueber Kalimba
   * ist Luft ueber Eis.
   */
  frost: {
    melodie: [
      // Kopf: E G A H | A G Fis —
      [0, 2], [3, 2], [5, 2], [7, 2],
      [5, 2], [3, 2], [2, 4],
      // Kopf, Antwort in die Sexte: E G A C | H — A —
      [0, 2], [3, 2], [5, 2], [8, 2],
      [7, 4], [5, 4],
      // Mittelteil, von oben herab: E' D H A | G — E —
      [12, 2], [10, 2], [7, 2], [5, 2],
      [3, 4], [0, 4],
      // Schluss, eng um den Grundton: Fis G A G | Fis E — —
      [2, 2], [3, 2], [5, 2], [3, 2],
      [2, 2], [0, 6],
    ],
    akkorde: [0, 8, 3, 10, 8, 3, 10, 0],
    farbe: [3, 8],
    // 88: das langsamste Stueck des Spiels — in der Klamm traegt der Hall.
    bpm: 88,
    grund: 164.81,
    melodieStimme: 'panfloete',
    zweitStimme: 'streicher',
    harmonieStimme: 'kalimba',
    // E-Moll pentatonisch; jede Stufe kommt in der Melodie vor.
    sfxStufen: [0, 3, 5, 7, 10],
    fanfareGrund: 3,
  },
  /**
   * Welt 5 — Schlot. Phrygisch auf D: Die kleine Sekunde (Es) direkt ueber
   * dem Grundton ist die Reibung, die nie ganz ausgeht — Hitze als
   * Intervall. Das schnellste Stueck des Spiels, und trotzdem in Vierteln
   * erzaehlt: Der Druck kommt aus der Harmonik, nicht aus Hast.
   */
  magma: {
    melodie: [
      // Kopf, eng am Grundton: D Es F Es | D — F G
      [0, 2], [1, 2], [3, 2], [1, 2],
      [0, 4], [3, 2], [5, 2],
      // Kopf, weiter hinauf: D Es F G | A — G F
      [0, 2], [1, 2], [3, 2], [5, 2],
      [7, 4], [5, 2], [3, 2],
      // Mittelteil an der Spitze: A B A G | F Es D —
      [7, 2], [8, 2], [7, 2], [5, 2],
      [3, 2], [1, 2], [0, 4],
      // Schluss, aus der Oktave herab: D' C A G | F Es D —
      [12, 2], [10, 2], [7, 2], [5, 2],
      [3, 2], [1, 2], [0, 4],
    ],
    // Das phrygische Pendel: D gegen Es, dazwischen einmal F. Es loest sich
    // nie weiter als einen Halbton — genau das haelt die Spannung.
    akkorde: [0, 1, 0, 3, 1, 0, 1, 0],
    farbe: [1, 3],
    // 132: Zeitdruck von oben, Hitze von unten.
    bpm: 132,
    grund: 146.83,
    melodieStimme: 'klarinette',
    zweitStimme: 'leier',
    harmonieStimme: 'ukulele',
    // D-Moll pentatonisch; jede Stufe kommt in der Melodie vor.
    sfxStufen: [0, 3, 5, 7, 10],
    fanfareGrund: 3,
  },
};

// ---------------------------------------------------------------------------
// Was der Rest der Tonschicht vom laufenden Stueck wissen muss
// ---------------------------------------------------------------------------

/**
 * Welches Stueck gerade laeuft — als Modulzustand.
 *
 * Warum hier und nicht als Feld der Klasse: `sfx.ts` und `stinger.ts` brauchen
 * die Tonart und das Achtelraster, haben aber keinen Zugriff auf die
 * `Music`-Instanz. Ueber `GameAudio` liefe es nur mit einer Aenderung an
 * `index.ts`, und die Datei gehoert mir nicht. Der Modulzustand ist der
 * ehrlichere Weg: Es gibt im ganzen Spiel genau ein laufendes Stueck, also ist
 * „welches" auch genau eine Angabe und kein Zustand je Objekt.
 *
 * `GameAudio.setTheme` ruft `music.setTheme` **vor** `sfx.reset`, die Reihenfolge
 * stimmt also von selbst.
 */
let laufendesThema: ThemeId = 'grass';

/** Zeitpunkt der naechsten noch nicht geplanten Achtel, in der Klanguhr. */
let naechsteAchtel = 0;

export interface Tonart {
  /** Grundton in Hertz. */
  grund: number;
  /** Die Fuenftonleiter dieser Welt, in Halbtoenen ueber dem Grundton. */
  stufen: readonly number[];
  /** Grundton der Fanfare, in Halbtoenen ueber dem Grundton. */
  fanfare: number;
}

/**
 * Die Tonart des laufenden Stuecks. Fuer Geraeusche und Stingers.
 *
 * Das ist das dritte der vier Bindemittel zwischen Musik und Geraeuschen (die
 * anderen sind der gemeinsame Raum, das gemeinsame Material und der gemeinsame
 * Takt). Ein Effekt, der neben der laufenden Musik steht, klingt nach Fehler —
 * auch wenn er fuer sich genommen schoen ist.
 */
export function tonart(): Tonart {
  const p = STUECKE[laufendesThema];
  return { grund: p.grund, stufen: p.sfxStufen, fanfare: p.fanfareGrund };
}

/**
 * Wie lang eine Achtel des laufenden Stuecks dauert, in Sekunden.
 *
 * Gebraucht von den Trippelschritten: Sie liefen bisher auf festen 190 ms und
 * damit als einziger Klang des Spiels **gegen** die Musik. Beim Spielen hoert
 * man fast durchgehend Schritte; solange sie eine eigene Periode haben,
 * zerfaellt das Klangbild in „Musik" und „Spiel", egal wie gut beides fuer sich
 * ist.
 */
export function schrittDauer(): number {
  return 60 / STUECKE[laufendesThema].bpm / 2;
}

/**
 * Verzoegerung bis zur naechsten Achtel, in Sekunden.
 *
 * Damit landet ein Klang, der irgendwann im Bild ausgeloest wird, auf dem Raster
 * der Musik statt daneben. Der Rest der Division ist noetig, weil die Musik
 * ihren Vorlauf plant und `naechsteAchtel` deshalb bis zu 0,35 s voraus liegen
 * kann — gemeint ist aber die *naechste* Achtel, nicht die naechste ungeplante.
 *
 * Laeuft keine Musik, kommt null heraus und der Klang spielt sofort. Das ist
 * richtig so: Ohne Raster gibt es nichts, worauf man warten koennte.
 */
export function bisNaechsteAchtel(jetzt: number): number {
  const d = schrittDauer();
  if (naechsteAchtel <= 0 || d <= 0) return 0;
  const rest = (((naechsteAchtel - jetzt) % d) + d) % d;
  return rest;
}

const LOOKAHEAD = 0.35;

/**
 * Die Sechzehntelfigur, in Halbtoenen ueber dem Grundton des jeweiligen Takts.
 *
 * **Nur Grundton, Quinte und Oktave — und die Terz mit Absicht nicht.** Genau
 * die Terz sagt, ob ein Akkord Dur oder Moll ist, und diese Figur laeuft ueber
 * alle acht Akkorde beider Stuecke, ohne dass jemand sie je umschreibt: Die
 * Wiese steht in Dur, die Hoehle in dorisch. Eine grosse Terz waere in der
 * Hoehle schlicht der falsche Ton. Grundton, Quinte und Oktave passen dagegen
 * ueber jeden Dreiklang jeder Tonart — deshalb kann die Figur so stur bleiben.
 *
 * Der Bau ist der aelteste Trick einer laufenden Begleitung: **sie kehrt
 * staendig zum gleichen Ton zurueck** — hier die Quinte auf jeder zweiten
 * Stelle — und springt dazwischen weg. Daraus entsteht Bewegung ohne Melodie.
 * Eine Figur, die selbst eine Melodie waere, traete gegen die eigentliche an.
 *
 * Der hoechste Ton liegt bei rund 780 Hz und damit unter dem Fenster von 800 Hz
 * bis 3 kHz, das der Melodie gehoert. Das ist keine Schaetzung, sondern der
 * Rechenweg: hoechster Akkordgrundton (10 Halbtoene in der Hoehle) plus 12
 * Halbtoene ueber dem Grundton 220 Hz.
 *
 * Acht Stellen, also genau ein halber Takt: Damit faellt der Anfang der Figur
 * zweimal je Takt mit dem Schlag zusammen und nicht irgendwo dazwischen.
 */
export const ARPEGGIO = [0, 7, 12, 7, 0, 7, 12, 7] as const;

/**
 * Was sich von Durchgang zu Durchgang aendert.
 *
 * ## Warum es das braucht
 *
 * Rueckmeldung nach dem Spielen: „zu eintoenig". Das lag nicht an der Melodie —
 * die ist abgenommen und hat Kopfmotiv, Mittelteil und drei verschiedene
 * Antworten. Es lag daran, dass die Schleife **jedes Mal identisch** war. Ein
 * Level dauert mehrere Minuten, der Achttakter gut zwanzig Sekunden; man hoert
 * dieselben zwanzig Sekunden also zehnmal hintereinander, Note fuer Note gleich.
 * Das wird zur Tapete, egal wie gut sie ist.
 *
 * ## Was geaendert wird — und was ausdruecklich nicht
 *
 * Die Melodie bleibt Ton fuer Ton dieselbe; sie ist abgenommen
 * (`docs/musik-abnahme.md`). Geaendert wird das **Arrangement**, und das ist
 * ausdruecklich frei. Vier Durchgaenge, also zweiunddreissig Takte, danach
 * beginnt der Bogen von vorn — lang genug, dass sich nichts aufdraengt, kurz
 * genug, dass man den Bau bemerkt.
 *
 * | Durchgang | Melodie | Schlagwerk | Figur | dazu |
 * |---|---|---|---|---|
 * | 1 | fuehrende Stimme | voll | vorwaerts | — |
 * | 2 | Zweitstimme | voll | rueckwaerts | — |
 * | 3 | fuehrende Stimme | zwei Takte Pause | vorwaerts | — |
 * | 4 | Zweitstimme | voll | rueckwaerts | Oktave darueber |
 *
 * Drei Mittel, und jedes tut etwas anderes:
 *
 * - **Der Stimmwechsel** aendert die Klangfarbe der Hauptsache. Das ist der
 *   auffaelligste Eingriff und deshalb der, der jeden zweiten Durchgang kommt.
 * - **Der Bruch** — zwei Takte ohne Schlagwerk — aendert die *Dichte*. Er ist
 *   das aelteste Mittel gegen Monotonie ueberhaupt: Was wegfaellt, hoert man
 *   beim Wiederkommen doppelt.
 * - **Die Richtungsumkehr der Sechzehntelfigur** aendert die Bewegung, ohne
 *   einen einzigen Ton zu tauschen: dieselben drei Toene, entgegengesetzte
 *   Kontur.
 * - **Die Oktavdopplung** im letzten Durchgang ist die Steigerung vor dem
 *   Neuanfang. Sie liegt bei hoechstens gut 2 kHz und bleibt damit im Fenster
 *   der Melodie — eine Transposition waere hier falsch gewesen, sie haette die
 *   Melodie unter 800 Hz gedrueckt und der Sechzehntelfigur in die Quere.
 */
export interface Durchgang {
  /** `false` heisst: die Zweitstimme fuehrt. */
  haupt: boolean;
  /** Erste zwei Takte ohne Schlagwerk. */
  bruch: boolean;
  /** Die Sechzehntelfigur laeuft rueckwaerts. */
  rueck: boolean;
  /** Leise Oktavdopplung ueber der Melodie. */
  oktave: boolean;
}

export const DURCHGAENGE: readonly Durchgang[] = [
  { haupt: true, bruch: false, rueck: false, oktave: false },
  { haupt: false, bruch: false, rueck: true, oktave: false },
  { haupt: true, bruch: true, rueck: false, oktave: false },
  { haupt: false, bruch: false, rueck: true, oktave: true },
];

function aufRaster(m: readonly Note[]): (Note | null)[] {
  const raster: (Note | null)[] = [];
  for (const n of m) {
    raster.push(n);
    for (let i = 1; i < n[1]; i++) raster.push(null);
  }
  return raster;
}

const RASTER: Record<ThemeId, (Note | null)[]> = {
  grass: aufRaster(STUECKE.grass.melodie),
  crystal: aufRaster(STUECKE.crystal.melodie),
  rust: aufRaster(STUECKE.rust.melodie),
  frost: aufRaster(STUECKE.frost.melodie),
  magma: aufRaster(STUECKE.magma.melodie),
  sonnenhang: aufRaster(STUECKE.sonnenhang.melodie),
  wipfel: aufRaster(STUECKE.wipfel.melodie),
};

/** Was die Musik über die Spiellage wissen muss. */
export interface Lage {
  /**
   * Liegt gerade ein Finger auf einer Figur (Fokuszeit)? Die Welt laeuft auf
   * einem Viertel — die Musik tritt hoerbar einen Schritt zurueck: Tiefpass,
   * aber deutlich milder als die Pause. Loslassen holt sie zurueck.
   */
  fokus?: boolean;
  /** Verbleibende Zeit als Anteil, 1 am Anfang. */
  restAnteil: number;
  /** Verbleibende Zeit in Sekunden. */
  restSekunden: number;
  /** Alle Figuren gerettet, das Level läuft aber noch. */
  alleGerettet: boolean;
  pausiert: boolean;
}

export class Music {
  private playing = false;
  private nextTime = 0;
  private step = 0;
  private notes = 0;
  private theme: ThemeId = 'grass';
  private lage: Lage = { restAnteil: 1, restSekunden: 999, alleGerettet: false, pausiert: false };
  private gefiltert: 'auf' | 'fokus' | 'zu' = 'auf';
  private besetzung: 'karte' | 'voll' = 'voll';
  /** Steht die Echozeit schon auf dem Tempo des laufenden Stuecks? */
  private echoGesetzt = false;
  /** Der wievielte Umlauf der Achttaktschleife laeuft — Index in `DURCHGAENGE`. */
  private durchgang = 0;

  get state(): { playing: boolean; notes: number; lage: string; durchgang: number } {
    return {
      playing: this.playing,
      notes: this.notes,
      durchgang: this.durchgang,
      lage: this.lage.pausiert
        ? 'pausiert'
        : this.lage.restSekunden <= 10
          ? 'endspurt'
          : this.lage.restAnteil < 0.3
            ? 'knapp'
            : this.lage.alleGerettet
              ? 'alle gerettet'
              : 'normal',
    };
  }

  setTheme(theme: ThemeId): void {
    this.theme = theme in STUECKE ? theme : 'grass';
    laufendesThema = this.theme;
    // Das Echo muss neu gesetzt werden, aber die Klangwerkstatt gibt es zu
    // diesem Zeitpunkt vielleicht noch nicht (sie entsteht erst nach der ersten
    // Nutzergeste). Also nur vormerken; `update` traegt es nach.
    this.echoGesetzt = false;
  }

  /** Jedes Bild aus dem Spiel heraus setzen. */
  setLage(l: Lage): void {
    this.lage = l;
  }

  setBesetzung(b: 'karte' | 'voll'): void {
    this.besetzung = b;
  }

  start(engine: AudioEngine): void {
    if (this.playing) return;
    this.playing = true;
    this.step = 0;
    // Jedes Level faengt beim ersten Durchgang an. Sonst haengt der Klang der
    // ersten zwanzig Sekunden davon ab, wie lange das vorige Level gedauert hat.
    this.durchgang = 0;
    this.nextTime = engine.time + 0.1;
  }

  stop(): void {
    this.playing = false;
  }

  get isPlaying(): boolean {
    return this.playing;
  }

  update(engine: AudioEngine): void {
    // Pause macht die Musik nicht aus, sondern zu. Ein harter Schnitt fuehlt
    // sich nach Absturz an; ein Tiefpass fuehlt sich an, als traete man einen
    // Schritt zurueck.
    // Drei Stufen statt zwei: offen, Fokuszeit (mild), Pause (zu). Die
    // Fokuszeit ist das Markenzeichen der Steuerung und hatte keine klangliche
    // Entsprechung (Kritik S4) — jetzt tritt die Welt hoerbar einen Schritt
    // zurueck, solange der Finger liegt.
    const stufe: 'auf' | 'fokus' | 'zu' = this.lage.pausiert
      ? 'zu'
      : this.lage.fokus
        ? 'fokus'
        : 'auf';
    if (stufe !== this.gefiltert) {
      engine.musikFilter(stufe === 'zu' ? 400 : stufe === 'fokus' ? 2600 : 18000);
      // Und der Raum geht auf. Ein Tiefpass allein klingt nach einem Geraet,
      // dem etwas fehlt; Tiefpass plus doppelte Luft klingt nach einem Schritt
      // zurueck — und genau das ist eine Pause.
      engine.raumWeite(stufe === 'zu' ? 2.2 : 1);
      this.gefiltert = stufe;
    }

    if (!this.playing || !engine.ready || engine.muted) return;

    const p = STUECKE[this.theme];
    const raster = RASTER[this.theme];
    const stepDur = 60 / p.bpm / 2;
    // Punktierte Achtel: drei Sechzehntel gegen zwei. Sie laeuft dadurch gegen
    // das Raster, statt es zu verdoppeln — deshalb ist sie die uebliche Wahl.
    if (!this.echoGesetzt) {
      engine.setEcho(stepDur * 1.5);
      this.echoGesetzt = true;
    }
    const horizon = engine.time + LOOKAHEAD;
    if (this.nextTime < engine.time) this.nextTime = engine.time + 0.02;

    const endspurt = this.lage.restSekunden <= 10;
    const knapp = endspurt || this.lage.restAnteil < 0.3;
    // Einen Halbton hoch, sobald es knapp wird. Dieselbe Musik, aber der Koerper
    // merkt den Wechsel sofort — das ist der aelteste Trick der Filmmusik.
    const schiebung = knapp ? 1 : 0;

    let guard = 0;
    while (this.nextTime < horizon && guard++ < 32) {
      const delay = this.nextTime - engine.time;
      const i = this.step % raster.length;
      const takt = Math.floor(i / TAKT) % p.akkorde.length;
      const wurzel = p.akkorde[takt] + schiebung;
      const f = (h: number, oktave = 0) => p.grund * Math.pow(2, h / 12 + oktave);
      const g = { delay, bus: 'music' as const, fest: true };
      // Der Pad-Zweig. Alles, was hier hineingeht, weicht bei jedem Schlag kurz
      // zurueck — siehe `AudioEngine.pumpe`.
      const gp = { delay, bus: 'pad' as const, fest: true };
      /** Sicher verschobener Einsatz. Negativ waere „sofort", nicht „frueher". */
      const ab = (versatz: number) => Math.max(0, delay + versatz);
      // Stelle im Achttakter, 0 am Anfang, 1 am Ende. Der Bogen (siehe Dateikopf).
      const bogen = takt / Math.max(1, p.akkorde.length - 1);
      const imTakt = i % TAKT;
      // Was dieser Umlauf anders macht als der vorige — siehe `DURCHGAENGE`.
      const va = DURCHGAENGE[this.durchgang % DURCHGAENGE.length];
      // Der Bruch: zwei Takte ohne Schlagwerk. Bass, Flaeche, Figur und Melodie
      // laufen weiter — was fehlt, ist der Antrieb, und genau den hoert man beim
      // Wiederkommen doppelt.
      const schlagwerk = this.besetzung === 'voll' && !endspurt && !(va.bruch && i < TAKT * 2);

      // --- Der Motor: Schlag im Dreier-Dreier-Zweier, Bass in die Luecken ----
      //
      // Die Aufteilung ist dieselbe geblieben und traegt aus demselben Grund:
      // Schlag und Bass kommen sich **nie in die Quere**. Wo der eine steht,
      // steht der andere nicht. Das Ohr hoert daraus eine durchgehende tiefe
      // Linie, obwohl zu keinem Zeitpunkt zwei tiefe Toene gleichzeitig laufen —
      // genau darum bleibt es wuchtig statt matschig.
      //
      // Geaendert hat sich, **wo** der Schlag steht: 0, 3, 6 statt auf jeder
      // Viertel. Die Dichte unten ist unveraendert, der Akzent ist es nicht.
      if (!endspurt) {
        if (PULS[imTakt] && schlagwerk) {
          erdschlag(engine, { freq: 0, gain: 0.21, ...g });
          // Zum selben Zeitpunkt weicht alles Liegende kurz zurueck. Das ist
          // der Grund, warum eine moderne Mischung unten wuchtig klingt, ohne
          // lauter zu sein: Der Schlag bekommt jedes Mal den Platz fuer sich.
          engine.pumpe(delay, 0.3);
        } else {
          const figur = BASSFIGUR[imTakt];
          if (figur) {
            bass(engine, {
              freq: f(wurzel + figur[0], -1),
              dur: stepDur * 0.78,
              gain: 0.2 * figur[1],
              ...g,
              delay: ab(VERSATZ.bass),
            });
          }
        }
      } else {
        // Im Endspurt bleibt nur das nackte Fundament auf dem Schlag.
        if (i % 2 === 0) bass(engine, { freq: f(wurzel, -1), dur: stepDur * 0.9, gain: 0.24, ...g });
      }

      // Das Fundament des Takts, gehalten. Es fuellt die Luecken zwischen Schlag
      // und Bass, damit unten nichts flackert — der Unterschied zwischen "es
      // schlaegt Bass" und "es *liegt* Bass".
      if (!endspurt && imTakt === 0) {
        flaeche(engine, {
          freq: f(wurzel, -1), dur: stepDur * TAKT * 0.96, gain: 0.04, ...gp,
        });
      }

      // --- Perkussion -------------------------------------------------------
      if (schlagwerk) {
        // Der Kies sitzt auf den Achteln zwischen den Schlaegen: dieselbe
        // Rhythmik wie der Bass, nur zwei Oktaven weiter oben. Dass beide Enden
        // des Frequenzbandes sich einig sind, wo „daneben" ist, macht den Groove
        // lesbar.
        //
        // Er wechselt dabei die Seite. Das ist die billigste Bewegung, die es
        // gibt — reine Pegelverteilung, in Mono nicht einmal messbar — und auf
        // Kopfhoerern der Unterschied zwischen einer Spur und einem Feld.
        const staerke = knapp ? 1 : KIES_MUSTER[imTakt];
        if (staerke > 0) {
          kies(engine, {
            freq: 0,
            gain: (0.036 + 0.014 * bogen) * staerke,
            ...g,
            pan: imTakt % 2 === 0 ? -0.32 : 0.3,
            delay: ab(VERSATZ.kies),
          });
        }
        // Der Holzblock steht auf der letzten Achtel des Takts und zieht von
        // dort in die naechste Eins. Rechts aussen, damit er nicht mit dem
        // Schlag in der Mitte um denselben Platz streitet.
        if (imTakt === 7) woodblock(engine, { freq: 1250, gain: 0.055, ...g, pan: 0.45 });
      }
      if (knapp && i % 2 === 0) tick(engine, { freq: 0, gain: 0.09, ...g });

      // --- Akkordflaeche ----------------------------------------------------
      if (!endspurt && imTakt === 0) {
        for (const ton of p.farbe) {
          flaeche(engine, { freq: f(wurzel + ton), dur: stepDur * TAKT * 0.96, gain: 0.022, ...gp });
        }
      }

      // --- Laufende Figur, Sechzehntel --------------------------------------
      //
      // Zwei Toene je Achtel, also doppelt so schnell wie alles andere. Sie
      // liegen **unter** der Melodie (hoechstens rund 780 Hz, siehe `ARPEGGIO`),
      // damit sie das Fenster von 800 Hz bis 3 kHz nicht zustellen, und sie sind
      // leise: Diese Figur soll man als Bewegung spueren, nicht als Stimme
      // hoeren. Genau das trennt eine treibende Begleitung von einem zweiten
      // Melodieversuch.
      // Der Swing sitzt genau hier und nirgends sonst: Die zweite Sechzehntel
      // rutscht um `SCHWUNG` nach hinten. Alles andere im Stueck laeuft auf
      // Achteln oder groesser und bliebe von einem Shuffle unberuehrt — das
      // Lockere entsteht also allein aus dieser einen Zeile.
      // In der Kartenbesetzung schweigt die Figur mit dem Schlagwerk: Was
      // bleibt, ist Flaeche, Bass und Melodie — das Stueck als Erinnerung an
      // sich selbst. Der Levelstart bringt beide zurueck, mitten im Takt.
      if (!knapp && this.besetzung === 'voll') {
        for (const halb of [0, 1]) {
          // Rueckwaerts in jedem zweiten Durchgang: dieselben drei Toene,
          // entgegengesetzte Kontur. Bewegung aendern, ohne einen Ton zu
          // tauschen — siehe `DURCHGAENGE`.
          const stelle = (i * 2 + halb) % ARPEGGIO.length;
          const ton = ARPEGGIO[va.rueck ? ARPEGGIO.length - 1 - stelle : stelle];
          pizzicato(engine, {
            freq: f(wurzel + ton),
            dur: stepDur * 0.42,
            gain: (0.026 + 0.011 * bogen) * (halb === 0 ? 1 : 0.78),
            ...g,
            // Wechselseitig, aber enger als der Kies: Die Figur traegt
            // Bewegung und darf sich deshalb nicht ganz von der Mitte loesen.
            pan: halb === 0 ? -0.18 : 0.22,
            delay: delay + stepDur * (halb === 0 ? 0 : 0.5 + SCHWUNG),
          });
        }
      }

      // --- Harmonie auf den Nachschlaegen ----------------------------------
      //
      // Gezupfte Nachschlaege auf den Achteln 1 und 5 — den unbetonten Haelften
      // der ersten und dritten Viertel. Vorher standen sie auf 2 und 6, also auf
      // schweren Zeiten, und verdoppelten damit den Puls, statt ihm zu
      // antworten. Auf dem Nachschlag ist es ein **Gegengewicht**: Man hoert
      // die Harmonie dort, wo unten gerade nichts passiert.
      //
      // Dazu vierzehn Millisekunden zu spaet (`VERSATZ.harmonie`) — die Haltung
      // eines Rhythmusgitarristen, der sich zurueckliegen laesst.
      //
      // Die Akkordtoene werden ueber die Breite verteilt, von links nach rechts
      // aufsteigend. Ein Dreiklang, dessen Toene alle an derselben Stelle
      // stehen, ist ein Klang; einer, der auseinandergezogen ist, ist ein Griff.
      if (!endspurt && (imTakt === 1 || imTakt === 5)) {
        const stimme = p.harmonieStimme === 'ukulele' ? ukulele : kalimba;
        const toene = [0, ...p.farbe];
        toene.forEach((ton, k) => {
          stimme(engine, {
            freq: f(wurzel + ton),
            gain: 0.038,
            dur: stepDur * 1.3,
            ...gp,
            pan: -0.4 + (0.8 * k) / Math.max(1, toene.length - 1),
            delay: ab(VERSATZ.harmonie),
          });
        });
      }

      // --- Melodie ----------------------------------------------------------
      //
      // Zwei Stimmen auf denselben Ton, und die Arbeitsteilung ist die aus
      // jedem Orchester: Die Blasstimme **haelt** den Ton und macht daraus eine
      // Linie, das Stabspiel gibt den **Anschlag** und macht sie hoerbar. Jede
      // allein waere schlechter — die Blasstimme ohne Anschlag verwaescht
      // zwischen den Toenen, das Stabspiel ohne Blasstimme piekst.
      const note = raster[i];
      if (!knapp && note && note[0] !== null) {
        const halbton = note[0] + schiebung;
        const laenge = stepDur * note[1];
        // Die fuehrende oder die antwortende Stimme, je Durchgang.
        const stimme = STIMMEN[va.haupt ? p.melodieStimme : p.zweitStimme];
        // Etwas kuerzer als der Notenwert: Zwischen zwei Toenen muss eine
        // Kante bleiben, sonst verschmelzen sie zu einem Gleiten.
        //
        // Der Echoanteil ist das eine Merkmal, an dem man diese Fassung in einer
        // Sekunde von der vorigen unterscheidet: Die Melodie hat einen Nachsatz.
        // Er sitzt auf der punktierten Achtel und laeuft dadurch **gegen** das
        // Raster — daraus entsteht Bewegung statt Verdopplung. Und er ist der
        // Grund, warum die Melodie ihr Fenster kraeftiger besetzt als vorher,
        // ohne lauter zu sein: Sie ist danach laenger da.
        stimme(engine, { freq: f(halbton, 1), dur: laenge * 0.86, gain: 0.16, ...g, echo: 0.3 });
        // Der Anschlag: der Pling, das Erkennungszeichen des Spiels. Deutlich
        // leiser als die gehaltene Stimme — er setzt die Kante, er tritt nicht
        // selbst als Stimme auf.
        //
        // Er ersetzt zwei Dinge auf einmal: das Stabspiel von vorher (Marimba
        // bzw. Kalimba) **und** die Achtbit-Ebene. Deren Aufgabe war, der
        // Melodie eine Kante zu geben; die uebernimmt der Glasanteil des Plings.
        // Der Unterschied ist, dass eine Rechteckwelle ein Zitat von 1991 ist —
        // im Bild des Spiels ist nichts mehr gerastert — und dass sie
        // ausgerechnet im Fenster der Melodie sass.
        pling(engine, { freq: f(halbton, 1), dur: Math.min(0.34, laenge), gain: 0.07, ...g });
        // Die Oktavdopplung im letzten Durchgang — die Steigerung vor dem
        // Neuanfang. Leise und ohne Echo: Sie soll die Melodie **hell** machen,
        // nicht verdoppeln. Der hoechste Ton landet bei gut 2 kHz und bleibt
        // damit im Fenster der Melodie.
        if (va.oktave) {
          stimme(engine, { freq: f(halbton, 2), dur: laenge * 0.8, gain: 0.045, ...g });
        }
        this.notes++;
      }

      // --- Glitzer ----------------------------------------------------------
      // Wenn alle gerettet sind, das Level aber noch laeuft: doppelt so dicht.
      // Er geht ins Echo, weil er als einziger Klang oben nichts traegt und
      // deshalb ausfransen darf — das ist die Stelle, an der ein Echo Luft
      // erzeugt statt Unordnung.
      const glitzerTakt = this.lage.alleGerettet ? 4 : 16;
      if (!endspurt && i % glitzerTakt === 12 % glitzerTakt) {
        glocke(engine, {
          freq: f(wurzel + 12), gain: this.lage.alleGerettet ? 0.07 : 0.042,
          ...g, pan: 0.28, echo: 0.4,
        });
      }

      this.nextTime += stepDur;
      naechsteAchtel = this.nextTime;
      this.step++;
      if (this.step >= raster.length) {
        this.step = 0;
        this.durchgang = (this.durchgang + 1) % DURCHGAENGE.length;
      }
    }
  }
}
