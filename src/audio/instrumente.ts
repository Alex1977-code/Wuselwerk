import type { AudioEngine, Bus } from './engine';

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
 * ## Das eine Zeichen, das ueberall vorkommt
 *
 * Ein Klangbild wird nicht dadurch wiedererkennbar, dass jeder einzelne Klang
 * gut ist, sondern dadurch, dass **ein** Klang an mehreren Stellen wiederkehrt.
 * Das ist der `pling` weiter unten: Holzstab mit Glaskante. Er ist der Anschlag
 * unter der Melodie, der Glitzer darueber, die Werkzeugwahl, der Knopf, jede
 * Brueckenstufe und das Konfetti im Stinger. Wer ihn aendert, aendert das
 * Gesicht des Spiels; wer eine neue Welt baut, laesst ihn stehen.
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
  bus?: Bus;
  /** Sperrt die Stimmenbegrenzung aus — fuer Musik, die nie ausfallen darf. */
  fest?: boolean;
  /**
   * Panorama, −1 bis +1.
   *
   * Wer hier stehen darf, ist geregelt und nicht Geschmack: Bass, Erdschlag und
   * Melodie bleiben bei 0. Sie tragen Fundament und Aussage, und beides gehoert
   * auf einem Handylautsprecher — der genau einen Ort hat — in die Mitte.
   * Gespreizt wird, was schmueckt.
   */
  pan?: number;
  /** Anteil ins tempogekoppelte Echo. Siehe `AudioEngine.setEcho`. */
  echo?: number;
}

type E = AudioEngine;

/** Gemeinsame Vorgaben, damit jeder Eintrag unten nur noch das Eigene setzt. */
function o(t: TonOpts) {
  return {
    delay: t.delay ?? 0,
    bus: t.bus ?? ('music' as const),
    ignoreLimit: t.fest ?? true,
    pan: t.pan ?? 0,
    echo: t.echo ?? 0,
  };
}

/**
 * Wie `o()`, aber ohne Echo.
 *
 * Fuer die Nebenstimmen eines Klangs — Obertoene, Anschlagsgeraeusche,
 * Anblasrauschen. Sie gehoeren zum Ton, aber nicht ins Echo: Ein Echo, das die
 * Anschlaege mitnimmt, wiederholt das Klicken statt des Klangs, und nach drei
 * Wiederholungen steht ein Rascheln im Weg. Ins Echo geht immer nur der
 * **Koerper** einer Stimme.
 */
function ohneEcho(t: TonOpts) {
  return { ...o(t), echo: 0 };
}

/**
 * Marimba — Holzstab ueber einer Roehre.
 *
 * Der Kern ist der Oberton bei Faktor 4 (zwei Oktaven ueber dem Grundton): Ein
 * Holzstab schwingt so, und ohne diesen Ton klingt jedes Stabspiel wie eine
 * Floete. Der Anschlag ist ein sehr kurzes Rauschen — das ist der Schlaegel.
 *
 * **Wird gerade von niemandem gerufen**, und das ist Absicht statt Rest. Ihre
 * Aufgabe in der Musik hat der `pling` uebernommen, der derselbe Holzstab mit
 * einer Glaskante ist. Stehen bleibt sie aus zwei Gruenden: Sie ist die reine
 * Form, an der die Begruendung fuer den Faktor 4 haengt (der `pling` verweist
 * darauf), und fuer die Uebersichtskarte ist eine Fassung ohne Glasanteil
 * vorgesehen — dort soll es weich sein und nicht funkeln.
 *
 * Diese Datei ist eine **Farbpalette**, kein Aufrufgraph. Eine Stimme, die
 * bereitliegt, kostet nichts; eine, die im falschen Moment fehlt, kostet einen
 * Umbau.
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
 * **Der Pling — das Erkennungszeichen des Spiels.**
 *
 * Von allen Klaengen hier ist dieser der einzige, der eine Aufgabe hat, die
 * ueber seinen eigenen Klang hinausgeht: Er ist das Objekt, das in **allen drei
 * Schichten** vorkommt und sie dadurch zu einer Sache macht.
 *
 * - In der Musik ist er der Anschlag unter der Melodie und der Glitzer darueber.
 * - In den Geraeuschen ist er die Werkzeugwahl, der Knopf und jede
 *   Brueckenstufe.
 * - Im Stinger ist er der Anschlag auf der Fanfare und das Konfetti.
 *
 * Wiedererkennung entsteht nicht aus vielen schoenen Einzelklaengen, sondern aus
 * der **Wiederkehr desselben Objekts an verschiedenen Orten**. Das ist derselbe
 * Satz wie bei einer Melodie mit Kopfmotiv, nur eine Ebene tiefer.
 *
 * Was er ist: ein **Holzstab, mit einer Glaskante angeschlagen**. Drei Teile,
 * und keiner davon ist beliebig:
 *
 * 1. **Holz.** Sinuston mit dem Teilton bei Faktor 4 — der Stabschwingung, an
 *    der man ein Stabspiel ohne Nachdenken erkennt (siehe `marimba`).
 * 2. **Glas.** Zwei sehr kurze, sehr leise Teiltoene bei Faktor 5,4 und 7,6.
 *    Beide passen in keine Oktave; unharmonisch und kurz heisst „hart und
 *    sproede", und genau das ist Glas. Sie klingen fuenfzig Millisekunden lang
 *    und sind der eigentliche Fingerabdruck: Ein Stabspiel ohne sie klingt
 *    freundlich, mit ihnen klingt es **nach diesem Spiel**.
 * 3. **Anschlag.** Ein Rauschstoss von acht Millisekunden. Ohne ihn ist es kein
 *    angeschlagener Ton, sondern eine Floete mit schneller Huellkurve.
 *
 * Der Echoanteil geht nur auf den Holzkoerper. Glas und Anschlag bleiben
 * einmalig — was sich wiederholen soll, ist der Ton, nicht das Klicken.
 *
 * ## `schlank`: dieselbe Farbe, drei Stimmen statt fuenf
 *
 * Die Stimmenbremse der Klangwerkstatt zaehlt **Teiltoene**, nicht Klaenge
 * (`AudioEngine.take`). Ein voller Pling kostet damit fuenf von acht Plaetzen
 * eines Bildes — was fuer einen Klang, den man einzeln ausloest, richtig ist und
 * fuer einen, von dem drei gleichzeitig kommen koennen, nicht: Beim Brueckenbau
 * fielen sonst der zweite und dritte Klack aus, und ausgerechnet dort traegt die
 * Tonhoehe eine Aussage.
 *
 * Weggelassen wird deshalb genau das, was in der Menge ohnehin niemand einzeln
 * hoert: der zweite Glasteilton und der Stabteilton. Was bleibt, sind Koerper,
 * eine Glaskante und der Anschlag — und damit bleibt auch das Erkennungszeichen.
 */
export function pling(e: E, t: TonOpts & { schlank?: boolean }): void {
  const g = t.gain ?? 0.13;
  const d = t.dur ?? 0.4;
  e.tone({ freq: t.freq, dur: d, type: 'sine', gain: g, attack: 0.003, ...o(t) });
  if (!t.schlank) {
    e.tone({ freq: t.freq * 4, dur: d * 0.26, type: 'sine', gain: g * 0.3, attack: 0.002, ...ohneEcho(t) });
  }
  // Die Glaskante. Sehr leise — sie soll die Farbe geben, nicht den Ton.
  e.tone({ freq: t.freq * 5.4, dur: 0.05, type: 'sine', gain: g * 0.16, attack: 0.001, ...ohneEcho(t) });
  if (!t.schlank) {
    e.tone({ freq: t.freq * 7.6, dur: 0.035, type: 'sine', gain: g * 0.09, attack: 0.001, ...ohneEcho(t) });
  }
  e.noise({ dur: 0.008, gain: g * 0.24, filter: 'bandpass', freq: t.freq * 6, q: 1.1, ...ohneEcho(t) });
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
 * Klarinette — **Zweitstimme** der Hoehle.
 *
 * Sie hat die Melodie an die `streicher` abgegeben („zu floetenartig", siehe
 * dort) und traegt sie jetzt in jedem zweiten Durchgang. Das ist keine
 * Zurueckstufung, sondern ihre eigentliche Aufgabe: Der Wechsel zwischen einer
 * obertonreichen und einer obertonarmen Stimme ist das, was die Achttaktschleife
 * davon abhaelt, zur Tapete zu werden (siehe `DURCHGAENGE` in `music.ts`).
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
 * Akkordeon — Jahrmarkt.
 *
 * **Nicht mehr die Stimme der Wiese** (das ist jetzt die `okarina`), aber
 * absichtlich behalten: Die Musette-Stimmung ist der Klang einer Drehorgel, und
 * dafuer gibt es im Spiel eine vorgesehene Stelle — die Sonderlevel. Wenn diese
 * Welt kommt, ist die Stimme fertig da, und sie klingt dort richtig, statt hier
 * falsch.
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
 * Okarina — **Zweitstimme** der Wiese.
 *
 * Sie hat das Akkordeon abgeloest (Musette ist Jahrmarkt, die Wiese ist keiner)
 * und die Fuehrung inzwischen an die `leier` weitergegeben („zu floetenartig",
 * siehe dort). Geblieben ist ihr die Antwort: Jeder zweite Durchgang gehoert
 * ihr, und der Wechsel zwischen gestrichen und geblasen ist genau das, was die
 * Schleife lebendig haelt (siehe `DURCHGAENGE` in `music.ts`).
 *
 * Was sie dafuer besonders geeignet macht, steht unten unter Punkt 1: Sie ist
 * die **leiseste Klangfarbe** im Melodiefenster, die es hier gibt. Nach einem
 * Durchgang mit drei Saegezaehnen wirkt sie dadurch fast wie eine Pause — und
 * eine Pause ist die staerkste Abwechslung, die eine Schleife haben kann.
 *
 * Eine Okarina ist akustisch fast ein Sonderfall, und genau das macht sie hier
 * brauchbar:
 *
 * 1. **Teiltoene.** Ein Helmholtz-Resonator — ein geschlossenes Gefaess mit
 *    Loechern — hat kaum Obertoene. Praktisch nur der Grundton und ein
 *    schwacher zweiter. Deshalb steht sie im Melodiefenster (800 Hz bis 3 kHz)
 *    **allein**, statt es mit einem Saegezahnkamm zuzustellen, wie es das
 *    Akkordeon mit seinen drei Zungen tat. Weniger Klangfarbe, mehr Melodie.
 * 2. **Huellkurve.** Sie haelt (`hold: 0.78`) und setzt weich ein. Das ist die
 *    Bedingung dafuer, dass eine Melodie eine Linie wird und keine Punktfolge —
 *    derselbe Grund wie bei Klarinette und Panfloete.
 * 3. **Atem.** Ein Anblasrauschen um den zweiten Teilton, laenger als bei der
 *    Panfloete und leiser. Eine Okarina ist eine gedeckte Pfeife: Man hoert die
 *    Luft im Gefaess, nicht am Schneidenrand.
 *
 * Die zwei Stimmen stehen sechs Cent auseinander und ±0,15 im Panorama. Sechs
 * Cent sind eine Schwebung von rund einem halben Hertz — man hoert sie nicht als
 * Verstimmung, sondern als Groesse. Elf Cent waeren wieder Musette gewesen.
 *
 * Der Echoanteil geht auf den Koerper. Das ist das Merkmal, an dem man diese
 * Fassung von der vorigen in einer Sekunde unterscheidet: Die Melodie hat einen
 * Nachsatz, der auf der punktierten Achtel wiederkommt.
 */
export function okarina(e: E, t: TonOpts): void {
  const g = t.gain ?? 0.11;
  const d = t.dur ?? 0.4;
  for (const [stimmung, seite] of [
    [0.99826, -0.15],
    [1.00174, 0.15],
  ] as const) {
    e.tone({
      freq: t.freq * stimmung,
      dur: d,
      type: 'triangle',
      gain: g * 0.5,
      attack: 0.03,
      hold: 0.78,
      vibratoHz: 5.2,
      vibratoCents: 8,
      ...o(t),
      pan: (t.pan ?? 0) + seite,
    });
  }
  // Der schwache zweite Teilton. Sinus, weil an einer Okarina nichts scharf ist.
  e.tone({
    freq: t.freq * 2, dur: d * 0.7, type: 'sine', gain: g * 0.13, attack: 0.04,
    hold: 0.6, ...ohneEcho(t),
  });
  e.noise({
    dur: Math.min(0.13, d), gain: g * 0.2, filter: 'bandpass',
    freq: t.freq * 2.1, q: 1.3, ...ohneEcho(t),
  });
}

/**
 * Drehleier — die neue Melodiestimme der Wiese.
 *
 * ## Warum sie die Okarina abloest
 *
 * Rueckmeldung nach dem Spielen: „zu floetenartig". Das ist keine Geschmacks-
 * frage, sondern eine richtige Beobachtung ueber den Bau der bisherigen Stimme.
 * Eine Okarina ist ein Helmholtz-Resonator und hat **fast keine Obertoene** —
 * praktisch nur den Grundton. Genau deshalb war sie ausgesucht worden (sie
 * stellt das Melodiefenster nicht zu), und genau das macht sie auch aus:
 * Ein Klang aus einem einzigen Teilton *ist* eine Floete. Man kann ihn lauter
 * oder leiser machen, aber er wird nie etwas anderes.
 *
 * ## Warum ausgerechnet eine Drehleier
 *
 * Weil sie drei Dinge auf einmal loest, die sonst gegeneinander laufen:
 *
 * 1. **Sie haelt.** Ein Rad streicht die Saiten durchgehend — das ist der
 *    Grund, warum die Melodie ueberhaupt eine Linie sein kann. Ein Stabspiel
 *    koennte das nicht, und deshalb war der Ausweg bisher immer eine Blasstimme.
 * 2. **Sie ist obertonreich.** Gestrichene Saiten haben alle Teiltoene, also
 *    einen Saegezahn. Das ist das Gegenteil der Okarina und damit die Antwort
 *    auf die Rueckmeldung — mit Filter statt ungebremst, sonst wird aus dem
 *    Melodiefenster ein Kamm.
 * 3. **Sie gehoert dorthin.** Eine Drehleier ist das Volksliedinstrument
 *    schlechthin, und ueber dem Stueck liegt ein Achttakter mit Volksliedbau.
 *    Ein Synthesizerlead haette dieselbe Obertonfrage geloest und die Welt
 *    daneben verfehlt.
 *
 * ## Was sie erkennbar macht
 *
 * Der **Schnarrsteg** („Trompette"): ein loser Steg, den das Rad bei jedem
 * Antippen zum Schnarren bringt. Ohne ihn ist eine Drehleier eine gefilterte
 * Saegezahnwelle und klingt nach Heimorgel; mit ihm erkennt man sie sofort. Er
 * steht hier als kurzer, tief liegender Rauschstoss am Ansatz.
 *
 * Dazu drei Saiten, sieben Cent auseinander — das ist die Schwebung eines
 * Instruments, das niemand ganz sauber stimmen kann, und sie ist der Unterschied
 * zwischen einer Stimme und einem Oszillator. Elf Cent waeren Musette gewesen
 * (das Akkordeon), sechs waeren zu wenig, um es zu hoeren.
 */
export function leier(e: E, t: TonOpts): void {
  const g = t.gain ?? 0.11;
  const d = t.dur ?? 0.4;
  for (const [stimmung, seite] of [
    [0.9959, -0.16],
    [1, 0],
    [1.0041, 0.16],
  ] as const) {
    e.tone({
      freq: t.freq * stimmung,
      dur: d,
      type: 'sawtooth',
      gain: g * 0.3,
      attack: 0.022,
      hold: 0.8,
      // Der Filter faehrt nach unten. Ein Rad drueckt beim Ansetzen kurz
      // staerker auf die Saite als danach — der Ton ist am Anfang am hellsten.
      filterHz: t.freq * 4.4,
      filterSweep: 0.55,
      vibratoHz: 5.6,
      vibratoCents: 7,
      ...o(t),
      pan: (t.pan ?? 0) + seite,
    });
  }
  // Der Schnarrsteg. Tief und kurz — er gehoert zum Anschlag, nicht zum Ton.
  e.noise({
    dur: 0.045, gain: g * 0.22, filter: 'bandpass', freq: 380, q: 1.1, ...ohneEcho(t),
  });
}

/**
 * Streicher — die neue Melodiestimme der Hoehle.
 *
 * Sie loest die Klarinette ab, aus demselben Grund wie die Drehleier die
 * Okarina: Eine Klarinette ist eine gedackte Roehre und hat nur die *ungeraden*
 * Teiltoene. Das ist hohl und naeselnd — naeher an einer Floete als an allem
 * anderen, was ein Orchester hat.
 *
 * Was eine gestrichene Saite stattdessen ausmacht, und was hier drinsteht:
 *
 * 1. **Der Bogen braucht Zeit.** Ein deutlich langsamerer Anstieg als bei jeder
 *    Blasstimme (0,085 s). Das ist der hoerbarste Unterschied ueberhaupt: Ein
 *    Streicher setzt *an*, er faengt nicht *an*.
 * 2. **Alle Teiltoene, aber gedeckelt.** Saegezahn durch einen Tiefpass, der
 *    ueber den Ton **aufmacht** statt zu schliessen — ein wachsender Bogendruck.
 *    Genau umgekehrt zur Drehleier, und deshalb klingen die beiden trotz
 *    gleicher Wellenform nicht nach demselben Instrument.
 * 3. **Vibrato aus der Hand.** Deutlich breiter als bei einer Blasstimme
 *    (16 Cent statt 8 bis 11), weil es aus dem Finger kommt und nicht aus dem
 *    Atem.
 * 4. **Der Bogenansatz.** Ein kurzer, hoher Rauschstoss: das Kratzen, bevor der
 *    Ton steht. Ohne ihn ist es ein Pad.
 *
 * Eine Oktave darueber liegt eine sehr leise vierte Stimme. Sie ist der Grund,
 * warum das Ganze in einer Hoehle noch da ist: Der Grundton der Melodie liegt
 * dort tief, und was tief liegt, verliert ein Handylautsprecher zuerst.
 */
export function streicher(e: E, t: TonOpts): void {
  const g = t.gain ?? 0.11;
  const d = t.dur ?? 0.4;
  for (const [stimmung, seite] of [
    [0.9971, -0.14],
    [1.0029, 0.14],
  ] as const) {
    e.tone({
      freq: t.freq * stimmung,
      dur: d,
      type: 'sawtooth',
      gain: g * 0.34,
      attack: 0.085,
      hold: 0.74,
      // Nach oben: Der Bogendruck waechst, waehrend der Ton steht.
      filterHz: t.freq * 2.6,
      filterSweep: 2.4,
      vibratoHz: 5.5,
      vibratoCents: 16,
      ...o(t),
      pan: (t.pan ?? 0) + seite,
    });
  }
  // Die Oktave. Sie traegt den Ton auf kleinen Membranen.
  e.tone({
    freq: t.freq * 2, dur: d * 0.8, type: 'triangle', gain: g * 0.11, attack: 0.09,
    hold: 0.6, ...ohneEcho(t),
  });
  e.noise({
    dur: 0.055, gain: g * 0.13, filter: 'bandpass', freq: t.freq * 3.4, q: 1.6, ...ohneEcho(t),
  });
}

/**
 * Bass — angerissen statt angeblasen.
 *
 * Vorher stand hier ein Dreieck mit Huellkurve. Das ist ein *Ton* in der
 * richtigen Lage, aber kein Bass: Ihm fehlt der Anfang. Was man an einem
 * gezupften Bass zuerst hoert, ist nicht die Tonhoehe, sondern der **Anriss** —
 * ein kurzer, breitbandiger Ruck, bevor der Ton steht.
 *
 * Nachgebaut mit dem Mittel, mit dem eine gezupfte Saite es selbst macht: Ein
 * Saegezahn (alle Teiltoene) laeuft durch einen Tiefpass, der in wenigen
 * Hundertstelsekunden von der sechsfachen auf die anderthalbfache Grundfrequenz
 * zufaehrt. Genau das tut eine angerissene Saite — sie verliert ihre Hoehen
 * zuerst. Das Ergebnis hat einen hoerbaren Anfang und danach einen runden
 * Koerper.
 *
 * Warum das gerade auf einem Telefon zaehlt: Der Grundton bei 130 bis 200 Hz
 * kommt dort ohnehin nur zur Haelfte an. Der Anriss dagegen liegt bei 800 Hz und
 * darueber und kommt vollstaendig an. **Auf dem Zielgeraet ist der Anriss der
 * Bass.** Deshalb war „basslastiger" mit mehr Pegel unten nicht zu erfuellen,
 * mit dieser Kurve schon.
 *
 * Bewusst nicht tiefer als 150 Hz: Was darunter liegt, gibt ein
 * Handylautsprecher nicht wieder, und der Hochpass vor dem Ausgang nimmt es
 * ohnehin heraus. Der Sinus eine Oktave darueber traegt den Ton auf kleinen
 * Membranen. Immer Mitte, nie Panorama.
 */
export function bass(e: E, t: TonOpts): void {
  const g = t.gain ?? 0.24;
  const d = t.dur ?? 0.24;
  e.tone({
    freq: t.freq, dur: d, type: 'sawtooth', gain: g * 0.62, attack: 0.005,
    filterHz: t.freq * 6, filterSweep: 0.25, ...ohneEcho(t), pan: 0,
  });
  // Der runde Koerper darunter. Er allein waere der alte Bass; erst zusammen
  // mit dem Anriss darueber ist es ein Instrument.
  e.tone({
    freq: t.freq, dur: d, type: 'triangle', gain: g * 0.55, attack: 0.009,
    ...ohneEcho(t), pan: 0,
  });
  e.tone({
    freq: t.freq * 2, dur: d * 0.55, type: 'sine', gain: g * 0.26, attack: 0.006,
    ...ohneEcho(t), pan: 0,
  });
  // Das Fingergeraeusch. Acht Millisekunden, hoch, sehr leise — man hoert es
  // nicht als Rauschen, sondern als Kante.
  e.noise({
    dur: 0.008, gain: g * 0.1, filter: 'bandpass', freq: 2200, q: 0.9,
    ...ohneEcho(t), pan: 0,
  });
}

/**
 * Erdschlag — der Puls. Frueher hiess das hier „Kick".
 *
 * Der Bau ist derselbe geblieben, weil er stimmt: Ein Schlag ist kein Ton,
 * sondern ein **Tonhoehenabsturz**. Er setzt hoch an und faellt in wenigen
 * Hundertstelsekunden weit herunter; das Ohr hoert den Sturz als Anschlag und
 * den Rest als Bass. Der Landepunkt liegt bei 150 Hz und nicht bei 50 — darunter
 * bewegt ein Handylautsprecher keine Luft mehr, und der Hochpass vor dem Ausgang
 * nimmt es ohnehin heraus. Ein Schlag, der auf 50 Hz landet, ist auf dem
 * Zielgeraet kein tieferer Schlag, sondern gar keiner.
 *
 * Geaendert hat sich das **Material**, und zwar aus dem Bild heraus. Im Spiel
 * gibt es kein Schlagzeug; es gibt Erde, in der gegraben wird. Also:
 *
 * - **Weicherer Ansatz** (8 statt 3 ms) und ein etwas laengerer Sturz. Ein Fuss
 *   auf festgetretener Erde setzt auf, er schlaegt nicht an. Der harte Ansatz
 *   von vorher ist der eines Verstaerkers.
 * - **Holzklopfen bei 900 Hz statt Zischen bei 1800.** Das ist der Teil, den
 *   auch der kleinste Lautsprecher wiedergibt — auf einem Telefon *ist* dieser
 *   Anteil der Schlag. Ein Zischer bei 1800 Hz gehoert zu einer Bassdrum mit
 *   Kunststofffell; ein Klopfen bei 900 Hz zu etwas Holzigem auf Boden.
 * - **Ein tiefer, sehr kurzer Rauschtupfer** darunter: der Staub. Er hat keine
 *   Tonhoehe und ist einzeln nicht zu hoeren, aber ohne ihn ist der Schlag ein
 *   sauberer Sinus und klingt nach Testgeraet.
 *
 * Immer in der Mitte. Das Fundament hat auf einem Geraet mit einem Lautsprecher
 * nur einen Ort.
 */
export function erdschlag(e: E, t: TonOpts): void {
  const g = t.gain ?? 0.3;
  e.tone({
    freq: 320, dur: 0.22, type: 'sine', gain: g, slide: 150 / 320, attack: 0.008,
    ...ohneEcho(t), pan: 0,
  });
  e.noise({
    dur: 0.016, gain: g * 0.26, filter: 'bandpass', freq: 900, q: 1.6,
    ...ohneEcho(t), pan: 0,
  });
  e.noise({
    dur: 0.05, gain: g * 0.09, filter: 'lowpass', freq: 420, sweep: 0.5,
    ...ohneEcho(t), pan: 0,
  });
}

/**
 * Flaeche — der gehaltene Akkord darunter.
 *
 * Drei Dinge machen sie zur Flaeche und nicht zu einer lauten Orgel:
 *
 * 1. **Sehr langsam anschwellen** (`attack` gut ein Zehntel der Laenge). Was
 *    schnell einsetzt, hoert man als Ereignis; was langsam einsetzt, hoert man
 *    als Raum.
 * 2. **Tief gefiltert.** Von 800 Hz bis 3 kHz gehoert die Melodie. Eine Flaeche,
 *    die dort mitspielt, zwingt einen dazu, die Melodie lauter zu drehen — und
 *    dann ist alles zu laut. Der Tiefpass haelt sie unten, wo sie traegt.
 * 3. **Sie steht breit.** Die zwei verstimmten Stimmen gehen nach links und
 *    rechts auseinander (±0,55). Das ist die Stelle, an der Breite am meisten
 *    bringt und am wenigsten kostet: Eine Flaeche traegt keine Aussage, die man
 *    orten muesste, und wenn sie aussen steht, wird in der Mitte Platz frei —
 *    genau dort, wo Bass, Schlag und Melodie stehen. Breite ist hier also nicht
 *    Schmuck, sondern **Raeumen**.
 *
 * Die Verstimmung ist mit 4,5 Promille bewusst klein. Sie erzeugt eine Schwebung
 * von etwa einem Hertz; zusammen mit der Spreizung wandert der Klang dadurch
 * langsam zwischen den Seiten hin und her, ohne dass irgendetwas moduliert wird.
 *
 * Laeuft ueber den Pad-Zweig: Sie ist es, die bei jedem Erdschlag kurz
 * zurueckweicht (`AudioEngine.pumpe`).
 */
export function flaeche(e: E, t: TonOpts): void {
  const g = t.gain ?? 0.04;
  const d = t.dur ?? 1.6;
  for (const [stimmung, seite] of [
    [1, -0.55],
    [1.0045, 0.55],
  ] as const) {
    e.tone({
      freq: t.freq * stimmung, dur: d, type: 'sawtooth', gain: g, attack: d * 0.12,
      hold: 0.82, filterHz: Math.min(760, t.freq * 3.2), filterSweep: 1.15,
      ...ohneEcho(t), bus: t.bus ?? 'pad', pan: seite,
    });
  }
}

/** Holzblock — trockener Klopfer fuer den Takt. */
export function woodblock(e: E, t: TonOpts): void {
  const g = t.gain ?? 0.1;
  e.tone({ freq: t.freq, dur: 0.035, type: 'square', gain: g, slide: 0.5, ...ohneEcho(t) });
  e.noise({ dur: 0.02, gain: g * 0.5, filter: 'bandpass', freq: t.freq * 3, q: 2, ...ohneEcho(t) });
}

/**
 * Kies — die Gegenbewegung oben. Frueher hiess das hier „Schuettelrohr".
 *
 * Vorher war es ein einzelner Hochpass-Rauschstoss bei 5,2 kHz. Das ist der
 * Klang einer Hi-Hat, und eine Hi-Hat kommt im Bild dieses Spiels nicht vor.
 * Was vorkommt, sind die hellen Kiesel in der Erde.
 *
 * Der Unterschied zwischen „tss" und Kies ist **Koernung**, und Koernung
 * entsteht nicht aus mehr Rauschen, sondern aus **zwei getrennten Baendern mit
 * verschiedener Laenge**: ein kurzes helles Korn bei 7 kHz und ein etwas
 * laengeres, dunkleres bei 3,4 kHz, zwei Millisekunden versetzt. Das Ohr liest
 * daraus zwei aneinanderstossende Teilchen statt einer Zischflaeche — derselbe
 * Trick wie beim Grabegeraeusch in `sfx.ts`, und aus demselben Grund.
 *
 * Das dunklere Korn ist der Teil, der das Bett mit der Erde verbindet: Reines
 * Hochtonrauschen klingt nach Metall, ein Anteil um 3 kHz nach Stein.
 *
 * Darf im Panorama stehen und soll es auch — Kies liegt verstreut. Es ist der
 * einzige Klang der Perkussion, der die Mitte verlassen darf, weil er nichts
 * traegt.
 */
export function kies(e: E, t: TonOpts): void {
  const g = t.gain ?? 0.05;
  const p = t.pan ?? 0;
  e.noise({
    dur: 0.028, gain: g, filter: 'bandpass', freq: 7000, q: 0.7, sweep: 0.75,
    ...ohneEcho(t), pan: p,
  });
  e.noise({
    dur: 0.05, gain: g * 0.55, filter: 'bandpass', freq: 3400, q: 1.1, sweep: 0.6,
    ...ohneEcho(t), pan: p * 0.6, delay: (t.delay ?? 0) + 0.002,
  });
}

/** Uhrentick — die Ebene, die bei knapper Zeit dazukommt. */
export function tick(e: E, t: TonOpts): void {
  const g = t.gain ?? 0.08;
  e.noise({ dur: 0.015, gain: g, filter: 'bandpass', freq: 2600, q: 3, ...ohneEcho(t) });
  e.tone({ freq: 1800, dur: 0.02, type: 'square', gain: g * 0.5, ...ohneEcho(t) });
}
