import { BUILD_BRICKS } from '../core/constants';
import { DeathCause, SKILLS, type SkillId, type WorldEvent } from '../core/types';
import type { AudioEngine } from './engine';
import { pling, woodblock } from './instrumente';
import { bisNaechsteAchtel, schrittDauer, tonart } from './music';

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
 *
 * ## Die vier Regeln, die alles zusammenhalten
 *
 * 1. **Tonart — die des laufenden Stuecks.** Alles Melodische steht in der
 *    Fuenftonleiter der gerade gespielten Welt (`tonart()` aus `music.ts`). Ein
 *    Effekt, der neben der laufenden Musik steht, klingt nach Fehler — auch wenn
 *    er fuer sich genommen schoen ist.
 *
 *    Vorher stand hier eine feste C-Dur-Pentatonik. Das ging bei zwei Welten
 *    gut, aber nur durch einen Zufall: C D E G A liegt vollstaendig in
 *    A-dorisch. Bei der dritten Welt haelt der Zufall nicht mehr — und der
 *    Fehler waere einer von der leisen Sorte, den man nur als Unbehagen
 *    bemerkt. Jetzt bringt jedes Stueck seine Leiter mit, und ein Test haelt
 *    fest, dass jede Stufe darin ein Ton ist, den die Melodie dieser Welt selbst
 *    benutzt.
 * 2. **Streuung.** Jeder Klang variiert seine Tonhoehe beim Abspielen, sonst
 *    nervt derselbe Ton nach einer halben Minute. Gestimmte Klaenge streuen in
 *    *Leiterstufen* (`stufenStreuung`), ungestimmte frei in Halbtoenen
 *    (`streuung`). **Ausnahme:** Wo die Tonhoehe selbst eine Aussage traegt —
 *    Brueckenstufen, Rettungskette, Countdown, Werkzeugwahl —, bleibt sie
 *    genau, und gestreut wird stattdessen der Geraeuschanteil.
 * 3. **Dichte.** Hoechstens drei Instanzen derselben Klangart pro Bild
 *    (`darf`). Sechzig grabende Figuren sind sechzig Ereignisse in einem Bild;
 *    drei davon klingen nach vielen, sechzig klingen nach kaputt.
 * 4. **Ducken.** Nur bei Sprengung, Rettung und Tod, und nur die anderthalb
 *    Dezibel, die `engine.duck()` ohnehin macht. Bei jedem Spatenstich zu
 *    ducken hiesse, die Musik dauerhaft leiser zu machen — mit Umweg.
 *
 * Dazu die Laengen: Bedienklaenge unter 200 ms, Aktionsklaenge unter 500 ms.
 * Laenger sind nur die Rufe der Figuren; eine zweisilbige Geste passt nicht in
 * eine halbe Sekunde, und sie ist auch keine Aktion, sondern eine Stimme.
 *
 * ## Zufall und Determinismus
 *
 * `Math.random()` steht in dieser Datei ausschliesslich innerhalb von
 * Klangfunktionen, und kein Wuerfelergebnis verlaesst die Tonschicht: Es geht
 * in Frequenzen und Verzoegerungen, nie in einen Rueckgabewert. Die Simulation
 * bleibt damit vollstaendig deterministisch — dieselbe Eingabe erzeugt dieselbe
 * Welt, sie klingt nur nie zweimal genau gleich.
 */

/**
 * Wie weit die Leiter reicht: zwoelf Stufen, gut zwei Oktaven.
 *
 * Die Zahl ist kein Zufall — der Brueckenbauer legt genau zwoelf Stufen
 * (`BUILD_BRICKS`), und daraus wird von selbst eine aufsteigende Tonleiter.
 */
const STUFEN = 12;
/** Innerhalb dieser Zeit gilt eine Rettung als Teil derselben Kette. */
const SAVE_CHAIN_MS = 1400;
/** Regel 3. Mehr als drei gleiche Klaenge hoert ohnehin niemand als drei. */
const MAX_GLEICHE = 3;
/**
 * Bildgrenze fuer die Dichtezaehlung. Alles, was innerhalb dieser Spanne
 * eintrifft, gilt als dasselbe Bild — bei 60 Bildern je Sekunde liegen die
 * Grenzen 16,7 ms auseinander, ein Ereignisbuendel selbst dagegen 0 ms.
 */
const BILD_MS = 8;
/**
 * Halbtoene ueber dem Grundton fuer eine Leiterstufe.
 *
 * Die fuenf Stufen kommen aus dem laufenden Stueck; darueber und darunter wird
 * oktavweise weitergezaehlt. Das kostet eine Zeile und erspart jeder
 * Klangfunktion die Frage, ob ihre Stufe noch in der Tabelle liegt — bei
 * Trippelschritten (hoch) und Blubbern (tief) liegt sie es naemlich nicht, und
 * eine Funktion wuerde es irgendwann vergessen.
 */
function halbton(stufe: number): number {
  const s = tonart().stufen;
  const n = s.length;
  return s[((stufe % n) + n) % n] + 12 * Math.floor(stufe / n);
}

/** Frequenz einer Leiterstufe, wahlweise um ganze Oktaven verschoben. */
function ton(stufe: number, oktave = 0): number {
  return tonart().grund * Math.pow(2, halbton(stufe) / 12 + oktave);
}

/**
 * Ein gewuerfelter Platz im Panorama, fuer Klaenge, von denen es viele gibt.
 *
 * Sechzig grabende Figuren an derselben Stelle im Stereobild sind ein Klumpen;
 * dieselben sechzig verteilt sind eine **Menge**. Das ist derselbe Gedanke wie
 * bei den gewuerfelten Tonhoehen eine Ebene tiefer, nur im Raum statt in der
 * Frequenz.
 *
 * Reine Pegelverteilung (siehe `AudioEngine.anschliessen`), also in Mono
 * kostenlos: Auf einem Handylautsprecher aendert sich dadurch nichts, auf
 * Kopfhoerern alles.
 *
 * Kein Bezug zur Bildschirmstelle — die kennt diese Datei nicht, und sie
 * einzufuehren hiesse, `index.ts` anzufassen. Gewuerfelt reicht fuer den Zweck:
 * Es geht um Breite, nicht um Ortung.
 */
function seite(weite = 0.55): number {
  return (Math.random() * 2 - 1) * weite;
}

/**
 * Regel 2 fuer gestimmte Klaenge: eine Leiterstufe hoch, runter oder gar nicht.
 *
 * Zwei Halbtoene in Cent verstimmt waeren bei einem Ton in C-Dur schlicht ein
 * falscher Ton — die geforderte Streuung und die geforderte Tonart schliessen
 * einander dort aus. Ein Schritt der Fuenftonleiter sind zwei oder drei
 * Halbtoene, also dieselbe Groessenordnung, nur auf Toene gerundet, die zur
 * Musik passen. Die Null in der Mitte ist Absicht: Ohne sie waere jeder
 * Anschlag verschoben, mit ihr bleibt der Klang erkennbar und wird trotzdem
 * nicht langweilig.
 */
function stufenStreuung(): number {
  return Math.floor(Math.random() * 3) - 1;
}

/**
 * Regel 2 fuer ungestimmte Klaenge: freier Faktor ueber ±`halbtoene`.
 *
 * Rauschen, Schlaege und Filterecken haben keine Tonart, die man zerstoeren
 * koennte. Hier darf die Vorgabe woertlich gelten.
 */
function streuung(halbtoene = 2): number {
  return Math.pow(2, ((Math.random() * 2 - 1) * halbtoene) / 12);
}

export class Sfx {
  private saveStep = 0;
  private lastSaveMs = -Infinity;
  /** Zeitstempel des laufenden Bildes — siehe `neuesBild`. */
  private bildMs = -Infinity;
  /** Laeuft gerade ein Ereignisbuendel? Dann ist die Bildgrenze festgenagelt. */
  private imBuendel = false;
  /** Wie oft jede Klangart im laufenden Bild schon geklungen hat (Regel 3). */
  private zaehler = new Map<string, number>();
  private letzterSchrittMs = -Infinity;
  /** Ersatzzaehler fuer Brueckenstufen, falls ein Ereignis ohne `n` kommt. */
  private brueckeStufe = 0;

  constructor(private engine: AudioEngine) {}

  reset(): void {
    this.saveStep = 0;
    this.lastSaveMs = -Infinity;
    this.bildMs = -Infinity;
    this.imBuendel = false;
    this.zaehler.clear();
    this.letzterSchrittMs = -Infinity;
    this.brueckeStufe = 0;
  }

  handle(events: WorldEvent[], nowMs: number): void {
    this.neuesBild(nowMs);
    // Waehrend eines Buendels steht die Bildgrenze fest. Sonst koennte ein
    // Klang, der einen anderen aufruft (`saved` ruft `jubel`), die Zaehlung
    // mitten im Buendel zuruecksetzen; Regel 3 haenge dann daran, dass die
    // Weltuhr und `performance.now()` auf die Millisekunde zusammenpassen.
    this.imBuendel = true;
    try {
      this.verteile(events, nowMs);
    } finally {
      this.imBuendel = false;
    }
  }

  private verteile(events: WorldEvent[], nowMs: number): void {
    for (const e of events) {
      switch (e.type) {
        case 'assign':
          this.assign(e.skill);
          break;
        case 'dig':
          this.work(e.skill);
          break;
        case 'brick':
          this.brick(e.n);
          break;
        case 'steel':
          this.steel();
          break;
        case 'explode':
          this.explode();
          break;
        case 'fuse-tick':
          this.fuse(e.n ?? 5);
          // Die letzte Sekunde bekommt den Panik-Laut dazu. Ein eigenes
          // Ereignis dafuer gibt es nicht, aber der letzte Countdownschlag ist
          // genau der Moment, in dem eine Figur merkt, was gleich passiert.
          if ((e.n ?? 5) <= 1) this.panik();
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
        case 'climb':
          this.klettern();
          break;
        case 'float':
          this.schirm();
          break;
        case 'oh-no':
          this.ohNoKlein();
          break;
        case 'scream':
          this.schrei();
          break;
        case 'land':
          this.plumps(e.n ?? 6);
          break;
      }
    }
  }

  // --- Dichte (Regel 3) ------------------------------------------------------

  /**
   * Bildgrenze fuer die Dichtezaehlung.
   *
   * Das Spiel reicht die Ereignisse eines Bildes in einem Buendel herein und
   * stempelt alle mit derselben Zeit; ein spaeterer Stempel ist deshalb ein
   * neues Bild. Die Toleranz von `BILD_MS` ist dafuer da, dass auch Aufrufe
   * *neben* `handle` — die Bedienklaenge und die Schritte holen sich die Zeit
   * selbst — noch demselben Bild zugeschlagen werden. So braucht die Tonschicht
   * keine eigene Bildschleife und `index.ts` bleibt unveraendert.
   */
  private neuesBild(nowMs = performance.now()): void {
    if (this.imBuendel) return;
    if (Math.abs(nowMs - this.bildMs) < BILD_MS) return;
    this.bildMs = nowMs;
    this.zaehler.clear();
  }

  /**
   * Darf diese Klangart in diesem Bild noch einmal klingen?
   *
   * Ohne die Bremse frisst ein Massenereignis die Stimmenzahl der Engine auf,
   * und was danach kommt — die Rettung, der Countdown — faellt aus. Drei
   * Instanzen sind genug: Ab der vierten hoert man keine einzelnen Schlaege
   * mehr, sondern nur noch Pegel.
   */
  private darf(art: string, max = MAX_GLEICHE): boolean {
    const n = this.zaehler.get(art) ?? 0;
    if (n >= max) return false;
    this.zaehler.set(art, n + 1);
    return true;
  }

  // --- Die Stimme der Figuren ------------------------------------------------

  /**
   * Eine gesungene Silbe.
   *
   * Saegezahn durch einen wandernden Tiefpass: Ein Filter, der aufgeht, klingt
   * wie ein Mund, der aufgeht, und einer, der zugeht, wie ein Mund, der zugeht.
   * Mehr Vokal braucht es nicht. Alle Rufe der Figuren — Startruf, Panik,
   * Jubel, `ohNo` — teilen sich diese eine Stimme, damit man sie als *eine*
   * Sorte Wesen erkennt; ein zweites Klangmodell fuer den Jubel haette
   * geklungen, als jubelte jemand anderes.
   */
  private silbe(o: {
    freq: number;
    dur: number;
    gain: number;
    delay?: number;
    /** Zielfrequenz als Faktor: unter 1 faellt die Silbe, ueber 1 steigt sie. */
    slide?: number;
    /** Wie weit der Vokal aufgeht; unter 1 schliesst er sich. */
    oeffnung?: number;
    /** Filter im Verhaeltnis zum Grundton — klein heisst dunkler Vokal. */
    farbe?: number;
    /** Sperrt die Stimmenbremse aus. Nur fuer die grossen Rufe. */
    fest?: boolean;
    pan?: number;
  }): void {
    this.engine.tone({
      freq: o.freq,
      dur: o.dur,
      type: 'sawtooth',
      gain: o.gain,
      slide: o.slide ?? 1,
      attack: 0.02,
      filterHz: o.freq * (o.farbe ?? 2.4),
      filterSweep: o.oeffnung ?? 0.7,
      delay: o.delay ?? 0,
      ignoreLimit: o.fest ?? false,
      pan: o.pan ?? 0,
    });
  }

  /**
   * Der Ruf beim Weltuntergang — zwei Silben, fallend, im Chor.
   *
   * Das Vorbild hat hier eine aufgenommene Stimme. Die ist fremdes Material und
   * kommt nicht in Frage; die *Geste* dagegen — zwei fallende Silben, viele
   * Stimmen leicht versetzt — gehoert niemandem. Fuenf Stimmen mit leicht
   * verschiedener Tonhoehe und Verzoegerung machen daraus einen Chor statt
   * eines Piepsers. Die Verstimmung der fuenf ist bewusst kein Leiterschritt,
   * sondern ein Bruchteil eines Halbtons: Das ist Unisono mit Schwebung, kein
   * Akkord — deshalb bleibt der Ruf trotzdem in der Tonart.
   */
  ohNo(): void {
    this.neuesBild();
    this.engine.duck(0.5);
    const s0 = 4 + stufenStreuung();
    const oben = ton(s0);
    const unten = ton(s0 - 2);
    const ziel = ton(s0 - 4) / unten;
    for (let i = 0; i < 5; i++) {
      const stimmung = 1 + (i - 2) * 0.045;
      const spaeter = i * 0.035;
      // Die fuenf stehen nebeneinander statt uebereinander. Ein Chor ist
      // definitionsgemaess eine Menge, und eine Menge hat eine Breite — fuenf
      // Stimmen auf demselben Punkt sind eine einzige, dickere Stimme.
      const wo = (i - 2) * 0.3;
      // Erste Silbe, offen und kurz.
      this.silbe({
        freq: oben * stimmung, dur: 0.16, gain: 0.11, delay: spaeter,
        farbe: 2.45, oeffnung: 0.75, fest: true, pan: wo,
      });
      // Zweite Silbe, tiefer und laenger — sie faellt weiter ab.
      this.silbe({
        freq: unten * stimmung, dur: 0.34, gain: 0.12, slide: ziel,
        delay: 0.2 + spaeter, farbe: 4, oeffnung: 0.45, fest: true, pan: wo * 0.7,
      });
    }
  }

  /**
   * Der Ruf des **einzeln** gezuendeten Sprengmeisters: eine Stimme, zwei
   * fallende Silben.
   *
   * Dieselbe Geste wie der Chor beim Weltuntergang, aber solo — es geht ja
   * auch nur einer hoch. Der Abstand zum Chor ist Absicht und traegt
   * Bedeutung: Eine Stimme heisst „dieser da", fuenf heissen „alle".
   */
  private ohNoKlein(): void {
    if (!this.darf('oh-no', 2)) return;
    this.engine.duck(0.2);
    const s0 = 4 + stufenStreuung();
    const unten = ton(s0 - 2);
    this.silbe({ freq: ton(s0), dur: 0.15, gain: 0.11, farbe: 2.45, oeffnung: 0.75, fest: true });
    this.silbe({
      freq: unten, dur: 0.3, gain: 0.12, slide: ton(s0 - 4) / unten,
      delay: 0.19, farbe: 3.6, oeffnung: 0.45, fest: true,
    });
  }

  /**
   * Der Schrei im freien Fall: eine lange Silbe, die mit der Figur faellt.
   *
   * Eine einzige, nicht zwei — ein Schrei hat keine Silbengrenze. Sie beginnt
   * offen und hoch und faellt eine Quinte, waehrend der Vokal sich schliesst:
   * Das ist die Bewegung des Fallens selbst, in Ton uebersetzt. Leise genug,
   * dass zehn Fallende ein Rufen ergeben und kein Konzert; die Stimmenbremse
   * laesst ohnehin nur zwei je Bild durch.
   */
  private schrei(): void {
    if (!this.darf('schrei', 2)) return;
    const s0 = 9 + stufenStreuung();
    this.silbe({
      freq: ton(s0), dur: 0.42, gain: 0.075, slide: ton(s0 - 4) / ton(s0),
      farbe: 2.8, oeffnung: 0.5, pan: (streuung() - 1) * 3,
    });
  }

  /**
   * Das Aufkommen nach einem Sturz: ein weicher Plumps.
   *
   * Der kleine Bruder von `aufprall` — der gehoert dem Tod und bleibt der
   * schwerste Schlag. Dieser hier skaliert mit der Fallhoehe: Fuenf Bildpunkte
   * sind ein Tap, vierzig ein Rumms. Die Hoehe steckt im Ereignis (`n`), nicht
   * in einer Schaetzung des Tons.
   */
  private plumps(fallHoehe: number): void {
    if (!this.darf('plumps')) return;
    const t = Math.min(1, fallHoehe / 40);
    const s = streuung();
    this.engine.tone({
      freq: (340 - t * 80) * s, dur: 0.09 + t * 0.05, type: 'sine',
      gain: 0.08 + t * 0.12, slide: 0.6, attack: 0.004,
    });
    this.engine.noise({
      dur: 0.04 + t * 0.04, gain: 0.03 + t * 0.05, filter: 'bandpass',
      freq: 800 * s, q: 1.1, sweep: 0.5,
    });
  }

  /**
   * Startruf beim Verlassen der Luke: eine kurze, steigende Silbe.
   *
   * Dieselbe Stimme wie `ohNo`, nur andersherum gefahren — der Filter geht auf,
   * die Tonhoehe steigt eine Leiterstufe. Der frueher hier stehende Piepser war
   * ein Geraet; eine Figur, die aus der Luke faellt, soll aber wie eine Figur
   * klingen. Zwei leicht versetzte Stimmen, weil eine allein nach Synthesizer
   * klingt. Davor ein winziges Klacken: die Luke.
   */
  startruf(): void {
    this.neuesBild();
    if (!this.darf('startruf')) return;
    const s0 = 4 + stufenStreuung();
    const f = ton(s0);
    const ziel = ton(s0 + 2) / f;
    this.engine.noise({ dur: 0.022, gain: 0.05, filter: 'bandpass', freq: 1500 * streuung(), q: 2.5 });
    for (let i = 0; i < 2; i++) {
      this.silbe({
        freq: f * (1 + i * 0.012), dur: 0.13, gain: 0.07, slide: ziel,
        delay: 0.015 + i * 0.02, farbe: 2.2, oeffnung: 1.8,
      });
    }
  }

  /**
   * Panik kurz vor der Sprengung: ein zweisilbiges Oh-oh.
   *
   * Im Kleinen dieselbe Geste wie `ohNo`, und genau darum versteht man sie
   * sofort — kuerzer, hoeher und nur eine Leiterstufe fallend statt einer
   * Quinte. Es ist Schreck, nicht Weltuntergang.
   */
  panik(): void {
    this.neuesBild();
    if (!this.darf('panik')) return;
    const s0 = 6 + stufenStreuung();
    this.silbe({ freq: ton(s0), dur: 0.1, gain: 0.09, farbe: 2.6, oeffnung: 0.85 });
    this.silbe({ freq: ton(s0 - 1), dur: 0.14, gain: 0.09, delay: 0.13, farbe: 2.2, oeffnung: 0.6 });
  }

  /**
   * Jubel am Ausgang: drei Silben, leicht hallig.
   *
   * Dreisilbig, weil zwei Silben schon als "Oh nein" belegt sind — gleiche
   * Stimme, andere Anzahl, und man verwechselt die beiden nie. Die Silben
   * steigen ueber die Leiter, die letzte bleibt oben stehen. Der Hall ist kein
   * zweites Effektgeraet, sondern eine leise, dunklere Wiederholung der letzten
   * Silbe: Ein Ausgang ist ein Tor, und aus einem Tor kommt ein Echo.
   *
   * Hoechstens zwei je Bild — drei uebereinandergelegte Rufe sind kein Chor
   * mehr, sondern ein Wort, das niemand versteht.
   */
  jubel(): void {
    this.neuesBild();
    if (!this.darf('jubel', 2)) return;
    const s0 = 4 + stufenStreuung();
    const stufen = [0, 1, 3];
    for (let i = 0; i < 3; i++) {
      this.silbe({
        freq: ton(s0 + stufen[i]),
        dur: i === 2 ? 0.18 : 0.1,
        gain: 0.1,
        delay: i * 0.11,
        farbe: 2.4,
        oeffnung: i === 2 ? 1.5 : 1.15,
        fest: true,
      });
    }
    this.silbe({
      freq: ton(s0 + 3), dur: 0.15, gain: 0.032, delay: 0.31,
      farbe: 1.6, oeffnung: 0.6, fest: true,
    });
  }

  // --- Figuren ---------------------------------------------------------------

  /**
   * Trippelschritte: winziges Tapsen auf Holz, hoch und sehr leise.
   *
   * Hier gilt eine eigene, strengere Dichteregel als Regel 3, und zwar aus
   * einem anderen Grund: Sechzig laufende Figuren erzeugen mehrere hundert
   * Schritte je Sekunde. Selbst auf drei Instanzen beschnitten waere das ein
   * Prasseln — Pegel ohne Aussage. Das Ohr trennt ohnehin keine sechzig
   * Fusspaare, es hoert eine Menge. Also klingt hier die Menge und nicht die
   * einzelne Figur: **ein gemeinsamer Puls**, dessen Lautstaerke mit der Wurzel
   * der Anzahl waechst (doppelt so viele Laeufer klingen nicht doppelt so laut,
   * sondern etwas lauter), und ab einer Handvoll Laeufern zwei bis drei leicht
   * gegeneinander versetzte Tapser statt einem. Das ist der Unterschied zwischen
   * einem Wusel und einer Herde — und mehr als drei Tapser gibt es auch hier nie.
   *
   * ## Der Puls ist jetzt eine Achtel der Musik
   *
   * Vorher lief er auf festen 190 Millisekunden. Das ist die auffaelligste
   * Einzelheit der alten Fassung, sobald man es einmal gehoert hat: Beim Spielen
   * klingen fast durchgehend Schritte, und solange sie eine **eigene Periode**
   * haben, schweben sie gegen den Takt und zerlegen das Klangbild in „Musik"
   * und „Spiel" — egal, wie gut beides fuer sich ist.
   *
   * Jetzt kommt das Mass aus dem laufenden Stueck (`schrittDauer`), und der
   * Einsatz wird auf dessen Raster geschoben (`bisNaechsteAchtel`). Damit wird
   * aus dem haeufigsten Geraeusch des Spiels eine Perkussionsspur. Die Torzeit
   * liegt bei 90 % einer Achtel, damit ein Bild, das ein paar Millisekunden zu
   * frueh kommt, nicht einen ganzen Schlag verschluckt.
   *
   * Die Herde steht dabei **breit** — jeder Tapser an einer anderen Stelle im
   * Panorama. Sechzig Figuren an einem Punkt sind ein Klumpen.
   *
   * @param laufende Wie viele Figuren gerade gehen. 0 schaltet den Puls ab.
   * @param nowMs Dieselbe Uhr, die `handle` bekommt.
   */
  schritte(laufende: number, nowMs: number): void {
    this.neuesBild(nowMs);
    if (laufende <= 0) return;
    const achtelMs = schrittDauer() * 1000;
    if (nowMs - this.letzterSchrittMs < achtelMs * 0.9) return;
    this.letzterSchrittMs = nowMs;
    // Auf den naechsten Schlag warten. Ohne Musik kommt hier null heraus, und
    // dann spielt es sofort — richtig so: Ohne Raster gibt es nichts, worauf man
    // warten koennte.
    const aufsRaster = bisNaechsteAchtel(this.engine.time);
    const menge = Math.min(MAX_GLEICHE, 1 + Math.floor(Math.log2(laufende) / 2));
    const pegel = Math.min(0.05, 0.016 * Math.sqrt(laufende));
    for (let i = 0; i < menge; i++) {
      if (!this.darf('schritt')) return;
      // Der Versatz ist gewuerfelt, weil gleichmaessig versetzte Tapser wie ein
      // Wirbel klingen — eine Herde tritt nie *genau* im Takt. Sie tritt im
      // Takt, und das ist etwas anderes.
      const versatz = aufsRaster + i * (0.012 + Math.random() * 0.022);
      const wo = seite(0.6);
      this.engine.tone({
        freq: ton(9 + stufenStreuung(), 1), dur: 0.022, type: 'triangle',
        gain: pegel, slide: 0.62, delay: versatz, pan: wo,
      });
      this.engine.noise({
        dur: 0.014, gain: pegel * 0.5, filter: 'highpass',
        freq: 4200 * streuung(), delay: versatz, pan: wo,
      });
    }
  }

  /** Startruf beim Verlassen der Falltuer. */
  private spawn(): void {
    this.startruf();
  }

  /**
   * Aufprall: weicher Cartoon-Plopp mit Staubwolke.
   *
   * Bewusst kein realistischer Aufschlag. Ein echter waere ein harter Knacks
   * mit viel Tiefe, und der macht aus einem verlorenen Wusel eine Grausamkeit.
   * Zeichentrick-Grammatik stattdessen: Die *Tonhoehe* faellt, nicht die
   * Lautstaerke, der Einsatz ist weich statt schlagend, und darunter geht eine
   * Staubwolke aus tiefem Rauschen langsam auf, statt anzuschlagen — eine Wolke
   * hat keine Kante. Der Abstieg endet ueber 150 Hz; darunter gibt ein
   * Handylautsprecher nichts mehr wieder, der Ton wuerde nur duenner.
   */
  aufprall(): void {
    this.neuesBild();
    if (!this.darf('aufprall')) return;
    this.engine.duck(0.3);
    const s = streuung();
    this.engine.tone({ freq: 300 * s, dur: 0.16, type: 'sine', gain: 0.24, slide: 0.58, attack: 0.009 });
    this.engine.noise({ dur: 0.05, gain: 0.1, filter: 'bandpass', freq: 700 * s, q: 1.2, sweep: 0.5 });
    this.engine.noise({ dur: 0.26, gain: 0.07, filter: 'lowpass', freq: 1300 * s, sweep: 0.3, delay: 0.04 });
  }

  /**
   * Ins Wasser fallen: dumpfes Blubb, danach aufsteigende Blaeschen.
   *
   * Unter Wasser fehlen die Hoehen — deshalb faehrt der Grundton nach unten
   * weg und das Rauschen liegt hinter einem tiefen Tiefpass. Die Blaeschen
   * steigen dagegen in der Tonhoehe: Kleine Blasen klingen hoeher als grosse,
   * und die kleinen kommen zuletzt. Sie sind gestimmt, weil drei freie
   * Sinusblips ueber der Musik sofort schief klingen.
   */
  wasser(): void {
    this.neuesBild();
    if (!this.darf('wasser')) return;
    this.engine.duck(0.3);
    const s = streuung();
    this.engine.tone({ freq: 260 * s, dur: 0.2, type: 'sine', gain: 0.26, slide: 0.66, attack: 0.014 });
    this.engine.noise({ dur: 0.12, gain: 0.09, filter: 'lowpass', freq: 600 * s, sweep: 0.45 });
    const s0 = 3 + stufenStreuung();
    for (let i = 0; i < 3; i++) {
      this.engine.tone({
        freq: ton(s0 + i * 2), dur: 0.05, type: 'sine', gain: 0.06 - i * 0.008,
        slide: 1.3, delay: 0.14 + i * 0.09, attack: 0.005,
      });
    }
  }

  // --- Faehigkeiten ----------------------------------------------------------

  /** Skill vergeben — Bestaetigung, Klangfarbe je nach Auftrag. */
  private assign(skill?: SkillId): void {
    if (skill === 'blocker') {
      this.stempel();
      return;
    }
    if (!this.darf('assign')) return;
    if (skill === 'bomber') {
      // Tiefer als die uebrigen: Der Auftrag ist endgueltig, und gleich laeuft
      // der Countdown los. Die Tonhoehe kuendigt das an.
      this.engine.tone({ freq: ton(0), dur: 0.09, type: 'triangle', gain: 0.16, slide: 0.76, attack: 0.004 });
      this.engine.noise({ dur: 0.04, gain: 0.06, filter: 'bandpass', freq: 700 * streuung(), q: 1.5 });
      return;
    }
    const s0 = 7 + stufenStreuung();
    this.engine.tone({ freq: ton(s0), dur: 0.05, type: 'triangle', gain: 0.13, slide: ton(s0 + 1) / ton(s0) });
    this.engine.noise({ dur: 0.03, gain: 0.05, filter: 'highpass', freq: 2600 * streuung() });
  }

  /** Arbeitsschritt — Klangfarbe je Beruf. */
  private work(skill?: SkillId): void {
    switch (skill) {
      case 'basher':
        if (this.darf('dig:basher')) this.hackenStein();
        break;
      case 'miner':
        if (this.darf('dig:miner')) this.bohren();
        break;
      case 'digger':
      default:
        if (this.darf('dig:digger')) this.grabenErde();
        break;
    }
  }

  /**
   * Graben in Erde: rhythmisches, koerniges Schaufel-Rascheln.
   *
   * Koernigkeit entsteht nicht durch mehr Rauschen, sondern durch zwei kurze
   * Koerner dicht hintereinander — das Ohr hoert die Luecke dazwischen als
   * Textur. Ein einzelner langer Rauschstoss klingt dagegen nach Wind.
   */
  private grabenErde(): void {
    const s = streuung();
    // Jeder Graeber an einer anderen Stelle im Panorama — sonst sind zwanzig
    // Schaufeln ein Klumpen statt einer Baustelle. Beide Koerner an derselben
    // Stelle: Sie sind ein Ereignis, nicht zwei.
    const wo = seite();
    this.engine.noise({ dur: 0.055, gain: 0.11, filter: 'lowpass', freq: 1400 * s, sweep: 0.35, pan: wo });
    this.engine.noise({
      dur: 0.04, gain: 0.07, filter: 'bandpass', freq: 900 * s, q: 0.8, sweep: 0.6,
      delay: 0.045 + Math.random() * 0.02, pan: wo,
    });
  }

  /**
   * Hacken in Stein: heller metallischer Chink mit kurzem Nachklang.
   *
   * Metall erkennt das Ohr am *unharmonischen* Teilton: Der zweite Ton steht
   * hier bei Faktor 2,76 ueber dem ersten, in keiner Oktave — dasselbe
   * Verhaeltnis wie in `glocke()`. Ohne ihn waere es ein Holzschlag mit
   * Rauschen. Der Nachklang ist absichtlich kurz: Eine Spitzhacke ist kein
   * Amboss, und bei drei Rammern uebereinander wuerde jeder laengere Ausklang
   * die naechsten Schlaege zudecken.
   */
  private hackenStein(): void {
    const wo = seite();
    this.engine.noise({
      dur: 0.045, gain: 0.11, filter: 'bandpass', freq: 3200 * streuung(), q: 1.6, sweep: 0.55,
      pan: wo,
    });
    const f = ton(9 + stufenStreuung(), 1);
    this.engine.tone({ freq: f, dur: 0.16, type: 'sine', gain: 0.075, attack: 0.002, pan: wo });
    this.engine.tone({ freq: f * 2.76, dur: 0.09, type: 'sine', gain: 0.03, attack: 0.001, pan: wo });
  }

  /**
   * Bohren: gedaempftes Rumpeln mit Steinbroeckeln.
   *
   * Das Rumpeln liegt hinter einem tiefen Tiefpass, der noch weiter zufaehrt —
   * der Schraegbagger arbeitet *im* Berg, und alles, was von dort kommt, hat
   * keine Hoehen mehr. Das Broeckeln obendrauf sitzt an einer gewuerfelten
   * Stelle: regelmaessig gesetzt klaenge es nach Maschine statt nach fallendem
   * Gestein.
   */
  private bohren(): void {
    const s = streuung();
    const wo = seite(0.45);
    this.engine.noise({ dur: 0.15, gain: 0.1, filter: 'lowpass', freq: 520 * s, sweep: 0.6, pan: wo });
    this.engine.noise({
      dur: 0.022, gain: 0.05, filter: 'bandpass', freq: 2600 * streuung(4), q: 3,
      delay: 0.05 + Math.random() * 0.08, pan: wo,
    });
  }

  /**
   * Brueckenstufe legen: ein Pling, mit jeder Stufe eine hoeher.
   *
   * Der Brueckenbauer hat genau zwoelf Stufen, und die Leiter reicht genau
   * zwoelf Stufen weit (`STUFEN`). Aus dem Baufortschritt wird damit von selbst
   * eine aufsteigende Leiter ueber zwei Oktaven: Man hoert, wie viel Bruecke
   * noch kommt, ohne hinzusehen, und die letzte Stufe ist zugleich der
   * Schlusston.
   *
   * Dass hier der Pling steht und nicht mehr ein Dreieckston mit Rauschen, ist
   * kein Schoenheitsgriff: Der Brueckenbau ist die einzige Stelle im Spiel, an
   * der ein Geraeusch **eine Melodie spielt**. Wenn es dabei genau so klingt wie
   * der Anschlag unter der Melodie der Musik, gehoert es dazu.
   *
   * Hier gilt Regel 2 nicht fuer die Tonhoehe — sie *ist* die Information, und
   * gewuerfelt waere die Leiter zerhackt. Gestreut wird stattdessen das
   * Anschlagsgeraeusch; auch damit klingt kein Klack wie der vorige. Die hohen
   * Stufen sind kuerzer und leiser als die tiefen, weil kurze Staebe kuerzer
   * klingen — und weil sonst ausgerechnet die letzten Klacks stechen.
   */
  private brick(n?: number): void {
    const stufe =
      n === undefined
        ? this.brueckeStufe % BUILD_BRICKS
        : Math.min(BUILD_BRICKS - 1, Math.max(0, BUILD_BRICKS - 1 - n));
    this.brueckeStufe = stufe + 1;
    if (!this.darf('brick')) return;
    const hoehe = stufe / (BUILD_BRICKS - 1);
    // Schlank, weil bis zu drei Bauer im selben Bild eine Stufe legen koennen
    // und die Stimmenbremse Teiltoene zaehlt — siehe `pling`. Ein voller Pling
    // liesse den zweiten und dritten Klack ausfallen, und gerade hier traegt die
    // Tonhoehe die Aussage.
    //
    // Der frueher hier stehende zusaetzliche Rauschtupfer ist weg: Der Pling
    // bringt seinen Anschlag mit, und zwei Anschlaege uebereinander sind kein
    // schaerferer Klack, sondern ein breiigerer.
    pling(this.engine, {
      freq: ton(stufe), dur: 0.2 - 0.07 * hoehe, gain: 0.1 - 0.03 * hoehe,
      bus: 'sfx', fest: false, pan: seite(0.3), schlank: true,
    });
  }

  /**
   * Blocker setzen: satter Stempel-Thud mit Gummi-Nachfedern.
   *
   * Das Nachfedern ist der ganze Witz: zwei immer kuerzere Wiederholungen, jede
   * eine Spur hoeher. Gummi verliert beim Springen Energie, der Kontakt wird
   * dabei kuerzer, und kuerzerer Kontakt klingt hoeher — genau das macht aus
   * einem Schlag einen Gummi-Schlag. Der Grundton bleibt ueber 150 Hz, sonst
   * bleibt vom "satt" auf einem Handy nichts uebrig.
   */
  private stempel(): void {
    if (!this.darf('stempel')) return;
    const f = 205 * streuung(1.5);
    this.engine.tone({ freq: f, dur: 0.15, type: 'sine', gain: 0.28, slide: 0.82, attack: 0.006 });
    this.engine.noise({ dur: 0.05, gain: 0.12, filter: 'lowpass', freq: 900, sweep: 0.4 });
    this.engine.tone({ freq: f * 1.2, dur: 0.08, type: 'sine', gain: 0.1, slide: 0.85, delay: 0.13 });
    this.engine.tone({ freq: f * 1.45, dur: 0.045, type: 'sine', gain: 0.045, delay: 0.21 });
  }

  /**
   * Schirm oeffnen: Stoff-Plopp mit Luftzug.
   *
   * Zwei Teile, und ihre Reihenfolge ist der Sinn: erst der kurze, resonante
   * Plopp (der Stoff schlaegt auf), dann der laenger werdende Luftzug (er faengt
   * an zu tragen). Der Luftzug faehrt im Filter nach unten, weil sich die Luft
   * im Schirm beruhigt. Der Ton dazwischen steigt eine Leiterstufe — auch ein
   * Rutscher soll auf einem Ton der Tonart landen, nicht irgendwo.
   */
  schirm(): void {
    this.neuesBild();
    if (!this.darf('schirm')) return;
    const s0 = 2 + stufenStreuung();
    const f = ton(s0);
    this.engine.noise({ dur: 0.05, gain: 0.13, filter: 'bandpass', freq: 950 * streuung(), q: 3.5, sweep: 0.7 });
    this.engine.tone({ freq: f, dur: 0.12, type: 'triangle', gain: 0.09, slide: ton(s0 + 2) / f, attack: 0.012 });
    this.engine.noise({
      dur: 0.28, gain: 0.055, filter: 'highpass', freq: 1800 * streuung(), sweep: 0.35, delay: 0.04,
    });
  }

  /**
   * Klettern: kurzes, feuchtes Saugnapf-Schlurfen.
   *
   * Feucht heisst hier: ein schmales Band mit hoher Guete, das nach oben
   * faehrt. Ein Saugnapf, der sich loest, zieht seine Resonanz mit — deshalb
   * der Aufwaertssweep im Filter *und* im Ton. Breitbandiges Rauschen klaenge
   * dagegen trocken, nach Sandpapier.
   */
  klettern(): void {
    this.neuesBild();
    if (!this.darf('klettern')) return;
    const s = streuung();
    this.engine.noise({ dur: 0.09, gain: 0.09, filter: 'bandpass', freq: 480 * s, q: 5, sweep: 2.6 });
    this.engine.tone({ freq: 230 * s, dur: 0.07, type: 'triangle', gain: 0.05, slide: 1.7, attack: 0.008 });
  }

  /** Funken beim Stahlkontakt: hell, hart, kurz. */
  private steel(): void {
    if (!this.darf('steel')) return;
    const s = streuung();
    this.engine.noise({ dur: 0.09, gain: 0.16, filter: 'highpass', freq: 3400 * s, sweep: 1.6 });
    this.engine.tone({ freq: 2100 * s, dur: 0.06, type: 'square', gain: 0.07, slide: 1.5 });
  }

  /**
   * Sprengung: runder Cartoon-Bumms mit Glitzer-Schwanz.
   *
   * Absichtlich harmlos, und das ist Arbeit: Ein realistischer Knall lebt vom
   * harten Anschlagsknacks und von viel Tiefe — beides ist hier weg. Der Koerper
   * setzt mit zehn Millisekunden Anstieg ein (das nimmt dem Schlag die Kante)
   * und faellt auf gut 150 Hz, statt in den Keller zu rutschen, wo ihn ohnehin
   * kein Handylautsprecher wiedergibt. Danach kommt der eigentliche Trick: eine
   * Handvoll gestimmter Funken, die nach oben davonstieben. Ein Comic-Bumms ist
   * nicht leiser als ein echter, er ist nur freundlicher.
   *
   * Der Glitzer laeuft ohne Ausnahme durch die Stimmenbremse: Wenn ein Bild
   * voll ist, darf er ausfallen — der Bumms nicht.
   */
  private explode(): void {
    if (!this.darf('explode')) return;
    this.engine.duck(0.35);
    const s = streuung();
    this.engine.tone({
      freq: 235 * s, dur: 0.3, type: 'sine', gain: 0.38, slide: 0.73, attack: 0.01, ignoreLimit: true,
    });
    this.engine.noise({
      dur: 0.34, gain: 0.24, filter: 'lowpass', freq: 1500 * s, sweep: 0.22, ignoreLimit: true,
    });
    // Der Luftstoss: kurz und breit, aber ohne Knacks am Anfang.
    this.engine.noise({
      dur: 0.12, gain: 0.13, filter: 'bandpass', freq: 1100 * s, q: 0.6, sweep: 1.8, ignoreLimit: true,
    });
    const s0 = 5 + stufenStreuung();
    for (let i = 0; i < 3; i++) {
      this.engine.tone({
        freq: ton(s0 + i * 2, 1), dur: 0.1, type: 'sine', gain: 0.07 - i * 0.016,
        delay: 0.07 + i * 0.06, attack: 0.002,
        // Die Funken stieben nach oben *und* auseinander, und sie gehen ins
        // Echo: Ein Comic-Bumms endet nicht, er klingt aus.
        pan: (i - 1) * 0.45, echo: 0.3,
      });
    }
  }

  /**
   * Sprengcountdown. Laut Dokument der lauteste Ton im Spiel — und je naeher
   * die Null, desto hoeher und draengender.
   *
   * Die Tonhoehe zaehlt hier mit, sie darf also nicht wuerfeln (Regel 2,
   * Ausnahme). Sie steigt aber nicht mehr linear in Hertz, sondern ueber die
   * Leiter: vier Toene, die zur Musik passen, und trotzdem eine hoerbare
   * Steigerung. Gestreut wird der Rauschanteil.
   */
  private fuse(secondsLeft: number): void {
    const urgency = Math.max(0, Math.min(4, 5 - secondsLeft));
    this.engine.tone({
      freq: ton(5 + urgency),
      dur: 0.1,
      type: 'square',
      gain: 0.3 + urgency * 0.05,
      ignoreLimit: true,
    });
    this.engine.noise({
      dur: 0.03, gain: 0.06, filter: 'highpass', freq: 3000 * streuung(), ignoreLimit: true,
    });
  }

  // --- Rettung und Verlust ---------------------------------------------------

  /**
   * Rettung: aufsteigender Jingle, gestapelt. Bei einer Massenrettung entsteht
   * daraus eine Melodie — das ist der Belohnungsmoment (§7).
   *
   * Auch hier traegt die Tonhoehe die Aussage (die wievielte Rettung ist das?),
   * also wird sie nicht gewuerfelt. Der Jubelruf kommt nur beim ersten Ton
   * einer Kette: Sechzig Rufe uebereinander waeren Laerm, einer plus die
   * folgende Melodie ist eine Feier.
   */
  private saved(nowMs: number): void {
    if (nowMs - this.lastSaveMs > SAVE_CHAIN_MS) this.saveStep = 0;
    this.lastSaveMs = nowMs;
    if (!this.darf('saved')) return;
    if (this.saveStep === 0) this.jubel();
    this.engine.duck(0.25);
    const stufe = Math.min(this.saveStep, STUFEN - 1);
    this.saveStep++;
    const f = ton(stufe, 1);
    // Mitte, kein Panorama: Die Rettung ist die Aussage des ganzen Spiels und
    // steht nicht am Rand. Der Oberton geht ins Echo — bei einer Massenrettung
    // entsteht daraus eine Girlande, die ueber der Kette stehenbleibt.
    this.engine.tone({ freq: f, dur: 0.16, type: 'triangle', gain: 0.2, ignoreLimit: true });
    this.engine.tone({
      freq: f * 2, dur: 0.1, type: 'sine', gain: 0.09, delay: 0.02, ignoreLimit: true, echo: 0.3,
    });
  }

  /** Tod: kurzer, tiefer Puls. Jeder Verlust soll spuerbar sein. */
  private died(cause?: DeathCause): void {
    if (cause === DeathCause.EXPLOSION) return; // Die Sprengung war laut genug.
    if (cause === DeathCause.SPLAT) {
      this.aufprall();
      return;
    }
    if (!this.darf('died')) return;
    this.engine.duck(0.3);
    const s = streuung();
    // Der Abstieg endet knapp ueber 150 Hz — tiefer waere er auf einem Handy
    // nicht dunkler, sondern nur duenner.
    this.engine.tone({ freq: 210 * s, dur: 0.22, type: 'sawtooth', gain: 0.2, slide: 0.82, attack: 0.006 });
    this.engine.noise({ dur: 0.14, gain: 0.09, filter: 'lowpass', freq: 700 * s, sweep: 0.4 });
  }

  // --- Bedienung -------------------------------------------------------------
  //
  // Diese Klaenge zaehlen nicht gegen Regel 3, und das ist Absicht: Sie
  // entstehen aus einer Fingerbewegung, und mehr als eine davon gibt es pro
  // Bild nicht. Ein Zaehler koennte hier nur schaden — naemlich dann, wenn er
  // aus einem Bild ohne Weltereignisse noch gefuellt waere und das naechste
  // Tippen verschluckt. Alle liegen unter 200 Millisekunden.

  /**
   * Werkzeug gewaehlt: ein Pling plus Holzblock.
   *
   * Die Tonhoehe haengt am Werkzeug, nicht am Zufall — acht Werkzeuge, acht
   * Stufen der Leiter. Wer eine Weile spielt, hoert, was er gewaehlt hat, ohne
   * hinzusehen; die Streuung aus Regel 2 wuerde genau das zerstoeren. Gestreut
   * wird deshalb der Holzblock, dessen Tonhoehe nichts bedeutet.
   *
   * Der Pling ist hier bewusst dasselbe Objekt wie der Anschlag unter der
   * Melodie: Es ist der Klang, den man beim Spielen am haeufigsten bewusst
   * ausloest, und deshalb der beste Ort fuer das Erkennungszeichen des Spiels.
   */
  werkzeugGewaehlt(skill?: SkillId): void {
    const i = skill ? Math.max(0, SKILLS.indexOf(skill)) : 0;
    pling(this.engine, { freq: ton(i), dur: 0.24, gain: 0.12, bus: 'sfx', fest: false });
    woodblock(this.engine, { freq: 1250 * streuung(), gain: 0.06, bus: 'sfx', fest: false });
  }

  /**
   * Werkzeug nicht verfuegbar: freundlicher Holzblock-Buzz.
   *
   * Kein Fehlerton. Ein Summer oder ein fallender Halbton sagt "du hast etwas
   * falsch gemacht" — hier ist aber nichts falsch, es ist nur nichts mehr da.
   * Also zweimal derselbe leise Holzblock dicht hintereinander, unterlegt mit
   * einem kurzen Schnurren: die Geste eines Kopfschuettelns, nicht die eines
   * Alarms. Derselbe Ton zweimal bleibt ausserdem in jeder Harmonie richtig,
   * auch beim zehnten Tippen. Nicht tiefer als diese Stufe: Der Holzblock
   * rutscht im Ausklang eine Oktave ab, und darunter bleibt auf einem
   * Handylautsprecher nichts mehr uebrig.
   */
  werkzeugFehlt(): void {
    const f = ton(2);
    woodblock(this.engine, { freq: f, gain: 0.09, bus: 'sfx', fest: false });
    woodblock(this.engine, { freq: f, gain: 0.06, delay: 0.075, bus: 'sfx', fest: false });
    this.engine.noise({ dur: 0.09, gain: 0.045, filter: 'bandpass', freq: 320 * streuung(), q: 4, sweep: 0.8 });
  }

  /**
   * Geschwindigkeit umgeschaltet: kurzer Aufwaertssweep.
   *
   * Aufwaerts heisst schneller, und das ist keine Verabredung, sondern
   * Erfahrung: Was sich schneller dreht, klingt hoeher. Der Sweep faehrt von
   * einer Leiterstufe zur anderen, damit auch ein Rutscher auf einem Ton der
   * Tonart landet. Halbes Tempo ist derselbe Klang rueckwaerts — ein eigener
   * Klang dafuer waere eine Vokabel mehr, die niemand lernen muss.
   */
  tempo(schnell = true): void {
    const von = schnell ? 2 : 9;
    const nach = schnell ? 9 : 2;
    const f = ton(von);
    this.engine.tone({
      freq: f, dur: 0.13, type: 'triangle', gain: 0.12, slide: ton(nach) / f, attack: 0.006,
      filterHz: f * 4, filterSweep: schnell ? 2.4 : 0.4,
    });
    this.engine.noise({
      dur: 0.1, gain: 0.05, filter: 'highpass', freq: (schnell ? 1200 : 4000) * streuung(),
      sweep: schnell ? 3 : 0.3,
    });
  }

  /**
   * Pause an und aus: Filtersweep runter beziehungsweise rauf.
   *
   * Dasselbe Bild wie bei der Musik (`Music.update` faehrt dort einen Tiefpass
   * auf 400 Hz): Beim Pausieren rueckt alles weg, statt abzureissen. Dieser
   * Klang ist die Bewegung dazu — ein Ton, dem die Hoehen abhanden kommen und
   * beim Fortsetzen wieder zuwachsen. Der Filter der Engine hat eine hohe Guete,
   * deshalb hoert man den Sweep selbst und nicht nur sein Ergebnis.
   */
  pause(an: boolean): void {
    const f = ton(an ? 5 : 0);
    const ziel = ton(an ? 0 : 5) / f;
    this.engine.tone({
      freq: f, dur: 0.19, type: 'sawtooth', gain: 0.09, slide: ziel, attack: 0.008,
      filterHz: an ? f * 8 : f * 1.2, filterSweep: an ? 0.18 : 7,
    });
  }

  /**
   * Knopf tippen: ein trockener Pling.
   *
   * Trocken heisst kurz: Ein nachklingender Knopf klebt am naechsten Tippen
   * fest. Die Stufe wuerfelt, weil ein Knopf oft und schnell hintereinander
   * gedrueckt wird — genau der Fall, fuer den Regel 2 da ist.
   *
   * Derselbe Klang wie die Werkzeugwahl, nur kuerzer und leiser. Das ist
   * Absicht: Ein Spiel, in dem jede Schaltflaeche ihren eigenen huebschen Klang
   * hat, hat kein Klangbild, sondern eine Sammlung.
   */
  knopf(): void {
    pling(this.engine, {
      freq: ton(7 + stufenStreuung()), dur: 0.16, gain: 0.095, bus: 'sfx', fest: false,
    });
  }
}
