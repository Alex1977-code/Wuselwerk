import { describe, expect, it } from 'vitest';
import { CLIMB_INTERVAL } from '../src/core/constants';
import { LEHNE } from '../src/render/atlas';
import { kletterZug } from '../src/render/scene';

/**
 * Der Kletterzug.
 *
 * Wie eine Bewegung aussieht, entscheidet das Auge — dafuer gibt es die
 * Bildfolge in der Sichtprobe. Was ein Test halten kann, sind die Zahlen
 * darunter, und die haben alle denselben Zweck: Der Spieltest verlangte, dass
 * die Figur sich „sichtbar mit einem Ruck Stueck fuer Stueck hochzieht" und
 * dass das „angestrengt aussieht". Beides sind Aussagen ueber eine Kurve.
 *
 * Ohne diese Datei glaettet der naechste Handgriff sie unbemerkt wieder — die
 * erste Fassung des Zugs war genau so verschwunden: Sie rechnete nur aus `y`,
 * `y` springt nur alle vier Ticks, und der ganze Aufschwung bestand am Ende
 * aus zwei Bildern.
 */

/** Die gezeichnete Hoehe: Simulationshoehe plus Zeichenversatz, nach oben. */
function gezeichnet(hoch: number): number {
  const y = -Math.floor(hoch);
  const phase = hoch - Math.floor(hoch);
  return hoch - kletterZug(y, phase).dy;
}

/** Ein voller Zug, fein abgetastet: 6 Bildpunkte zu je 4 Ticks. */
function zyklus(schritte = 96): { hoch: number; z: ReturnType<typeof kletterZug> }[] {
  const raus = [];
  for (let i = 0; i < schritte; i++) {
    const hoch = 12 + (i * 6) / schritte;
    const y = -Math.floor(hoch);
    const phase = hoch - Math.floor(hoch);
    raus.push({ hoch, z: kletterZug(y, phase) });
  }
  return raus;
}

describe('Kletterzug', () => {
  /**
   * Das Kernversprechen: Zwei Drittel der Zeit steht die Figur still, das
   * letzte Drittel traegt den ganzen Hub. Eine Figur, die gleichmaessig
   * steigt, klettert nicht — sie faehrt Aufzug.
   */
  it('haelt zwei Drittel und reisst das letzte Drittel', () => {
    const s = zyklus();
    const hoehen = s.map((x) => gezeichnet(x.hoch));
    const schritt = hoehen.map((h, i) => (i ? h - hoehen[i - 1] : 0)).slice(1);
    const still = schritt.filter((d) => Math.abs(d) < 0.01).length;
    const bewegt = schritt.length - still;
    expect(still / schritt.length, 'Anteil Stillstand').toBeGreaterThan(0.6);
    expect(bewegt, 'es bewegt sich ueberhaupt').toBeGreaterThan(4);
  });

  it('bringt je Zug genau sechs Bildpunkte, nicht mehr und nicht weniger', () => {
    // Ueber zwei volle Zuege gemessen — der Versatz muss sich restlos
    // aufloesen, sonst wandert die gezeichnete Figur von der Simulation weg.
    expect(gezeichnet(24) - gezeichnet(12)).toBeCloseTo(12, 6);
  });

  /**
   * Der Ueberschwung ist der Unterschied zwischen „schnell" und „mit Kraft".
   * Die Figur muss kurz ueber den Griff hinausschiessen.
   */
  it('schiesst ueber den Griff hinaus und faellt darauf zurueck', () => {
    const s = zyklus(200);
    const ueber = Math.min(...s.map((x) => x.z.dy));
    expect(ueber, 'kleinster Versatz (negativ = ueber dem Ziel)').toBeLessThan(-0.4);
  });

  /** Kein Sprung an den Phasengrenzen — sonst zuckt die Figur zweimal je Zug. */
  it('geht ohne Sprung durch alle Phasengrenzen', () => {
    const s = zyklus(600);
    for (let i = 1; i < s.length; i++) {
      const dz = Math.abs(gezeichnet(s[i].hoch) - gezeichnet(s[i - 1].hoch));
      expect(dz, `Hoehensprung bei hoch=${s[i].hoch.toFixed(3)}`).toBeLessThan(0.6);
      // Die Neigung enthaelt die Verrechnung der geliehenen Grundneigung.
      // Sie muss GENAU dort umschlagen, wo auch die Pose umschlaegt — sonst
      // kippt der Koerper zweimal je Zug um acht Grad.
      const grund = (p: string) => (p === 'hoisting' ? LEHNE.hoisting : LEHNE.climbing);
      const a = s[i - 1].z.neigung + grund(s[i - 1].z.pose);
      const b = s[i].z.neigung + grund(s[i].z.pose);
      expect(Math.abs(b - a), `Neigungssprung bei hoch=${s[i].hoch.toFixed(3)}`).toBeLessThan(0.02);
    }
  });

  /**
   * Haar, Neigung und Streckung ruhen im Moment des Zugbeginns und schlagen
   * danach aus. Ein Ausschlag, der schon vor dem Ruck da ist, sieht nach
   * Zappeln aus, nicht nach Ursache und Wirkung.
   */
  it('faengt jeden Ausschlag bei null an', () => {
    // Zugbeginn liegt bei hoch % 6 === 4.
    const z = kletterZug(-16, 0);
    expect(z.schwung).toBeCloseTo(0, 6);
    expect(z.reck).toBeCloseTo(1, 6);
  });

  it('schwingt aus, statt am Zugende abzureissen', () => {
    const s = zyklus(200);
    const spaet = s.filter((x) => {
      const c = ((x.hoch % 6) + 6) % 6;
      return c > 0.5 && c < 3.5; // mitten im Halt, also lange nach dem Ruck
    });
    const rest = Math.max(...spaet.map((x) => Math.abs(x.z.schwung)));
    expect(rest, 'Restschwung im Halt').toBeGreaterThan(0.01);
    expect(rest, 'aber deutlich kleiner als der erste Ausschlag').toBeLessThan(0.2);
  });

  /**
   * Das Haar schwingt weiter als der Koerper — aber es loest sich nicht vom
   * Kopf. Beide Grenzen sind teuer bezahlt:
   *
   * - **Unten** steht die Forderung aus dem Spieltest („die Haare muessen
   *   dort mehr im Takt des Rucks wackeln"), und die Physik dazu: Was lose
   *   haengt, schwingt weiter als das, was gehalten wird.
   * - **Oben** steht der Befund, mit dem die erste Fassung zurueckkam („die
   *   Figur hat Fehler"). Bei einem Ausschlag von 0,72 kippte die Kopfachse
   *   so weit, dass die Haarformen quer ueber das Gesicht schwenkten. Die
   *   Ursache ist inzwischen an der Wurzel behoben — die gesichtsnahen
   *   Straehnen drehen gar nicht mehr mit (`drawWusel`, `dreheStirn`) —, aber
   *   die Deckelung bleibt: Ein Kamm, der sich um mehr als etwa zwanzig Grad
   *   vom Kopf loest, sieht nach Muetze im Wind aus.
   */
  it('schlaegt das Haar staerker aus als den Koerper, ohne sich zu loesen', () => {
    const s = zyklus(200);
    const haar = Math.max(...s.map((x) => Math.abs(x.z.schwung)));
    const koerper = Math.max(...s.map((x) => Math.abs(x.z.neigung + LEHNE.climbing)));
    expect(haar).toBeGreaterThan(0.18);
    expect(haar).toBeLessThan(0.35);
    expect(haar).toBeGreaterThan(koerper * 1.5);
  });

  /**
   * Waehrend des Rucks leiht sich der Kletterer die Bilder des Hochziehens —
   * die einzige Reihe im Blatt, in der ein Arm wirklich ausgreift. Der
   * geliehene Takt muss in deren Bilder 1 bis 3 fallen (Haltedauern
   * 8/8/8/8/8/12), nicht in Bild 0 und nicht ueber Bild 3 hinaus.
   */
  it('trifft mit dem geliehenen Takt die ausgreifenden Bilder', () => {
    const zug = zyklus(200).filter((x) => x.z.pose === 'hoisting');
    expect(zug.length).toBeGreaterThan(20);
    for (const x of zug) {
      expect(x.z.takt, `Takt bei hoch=${x.hoch.toFixed(2)}`).toBeGreaterThanOrEqual(8);
      expect(x.z.takt).toBeLessThan(32);
    }
  });

  /** Der Halt friert auf Bild 0 ein — sonst radelt die Figur im Stehen. */
  it('friert im Halt auf einem Bild ein', () => {
    const halt = zyklus(200).filter((x) => x.z.pose === 'climbing');
    const takte = new Set(halt.map((x) => x.z.takt % 16));
    expect(takte.size, `Takte im Halt: ${[...takte].join(' ')}`).toBe(1);
  });

  /**
   * Der Zwischenschritt ist der Grund, warum man den Ruck ueberhaupt sieht.
   * Ohne ihn haette der Aufschwung bei sechzig Bildern je Sekunde genau zwei
   * Bilder — die Simulation ruehrt `y` nur alle vier Ticks an.
   */
  it('nutzt den Zwischenschritt zwischen zwei Simulationspunkten', () => {
    const y = -16;
    const dys = [];
    for (let t = 0; t < CLIMB_INTERVAL; t++) dys.push(kletterZug(y, t / CLIMB_INTERVAL).dy);
    expect(new Set(dys.map((d) => d.toFixed(4))).size, `dy: ${dys.join(' ')}`).toBe(CLIMB_INTERVAL);
  });
});
