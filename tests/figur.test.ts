import { describe, expect, it } from 'vitest';
import { drawHaarStraehnen, drawHaarZacken } from '../src/render/band';

/**
 * Das Gesicht der Figur.
 *
 * Diese Datei gibt es wegen eines Befunds, den man nur sehen konnte: „die
 * Figur hat Fehler." Im Bild hingen der Figur drei blaue Keile ueber den
 * Augen — Ponyfransen, die auf der Haut endeten statt am Haaransatz.
 *
 * Das Bemerkenswerte daran ist, dass der Code die Regel kannte und aufschrieb
 * („die Spitzen bleiben oberhalb von -0,2 Achsen, damit sie nie in die Augen
 * haengen") und sie im selben Atemzug brach (die Tabelle stand auf -0,08,
 * -0,14 und -0,06). Ein Kommentar ist keine Zusage. Ein Test ist eine.
 *
 * ## Wie hier gemessen wird
 *
 * Der Zeichner bekommt einen **Aufnahme-Kontext**: eine Attrappe, die die
 * Verschiebungen, Drehungen und Massstaebe mitfuehrt und jeden Punkt, den
 * eine gefuellte Form beruehrt, in Weltkoordinaten mitschreibt. Weil die
 * Aufrufe mit Ursprung (0,0), Massstab 1 und senkrechter Kopfachse laufen,
 * sind diese Koordinaten genau die **Kopfachsen** aus den Kommentaren des
 * Zeichners: y = 0 ist Augenhoehe, negativ ist oben.
 */

interface Punkt {
  x: number;
  y: number;
}

/** Eine 2x3-Matrix, wie sie ein Canvas-Kontext fuehrt. */
type Matrix = [number, number, number, number, number, number];

function mal(a: Matrix, b: Matrix): Matrix {
  return [
    a[0] * b[0] + a[2] * b[1],
    a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3],
    a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4],
    a[1] * b[4] + a[3] * b[5] + a[5],
  ];
}

/**
 * Ein Kontext, der nicht zeichnet, sondern mitschreibt.
 *
 * Er kann genau so viel, wie die beiden Haarzeichner benutzen. Mehr waere ein
 * halber Canvas-Nachbau, und der wuerde eine Genauigkeit vortaeuschen, die er
 * nicht hat.
 */
class Aufnahme {
  fillStyle = '';
  strokeStyle = '';
  lineWidth = 1;
  globalAlpha = 1;
  lineCap = '';
  /** Alle Punkte, die eine **gefuellte** Form beruehrt hat. */
  gefuellt: Punkt[] = [];
  /** Alle Punkte, die eine **gestrichene** Linie beruehrt hat. */
  gestrichen: Punkt[] = [];

  private m: Matrix = [1, 0, 0, 1, 0, 0];
  private stapel: Matrix[] = [];
  private pfad: Punkt[] = [];

  private welt(x: number, y: number): Punkt {
    const m = this.m;
    return { x: m[0] * x + m[2] * y + m[4], y: m[1] * x + m[3] * y + m[5] };
  }

  save(): void {
    this.stapel.push([...this.m] as Matrix);
  }
  restore(): void {
    const m = this.stapel.pop();
    if (m) this.m = m;
  }
  translate(x: number, y: number): void {
    this.m = mal(this.m, [1, 0, 0, 1, x, y]);
  }
  scale(x: number, y: number): void {
    this.m = mal(this.m, [x, 0, 0, y, 0, 0]);
  }
  rotate(a: number): void {
    const c = Math.cos(a);
    const s = Math.sin(a);
    this.m = mal(this.m, [c, s, -s, c, 0, 0]);
  }
  beginPath(): void {
    this.pfad = [];
  }
  moveTo(x: number, y: number): void {
    this.pfad.push(this.welt(x, y));
  }
  lineTo(x: number, y: number): void {
    this.pfad.push(this.welt(x, y));
  }
  quadraticCurveTo(cx: number, cy: number, x: number, y: number): void {
    // Der Kontrollpunkt zaehlt mit: Eine Bezierkurve bleibt zwar in der
    // konvexen Huelle ihrer Punkte, aber wer nur die Endpunkte misst, uebersieht
    // genau die Ausbuchtung, um die es hier geht.
    this.pfad.push(this.welt(cx, cy), this.welt(x, y));
  }
  closePath(): void {
    /* Der Pfad bleibt stehen, bis fill oder stroke ihn abholt. */
  }
  fill(): void {
    this.gefuellt.push(...this.pfad);
  }
  stroke(): void {
    this.gestrichen.push(...this.pfad);
  }
}

/** Zeichnet beide Haarschichten in Kopfachsen und gibt die Aufnahme zurueck. */
function haare(dreh: number, stirnX = 0, stirnY = -2, schwung = 0): Aufnahme {
  const a = new Aufnahme();
  const ctx = a as unknown as CanvasRenderingContext2D;
  const c = Math.cos(schwung);
  const s = Math.sin(schwung);
  const zx = stirnX * c - stirnY * s;
  const zy = stirnX * s + stirnY * c;
  drawHaarZacken(ctx, 0, 0, 1, dreh, zx, zy);
  drawHaarStraehnen(ctx, 0, 0, 1, dreh, stirnX, stirnY);
  return a;
}

/**
 * Der Abstand vom Gesichtspunkt zur Stirn, in logischen Pixeln. Alle Masse
 * der Haarzeichner sind Vielfache davon; die Regeln unten deshalb auch.
 */
const L = 2;

describe('Das Gesicht der Figur', () => {
  /**
   * Die Regel, die der Zeichner selbst aufgeschrieben und gebrochen hatte.
   * Der Gesichtspunkt liegt auf Augenhoehe — jede Haarform muss darueber
   * bleiben, sonst haengt sie im Auge.
   */
  it('laesst keine Haarform bis auf Augenhoehe reichen', () => {
    for (const dreh of [0, 12, 25, 40, -25]) {
      const a = haare(dreh);
      const tiefste = Math.max(...a.gefuellt.map((p) => p.y));
      expect(tiefste, `dreh=${dreh}: tiefster Haarpunkt`).toBeLessThanOrEqual(-0.2 * L);
    }
  });

  /**
   * Und sie darf auch nicht seitlich ins Gesicht wandern. Der Kopf ist rund
   * zwei Achsen breit; was innerhalb einer halben Achse um die Mittellinie
   * TIEFER als der Haaransatz liegt, steht im Gesicht.
   */
  it('haelt die Gesichtsmitte frei', () => {
    for (const dreh of [0, 25, -25]) {
      const a = haare(dreh);
      const mitte = a.gefuellt.filter((p) => Math.abs(p.x) < 0.5 * L && p.y > -0.65 * L);
      expect(mitte, `dreh=${dreh}: Haar in der Gesichtsmitte`).toHaveLength(0);
    }
  });

  /**
   * Der Kletterzug dreht die Kopfachse des **Zackenkamms**. Er darf dabei
   * nicht ins Gesicht schwingen — genau das war der Fehler, mit dem der
   * angestrengte Kletterzug ausgeliefert wurde.
   */
  it('haelt auch bei vollem Haarschwung Abstand vom Gesicht', () => {
    for (const schwung of [-0.4, -0.2, 0, 0.2, 0.4]) {
      const a = haare(0, 0, -2, schwung);
      const tiefste = Math.max(...a.gefuellt.map((p) => p.y));
      expect(tiefste, `schwung=${schwung}`).toBeLessThanOrEqual(-0.2 * L);
    }
  });

  /**
   * Die Straehnen auf der Kuppel sind Gliederung, keine Zeichnung. Wenn sie
   * so kraeftig stehen wie die Formen selbst, liest sich das Haar als bemalte
   * Flaeche — im Bild war das ein helles Y auf dem Scheitel.
   */
  it('haelt die Scheitellinien duenner als die Formen', () => {
    const a = new Aufnahme();
    drawHaarStraehnen(a as unknown as CanvasRenderingContext2D, 0, 0, 1, 0, 0, -2);
    expect(a.gestrichen.length, 'es gibt ueberhaupt Scheitellinien').toBeGreaterThan(0);
    expect(a.lineWidth).toBeLessThanOrEqual(0.2 * L);
  });

  /**
   * Und der Kamm muss ueber dem Kopf stehen, sonst ist er kein Kamm. Ohne
   * diese Gegenprobe koennte man den ersten Test auch dadurch erfuellen, dass
   * man alles Haar weglaesst.
   */
  it('setzt den Kamm ueber den Scheitel', () => {
    const a = new Aufnahme();
    drawHaarZacken(a as unknown as CanvasRenderingContext2D, 0, 0, 1, 0, 0, -2);
    const hoechste = Math.min(...a.gefuellt.map((p) => p.y));
    expect(a.gefuellt.length, 'der Kamm zeichnet ueberhaupt').toBeGreaterThan(0);
    expect(hoechste, 'hoechster Punkt des Kamms').toBeLessThan(-2.5 * L);
  });
});
