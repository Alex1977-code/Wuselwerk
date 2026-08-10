import type { Terrain } from '../core/terrain';
import { MAT } from '../core/types';
import type { ThemeId } from '../levels/types';
import { paletteFor, type Palette } from './palette';

/** Deterministisches Pixelrauschen — gleiche Stelle, gleiche Körnung. */
function grain(x: number, y: number): number {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function clamp255(v: number): number {
  return v < 0 ? 0 : v > 255 ? 255 : v;
}

/**
 * Zeichnet die Terrainmaske in eine Offscreen-Leinwand in logischer Aufloesung.
 * Nur der veraenderte Bereich wird neu berechnet, deshalb kosten auch grosse
 * Sprengungen kaum etwas.
 */
export class TerrainView {
  readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private img: ImageData;
  private pal: Palette;

  constructor(
    private terrain: Terrain,
    theme: ThemeId,
  ) {
    this.pal = paletteFor(theme);
    this.canvas = document.createElement('canvas');
    this.canvas.width = terrain.width;
    this.canvas.height = terrain.height;
    const ctx = this.canvas.getContext('2d', { willReadFrequently: false });
    if (!ctx) throw new Error('2D-Kontext nicht verfügbar');
    this.ctx = ctx;
    this.img = this.ctx.createImageData(terrain.width, terrain.height);
    this.terrain.markAllDirty();
    this.sync();
  }

  /** Übernimmt alle Änderungen seit dem letzten Aufruf. */
  sync(): void {
    const d = this.terrain.consumeDirty();
    if (!d) return;
    // Ein Pixel Rand mehr: die Oberkanten-Aufhellung schaut nach oben.
    const x0 = Math.max(0, d.x - 1);
    const y0 = Math.max(0, d.y - 1);
    const x1 = Math.min(this.terrain.width - 1, d.x + d.w);
    const y1 = Math.min(this.terrain.height - 1, d.y + d.h);
    this.paint(x0, y0, x1, y1);
    this.ctx.putImageData(this.img, 0, 0, x0, y0, x1 - x0 + 1, y1 - y0 + 1);
  }

  private paint(x0: number, y0: number, x1: number, y1: number): void {
    const { mat, fresh, width } = this.terrain;
    const data = this.img.data;
    const p = this.pal;

    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const i = y * width + x;
        const m = mat[i];
        const o = i * 4;

        if (m === MAT.EMPTY) {
          data[o + 3] = 0;
          continue;
        }

        const isFresh = fresh[i] !== 0;
        const openAbove = y === 0 || mat[i - width] === MAT.EMPTY;
        const n = grain(x, y);
        let base: number;
        let shade = (n - 0.5) * 14;

        switch (m) {
          case MAT.EARTH:
            // Unberührte Oberkante trägt Gras, aufgegrabene nicht — so sieht
            // man jederzeit, wo schon gearbeitet wurde.
            base = openAbove && !isFresh ? p.crust : p.earth;
            // Nach unten hin gleichmässig dunkler — ohne Stufen.
            if (!openAbove && !isFresh) shade -= (y / this.terrain.height) * 20;
            break;
          case MAT.ROCK:
            base = p.rock;
            if (openAbove) shade += 16;
            break;
          case MAT.STEEL:
            base = p.steel;
            shade += (((x >> 2) + (y >> 2)) & 1) === 0 ? 8 : -8;
            if (x % 8 === 4 && y % 8 === 4) shade += 34;
            break;
          case MAT.BRICK:
            base = p.brick;
            shade += x % 6 === 0 ? -20 : 6;
            break;
          default:
            base = p.rock;
        }

        if (isFresh) shade += p.freshBoost;

        data[o] = clamp255(((base >> 16) & 0xff) + shade);
        data[o + 1] = clamp255(((base >> 8) & 0xff) + shade);
        data[o + 2] = clamp255((base & 0xff) + shade);
        data[o + 3] = 255;
      }
    }
  }
}
