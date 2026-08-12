/** Materialkanal der Terrainmaske (GDD §11). */
export const MAT = {
  EMPTY: 0,
  EARTH: 1,
  ROCK: 2,
  /** Stahl — unzerstoerbar, stoppt jede Grabung (GDD §5). */
  STEEL: 3,
  /** Vom Brueckenbauer gelegte Stufe. */
  BRICK: 4,
} as const;

export type Material = (typeof MAT)[keyof typeof MAT];

/** Ist dieses Material grabbar? Stahl niemals. */
export function isDiggable(m: number): boolean {
  return m === MAT.EARTH || m === MAT.ROCK || m === MAT.BRICK;
}

export const SKILLS = [
  'climber',
  'floater',
  'bomber',
  'blocker',
  'builder',
  'basher',
  'miner',
  'digger',
] as const;

export type SkillId = (typeof SKILLS)[number];

export const SKILL_LABEL: Record<SkillId, string> = {
  climber: 'Kletterer',
  floater: 'Schirmspringer',
  bomber: 'Sprengmeister',
  blocker: 'Blocker',
  builder: 'Brückenbauer',
  basher: 'Rammer',
  miner: 'Schrägbagger',
  digger: 'Gräber',
};

export const SKILL_SHORT: Record<SkillId, string> = {
  climber: 'KLE',
  floater: 'SCH',
  bomber: 'BOM',
  blocker: 'BLO',
  builder: 'BRÜ',
  basher: 'RAM',
  miner: 'SBG',
  digger: 'GRÄ',
};

export type SkillCounts = Record<SkillId, number>;

export enum State {
  WALKING,
  FALLING,
  CLIMBING,
  HOISTING,
  BUILDING,
  BASHING,
  MINING,
  DIGGING,
  BLOCKING,
  DYING,
  SAVING,
  DEAD,
  SAVED,
}

export enum DeathCause {
  NONE,
  SPLAT,
  EXPLOSION,
  ABYSS,
  CRUSHED,
  NUKE,
}

export interface Wusel {
  id: number;
  /** Spalte der Kollisionsabfrage. */
  x: number;
  /** Unterste Koerperzeile. Der Boden liegt bei y + 1. */
  y: number;
  /** -1 = links, +1 = rechts. */
  dir: -1 | 1;
  state: State;
  /** Ticks im aktuellen Zustand. */
  timer: number;
  /** Bisher gefallene Pixel. */
  fallDist: number;
  /** Restliche Stufen des Brueckenbauers. */
  bricks: number;
  /** Fortschritt beim Hochziehen auf die Kante. */
  hoist: number;
  hasClimber: boolean;
  hasFloater: boolean;
  /** Bleibt gesetzt, damit ein herabfallender Blocker weiterblockt. */
  isBlocker: boolean;
  /** Restticks des Sprengcountdowns, 0 = kein Countdown. */
  fuse: number;
  cause: DeathCause;
  /** Tick, in dem die Figur die Falltuer verlassen hat. */
  bornTick: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Point {
  x: number;
  y: number;
}

export type WorldPhase = 'running' | 'won' | 'lost';

export interface WorldEvent {
  type:
    | 'assign'
    | 'dig'
    | 'steel'
    | 'explode'
    | 'brick'
    | 'saved'
    | 'died'
    | 'spawn'
    | 'fuse-tick'
    // Nur fuer Ton und Bild: Ein Kletterschritt, der Moment, in dem sich der
    // Schirm oeffnet, der Schreckensruf beim Zuenden, der Schrei im freien
    // Fall und das Aufkommen danach. Keines davon aendert den Weltzustand,
    // und keines geht in `hash()` ein — die Simulation bleibt bitgleich.
    | 'climb'
    | 'float'
    | 'oh-no'
    | 'scream'
    | 'land'
    // Die Falltuer klappt auf; eine Figur prallt am Blocker ab.
    | 'hatch'
    | 'bounce';
  x: number;
  y: number;
  skill?: SkillId;
  cause?: DeathCause;
  n?: number;
  /**
   * Blickrichtung der Figur beim Ereignis.
   *
   * Nur fuer die Darstellung: Schutt fliegt **nach hinten**, und wohin das ist,
   * weiss ausserhalb der Simulation niemand. Aendert keinen Zustand und geht
   * nicht in `hash()` ein.
   */
  dir?: -1 | 1;
}
