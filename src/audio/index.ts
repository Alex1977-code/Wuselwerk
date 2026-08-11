import type { SkillId, WorldEvent } from '../core/types';
import type { ThemeId } from '../levels/types';
import { Ambiente } from './ambiente';
import { AudioEngine } from './engine';
import { Haptics } from './haptics';
import { Music, type Lage } from './music';
import { Sfx } from './sfx';
import {
  alleGerettet,
  levelGescheitert,
  levelGeschafft,
  neuerBestwert,
  selbstzerstoerung,
} from './stinger';

/** Ein Zugang fuer alles Hoer- und Fuehlbare. */
export class GameAudio {
  private engine = new AudioEngine();
  private sfx = new Sfx(this.engine);
  private music = new Music();
  private ambiente = new Ambiente();
  readonly haptics = new Haptics();
  /** Bis wann der Countdown der Selbstzerstoerung laeuft — siehe `handle`. */
  private nukeBis = 0;

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

  /**
   * Der Countdown der Selbstzerstoerung.
   *
   * Er merkt sich, bis wann er laeuft, denn solange muessen die Sekundenpiepser
   * der einzelnen Zuender schweigen — siehe `handle`.
   */
  selbstzerstoerung(sekunden: number): void {
    this.nukeBis = performance.now() + sekunden * 1000;
    selbstzerstoerung(this.engine, sekunden);
  }

  /**
   * Das Ende eines Levels.
   *
   * Der Bestwert kommt hinter die Fanfare, nicht in sie hinein: Zwei
   * gleichzeitige Stingers ergeben keinen doppelten Jubel, sondern Matsch.
   * Deshalb der Versatz um die Laenge dessen, was davor laeuft.
   */
  levelEnde(gewonnen: boolean, alle: boolean, bestwert: boolean): void {
    const vorlauf = alle ? 5.7 : 4.6;
    if (!gewonnen) levelGescheitert(this.engine);
    else if (alle) alleGerettet(this.engine);
    else levelGeschafft(this.engine);
    if (bestwert) neuerBestwert(this.engine, gewonnen ? vorlauf : 3.1);
  }

  /** Einmal pro Bild, vor dem Verarbeiten der Ereignisse. */
  beginFrame(): void {
    this.engine.beginFrame();
  }

  // --- Bedienklaenge ---------------------------------------------------------
  //
  // Sie haengen an keinem Weltereignis, sondern unmittelbar am Finger. Deshalb
  // reicht `GameAudio` sie einzeln durch, statt sie ueber `handle` zu fuehren.

  werkzeugGewaehlt(skill: SkillId): void {
    this.sfx.werkzeugGewaehlt(skill);
  }

  werkzeugFehlt(): void {
    this.sfx.werkzeugFehlt();
  }

  knopf(): void {
    this.sfx.knopf();
  }

  /** Der Klang zum Pausieren. Den Tiefpass auf der Musik legt `Music` selbst. */
  pauseKlang(an: boolean): void {
    this.sfx.pause(an);
  }

  tempo(schnell: boolean): void {
    this.sfx.tempo(schnell);
  }

  /**
   * Die Trippelschritte. Sie brauchen kein Ereignis je Figur, sondern die
   * Anzahl — warum, steht bei `Sfx.schritte`.
   */
  schritte(laufende: number, nowMs: number): void {
    this.sfx.schritte(laufende, nowMs);
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
    // Waehrend der Selbstzerstoerung laeuft schon ein durchgehender Countdown.
    // Jede Figur zaehlt daneben ihre eigene Zuendschnur herunter — bei sechzig
    // gleichzeitig wird daraus ein Teppich, unter dem der eine Countdown
    // verschwindet, den der Spieler selbst ausgeloest hat. Also weg damit,
    // solange er laeuft.
    const gefiltert =
      nowMs < this.nukeBis ? events.filter((e) => e.type !== 'fuse-tick') : events;
    if (gefiltert.length === 0) return;
    this.sfx.handle(gefiltert, nowMs);
    this.haptics.handle(gefiltert);
  }
}
