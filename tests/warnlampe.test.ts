import { describe, expect, it } from 'vitest';
import { BOMB_FUSE_TICKS, TICK_HZ, WUSEL_H } from '../src/core/constants';
import { SCHOPF_MAX, schopfPlatz, schopfPuls, zuenderGlut } from '../src/render/schopf';

/**
 * Zwei Dinge an der Figur, die man auf einem Standbild nicht beurteilen kann —
 * und die deshalb gerechnet statt angesehen werden.
 *
 * Beide waren vorher falsch, und beide auf die leise Art: Der Sprengcountdown
 * war ein Flackern, das im Gewühl unterging, und der Schopf steckte in jeder
 * Betonwand, an der eine Murmel entlanglief. Nichts davon sieht auf einem
 * Einzelbild nach Fehler aus — das eine ist eine Sache des Zeitverlaufs, das
 * andere eine Sache der Umgebung.
 */

describe('Die Warnlampe des Sprengmeisters', () => {
  it('steht im Augenblick des Knalls auf hell', () => {
    // Die Phase wird von hinten aufgebaut, damit der letzte Puls genau auf der
    // Explosion endet. Vorwärts gezählt hinge es an der Länge der Zündschnur,
    // ob die Lampe im Hellen oder im Dunkeln hochgeht — und dann sähe man dem
    // letzten Puls nicht an, dass er der letzte war.
    expect(zuenderGlut(1)).toBeGreaterThan(0.95);
    // Und wirklich ein Höhepunkt: Über die ganze letzte halbe Schwingung fällt
    // die Helligkeit ab. Ohne diese Gegenprobe bestünde die Prüfung auch dann,
    // wenn die Lampe kurz vor dem Knall schon wieder abfiele und der letzte
    // Wert nur zufällig hoch wäre.
    //
    // Verglichen wird über eine **halbe** Periode und nicht weiter: Der
    // eigentliche Scheitel liegt bei fuse = 0, und weil in ganzen Bildern
    // abgetastet wird, trifft ihn nicht jeder Umlauf gleich genau. Ein früherer
    // Puls kann deshalb rechnerisch minimal heller ausfallen, ohne dass sich am
    // Verlauf etwas ändert.
    const halbe = Math.round(TICK_HZ / 2.3 / 2);
    for (let f = 2; f <= halbe; f++) {
      expect(zuenderGlut(f), `bei fuse ${f}`).toBeLessThan(zuenderGlut(f - 1));
    }
  });

  it('erlischt, sobald keine Zündschnur mehr brennt', () => {
    // Sonst glühte jede Figur ohne Auftrag mit.
    expect(zuenderGlut(0)).toBe(0);
    expect(zuenderGlut(-5)).toBe(0);
  });

  it('bleibt zwischen null und eins', () => {
    for (let f = 0; f <= BOMB_FUSE_TICKS; f++) {
      const g = zuenderGlut(f);
      expect(g, `bei fuse ${f}`).toBeGreaterThanOrEqual(0);
      expect(g, `bei fuse ${f}`).toBeLessThanOrEqual(1);
    }
  });

  it('wechselt weich statt zu flackern', () => {
    // Das ist der eigentliche Unterschied zum vorherigen Stand. Dort sprang die
    // Farbe hart zwischen zwei Werten — an einem wenige Bildpunkte grossen
    // Schopf liest man das als Störung, nicht als Ansage. Ein Schritt von mehr
    // als einem Sechstel je Bild wäre wieder ein Stroboskop.
    //
    // Die Schranke ist ausgerechnet und nicht geraten: Der steilste Punkt einer
    // Schwingung von 2,3 Hz, abgetastet mit 60 Bildern je Sekunde, ändert sich
    // um π · 2,3 / 60 ≈ 0,12 je Bild. Der harte Wechsel von vorher sprang um
    // 1,0 — also um das Achtfache.
    for (let f = 1; f < BOMB_FUSE_TICKS; f++) {
      const sprung = Math.abs(zuenderGlut(f) - zuenderGlut(f + 1));
      expect(sprung, `Sprung bei fuse ${f}`).toBeLessThan(0.15);
    }
  });

  it('pulst hörbar langsam, aber am Ende doppelt so schnell', () => {
    // „Nicht zu schnell flackernd" ist eine Zahl: Ein Puls je Sekunde ist
    // mitzählbar, drei sind Alarm. Gezählt werden die Höhepunkte in der ersten
    // und in der letzten Sekunde der Zündschnur.
    const hoehepunkte = (von: number, bis: number): number => {
      let n = 0;
      for (let f = von + 1; f < bis - 1; f++) {
        const g = zuenderGlut(f);
        if (g > zuenderGlut(f - 1) && g > zuenderGlut(f + 1)) n++;
      }
      return n;
    };
    // Die letzte Sekunde vor dem Knall — dort gilt der doppelte Takt.
    const schnell = hoehepunkte(0, TICK_HZ);
    // Eine Sekunde weit weg vom Knall, im ruhigen Takt.
    const langsam = hoehepunkte(BOMB_FUSE_TICKS - TICK_HZ, BOMB_FUSE_TICKS);
    expect(langsam).toBeGreaterThanOrEqual(1);
    expect(langsam).toBeLessThanOrEqual(2);
    expect(schnell).toBeGreaterThan(langsam);
  });

  it('färbt den Schopf nur, solange die Zündschnur brennt', () => {
    const grau = '#5C5C68';
    expect(schopfPuls(grau, 0)).toBe(grau);
    // Auf dem Höhepunkt ist von der Berufsfarbe nichts mehr übrig.
    expect(schopfPuls(grau, 1)).not.toBe(grau);
  });
});

describe('Der Schopf duckt sich vor Gestein', () => {
  /** Eine Wand, die bei `wandX` beginnt und nach rechts weitergeht. */
  const wandAb = (wandX: number) => (x: number, _y: number) => x >= wandX;

  it('nimmt unter freiem Himmel die volle Länge', () => {
    expect(schopfPlatz(() => false, 50, 40, 1)).toBe(SCHOPF_MAX);
  });

  it('lässt ihn an einer Wand vor der Nase kürzer werden', () => {
    // Genau der gemeldete Fall: Die Murmel läuft nach rechts an einer
    // Betonwand entlang. Ihr Körper ist zwölf Pixel hoch und steht richtig —
    // der Schopf ragt darüber hinaus und steckte deshalb im Stein.
    const platz = schopfPlatz(wandAb(53), 50, 40, 1);
    expect(platz).toBeLessThan(SCHOPF_MAX);
    expect(platz).toBeGreaterThanOrEqual(0);
  });

  it('misst in die Blickrichtung, nicht nach einer festen Seite', () => {
    // Dieselbe Wand rechts: Wer nach rechts blickt, stösst an; wer nach links
    // blickt, hat freie Bahn. Ohne das duckte sich der Schopf auf der falschen
    // Seite — und das sähe aus wie ein Fehler in der Figur statt wie Rücksicht
    // auf die Wand.
    expect(schopfPlatz(wandAb(53), 50, 40, 1)).toBeLessThan(SCHOPF_MAX);
    expect(schopfPlatz(wandAb(53), 50, 40, -1)).toBe(SCHOPF_MAX);
  });

  it('duckt ihn auch unter einer Decke', () => {
    // Decke dicht über dem Kopf. Senkrecht ist der erste der abgetasteten
    // Winkel, also muss dieser Fall genauso greifen wie die Wand.
    const decke = (_x: number, y: number) => y <= 37;
    expect(schopfPlatz(decke, 50, 40, 1)).toBeLessThan(SCHOPF_MAX);
  });

  it('bleibt kürzer als der Körper, sobald es eng wird', () => {
    // Die Zahl, um die es geht: Der Schopf ist mehr als halb so lang wie der
    // Körper. Steht Gestein einen Pixel über dem Kopf, darf davon nichts mehr
    // hinausragen.
    expect(schopfPlatz((_x, y) => y <= 39, 50, 40, 1)).toBeLessThan(WUSEL_H / 2);
  });
});
