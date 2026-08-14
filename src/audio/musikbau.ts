/**
 * Musikbau — ein eigenes Stueck je Level, montiert aus dem Baukasten seiner
 * Welt.
 *
 * ## Warum ueberhaupt
 *
 * Bis hierher gab es genau ein Musikstueck je Welt-Thema (`STUECKE` in
 * `music.ts`). Fuenfzehn Level einer Welt teilten sich also einen Achttakter
 * von zwanzig Sekunden; wer eine Welt durchspielt, hoert ihn ein paar hundert
 * Mal. Der Bogen ueber vier Umlaeufe (`DURCHGAENGE`) hat das gelindert, aber
 * nicht behoben: Er wechselt das Arrangement, nicht den Notentext.
 *
 * ## Das Verfahren („Weg D")
 *
 * **Motivfamilie je Welt, Arrangement je Level.** Jede Welt bringt einen
 * Baukasten mit — Kopf, Kopfrhythmen, Wendungen, Antworten, Mittelteile,
 * Laeufe, Schluesse, Kadenzen, Farben —, und je Level wird daraus nach einer
 * Formgrammatik ein Stueck MONTIERT. Kein freier Generator: die Teile sind
 * einzeln abgenommen, und der Zusammenbau haelt die Gesetze der Klangschicht
 * per Bauart ein, nicht per Glueck.
 *
 * **Eintrag 0 jeder Tabelle ist der Baustein aus dem heutigen, abgenommenen
 * Weltstueck.** Deshalb ist das abgenommene Stueck weiter erreichbar: Level 1
 * einer Welt steht auf dem Punkt null des Odometers und ist damit Note fuer
 * Note das Stueck, das heute laeuft (Test in `tests/musik.test.ts`).
 *
 * ## Was je Welt fest bleibt und was je Level wechselt
 *
 * | fest je Welt | wechselt je Level |
 * |---|---|
 * | Grundton (`grund`) und Tempo (`bpm`) | Form, Kopfrhythmus, Wendungen |
 * | Geraeuschleiter (`sfxStufen`), Fanfarengrund | Antworten, Mittelteil, Lauf, Schluss |
 * | Modus (`leiter`) und Motivfamilie | Kadenz, Flaechenfarbe |
 * | die fuehrende Stimme | Zweit- und Harmoniestimme, Figur, Bogenplan |
 *
 * Grundton und Tempo wechseln **mit Absicht nicht**: `tonart()` und
 * `schrittDauer()` reichen sie an `sfx.ts` und `stinger.ts` weiter. Wechselte
 * der Grundton je Level, haette eine Welt keine Tonart mehr, sondern fuenfzehn
 * — und die Tempobaender der Welten (88 bis 132) wuerden ueberlappen, womit der
 * Hoerer den Ort nicht mehr am Puls erkennt.
 *
 * ## Diese Datei kennt keine Leveldaten
 *
 * Sie importiert nichts aus `src/levels/` und bekommt Level-Id und Thema als
 * Argumente. Klang haengt nicht an Leveldaten; die Umkehrung waere ein Grund,
 * bei jeder Levelaenderung die Musik neu abzunehmen.
 *
 * ## Erzeugung ist eine reine Funktion der Level-Id
 *
 * Kein `Math.random`. Ein Level, das bei jedem Start anders klingt, ist kein
 * Level mit Musik, sondern eines mit Geraeusch.
 */

/** Ein Ton: Halbtoene ueber dem Grundton (null = Pause), Laenge in Achteln. */
export type Note = readonly [number | null, number];
type Takt = Note[];

/** Die Stimmen, die eine Melodie halten koennen — siehe `STIMMEN` in `music.ts`. */
export type StimmName = 'akkordeon' | 'klarinette' | 'panfloete' | 'okarina' | 'leier' | 'streicher';
/** Die zupfenden Stimmen der Harmoniespur. */
export type HarmonieStimme = 'ukulele' | 'kalimba';

const TAKT = 8;
/** Die Achtel, auf denen der Puls steht — dort zaehlt ein Misston doppelt. */
const PULSSTELLEN = [0, 3, 6];

const kl = (t: number) => ((t % 12) + 12) % 12;
const mod = (a: number, n: number) => ((a % n) + n) % n;
const flach = (b: Takt[]): Note[] => b.flat();
const toene = (m: readonly Note[]) => m.filter((n) => n[0] !== null).map((n) => n[0] as number);
const klassen = (m: readonly Note[]) => new Set(toene(m).map(kl));
const kopie = (b: readonly Note[]): Takt => b.map((n) => [n[0], n[1]] as Note);

// ===========================================================================
// 1. Die Bausteine: Motivfamilien
// ===========================================================================

export interface Familie {
  /** Die sieben Stufen des Modus, in Halbtoenen. */
  leiter: readonly number[];
  /** Der Kopf: sechs Achtel. Er ist das Gesicht der Familie und aendert sich nie. */
  kopf: readonly Note[];
  /**
   * Laengenmuster des Kopfes. Die TONHOEHEN bleiben, nur die Verteilung der
   * sechs Achtel wechselt. Eintrag 0 ist die abgenommene.
   */
  kopfRhythmen: readonly (readonly number[])[];
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
  /**
   * Zusatztoene der Flaeche — in **LEITERSTUFEN** ueber der Akkordwurzel, nicht
   * in Halbtoenen. Warum, steht bei `farbTon`. Eintrag 0 ist der abgenommene:
   * Terz und Quinte, also `[2, 4]` in Stufen.
   */
  farben: readonly (readonly number[])[];
}

export const FAMILIEN: Record<string, Familie> = {
  // -------------------------------------------------------------------------
  // Gruen — Wiese, Sonnenhang, Wipfelweide. Eine Familie, drei Welten.
  // Dur mit lydischem Gast (6). Kopf: der Ruf G-G-A-G.
  // -------------------------------------------------------------------------
  gruen: {
    leiter: [0, 2, 4, 5, 7, 9, 11],
    kopf: [[7, 2], [7, 1], [9, 1], [7, 2]],
    kopfRhythmen: [[2, 1, 1, 2], [1, 1, 2, 2], [2, 2, 1, 1]],
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
    // In Halbtoenen waren das [4,7] / [4,9] / [4,7,11] — Terz und Quinte,
    // Terz und Sexte, Terz/Quinte/Septime.
    farben: [[2, 4], [2, 5], [2, 4, 6]],
  },

  // -------------------------------------------------------------------------
  // Kristall — Hoehle. A-dorisch, die grosse Sexte (9) ist das Gesicht.
  // -------------------------------------------------------------------------
  kristall: {
    leiter: [0, 2, 3, 5, 7, 9, 10],
    kopf: [[0, 2], [3, 2], [5, 2]],
    wendungen: [7, 10, 3, 9],
    kopfRhythmen: [[2, 2, 2], [1, 2, 3], [3, 2, 1]],
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
    // in Halbtoenen [3,7] / [3,10] / [3,7,10]
    farben: [[2, 4], [2, 6], [2, 4, 6]],
  },

  // -------------------------------------------------------------------------
  // Rost — Rostwerk. G-mixolydisch, kleine Septime (10). Kopf: ein Ruf mit
  // Tonwiederholung — der Dialekt der Werkbank.
  // -------------------------------------------------------------------------
  rost: {
    leiter: [0, 2, 4, 5, 7, 9, 10],
    kopf: [[0, 2], [0, 1], [4, 1], [2, 2]],
    kopfRhythmen: [[2, 1, 1, 2], [1, 1, 2, 2], [2, 2, 1, 1]],
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
    // in Halbtoenen [4,10] / [4,7] / [4,9,10]
    farben: [[2, 6], [2, 4], [2, 5, 6]],
  },

  // -------------------------------------------------------------------------
  // Frost — Frostklamm. E-aeolisch, Terzschritte wie Atem in kalter Luft.
  // -------------------------------------------------------------------------
  frost: {
    leiter: [0, 2, 3, 5, 7, 8, 10],
    kopf: [[0, 2], [3, 2], [5, 2]],
    wendungen: [7, 8, 3, 10],
    kopfRhythmen: [[2, 2, 2], [1, 2, 3], [3, 2, 1]],
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
    // in Halbtoenen [3,8] / [3,7] / [3,8,10]
    farben: [[2, 5], [2, 4], [2, 5, 6]],
  },

  // -------------------------------------------------------------------------
  // Magma — Schlot. D-phrygisch, die kleine Sekunde (1) reibt.
  // -------------------------------------------------------------------------
  magma: {
    leiter: [0, 1, 3, 5, 7, 8, 10],
    kopf: [[0, 2], [1, 2], [3, 2]],
    kopfRhythmen: [[2, 2, 2], [1, 2, 3], [3, 2, 1]],
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
    // in Halbtoenen [1,3] / [1,7] / [1,3,8]
    farben: [[1, 2], [1, 4], [1, 2, 5]],
  },
};

// ===========================================================================
// 2. Die diatonischen Operatoren
// ===========================================================================
//
// Ein Motivbaukasten mit vier Antworten je Welt ist ueber fuenfzehn Level duenn.
// Statt vier weitere von Hand zu schreiben, werden die vorhandenen auf der
// LEITER DER WELT verschoben und gespiegelt — die zwei Handgriffe, mit denen
// jedes Volkslied seine zweite Zeile bildet. Das Ergebnis ist kein neues
// Material, sondern dasselbe Material an einer anderen Stelle der Tonleiter:
// derselbe Dialekt, andere Silbe.
//
// Auf STUFEN und nicht auf Halbtoenen — das ist der ganze Unterschied zwischen
// „eine Zeile weiter" und „einen Halbton daneben". Wer eine Melodie um zwei
// Halbtoene verschiebt, verlaesst die Tonart; wer sie um eine Stufe verschiebt,
// bleibt darin, auch wenn der Abstand dabei mal gross und mal klein ist.
//
// Drei Sperren, alle noetig:
//  - Ein Takt mit einem leiterfremden Gast (das Fis der Wiese) wird NICHT
//    abgeleitet. Der Gast ist an seine Stelle gebunden; verschoben waere er
//    nur ein falscher Ton.
//  - Alle Toene muessen im Register der Welt bleiben (0 bis 12 Halbtoene).
//    Damit koennen der singbare Ambitus und die 3-kHz-Decke gar nicht erst
//    reissen.
//  - Kopf und Schluss werden nie abgeleitet. Sie sind die Klammer.

/** Absoluter Halbton -> Stufenindex auf der Leiter (7 Stufen je Oktave). */
export function stufeVon(h: number, leiter: readonly number[]): number | null {
  const g = leiter.indexOf(kl(h));
  if (g < 0) return null;
  return ((h - kl(h)) / 12) * 7 + g;
}

/** Stufenindex -> absoluter Halbton. */
export function tonVon(s: number, leiter: readonly number[]): number {
  const okt = Math.floor(s / 7);
  return okt * 12 + leiter[s - okt * 7];
}

/**
 * Der Halbton, den die Flaeche fuer eine Farbstufe ueber einer Akkordwurzel
 * spielt.
 *
 * ## Der gemessene Befund, wegen dem diese Funktion existiert
 *
 * Die Harmoniespur hat ihre Zusatztoene bis hierher als **festes
 * Halbtonintervall** ueber die Akkordwurzel gelegt: `wurzel + farbe[i]`. Ueber
 * dem Grundton ist das richtig — dort ist die Farbe abgenommen —, ueber jeder
 * anderen Wurzel ist es Glueck. Nachgerechnet ueber die abgenommenen
 * Weltstuecke (`STUECKE`), acht Takte je Stueck; in jedem gezaehlten Takt liegt
 * der falsche Ton doppelt, denn die Flaeche haelt ihn den ganzen Takt und die
 * gezupfte Harmonie greift ihn auf den Achteln 1 und 5:
 *
 * | Welt | Takte mit modusfremdem Ton | Beispiel |
 * |---|---|---|
 * | grass, sonnenhang, wipfel | 0 von 8 | — |
 * | crystal | **5 von 8** | ueber der Wurzel 10 (G) ein B, wo A-dorisch das H hat |
 * | rust | **5 von 8** | ueber der Wurzel 10 (F) ein Es statt E |
 * | frost | **6 von 8** | ueber der Wurzel 8 (C) ein Dis statt D |
 * | magma | **4 von 8** | ueber der Wurzel 1 (Es) ein E statt F |
 *
 * Dass die drei Gruenwelten heil blieben, ist kein Verdienst: In Dur mit den
 * Wurzeln 0, 5 und 7 ist die grosse Terz zufaellig immer leitereigen. Beim
 * ersten Moll-Stueck haelt der Zufall nicht mehr — genau der Fehler von der
 * leisen Sorte, den `sfxStufen` schon einmal hatte: ein falscher Ton im Band
 * 250 bis 800 Hz, zweimal je Takt, seit der ersten Auslieferung, und man hoert
 * nur, dass etwas nicht stimmt.
 *
 * ## Die Behebung
 *
 * Die Farbe zaehlt in **Leiterstufen**: „zwei Stufen ueber der Wurzel" heisst
 * die Terz *dieses Modus* — gross oder klein, je nachdem, wo die Wurzel steht.
 * Damit kann ein modusfremder Flaechenton gar nicht mehr formuliert werden.
 *
 * Der Rueckfall (Wurzel nicht auf der Leiter) kommt bei keiner abgenommenen
 * Kadenz vor — alle Wurzeln aller `kadenzen` sind leitereigen. Er steht
 * trotzdem da, weil eine Harmoniespur nie abstuerzen darf, und nimmt dann das
 * Intervall von der Tonika aus.
 */
export function farbTon(wurzel: number, stufe: number, leiter: readonly number[]): number {
  const s = stufeVon(wurzel, leiter);
  if (s === null) return wurzel + tonVon(stufe, leiter);
  return tonVon(s + stufe, leiter);
}

export type Ableitung = { name: string; art: 'id' | 'seq' | 'spiegel'; d: number };

/** Eintrag 0 ist die Urgestalt — daran haengt „Level 1 ist das Weltstueck". */
export const ABLEITUNGEN: readonly Ableitung[] = [
  { name: '=', art: 'id', d: 0 },
  { name: '+1', art: 'seq', d: 1 },
  { name: '-1', art: 'seq', d: -1 },
  { name: 'S', art: 'spiegel', d: 0 },
];

/** Wendet eine Ableitung an. Gibt `null` zurueck, wenn sie nicht zulaessig ist. */
export function leite(b: readonly Note[], op: Ableitung, leiter: readonly number[]): Takt | null {
  if (op.art === 'id') return kopie(b);
  const stufen: (number | null)[] = [];
  for (const n of b) {
    if (n[0] === null) {
      stufen.push(null);
      continue;
    }
    const s = stufeVon(n[0], leiter);
    if (s === null) return null; // leiterfremder Gast — nicht ableitbar
    stufen.push(s);
  }
  const erste = stufen.find((x) => x !== null) as number | undefined;
  if (erste === undefined) return null;
  const raus: Takt = [];
  for (let i = 0; i < b.length; i++) {
    const s = stufen[i];
    if (s === null) {
      raus.push([null, b[i][1]]);
      continue;
    }
    const neu = op.art === 'seq' ? s + op.d : 2 * erste - s;
    const h = tonVon(neu, leiter);
    if (h < 0 || h > 12) return null; // Register der Welt
    raus.push([h, b[i][1]]);
  }
  return raus;
}

/** Ableitung mit Rueckfall auf die Urgestalt, damit die Montage nie leerlaeuft. */
export function leiteOderUr(b: readonly Note[], iOp: number, leiter: readonly number[]): Takt {
  return leite(b, ABLEITUNGEN[iOp], leiter) ?? kopie(b);
}

// ===========================================================================
// 3. Die Formgrammatik
// ===========================================================================

export type Slot = 'K' | 'A' | 'M' | 'L' | 'S';

/**
 * Acht Takte. Regeln, die jede Form einhaelt:
 *  - Takt 1 ist ein Kopf, Takt 8 ein Schluss.
 *  - Mindestens zwei Koepfe (die Wiederkehr per Bauart), mindestens zwei
 *    Antworten (die Atempausen per Bauart: jede Antwort hat einen langen Ton,
 *    der Schluss auch).
 *  - Genau ein Mittelteil, zwei Takte zusammenhaengend (M zaehlt als Paar).
 */
export interface Form {
  name: string;
  slots: readonly Slot[];
}

export const FORMEN: Record<string, Form> = {
  F1: { name: 'Liedform', slots: ['K', 'A', 'K', 'A', 'M', 'M', 'K', 'S'] },
  F2: { name: 'Anlauf', slots: ['K', 'A', 'K', 'A', 'M', 'M', 'L', 'S'] },
  F3: { name: 'Bogen', slots: ['K', 'A', 'M', 'M', 'K', 'A', 'K', 'S'] },
  F4: { name: 'Doppelruf', slots: ['K', 'K', 'A', 'A', 'M', 'M', 'K', 'S'] },
  F5: { name: 'Kehre', slots: ['K', 'A', 'K', 'M', 'M', 'A', 'L', 'S'] },
};

// ===========================================================================
// 4. Die Welten: Familie + Klangidentitaet + Reihenfolgen
// ===========================================================================

/**
 * Die zwei Klangfamilien der haltenden Stimmen: gestrichen (obertonreich) und
 * geblasen (obertonarm). Der Stimmwechsel im zweiten Umlauf ist nur dann einer,
 * wenn er die Familie wechselt — zwei Floeten hintereinander hoert niemand als
 * Weitergabe der Melodie. Geblasen sind Okarina, Klarinette und Panfloete;
 * alles andere zaehlt hier als gestrichen.
 */
const GESTRICHEN = ['leier', 'streicher', 'akkordeon'];
export const familieVon = (s: string) => (GESTRICHEN.includes(s) ? 'gestrichen' : 'geblasen');

export interface Welt {
  familie: keyof typeof FAMILIEN;
  /** Reihenfolge der Formen. Eintrag 0 baut das abgenommene Weltstueck. */
  formen: readonly string[];
  /** Welche Wendung der wievielte Kopf bekommt (Index in `wendungen`). */
  wendungFolge: readonly number[];
  /**
   * Tempo und Grundton — **fest je Welt**, nicht je Level. `tonart()` und
   * `schrittDauer()` in `music.ts` reichen beide an Geraeusche und Stingers
   * weiter; ein Level mit eigener Tonart haette eine Welt ohne.
   *
   * Beide Werte stehen auch in `STUECKE` (`music.ts`), weil das Weltstueck
   * dort abgenommen ist. Dass sie nicht auseinanderlaufen, haelt ein Test
   * fest: Level 1 jeder Welt muss das abgenommene Weltstueck ergeben.
   */
  bpm: number;
  grund: number;
  melodieStimme: StimmName;
  /** Antwortstimmen, andere Familie als die fuehrende. Eintrag 0 = abgenommen. */
  zweitStimmen: readonly [StimmName, StimmName];
  harmonieStimmen: readonly [HarmonieStimme, HarmonieStimme];
  sfxStufen: readonly number[];
  fanfareGrund: number;
}

export const WELTEN: Record<string, Welt> = {
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
    // Hier stand `okarina` — zwei geblasene Stimmen, der Stimmwechsel im
    // zweiten Umlauf war damit kaum zu hoeren. Stimmen sind ausdruecklich nicht
    // abgenommen (`docs/musik-abnahme.md` §1), also wird das hier berichtigt;
    // `STUECKE.wipfel` ist mitgezogen.
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
// 5. Textur und Bogen — was ausserhalb des Notentexts je Level wechselt
// ===========================================================================

/**
 * Sechzehntelfiguren. Alle nur Grundton/Quinte/Oktave und hoechstens +12 —
 * die Terz bleibt draussen, weil dieselbe Figur ueber Dur, dorisch,
 * mixolydisch, aeolisch und phrygisch laeuft (siehe `ARPEGGIO` in `music.ts`).
 * Eintrag 0 ist die abgenommene laufende Figur.
 */
export const ARPEGGIEN: readonly (readonly number[])[] = [
  [0, 7, 12, 7, 0, 7, 12, 7], // abgenommen — die laufende Figur von heute
  [0, 12, 7, 12, 0, 12, 7, 12],
  [0, 7, 0, 12, 7, 0, 12, 7],
  [12, 7, 0, 7, 12, 7, 0, 7],
];

/** Auf welchen Achteln die gezupfte Harmonie steht. Eintrag 0 ist abgenommen. */
export const HARMONIESTELLEN: readonly (readonly number[])[] = [
  [1, 5], // abgenommen — die unbetonten Haelften der ersten und dritten Viertel
  [1, 3, 5, 7],
];

/** Ein Umlauf der Achttaktschleife — siehe `DURCHGAENGE` in `music.ts`. */
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

/**
 * Der grosse Bogen ueber vier Umlaeufe. Feste Punkte in jedem Plan, damit die
 * bestehenden Abnahmen gelten: Umlauf 0 fuehrende Stimme, Umlauf 1
 * Zweitstimme, Bruch in Umlauf 2, keine zwei benachbarten Umlaeufe gleich.
 * Eintrag 0 ist der abgenommene Plan (`DURCHGAENGE` in `music.ts`).
 */
export const BOGENPLAENE: readonly (readonly Durchgang[])[] = [
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
// 6. Zusammenklang: die Pruefung, die die Montage steuert
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
        farbe === 2 ||
        farbe === 9 || // 1. Sekunde oder Sexte ueber der Wurzel
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

/** Die hoechste Frequenz, die die Flaeche zu dieser Kadenz spielt, in Halbtoenen. */
function harmonieSpitze(
  akkorde: readonly number[],
  farbe: readonly number[],
  leiter: readonly number[],
): number {
  let hoch = Math.max(...akkorde);
  for (const wurzel of akkorde) {
    for (const stufe of farbe) hoch = Math.max(hoch, farbTon(wurzel, stufe, leiter));
  }
  return hoch;
}

// ===========================================================================
// 7. Die Montage
// ===========================================================================

/**
 * Ein fertiges Stueck. Dieselbe Form, die `STUECKE` in `music.ts` von Hand
 * fuellt — die Weltstuecke und die montierten sind austauschbar, und genau
 * deshalb muss `music.ts` nicht wissen, woher sein Stueck kommt.
 */
export interface Stueck {
  melodie: readonly Note[];
  /** Akkordgrundton je Takt, in Halbtoenen. */
  akkorde: readonly number[];
  /**
   * Die sieben Stufen des Modus, in Halbtoenen ueber dem Grundton.
   *
   * Sie steht hier, weil die Harmoniespur sie braucht: Ihre Zusatztoene zaehlen
   * in Leiterstufen, nicht in Halbtoenen (siehe `farbTon`).
   */
  leiter: readonly number[];
  /**
   * Zusatzstufen der Flaeche — **LEITERSTUFEN** ueber der Akkordwurzel, nicht
   * Halbtoene. Der Unterschied ist keine Formalie, sondern die Behebung eines
   * gemessenen Fehlers; die Rechnung steht bei `farbTon`.
   */
  farbe: readonly number[];
  bpm: number;
  /** Frequenz des Grundtons. */
  grund: number;
  /**
   * Wer die Melodie **haelt**, und wer sie im naechsten Umlauf uebernimmt.
   *
   * Zwei Stimmen statt einer, und das ist die Antwort auf „zu eintoenig". Eine
   * Achttaktschleife, die immer gleich klingt, wird nach dem dritten Umlauf zur
   * Tapete — nicht weil die Melodie schlecht waere, sondern weil **nichts
   * passiert**. In einem Orchester gibt man die Melodie in der Wiederholung
   * weiter; genau das tut `DURCHGAENGE` in `music.ts`.
   *
   * `melodieStimme` fuehrt, `zweitStimme` antwortet. Sie muessen sich hoerbar
   * unterscheiden, sonst ist der Wechsel keiner — gepaart sind deshalb eine
   * obertonreiche (gestrichen) und eine obertonarme (geblasen), siehe
   * `familieVon`.
   */
  melodieStimme: StimmName;
  zweitStimme: StimmName;
  harmonieStimme: HarmonieStimme;
  /**
   * Die Fuenftonleiter, in der die **Geraeusche** dieser Welt stehen.
   *
   * Bisher hingen alle Spielgeraeusche fest an C-Dur pentatonisch. Bei den
   * ersten zwei Welten ging das gut, aber nur durch einen Zufall: Die
   * C-Pentatonik (C D E G A) liegt vollstaendig in A-dorisch. Bei der dritten
   * Welt haelt der Zufall nicht mehr, und der Fehler ist einer von der leisen
   * Sorte — man hoert nur, dass etwas nicht stimmt, ohne zu wissen, was.
   *
   * Deshalb bringt jedes Stueck seine eigene Leiter mit, und `tonart()` reicht
   * sie an `sfx.ts` und `stinger.ts` weiter. Abgesichert durch einen Test:
   * **Jede Stufe muss ein Ton sein, den die Melodie selbst benutzt** — dann
   * kann eine Geraeuschleiter gar nicht neben ihrem Stueck stehen. Bei einem
   * montierten Stueck ist das keine Selbstverstaendlichkeit mehr, sondern eine
   * Bedingung an die Montage: siehe `deckt`.
   */
  sfxStufen: readonly number[];
  /**
   * Grundton der Fanfare, in Halbtoenen ueber `grund`.
   *
   * Eine Fanfare muss in Dur stehen, sonst ist sie kein Sieg. Bei einem Stueck
   * in Dur ist das der Grundton selbst; bei einem in Moll, dorisch oder
   * phrygisch die **Paralleltonart** — der Ton drei Halbtoene darueber.
   */
  fanfareGrund: number;
  /** Sechzehntelfigur; fehlt sie, gilt `ARPEGGIO` aus `music.ts`. */
  arpeggio?: readonly number[];
  /** Achtel mit gezupfter Harmonie; fehlen sie, gilt `HARMONIE_STELLEN`. */
  harmonieStellen?: readonly number[];
  /** Bogen ueber vier Umlaeufe; fehlt er, gilt `DURCHGAENGE`. */
  bogen?: readonly Durchgang[];
  /**
   * Das Thema, zu dem dieses Stueck gehoert. Montierte Stuecke tragen es immer;
   * bei den Weltstuecken in `STUECKE` steht es im Schluessel der Tabelle und
   * waere hier eine zweite, ungepflegte Angabe — deshalb wahlfrei.
   */
  theme?: string;
  /* --- Diagnose. Sie kostet nichts und beantwortet die erste Frage, die man
     bei einem montierten Stueck hat: woraus wurde es gebaut? --- */
  form?: string;
  wahl?: Record<string, number>;
  /** Wie weit die Deckungspflicht die Bausteine weiterruecken musste. */
  deckungsRepair?: number;
  /**
   * Ob die Deckungspflicht auch die Ableitung des Mittelteils weiterruecken
   * musste (0 = nein). Siehe die Rotation in `montiere`.
   */
  ableitungsRepair?: number;
  /** Wie viele Takte eine andere Akkordwurzel bekamen. */
  kadenzRepair?: number;
  /** Wie viele auffaellige Taktgrenzen die Fugenregel eingespart hat. */
  fugenRepair?: number;
}

function hash32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Der Zaehler des Levels: 0 fuer das erste Level einer Welt.
 *
 * Eine Id, die nicht dem Muster `w<Welt>-<Nummer>` folgt, bekommt einen Platz
 * aus ihrem Streuwert. Damit ist auch ein Testlevel oder ein spaeter
 * umbenanntes Level klanglich versorgt, ohne dass irgendwo etwas abstuerzt —
 * es steht dann eben nicht in der Reihe, sondern irgendwo darin.
 */
export function zaehler(levelId: string): number {
  const m = /^w\d+-(\d+)$/.exec(levelId);
  return m ? parseInt(m[1], 10) - 1 : hash32(levelId) % 60;
}

/** Baut die acht Takte aus den Motiven. */
export function baueTakte(
  f: Familie,
  form: Form,
  wRot: number,
  wFolge: readonly number[],
  aRot: number,
  mIdx: number,
  lIdx: number,
  sIdx: number,
  krIdx: number,
  opA: number,
  opM: number,
): Takt[] {
  const bars: Takt[] = [];
  let kZahl = 0;
  let aZahl = 0;
  let mTeil = 0;
  // Der Kopf: Tonhoehen unveraendert, Laengen aus dem gewaehlten Muster.
  const rhy = f.kopfRhythmen[krIdx % f.kopfRhythmen.length];
  const kopf: Takt = f.kopf.map((n, i) => [n[0], rhy[i]] as Note);
  for (const slot of form.slots) {
    if (slot === 'K') {
      const wi = (wFolge[kZahl % wFolge.length] + wRot) % f.wendungen.length;
      bars.push([...kopie(kopf), [f.wendungen[wi], TAKT - rhy.reduce((a, b) => a + b, 0)] as Note]);
      kZahl++;
    } else if (slot === 'A') {
      bars.push(leiteOderUr(f.antworten[(aRot + aZahl) % f.antworten.length], opA, f.leiter));
      aZahl++;
    } else if (slot === 'M') {
      // Das Paar ist eine Einheit: geht die Ableitung fuer einen der beiden
      // Takte nicht auf, bleiben beide in der Urgestalt. Ein halb verschobener
      // Mittelteil waere zwei Motive statt einem.
      const paar = f.mittel[mIdx];
      const beide = paar.every((b) => leite(b, ABLEITUNGEN[opM], f.leiter) !== null);
      bars.push(beide ? leiteOderUr(paar[mTeil], opM, f.leiter) : kopie(paar[mTeil]));
      mTeil++;
    } else if (slot === 'L') {
      bars.push(leiteOderUr(f.laeufe[lIdx], opM, f.leiter));
    } else {
      // Der Schluss wird nie abgeleitet: er muss auf dem Grundton landen.
      bars.push(kopie(f.schluesse[sIdx]));
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
 * Die Montage. `idx` sind die sechzehn Stellen des Odometers; `stueckFuer`
 * rechnet sie aus der Level-Id aus.
 *
 * Unbekanntes Thema faellt auf `grass` zurueck. Die Musik ist die einzige
 * Schicht, die stumm bleiben darf — abstuerzen darf sie nicht.
 */
export function montiere(theme: string, idx: readonly number[]): Stueck {
  const wName = WELTEN[theme] ? theme : 'grass';
  const w = WELTEN[wName];
  const f = FAMILIEN[w.familie];
  const [iForm, iW, iA, iM, iL, iS, iK, iFarbe, iKr, iOpA, iOpM,
         iArp, iHst, iZweit, iHarm, iBogen] = idx;
  const form = FORMEN[w.formen[iForm]];
  const farbe = f.farben[iFarbe];

  // --- 1. Kadenzen, die diese Welt tragen darf ------------------------------
  //
  // Die Trennung der Frequenzbaender ist die Zusage, an der das ganze
  // Klangbild haengt: Begleitung unter 800 Hz, Melodie darueber. Eine Kadenz,
  // deren hoechste Wurzel die Figur oder die Flaeche darueber hebt, kommt
  // deshalb gar nicht in die Auswahl — nicht erst in die Pruefung.
  const erlaubt = f.kadenzen.filter((kad) => {
    const maxA = Math.max(...kad);
    // Die Sechzehntelfigur reicht bis Wurzel + max(ARPEGGIO) = +12.
    if (w.grund * Math.pow(2, (maxA + 12) / 12) >= 800) return false;
    // Die Harmonie laeuft auch im Endspurt, also einen Halbton hoeher.
    if (w.grund * Math.pow(2, (harmonieSpitze(kad, farbe, f.leiter) + 1) / 12) >= 800) return false;
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
  // Lauf, dann der Schluss weiter. Fugenregel: sind drei oder mehr Taktgrenzen
  // auffaellig, wird unter den uebrigen tauglichen Kandidaten der erste mit
  // weniger Auffaelligkeiten genommen. Beides deterministisch und endlich.
  const sammle = (opM: number) => {
    const raus: { bars: Takt[]; schritt: number }[] = [];
    for (let ds = 0; ds < f.schluesse.length; ds++) {
      for (let dl = 0; dl < f.laeufe.length; dl++) {
        for (let dm = 0; dm < f.mittel.length; dm++) {
          const b = baueTakte(
            f, form, iW, w.wendungFolge, iA,
            (iM + dm) % f.mittel.length,
            (iL + dl) % f.laeufe.length,
            (iS + ds) % f.schluesse.length,
            iKr, iOpA, opM,
          );
          if (deckt(b, w, kadErst)) raus.push({ bars: b, schritt: dm + dl + ds });
        }
      }
    }
    return raus;
  };
  let kandidaten = sammle(iOpM);
  // Und eine vierte Rotation, wenn die drei ersten nicht reichen: die
  // ABLEITUNG des Mittelteils.
  //
  // Gemessener Fall, wegen dem das hier steht: Im Schlot (phrygisch) tragen nur
  // Mittelteil und Lauf die kleine Septime, und die Geraeuschleiter braucht sie
  // (`sfxStufen` hat die 10, der Fanfarendreiklang auf der Paralleltonart
  // ebenfalls). Verschiebt die Sequenz das Material eine Stufe nach UNTEN,
  // faellt sie aus jedem Baustein heraus — drei der fuenfzehn Level (w5-02,
  // w5-10, w5-15) hatten danach kein einziges C mehr, und damit standen alle
  // Spielgeraeusche neben ihrer eigenen Musik. Genau der Fehler, den
  // `sfxStufen` einmal hatte.
  //
  // Die Reihenfolge ist wichtig: Erst wird die gewaehlte Ableitung erschoepft,
  // und nur wenn sie GAR NICHTS Taugliches liefert, ruecken die uebrigen nach.
  // Jedes Level, dessen Ableitung traegt, bleibt damit Note fuer Note dasselbe —
  // auch Level 1 und sein abgenommenes Weltstueck.
  let ableitungsRepair = 0;
  for (let dop = 1; !kandidaten.length && dop < ABLEITUNGEN.length; dop++) {
    kandidaten = sammle((iOpM + dop) % ABLEITUNGEN.length);
    if (kandidaten.length) ableitungsRepair = dop;
  }
  let bars: Takt[];
  let deckungsRepair: number;
  let fugenRepair = 0;
  if (!kandidaten.length) {
    bars = baueTakte(f, form, iW, w.wendungFolge, iA, iM, iL, iS, iKr, iOpA, iOpM);
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
    leiter: f.leiter,
    farbe,
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
    theme: wName,
    form: form.name,
    wahl: {
      form: iForm, w: iW, a: iA, m: iM, l: iL, s: iS, kad: iK, farbe: iFarbe,
      kr: iKr, opA: iOpA, opM: iOpM,
      arp: iArp, hst: iHst, zweit: iZweit, harm: iHarm, bogen: iBogen,
    },
    deckungsRepair,
    ableitungsRepair,
    kadenzRepair,
    fugenRepair,
  };
}

/** Die elf Stellen, die den Notentext bestimmen — je Welt ihre Groessen. */
function notenStellen(theme: string): number[] {
  const w = WELTEN[theme];
  const f = FAMILIEN[w.familie];
  return [
    w.formen.length, f.wendungen.length, f.antworten.length, f.mittel.length,
    f.laeufe.length, f.schluesse.length, f.kadenzen.length, f.farben.length,
    f.kopfRhythmen.length, ABLEITUNGEN.length, ABLEITUNGEN.length,
  ];
}

const ggT = (a: number, b: number): number => (b === 0 ? a : ggT(b, a % b));

/**
 * Die Schrittweite, mit der die Level den Notenraum abschreiten.
 *
 * Ein einfaches Odometer (jede Stelle `k mod n`) hat einen stillen Fehler:
 * Stellen mit gleicher Groesse laufen fuer immer im Gleichschritt. Bei fuenf
 * Bankgroessen von 3 heisst das, dass Mittelteil, Lauf, Schluss, Kadenz und
 * Farbe nie unabhaengig voneinander wechseln — von neun moeglichen Paaren
 * kommen drei vor.
 *
 * Stattdessen: eine Schrittweite auf dem GANZEN Raum, teilerfremd zu ihm. Das
 * ist eine Bijektion, besucht also jeden Punkt genau einmal, und mischt alle
 * Stellen gegeneinander. Die Groessenordnung 0,618 ist kein Aberglaube: eine
 * kleine Schrittweite laesst die hohen Stellen fuer die ersten hundert Level
 * auf null stehen.
 */
function schrittweite(raum: number): number {
  let s = Math.floor(raum * 0.6180339887);
  if (s % 2 === 0) s--;
  while (s > 1 && ggT(s, raum) !== 1) s -= 2;
  return Math.max(1, s);
}

/**
 * Das Stueck eines Levels. **Reine Funktion der Level-Id** — kein Math.random.
 *
 * `k = 0` liefert den Punkt null und damit das abgenommene Weltstueck. Die
 * fuenf Stellen, die nicht am Notentext haengen (Figur, Harmoniedichte,
 * Zweitstimme, Harmoniestimme, Bogen), laufen weiter als einfaches Odometer:
 * sie sind klein, sie sollen bei JEDEM Level wechseln, und ihr Gleichschritt
 * ist hoerbar als Wechsel der Textur, nicht als Armut.
 *
 * Zwei Level einer Welt fallen erst nach dem kleinsten gemeinsamen Vielfachen
 * aller Bankgroessen zusammen — im gebauten Ausbau also nie.
 */
/**
 * Wo eine Welt im Notenraum ihrer Familie ANFAENGT.
 *
 * Drei Welten teilen die gruene Familie — Grasland, Sonnenhang und
 * Wipfelweide —, und ihr abgenommenes Weltstueck ist bei allen drei dasselbe
 * Notentext: Sie trennen sich ueber Tempo, Tonart und Instrumentierung, nicht
 * ueber die Melodie (siehe `ThemeId` in `levels/types.ts`: „durch das LICHT,
 * nicht durch die Grundfarbe").
 *
 * Ohne Versatz hat das eine Folge, die beim Messen aufgefallen ist: Das erste
 * Level des Sonnenhangs steht auf demselben Punkt null wie das erste Level des
 * Graslands und spielt damit Note fuer Note dieselbe Melodie — die
 * Eroeffnungsmelodie des ganzen Spiels, nur in anderer Tonart. Wer nach
 * fuenfundfuenfzig Leveln den Sonnenhang betritt, hoert als Erstes wieder
 * Level eins.
 *
 * Der Versatz schiebt die nachfolgenden Welten einer Familie hinter den
 * Bereich der fuehrenden. Grasland belegt Punkt 0 bis 13 (vierzehn Level),
 * Sonnenhang beginnt bei 20, die Wipfelweide bei 40 — mit Luft fuer je
 * siebzehn Level und Reserve. Weil die Schrittweite eine Bijektion auf dem
 * Notenraum ist, heisst „verschiedener Zaehler" damit ausnahmslos
 * „verschiedenes Stueck".
 *
 * Der Preis ist ehrlich zu benennen: Nur die fuehrende Welt einer Familie
 * spielt in ihrem ersten Level das abgenommene Weltstueck. Bei den beiden
 * anderen waere diese Zusage ohnehin leer — ihr abgenommenes Stueck IST das
 * der fuehrenden.
 */
const THEMA_VERSATZ: Record<string, number> = {
  grass: 0,
  crystal: 0,
  rust: 0,
  frost: 0,
  magma: 0,
  sonnenhang: 20,
  wipfel: 40,
};

export function stueckFuer(levelId: string, theme: string): Stueck {
  const th = WELTEN[theme] ? theme : 'grass';
  const k = zaehler(levelId) + (THEMA_VERSATZ[th] ?? 0);
  const n = notenStellen(th);
  const raum = n.reduce((a, b) => a * b, 1);
  let code = ((k % raum) * (schrittweite(raum) % raum)) % raum;
  const idx: number[] = [];
  for (const m of n) {
    idx.push(code % m);
    code = Math.floor(code / m);
  }
  return montiere(th, [
    ...idx,
    k % ARPEGGIEN.length,
    k % HARMONIESTELLEN.length,
    k % WELTEN[th].zweitStimmen.length,
    k % WELTEN[th].harmonieStimmen.length,
    k % BOGENPLAENE.length,
  ]);
}

// ===========================================================================
// 8. Die Pruefung — jedes Gesetz der Klangschicht an einem Stueck
// ===========================================================================

/**
 * Prueft ein Stueck gegen die Gesetze, die `docs/musik-abnahme.md` und
 * `docs/klangdesign.md` festhalten. Leere Liste heisst: tragfaehig.
 *
 * Der Sinn ist nicht, ein Urteil ueber Schoenheit zu faellen — das kann kein
 * Test. Der Sinn ist, dass ein montiertes Stueck dieselben Zusagen einhaelt
 * wie ein von Hand geschriebenes: Taktraster, Wiederkehr, Atempausen,
 * Frequenzbaender, Geraeuschleiter, Fanfarendreiklang.
 */
export function pruefe(p: Stueck): string[] {
  const fe: string[] = [];
  const t = toene(p.melodie);
  const arpeggio = p.arpeggio ?? ARPEGGIEN[0];
  const bogen = p.bogen ?? BOGENPLAENE[0];

  // A1 — die Sechzehntelfigur meidet die Terz
  for (const h of arpeggio) if (![0, 7].includes(kl(h))) fe.push(`A1 ${h}`);
  // A2 — sie bleibt unter dem Fenster der Melodie
  const arp = p.grund * Math.pow(2, (Math.max(...p.akkorde) + Math.max(...arpeggio)) / 12);
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
  // C9' — und aus einer anderen Familie, sonst ist der Stimmwechsel keiner
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
  const harm = p.grund * Math.pow(2, (harmonieSpitze(p.akkorde, p.farbe, p.leiter) + 1) / 12);
  if (harm >= 800) fe.push(`E3 Harmonie ${harm.toFixed(0)} Hz`);
  // E3 — Oktavdopplung der Melodie unter 3 kHz
  const spitze = p.grund * Math.pow(2, Math.max(...t) / 12 + 2);
  if (spitze >= 3000) fe.push(`E3 Melodiespitze ${spitze.toFixed(0)} Hz`);
  // F6 — Bass nicht unter die Welt. Nur pruefbar, wenn das Stueck seine Welt
  // kennt; fuer ein Weltstueck ist die Aussage ohnehin leer, denn es setzt den
  // Boden selbst.
  const welt = p.theme ? WELTEN[p.theme] : undefined;
  if (welt) {
    const weltTief = Math.min(...FAMILIEN[welt.familie].kadenzen[0]);
    if (Math.min(...p.akkorde) < weltTief) fe.push('F6 Bass');
  }
  // C11 — keine zwei benachbarten Durchgaenge gleich
  for (let i = 0; i < bogen.length; i++) {
    const a = JSON.stringify(bogen[i]);
    const b = JSON.stringify(bogen[(i + 1) % bogen.length]);
    if (a === b) fe.push(`C11 Umlauf ${i}`);
  }
  // C9/C10 — feste Punkte im Bogen
  if (!bogen[0].haupt || bogen[1].haupt) fe.push('C9 Stimmwechsel');
  if (!bogen[2].bruch || bogen[0].bruch) fe.push('C10 Bruch');
  // Die Flaechenfarbe ist modus-eigen. Mit Farbe in Leiterstufen kann das nur
  // noch schiefgehen, wenn eine Akkordwurzel selbst nicht auf der Leiter liegt
  // — genau dann greift der Rueckfall in `farbTon`, und der rechnet wieder in
  // festen Halbtoenen. Also gepruefen, nicht vorausgesetzt.
  for (const wurzel of p.akkorde) {
    for (const stufe of p.farbe) {
      const h = farbTon(wurzel, stufe, p.leiter);
      if (!p.leiter.includes(kl(h))) fe.push(`Farbe ${h} ueber ${wurzel} nicht im Modus`);
    }
  }
  return fe;
}
