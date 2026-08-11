import { State, type Wusel } from '../core/types';
import { sx, sy, type View } from './camera';

/**
 * Sprite-Atlas für die Figuren.
 *
 * Aufteilung und Zahlen stammen unverändert aus `docs/grafik-integration.md`:
 * Zelle 24 × 24 logisch, Fusspunkt (12, 20), Bildzahl je Zustand aus der
 * Taktrate der Simulation. Zwei Eigenheiten sind dort hergeleitet und hier
 * bindend umgesetzt:
 *
 * - **Haltedauer je Bild, nicht je Blatt.** `DIG_INTERVAL` ist 7 und damit
 *   prim; eine gleichmässige Haltedauer wäre arithmetisch unmöglich.
 * - **Bild eins ist das Wirkungsbild.** Die Simulation arbeitet bei
 *   `timer % interval === 0`, und genau dort steht der Bildindex auf 0. Der
 *   Schaufelbiss muss deshalb auf dem ersten Bild liegen, sonst laufen
 *   Animation und Terrainänderung auseinander.
 *
 * Der Bildindex kommt aus `w.timer`, also aus der Uhr *dieser* Figur — nicht
 * aus einem globalen Takt. Sonst schlagen alle Hämmer im Gleichschritt zu.
 */

export const CELL_W = 24;
export const CELL_H = 24;
export const ANCHOR_X = 12;
export const ANCHOR_Y = 20;

export interface ClipDef {
  /** Zeile im Blatt. */
  row: number;
  /** Haltedauer je Bild in Ticks. Die Länge ist zugleich die Bildzahl. */
  holds: number[];
  /** Einmalige Abläufe frieren auf dem letzten Bild ein, statt zu wiederholen. */
  once?: boolean;
}

export interface AtlasManifest {
  cell: { w: number; h: number };
  anchor: { x: number; y: number };
  clips: Record<string, ClipDef>;
}

/**
 * Die verbindliche Blattaufteilung. Wer eigene Grafik liefert, muss genau
 * diese Zeilen und Bildzahlen bedienen — sie hängen an den Taktraten der
 * Simulation und sind nicht frei wählbar.
 */
export const DEFAULT_MANIFEST: AtlasManifest = {
  cell: { w: CELL_W, h: CELL_H },
  anchor: { x: ANCHOR_X, y: ANCHOR_Y },
  clips: {
    walking: { row: 0, holds: [3, 3, 3, 3, 3, 3, 3, 3] },
    falling: { row: 1, holds: [4, 4, 4, 4] },
    floating: { row: 2, holds: [3, 3, 3, 3] },
    climbing: { row: 3, holds: [4, 4, 4, 4] },
    hoisting: { row: 4, holds: [8, 8, 8, 8, 8, 12], once: true },
    building: { row: 5, holds: [3, 3, 3, 3, 3, 3, 3, 3] },
    bashing: { row: 6, holds: [3, 3, 3] },
    mining: { row: 7, holds: [3, 3, 3, 3] },
    // DIG_INTERVAL = 7 ist prim — ungleiche Haltedauer ist hier zwingend.
    digging: { row: 8, holds: [3, 2, 2] },
    blocking: { row: 9, holds: [8, 8] },
    saving: { row: 10, holds: [3, 3, 3, 3, 3, 3], once: true },
    dying: { row: 11, holds: [3, 3, 3, 3, 3, 3, 4, 4], once: true },
  },
};

/** Welcher Clip gehört zu welchem Zustand? */
export function clipForWusel(w: Wusel): string | null {
  switch (w.state) {
    case State.WALKING:
      return 'walking';
    case State.FALLING:
      return w.hasFloater && w.fallDist >= 10 ? 'floating' : 'falling';
    case State.CLIMBING:
      return 'climbing';
    case State.HOISTING:
      return 'hoisting';
    case State.BUILDING:
      return 'building';
    case State.BASHING:
      return 'bashing';
    case State.MINING:
      return 'mining';
    case State.DIGGING:
      return 'digging';
    case State.BLOCKING:
      return 'blocking';
    case State.SAVING:
      return 'saving';
    case State.DYING:
      return 'dying';
    default:
      return null;
  }
}

export function cycleTicks(clip: ClipDef): number {
  let n = 0;
  for (const h of clip.holds) n += h;
  return n;
}

/** Bildindex aus der Uhr dieser Figur. */
export function frameFor(clip: ClipDef, timer: number): number {
  const cycle = cycleTicks(clip);
  if (cycle <= 0) return 0;
  let t = clip.once ? Math.min(timer, cycle - 1) : ((timer % cycle) + cycle) % cycle;
  for (let i = 0; i < clip.holds.length; i++) {
    if (t < clip.holds[i]) return i;
    t -= clip.holds[i];
  }
  return clip.holds.length - 1;
}

export class SpriteAtlas {
  constructor(
    readonly image: CanvasImageSource,
    readonly manifest: AtlasManifest,
  ) {}

  has(clip: string): boolean {
    return clip in this.manifest.clips;
  }

  /**
   * Zeichnet eine Figur. Gespiegelt wird um den Fusspunkt: Weil der Anker auf
   * halber Zellbreite sitzt, genügt dafür `scale(-1, 1)` ohne Versatzausgleich.
   */
  drawWusel(ctx: CanvasRenderingContext2D, v: View, w: Wusel): boolean {
    const name = clipForWusel(w);
    if (!name) return false;
    const clip = this.manifest.clips[name];
    if (!clip) return false;

    const cw = this.manifest.cell.w;
    const ch = this.manifest.cell.h;
    const frame = frameFor(clip, w.timer);
    const s = v.scale;

    const footX = Math.round(sx(v, w.x));
    const footY = Math.round(sy(v, w.y));

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.translate(footX, footY);
    if (w.dir < 0) ctx.scale(-1, 1);
    ctx.drawImage(
      this.image,
      frame * cw,
      clip.row * ch,
      cw,
      ch,
      -this.manifest.anchor.x * s,
      -this.manifest.anchor.y * s,
      cw * s,
      ch * s,
    );
    ctx.restore();
    return true;
  }
}

/** Lädt ein Bild aus einer Adresse. Liefert null statt zu werfen. */
export function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}
