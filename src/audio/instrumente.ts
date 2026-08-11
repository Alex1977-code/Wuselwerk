import type { AudioEngine } from './engine';

/**
 * Die Klangfarben des Spiels.
 *
 * ## Warum synthetisiert und nicht gesampelt
 *
 * Der Prototyp laedt nichts nach — sonst zerfaellt die Einzeldatei, die man
 * ohne Server aufs Handy bekommt. Gesampelte Marimba, Kalimba oder Akkordeon
 * scheiden damit aus. Was bleibt, ist mehr, als es klingt: Marimba, Kalimba,
 * Glockenspiel, Steeldrum und Pizzicato sind allesamt **kurz anklingende
 * Toene**, und genau die baut ein Synthesizer gut. Ein Akkordeon oder eine
 * Klarinette waeren schwieriger; die stehen deshalb nicht in dieser Liste.
 *
 * ## Woran man ein Instrument erkennt
 *
 * Nicht an der Grundfrequenz — die ist bei allen dieselbe. Es sind drei andere
 * Dinge, und die stehen bei jedem Eintrag unten als Begruendung:
 *
 * 1. **Die Huellkurve.** Ein Anschlag ohne Anstieg und mit schnellem Abfall ist
 *    ein Stab; ein weicher Anstieg mit Halten ist ein Blasinstrument.
 * 2. **Die Obertoene.** Eine Marimba hat einen kraeftigen Ton bei der vierten
 *    Oktave (Faktor 4), eine Steeldrum unharmonische Teiltoene, eine Glocke
 *    einen schwebenden bei Faktor 2,76 — daher ihr metallischer Klang.
 * 3. **Das Geraeusch am Anfang.** Ein Zupfer hat ein Fingergeraeusch, eine
 *    Panfloete Anblasrauschen. Ohne das klingt jede Synthese wie eine Orgel.
 */

export interface TonOpts {
  /** Grundfrequenz in Hertz. */
  freq: number;
  /** Laenge in Sekunden. Kurz anklingende Instrumente ignorieren sie teils. */
  dur?: number;
  gain?: number;
  delay?: number;
  bus?: 'sfx' | 'music';
  /** Sperrt die Stimmenbegrenzung aus — fuer Musik, die nie ausfallen darf. */
  fest?: boolean;
}

type E = AudioEngine;

/** Gemeinsame Vorgaben, damit jeder Eintrag unten nur noch das Eigene setzt. */
function o(t: TonOpts) {
  return {
    delay: t.delay ?? 0,
    bus: t.bus ?? ('music' as const),
    ignoreLimit: t.fest ?? true,
  };
}

/**
 * Marimba — Holzstab ueber einer Roehre.
 *
 * Der Kern ist der Oberton bei Faktor 4 (zwei Oktaven ueber dem Grundton): Ein
 * Holzstab schwingt so, und ohne diesen Ton klingt jedes Stabspiel wie eine
 * Floete. Der Anschlag ist ein sehr kurzes Rauschen — das ist der Schlaegel.
 */
export function marimba(e: E, t: TonOpts): void {
  const g = t.gain ?? 0.14;
  const d = t.dur ?? 0.42;
  e.tone({ freq: t.freq, dur: d, type: 'sine', gain: g, attack: 0.004, ...o(t) });
  e.tone({ freq: t.freq * 4, dur: d * 0.3, type: 'sine', gain: g * 0.34, attack: 0.002, ...o(t) });
  e.tone({ freq: t.freq * 9.2, dur: d * 0.1, type: 'sine', gain: g * 0.1, attack: 0.001, ...o(t) });
  e.noise({ dur: 0.014, gain: g * 0.3, filter: 'bandpass', freq: t.freq * 6, q: 1.2, ...o(t) });
}

/**
 * Kalimba — Daumenklavier, Metallzunge auf Holz.
 *
 * Wie die Marimba, aber mit einem stark hoerbaren Oberton bei Faktor 6 und
 * einem laengeren Ausklang: Metall haelt, Holz nicht. Das Zupfgeraeusch ist
 * heller und kuerzer als der Marimba-Schlaegel.
 */
export function kalimba(e: E, t: TonOpts): void {
  const g = t.gain ?? 0.13;
  const d = t.dur ?? 0.55;
  e.tone({ freq: t.freq, dur: d, type: 'sine', gain: g, attack: 0.003, ...o(t) });
  e.tone({ freq: t.freq * 6, dur: d * 0.22, type: 'sine', gain: g * 0.26, attack: 0.001, ...o(t) });
  e.noise({ dur: 0.01, gain: g * 0.24, filter: 'highpass', freq: 3200, ...o(t) });
}

/**
 * Glockenspiel — Metallstab, sehr hell.
 *
 * Der Ton bei Faktor 2,76 ist der Grund, warum eine Glocke nach Glocke klingt:
 * Er passt in keine Oktave und erzeugt das typische Schweben. Langer Ausklang,
 * fast kein Anschlagsgeraeusch.
 */
export function glocke(e: E, t: TonOpts): void {
  const g = t.gain ?? 0.1;
  const d = t.dur ?? 0.9;
  e.tone({ freq: t.freq * 2, dur: d, type: 'sine', gain: g, attack: 0.002, ...o(t) });
  e.tone({ freq: t.freq * 2 * 2.76, dur: d * 0.6, type: 'sine', gain: g * 0.4, attack: 0.002, ...o(t) });
  e.tone({ freq: t.freq * 2 * 5.4, dur: d * 0.25, type: 'sine', gain: g * 0.16, attack: 0.001, ...o(t) });
}

/**
 * Steeldrum — angeschlagenes Blech.
 *
 * Zwei Teiltoene dicht nebeneinander (Faktor 2 und 2,02) erzeugen eine
 * langsame Schwebung; das ist der Klang eines gehaemmerten Blechs. Dazu ein
 * kurzer Anschlag mit viel Hoehe.
 */
export function steeldrum(e: E, t: TonOpts): void {
  const g = t.gain ?? 0.12;
  const d = t.dur ?? 0.5;
  e.tone({ freq: t.freq, dur: d, type: 'sine', gain: g, attack: 0.005, ...o(t) });
  e.tone({ freq: t.freq * 2, dur: d * 0.7, type: 'sine', gain: g * 0.5, attack: 0.004, ...o(t) });
  e.tone({ freq: t.freq * 2.02, dur: d * 0.7, type: 'sine', gain: g * 0.4, attack: 0.004, ...o(t) });
  e.noise({ dur: 0.02, gain: g * 0.3, filter: 'bandpass', freq: 3600, q: 0.8, ...o(t) });
}

/**
 * Pizzicato — gezupfte Saite.
 *
 * Saegezahn durch einen Tiefpass, der sich sofort schliesst: Genau das tut eine
 * gezupfte Saite, sie verliert ihre Hoehen zuerst. Sehr kurz, sonst wird ein
 * Streicherton daraus.
 */
export function pizzicato(e: E, t: TonOpts): void {
  const g = t.gain ?? 0.13;
  const d = t.dur ?? 0.2;
  e.tone({
    freq: t.freq, dur: d, type: 'sawtooth', gain: g, attack: 0.002,
    filterHz: t.freq * 7, filterSweep: 0.22, ...o(t),
  });
  e.noise({ dur: 0.012, gain: g * 0.22, filter: 'highpass', freq: 2400, ...o(t) });
}

/**
 * Ukulele — gezupft, aber mit Nylonsaiten-Weichheit.
 *
 * Wie Pizzicato, nur mit Dreieck statt Saegezahn (weniger scharfe Obertoene)
 * und laengerem Ausklang. Zwei leicht verstimmte Stimmen: Eine Ukulele hat
 * doppelte Saiten, und ohne die Verstimmung klingt sie tot.
 */
export function ukulele(e: E, t: TonOpts): void {
  const g = t.gain ?? 0.1;
  const d = t.dur ?? 0.3;
  for (const stimmung of [1, 1.004]) {
    e.tone({
      freq: t.freq * stimmung, dur: d, type: 'triangle', gain: g * 0.6, attack: 0.004,
      filterHz: t.freq * 9, filterSweep: 0.35, ...o(t),
    });
  }
  e.noise({ dur: 0.01, gain: g * 0.2, filter: 'highpass', freq: 2800, ...o(t) });
}

/**
 * Panfloete — angeblasene Roehre.
 *
 * Das Anblasrauschen ist hier nicht Zierrat, sondern das Erkennungszeichen:
 * Ohne den Rauschstoss am Anfang klingt eine gefilterte Dreieckswelle wie eine
 * Orgel. Weicher Anstieg, Ton haelt.
 */
export function panfloete(e: E, t: TonOpts): void {
  const g = t.gain ?? 0.11;
  const d = t.dur ?? 0.4;
  e.tone({ freq: t.freq, dur: d, type: 'triangle', gain: g, attack: 0.045, ...o(t) });
  e.noise({ dur: Math.min(0.09, d), gain: g * 0.34, filter: 'bandpass', freq: t.freq * 2.2, q: 0.9, ...o(t) });
}

/**
 * Bass — federnd, kurz, mit Fundament bei 150 bis 250 Hz.
 *
 * Bewusst nicht tiefer: Was unter 150 Hz liegt, gibt ein Handylautsprecher
 * nicht wieder, und der Hochpass vor dem Ausgang nimmt es ohnehin heraus. Der
 * Oberton eine Oktave darueber traegt den Ton auf kleinen Lautsprechern.
 */
export function bass(e: E, t: TonOpts): void {
  const g = t.gain ?? 0.24;
  const d = t.dur ?? 0.24;
  e.tone({ freq: t.freq, dur: d, type: 'triangle', gain: g, attack: 0.008, ...o(t) });
  e.tone({ freq: t.freq * 2, dur: d * 0.6, type: 'sine', gain: g * 0.3, attack: 0.006, ...o(t) });
}

/**
 * Quadratwelle als duenne Achtbit-Ebene.
 *
 * Nach Vorgabe **nie Hauptstimme**, immer Verdoppelung: Sie liegt eine Oktave
 * ueber der Melodie und traegt nur die Kante. Allein klaenge sie nach
 * Klingelton, unter einer Marimba nach Amiga.
 */
export function chip(e: E, t: TonOpts): void {
  const g = t.gain ?? 0.045;
  e.tone({ freq: t.freq * 2, dur: t.dur ?? 0.16, type: 'square', gain: g, attack: 0.002, ...o(t) });
}

/** Holzblock — trockener Klopfer fuer den Takt. */
export function woodblock(e: E, t: TonOpts): void {
  const g = t.gain ?? 0.1;
  e.tone({ freq: t.freq, dur: 0.035, type: 'square', gain: g, slide: 0.5, ...o(t) });
  e.noise({ dur: 0.02, gain: g * 0.5, filter: 'bandpass', freq: t.freq * 3, q: 2, ...o(t) });
}

/** Schuettelrohr — Rauschen statt Becken, damit es auf dem Handy nicht zischt. */
export function shaker(e: E, t: TonOpts): void {
  e.noise({
    dur: 0.045, gain: t.gain ?? 0.05, filter: 'highpass', freq: 5200, sweep: 0.7, ...o(t),
  });
}

/** Uhrentick — die Ebene, die bei knapper Zeit dazukommt. */
export function tick(e: E, t: TonOpts): void {
  const g = t.gain ?? 0.08;
  e.noise({ dur: 0.015, gain: g, filter: 'bandpass', freq: 2600, q: 3, ...o(t) });
  e.tone({ freq: 1800, dur: 0.02, type: 'square', gain: g * 0.5, ...o(t) });
}
