import type { ThemeId } from '../levels/types';
import type { AudioEngine } from './engine';
import { bass, chip, glocke, kalimba, marimba, panfloete, shaker, tick, ukulele, woodblock } from './instrumente';

/**
 * Begleitmusik, zur Laufzeit erzeugt.
 *
 * ## Woher die Melodien kommen — und woher nicht
 *
 * Das Vorbild von 1991 hat gemeinfreie Volkslieder und Klassik **neu
 * arrangiert**. Das ist das Rezept, nicht das Ergebnis: Eine Melodie aus dem
 * 18. Jahrhundert ist frei, das fremde Arrangement nicht, und die eigenen
 * Melodien jenes Spiels erst recht nicht. Hier stehen deshalb **eigene
 * Melodien im gleichen Geist** — kurze, singbare Achttakter mit Volksliedbau.
 *
 * ## Was den Wiedererkennungswert traegt
 *
 * Nicht die Melodie, sondern Instrumentierung, Groove und Klangtextur. Deshalb
 * liegt das Gewicht hier auf den Klangfarben (`instrumente.ts`), auf dem
 * huepfenden Zweiertakt und auf dem gemeinsamen Federhall, durch den Musik und
 * Geraeusche gehen.
 *
 * ## Die Ebenen
 *
 * Ein Stueck besteht aus fuenf Spuren, die einzeln zu- und abgeschaltet werden:
 * Perkussion, Bass, Harmonie, Melodie, Glitzer. Das ist der Unterschied zu
 * 1991 — dort lief ein Band, hier reagiert die Musik auf die Lage:
 *
 * | Lage | was passiert |
 * |---|---|
 * | Normal | alle Spuren |
 * | Restzeit unter 30 % | Schuettelrohr doppelt, Uhrentick dazu, Melodie raus, alles einen Halbton hoeher |
 * | Letzte zehn Sekunden | nur noch Bass und Tick |
 * | Pause | Tiefpass auf 400 Hz statt Stille — die Musik rueckt weg, statt abzureissen |
 * | Alle gerettet, Level laeuft noch | Glitzer verdoppelt, Glockenspiel-Girlande darueber |
 */

/** Ein Ton: Halbtöne über dem Grundton (null = Pause) und Länge in Achteln. */
type Note = readonly [number | null, number];

interface Stueck {
  melodie: readonly Note[];
  /** Akkordgrundton je Takt, in Halbtönen. */
  akkorde: readonly number[];
  /** Zusätzliche Töne des Akkords für die Harmoniespur. */
  farbe: readonly number[];
  bpm: number;
  /** Frequenz des Grundtons. */
  grund: number;
  /** Wer spielt die Melodie, wer die Offbeats. */
  melodieStimme: 'marimba' | 'kalimba' | 'panfloete';
  harmonieStimme: 'ukulele' | 'kalimba';
}

const TAKT = 8;

const STUECKE: Record<ThemeId, Stueck> = {
  // Welt 1 — Wiese. Sonnig, Dur mit lydischer Farbe (die 6 im fünften Takt ist
  // die übermässige Quarte), Ukulele auf den Nachschlägen.
  grass: {
    melodie: [
      [7, 2], [9, 2], [7, 2], [4, 2],
      [5, 4], [4, 2], [2, 2],
      [0, 2], [4, 2], [7, 2], [9, 2],
      [11, 4], [7, 4],
      [12, 2], [9, 2], [7, 2], [5, 2],
      [6, 4], [4, 4],
      [2, 2], [4, 2], [5, 2], [7, 2],
      [4, 6], [null, 2],
    ],
    akkorde: [0, 5, 0, 7, 0, 5, 7, 0],
    farbe: [4, 7],
    bpm: 126,
    grund: 261.63,
    melodieStimme: 'marimba',
    harmonieStimme: 'ukulele',
  },
  // Welt 2 — Höhle. Dorisch (die grosse Sexte im fünften Takt), Kalimba statt
  // Marimba, langsamer, weniger Perkussion.
  crystal: {
    melodie: [
      [0, 4], [3, 4],
      [5, 2], [7, 2], [5, 4],
      [3, 4], [0, 4],
      [2, 6], [null, 2],
      [7, 4], [9, 2], [7, 2],
      [5, 4], [3, 4],
      [0, 2], [3, 2], [5, 2], [3, 2],
      [0, 6], [null, 2],
    ],
    akkorde: [0, 10, 0, 5, 7, 10, 5, 0],
    farbe: [3, 7],
    bpm: 112,
    grund: 220,
    melodieStimme: 'kalimba',
    harmonieStimme: 'kalimba',
  },
};

const LOOKAHEAD = 0.35;

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

/** Was die Musik über die Spiellage wissen muss. */
export interface Lage {
  /** Verbleibende Zeit als Anteil, 1 am Anfang. */
  restAnteil: number;
  /** Verbleibende Zeit in Sekunden. */
  restSekunden: number;
  /** Alle Figuren gerettet, das Level läuft aber noch. */
  alleGerettet: boolean;
  pausiert: boolean;
}

export class Music {
  private playing = false;
  private nextTime = 0;
  private step = 0;
  private notes = 0;
  private theme: ThemeId = 'grass';
  private lage: Lage = { restAnteil: 1, restSekunden: 999, alleGerettet: false, pausiert: false };
  private gefiltert = false;

  get state(): { playing: boolean; notes: number; lage: string } {
    return {
      playing: this.playing,
      notes: this.notes,
      lage: this.lage.pausiert
        ? 'pausiert'
        : this.lage.restSekunden <= 10
          ? 'endspurt'
          : this.lage.restAnteil < 0.3
            ? 'knapp'
            : this.lage.alleGerettet
              ? 'alle gerettet'
              : 'normal',
    };
  }

  setTheme(theme: ThemeId): void {
    this.theme = theme in STUECKE ? theme : 'grass';
  }

  /** Jedes Bild aus dem Spiel heraus setzen. */
  setLage(l: Lage): void {
    this.lage = l;
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

  update(engine: AudioEngine): void {
    // Pause macht die Musik nicht aus, sondern zu. Ein harter Schnitt fuehlt
    // sich nach Absturz an; ein Tiefpass fuehlt sich an, als traete man einen
    // Schritt zurueck.
    const zu = this.lage.pausiert;
    if (zu !== this.gefiltert) {
      engine.musikFilter(zu ? 400 : 18000);
      this.gefiltert = zu;
    }

    if (!this.playing || !engine.ready || engine.muted) return;

    const p = STUECKE[this.theme];
    const raster = RASTER[this.theme];
    const stepDur = 60 / p.bpm / 2;
    const horizon = engine.time + LOOKAHEAD;
    if (this.nextTime < engine.time) this.nextTime = engine.time + 0.02;

    const endspurt = this.lage.restSekunden <= 10;
    const knapp = endspurt || this.lage.restAnteil < 0.3;
    // Einen Halbton hoch, sobald es knapp wird. Dieselbe Musik, aber der Koerper
    // merkt den Wechsel sofort — das ist der aelteste Trick der Filmmusik.
    const schiebung = knapp ? 1 : 0;

    let guard = 0;
    while (this.nextTime < horizon && guard++ < 32) {
      const delay = this.nextTime - engine.time;
      const i = this.step % raster.length;
      const takt = Math.floor(i / TAKT) % p.akkorde.length;
      const wurzel = p.akkorde[takt] + schiebung;
      const f = (h: number, oktave = 0) => p.grund * Math.pow(2, h / 12 + oktave);
      const g = { delay, bus: 'music' as const, fest: true };

      // --- Perkussion -------------------------------------------------------
      if (!endspurt) {
        if (i % 4 === 0) woodblock(engine, { freq: i % 8 === 0 ? 900 : 1250, gain: 0.075, ...g });
        // Bei knapper Zeit laeuft das Schuettelrohr auf doppelter Zeit.
        if (knapp ? true : i % 2 === 1) shaker(engine, { freq: 0, gain: 0.04, ...g });
      }
      if (knapp && i % 2 === 0) tick(engine, { freq: 0, gain: 0.09, ...g });

      // --- Bass -------------------------------------------------------------
      // Zweiertakt: Grundton auf die Eins, Quinte auf die Drei. Das ist der
      // huepfende Gang, den das Vorbild von der Blasmusik geerbt hat.
      if (i % TAKT === 0) bass(engine, { freq: f(wurzel, -1), dur: stepDur * 1.5, ...g });
      else if (i % TAKT === 4) bass(engine, { freq: f(wurzel + 7, -1), dur: stepDur * 1.3, gain: 0.19, ...g });

      // --- Harmonie auf den Nachschlaegen ----------------------------------
      if (!endspurt && i % 4 === 2) {
        const stimme = p.harmonieStimme === 'ukulele' ? ukulele : kalimba;
        for (const ton of [0, ...p.farbe]) {
          stimme(engine, { freq: f(wurzel + ton), gain: 0.055, dur: stepDur * 1.4, ...g });
        }
      }

      // --- Melodie ----------------------------------------------------------
      const note = raster[i];
      if (!knapp && note && note[0] !== null) {
        const halbton = note[0] + schiebung;
        const stimme =
          p.melodieStimme === 'marimba' ? marimba : p.melodieStimme === 'kalimba' ? kalimba : panfloete;
        stimme(engine, { freq: f(halbton, 1), dur: stepDur * note[1] * 0.95, gain: 0.145, ...g });
        // Die Achtbit-Ebene verdoppelt nur — nie Hauptstimme.
        chip(engine, { freq: f(halbton, 1), dur: stepDur * note[1] * 0.5, gain: 0.03, ...g });
        this.notes++;
      }

      // --- Glitzer ----------------------------------------------------------
      // Wenn alle gerettet sind, das Level aber noch laeuft: doppelt so dicht.
      const glitzerTakt = this.lage.alleGerettet ? 4 : 16;
      if (!endspurt && i % glitzerTakt === 12 % glitzerTakt) {
        glocke(engine, { freq: f(wurzel + 12), gain: this.lage.alleGerettet ? 0.075 : 0.045, ...g });
      }

      this.nextTime += stepDur;
      this.step = (this.step + 1) % raster.length;
    }
  }
}
