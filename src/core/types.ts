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

/**
 * Was auf dem Knopf steht.
 *
 * Der volle Name gehoert in den Text, nicht auf die Taste. „Schirmspringer"
 * misst in neun Punkt achtundsiebzig Bildpunkte; ein Berufsknopf ist auf dem
 * Telefon fuenfundsiebzig breit. Wer den vollen Namen erzwingt, landet bei
 * acht Punkt und muss zusaetzlich stauchen — und genau das war der Zustand,
 * den der Spieltest mit „nicht selbsterklaerend" beschrieben hat: Die Leiste
 * hat es sich so schwer gemacht, dass sie am Ende gar nichts mehr schrieb.
 *
 * Die Kurzform loest es andersherum. Sie ist kuerzer, also darf sie GROESSER
 * stehen — elf Punkt statt acht. Und sie kostet kein zweites Vokabular: Jede
 * Kurzform ist die Wurzel des vollen Namens (Schirm|springer, Brücke|nbauer,
 * Schräg|bagger, Spreng|meister), und in dem Moment, in dem man den Knopf
 * waehlt, schreibt die Hinweiszeile darunter den vollen Namen aus. Man lernt
 * das Paar also beim ersten Gebrauch, ohne es je gelehrt bekommen zu haben.
 */
export const SKILL_KNOPF: Record<SkillId, string> = {
  climber: 'Kletterer',
  floater: 'Schirm',
  bomber: 'Sprengen',
  blocker: 'Blocker',
  builder: 'Brücke',
  basher: 'Rammer',
  miner: 'Schräge',
  digger: 'Gräber',
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
  /**
   * Ein vorgemerkter Beruf, der auf seine Gelegenheit wartet.
   *
   * Der Rammer greift nur mit Wand in Reichweite — das Zeitfenster dafuer
   * nannte das Projekt selbst „wenige Pixel" (Kritik F3c). Wer ihn frueher
   * vergibt, verliert den Auftrag nicht mehr: Die Figur traegt ihn als
   * Vormerkung und beginnt von selbst, sobald die Wand in Reichweite kommt.
   */
  vormerk: SkillId | null;
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
