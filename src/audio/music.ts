import type { ThemeId } from '../levels/types';
import type { AudioEngine } from './engine';

/**
 * Begleitmusik, zur Laufzeit erzeugt.
 *
 * Das Dokument (§7) schlaegt Arrangements gemeinfreier Volksmelodien vor. Das
 * ist eine Kompositionsaufgabe und keine Programmieraufgabe — hier laeuft
 * stattdessen eine eigene, sehr schlichte Schleife aus Basslinie und
 * Dreiklangsbrechung. Sie traegt die Stimmung, ohne sich vorzudraengen, und
 * haelt den Prototyp frei von fremdem Material.
 *
 * Die Schleife wird mit Vorlauf geplant: Jedes Bild schaut ein Stueck in die
 * Zukunft und legt faellige Toene fest. Das haelt den Takt stabil, auch wenn
 * die Bildrate schwankt.
 */

interface Pattern {
  /** Grundtoene der Takte in Halbtonschritten. */
  roots: number[];
  /** Stufen der Dreiklangsbrechung innerhalb eines Takts. */
  arp: number[];
  bpm: number;
  /** Grundfrequenz der Basslinie. */
  base: number;
  wave: OscillatorType;
}

const PATTERNS: Record<ThemeId, Pattern> = {
  // Grasland: freundlich, dur-artig, mittleres Tempo.
  grass: { roots: [0, 9, 5, 7], arp: [0, 4, 7, 4], bpm: 104, base: 110, wave: 'square' },
  // Kristallhoehle: dunkler, langsamer, kleine Terz.
  crystal: { roots: [0, 8, 3, 7], arp: [0, 3, 7, 10], bpm: 84, base: 98, wave: 'triangle' },
};

const LOOKAHEAD = 0.35;
const STEPS = 16;

export class Music {
  private playing = false;
  private nextTime = 0;
  private step = 0;
  private notes = 0;
  private pattern: Pattern = PATTERNS.grass;

  /** Diagnose: laeuft die Schleife, und legt sie tatsaechlich Toene? */
  get state(): { playing: boolean; notes: number } {
    return { playing: this.playing, notes: this.notes };
  }

  setTheme(theme: ThemeId): void {
    this.pattern = PATTERNS[theme] ?? PATTERNS.grass;
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
    const p = this.pattern;
    const stepDur = 60 / p.bpm / 2;
    const horizon = engine.time + LOOKAHEAD;
    // Nach einer Pause nicht die verpasste Zeit nachholen.
    if (this.nextTime < engine.time) this.nextTime = engine.time + 0.02;

    let guard = 0;
    while (this.nextTime < horizon && guard++ < 32) {
      const delay = this.nextTime - engine.time;
      const bar = (this.step >> 2) % p.roots.length;
      const within = this.step & 3;
      const root = p.roots[bar];

      const halbton = (h: number) => p.base * Math.pow(2, h / 12);

      // Liegeton auf der Eins jedes Takts. Er schliesst die Luecken zwischen
      // den kurzen Toenen — ohne ihn bleiben einzelne Blips uebrig, und die
      // hoert man nicht als Musik.
      if (within === 0) {
        engine.tone({
          freq: halbton(root + 12),
          dur: stepDur * 3.6,
          type: 'triangle',
          gain: 0.1,
          bus: 'music',
          delay,
          attack: 0.06,
          ignoreLimit: true,
        });
      }

      // Basslinie auf der Eins und der Drei jedes Takts.
      if (within === 0 || within === 2) {
        engine.tone({
          freq: halbton(root),
          dur: stepDur * 1.5,
          type: 'triangle',
          gain: 0.26,
          bus: 'music',
          delay,
          attack: 0.01,
          ignoreLimit: true,
        });
      }

      // Dreiklangsbrechung zwei Oktaven ueber dem Bass — also 440 bis 740 Hz.
      // Das ist Absicht: Ein Handylautsprecher strahlt unter etwa 500 Hz kaum
      // noch ab. Stuende die Melodie wie der Bass bei 110 Hz, waere von der
      // Musik unterwegs genau nichts zu hoeren.
      const semi = root + p.arp[(this.step + bar) % p.arp.length] + 24;
      engine.tone({
        freq: halbton(semi),
        dur: stepDur * 0.8,
        type: p.wave,
        gain: 0.12,
        bus: 'music',
        delay,
        ignoreLimit: true,
      });

      this.notes++;
      this.nextTime += stepDur;
      this.step = (this.step + 1) % STEPS;
    }
  }
}
