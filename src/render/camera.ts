import { WUSEL_H } from '../core/constants';
import { State } from '../core/types';
import type { World } from '../core/world';
import type { Box } from './layout';

/** Logische Pixel, die bei Zoom 1 quer auf den Bildschirm passen. */
export const VIEW_LOGICAL_W = 300;
export const ZOOM_MIN = 1;
export const ZOOM_MAX = 3;

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
    return (box.w * this.zoom) / VIEW_LOGICAL_W;
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
