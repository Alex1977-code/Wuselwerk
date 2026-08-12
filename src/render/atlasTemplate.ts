import { DeathCause, State, type Wusel } from '../core/types';
import type { View } from './camera';
import { DEFAULT_MANIFEST, type AtlasManifest } from './atlas';
import { drawWusel } from './sprites';

/**
 * Erzeugt ein Blatt in der verbindlichen Aufteilung — gezeichnet mit dem
 * vorhandenen prozeduralen Code.
 *
 * Zwei Zwecke: Es beweist, dass der ganze Atlasweg trägt, bevor es echte
 * Grafik gibt. Und es ist die Vorlage zum Übermalen — wer Bilder liefert,
 * sieht darin Zellraster, Fusspunkt und Bildzahl an der richtigen Stelle,
 * statt sie aus einer Tabelle abzuleiten.
 */

interface Setup {
  state: State;
  extra?: Partial<Wusel>;
}

const SETUPS: Record<string, Setup> = {
  walking: { state: State.WALKING },
  falling: { state: State.FALLING, extra: { fallDist: 30 } },
  floating: { state: State.FALLING, extra: { hasFloater: true, fallDist: 30 } },
  climbing: { state: State.CLIMBING, extra: { hasClimber: true } },
  hoisting: { state: State.HOISTING, extra: { hasClimber: true } },
  building: { state: State.BUILDING, extra: { bricks: 8 } },
  bashing: { state: State.BASHING },
  mining: { state: State.MINING },
  digging: { state: State.DIGGING },
  blocking: { state: State.BLOCKING, extra: { isBlocker: true } },
  saving: { state: State.SAVING },
  dying: { state: State.DYING, extra: { cause: DeathCause.SPLAT } },
};

function makeWusel(setup: Setup, timer: number): Wusel {
  return {
    id: 1,
    x: 0,
    y: 0,
    dir: 1,
    state: setup.state,
    timer,
    fallDist: 0,
    bricks: 0,
    hoist: 0,
    hasClimber: false,
    hasFloater: false,
    isBlocker: false,
    fuse: 0,
    vormerk: null,
    cause: DeathCause.NONE,
    bornTick: 0,
    ...setup.extra,
  };
}

export function renderTemplateAtlas(
  manifest: AtlasManifest = DEFAULT_MANIFEST,
): HTMLCanvasElement {
  const clips = Object.entries(manifest.clips);
  const cols = Math.max(...clips.map(([, c]) => c.holds.length));
  const rows = Math.max(...clips.map(([, c]) => c.row)) + 1;
  const cw = manifest.cell.w;
  const ch = manifest.cell.h;

  const canvas = document.createElement('canvas');
  canvas.width = cols * cw;
  canvas.height = rows * ch;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D-Kontext nicht verfügbar');

  for (const [name, clip] of clips) {
    const setup = SETUPS[name];
    if (!setup) continue;
    let timer = 0;
    for (let f = 0; f < clip.holds.length; f++) {
      const box = { x: f * cw, y: clip.row * ch, w: cw, h: ch };
      // Massstab 1: eine Zelle ist ein logischer Bildbereich. Der Fusspunkt
      // landet dadurch genau auf dem Anker der Zelle.
      const view: View = {
        ox: -manifest.anchor.x,
        oy: -manifest.anchor.y,
        scale: 1,
        box,
      };
      ctx.save();
      ctx.beginPath();
      ctx.rect(box.x, box.y, box.w, box.h);
      ctx.clip();
      // Der prozedurale Zeichner nutzt einen globalen Takt für Schrittphasen;
      // hier wird er je Bild weitergedreht, damit die Bilder sich unterscheiden.
      drawWusel(ctx, view, makeWusel(setup, timer), f * 6);
      ctx.restore();
      timer += clip.holds[f];
    }
  }
  return canvas;
}
