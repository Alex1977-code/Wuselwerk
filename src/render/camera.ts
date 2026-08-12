import { WUSEL_H } from '../core/constants';
import { State } from '../core/types';
import type { World } from '../core/world';
import type { Box } from './layout';

/**
 * Sichtfenster bei Zoom 1, getrennt nach beiden Richtungen.
 *
 * Der Massstab ergibt sich aus der *engeren* der beiden Vorgaben. Im
 * Hochformat begrenzt die Breite, im Querformat die Höhe — und weil beide
 * Werte dasselbe Verhältnis ergeben, ist die Figur in jeder Lage gleich gross.
 * Ohne diese Kopplung würde sie im Querformat entweder winzig oder riesig.
 *
 * **Die Zahlen bestimmen, wie gross die Figur erscheint** — nicht `WUSEL_H`.
 * Sie standen auf 300 × 200, das ergab rund sechzehn Bildschirmpixel. Das war
 * das Verhältnis des Vorbilds von 1991 und passte zur gepixelten Darstellung;
 * einer gemalten Figur nimmt es alles, was an ihr gemalt ist. Jetzt 180 × 120,
 * also rund sechsundzwanzig Pixel.
 *
 * Der Preis ist Übersicht: Bei Zoom 1 sieht man von einem 960 breiten Level
 * nur noch ein knappes Fünftel. Deshalb geht der Zoom jetzt auch unter 1 —
 * wer aufziehen will, bekommt mit 0,6 mehr Fläche zu sehen als die alte
 * Vorgabe je zeigte.
 *
 * Die Simulation ist von all dem unberührt. Sie rechnet in logischen Pixeln,
 * und wie viele Bildschirmpixel einer davon ist, geht sie nichts an.
 */
export const VIEW_LOGICAL_W = 180;
export const VIEW_LOGICAL_H = 120;
export const ZOOM_MIN = 0.6;
export const ZOOM_MAX = 2.4;

export interface View {
  /** Linke obere Ecke des Ausschnitts in logischen Koordinaten. */
  ox: number;
  oy: number;
  scale: number;
  box: Box;
}

export function sx(v: View, lx: number): number {
  return v.box.x + (lx - v.ox) * v.scale;
}

export function sy(v: View, ly: number): number {
  return v.box.y + (ly - v.oy) * v.scale;
}

/**
 * Die Bildschirmzeile, auf der die **Sohle** einer Figur steht.
 *
 * ## Der Fehler, den diese Funktion abschafft
 *
 * `w.y` ist die *unterste Koerperzeile*, nicht die Standlinie — der Boden liegt
 * bei `y + 1` (siehe `Wusel.y`, und so fragt die Simulation auch: `solid(x, y+1)`).
 * Eine logische Zeile belegt auf dem Schirm die Spanne von `sy(ly)` bis
 * `sy(ly+1)`. Wer die Sohle auf `sy(w.y)` setzt, setzt sie an die **Oberkante**
 * der letzten Koerperzeile — und die Figur schwebt genau einen logischen Pixel
 * ueber dem Grund.
 *
 * Das war seit der ersten Figur so. Es faellt nicht als Fehler auf, weil ein
 * Pixel nach nichts aussieht; es faellt als Gefuehl auf, und das Gefuehl hiess
 * „die Figur ist nicht eins mit dem Boden". Aufgeflogen ist es erst, als der
 * Kontaktschatten dazukam: Der rechnet mit `w.y + tiefe`, sass also richtig —
 * und lag damit sichtbar **unter** den Fuessen.
 *
 * Wer eine Figur zeichnet, nimmt diese Funktion. Wer den Boden meint, auch.
 */
export function standY(v: View, ly: number): number {
  return sy(v, ly + 1);
}

export function toLogical(v: View, screenX: number, screenY: number): { x: number; y: number } {
  return {
    x: v.ox + (screenX - v.box.x) / v.scale,
    y: v.oy + (screenY - v.box.y) / v.scale,
  };
}

/** Auto-Kamera: folgt dem Pulk, laesst sich aber jederzeit übersteuern. */
export class Camera {
  cx: number;
  cy: number;
  zoom = 1;
  follow = true;

  constructor(
    private levelW: number,
    private levelH: number,
    startX: number,
    startY: number,
  ) {
    this.cx = startX;
    this.cy = startY;
  }

  scaleFor(box: Box): number {
    return Math.min(box.w / VIEW_LOGICAL_W, box.h / VIEW_LOGICAL_H) * this.zoom;
  }

  view(box: Box): View {
    const scale = this.scaleFor(box);
    const visW = box.w / scale;
    const visH = box.h / scale;
    const cx = clampCenter(this.cx, visW, this.levelW);
    const cy = clampCenter(this.cy, visH, this.levelH);
    return { ox: cx - visW / 2, oy: cy - visH / 2, scale, box };
  }

  setZoom(z: number): void {
    this.zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z));
  }

  panBy(dxLogical: number, dyLogical: number): void {
    this.follow = false;
    this.cx -= dxLogical;
    this.cy -= dyLogical;
  }

  recenter(): void {
    this.follow = true;
  }

  /** Sprung an eine Levelstelle — von der Übersichtskarte aus. */
  centerOn(x: number, y: number): void {
    this.follow = false;
    this.cx = x;
    this.cy = y;
  }

  update(dtSec: number, world: World): void {
    if (!this.follow) return;
    const t = this.followTarget(world);
    const k = Math.min(1, dtSec * 3.5);
    this.cx += (t.x - this.cx) * k;
    this.cy += (t.y - this.cy) * k;
  }

  /**
   * Zielpunkt der Auto-Kamera: der Median, nicht der Mittelwert.
   *
   * Beim Mittelwert zieht eine einzelne weit entfernte Figur die Kamera in die
   * Mitte zwischen zwei Gruppen — dorthin, wo gar nichts passiert. Der Median
   * bleibt beim Pulk. Wo die Ausreisser stecken, zeigen Karte und Randmarken.
   */
  private followTarget(world: World): { x: number; y: number } {
    const xs: number[] = [];
    const ys: number[] = [];
    for (const w of world.wusels) {
      if (w.state === State.DEAD || w.state === State.SAVED) continue;
      xs.push(w.x);
      ys.push(w.y - WUSEL_H / 2);
    }
    if (xs.length === 0) return { x: world.entrance.x, y: world.entrance.y };
    xs.sort((a, b) => a - b);
    ys.sort((a, b) => a - b);
    const m = xs.length >> 1;
    return { x: xs[m], y: ys[m] };
  }
}

function clampCenter(c: number, visible: number, total: number): number {
  if (visible >= total) return total / 2;
  const half = visible / 2;
  return Math.max(half, Math.min(total - half, c));
}
