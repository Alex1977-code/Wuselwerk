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
  private pattern: Pattern = PATTERNS.grass;

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

      // Basslinie auf der Eins und der Drei jedes Takts.
      if (within === 0 || within === 2) {
        engine.tone({
          freq: p.base * Math.pow(2, root / 12),
          dur: stepDur * 1.6,
          type: 'triangle',
          gain: 0.16,
          bus: 'music',
          delay,
          attack: 0.01,
          ignoreLimit: true,
        });
      }

      // Dreiklangsbrechung eine Oktave darueber.
      const semi = root + p.arp[(this.step + bar) % p.arp.length] + 12;
      engine.tone({
        freq: p.base * Math.pow(2, semi / 12),
        dur: stepDur * 0.8,
        type: p.wave,
        gain: 0.06,
        bus: 'music',
        delay,
        ignoreLimit: true,
      });

      this.nextTime += stepDur;
      this.step = (this.step + 1) % STEPS;
    }
  }
}
