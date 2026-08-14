/*
 * Weg C — Motivfamilie je Welt, Arrangement je Level.
 *
 * Jede Welt bringt eine kleine Menge abgenommener Motive mit (Kopf, Wendungen,
 * Antworten, Mittelteile, Laeufe, Schluesse, Kadenzen). Je Level wird daraus
 * nach einer Formgrammatik ein Stueck MONTIERT. Kein freier Generator (Weg B),
 * keine angestupste Urgestalt (Weg A): ein Baukasten, dessen Teile einzeln
 * abgenommen sind und dessen Zusammenbau die Gesetze per Bauart einhaelt.
 *
 * Nicht Teil des Spiels.
 */
import { ARPEGGIO, STUECKE } from '../src/audio/music';
import { LEVELS } from '../src/levels/index';

type Note = [number | null, number];
type Takt = Note[];
const TAKT = 8;
const PULSSTELLEN = [0, 3, 6];
const kl = (t: number) => ((t % 12) + 12) % 12;
const mod = (a: number, n: number) => ((a % n) + n) % n;
const summe = (b: Takt) => b.reduce((a, n) => a + n[1], 0);
const flach = (b: Takt[]): Note[] => b.flat();
const toene = (m: readonly Note[]) => m.filter((n) => n[0] !== null).map((n) => n[0] as number);
const klassen = (m: readonly Note[]) => new Set(toene(m).map(kl));
const kopie = (b: Takt): Takt => b.map((n) => [n[0], n[1]] as Note);

// ===========================================================================
// 1. Die Bausteine: Motivfamilien
// ===========================================================================

interface Familie {
  /** Die sieben Stufen des Modus, in Halbtoenen. */
  leiter: readonly number[];
  /** Der Kopf: sechs Achtel. Er ist das Gesicht der Familie und aendert sich nie. */
  kopf: readonly Note[];
  /** Die zwei Achtel danach — „jedes Mal anders weitergefuehrt". */
  wendungen: readonly number[];
  /** Antworttakte: acht Achtel, mindestens ein Ton der Laenge >= 3. */
  antworten: readonly (readonly Note[])[];
  /** Mittelteile: zwei Takte, die einmal woanders hingehen. */
  mittel: readonly (readonly (readonly Note[])[])[];
  /** Laufende Takte ohne Atempause — Anlauf auf den Schluss. */
  laeufe: readonly (readonly Note[])[];
  /** Schluesse: acht Achtel, letzter Ton >= 4 auf dem Grundton. */
  schluesse: readonly (readonly Note[])[];
  /** Akkordfolgen, acht Wurzeln. Eintrag 0 ist die abgenommene. */
  kadenzen: readonly (readonly number[])[];
  /** Zusatztoene der Flaeche. Eintrag 0 ist der abgenommene. */
  farben: readonly (readonly number[])[];
}

const FAMILIEN: Record<string, Familie> = {
  // -------------------------------------------------------------------------
  // Gruen — Wiese, Sonnenhang, Wipfelweide. Eine Familie, drei Welten.
  // Dur mit lydischem Gast (6). Kopf: der Ruf G-G-A-G.
  // -------------------------------------------------------------------------
  gruen: {
    leiter: [0, 2, 4, 5, 7, 9, 11],
    kopf: [[7, 2], [7, 1], [9, 1], [7, 2]],
    wendungen: [4, 12, 9, 2],
    antworten: [
      [[5, 2], [4, 2], [2, 3], [null, 1]], // abgenommen (T2)
      [[11, 2], [9, 2], [7, 4]], //            abgenommen (T4)
      [[9, 2], [7, 1], [5, 1], [4, 4]],
      [[4, 2], [5, 2], [7, 3], [null, 1]],
    ],
    mittel: [
      [[[12, 2], [11, 1], [9, 1], [7, 2], [6, 2]], [[7, 4], [4, 2], [2, 2]]], // abgenommen (T5/T6)
      [[[4, 2], [6, 2], [7, 2], [9, 2]], [[11, 2], [9, 2], [7, 4]]],
      [[[9, 2], [11, 2], [12, 3], [null, 1]], [[11, 2], [9, 2], [7, 2], [6, 2]]],
    ],
    laeufe: [
      [[7, 2], [9, 2], [11, 2], [12, 2]],
      [[12, 2], [11, 2], [9, 2], [7, 2]],
      [[4, 2], [5, 2], [7, 2], [9, 2]],
    ],
    schluesse: [
      [[2, 2], [4, 2], [0, 4]], // abgenommen (T8)
      [[4, 2], [2, 2], [0, 4]],
      [[5, 1], [4, 1], [2, 2], [0, 4]],
    ],
    kadenzen: [
      [0, 5, 0, 7, 0, 7, 5, 7], // abgenommen
      [0, 5, 0, 7, 2, 7, 5, 7],
      [0, 7, 0, 5, 0, 7, 5, 7],
    ],
    farben: [[4, 7], [4, 9], [4, 7, 11]],
  },

  // -------------------------------------------------------------------------
  // Kristall — Hoehle. A-dorisch, die grosse Sexte (9) ist das Gesicht.
  // -------------------------------------------------------------------------
  kristall: {
    leiter: [0, 2, 3, 5, 7, 9, 10],
    kopf: [[0, 2], [3, 2], [5, 2]],
    wendungen: [7, 10, 3, 9],
    antworten: [
      [[5, 2], [3, 2], [2, 4]], // abgenommen (T2)
      [[9, 4], [7, 4]], //          abgenommen (T4) — die dorische Sexte, lang
      [[7, 2], [5, 2], [3, 4]],
      [[10, 2], [9, 2], [7, 4]],
    ],
    mittel: [
      [[[12, 2], [10, 2], [9, 2], [7, 2]], [[5, 4], [3, 4]]], // abgenommen (T5/T6)
      [[[9, 2], [10, 2], [12, 4]], [[10, 2], [7, 2], [5, 4]]],
      [[[7, 2], [9, 2], [10, 2], [12, 2]], [[9, 4], [7, 4]]],
    ],
    laeufe: [
      [[5, 2], [7, 2], [5, 2], [3, 2]],
      [[10, 2], [9, 2], [7, 2], [5, 2]],
      [[3, 2], [5, 2], [7, 2], [9, 2]],
    ],
    schluesse: [
      [[2, 2], [0, 6]], // abgenommen (T8)
      [[3, 2], [2, 2], [0, 4]],
      [[5, 1], [3, 1], [2, 2], [0, 4]],
    ],
    kadenzen: [
      [0, 10, 0, 5, 10, 3, 5, 0], // abgenommen
      [0, 10, 0, 5, 3, 10, 5, 0],
      [0, 5, 0, 10, 3, 10, 5, 0],
    ],
    farben: [[3, 7], [3, 10], [3, 7, 10]],
  },

  // -------------------------------------------------------------------------
  // Rost — Rostwerk. G-mixolydisch, kleine Septime (10). Kopf: ein Ruf mit
  // Tonwiederholung — der Dialekt der Werkbank.
  // -------------------------------------------------------------------------
  rost: {
    leiter: [0, 2, 4, 5, 7, 9, 10],
    kopf: [[0, 2], [0, 1], [4, 1], [2, 2]],
    wendungen: [0, 5, 10, 7],
    antworten: [
      [[7, 4], [5, 2], [4, 2]], // abgenommen (T2)
      [[4, 2], [2, 2], [0, 4]], // abgenommen (T4)
      [[5, 2], [4, 2], [2, 4]],
      [[0, 2], [2, 2], [4, 3], [null, 1]],
    ],
    mittel: [
      [[[10, 2], [9, 2], [7, 2], [5, 2]], [[7, 4], [9, 4]]], // abgenommen (T5/T6)
      [[[9, 2], [10, 2], [12, 4]], [[10, 2], [9, 2], [7, 4]]],
      [[[5, 2], [7, 2], [9, 2], [10, 2]], [[9, 2], [7, 2], [5, 4]]],
    ],
    laeufe: [
      [[12, 2], [10, 2], [9, 2], [7, 2]],
      [[7, 2], [9, 2], [10, 2], [9, 2]],
      [[2, 2], [4, 2], [5, 2], [7, 2]],
    ],
    schluesse: [
      [[9, 2], [7, 2], [0, 4]], // abgenommen (T8)
      [[4, 2], [2, 2], [0, 4]],
      [[7, 1], [5, 1], [4, 2], [0, 4]],
    ],
    kadenzen: [
      [0, 10, 0, 5, 10, 5, 10, 0], // abgenommen
      [0, 10, 0, 5, 5, 10, 10, 0],
      [0, 5, 0, 10, 10, 5, 10, 0],
    ],
    farben: [[4, 10], [4, 7], [4, 9, 10]],
  },

  // -------------------------------------------------------------------------
  // Frost — Frostklamm. E-aeolisch, Terzschritte wie Atem in kalter Luft.
  // -------------------------------------------------------------------------
  frost: {
    leiter: [0, 2, 3, 5, 7, 8, 10],
    kopf: [[0, 2], [3, 2], [5, 2]],
    wendungen: [7, 8, 3, 10],
    antworten: [
      [[5, 2], [3, 2], [2, 4]], // abgenommen (T2)
      [[7, 4], [5, 4]], //          abgenommen (T4)
      [[8, 2], [7, 2], [5, 4]],
      [[3, 2], [5, 2], [7, 3], [null, 1]],
    ],
    mittel: [
      [[[12, 2], [10, 2], [7, 2], [5, 2]], [[3, 4], [0, 4]]], // abgenommen (T5/T6)
      [[[7, 2], [8, 2], [10, 4]], [[8, 2], [7, 2], [5, 4]]],
      [[[10, 2], [12, 2], [10, 2], [8, 2]], [[7, 4], [5, 4]]],
    ],
    laeufe: [
      [[2, 2], [3, 2], [5, 2], [3, 2]], // abgenommen (T7)
      [[7, 2], [5, 2], [3, 2], [2, 2]],
      [[5, 2], [7, 2], [8, 2], [7, 2]],
    ],
    schluesse: [
      [[2, 2], [0, 6]], // abgenommen (T8)
      [[3, 2], [2, 2], [0, 4]],
      [[5, 1], [3, 1], [2, 2], [0, 4]],
    ],
    kadenzen: [
      [0, 8, 3, 10, 8, 3, 10, 0], // abgenommen
      [0, 8, 3, 10, 3, 8, 10, 0],
      [0, 3, 8, 10, 8, 10, 3, 0],
    ],
    farben: [[3, 8], [3, 7], [3, 8, 10]],
  },

  // -------------------------------------------------------------------------
  // Magma — Schlot. D-phrygisch, die kleine Sekunde (1) reibt.
  // -------------------------------------------------------------------------
  magma: {
    leiter: [0, 1, 3, 5, 7, 8, 10],
    kopf: [[0, 2], [1, 2], [3, 2]],
    wendungen: [1, 5, 0, 8],
    antworten: [
      [[0, 4], [3, 2], [5, 2]], // abgenommen (T2)
      [[7, 4], [5, 2], [3, 2]], // abgenommen (T4)
      [[5, 2], [3, 2], [1, 4]],
      [[3, 2], [5, 2], [7, 3], [null, 1]],
    ],
    mittel: [
      [[[7, 2], [8, 2], [7, 2], [5, 2]], [[3, 2], [1, 2], [0, 4]]], // abgenommen (T5/T6)
      [[[8, 2], [10, 2], [8, 4]], [[7, 2], [5, 2], [3, 4]]],
      [[[7, 2], [8, 2], [10, 2], [8, 2]], [[7, 4], [5, 4]]],
    ],
    laeufe: [
      [[12, 2], [10, 2], [7, 2], [5, 2]], // abgenommen (T7)
      [[5, 2], [7, 2], [8, 2], [7, 2]],
      [[3, 2], [5, 2], [3, 2], [1, 2]],
    ],
    schluesse: [
      [[3, 2], [1, 2], [0, 4]], // abgenommen (T8)
      [[1, 2], [0, 6]],
      [[5, 1], [3, 1], [1, 2], [0, 4]],
    ],
    kadenzen: [
      [0, 1, 0, 3, 1, 0, 1, 0], // abgenommen
      [0, 1, 0, 3, 3, 1, 1, 0],
      [0, 3, 0, 1, 1, 3, 1, 0],
    ],
    farben: [[1, 3], [1, 7], [1, 3, 8]],
  },
};

// ===========================================================================
// 2. Die Formgrammatik
// ===========================================================================

type Slot = 'K' | 'A' | 'M' | 'L' | 'S';

/**
 * Acht Takte. Regeln, die jede Form einhaelt:
 *  - Takt 1 ist ein Kopf, Takt 8 ein Schluss.
 *  - Mindestens zwei Koepfe (B2 per Bauart), mindestens zwei Antworten
 *    (B3 per Bauart: jede Antwort hat einen langen Ton, der Schluss auch).
 *  - Genau ein Mittelteil, zwei Takte zusammenhaengend (M zaehlt als Paar).
 */
interface Form {
  name: string;
  slots: readonly Slot[];
}

const FORMEN: Record<string, Form> = {
  F1: { name: 'Liedform', slots: ['K', 'A', 'K', 'A', 'M', 'M', 'K', 'S'] },
  F2: { name: 'Anlauf', slots: ['K', 'A', 'K', 'A', 'M', 'M', 'L', 'S'] },
  F3: { name: 'Bogen', slots: ['K', 'A', 'M', 'M', 'K', 'A', 'K', 'S'] },
  F4: { name: 'Doppelruf', slots: ['K', 'K', 'A', 'A', 'M', 'M', 'K', 'S'] },
  F5: { name: 'Kehre', slots: ['K', 'A', 'K', 'M', 'M', 'A', 'L', 'S'] },
};

// ===========================================================================
// 3. Die Welten: Familie + Klangidentitaet + Reihenfolgen
// ===========================================================================

const GESTRICHEN = ['leier', 'streicher', 'akkordeon'];
const GEBLASEN = ['okarina', 'klarinette', 'panfloete'];
const familieVon = (s: string) => (GESTRICHEN.includes(s) ? 'gestrichen' : 'geblasen');

interface Welt {
  familie: keyof typeof FAMILIEN;
  /** Reihenfolge der Formen. Eintrag 0 baut das abgenommene Weltstueck. */
  formen: readonly (keyof typeof FORMEN)[];
  /** Welche Wendung der wievielte Kopf bekommt (Index in `wendungen`). */
  wendungFolge: readonly number[];
  bpm: number;
  grund: number;
  melodieStimme: string;
  /** Antwortstimmen, andere Familie als die fuehrende. Eintrag 0 = abgenommen. */
  zweitStimmen: readonly [string, string];
  harmonieStimmen: readonly [string, string];
  sfxStufen: readonly number[];
  fanfareGrund: number;
}

const WELTEN: Record<string, Welt> = {
  grass: {
    familie: 'gruen',
    formen: ['F1', 'F3', 'F4', 'F5', 'F2'],
    wendungFolge: [0, 1, 0],
    bpm: 120,
    grund: 261.63,
    melodieStimme: 'leier',
    zweitStimmen: ['okarina', 'panfloete'],
    harmonieStimmen: ['ukulele', 'kalimba'],
    sfxStufen: [0, 2, 4, 7, 9],
    fanfareGrund: 0,
  },
  sonnenhang: {
    familie: 'gruen',
    formen: ['F1', 'F5', 'F3', 'F2', 'F4'],
    wendungFolge: [0, 1, 0],
    bpm: 104,
    grund: 233.08,
    melodieStimme: 'okarina',
    zweitStimmen: ['leier', 'streicher'],
    harmonieStimmen: ['ukulele', 'kalimba'],
    sfxStufen: [0, 2, 4, 7, 9],
    fanfareGrund: 0,
  },
  wipfel: {
    familie: 'gruen',
    formen: ['F1', 'F4', 'F5', 'F3', 'F2'],
    wendungFolge: [0, 1, 0],
    bpm: 126,
    grund: 196.0,
    melodieStimme: 'panfloete',
    // heute steht hier `okarina` — zwei geblasene Stimmen, der Wechsel im
    // zweiten Durchgang ist damit kaum zu hoeren. Stimmen sind ausdruecklich
    // nicht abgenommen (musik-abnahme.md §1), also wird das hier berichtigt.
    zweitStimmen: ['leier', 'streicher'],
    harmonieStimmen: ['kalimba', 'ukulele'],
    sfxStufen: [0, 2, 4, 7, 9],
    fanfareGrund: 0,
  },
  crystal: {
    familie: 'kristall',
    formen: ['F1', 'F5', 'F3', 'F2', 'F4'],
    wendungFolge: [0, 1, 2],
    bpm: 100,
    grund: 220,
    melodieStimme: 'streicher',
    zweitStimmen: ['klarinette', 'okarina'],
    harmonieStimmen: ['kalimba', 'ukulele'],
    sfxStufen: [0, 3, 5, 7, 10],
    fanfareGrund: 3,
  },
  rust: {
    familie: 'rost',
    formen: ['F1', 'F4', 'F3', 'F5', 'F2'],
    wendungFolge: [0, 1, 2],
    bpm: 112,
    grund: 196,
    melodieStimme: 'akkordeon',
    zweitStimmen: ['okarina', 'klarinette'],
    harmonieStimmen: ['ukulele', 'kalimba'],
    sfxStufen: [0, 2, 4, 7, 9],
    fanfareGrund: 0,
  },
  frost: {
    familie: 'frost',
    formen: ['F2', 'F1', 'F5', 'F3', 'F4'],
    wendungFolge: [0, 1, 2],
    bpm: 88,
    grund: 164.81,
    melodieStimme: 'panfloete',
    zweitStimmen: ['streicher', 'leier'],
    harmonieStimmen: ['kalimba', 'ukulele'],
    sfxStufen: [0, 3, 5, 7, 10],
    fanfareGrund: 3,
  },
  magma: {
    familie: 'magma',
    formen: ['F2', 'F5', 'F1', 'F3', 'F4'],
    wendungFolge: [0, 1, 2],
    bpm: 132,
    grund: 146.83,
    melodieStimme: 'klarinette',
    zweitStimmen: ['leier', 'akkordeon'],
    harmonieStimmen: ['ukulele', 'kalimba'],
    sfxStufen: [0, 3, 5, 7, 10],
    fanfareGrund: 3,
  },
};

// ===========================================================================
// 4. Textur und Bogen — was ausserhalb des Notentexts je Level wechselt
// ===========================================================================

/** Sechzehntelfiguren. Alle nur Grundton/Quinte/Oktave (A1) und hoechstens +12 (A2). */
const ARPEGGIEN: readonly (readonly number[])[] = [
  [0, 7, 12, 7, 0, 7, 12, 7], // abgenommen — die laufende Figur von heute
  [0, 12, 7, 12, 0, 12, 7, 12],
  [0, 7, 0, 12, 7, 0, 12, 7],
  [12, 7, 0, 7, 12, 7, 0, 7],
];

/** Auf welchen Achteln die gezupfte Harmonie steht. */
const HARMONIESTELLEN: readonly (readonly number[])[] = [
  [1, 5], // abgenommen
  [1, 3, 5, 7],
];

interface Durchgang {
  haupt: boolean;
  bruch: boolean;
  rueck: boolean;
  oktave: boolean;
}

/**
 * Der grosse Bogen ueber vier Umlaeufe. Feste Punkte in jedem Plan, damit die
 * bestehenden Abnahmen gelten: Umlauf 0 fuehrende Stimme, Umlauf 1 Zweitstimme
 * (C9), Bruch in Umlauf 2 (C10), keine zwei benachbarten gleich (C11).
 */
const BOGENPLAENE: readonly (readonly Durchgang[])[] = [
  [
    { haupt: true, bruch: false, rueck: false, oktave: false },
    { haupt: false, bruch: false, rueck: true, oktave: false },
    { haupt: true, bruch: true, rueck: false, oktave: false },
    { haupt: false, bruch: false, rueck: true, oktave: true },
  ], // abgenommen
  [
    { haupt: true, bruch: false, rueck: false, oktave: false },
    { haupt: false, bruch: false, rueck: true, oktave: true },
    { haupt: true, bruch: true, rueck: true, oktave: false },
    { haupt: false, bruch: false, rueck: false, oktave: true },
  ],
  [
    { haupt: true, bruch: false, rueck: true, oktave: false },
    { haupt: false, bruch: false, rueck: false, oktave: false },
    { haupt: true, bruch: true, rueck: true, oktave: true },
    { haupt: false, bruch: false, rueck: false, oktave: true },
  ],
];

// ===========================================================================
// 5. Zusammenklang: die Pruefung, die die Montage steuert
// ===========================================================================

/** Akkordtoene der Wurzel im Modus: Grundton, Terz, Quinte, Septime. */
function akkordklassen(wurzel: number, leiter: readonly number[]): Set<number> {
  const g = leiter.indexOf(mod(wurzel, 12));
  const s = new Set<number>();
  if (g < 0) {
    for (const iv of [0, 3, 4, 7, 10]) s.add(kl(wurzel + iv));
    return s;
  }
  for (const d of [0, 2, 4, 6]) s.add(kl(leiter[mod(g + d, 7)]));
  return s;
}

/**
 * Misstoene eines Takts: ein Ton auf einer Pulsstelle, der weder zum Akkord
 * gehoert noch eine der drei Entschuldigungen hat, die ein Musiker gelten
 * laesst.
 *
 * Die drei Entschuldigungen sind keine Nachsicht, sondern Satzlehre:
 *
 * 1. **Farbton.** Sekunde und Sexte ueber der Wurzel sind ueber jedem Dreiklang
 *    dieser Tonarten Farbe und kein Reibungston. Ohne diese Zeile gilt das E
 *    ueber G-Dur als Fehler, und das ist der haeufigste schoene Klang, den es
 *    gibt.
 * 2. **Aufloesung im Schritt.** Ein Vorhalt, der um hoechstens einen Ganzton
 *    weitergeht, ist ein Vorhalt und kein Ausrutscher.
 * 3. **Vorwegnahme.** Der letzte Ton eines Takts darf schon zum *naechsten*
 *    Akkord gehoeren. So endet das Rostwerk-Stueck seinen zweiten Takt: ein H
 *    ueber F, das die Terz des folgenden G ist.
 */
function misstoene(
  bar: readonly Note[],
  wurzel: number,
  leiter: readonly number[],
  folge: number | null,
  folgeWurzel: number | null,
): number {
  const ak = akkordklassen(wurzel, leiter);
  const naechsterAkkord = folgeWurzel === null ? null : akkordklassen(folgeWurzel, leiter);
  let pos = 0;
  let zahl = 0;
  for (let i = 0; i < bar.length; i++) {
    const n = bar[i];
    if (PULSSTELLEN.includes(pos) && n[0] !== null && n[1] >= 2 && !ak.has(kl(n[0]))) {
      const farbe = kl(n[0] - wurzel);
      const letzter = i + 1 >= bar.length;
      const naechst = letzter ? folge : bar[i + 1][0];
      const entschuldigt =
        farbe === 2 || farbe === 9 || // 1. Sekunde oder Sexte ueber der Wurzel
        (naechst !== null && Math.abs(naechst - n[0]) <= 2) || // 2. loest sich im Schritt
        (letzter && naechsterAkkord !== null && naechsterAkkord.has(kl(n[0]))); // 3. Vorwegnahme
      if (!entschuldigt) zahl++;
    }
    pos += n[1];
  }
  return zahl;
}

function folgeTon(bars: Takt[], t: number): number | null {
  const b = bars[(t + 1) % bars.length];
  const n = b?.find((x) => x[0] !== null);
  return n ? (n[0] as number) : null;
}

// ===========================================================================
// 6. Die Montage
// ===========================================================================

export interface Stueck {
  melodie: Note[];
  akkorde: number[];
  farbe: readonly number[];
  bpm: number;
  grund: number;
  melodieStimme: string;
  zweitStimme: string;
  harmonieStimme: string;
  sfxStufen: readonly number[];
  fanfareGrund: number;
  arpeggio: readonly number[];
  harmonieStellen: readonly number[];
  bogen: readonly Durchgang[];
  /* Diagnose */
  theme: string;
  form: string;
  wahl: Record<string, number>;
  deckungsRepair: number;
  kadenzRepair: number;
  fugenRepair: number;
}

function hash32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Der Zaehler des Levels: 0 fuer das erste Level einer Welt. */
function zaehler(levelId: string): number {
  const m = /^w\d+-(\d+)$/.exec(levelId);
  return m ? parseInt(m[1], 10) - 1 : hash32(levelId) % 60;
}

/** Baut die acht Takte aus den Motiven. */
function baueTakte(
  f: Familie,
  form: Form,
  wRot: number,
  wFolge: readonly number[],
  aRot: number,
  mIdx: number,
  lIdx: number,
  sIdx: number,
): Takt[] {
  const bars: Takt[] = [];
  let kZahl = 0;
  let aZahl = 0;
  let mTeil = 0;
  for (const slot of form.slots) {
    if (slot === 'K') {
      const wi = (wFolge[kZahl % wFolge.length] + wRot) % f.wendungen.length;
      bars.push([...kopie(f.kopf as Takt), [f.wendungen[wi], 2] as Note]);
      kZahl++;
    } else if (slot === 'A') {
      bars.push(kopie(f.antworten[(aRot + aZahl) % f.antworten.length] as Takt));
      aZahl++;
    } else if (slot === 'M') {
      bars.push(kopie(f.mittel[mIdx][mTeil] as Takt));
      mTeil++;
    } else if (slot === 'L') {
      bars.push(kopie(f.laeufe[lIdx] as Takt));
    } else {
      bars.push(kopie(f.schluesse[sIdx] as Takt));
    }
  }
  return bars;
}

/** Traegt die montierte Melodie alle Toene, die Geraeusche und Fanfare brauchen? */
function deckt(bars: Takt[], w: Welt, kad: readonly number[]): boolean {
  const km = klassen(flach(bars));
  for (const s of w.sfxStufen) if (!km.has(kl(s))) return false;
  const vorrat = new Set([...km, ...kad.map(kl)]);
  for (const iv of [0, 4, 7]) if (!vorrat.has(kl(w.fanfareGrund + iv))) return false;
  return true;
}

/**
 * Fugenstrafe: Sprung ueber eine Taktgrenze, der auffaellt.
 *
 * An der Taktgrenze stossen zwei Motive aufeinander, die nicht fuereinander
 * geschrieben wurden — das ist die einzige Stelle, an der eine Montage anders
 * klingt als eine durchkomponierte Melodie. Gezaehlt wird, was dort stoert:
 * derselbe Ton noch einmal (die Phrase tritt auf der Stelle) und ein Sprung
 * ueber die Quinte hinaus (die Phrase reisst ab).
 */
function fugenstrafe(bars: Takt[]): number {
  let z = 0;
  for (let t = 0; t + 1 < bars.length; t++) {
    const a = [...bars[t]].reverse().find((n) => n[0] !== null);
    const b = bars[t + 1].find((n) => n[0] !== null);
    if (!a || !b) continue;
    const d = Math.abs((b[0] as number) - (a[0] as number));
    if (d === 0 || d > 7) z++;
  }
  return z;
}

/**
 * Die Montage. `idx` sind die dreizehn Stellen des Odometers; `stueckFuer`
 * rechnet sie aus der Level-Id aus, die erschoepfende Pruefung setzt sie frei.
 */
export function montiere(theme: string, idx: readonly number[]): Stueck {
  const w = WELTEN[theme];
  const f = FAMILIEN[w.familie];
  const [iForm, iW, iA, iM, iL, iS, iK, iFarbe, iArp, iHst, iZweit, iHarm, iBogen] = idx;
  const form = FORMEN[w.formen[iForm]];

  // --- 1. Kadenzen, die diese Welt tragen darf (A2, E3, F6) ----------------
  const erlaubt = f.kadenzen.filter((kad) => {
    const maxA = Math.max(...kad);
    // Die Sechzehntelfigur reicht bis Wurzel + max(ARPEGGIO) = +12.
    if (w.grund * Math.pow(2, (maxA + 12) / 12) >= 800) return false;
    // Die Harmonie laeuft auch im Endspurt, also einen Halbton hoeher.
    const maxF = Math.max(...f.farben[iFarbe]);
    if (w.grund * Math.pow(2, (maxA + maxF + 1) / 12) >= 800) return false;
    // Der Bass darf nicht unter die tiefste Wurzel der Welt rutschen.
    if (Math.min(...kad) < Math.min(...f.kadenzen[0])) return false;
    return true;
  });
  const kadPool = erlaubt.length ? erlaubt : [f.kadenzen[0]];
  const kadErst = kadPool[iK % kadPool.length];

  // --- 2. Takte bauen; Deckungspflicht und Fugenregel entscheiden mit ------
  //
  // Deckungspflicht: fehlt der montierten Melodie eine Stufe der Geraeuschleiter
  // oder ein Ton des Fanfarendreiklangs, rueckt erst der Mittelteil, dann der
  // Lauf, dann der Schluss weiter. Fugenregel: sind zwei oder mehr Taktgrenzen
  // auffaellig, wird unter den uebrigen tauglichen Kandidaten der erste mit
  // weniger Auffaelligkeiten genommen. Beides deterministisch und endlich.
  const kandidaten: { bars: Takt[]; schritt: number }[] = [];
  for (let ds = 0; ds < f.schluesse.length; ds++) {
    for (let dl = 0; dl < f.laeufe.length; dl++) {
      for (let dm = 0; dm < f.mittel.length; dm++) {
        const b = baueTakte(
          f, form, iW, w.wendungFolge, iA,
          (iM + dm) % f.mittel.length,
          (iL + dl) % f.laeufe.length,
          (iS + ds) % f.schluesse.length,
        );
        if (deckt(b, w, kadErst)) kandidaten.push({ bars: b, schritt: dm + dl + ds });
      }
    }
  }
  let bars: Takt[];
  let deckungsRepair: number;
  let fugenRepair = 0;
  if (!kandidaten.length) {
    bars = baueTakte(f, form, iW, w.wendungFolge, iA, iM, iL, iS);
    deckungsRepair = -1;
  } else {
    let wahl = kandidaten[0];
    deckungsRepair = wahl.schritt;
    const strafe0 = fugenstrafe(wahl.bars);
    // Die Schwelle ist an den abgenommenen Weltstuecken geeicht: das Rostwerk
    // hat selbst zwei auffaellige Taktgrenzen (T4->T5 und T6->T7). Was das
    // Vorbild sich erlaubt, darf die Montage sich auch erlauben — die Regel
    // greift erst darueber.
    if (strafe0 >= 3) {
      const besser = kandidaten.find((k) => fugenstrafe(k.bars) < strafe0);
      if (besser) {
        wahl = besser;
        fugenRepair = strafe0 - fugenstrafe(besser.bars);
      }
    }
    bars = wahl.bars;
  }

  // --- 3. Kadenz: die vertraeglichste der erlaubten ------------------------
  const bewerte = (kad: readonly number[]) =>
    kad.reduce(
      (a, wurzel, t) => a + misstoene(bars[t], wurzel, f.leiter, folgeTon(bars, t), kad[(t + 1) % TAKT]),
      0,
    );
  let akkorde = kadPool[iK % kadPool.length].slice();
  let bestScore = bewerte(akkorde);
  for (let j = 1; j < kadPool.length && bestScore > 0; j++) {
    const kand = kadPool[(iK + j) % kadPool.length];
    const sc = bewerte(kand);
    if (sc < bestScore) {
      bestScore = sc;
      akkorde = kand.slice();
    }
  }
  // Taktweise Reparatur: nur mit Wurzeln, die in dieser Welt ohnehin vorkommen.
  let kadenzRepair = 0;
  if (bestScore > 0) {
    const wurzeln = [...new Set(kadPool.flat())].sort((a, b) => a - b);
    for (let t = 0; t < TAKT; t++) {
      const ft = folgeTon(bars, t);
      const fw = akkorde[(t + 1) % TAKT];
      if (misstoene(bars[t], akkorde[t], f.leiter, ft, fw) === 0) continue;
      for (const kand of wurzeln) {
        if (misstoene(bars[t], kand, f.leiter, ft, fw) === 0) {
          akkorde[t] = kand;
          kadenzRepair++;
          break;
        }
      }
    }
  }

  return {
    melodie: flach(bars),
    akkorde,
    farbe: f.farben[iFarbe],
    bpm: w.bpm,
    grund: w.grund,
    melodieStimme: w.melodieStimme,
    zweitStimme: w.zweitStimmen[iZweit],
    harmonieStimme: w.harmonieStimmen[iHarm],
    sfxStufen: w.sfxStufen,
    fanfareGrund: w.fanfareGrund,
    arpeggio: ARPEGGIEN[iArp],
    harmonieStellen: HARMONIESTELLEN[iHst],
    bogen: BOGENPLAENE[iBogen],
    theme,
    form: form.name,
    wahl: { form: iForm, w: iW, a: iA, m: iM, l: iL, s: iS, kad: iK, farbe: iFarbe,
            arp: iArp, hst: iHst, zweit: iZweit, harm: iHarm, bogen: iBogen },
    deckungsRepair,
    kadenzRepair,
    fugenRepair,
  };
}

/**
 * Das Stueck eines Levels. Reine Funktion der Level-Id — kein Math.random.
 *
 * Odometer: jede Stelle rueckt bei jedem Level um eins weiter. Bei k=0 stehen
 * alle auf null, und das ist das abgenommene Weltstueck. Zwei Level einer Welt
 * fallen erst nach kgV(5,4,4,3,3,3,3,3,4,2,2,2,3) = 60 Leveln zusammen.
 */
export function stueckFuer(levelId: string, theme: string): Stueck {
  const w = WELTEN[theme];
  const f = FAMILIEN[w.familie];
  const k = zaehler(levelId);
  return montiere(theme, [
    k % w.formen.length,
    k % f.wendungen.length,
    k % f.antworten.length,
    k % f.mittel.length,
    k % f.laeufe.length,
    k % f.schluesse.length,
    k % f.kadenzen.length,
    k % f.farben.length,
    k % ARPEGGIEN.length,
    k % HARMONIESTELLEN.length,
    k % w.zweitStimmen.length,
    k % w.harmonieStimmen.length,
    k % BOGENPLAENE.length,
  ]);
}

// ===========================================================================
// 7. Die Pruefung — jedes Gesetz der Bestandsaufnahme
// ===========================================================================

function pruefe(p: Stueck): string[] {
  const fe: string[] = [];
  const t = toene(p.melodie);

  // A1 — die Sechzehntelfigur meidet die Terz
  for (const h of p.arpeggio) if (![0, 7].includes(kl(h))) fe.push(`A1 ${h}`);
  // A2 — sie bleibt unter dem Fenster der Melodie
  const arp = p.grund * Math.pow(2, (Math.max(...p.akkorde) + Math.max(...p.arpeggio)) / 12);
  if (arp >= 800) fe.push(`A2 Figur ${arp.toFixed(0)} Hz`);
  // B1 — jeder Takt genau voll
  let imTakt = 0;
  let takte = 0;
  for (const [, l] of p.melodie) {
    imTakt += l;
    if (imTakt > TAKT) fe.push('B1 Note ueber Taktgrenze');
    if (imTakt === TAKT) {
      takte++;
      imTakt = 0;
    }
  }
  if (imTakt !== 0) fe.push('B1 letzter Takt unvoll');
  if (takte !== p.akkorde.length) fe.push(`B1 ${takte} Takte vs ${p.akkorde.length} Akkorde`);
  // B2 — Kopfmotiv kehrt wieder
  const kopf = p.melodie.slice(0, 3).map((n) => n[0]);
  let treffer = 0;
  for (let i = 0; i + 3 <= p.melodie.length; i++) {
    if (p.melodie.slice(i, i + 3).every((n, j) => n[0] === kopf[j])) treffer++;
  }
  if (treffer < 2) fe.push(`B2 Kopf ${treffer}x`);
  // B3 — Atempausen
  const lang = p.melodie.filter((n) => n[1] >= 3).length;
  if (lang < 3) fe.push(`B3 nur ${lang} lange Toene`);
  // B4 — singbare Lage
  if (Math.max(...t) - Math.min(...t) > 24) fe.push('B4 Ambitus');
  // B5 — haltende Stimmen
  const haltend = ['akkordeon', 'klarinette', 'panfloete', 'okarina', 'leier', 'streicher'];
  if (!haltend.includes(p.melodieStimme) || !haltend.includes(p.zweitStimme)) fe.push('B5');
  // B6 — Zweitstimme ist eine andere
  if (p.zweitStimme === p.melodieStimme) fe.push('B6');
  // C9' — und aus einer anderen Familie
  if (familieVon(p.melodieStimme) === familieVon(p.zweitStimme)) fe.push('C9 gleiche Familie');
  // B7 — Geraeuschleiter in der Melodie
  const km = klassen(p.melodie);
  for (const s of p.sfxStufen) if (!km.has(kl(s))) fe.push(`B7 Stufe ${s} fehlt`);
  // B8 — Durdreiklang auf dem Fanfarengrund
  const vorrat = new Set([...km, ...p.akkorde.map(kl)]);
  for (const iv of [0, 4, 7]) if (!vorrat.has(kl(p.fanfareGrund + iv))) fe.push(`B8 ${iv}`);
  // F3 — Harmoniestimme
  if (!['ukulele', 'kalimba'].includes(p.harmonieStimme)) fe.push('F3');
  // F2 — Rasterlaenge Vielfaches von 8
  const raster = p.melodie.reduce((a, n) => a + n[1], 0);
  if (raster % TAKT !== 0) fe.push('F2 Raster');
  // E3 — Harmonie unter 800 Hz, auch im Endspurt (Halbtonschiebung)
  const harm = p.grund * Math.pow(2, (Math.max(...p.akkorde) + Math.max(...p.farbe) + 1) / 12);
  if (harm >= 800) fe.push(`E3 Harmonie ${harm.toFixed(0)} Hz`);
  // E3 — Oktavdopplung der Melodie unter 3 kHz
  const spitze = p.grund * Math.pow(2, Math.max(...t) / 12 + 2);
  if (spitze >= 3000) fe.push(`E3 Melodiespitze ${spitze.toFixed(0)} Hz`);
  // F6 — Bass nicht unter die Welt
  const weltTief = Math.min(...FAMILIEN[WELTEN[p.theme].familie].kadenzen[0]);
  if (Math.min(...p.akkorde) < weltTief) fe.push('F6 Bass');
  // C11 — keine zwei benachbarten Durchgaenge gleich
  for (let i = 0; i < p.bogen.length; i++) {
    const a = JSON.stringify(p.bogen[i]);
    const b = JSON.stringify(p.bogen[(i + 1) % p.bogen.length]);
    if (a === b) fe.push(`C11 Umlauf ${i}`);
  }
  // C9/C10 — feste Punkte im Bogen
  if (!p.bogen[0].haupt || p.bogen[1].haupt) fe.push('C9 Stimmwechsel');
  if (!p.bogen[2].bruch || p.bogen[0].bruch) fe.push('C10 Bruch');
  // Farbe im Modus
  const leiter = FAMILIEN[WELTEN[p.theme].familie].leiter;
  for (const c of p.farbe) if (!leiter.includes(kl(c))) fe.push(`Farbe ${c} nicht im Modus`);
  return fe;
}

// ===========================================================================
// 8. Lauf
// ===========================================================================

const NAMEN = ['C', 'Cis', 'D', 'Es', 'E', 'F', 'Fis', 'G', 'As', 'A', 'B', 'H'];
/** Halbton des Weltgrundtons ueber C — nur fuer die Anzeige. */
const TONIKA: Record<string, number> = {
  grass: 0, sonnenhang: 10, wipfel: 7, crystal: 9, rust: 7, frost: 4, magma: 2,
};
const nmIn = (th: string) => (h: number | null) =>
  h === null ? '—' : NAMEN[kl(h + TONIKA[th])] + (h >= 12 ? "'" : '');

console.log('=== 1. Baut die Montage das abgenommene Weltstueck? (Level 1 jeder Welt) ===\n');
for (const [th, w] of Object.entries(WELTEN)) {
  const nr = { grass: 1, crystal: 2, rust: 3, frost: 4, magma: 5, sonnenhang: 6, wipfel: 7 }[th];
  const p = stueckFuer(`w${nr}-01`, th);
  const soll = STUECKE[th as keyof typeof STUECKE];
  const mOk = JSON.stringify(p.melodie) === JSON.stringify(soll.melodie.map((n) => [n[0], n[1]]));
  const aOk = JSON.stringify(p.akkorde) === JSON.stringify(soll.akkorde);
  const fOk = JSON.stringify(p.farbe) === JSON.stringify(soll.farbe);
  const sOk = p.melodieStimme === soll.melodieStimme && p.zweitStimme === soll.zweitStimme;
  console.log(
    `  ${th.padEnd(11)} Melodie ${mOk ? 'gleich' : 'ABWEICHUNG'}, Akkorde ${aOk ? 'gleich' : 'ABWEICHUNG'}, Farbe ${fOk ? 'gleich' : 'ABWEICHUNG'}, Stimmen ${sOk ? 'gleich' : 'geaendert'} (${p.melodieStimme}/${p.zweitStimme}), bpm ${p.bpm}, Form ${p.form}`,
  );
  void w;
}

console.log('\n=== 2. Erschoepfende Pruefung: JEDE erreichbare Kombination ===\n');
{
  let gesamt = 0;
  let fehler = 0;
  const meldungen = new Map<string, number>();
  for (const [th, w] of Object.entries(WELTEN)) {
    const f = FAMILIEN[w.familie];
    // Alle Kombinationen der Stellen, die den Notentext bestimmen. Die uebrigen
    // fuenf (Figur, Harmoniestellen, Zweitstimme, Harmoniestimme, Bogen) haengen
    // nicht am Notentext und werden darunter einzeln erschoepft.
    const n = [
      w.formen.length, f.wendungen.length, f.antworten.length, f.mittel.length,
      f.laeufe.length, f.schluesse.length, f.kadenzen.length, f.farben.length,
    ];
    const total = n.reduce((a, b) => a * b, 1);
    let welt = 0;
    for (let c = 0; c < total; c++) {
      // Zerlege c in die Stellen und baue direkt (statt ueber `k`), damit
      // wirklich JEDE Kombination geprueft wird, nicht nur die Diagonale.
      let r = c;
      const idx = n.map((m) => {
        const v = r % m;
        r = Math.floor(r / m);
        return v;
      });
      // Die fuenf notentextfreien Stellen laufen mit durch, damit auch ihre
      // Kombinationen abgedeckt sind (jede kommt in jeder Welt oft genug vor).
      const p = montiere(th, [
        ...idx,
        c % ARPEGGIEN.length,
        c % HARMONIESTELLEN.length,
        c % 2,
        (c + 1) % 2,
        c % BOGENPLAENE.length,
      ]);
      const fe = pruefe(p);
      gesamt++;
      welt++;
      if (fe.length) {
        fehler++;
        for (const m of fe) meldungen.set(`${th}: ${m}`, (meldungen.get(`${th}: ${m}`) ?? 0) + 1);
      }
    }
    console.log(`  ${th.padEnd(11)} ${welt} Kombinationen geprueft`);
  }
  console.log(`\n  ${gesamt} Stuecke insgesamt, ${fehler} mit Befund`);
  if (meldungen.size) {
    for (const [m, c] of [...meldungen].sort((a, b) => b[1] - a[1]).slice(0, 30)) {
      console.log(`    ${c}x  ${m}`);
    }
  }
}

console.log('\n=== 3. Die 69 gebauten Level ===\n');
{
  let fehler = 0;
  let repM = 0;
  let repK = 0;
  let repF = 0;
  const gesehen = new Map<string, string>();
  let kollisionen = 0;
  for (const lv of LEVELS) {
    const p = stueckFuer(lv.id, lv.theme);
    const fe = pruefe(p);
    if (fe.length) {
      fehler++;
      console.log(`  FEHLER ${lv.id} (${lv.theme}): ${fe.join(', ')}`);
    }
    if (p.deckungsRepair > 0) repM++;
    if (p.kadenzRepair > 0) repK++;
    if (p.fugenRepair > 0) repF++;
    const key = lv.theme + '|' + JSON.stringify(p.melodie) + '|' + JSON.stringify(p.akkorde);
    if (gesehen.has(key)) {
      kollisionen++;
      console.log(`  KOLLISION ${lv.id} == ${gesehen.get(key)}`);
    }
    gesehen.set(key, lv.id);
  }
  console.log(`  ${LEVELS.length} Level, ${fehler} Fehler, ${kollisionen} Kollisionen, ${repM} Deckungsreparaturen, ${repK} Kadenzreparaturen, ${repF} Fugenreparaturen`);
}

console.log('\n=== 4. Zielausbau 100 Level (7 Welten x 15) ===\n');
{
  const welten: [string, string][] = [
    ['w1', 'grass'], ['w2', 'crystal'], ['w3', 'rust'], ['w4', 'frost'],
    ['w5', 'magma'], ['w6', 'sonnenhang'], ['w7', 'wipfel'],
  ];
  let fehler = 0;
  let kollisionen = 0;
  let zahl = 0;
  for (const [pre, th] of welten) {
    const gesehen = new Map<string, string>();
    const koepfe = new Set<string>();
    for (let i = 1; i <= 15; i++) {
      const id = `${pre}-${String(i).padStart(2, '0')}`;
      const p = stueckFuer(id, th);
      zahl++;
      const fe = pruefe(p);
      if (fe.length) {
        fehler++;
        console.log(`  FEHLER ${id}: ${fe.join(', ')}`);
      }
      const key = JSON.stringify(p.melodie) + '|' + JSON.stringify(p.akkorde);
      if (gesehen.has(key)) {
        kollisionen++;
        console.log(`  KOLLISION ${id} == ${gesehen.get(key)}`);
      }
      gesehen.set(key, id);
      koepfe.add(JSON.stringify(p.melodie.slice(0, 3)));
    }
    console.log(`  ${th.padEnd(11)} 15 Stuecke, ${gesehen.size} verschieden, ${koepfe.size} Kopfmotiv(e)`);
  }
  console.log(`\n  ${zahl} Stuecke, ${fehler} Fehler, ${kollisionen} Kollisionen`);
}

console.log('\n=== 5. Wie viel unterscheidet zwei Nachbarlevel? ===\n');
{
  const welten: [string, string][] = [
    ['w1', 'grass'], ['w2', 'crystal'], ['w3', 'rust'], ['w4', 'frost'],
    ['w5', 'magma'], ['w6', 'sonnenhang'], ['w7', 'wipfel'],
  ];
  let summeTakte = 0;
  let summeAkk = 0;
  let paare = 0;
  for (const [pre, th] of welten) {
    for (let i = 1; i < 15; i++) {
      const a = stueckFuer(`${pre}-${String(i).padStart(2, '0')}`, th);
      const b = stueckFuer(`${pre}-${String(i + 1).padStart(2, '0')}`, th);
      const ta = inTakte(a.melodie);
      const tb = inTakte(b.melodie);
      let d = 0;
      for (let t = 0; t < 8; t++) if (JSON.stringify(ta[t]) !== JSON.stringify(tb[t])) d++;
      let da = 0;
      for (let t = 0; t < 8; t++) if (a.akkorde[t] !== b.akkorde[t]) da++;
      summeTakte += d;
      summeAkk += da;
      paare++;
    }
  }
  console.log(`  im Mittel ${(summeTakte / paare).toFixed(2)} von 8 Takten und ${(summeAkk / paare).toFixed(2)} von 8 Akkorden verschieden (Weg A: 1,20 / 0,71)`);
}

function inTakte(m: readonly Note[]): Takt[] {
  const out: Takt[] = [];
  let cur: Takt = [];
  let s = 0;
  for (const n of m) {
    cur.push([n[0], n[1]]);
    s += n[1];
    if (s === TAKT) { out.push(cur); cur = []; s = 0; }
  }
  return out;
}

console.log('\n=== 6. Determinismus ===\n');
{
  let schief = 0;
  for (const lv of LEVELS) {
    const a = JSON.stringify(stueckFuer(lv.id, lv.theme));
    const b = JSON.stringify(stueckFuer(lv.id, lv.theme));
    if (a !== b) { schief++; console.log(`  NICHT DETERMINISTISCH ${lv.id}`); }
  }
  console.log(`  ${LEVELS.length} Level zweimal erzeugt, ${schief} Abweichungen`);
}

console.log('\n=== 7. Beispiel ===\n');
function zeige(id: string, th: string) {
  const p = stueckFuer(id, th);
  const bars = inTakte(p.melodie);
  const w = WELTEN[th];
  const form = FORMEN[w.formen[zaehler(id) % w.formen.length]];
  const nm = nmIn(th);
  console.log(`--- ${id} (${th}) — Form ${form.name}: ${form.slots.join(' ')} ---`);
  console.log(`  Stimmen: ${p.melodieStimme} fuehrt, ${p.zweitStimme} antwortet, ${p.harmonieStimme} greift`);
  console.log(`  bpm ${p.bpm}, Grundton ${p.grund} Hz, Farbe [${p.farbe}], Figur [${p.arpeggio}], Harmonie auf [${p.harmonieStellen}]`);
  console.log(`  Bogenplan ${JSON.stringify(p.bogen.map((d) => (d.haupt ? 'H' : 'Z') + (d.bruch ? 'b' : '-') + (d.rueck ? 'r' : '-') + (d.oktave ? 'o' : '-')))}`);
  bars.forEach((b, t) => {
    console.log(
      `  T${t + 1} ${form.slots[t]}  ${nm(p.akkorde[t]).padEnd(3)} | ` +
      b.map((n) => `${nm(n[0])}(${n[1]})`).join(' '),
    );
  });
  console.log('  melodie: ' + JSON.stringify(p.melodie));
  console.log('  akkorde: ' + JSON.stringify(p.akkorde));
  const t = toene(p.melodie);
  console.log(
    `  Melodie ${(p.grund * Math.pow(2, Math.min(...t) / 12 + 1)).toFixed(0)}..${(p.grund * Math.pow(2, Math.max(...t) / 12 + 1)).toFixed(0)} Hz` +
    `, Oktavdopplung bis ${(p.grund * Math.pow(2, Math.max(...t) / 12 + 2)).toFixed(0)} Hz` +
    `, Figurspitze ${(p.grund * Math.pow(2, (Math.max(...p.akkorde) + Math.max(...p.arpeggio)) / 12)).toFixed(0)} Hz` +
    `, Harmoniespitze ${(p.grund * Math.pow(2, (Math.max(...p.akkorde) + Math.max(...p.farbe)) / 12)).toFixed(0)} Hz` +
    `, Bass ab ${(p.grund * Math.pow(2, Math.min(...p.akkorde) / 12 - 1)).toFixed(1)} Hz`,
  );
  console.log(`  Umlauf ${(60 / p.bpm / 2 * 64).toFixed(1)} s, vier Umlaeufe ${(60 / p.bpm / 2 * 256).toFixed(0)} s`);
}
zeige('w3-07', 'rust');
console.log('');
for (const id of ['w3-01', 'w3-02', 'w3-03', 'w3-06', 'w3-08']) {
  zeige(id, 'rust');
  console.log('');
}


console.log('\n=== 8. Wie klingt das statistisch? (105 Stuecke des Zielausbaus) ===\n');
{
  const welten: [string, string][] = [
    ['w1', 'grass'], ['w2', 'crystal'], ['w3', 'rust'], ['w4', 'frost'],
    ['w5', 'magma'], ['w6', 'sonnenhang'], ['w7', 'wipfel'],
  ];
  const fugen: Record<number, number> = {};
  const schritte: Record<number, number> = {};
  let maxFuge = 0;
  let maxFugeWo = '';
  let mist = 0;
  let mistStuecke = 0;
  let noten = 0;
  let stuecke = 0;
  for (const [pre, th] of welten) {
    const f = FAMILIEN[WELTEN[th].familie];
    for (let i = 1; i <= 15; i++) {
      const id = `${pre}-${String(i).padStart(2, '0')}`;
      const p = stueckFuer(id, th);
      stuecke++;
      noten += p.melodie.length;
      const bars = inTakte(p.melodie);
      // Fugen: der Sprung ueber eine Taktgrenze — dort stossen zwei Motive
      // aufeinander, die nicht fuereinander geschrieben wurden.
      for (let t = 0; t + 1 < bars.length; t++) {
        const a = [...bars[t]].reverse().find((n) => n[0] !== null);
        const b = bars[t + 1].find((n) => n[0] !== null);
        if (!a || !b) continue;
        const d = Math.abs((b[0] as number) - (a[0] as number));
        fugen[d] = (fugen[d] ?? 0) + 1;
        if (d > maxFuge) { maxFuge = d; maxFugeWo = `${id} T${t + 1}->T${t + 2}`; }
      }
      // Alle Intervalle
      for (let j = 1; j < p.melodie.length; j++) {
        const a = p.melodie[j - 1][0];
        const b = p.melodie[j][0];
        if (a === null || b === null) continue;
        const d = Math.abs(b - a);
        schritte[d] = (schritte[d] ?? 0) + 1;
      }
      // Misstoene der fertigen Fassung
      let m = 0;
      for (let t = 0; t < 8; t++) {
        m += misstoene(bars[t], p.akkorde[t], f.leiter, folgeTon(bars, t), p.akkorde[(t + 1) % 8]);
      }
      mist += m;
      if (m > 0) mistStuecke++;
    }
  }
  const sumF = Object.values(fugen).reduce((a, b) => a + b, 0);
  const sumS = Object.values(schritte).reduce((a, b) => a + b, 0);
  console.log(`  ${stuecke} Stuecke, ${(noten / stuecke).toFixed(1)} Noten je Stueck`);
  console.log('  Sprung ueber die Taktgrenze (Fuge): ' +
    Object.keys(fugen).map(Number).sort((a, b) => a - b)
      .map((k) => `${k}:${((fugen[k] / sumF) * 100).toFixed(0)}%`).join(' '));
  console.log(`  groesste Fuge: ${maxFuge} Halbtoene (${maxFugeWo})`);
  console.log('  alle Intervalle: ' +
    Object.keys(schritte).map(Number).sort((a, b) => a - b)
      .map((k) => `${k}:${((schritte[k] / sumS) * 100).toFixed(0)}%`).join(' '));
  const sec = (schritte[0] ?? 0) + (schritte[1] ?? 0) + (schritte[2] ?? 0);
  console.log(`  Schritt oder Tonwiederholung: ${((sec / sumS) * 100).toFixed(0)}%`);
  console.log(`  Misstoene nach der Kadenzwahl: ${mist} in ${mistStuecke} von ${stuecke} Stuecken`);
}

console.log('\n=== 9. Abstand zweier Nachbarlevel, auf Achtel gerechnet ===\n');
{
  const welten: [string, string][] = [
    ['w1', 'grass'], ['w2', 'crystal'], ['w3', 'rust'], ['w4', 'frost'],
    ['w5', 'magma'], ['w6', 'sonnenhang'], ['w7', 'wipfel'],
  ];
  const raster = (m: readonly Note[]) => {
    const r: (number | null)[] = [];
    for (const n of m) { r.push(n[0]); for (let i = 1; i < n[1]; i++) r.push(null); }
    return r;
  };
  let anders = 0;
  let gesamt = 0;
  let neueTakte = 0;
  let paare = 0;
  for (const [pre, th] of welten) {
    for (let i = 1; i < 15; i++) {
      const a = stueckFuer(`${pre}-${String(i).padStart(2, '0')}`, th);
      const b = stueckFuer(`${pre}-${String(i + 1).padStart(2, '0')}`, th);
      const ra = raster(a.melodie);
      const rb = raster(b.melodie);
      for (let j = 0; j < 64; j++) { gesamt++; if (ra[j] !== rb[j]) anders++; }
      const ta = inTakte(a.melodie).map((x) => JSON.stringify(x));
      const tb = inTakte(b.melodie).map((x) => JSON.stringify(x));
      neueTakte += tb.filter((x) => !ta.includes(x)).length;
      paare++;
    }
  }
  console.log(`  ${((anders / gesamt) * 100).toFixed(0)} % aller 64 Achtelplaetze tragen eine andere Tonhoehe`);
  console.log(`  ${(neueTakte / paare).toFixed(2)} von 8 Takten kommen im Nachbarlevel gar nicht vor`);
}
