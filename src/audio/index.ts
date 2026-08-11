import type { WorldEvent } from '../core/types';
import type { ThemeId } from '../levels/types';
import { AudioEngine } from './engine';
import { Haptics } from './haptics';
import { Music } from './music';
import { Sfx } from './sfx';

/** Ein Zugang fuer alles Hoer- und Fuehlbare. */
export class GameAudio {
  private engine = new AudioEngine();
  private sfx = new Sfx(this.engine);
  private music = new Music();
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
    this.sfx.reset();
  }

  startMusic(): void {
    this.music.start(this.engine);
  }

  stopMusic(): void {
    this.music.stop();
  }

  /** Einmal pro Bild, vor dem Verarbeiten der Ereignisse. */
  beginFrame(): void {
    this.engine.beginFrame();
  }

  /** Einmal pro Bild, nachdem die Ereignisse verteilt sind. */
  update(): void {
    this.music.update(this.engine);
  }

  /** Diagnose für die automatisierte Sichtprobe. */
  debugState(): {
    ready: boolean;
    muted: boolean;
    haptics: boolean;
    music: { playing: boolean; notes: number };
  } {
    return {
      ready: this.engine.ready,
      muted: this.engine.muted,
      haptics: this.haptics.supported,
      music: this.music.state,
    };
  }

  handle(events: WorldEvent[], nowMs: number): void {
    if (events.length === 0) return;
    this.sfx.handle(events, nowMs);
    this.haptics.handle(events);
  }
}
