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
 * Toene**, und genau die baut ein Synthesizer gut.
 *
 * ## Warum es hier auch Blasinstrumente gibt
 *
 * Weil eine Liste aus lauter kurz anklingenden Toenen keine Melodie tragen
 * kann. Jeder dieser Klaenge ist ein Punkt; eine Melodie braucht eine Linie.
 * Solange die Klangwerkstatt nur abfallende Huellkurven konnte, war das nicht
 * zu haben, und die Musik hat vor sich hin gepiekst. Seit `tone()` einen Ton
 * **halten** kann (`hold`), sind Klarinette und Akkordeon moeglich — und die
 * sind der Grund, warum man die Melodie jetzt mitsummen kann.
 *
 * Die Arbeitsteilung dabei ist die aus jedem Orchester: Ein Stabspiel gibt den
 * Anschlag, die Blasstimme haelt den Ton. Zusammen klingen sie nach einem
 * Instrument mit Anschlag *und* Koerper, was keines von beiden allein kann.
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
  e.tone({
    freq: t.freq, dur: d, type: 'triangle', gain: g, attack: 0.045,
    hold: 0.6, vibratoHz: 5.4, vibratoCents: 9, ...o(t),
  });
  e.noise({ dur: Math.min(0.09, d), gain: g * 0.34, filter: 'bandpass', freq: t.freq * 2.2, q: 0.9, ...o(t) });
}

/**
 * Klarinette — die Stimme, die eine Melodie tragen kann.
 *
 * 1. **Huellkurve.** Sie **haelt** (`hold: 0.72`). Das ist der ganze
 *    Unterschied zu allem darueber: Eine gehaltene Note verbindet sich mit der
 *    naechsten zu einer Linie, eine abfallende bleibt ein Punkt.
 * 2. **Teiltoene.** Eine gedackte Roehre — an einem Ende geschlossen — hat nur
 *    die *ungeraden* Teiltoene. Genau die hat eine Rechteckwelle, und genau
 *    daher kommt der hohle, etwas naeselnde Klang, an dem man eine Klarinette
 *    ohne Nachdenken erkennt. Der Tiefpass nimmt die obersten Teiltoene weg,
 *    die eine Rechteckwelle zu viel hat.
 * 3. **Anblasen und Vibrato.** Ein Rauschstoss beim Ansatz, danach ein
 *    langsames Vibrato von knapp fuenf Hertz. Ohne beides klingt die
 *    Rechteckwelle nach Spielzeug — das ist der Grund, warum eine Achtbit-Ebene
 *    nie Hauptstimme sein darf und diese Stimme es kann.
 */
export function klarinette(e: E, t: TonOpts): void {
  const g = t.gain ?? 0.11;
  const d = t.dur ?? 0.4;
  e.tone({
    freq: t.freq, dur: d, type: 'square', gain: g * 0.62, attack: 0.035,
    hold: 0.72, filterHz: t.freq * 3.2, filterSweep: 1.1,
    vibratoHz: 4.7, vibratoCents: 11, ...o(t),
  });
  // Eine Dreieckswelle darunter fuellt den Grundton auf. Eine Rechteckwelle
  // allein klingt duenn, weil ihr genau die geraden Teiltoene fehlen, die das
  // Ohr als "Koerper" liest.
  e.tone({
    freq: t.freq, dur: d, type: 'triangle', gain: g * 0.4, attack: 0.045,
    hold: 0.7, vibratoHz: 4.7, vibratoCents: 11, ...o(t),
  });
  e.noise({ dur: 0.05, gain: g * 0.16, filter: 'bandpass', freq: t.freq * 2.4, q: 0.8, ...o(t) });
}

/**
 * Akkordeon — die Hookline-Stimme der Wiese.
 *
 * 1. **Huellkurve.** Haelt wie die Klarinette, aber mit schnellerem Anstieg:
 *    Ein Balg steht sofort unter Druck, eine Luftsaeule muss erst in Gang
 *    kommen.
 * 2. **Teiltoene.** Saegezahn, also alle Teiltoene — Durchschlagzungen sind
 *    obertonreich. Entscheidend ist aber etwas anderes: **drei Zungen je Ton,
 *    gegeneinander verstimmt.** Das ist die Musette-Stimmung, und sie ist der
 *    eigentliche Klang eines Akkordeons. Ein einzelner Saegezahn mit demselben
 *    Filter klaenge nach Heimorgel; erst das Schweben der drei macht daraus
 *    das Instrument, das man vom Jahrmarkt kennt.
 * 3. **Anlaufgeraeusch.** Kurzes Zungenschnarren beim Ansatz, tief liegend —
 *    das Geraeusch des Balgs, nicht des Tons.
 */
export function akkordeon(e: E, t: TonOpts): void {
  const g = t.gain ?? 0.1;
  const d = t.dur ?? 0.4;
  // Rund elf Cent auseinander. Weiter waere verstimmt, enger waere tot.
  for (const stimmung of [0.9935, 1, 1.0065]) {
    e.tone({
      freq: t.freq * stimmung, dur: d, type: 'sawtooth', gain: g * 0.3, attack: 0.02,
      hold: 0.76, filterHz: t.freq * 4.2, filterSweep: 0.9, ...o(t),
    });
  }
  e.noise({ dur: 0.035, gain: g * 0.13, filter: 'bandpass', freq: 620, q: 1.4, ...o(t) });
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

/**
 * Kick — der Schlag auf jede Viertel.
 *
 * Ein Kick ist kein Ton, sondern ein **Tonhoehenabsturz**: Er setzt hoch an und
 * faellt in wenigen Hundertstelsekunden weit herunter. Das Ohr hoert den Sturz
 * als Anschlag und den Rest als Bass. Ohne den Sturz waere es ein Basston mit
 * hartem Anfang, und der klingt nach Fehler.
 *
 * Der Landepunkt liegt bei 150 Hz, nicht bei 50. Das ist keine Bescheidenheit:
 * Ein Handylautsprecher bewegt unterhalb von etwa 150 Hz keine Luft mehr, und
 * der Hochpass vor dem Ausgang nimmt es ohnehin heraus. Ein Kick, der auf 50 Hz
 * landet, ist auf dem Zielgeraet kein tieferer Kick — er ist gar keiner.
 *
 * Das Knacken obendrauf ist der Teil, den auch der kleinste Lautsprecher
 * wiedergibt. Auf einem Telefon *ist* es der Kick.
 */
export function kick(e: E, t: TonOpts): void {
  const g = t.gain ?? 0.3;
  e.tone({ freq: 330, dur: 0.19, type: 'sine', gain: g, slide: 150 / 330, attack: 0.003, ...o(t) });
  e.noise({ dur: 0.012, gain: g * 0.28, filter: 'highpass', freq: 1800, ...o(t) });
}

/**
 * Flaeche — der gehaltene Akkord darunter.
 *
 * Erst seit `tone()` halten kann, gibt es sie ueberhaupt: Eine Flaeche ist
 * definitionsgemaess ein Ton, der steht. Zwei Dinge machen sie zur Flaeche und
 * nicht zu einer lauten Orgel:
 *
 * 1. **Sehr langsam anschwellen** (`attack` gut ein Zehntel der Laenge). Was
 *    schnell einsetzt, hoert man als Ereignis; was langsam einsetzt, hoert man
 *    als Raum.
 * 2. **Tief gefiltert.** Von 800 Hz bis 3 kHz gehoert die Melodie. Eine Flaeche,
 *    die dort mitspielt, zwingt einen dazu, die Melodie lauter zu drehen — und
 *    dann ist alles zu laut. Der Tiefpass haelt sie unten, wo sie traegt.
 *
 * Zwei leicht verstimmte Stimmen, weil eine allein steht und nicht atmet.
 */
export function flaeche(e: E, t: TonOpts): void {
  const g = t.gain ?? 0.04;
  const d = t.dur ?? 1.6;
  for (const stimmung of [1, 1.0045]) {
    e.tone({
      freq: t.freq * stimmung, dur: d, type: 'sawtooth', gain: g, attack: d * 0.12,
      hold: 0.82, filterHz: Math.min(760, t.freq * 3.2), filterSweep: 1.15, ...o(t),
    });
  }
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
