import type { ThemeId } from '../levels/types';
import type { AudioEngine } from './engine';

/**
 * Begleitmusik, zur Laufzeit erzeugt.
 *
 * ## Woher die Melodien kommen — und woher nicht
 *
 * Das Vorbild von 1991 hat **gemeinfreie Volksmelodien arrangiert**. Genau
 * dieser Weg steht offen: Eine Melodie aus dem 18. oder 19. Jahrhundert ist
 * frei, jeder darf sie setzen. Was *nicht* offensteht, ist das fremde
 * Arrangement — also die konkrete Stimmführung, Instrumentierung und Begleitung
 * jener Fassung. Beides wird hier sauber getrennt: Die Melodie ist zitiert, der
 * Satz darum ist eigener.
 *
 * Für die Kristallhöhle gibt es kein passendes Volkslied, deshalb steht dort
 * eine eigene Melodie in Moll.
 *
 * ## Warum überhaupt eine Melodie und nicht eine Schleife aus Akkorden
 *
 * Vorher lief hier eine Dreiklangsbrechung über vier Grundtöne. Das ist eine
 * Begleitung ohne das, was sie begleiten soll — man hört, dass etwas läuft,
 * aber man erkennt nichts wieder und summt es nicht mit. Genau deshalb wirkte
 * es „als ob keine Musik da wäre", obwohl Töne kamen.
 *
 * ## Aufbau
 *
 * Eine Melodiestimme, ein Bass auf den Akkordgrundtönen und ein Liegeton je
 * Takt. Geplant wird mit Vorlauf: Jedes Bild schaut ein Stück in die Zukunft
 * und legt fällige Töne fest. Das hält den Takt stabil, auch wenn die Bildrate
 * schwankt.
 */

/** Ein Ton: Halbtöne über dem Grundton (null = Pause) und Länge in Achteln. */
type Note = readonly [number | null, number];

interface Stueck {
  /** Melodie, der Reihe nach. */
  melodie: readonly Note[];
  /** Akkordgrundton je Takt, in Halbtönen. Wiederholt sich mit der Melodie. */
  akkorde: readonly number[];
  bpm: number;
  /** Frequenz des Grundtons der Melodie. */
  grund: number;
  wave: OscillatorType;
  /** Woher die Melodie stammt — steht hier, damit die Frage nie offen ist. */
  quelle: string;
}

/** Achtel je Takt. Alles hier steht im Viervierteltakt. */
const TAKT = 8;

const STUECKE: Record<ThemeId, Stueck> = {
  // „Alle meine Entchen" — deutsches Volkslied, gemeinfrei. Die Melodie ist
  // zitiert, der Satz darum (Bass, Liegeton, Klangfarben) ist eigener.
  grass: {
    quelle: 'Alle meine Entchen (Volkslied, gemeinfrei)',
    melodie: [
      [0, 2], [2, 2], [4, 2], [5, 2],
      [7, 4], [7, 4],
      [9, 2], [9, 2], [9, 2], [9, 2],
      [7, 8],
      [9, 2], [9, 2], [9, 2], [9, 2],
      [7, 8],
      [5, 2], [5, 2], [5, 2], [5, 2],
      [4, 4], [4, 4],
      [2, 2], [2, 2], [2, 2], [2, 2],
      [0, 6], [null, 2],
    ],
    akkorde: [0, 0, 5, 0, 5, 0, 5, 0, 7, 0],
    bpm: 112,
    grund: 261.63,
    wave: 'square',
  },
  // Eigene Melodie. Für eine Höhle passt kein Kinderlied, und ein Volkslied in
  // Moll, das jeder kennt, gibt es kaum — also selbst gesetzt: pentatonisch in
  // a-Moll, damit nichts schief klingen kann.
  crystal: {
    quelle: 'eigene Melodie',
    melodie: [
      [0, 4], [3, 2], [5, 2],
      [7, 4], [5, 2], [3, 2],
      [0, 4], [3, 4],
      [2, 6], [null, 2],
      [7, 4], [10, 2], [7, 2],
      [5, 4], [3, 4],
      [0, 4], [3, 2], [2, 2],
      [0, 6], [null, 2],
    ],
    akkorde: [0, 5, 0, 7, 3, 5, 0, 7],
    bpm: 84,
    grund: 220,
    wave: 'triangle',
  },
};

const LOOKAHEAD = 0.35;

/** Melodie auf Schrittraster: je Achtel entweder ein Tonanfang oder nichts. */
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
};

export class Music {
  private playing = false;
  private nextTime = 0;
  private step = 0;
  private notes = 0;
  private theme: ThemeId = 'grass';

  /** Diagnose: laeuft die Schleife, und legt sie tatsaechlich Toene? */
  get state(): { playing: boolean; notes: number; quelle: string } {
    return { playing: this.playing, notes: this.notes, quelle: STUECKE[this.theme].quelle };
  }

  setTheme(theme: ThemeId): void {
    this.theme = theme in STUECKE ? theme : 'grass';
  }

  start(engine: AudioEngine): void {
    if (this.playing) return;
    this.playing = true;
    this.step = 0;
    this.nextTime = engine.time + 0.1;
  }

  stop(): void {
    this.playing = false;
  }

  get isPlaying(): boolean {
    return this.playing;
  }

  /** Jedes Bild aufrufen. Plant alle Toene, die im Vorlauffenster faellig sind. */
  update(engine: AudioEngine): void {
    if (!this.playing || !engine.ready || engine.muted) return;
    const p = STUECKE[this.theme];
    const raster = RASTER[this.theme];
    const stepDur = 60 / p.bpm / 2;
    const horizon = engine.time + LOOKAHEAD;
    // Nach einer Pause nicht die verpasste Zeit nachholen.
    if (this.nextTime < engine.time) this.nextTime = engine.time + 0.02;

    let guard = 0;
    while (this.nextTime < horizon && guard++ < 32) {
      const delay = this.nextTime - engine.time;
      const i = this.step % raster.length;
      const takt = Math.floor(i / TAKT) % p.akkorde.length;
      const wurzel = p.akkorde[takt];
      const halbton = (h: number, oktave = 0) => p.grund * Math.pow(2, h / 12 + oktave);

      // --- Melodie ---------------------------------------------------------
      const note = raster[i];
      if (note && note[0] !== null) {
        engine.tone({
          freq: halbton(note[0], 1),
          dur: stepDur * note[1] * 0.92,
          type: p.wave,
          gain: 0.13,
          bus: 'music',
          delay,
          attack: 0.012,
          ignoreLimit: true,
        });
        this.notes++;
      }

      // --- Bass auf Eins und Drei -----------------------------------------
      if (i % 4 === 0) {
        engine.tone({
          freq: halbton(wurzel, -1),
          dur: stepDur * 1.6,
          type: 'triangle',
          gain: 0.24,
          bus: 'music',
          delay,
          attack: 0.01,
          ignoreLimit: true,
        });
      }

      // --- Liegeton je Takt ------------------------------------------------
      // Er schliesst die Luecken zwischen den kurzen Toenen; ohne ihn bleiben
      // einzelne Blips uebrig, und die hoert man nicht als Musik.
      if (i % TAKT === 0) {
        engine.tone({
          freq: halbton(wurzel),
          dur: stepDur * (TAKT - 0.5),
          type: 'triangle',
          gain: 0.075,
          bus: 'music',
          delay,
          attack: 0.08,
          ignoreLimit: true,
        });
      }

      this.nextTime += stepDur;
      this.step = (this.step + 1) % raster.length;
    }
  }
}
