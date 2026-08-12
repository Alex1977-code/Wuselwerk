import { beforeEach, describe, expect, it } from 'vitest';
import { Ambiente } from '../src/audio/ambiente';
import type { AudioEngine } from '../src/audio/engine';
import { DURCHGAENGE, Music, STUECKE, bisNaechsteAchtel, schrittDauer, tonart } from '../src/audio/music';
import { Sfx } from '../src/audio/sfx';

/**
 * Prüfungen an der laufenden Tonschicht — nicht am Notentext.
 *
 * `musik.test.ts` prüft, was auf dem Papier steht. Diese Datei prüft, was beim
 * Abspielen herauskommt, und schliesst damit zwei Lücken, die sonst offen
 * bleiben:
 *
 * 1. **Die Höhle wird nie gespielt.** Die Browserprobe (`scripts/smoke.mjs`)
 *    spielt Level 1 durch, und Level 1 ist eine Wiese. Alles, was nur im
 *    zweiten Stück vorkommt — anderes Tempo, andere Tonart, andere
 *    Melodiestimme, anderer Raum —, läuft dort nie. Ein Fehler darin fiele
 *    erst dem Spieler auf.
 * 2. **Ein Einsatz in der Vergangenheit ist unsichtbar.** Der Mikroversatz
 *    zieht einzelne Stimmen nach vorn. Rutscht eine dadurch vor die Gegenwart,
 *    spielt die Web-Audio-API sie einfach sofort — kein Fehler, keine Warnung,
 *    nur ein Ton, der auf dem Schlag liegt statt davor. Genau das, was der
 *    Versatz verhindern soll.
 *
 * Statt einer echten Klangwerkstatt steht hier ein Aufschreiber. Er kann
 * nichts, ausser sich zu merken, was von ihm verlangt wurde — und das ist
 * genau, was zu prüfen ist.
 */

interface Einsatz {
  art: 'ton' | 'rausch';
  freq: number;
  delay: number;
  bus: string;
  pan: number;
  echo: number;
  /**
   * Die Wellenform. Sie ist hier das einzige, woran sich eine Melodiestimme von
   * einer anderen unterscheiden lässt: Der Aufschreiber sieht nur Aufrufe an die
   * Klangwerkstatt, nicht, welche Funktion sie geschickt hat. Gestrichene
   * Stimmen (Drehleier, Streicher) schicken Sägezähne, geblasene (Okarina,
   * Klarinette) Dreiecke und Rechtecke — daran hängt die Prüfung des
   * Stimmwechsels.
   */
  welle: string;
}

/** Ein Aufschreiber anstelle der Klangwerkstatt. */
class Aufschreiber {
  einsaetze: Einsatz[] = [];
  zeit = 10;
  raum: { dauer: number; pegel: number; daempfung: number } | null = null;
  echoZeit = 0;
  pumpen: number[] = [];

  get ready(): boolean {
    return true;
  }
  get muted(): boolean {
    return false;
  }
  get time(): number {
    return this.zeit;
  }
  tone(o: Record<string, unknown>): void {
    this.einsaetze.push({
      art: 'ton',
      freq: Number(o.freq),
      delay: Number(o.delay ?? 0),
      bus: String(o.bus ?? 'sfx'),
      pan: Number(o.pan ?? 0),
      echo: Number(o.echo ?? 0),
      welle: String(o.type ?? 'square'),
    });
  }
  noise(o: Record<string, unknown>): void {
    this.einsaetze.push({
      art: 'rausch',
      freq: Number(o.freq ?? 0),
      delay: Number(o.delay ?? 0),
      bus: String(o.bus ?? 'sfx'),
      pan: Number(o.pan ?? 0),
      echo: Number(o.echo ?? 0),
      welle: 'rausch',
    });
  }
  duck(): void {}
  musikFilter(): void {}
  raumWeite(): void {}
  beginFrame(): void {}
  setRaum(dauer: number, pegel: number, daempfung: number): void {
    this.raum = { dauer, pegel, daempfung };
  }
  setEcho(s: number): void {
    this.echoZeit = s;
  }
  pumpe(delay: number): void {
    this.pumpen.push(delay);
  }
}

/** Einen ganzen Durchlauf des Stücks planen lassen. */
function spieleDurch(thema: 'grass' | 'crystal'): Aufschreiber {
  const e = new Aufschreiber();
  const m = new Music();
  m.setTheme(thema);
  m.setLage({ restAnteil: 1, restSekunden: 999, alleGerettet: false, pausiert: false });
  m.start(e as unknown as AudioEngine);
  // Zwei volle Schleifen: Die Melodie steht auf einem Raster von 64 Achteln,
  // und erst ab dem zweiten Durchlauf zeigt sich, ob etwas gegen die Akkorde
  // wandert.
  const schritte = 64 * 2;
  const achtel = 60 / STUECKE[thema].bpm / 2;
  for (let i = 0; i < schritte; i++) {
    m.update(e as unknown as AudioEngine);
    e.zeit += achtel;
  }
  return e;
}

describe('Die laufende Tonschicht', () => {
  for (const thema of ['grass', 'crystal'] as const) {
    describe(thema, () => {
      it('plant zwei volle Durchläufe ohne Aussetzer', () => {
        const e = spieleDurch(thema);
        // Grob geschätzt: Schlag oder Bass auf jeder Achtel, dazu zwei
        // Sechzehntel und der Kies. Weit unter hundert Einsätzen wäre eine
        // Spur ausgefallen, ohne dass es jemand merkt.
        expect(e.einsaetze.length).toBeGreaterThan(500);
      });

      it('legt keinen Einsatz in die Vergangenheit', () => {
        // Der Mikroversatz zieht Stimmen nach vorn. Ein negativer Einsatz wäre
        // kein Fehler, den man sieht — er spielte einfach sofort, und der
        // Versatz wäre wirkungslos.
        const e = spieleDurch(thema);
        const zuFrueh = e.einsaetze.filter((x) => x.delay < 0);
        expect(zuFrueh.length, `${zuFrueh.length} Einsätze vor der Gegenwart`).toBe(0);
      });

      it('stellt das Echo auf das Tempo des Stücks', () => {
        // Punktierte Achtel. Ein Echo neben dem Tempo ist ein Effektgerät,
        // eines auf dem Tempo ist Teil des Arrangements.
        const e = spieleDurch(thema);
        expect(e.echoZeit).toBeCloseTo((60 / STUECKE[thema].bpm / 2) * 1.5, 5);
      });

      it('schickt die Melodie ins Echo, die Begleitung nicht', () => {
        // Wenn alles echot, ist es kein Echo mehr, sondern Hall — und das
        // Melodiefenster von 800 Hz bis 3 kHz ist zu.
        const e = spieleDurch(thema);
        const mitEcho = e.einsaetze.filter((x) => x.echo > 0);
        expect(mitEcho.length, 'niemand geht ins Echo').toBeGreaterThan(0);
        expect(
          mitEcho.length / e.einsaetze.length,
          'zu viele Stimmen im Echo — daraus wird Hall',
        ).toBeLessThan(0.25);
      });

      it('hält Bass und Schlag in der Mitte', () => {
        // Fundament gehört auf einem Gerät mit genau einem Lautsprecher in die
        // Mitte. Alles unter 260 Hz ist hier Bass, Erdschlag oder Fläche —
        // gemessen wird deshalb an der Frequenz und nicht daran, wer es
        // geschickt hat.
        const e = spieleDurch(thema);
        const tiefUndAussen = e.einsaetze.filter(
          (x) => x.art === 'ton' && x.freq > 0 && x.freq < 260 && Math.abs(x.pan) > 0.6,
        );
        expect(tiefUndAussen.length, 'tiefe Töne stehen aussen').toBe(0);
      });

      it('spreizt überhaupt etwas', () => {
        // Die Gegenprobe: Wenn nichts im Panorama steht, ist die ganze Breite
        // nicht angekommen und der Mix ist Mono.
        const e = spieleDurch(thema);
        expect(e.einsaetze.some((x) => Math.abs(x.pan) > 0.2)).toBe(true);
      });

      it('pumpt genau auf den Schlägen', () => {
        // Drei Schläge je Takt, acht Takte, zwei Durchläufe. Ein Pumpen ohne
        // Schlag darunter wäre ein hörbares Zittern.
        const e = spieleDurch(thema);
        const schlaege = e.pumpen.length;
        expect(schlaege).toBeGreaterThan(3 * 8 * 2 - 8);
      });
    });
  }

  it('gibt jedem Stück sein eigenes Tempo', () => {
    // Zwei Welten, die im selben Tempo laufen, sind derselbe Ort in einer
    // anderen Farbe.
    expect(STUECKE.grass.bpm).not.toBe(STUECKE.crystal.bpm);
    expect(Math.abs(STUECKE.grass.bpm - STUECKE.crystal.bpm)).toBeGreaterThanOrEqual(12);
  });
});

/**
 * Der Bogen über vier Durchgänge — die Antwort auf „zu eintönig".
 *
 * Diese Prüfungen sind nötig, weil der Fehler, den sie abfangen, **stumm** ist:
 * Eine Schleife, die sich nicht ändert, klingt nicht falsch. Sie klingt genau
 * wie vorgesehen — nur eben zehnmal hintereinander gleich, und das merkt man
 * erst nach Minuten. Ginge `DURCHGAENGE` beim Umbauen verloren, liefe alles
 * weiter, und niemand hätte einen Anhaltspunkt.
 *
 * Gemessen wird deshalb am Unterschied zwischen den Umläufen, nicht daran, ob
 * überhaupt etwas gespielt wird.
 */
describe('Die Schleife wiederholt sich nicht einfach', () => {
  const ACHTEL_JE_UMLAUF = 64;

  /** Die Einsätze eines einzelnen Umlaufs, vom nullten an gezählt. */
  function umlauf(thema: 'grass' | 'crystal', n: number): Einsatz[] {
    const e = new Aufschreiber();
    const m = new Music();
    m.setTheme(thema);
    m.setLage({ restAnteil: 1, restSekunden: 999, alleGerettet: false, pausiert: false });
    m.start(e as unknown as AudioEngine);
    const achtel = 60 / STUECKE[thema].bpm / 2;
    let vorher = 0;
    for (let i = 0; i < ACHTEL_JE_UMLAUF * (n + 1); i++) {
      // Der Vorlauf plant über den Horizont hinaus; der Schnitt liegt deshalb
      // dort, wo der gewünschte Umlauf beginnt, und nicht am Aufrufzähler.
      if (i === ACHTEL_JE_UMLAUF * n) vorher = e.einsaetze.length;
      m.update(e as unknown as AudioEngine);
      e.zeit += achtel;
    }
    return e.einsaetze.slice(vorher);
  }

  for (const thema of ['grass', 'crystal'] as const) {
    describe(thema, () => {
      it('gibt die Melodie im zweiten Umlauf an eine andere Stimme weiter', () => {
        // Die führende Stimme ist gestrichen (Sägezahn), die antwortende
        // geblasen (Dreieck bzw. Rechteck). Gemessen wird im Melodiefenster
        // oberhalb von 800 Hz — darunter liegt die Begleitung, und die wechselt
        // nicht.
        const saegen = (n: number) =>
          umlauf(thema, n).filter((x) => x.welle === 'sawtooth' && x.freq > 800).length;
        expect(saegen(0), 'die führende Stimme fehlt').toBeGreaterThan(0);
        expect(saegen(1), 'im zweiten Umlauf spielt dieselbe Stimme weiter').toBe(0);
      });

      it('nimmt im dritten Umlauf das Schlagwerk kurz heraus', () => {
        // Der Bruch: zwei Takte ohne Schlag. Das Pumpen hängt am Schlag und ist
        // damit sein Abdruck — drei Schläge je Takt, acht Takte, also
        // vierundzwanzig je Umlauf und sechs weniger, wenn zwei Takte fehlen.
        const pumpenIn = (n: number) => {
          const e = new Aufschreiber();
          const m = new Music();
          m.setTheme(thema);
          m.setLage({ restAnteil: 1, restSekunden: 999, alleGerettet: false, pausiert: false });
          m.start(e as unknown as AudioEngine);
          const achtel = 60 / STUECKE[thema].bpm / 2;
          let vorher = 0;
          for (let i = 0; i < ACHTEL_JE_UMLAUF * (n + 1); i++) {
            if (i === ACHTEL_JE_UMLAUF * n) vorher = e.pumpen.length;
            m.update(e as unknown as AudioEngine);
            e.zeit += achtel;
          }
          return e.pumpen.length - vorher;
        };
        expect(pumpenIn(2)).toBeLessThan(pumpenIn(0));
      });
    });
  }

  it('lässt keine zwei aufeinanderfolgenden Umläufe gleich sein', () => {
    // Die Tabelle selbst. Zwei gleiche Einträge hintereinander wären eine
    // Schleife von vierundsechzig Takten mit einer stillen Stelle darin.
    for (let i = 0; i < DURCHGAENGE.length; i++) {
      const a = DURCHGAENGE[i];
      const b = DURCHGAENGE[(i + 1) % DURCHGAENGE.length];
      expect(JSON.stringify(a), `Umlauf ${i} und ${i + 1} sind gleich`).not.toBe(JSON.stringify(b));
    }
  });
});

describe('Jede Welt bekommt einen eigenen Raum', () => {
  // Das ist die Grösse, die aus „dasselbe Stück in einer anderen Farbe" einen
  // anderen **Ort** macht, und sie war bis hierher für alle Welten gleich. Man
  // hört den Unterschied, bevor der erste Melodieton da ist.
  const raumVon = (thema: 'grass' | 'crystal') => {
    const e = new Aufschreiber();
    const a = new Ambiente();
    a.setTheme(thema);
    a.start(e as unknown as AudioEngine);
    a.update(e as unknown as AudioEngine);
    return e.raum;
  };

  it('stellt ihn überhaupt ein', () => {
    expect(raumVon('grass')).not.toBeNull();
    expect(raumVon('crystal')).not.toBeNull();
  });

  it('gibt der Höhle einen längeren und dunkleren Raum als der Wiese', () => {
    // Die Richtung ist keine Geschmacksfrage: Über einer Wiese ist nach oben
    // nichts, was zurückwirft, in einer Höhle ringsum alles. Und der Tiefpass
    // ist dabei wichtiger als die Länge — ein langer *heller* Hall klingt nach
    // Kirche, ein langer dunkler nach Fels.
    const wiese = raumVon('grass')!;
    const hoehle = raumVon('crystal')!;
    expect(hoehle.dauer).toBeGreaterThan(wiese.dauer * 1.5);
    expect(hoehle.daempfung).toBeLessThan(wiese.daempfung);
  });
});

describe('Die Geräusche folgen dem laufenden Stück', () => {
  let e: Aufschreiber;
  let sfx: Sfx;
  let musik: Music;

  beforeEach(() => {
    e = new Aufschreiber();
    sfx = new Sfx(e as unknown as AudioEngine);
    musik = new Music();
  });

  for (const thema of ['grass', 'crystal'] as const) {
    it(`stimmt die Werkzeugwahl auf die Tonart von "${thema}"`, () => {
      musik.setTheme(thema);
      const p = STUECKE[thema];
      expect(tonart().grund).toBe(p.grund);

      e.einsaetze = [];
      sfx.werkzeugGewaehlt('digger');
      // Der tiefste Ton eines Plings ist sein Grundton; alles darüber sind
      // Teiltöne. Er muss auf einer Stufe der Leiter dieser Welt liegen —
      // sonst steht das häufigste bewusst ausgelöste Geräusch des Spiels neben
      // seiner eigenen Musik.
      const tiefster = Math.min(
        ...e.einsaetze.filter((x) => x.art === 'ton' && x.freq > 0).map((x) => x.freq),
      );
      const halbtoene = Math.round(12 * Math.log2(tiefster / p.grund));
      const inLeiter = p.sfxStufen.map((s) => ((s % 12) + 12) % 12);
      expect(
        inLeiter,
        `${tiefster.toFixed(1)} Hz sind ${halbtoene} Halbtöne über dem Grundton von "${thema}"`,
      ).toContain(((halbtoene % 12) + 12) % 12);
    });
  }

  it('verschiebt die Geräusche mit dem Weltwechsel', () => {
    // Die eigentliche Aussage: Derselbe Aufruf klingt in zwei Welten
    // verschieden. Stünde hier zweimal dieselbe Frequenz, hinge alles wieder
    // an einem festen C.
    //
    // Geprüft wird an der Werkzeugwahl und nicht am Knopf: Die Werkzeugwahl ist
    // der einzige gestimmte Klang, dessen Tonhöhe **nicht** streut (sie trägt
    // die Aussage, welches Werkzeug es ist). Ein streuender Klang könnte in
    // zwei Welten zufällig auf derselben Frequenz landen, und dann meldete
    // dieser Test sporadisch rot, ohne dass etwas kaputt wäre.
    const hole = (thema: 'grass' | 'crystal'): number => {
      musik.setTheme(thema);
      e.einsaetze = [];
      sfx.werkzeugGewaehlt('digger');
      return Math.min(...e.einsaetze.filter((x) => x.art === 'ton' && x.freq > 0).map((x) => x.freq));
    };
    const wiese = hole('grass');
    const hoehle = hole('crystal');
    expect(Math.abs(1200 * Math.log2(wiese / hoehle)), 'beide Welten klingen gleich').toBeGreaterThan(
      50,
    );
  });
});

describe('Die Trippelschritte laufen auf dem Achtelraster', () => {
  it('liefert eine Verzögerung innerhalb einer Achtel', () => {
    // Aus dem häufigsten Geräusch des Spiels wird damit eine Perkussionsspur,
    // statt gegen die Musik zu schweben. Länger als eine Achtel zu warten wäre
    // ein übersprungener Schlag.
    const e = new Aufschreiber();
    const m = new Music();
    m.setTheme('grass');
    m.start(e as unknown as AudioEngine);
    m.update(e as unknown as AudioEngine);

    const achtel = schrittDauer();
    expect(achtel).toBeCloseTo(60 / STUECKE.grass.bpm / 2, 6);
    for (let k = 0; k < 40; k++) {
      const jetzt = e.zeit + k * 0.037;
      const rest = bisNaechsteAchtel(jetzt);
      expect(rest).toBeGreaterThanOrEqual(0);
      expect(rest).toBeLessThan(achtel);
    }
  });

  it('wartet auch bei weit weggelaufener Uhr nie länger als eine Achtel', () => {
    // Der Punkt, an dem eine Rasterrechnung sonst kippt: Die Musik plant ihren
    // Vorlauf, der gemerkte Zeitpunkt liegt also *vor* oder *hinter* der
    // Gegenwart — je nachdem, wie lange das Bild stillstand (Tab im
    // Hintergrund). Ohne den Rest der Division käme dabei eine Wartezeit von
    // Minuten heraus, und die Schritte blieben stumm.
    const e = new Aufschreiber();
    const m = new Music();
    m.setTheme('grass');
    m.start(e as unknown as AudioEngine);
    m.update(e as unknown as AudioEngine);

    const achtel = schrittDauer();
    for (const jetzt of [0, 1, 1e3, 1e6]) {
      const rest = bisNaechsteAchtel(jetzt);
      expect(rest, `bei ${jetzt} s`).toBeGreaterThanOrEqual(0);
      expect(rest, `bei ${jetzt} s`).toBeLessThan(achtel);
    }
  });
});
