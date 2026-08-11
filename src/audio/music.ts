import type { ThemeId } from '../levels/types';
import type { AudioEngine } from './engine';
import {
  akkordeon,
  bass,
  chip,
  glocke,
  kalimba,
  klarinette,
  marimba,
  panfloete,
  shaker,
  tick,
  ukulele,
  woodblock,
} from './instrumente';

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
  /**
   * Wer die Melodie **haelt**. Immer eine Blasstimme, nie ein Stabspiel: Ein
   * Stabspiel kann keinen Ton halten, und eine Melodie aus lauter abfallenden
   * Anschlaegen piekst nur vor sich hin. Den Anschlag gibt ohnehin das Stabspiel
   * darunter dazu — siehe `update`.
   */
  melodieStimme: 'akkordeon' | 'klarinette' | 'panfloete';
  harmonieStimme: 'ukulele' | 'kalimba';
}

const TAKT = 8;

export const STUECKE: Record<ThemeId, Stueck> = {
  /**
   * Welt 1 — Wiese.
   *
   * Achttakter mit Volksliedbau: **ein Kopfmotiv, das dreimal wiederkehrt**
   * (G–G–A–G, Takt 1, 3 und 7), jedes Mal mit einer anderen Antwort, und
   * dazwischen ein Mittelteil, der einmal woanders hingeht. Genau daran haengt
   * die Mitsummbarkeit: Nicht die Menge der Toene macht eine Melodie, sondern
   * die Wiederkehr. Die vorherige Fassung hatte keine — sie lief acht Takte
   * lang geradeaus und war deshalb nach dem Hoeren wieder weg.
   *
   * Zwei weitere Dinge, die eine Melodie zur Melodie machen und hier drinstehen:
   * Die Phrasen enden auf **langen** Toenen (Atempausen; ohne sie hoert man kein
   * Ende und damit auch keinen Anfang), und der Mittelteil bringt das Fis — die
   * uebermaessige Quarte, die lydische Farbe. Ein einziger Ton ausserhalb der
   * Tonleiter gibt einem Achttakter mehr Gesicht als jede Verzierung.
   */
  grass: {
    melodie: [
      // Kopf, Antwort abwaerts: G G A G E | F E D —
      [7, 2], [7, 1], [9, 1], [7, 2], [4, 2],
      [5, 2], [4, 2], [2, 3], [null, 1],
      // Kopf, Antwort aufwaerts: G G A G C' | H A G —
      [7, 2], [7, 1], [9, 1], [7, 2], [12, 2],
      [11, 2], [9, 2], [7, 4],
      // Mittelteil, mit dem Fis: C' H A G Fis | G — E D
      [12, 2], [11, 1], [9, 1], [7, 2], [6, 2],
      [7, 4], [4, 2], [2, 2],
      // Kopf zum dritten Mal, Schluss nach Hause: G G A G E | D E C —
      [7, 2], [7, 1], [9, 1], [7, 2], [4, 2],
      [2, 2], [4, 2], [0, 4],
    ],
    // Der letzte Takt steht auf der Dominante, waehrend die Melodie schon auf
    // dem Grundton liegt. Diese Reibung zieht die Schleife herum — ein Stueck,
    // das auf seinem eigenen Schlusston zur Ruhe kommt, faengt nicht wieder an.
    akkorde: [0, 5, 0, 7, 0, 7, 5, 7],
    farbe: [4, 7],
    bpm: 126,
    grund: 261.63,
    melodieStimme: 'akkordeon',
    harmonieStimme: 'ukulele',
  },
  /**
   * Welt 2 — Hoehle. Derselbe Bau, andere Tonleiter: dorisch auf A.
   *
   * Der Unterschied zu Moll ist ein einziger Ton, die **grosse Sexte** (Fis).
   * Sie steht hier an der auffaelligsten Stelle — Takt 4, allein, lang gehalten,
   * ueber einem D-Dur-Akkord. Dorisch ist die Tonart, die traurig anfaengt und
   * dann doch nicht traurig ist; das passt zu einer Hoehle, die neugierig sein
   * soll und nicht bedrohlich.
   */
  crystal: {
    melodie: [
      // Kopf: A C D E | D C H —
      [0, 2], [3, 2], [5, 2], [7, 2],
      [5, 2], [3, 2], [2, 4],
      // Kopf, Antwort auf die dorische Sexte: A C D G | Fis — E —
      [0, 2], [3, 2], [5, 2], [10, 2],
      [9, 4], [7, 4],
      // Mittelteil, von oben herab: A' G Fis E | D — C —
      [12, 2], [10, 2], [9, 2], [7, 2],
      [5, 4], [3, 4],
      // Kopf zum dritten Mal, Schluss: A C D C | H A — —
      [0, 2], [3, 2], [5, 2], [3, 2],
      [2, 2], [0, 6],
    ],
    akkorde: [0, 10, 0, 5, 10, 3, 5, 0],
    farbe: [3, 7],
    bpm: 112,
    grund: 220,
    melodieStimme: 'klarinette',
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
      //
      // Zwei Stimmen auf denselben Ton, und die Arbeitsteilung ist die aus
      // jedem Orchester: Die Blasstimme **haelt** den Ton und macht daraus eine
      // Linie, das Stabspiel gibt den **Anschlag** und macht sie hoerbar. Jede
      // allein waere schlechter — die Blasstimme ohne Anschlag verwaescht
      // zwischen den Toenen, das Stabspiel ohne Blasstimme piekst.
      const note = raster[i];
      if (!knapp && note && note[0] !== null) {
        const halbton = note[0] + schiebung;
        const laenge = stepDur * note[1];
        const stimme =
          p.melodieStimme === 'akkordeon'
            ? akkordeon
            : p.melodieStimme === 'klarinette'
              ? klarinette
              : panfloete;
        // Etwas kuerzer als der Notenwert: Zwischen zwei Toenen muss eine
        // Kante bleiben, sonst verschmelzen sie zu einem Gleiten.
        stimme(engine, { freq: f(halbton, 1), dur: laenge * 0.86, gain: 0.16, ...g });
        // Der Anschlag. Deutlich leiser als die Blasstimme — er soll die Kante
        // setzen, nicht selbst als Stimme auftreten.
        const anschlag = p.melodieStimme === 'klarinette' ? kalimba : marimba;
        anschlag(engine, { freq: f(halbton, 1), dur: Math.min(0.3, laenge), gain: 0.07, ...g });
        // Die Achtbit-Ebene verdoppelt nur — nie Hauptstimme. Sie liegt jetzt
        // auf der Melodie statt eine Oktave darueber: `chip` verdoppelt selbst
        // schon (siehe `instrumente.ts`), und mit dem zusaetzlichen Oktavsprung
        // sass eine Rechteckwelle bei zwei Kilohertz ueber allem. Das war das
        // Piepen.
        chip(engine, { freq: f(halbton), dur: Math.min(0.14, laenge * 0.5), gain: 0.022, ...g });
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
