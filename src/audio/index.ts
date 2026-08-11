import type { WorldEvent } from '../core/types';
import type { ThemeId } from '../levels/types';
import { Ambiente } from './ambiente';
import { AudioEngine } from './engine';
import { Haptics } from './haptics';
import { Music, type Lage } from './music';
import { Sfx } from './sfx';

/** Ein Zugang fuer alles Hoer- und Fuehlbare. */
export class GameAudio {
  private engine = new AudioEngine();
  private sfx = new Sfx(this.engine);
  private music = new Music();
  private ambiente = new Ambiente();
  readonly haptics = new Haptics();

  get muted(): boolean {
    return this.engine.muted;
  }

  get hapticsSupported(): boolean {
    return this.haptics.supported;
  }

  /** Beim ersten Fingerdruck — vorher laesst kein Browser Ton zu. */
  unlock(): void {
    this.engine.unlock();
  }

  toggleMute(): boolean {
    const next = !this.engine.muted;
    this.engine.setMuted(next);
    this.haptics.enabled = !next;
    return next;
  }

  setTheme(theme: ThemeId): void {
    this.music.setTheme(theme);
    this.ambiente.setTheme(theme);
    this.sfx.reset();
  }

  /**
   * Das Umgebungsbett laeuft mit der Musik — es ist kein zweiter Schalter.
   * Wer die Musik anhaelt, will Ruhe, nicht Wind ohne Melodie.
   */
  startMusic(): void {
    this.music.start(this.engine);
    this.ambiente.start(this.engine);
  }

  stopMusic(): void {
    this.music.stop();
    this.ambiente.stop();
  }

  /** Der Ausgang klingt nur, solange er im Bild ist — siehe `Ambiente`. */
  setAusgangHoerbar(sichtbar: boolean): void {
    this.ambiente.setAusgang(sichtbar);
  }

  /** Der Ruf beim Weltuntergang — siehe `Sfx.ohNo`. */
  ohNo(): void {
    this.sfx.ohNo();
  }

  /** Einmal pro Bild, vor dem Verarbeiten der Ereignisse. */
  beginFrame(): void {
    this.engine.beginFrame();
  }

  /** Einmal pro Bild, nachdem die Ereignisse verteilt sind. */
  update(lage?: Lage): void {
    if (lage) this.music.setLage(lage);
    this.music.update(this.engine);
    this.ambiente.update(this.engine);
  }

  /** Diagnose für die automatisierte Sichtprobe. */
  debugState(): {
    ready: boolean;
    muted: boolean;
    haptics: boolean;
    music: { playing: boolean; notes: number; lage: string };
    ambiente: { playing: boolean; events: number; bett: ThemeId; ausgang: boolean };
  } {
    return {
      ready: this.engine.ready,
      muted: this.engine.muted,
      haptics: this.haptics.supported,
      music: this.music.state,
      ambiente: this.ambiente.state,
    };
  }

  handle(events: WorldEvent[], nowMs: number): void {
    if (events.length === 0) return;
    this.sfx.handle(events, nowMs);
    this.haptics.handle(events);
  }
}
