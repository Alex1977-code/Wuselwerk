import { MAT, isDiggable, type Material } from './types';

/**
 * Pixelgenaue Terrainmaske (GDD §5, §11).
 *
 * Ein Byte Material pro Pixel, kein Kachelraster. Die Kollisionsabfrage laeuft
 * direkt auf dieser Maske — keine Physik-Engine dazwischen. Ein zweites Byte
 * merkt sich frisch freigelegte Bruchkanten, damit der Renderer sie heller
 * zeichnen kann ("man sieht seine eigene Arbeit", GDD §6).
 */
export class Terrain {
  readonly width: number;
  readonly height: number;
  readonly mat: Uint8Array;
  readonly fresh: Uint8Array;

  private dMinX = 0;
  private dMinY = 0;
  private dMaxX = -1;
  private dMaxY = -1;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.mat = new Uint8Array(width * height);
    this.fresh = new Uint8Array(width * height);
  }

  idx(x: number, y: number): number {
    return y * this.width + x;
  }

  inBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  /**
   * Material an einer Stelle.
   * Seitliche Levelraender verhalten sich wie Stahl (undurchdringliche Wand),
   * oben und unten ist offener Raum — dort faellt man hinaus.
   */
  matAt(x: number, y: number): number {
    if (x < 0 || x >= this.width) return MAT.STEEL;
    if (y < 0 || y >= this.height) return MAT.EMPTY;
    return this.mat[this.idx(x, y)];
  }

  solid(x: number, y: number): boolean {
    return this.matAt(x, y) !== MAT.EMPTY;
  }

  isFresh(x: number, y: number): boolean {
    if (!this.inBounds(x, y)) return false;
    return this.fresh[this.idx(x, y)] !== 0;
  }

  // --- Aufbau (nur beim Levelbau und fuer Brueckenstufen) ------------------

  setMat(x: number, y: number, m: Material | number): void {
    if (!this.inBounds(x, y)) return;
    const i = this.idx(x, y);
    if (this.mat[i] === m) return;
    this.mat[i] = m;
    this.fresh[i] = 0;
    this.markDirty(x, y);
  }

  fillRect(x: number, y: number, w: number, h: number, m: Material | number): void {
    const x0 = Math.max(0, x);
    const y0 = Math.max(0, y);
    const x1 = Math.min(this.width, x + w);
    const y1 = Math.min(this.height, y + h);
    for (let py = y0; py < y1; py++) {
      for (let px = x0; px < x1; px++) {
        const i = this.idx(px, py);
        this.mat[i] = m;
        this.fresh[i] = 0;
      }
    }
    if (x1 > x0 && y1 > y0) this.markDirtyRect(x0, y0, x1 - 1, y1 - 1);
  }

  fillEllipse(cx: number, cy: number, rx: number, ry: number, m: Material | number): void {
    if (rx <= 0 || ry <= 0) return;
    const x0 = Math.max(0, cx - rx);
    const y0 = Math.max(0, cy - ry);
    const x1 = Math.min(this.width - 1, cx + rx);
    const y1 = Math.min(this.height - 1, cy + ry);
    const rx2 = rx * rx;
    const ry2 = ry * ry;
    for (let py = y0; py <= y1; py++) {
      const dy = py - cy;
      for (let px = x0; px <= x1; px++) {
        const dx = px - cx;
        if ((dx * dx) / rx2 + (dy * dy) / ry2 <= 1) {
          const i = this.idx(px, py);
          this.mat[i] = m;
          this.fresh[i] = 0;
        }
      }
    }
    if (x1 >= x0 && y1 >= y0) this.markDirtyRect(x0, y0, x1, y1);
  }

  // --- Zerstoerung ---------------------------------------------------------

  /** Raeumt einen Pixel ab. Stahl bleibt. Gibt true zurueck, wenn etwas fiel. */
  clearPixel(x: number, y: number): boolean {
    if (!this.inBounds(x, y)) return false;
    const i = this.idx(x, y);
    if (!isDiggable(this.mat[i])) return false;
    this.mat[i] = MAT.EMPTY;
    this.fresh[i] = 0;
    this.markDirty(x, y);
    this.markNeighboursFresh(x, y);
    return true;
  }

  clearRect(x: number, y: number, w: number, h: number): number {
    let n = 0;
    const x1 = x + w;
    const y1 = y + h;
    for (let py = y; py < y1; py++) {
      for (let px = x; px < x1; px++) {
        if (this.clearPixel(px, py)) n++;
      }
    }
    return n;
  }

  clearCircle(cx: number, cy: number, r: number): number {
    let n = 0;
    const r2 = r * r;
    for (let py = cy - r; py <= cy + r; py++) {
      const dy = py - cy;
      for (let px = cx - r; px <= cx + r; px++) {
        const dx = px - cx;
        if (dx * dx + dy * dy <= r2 && this.clearPixel(px, py)) n++;
      }
    }
    return n;
  }

  /** Liegt in diesem Bereich Stahl (oder ein Levelrand)? Dann stoppt die Grabung. */
  hasSteel(x: number, y: number, w: number, h: number): boolean {
    const x1 = x + w;
    const y1 = y + h;
    for (let py = y; py < y1; py++) {
      for (let px = x; px < x1; px++) {
        if (this.matAt(px, py) === MAT.STEEL) return true;
      }
    }
    return false;
  }

  /** Gibt es im Bereich ueberhaupt noch festes Material? */
  hasSolid(x: number, y: number, w: number, h: number): boolean {
    const x1 = x + w;
    const y1 = y + h;
    for (let py = y; py < y1; py++) {
      for (let px = x; px < x1; px++) {
        if (this.solid(px, py)) return true;
      }
    }
    return false;
  }

  private markNeighboursFresh(x: number, y: number): void {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (!this.inBounds(nx, ny)) continue;
        const i = this.idx(nx, ny);
        const m = this.mat[i];
        if (m !== MAT.EMPTY && m !== MAT.STEEL && this.fresh[i] === 0) {
          this.fresh[i] = 1;
          this.markDirty(nx, ny);
        }
      }
    }
  }

  // --- Dirty-Rect fuer den Renderer ---------------------------------------

  private markDirty(x: number, y: number): void {
    this.markDirtyRect(x, y, x, y);
  }

  private markDirtyRect(x0: number, y0: number, x1: number, y1: number): void {
    if (this.dMaxX < this.dMinX) {
      this.dMinX = x0;
      this.dMinY = y0;
      this.dMaxX = x1;
      this.dMaxY = y1;
      return;
    }
    if (x0 < this.dMinX) this.dMinX = x0;
    if (y0 < this.dMinY) this.dMinY = y0;
    if (x1 > this.dMaxX) this.dMaxX = x1;
    if (y1 > this.dMaxY) this.dMaxY = y1;
  }

  markAllDirty(): void {
    this.dMinX = 0;
    this.dMinY = 0;
    this.dMaxX = this.width - 1;
    this.dMaxY = this.height - 1;
  }

  /** Holt den veraenderten Bereich ab und setzt ihn zurueck. */
  consumeDirty(): { x: number; y: number; w: number; h: number } | null {
    if (this.dMaxX < this.dMinX) return null;
    const r = {
      x: this.dMinX,
      y: this.dMinY,
      w: this.dMaxX - this.dMinX + 1,
      h: this.dMaxY - this.dMinY + 1,
    };
    this.dMinX = 0;
    this.dMinY = 0;
    this.dMaxX = -1;
    this.dMaxY = -1;
    return r;
  }

  // --- Zustandssicherung (Grundlage fuer den Zeitruecklauf, GDD §3.4) ------

  copyFrom(other: Terrain): void {
    this.mat.set(other.mat);
    this.fresh.set(other.fresh);
    this.markAllDirty();
  }

  clone(): Terrain {
    const t = new Terrain(this.width, this.height);
    t.mat.set(this.mat);
    t.fresh.set(this.fresh);
    return t;
  }
}
