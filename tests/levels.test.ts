import { describe, expect, it } from 'vitest';
import { LEVELS, levelById } from '../src/levels';
import { createWorld } from '../src/levels/createWorld';
import { World } from '../src/core/world';
import { State } from '../src/core/types';
import type { LevelDef } from '../src/levels/types';

type Plan = (w: World) => void;

/** Spielt ein Level mit einem festen Handlungsplan durch. */
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

// --- Musterlösungen -------------------------------------------------------

function planLevel1(): Plan {
  let done = false;
  return (w) => {
    if (done) return;
    const c = walkerNear(w, 232, 248);
    if (c && w.assign(c.id, 'digger')) done = true;
  };
}

function planLevel2(): Plan {
  let done = false;
  return (w) => {
    if (done) return;
    // Der Rammer greift nur, wenn die Wand schon in Reichweite ist.
    const c = walkerNear(w, 336, 339, 1);
    if (c && w.assign(c.id, 'basher')) done = true;
  };
}

function planLevel3(): Plan {
  let builder: number | null = null;
  let blocker: number | null = null;
  let bombed = false;
  let chained = false;
  return (w) => {
    if (builder === null) {
      const c = walkerNear(w, 356, 364, 1);
      if (c && w.assign(c.id, 'builder')) builder = c.id;
      return;
    }
    // Nachsetzen, bevor die letzte Stufe liegt — die klassische Bauer-Kette.
    if (!chained) {
      const b = w.wuselById(builder);
      if (b && b.state === State.BUILDING && b.bricks <= 2 && w.assign(b.id, 'builder')) {
        chained = true;
      }
    }
    if (blocker === null) {
      const c = w.wusels.find(
        (x) => x.id !== builder && x.state === State.WALKING && x.dir === 1 && x.x >= 296 && x.x <= 322,
      );
      if (c && w.assign(c.id, 'blocker')) blocker = c.id;
      return;
    }
    if (!bombed) {
      const b = w.wuselById(builder);
      if (b && b.x > 400 && b.state === State.WALKING) {
        const bl = w.wuselById(blocker);
        if (bl && w.assign(bl.id, 'bomber')) bombed = true;
      }
    }
  };
}

function planLevel4(level: LevelDef): Plan {
  let given = 0;
  return (w) => {
    if (given >= level.needed) return;
    for (const x of w.wusels) {
      // Nur der lange Sturz von der Kante zählt, nicht der Tropfen aus der Falltür.
      if (x.state === State.FALLING && !x.hasFloater && x.y > 240 && w.skills.floater > 0) {
        if (w.assign(x.id, 'floater')) given++;
        if (given >= level.needed) return;
      }
    }
  };
}

function planLevel5(): Plan {
  let digger: number | null = null;
  let bashed = false;
  return (w) => {
    if (digger === null) {
      const c = walkerNear(w, 690, 700, 1);
      if (c && w.assign(c.id, 'digger')) digger = c.id;
      return;
    }
    if (!bashed) {
      const d = w.wuselById(digger);
      // Erst an der linken Schachtwand greift der Rammer.
      if (d && d.state === State.WALKING && d.dir === -1 && d.y > 400 && d.x <= 688) {
        if (w.assign(d.id, 'basher')) bashed = true;
      }
    }
  };
}

/** Sechs Kletterer für sechs Gerettete — mehr gibt die Wand nicht her. */
function planLevel6(): Plan {
  let n = 0;
  return (w) => {
    if (n >= 6) return;
    const c = w.wusels.find(
      (x) => x.state === State.WALKING && !x.hasClimber && x.x < 395 && w.skills.climber > 0,
    );
    if (c && w.assign(c.id, 'climber')) n++;
  };
}

/** Die Zündschnur brennt fünf Sekunden — hundert Bildpunkte Vorhalt. */
function planLevel7(): Plan {
  let done = false;
  return (w) => {
    if (done) return;
    const c = walkerNear(w, 249, 252, 1);
    if (c && w.assign(c.id, 'bomber')) done = true;
  };
}

/** Erst die Brücke über die Schlucht, dann der Blocker vor der Sackgasse. */
function planLevel8(): Plan {
  let gebaut = false;
  let geblockt = false;
  return (w) => {
    if (!gebaut) {
      const c = walkerNear(w, 360, 368, -1);
      if (c && w.assign(c.id, 'builder')) gebaut = true;
    }
    if (!geblockt) {
      const c = walkerNear(w, 500, 540, 1);
      if (c && w.assign(c.id, 'blocker')) geblockt = true;
    }
  };
}

/** Kletterer und Schirm auf dieselbe Figur, beides noch auf dem Boden. */
function planLevel9(): Plan {
  let n = 0;
  return (w) => {
    if (n >= 6) return;
    const c = w.wusels.find((x) => x.state === State.WALKING && !x.hasClimber && x.x < 295);
    if (!c) return;
    if (w.assign(c.id, 'climber')) {
      w.assign(c.id, 'floater');
      n++;
    }
  };
}

/** Brücke, Schacht bis auf den Stahl, dann an der linken Schachtwand der Stollen. */
function planLevel10(): Plan {
  let gebaut = false;
  let graeber: number | null = null;
  let gerammt = false;
  return (w) => {
    if (!gebaut) {
      const c = walkerNear(w, 415, 423, 1);
      if (c && w.assign(c.id, 'builder')) gebaut = true;
      return;
    }
    if (graeber === null) {
      const c = walkerNear(w, 876, 882, 1);
      if (c && w.assign(c.id, 'digger')) graeber = c.id;
      return;
    }
    if (!gerammt) {
      const d = w.wuselById(graeber);
      if (d && d.state === State.WALKING && d.dir === -1 && d.y > 400 && d.x <= 874) {
        if (w.assign(d.id, 'basher')) gerammt = true;
      }
    }
  };
}

const PLANS: Record<string, (level: LevelDef) => Plan> = {
  'w1-01': planLevel1,
  'w1-02': planLevel2,
  'w1-03': planLevel3,
  'w1-04': planLevel4,
  'w1-05': planLevel5,
  'w1-06': planLevel6,
  'w1-07': planLevel7,
  'w1-08': planLevel8,
  'w1-09': planLevel9,
  'w1-10': planLevel10,
};

function planFor(level: LevelDef): Plan {
  return PLANS[level.id](level);
}

describe('Alle Level sind lösbar', () => {
  for (const level of LEVELS) {
    it(`${level.id} — ${level.name}`, () => {
      const w = play(level, planFor(level));
      expect(w.phase).toBe('won');
      expect(w.saved).toBeGreaterThanOrEqual(level.needed);
    });
  }

  it('die Musterlösungen bleiben im Par-Budget', () => {
    for (const level of LEVELS) {
      const w = play(level, planFor(level));
      expect(w.skillsUsed).toBeLessThanOrEqual(level.par);
    }
  });
});

describe('Levelaufbau', () => {
  it('setzt die Falltür in freien Raum und den Ausgang ins Level', () => {
    for (const level of LEVELS) {
      const w = createWorld(level);
      expect(w.terrain.solid(level.entrance.x, level.entrance.y)).toBe(false);
      expect(level.exit.x).toBeGreaterThanOrEqual(0);
      expect(level.exit.x + level.exit.w).toBeLessThanOrEqual(level.width);
      expect(level.exit.y + level.exit.h).toBeLessThanOrEqual(level.height);
      expect(level.needed).toBeLessThanOrEqual(level.total);
    }
  });

  it('lässt Figuren aus der Falltür nicht zerschellen', () => {
    for (const level of LEVELS) {
      const w = createWorld(level);
      // 20 Sekunden reichen, um die ersten Figuren landen zu sehen.
      for (let i = 0; i < 60 * 20 && w.released < 2; i++) w.tick();
      for (let i = 0; i < 60 * 10; i++) w.tick();
      expect(w.dead).toBe(0);
    }
  });
});

describe('Determinismus', () => {
  it('zwei identische Läufe ergeben denselben Zustand', () => {
    const level = levelById('w1-03')!;
    const a = play(level, planFor(level));
    const b = play(level, planFor(level));
    expect(a.stateHash()).toBe(b.stateHash());
    expect(a.tickCount).toBe(b.tickCount);
    expect(a.saved).toBe(b.saved);
  });

  it('eine andere Eingabefolge ergibt einen anderen Zustand', () => {
    const level = levelById('w1-01')!;
    const a = play(level, planFor(level));
    const b = play(level, () => {});
    expect(a.stateHash()).not.toBe(b.stateHash());
  });

  it('der Terrainzustand hängt nur vom Startwert ab', () => {
    const level = levelById('w1-05')!;
    const a = createWorld(level);
    const b = createWorld(level);
    expect(Array.from(a.terrain.mat)).toEqual(Array.from(b.terrain.mat));
  });
});
