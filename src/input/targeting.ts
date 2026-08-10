import { WUSEL_H } from '../core/constants';
import type { SkillId, Wusel } from '../core/types';
import type { World } from '../core/world';

export interface Candidate {
  w: Wusel;
  dist: number;
}

/** Grosszuegiger Fangradius in logischen Pixeln (GDD §3.3). */
export const PICK_RADIUS = 26;
/** Ab wann zwei Kandidaten als "dicht beieinander" gelten. */
const FAN_RATIO = 1.75;
const FAN_SLACK = 8;
export const FAN_MAX = 5;

/**
 * Intelligentes Zielen: Der Tap sucht im Umkreis die naechste Figur, fuer die
 * der gewaehlte Beruf ueberhaupt gueltig ist. Wer schon klettert, wird beim
 * Kletterer nicht mehr angeboten; ein Blocker nicht doppelt gesetzt.
 */
export function findCandidates(
  world: World,
  skill: SkillId,
  lx: number,
  ly: number,
  radius = PICK_RADIUS,
): Candidate[] {
  const out: Candidate[] = [];
  const r2 = radius * radius;
  for (const w of world.wusels) {
    if (!world.canAssignTo(w, skill)) continue;
    const dx = w.x - lx;
    const dy = w.y - WUSEL_H / 2 - ly;
    const d2 = dx * dx + dy * dy;
    if (d2 > r2) continue;
    out.push({ w, dist: Math.sqrt(d2) });
  }
  out.sort((a, b) => a.dist - b.dist || a.w.id - b.w.id);
  return out;
}

/** Zwei gueltige Kandidaten dicht beieinander -> Auswahl-Faecher. */
export function needsFan(c: Candidate[]): boolean {
  return c.length >= 2 && c[1].dist <= c[0].dist * FAN_RATIO + FAN_SLACK;
}

const FAN_RADIUS = 88;
const FAN_SPREAD = (108 * Math.PI) / 180;

/** Zieht die Kandidaten auf einem Bogen ueber dem Daumen auseinander. */
export function fanSlots(n: number): { angle: number; dx: number; dy: number }[] {
  const slots: { angle: number; dx: number; dy: number }[] = [];
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0 : i / (n - 1) - 0.5;
    const angle = -Math.PI / 2 + t * FAN_SPREAD;
    slots.push({
      angle,
      dx: Math.cos(angle) * FAN_RADIUS,
      dy: Math.sin(angle) * FAN_RADIUS,
    });
  }
  return slots;
}

/** Welcher Faecherplatz liegt in Zugrichtung des Daumens? */
export function fanPick(dx: number, dy: number, n: number): number {
  if (n <= 1) return 0;
  if (Math.hypot(dx, dy) < 18) return 0;
  const a = Math.atan2(dy, dx);
  const slots = fanSlots(n);
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < n; i++) {
    let d = Math.abs(a - slots[i].angle);
    if (d > Math.PI) d = Math.PI * 2 - d;
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}
