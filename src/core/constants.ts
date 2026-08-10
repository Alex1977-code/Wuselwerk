/**
 * Alle Zahlen der Simulation an einem Ort.
 *
 * Regel: Hier stehen ausschliesslich Ganzzahlen in logischen Pixeln bzw. Ticks.
 * Die Simulation laeuft mit fester Tickrate und ohne Gleitkomma — das ist die
 * Voraussetzung fuer Zeitruecklauf, Wiederholungen und Ranglisten-Verifikation
 * (GDD §11).
 */

export const TICK_HZ = 60;
export const MS_PER_TICK = 1000 / TICK_HZ;

/** Fokuszeit (GDD §3.1): Beruehrung -> 25 % Geschwindigkeit. */
export const FOCUS_NUM = 1;
export const FOCUS_DEN = 4;

// --- Figurenmasse ---------------------------------------------------------
/** Koerperhoehe in logischen Pixeln. `y` ist die unterste Koerperzeile. */
export const WUSEL_H = 12;
/** Halbe Breite der gezeichneten Silhouette (Kollision laeuft ueber 1 Spalte). */
export const WUSEL_HALF_W = 2;

// --- Bewegung -------------------------------------------------------------
/** Ticks pro Pixel. Kleiner = schneller. */
export const WALK_INTERVAL = 3; // 20 px/s
export const FALL_INTERVAL = 1; // 60 px/s
export const FLOAT_INTERVAL = 3; // 20 px/s unter dem Schirm
/** Erst nach so vielen Fallpixeln oeffnet sich der Schirm. */
export const FLOAT_DEPLOY = 10;
/** Ab dieser Fallhoehe zerschellt eine Figur ohne Schirm. */
export const FALL_DEATH_PX = 78;
/** Maximale Stufenhoehe, die ein Laeufer erklimmt. Darueber: umdrehen. */
export const MAX_STEP = 5;
/** Maximaler Absatz, den ein Laeufer hinuntersteigt, ohne zu fallen. */
export const MAX_DROP = 3;

// --- Kletterer ------------------------------------------------------------
export const CLIMB_INTERVAL = 4;

// --- Brueckenbauer --------------------------------------------------------
export const BUILD_INTERVAL = 24;
export const BUILD_BRICKS = 12;
export const BRICK_LEN = 6;
export const BUILD_ADVANCE = 2;
/** Ab so vielen Reststufen warnt der Bauer (Ton + Blinken). */
export const BUILD_WARN_AT = 3;

// --- Rammer (waagerecht) --------------------------------------------------
export const BASH_INTERVAL = 9;
export const BASH_DEPTH = 2;
/** Wie weit ueber den Fuessen der Stollen ausgeraeumt wird. */
export const BASH_UP = 12;
/** Ist auf dieser Distanz nichts mehr da, ist der Rammer durch. */
export const BASH_LOOK = 5;

// --- Schraegbagger (diagonal abwaerts) ------------------------------------
export const MINE_INTERVAL = 12;
export const MINE_DX = 2;
export const MINE_DY = 1;
export const MINE_REACH = 4;

// --- Graeber (senkrecht abwaerts) -----------------------------------------
export const DIG_INTERVAL = 7;
export const DIG_HALF_W = 4;

// --- Sprengmeister --------------------------------------------------------
export const BOMB_FUSE_TICKS = 5 * TICK_HZ;
export const BOMB_RADIUS = 14;
/** Selbstzerstoerung: Versatz zwischen den einzelnen Zuendern. */
export const NUKE_STAGGER = 8;

// --- Blocker --------------------------------------------------------------
export const BLOCK_RADIUS = 5;

// --- Zustandsdauern -------------------------------------------------------
export const DYING_TICKS = 26;
export const SAVING_TICKS = 18;
/** Wartezeit, bis sich die Falltuer oeffnet. */
export const HATCH_OPEN_TICKS = 45;

// --- Freisetzungsrate -----------------------------------------------------
export const RATE_MIN = 1;
export const RATE_MAX = 99;

/**
 * Freisetzungsrate -> Ticks zwischen zwei Figuren.
 * Rate 1 ~ 3,3 s, Rate 99 ~ 0,13 s.
 */
export function releaseIntervalTicks(rate: number): number {
  const r = Math.max(RATE_MIN, Math.min(RATE_MAX, Math.round(rate)));
  return Math.max(8, Math.round(8 + (192 * (RATE_MAX - r)) / (RATE_MAX - RATE_MIN)));
}
