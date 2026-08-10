import { Terrain } from '../core/terrain';
import type { PaintOp } from './types';

/** Kleiner, schneller PRNG. Gleicher Startwert -> gleiches Level. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next(): number {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Baut die Terrainmaske aus den Malbefehlen des Levels auf. */
export function paintTerrain(terrain: Terrain, ops: PaintOp[], seed: number): void {
  const rnd = mulberry32(seed);
  for (const op of ops) {
    switch (op.t) {
      case 'rect':
        terrain.fillRect(op.x, op.y, op.w, op.h, op.mat);
        break;
      case 'ellipse':
        terrain.fillEllipse(op.cx, op.cy, op.rx, op.ry, op.mat);
        break;
      case 'ground':
        paintGround(terrain, op, rnd);
        break;
      case 'slope':
        paintSlope(terrain, op);
        break;
    }
  }
}

function paintGround(
  terrain: Terrain,
  op: Extract<PaintOp, { t: 'ground' }>,
  rnd: () => number,
): void {
  let offset = 0;
  for (let x = op.x; x < op.x + op.w; x++) {
    if (op.rough > 0 && x % 3 === 0) {
      offset += rnd() < 0.5 ? -1 : 1;
      offset = Math.max(-op.rough, Math.min(op.rough, offset));
    }
    const top = op.y + offset;
    terrain.fillRect(x, top, 1, op.h + (op.y - top), op.mat);
  }
}

function paintSlope(terrain: Terrain, op: Extract<PaintOp, { t: 'slope' }>): void {
  const dx = op.x1 - op.x0;
  const dy = op.y1 - op.y0;
  const steps = Math.max(Math.abs(dx), Math.abs(dy));
  if (steps === 0) return;
  for (let i = 0; i <= steps; i++) {
    const x = Math.round(op.x0 + (dx * i) / steps);
    const y = Math.round(op.y0 + (dy * i) / steps);
    terrain.fillRect(x, y, 1, op.thick, op.mat);
  }
}
