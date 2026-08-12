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

// --- Musterlösungen der Kristallklamm -------------------------------------
//
// Sechs der zwölf Level übersetzen bewährte Grasland-Geometrien in Fels und
// Stahl, mit denselben Koordinaten — ihre Pläne stehen schon oben. Nur die
// sechs neuen Formen brauchen eigene Lösungen.

/** Reines Ankommen: Die Kante erledigt alles, null Zuweisungen. */
function planKlamm1(): Plan {
  return () => {};
}

/** Rechts vom Ende der Stahlader graben — die Tür liegt im Schacht. */
function planKlamm2(): Plan {
  let done = false;
  return (w) => {
    if (done) return;
    const c = walkerNear(w, 578, 590);
    if (c && w.assign(c.id, 'digger')) done = true;
  };
}

/** Sechs Kletterer für den Kamin — die Stirnseite ist Stahl. */
function planKlamm3(): Plan {
  let n = 0;
  return (w) => {
    if (n >= 6) return;
    const c = w.wusels.find(
      (x) => x.state === State.WALKING && !x.hasClimber && x.x < 415 && w.skills.climber > 0,
    );
    if (c && w.assign(c.id, 'climber')) n++;
  };
}

/** Der Schrägbagger, auf der Oberfläche vor der Kammer angesetzt. */
function planKlamm5(): Plan {
  let done = false;
  return (w) => {
    if (done) return;
    const c = walkerNear(w, 424, 436, -1);
    if (c && w.assign(c.id, 'miner')) done = true;
  };
}

/** Fünf Sekunden Zündschnur — die Naht liegt hier bei 287. */
function planKlamm6(): Plan {
  let done = false;
  return (w) => {
    if (done) return;
    const c = walkerNear(w, 185, 188, 1);
    if (c && w.assign(c.id, 'bomber')) done = true;
  };
}

/**
 * Schacht bis auf die Stahlsohle, dann der Stollen nach rechts zur Tür.
 * Der Rammer wird als Vormerkung vergeben — er greift von selbst, sobald
 * die Schachtwand in Reichweite kommt (Kritik F3c).
 */
function planKlamm11(): Plan {
  let graeber: number | null = null;
  let gerammt = false;
  return (w) => {
    if (graeber === null) {
      const c = walkerNear(w, 474, 486, 1);
      if (c && w.assign(c.id, 'digger')) graeber = c.id;
      return;
    }
    if (!gerammt) {
      const d = w.wuselById(graeber);
      if (d && d.state === State.WALKING && d.dir === 1 && d.y > 370) {
        if (w.assign(d.id, 'basher')) gerammt = true;
      }
    }
  };
}

// --- Musterlösungen des Rostwerks -----------------------------------------
//
// Welt 3 verlangt Mehrschritt-Pläne: fast jedes Level verkettet zwei bis
// drei Arbeiten. Die Pläne lesen sich entsprechend als kleine Drehbücher.

/** Ein Gräber durch die Rostnaht im Blechboden. */
function planRost1(): Plan {
  let done = false;
  return (w) => {
    if (done) return;
    const c = walkerNear(w, 500, 510);
    if (c && w.assign(c.id, 'digger')) done = true;
  };
}

/** Kletterer und Schirm auf dieselbe Figur — die Stahlwand verlangt beides. */
function planRost2(): Plan {
  let n = 0;
  return (w) => {
    if (n >= 6) return;
    const c = w.wusels.find((x) => x.state === State.WALKING && !x.hasClimber && x.x < 415);
    if (!c) return;
    if (w.assign(c.id, 'climber')) {
      w.assign(c.id, 'floater');
      n++;
    }
  };
}

/** Zwei Schrägen nacheinander: erst in Kammer A, von dort in Kammer B. */
function planRost3(): Plan {
  let erste = false;
  let zweite = false;
  return (w) => {
    if (!erste) {
      const c = walkerNear(w, 612, 624, -1);
      if (c && w.assign(c.id, 'miner')) erste = true;
      return;
    }
    if (!zweite) {
      // Ein Läufer, der schon in Kammer A angekommen ist (y > 400).
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.dir === -1 && x.y > 400 && x.x >= 340 && x.x <= 380,
      );
      if (c && w.assign(c.id, 'miner')) zweite = true;
    }
  };
}

/** Blocker, zwei Brückenketten von derselben Hand, dann die Erlösung. */
function planRost4(): Plan {
  let builder: number | null = null;
  let blocker: number | null = null;
  let kette1 = false;
  let bruecke2 = false;
  let kette2 = false;
  let bombed = false;
  return (w) => {
    if (builder === null) {
      const c = walkerNear(w, 356, 364, 1);
      if (c && w.assign(c.id, 'builder')) builder = c.id;
      return;
    }
    const b = w.wuselById(builder);
    if (!kette1 && b && b.state === State.BUILDING && !bruecke2 && b.bricks <= 2) {
      if (w.assign(b.id, 'builder')) kette1 = true;
      return;
    }
    if (blocker === null) {
      const c = w.wusels.find(
        (x) => x.id !== builder && x.state === State.WALKING && x.dir === 1 && x.x >= 296 && x.x <= 322,
      );
      if (c && w.assign(c.id, 'blocker')) blocker = c.id;
      return;
    }
    // Dieselbe Hand baut weiter: Nach der ersten Brücke läuft der Bauer zum
    // zweiten Spalt und setzt dort erneut an.
    if (!bruecke2 && b && b.state === State.WALKING && b.dir === 1 && b.x >= 628 && b.x <= 640) {
      if (w.assign(b.id, 'builder')) {
        bruecke2 = true;
        kette1 = true;
      }
      return;
    }
    if (bruecke2 && !kette2 && b && b.state === State.BUILDING && b.bricks <= 2) {
      if (w.assign(b.id, 'builder')) kette2 = true;
      return;
    }
    if (!bombed && kette2 && b && b.state === State.WALKING && b.x > 700) {
      const bl = w.wuselById(blocker);
      if (bl && w.assign(bl.id, 'bomber')) bombed = true;
    }
  };
}

/** Senkrecht bis aufs Blech, dann als Vormerkung waagerecht ins Freie. */
function planRost6(): Plan {
  let graeber: number | null = null;
  let gerammt = false;
  return (w) => {
    if (graeber === null) {
      const c = walkerNear(w, 330, 350, 1);
      if (c && w.assign(c.id, 'digger')) graeber = c.id;
      return;
    }
    if (!gerammt) {
      const d = w.wuselById(graeber);
      if (d && d.state === State.WALKING && d.dir === 1 && d.y > 290) {
        if (w.assign(d.id, 'basher')) gerammt = true;
      }
    }
  };
}

/** Die Brücke im Gegenlauf: gebaut nach links, mit Nachschub. */
function planRost7(): Plan {
  let builder: number | null = null;
  let kette = false;
  return (w) => {
    if (builder === null) {
      const c = walkerNear(w, 408, 420, -1);
      if (c && w.assign(c.id, 'builder')) builder = c.id;
      return;
    }
    if (!kette) {
      const b = w.wuselById(builder);
      if (b && b.state === State.BUILDING && b.bricks <= 2 && w.assign(b.id, 'builder')) {
        kette = true;
      }
    }
  };
}

/** Sechs Kletterer aufs Hochregal; der erste oben flickt die Lücke. */
function planRost8(): Plan {
  let n = 0;
  let geflickt = false;
  let flicker: number | null = null;
  return (w) => {
    if (flicker !== null) {
      const f = w.wuselById(flicker);
      if (f && f.state === State.BUILDING && f.bricks <= 2 && w.assign(f.id, 'builder')) {
        flicker = null;
      }
    }
    if (!geflickt) {
      // Wer schon auf dem Regal läuft (y < 300), flickt vor der Lücke.
      const oben = w.wusels.find(
        (x) => x.state === State.WALKING && x.y < 300 && x.dir === 1 && x.x >= 594 && x.x <= 599,
      );
      if (oben && w.assign(oben.id, 'builder')) {
        geflickt = true;
        flicker = oben.id;
        return;
      }
    }
    if (n >= 6) return;
    const c = w.wusels.find(
      (x) => x.state === State.WALKING && !x.hasClimber && x.y > 400 && x.x < 500,
    );
    if (c && w.assign(c.id, 'climber')) n++;
  };
}

/** Brückenkette über den Spalt, dann sechsmal Kletterer und Schirm. */
function planRost10(): Plan {
  let builder: number | null = null;
  let kette = false;
  let n = 0;
  return (w) => {
    if (builder === null) {
      const c = walkerNear(w, 390, 398, 1);
      if (c && w.assign(c.id, 'builder')) builder = c.id;
      return;
    }
    if (!kette) {
      const b = w.wuselById(builder);
      if (b && b.state === State.BUILDING && b.bricks <= 2 && w.assign(b.id, 'builder')) {
        kette = true;
      }
      return;
    }
    if (n >= 6) return;
    const c = w.wusels.find(
      (x) => x.state === State.WALKING && !x.hasClimber && x.x > 460 && x.x < 690,
    );
    if (!c) return;
    if (w.assign(c.id, 'climber')) {
      w.assign(c.id, 'floater');
      n++;
    }
  };
}

/** Die Naht sprengen, in die Halle fallen, den Riegel rammen. */
function planRost11(): Plan {
  let bombed = false;
  let gerammt = false;
  return (w) => {
    if (!bombed) {
      const c = walkerNear(w, 438, 441, 1);
      if (c && w.assign(c.id, 'bomber')) bombed = true;
      return;
    }
    if (!gerammt) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.dir === 1 && x.y > 380 && x.x > 560,
      );
      if (c && w.assign(c.id, 'basher')) gerammt = true;
    }
  };
}

/** Brückenkette, dann die Schräge in die Kammer — drei Werke, eine Reihe. */
function planRost12(): Plan {
  let builder: number | null = null;
  let kette = false;
  let geschraegt = false;
  return (w) => {
    if (builder === null) {
      const c = walkerNear(w, 470, 478, 1);
      if (c && w.assign(c.id, 'builder')) builder = c.id;
      return;
    }
    if (!kette) {
      const b = w.wuselById(builder);
      if (b && b.state === State.BUILDING && b.bricks <= 2 && w.assign(b.id, 'builder')) {
        kette = true;
      }
      return;
    }
    if (!geschraegt) {
      const c = walkerNear(w, 688, 700, 1);
      if (c && w.assign(c.id, 'miner')) geschraegt = true;
    }
  };
}

/** Sieben Kletterer, eine Naht, ein Riegel — die Grube sortiert den Rest. */
function planRost13(): Plan {
  let n = 0;
  let bombed = false;
  let gerammt = false;
  return (w) => {
    if (n < 7) {
      const c = w.wusels.find((x) => x.state === State.WALKING && !x.hasClimber);
      if (c && w.assign(c.id, 'climber')) n++;
      return;
    }
    if (!bombed) {
      const c = walkerNear(w, 738, 741, 1);
      if (c && w.assign(c.id, 'bomber')) bombed = true;
      return;
    }
    if (!gerammt) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.dir === -1 && x.y > 400 && x.x > 790,
      );
      if (c && w.assign(c.id, 'basher')) gerammt = true;
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
  'w2-01': planKlamm1,
  'w2-02': planKlamm2,
  'w2-03': planKlamm3,
  'w2-04': planLevel3,
  'w2-05': planKlamm5,
  'w2-06': planKlamm6,
  'w2-07': planLevel4,
  'w2-08': planLevel8,
  'w2-09': planLevel5,
  'w2-10': planLevel9,
  'w2-11': planKlamm11,
  'w2-12': planLevel10,
  'w3-01': planRost1,
  'w3-02': planRost2,
  'w3-03': planRost3,
  'w3-04': planRost4,
  'w3-05': planLevel4,
  'w3-06': planRost6,
  'w3-07': planRost7,
  'w3-08': planRost8,
  'w3-09': planKlamm11,
  'w3-10': planRost10,
  'w3-11': planRost11,
  'w3-12': planRost12,
  'w3-13': planRost13,
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
      expect(w.skillsUsed, level.id).toBeLessThanOrEqual(level.par);
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
      expect(w.dead, level.id).toBe(0);
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
