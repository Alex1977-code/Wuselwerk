import type { Rect, SkillCounts } from '../core/types';

export type ThemeId = 'grass' | 'crystal' | 'rust';

export type PaintOp =
  | { t: 'rect'; x: number; y: number; w: number; h: number; mat: number }
  | { t: 'ellipse'; cx: number; cy: number; rx: number; ry: number; mat: number }
  /** Waagerechter Boden mit rauer Oberkante. */
  | { t: 'ground'; x: number; w: number; y: number; h: number; mat: number; rough: number }
  /** Dicke Linie von (x0,y0) nach (x1,y1) — fuer Rampen und Schraegen. */
  | { t: 'slope'; x0: number; y0: number; x1: number; y1: number; thick: number; mat: number };

export interface LevelDef {
  id: string;
  name: string;
  chapter: string;
  /** Einzeiler, der beim Start eingeblendet wird. */
  hint: string;
  theme: ThemeId;
  width: number;
  height: number;
  /** Zufallsstartwert fuer die Oberflaechenrauheit — haelt Level reproduzierbar. */
  seed: number;
  entrance: { x: number; y: number };
  exit: Rect;
  total: number;
  needed: number;
  timeLimitSec: number;
  releaseRate: number;
  minReleaseRate: number;
  skills: SkillCounts;
  /** Skillzahl der Musterloesung — Stern 3 (GDD §8). */
  par: number;
  paint: PaintOp[];
}
