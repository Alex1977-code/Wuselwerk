import { DeathCause, type SkillId, type WorldEvent } from '../core/types';
import type { AudioEngine } from './engine';

/**
 * Die Spielgeraeusche (GDD §7).
 *
 * Zwei Regeln aus dem Dokument bestimmen die Mischung:
 * - Jeder Beruf hat ein eigenes Arbeitsgeraeusch, damit man hoert, wie viele
 *   gerade graben.
 * - Der Sprengcountdown ist der lauteste Ton im Spiel.
 *
 * Bewusste Abweichung: Statt eines durchlaufenden Dauertons pro Beruf klingt
 * jeder Arbeitsschritt einzeln. Auf einem Handylautsprecher verschmieren
 * uebereinandergelegte Dauertoene zu Matsch, waehrend die Dichte der Schlaege
 * sofort verraet, wie viele Figuren arbeiten — dieselbe Information, nur
 * lesbarer.
 */

/** Fuenftonleiter: gestapelte Rettungstoene klingen dadurch immer zusammen. */
const PENTATONIC = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26];
const SAVE_BASE = 523.25;
/** Innerhalb dieser Zeit gilt eine Rettung als Teil derselben Kette. */
const SAVE_CHAIN_MS = 1400;

export class Sfx {
  private saveStep = 0;
  private lastSaveMs = -Infinity;

  constructor(private engine: AudioEngine) {}

  reset(): void {
    this.saveStep = 0;
    this.lastSaveMs = -Infinity;
  }

  handle(events: WorldEvent[], nowMs: number): void {
    for (const e of events) {
      switch (e.type) {
        case 'assign':
          this.assign(e.skill);
          break;
        case 'dig':
          this.work(e.skill);
          break;
        case 'brick':
          this.brick();
          break;
        case 'steel':
          this.steel();
          break;
        case 'explode':
          this.explode();
          break;
        case 'fuse-tick':
          this.fuse(e.n ?? 5);
          break;
        case 'saved':
          this.saved(nowMs);
          break;
        case 'died':
          this.died(e.cause);
          break;
        case 'spawn':
          this.spawn();
          break;
      }
    }
  }

  /** Skill vergeben: kurzer, trockener Tick. */
  private assign(skill?: SkillId): void {
    this.engine.tone({ freq: skill === 'bomber' ? 320 : 880, dur: 0.05, type: 'square', gain: 0.16, slide: 0.7 });
    this.engine.noise({ dur: 0.03, gain: 0.06, filter: 'highpass', freq: 2600 });
  }

  /** Arbeitsschritt — Klangfarbe je Beruf. */
  private work(skill?: SkillId): void {
    switch (skill) {
      case 'basher':
        // Rammer: stumpfer Schlag gegen Gestein.
        this.engine.noise({ dur: 0.1, gain: 0.13, filter: 'bandpass', freq: 420, q: 1.4, sweep: 0.6 });
        this.engine.tone({ freq: 150, dur: 0.07, type: 'triangle', gain: 0.09, slide: 0.6 });
        break;
      case 'miner':
        // Schraegbagger: schabend, etwas heller.
        this.engine.noise({ dur: 0.13, gain: 0.11, filter: 'bandpass', freq: 780, q: 0.9, sweep: 0.5 });
        break;
      case 'digger':
      default:
        // Graeber: krumeliges Erdgeraeusch nach unten.
        this.engine.noise({ dur: 0.11, gain: 0.12, filter: 'lowpass', freq: 1200, sweep: 0.35 });
        break;
    }
  }

  /** Brueckenstufe legen: kurzes Holzklacken. */
  private brick(): void {
    this.engine.tone({ freq: 620, dur: 0.05, type: 'triangle', gain: 0.11, slide: 0.75 });
    this.engine.noise({ dur: 0.035, gain: 0.05, filter: 'highpass', freq: 1800 });
  }

  /** Funken beim Stahlkontakt: hell, hart, kurz. */
  private steel(): void {
    this.engine.noise({ dur: 0.09, gain: 0.16, filter: 'highpass', freq: 3400, sweep: 1.6 });
    this.engine.tone({ freq: 2100, dur: 0.06, type: 'square', gain: 0.07, slide: 1.5 });
  }

  /**
   * Sprengung: erst der Knall, dann das Platzen.
   *
   * Zwei Ereignisse in einem Klang, und die Reihenfolge ist der Witz daran:
   * ein kurzer harter Knacks (das Platzen der Figur), unmittelbar gefolgt vom
   * tiefen Schlag und dem Nachhall (die Sprengung im Boden). Ohne den Knacks
   * ist es nur ein Rumpeln irgendwo; mit ihm hoert man, dass es *jemanden*
   * erwischt hat.
   */
  private explode(): void {
    // Das Platzen: sehr kurz, mittig, mit einem hoerbaren Zischen obendrauf.
    this.engine.tone({ freq: 720, dur: 0.05, type: 'square', gain: 0.3, slide: 0.35, ignoreLimit: true });
    this.engine.noise({ dur: 0.07, gain: 0.26, filter: 'bandpass', freq: 2400, q: 0.7, sweep: 0.3, ignoreLimit: true });
    // Der Schlag darunter.
    this.engine.tone({ freq: 150, dur: 0.5, type: 'sine', gain: 0.42, slide: 0.22, delay: 0.02, ignoreLimit: true });
    this.engine.noise({ dur: 0.55, gain: 0.3, filter: 'lowpass', freq: 1600, sweep: 0.16, delay: 0.02, ignoreLimit: true });
    this.engine.noise({ dur: 0.3, gain: 0.14, filter: 'highpass', freq: 900, sweep: 0.4, delay: 0.05, ignoreLimit: true });
  }

  /**
   * Der Ruf beim Weltuntergang — zwei Silben, fallend, im Chor.
   *
   * Das Vorbild hat hier eine aufgenommene Stimme. Die ist fremdes Material und
   * kommt nicht in Frage; die *Geste* dagegen — zwei fallende Silben, viele
   * Stimmen leicht versetzt — gehoert niemandem. Gebaut wird sie aus zwei
   * Saegezaehnen durch einen wandernden Tiefpass: Ein Tiefpass, der sich
   * schliesst, klingt wie ein Mund, der sich schliesst. Fuenf Stimmen mit
   * leicht verschiedener Tonhoehe und Verzoegerung machen daraus einen Chor
   * statt eines Piepsers.
   */
  ohNo(): void {
    for (let i = 0; i < 5; i++) {
      const ton = 1 + (i - 2) * 0.045;
      const spaeter = i * 0.035;
      // Erste Silbe, offen und kurz.
      this.engine.tone({
        freq: 430 * ton, dur: 0.16, type: 'sawtooth', gain: 0.11,
        filterHz: 1050 * ton, filterSweep: 0.75,
        delay: spaeter, attack: 0.02, ignoreLimit: true,
      });
      // Zweite Silbe, tiefer und laenger — sie faellt weiter ab.
      this.engine.tone({
        freq: 350 * ton, dur: 0.34, type: 'sawtooth', gain: 0.12, slide: 0.72,
        filterHz: 1400 * ton, filterSweep: 0.45,
        delay: 0.2 + spaeter, attack: 0.03, ignoreLimit: true,
      });
    }
  }

  /**
   * Sprengcountdown. Laut Dokument der lauteste Ton im Spiel — und je naeher
   * die Null, desto hoeher und draengender.
   */
  private fuse(secondsLeft: number): void {
    const urgency = Math.max(0, 5 - secondsLeft);
    this.engine.tone({
      freq: 660 + urgency * 90,
      dur: 0.1,
      type: 'square',
      gain: 0.3 + urgency * 0.05,
      ignoreLimit: true,
    });
  }

  /**
   * Rettung: aufsteigender Jingle, gestapelt. Bei einer Massenrettung
   * entsteht daraus eine Melodie — das ist der Belohnungsmoment (§7).
   */
  private saved(nowMs: number): void {
    if (nowMs - this.lastSaveMs > SAVE_CHAIN_MS) this.saveStep = 0;
    this.lastSaveMs = nowMs;
    const semi = PENTATONIC[Math.min(this.saveStep, PENTATONIC.length - 1)];
    this.saveStep++;
    const f = SAVE_BASE * Math.pow(2, semi / 12);
    this.engine.tone({ freq: f, dur: 0.16, type: 'triangle', gain: 0.2, ignoreLimit: true });
    this.engine.tone({ freq: f * 2, dur: 0.1, type: 'sine', gain: 0.09, delay: 0.02, ignoreLimit: true });
  }

  /** Tod: kurzer, tiefer Puls. Jeder Verlust soll spuerbar sein. */
  private died(cause?: DeathCause): void {
    if (cause === DeathCause.EXPLOSION) return; // Die Sprengung war laut genug.
    if (cause === DeathCause.SPLAT) {
      // Aufprall: ein nasser Klatscher. Tiefer Puls plus ein sehr kurzes,
      // breitbandiges Rauschen — das ist der Unterschied zwischen "faellt um"
      // und "schlaegt auf".
      this.engine.noise({ dur: 0.06, gain: 0.24, filter: 'lowpass', freq: 900, sweep: 0.25 });
      this.engine.tone({ freq: 130, dur: 0.18, type: 'sine', gain: 0.26, slide: 0.45 });
      this.engine.noise({ dur: 0.12, gain: 0.08, filter: 'highpass', freq: 1600, sweep: 0.5, delay: 0.01 });
      return;
    }
    this.engine.tone({ freq: 190, dur: 0.22, type: 'sawtooth', gain: 0.2, slide: 0.35 });
    this.engine.noise({ dur: 0.14, gain: 0.1, filter: 'lowpass', freq: 700, sweep: 0.4 });
  }

  /** Startruf beim Verlassen der Falltuer — piepsig und sehr kurz. */
  private spawn(): void {
    this.engine.tone({ freq: 1180, dur: 0.045, type: 'square', gain: 0.055, slide: 1.25 });
  }
}
