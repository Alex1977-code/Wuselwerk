import { describe, expect, it } from 'vitest';
import { levelById } from './src/levels';
import { createWorld } from './src/levels/createWorld';
import { World } from './src/core/world';
import { State } from './src/core/types';
import type { LevelDef } from './src/levels/types';

type Plan = (w: World) => void;

function play(level: LevelDef, plan: Plan): World {
  const world = createWorld(level);
  const maxTicks = world.timeLimitTicks > 0 ? world.timeLimitTicks + 2 : 60 * 300;
  while (world.phase === 'running' && world.tickCount < maxTicks) {
    plan(world);
    world.tick();
  }
  return world;
}

function walkerNear(w: World, lo: number, hi: number, dir: -1 | 1 | 0 = 0) {
  return w.wusels.find(
    (x) => x.state === State.WALKING && x.x >= lo && x.x <= hi && (dir === 0 || x.dir === dir),
  );
}

function report(id: string, plan: Plan) {
  const lv = levelById(id)!;
  const w = play(lv, plan);
  // eslint-disable-next-line no-console
  console.log(
    `${id} phase=${w.phase} saved=${w.saved}/${lv.needed} dead=${w.dead} skills=${w.skillsUsed}/par ${lv.par} ticks=${w.tickCount}`,
  );
  return w;
}

describe('Probe', () => {
  it('w1-06', () => {
    let n = 0;
    const w = report('w1-06', (world) => {
      if (n >= 6) return;
      const c = world.wusels.find(
        (x) => x.state === State.WALKING && !x.hasClimber && x.x < 395 && world.skills.climber > 0,
      );
      if (c && world.assign(c.id, 'climber')) n++;
    });
    expect(w.phase).toBe('won');
  });

  it('w1-07', () => {
    let done = false;
    const w = report('w1-07', (world) => {
      if (done) return;
      const c = walkerNear(world, 249, 252, 1);
      if (c && world.assign(c.id, 'bomber')) done = true;
    });
    expect(w.phase).toBe('won');
  });

  it('w1-08', () => {
    let blocked = false;
    let built = false;
    const w = report('w1-08', (world) => {
      if (!built) {
        const c = walkerNear(world, 360, 368, -1);
        if (c && world.assign(c.id, 'builder')) built = true;
      }
      if (!blocked) {
        const c = walkerNear(world, 500, 540, 1);
        if (c && world.assign(c.id, 'blocker')) blocked = true;
      }
    });
    expect(w.phase).toBe('won');
  });

  it('w1-09', () => {
    let n = 0;
    const w = report('w1-09', (world) => {
      if (n >= 6) return;
      const c = world.wusels.find(
        (x) => x.state === State.WALKING && !x.hasClimber && x.x < 295,
      );
      if (!c) return;
      if (world.assign(c.id, 'climber')) {
        world.assign(c.id, 'floater');
        n++;
      }
    });
    expect(w.phase).toBe('won');
  });

  it('w1-10', () => {
    let built = false;
    let digger: number | null = null;
    let bashed = false;
    const w = report('w1-10', (world) => {
      if (!built) {
        const c = walkerNear(world, 415, 423, 1);
        if (c && world.assign(c.id, 'builder')) built = true;
        return;
      }
      if (digger === null) {
        const c = walkerNear(world, 876, 882, 1);
        if (c && world.assign(c.id, 'digger')) digger = c.id;
        return;
      }
      if (!bashed) {
        const d = world.wuselById(digger);
        if (d && d.state === State.WALKING && d.dir === -1 && d.y > 400 && d.x <= 874) {
          if (world.assign(d.id, 'basher')) bashed = true;
        }
      }
    });
    expect(w.phase).toBe('won');
  });
});
