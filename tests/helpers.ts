import { Terrain } from '../src/core/terrain';
import { World } from '../src/core/world';
import { DeathCause, MAT, SKILLS, State, type SkillCounts, type Wusel } from '../src/core/types';

export function fullSkills(n = 9): SkillCounts {
  const out = {} as SkillCounts;
  for (const s of SKILLS) out[s] = n;
  return out;
}

/** Flache Testwelt: Boden ab y=80, Ausgang weit rechts ausserhalb des Weges. */
export function testWorld(width = 200, height = 120, groundY = 80): World {
  const terrain = new Terrain(width, height);
  terrain.fillRect(0, groundY, width, height - groundY, MAT.EARTH);
  return new World({
    terrain,
    entrance: { x: 20, y: 20 },
    exit: { x: width - 6, y: height - 4, w: 4, h: 4 },
    total: 1,
    needed: 1,
    timeLimitSec: 0,
    releaseRate: 50,
    minReleaseRate: 1,
    skills: fullSkills(),
  });
}

let testId = 1000;

/** Setzt eine Figur direkt in die Welt — umgeht die Falltuer. */
export function place(
  world: World,
  x: number,
  y: number,
  state: State = State.WALKING,
  dir: -1 | 1 = 1,
  extra: Partial<Wusel> = {},
): Wusel {
  const w: Wusel = {
    id: testId++,
    x,
    y,
    dir,
    state,
    timer: 0,
    fallDist: 0,
    bricks: 0,
    hoist: 0,
    hasClimber: false,
    hasFloater: false,
    isBlocker: false,
    fuse: 0,
    cause: DeathCause.NONE,
    bornTick: 0,
    ...extra,
  };
  world.wusels.push(w);
  return w;
}

export function run(world: World, ticks: number): void {
  for (let i = 0; i < ticks; i++) world.tick();
}
