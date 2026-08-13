import { World } from '../src/core/world';
import { State } from '../src/core/types';
import type { LevelDef } from '../src/levels/types';

/**
 * Die Musterloesungen der neuen Welt 1 — noch nicht abgenommen.
 *
 * Sie gehoeren zu `src/levels/welt1.ts` und warten mit ihr auf die
 * Messrunde. Sobald ein Level gruen misst, wandert sein Plan von hier in die
 * `PLANS`-Tabelle von `levels.test.ts`, und das Level wandert in `index.ts`.
 *
 * Warum sie hier stehen und nicht in einer Fehlersuchdatei: Ein Plan ist die
 * einzige pruefbare Aussage darueber, dass ein Level ueberhaupt loesbar ist.
 * Ihn wegzuwerfen, weil er noch nicht gruen ist, hiesse die halbe Messrunde
 * noch einmal zu laufen.
 *
 * Stand des ersten Messlaufs (`docs/welt-1-neu.md` §6, Paket 1 bis 4):
 * w1-01 bis w1-06 und w1-08 loesen sich; die uebrigen sieben nicht. Die
 * gefundenen Ursachen stehen im Kopfkommentar von `welt1.ts`.
 */
export type Plan = (w: World) => void;

export function near(w: World, lo: number, hi: number, dir: -1 | 1 | 0 = 0) {
  return w.wusels.find(
    (x) => x.state === State.WALKING && x.x >= lo && x.x <= hi && (dir === 0 || x.dir === dir),
  );
}

/** Kette: gibt demselben Bauer nach, solange die Steine knapp werden. */
export function kette(w: World, id: number, rest: { n: number }, max: number): void {
  if (rest.n >= max) return;
  const b = w.wuselById(id);
  if (b && b.state === State.BUILDING && b.bricks <= 2 && w.assign(b.id, 'builder')) rest.n++;
}

export const W1_PLAENE: Record<string, (l: LevelDef) => Plan> = {
  'w1-01': () => {
    let done = false;
    return (w) => {
      if (done) return;
      const c = near(w, 232, 248);
      if (c && w.assign(c.id, 'digger')) done = true;
    };
  },
  'w1-02': () => {
    let done = false;
    return (w) => {
      if (done) return;
      const c = near(w, 334, 339, 1);
      if (c && w.assign(c.id, 'basher')) done = true;
    };
  },
  'w1-03': () => {
    let ram = false;
    let blo = false;
    let gra = false;
    return (w) => {
      if (!ram) {
        const c = near(w, 346, 352, -1);
        if (c && w.assign(c.id, 'basher')) ram = true;
        return;
      }
      if (!blo) {
        const c = near(w, 105, 118, -1);
        if (c && w.assign(c.id, 'blocker')) blo = true;
        return;
      }
      if (!gra) {
        const c = near(w, 155, 168);
        if (c && w.assign(c.id, 'digger')) gra = true;
      }
    };
  },
  'w1-04': () => {
    let bau: number | null = null;
    const rest = { n: 0 };
    let blo = false;
    let gra = false;
    return (w) => {
      if (bau === null) {
        const c = near(w, 340, 360, -1);
        if (c && w.assign(c.id, 'builder')) bau = c.id;
        return;
      }
      kette(w, bau, rest, 2);
      if (!blo && rest.n >= 2) {
        const c = w.wusels.find(
          (x) => x.id !== bau && x.state === State.WALKING && x.x >= 95 && x.x <= 115,
        );
        if (c && w.assign(c.id, 'blocker')) blo = true;
        return;
      }
      if (blo && !gra) {
        const c = near(w, 145, 160);
        if (c && w.assign(c.id, 'digger')) gra = true;
      }
    };
  },
  'w1-05': (l) => {
    let ram = false;
    let gra = false;
    return (w) => {
      for (const x of w.wusels) {
        if (
          x.state === State.WALKING &&
          !x.hasClimber &&
          x.x > 380 &&
          x.x < 400 &&
          w.skills.climber > 0
        ) {
          w.assign(x.id, 'climber');
        }
      }
      if (!ram) {
        const c = near(w, 552, 558, 1);
        if (c && w.assign(c.id, 'basher')) ram = true;
        return;
      }
      if (!gra) {
        const c = near(w, 645, 665);
        if (c && w.assign(c.id, 'digger')) gra = true;
      }
      void l;
    };
  },
  'w1-06': () => {
    let blo = false;
    let ram = false;
    return (w) => {
      if (!blo) {
        const c = near(w, 96, 118, -1);
        if (c && w.assign(c.id, 'blocker')) blo = true;
        return;
      }
      for (const x of w.wusels) {
        if (x.state === State.WALKING && !x.hasFloater && x.y < 280 && w.skills.floater > 0) {
          w.assign(x.id, 'floater');
        }
      }
      if (!ram && w.released >= 12 && w.skills.floater === 0) {
        const c = w.wusels.find(
          (x) => x.state === State.WALKING && x.hasFloater && x.x >= 372 && x.x <= 386 && x.dir === 1,
        );
        if (c && w.assign(c.id, 'basher')) ram = true;
      }
    };
  },
  'w1-07': () => {
    let bag = false;
    let ram = false;
    let gra = false;
    return (w) => {
      if (!bag) {
        const c = near(w, 650, 658, -1);
        if (c && w.assign(c.id, 'miner')) bag = true;
        return;
      }
      if (!ram) {
        const c = w.wusels.find(
          (x) => x.state === State.WALKING && x.y >= 348 && x.y <= 356 && x.dir === -1 && x.x < 520,
        );
        if (c && w.assign(c.id, 'basher')) ram = true;
        return;
      }
      if (!gra) {
        const c = w.wusels.find(
          (x) => x.state === State.WALKING && x.y >= 348 && x.y <= 356 && x.x >= 150 && x.x <= 175,
        );
        if (c && w.assign(c.id, 'digger')) gra = true;
      }
    };
  },
  'w1-08': () => {
    let bau: number | null = null;
    const rest = { n: 0 };
    let blo: number | null = null;
    let bom = false;
    return (w) => {
      if (bau === null) {
        const c = near(w, 340, 360, -1);
        if (c && w.assign(c.id, 'builder')) bau = c.id;
        return;
      }
      kette(w, bau, rest, 2);
      if (blo === null && rest.n >= 1) {
        const c = w.wusels.find(
          (x) => x.id !== bau && x.state === State.WALKING && x.x >= 392 && x.x <= 410,
        );
        if (c && w.assign(c.id, 'blocker')) blo = c.id;
        return;
      }
      if (blo !== null && !bom && rest.n >= 2) {
        const b = w.wuselById(bau);
        if (b && b.state !== State.BUILDING) {
          const bl = w.wuselById(blo);
          if (bl && w.assign(bl.id, 'bomber')) bom = true;
        }
      }
    };
  },
  'w1-09': () => {
    let kle = false;
    let bag = false;
    let gra = false;
    return (w) => {
      if (!kle) {
        const c = near(w, 480, 496, 1);
        if (c && w.assign(c.id, 'climber')) kle = true;
        return;
      }
      if (!bag) {
        const c = w.wusels.find(
          (x) =>
            x.state === State.WALKING &&
            x.y >= 320 &&
            x.y <= 328 &&
            x.x >= 684 &&
            x.x <= 693 &&
            x.dir === -1,
        );
        if (c && w.assign(c.id, 'miner')) bag = true;
        return;
      }
      if (!gra) {
        const c = w.wusels.find(
          (x) => x.state === State.WALKING && x.y >= 320 && x.y <= 328 && x.x >= 615 && x.x <= 640,
        );
        if (c && w.assign(c.id, 'digger')) gra = true;
      }
    };
  },
  'w1-10': () => {
    let blo = false;
    let ram1 = false;
    let ram2 = false;
    let gra = false;
    return (w) => {
      for (const x of w.wusels) {
        if (x.state === State.WALKING && !x.hasFloater && x.y < 240 && w.skills.floater > 0) {
          w.assign(x.id, 'floater');
        }
      }
      if (!blo && w.released >= 5) {
        const c = near(w, 330, 350);
        if (c && w.assign(c.id, 'blocker')) blo = true;
        return;
      }
      if (blo && !ram1) {
        const c = w.wusels.find(
          (x) => x.state === State.WALKING && x.hasFloater && x.x >= 390 && x.x <= 406 && x.dir === 1,
        );
        if (c && w.assign(c.id, 'basher')) ram1 = true;
        return;
      }
      if (ram1 && !ram2) {
        const c = w.wusels.find(
          (x) => x.state === State.WALKING && x.y >= 316 && x.y <= 324 && x.x >= 548 && x.x <= 558 && x.dir === 1,
        );
        if (c && w.assign(c.id, 'basher')) ram2 = true;
        return;
      }
      if (ram2 && !gra) {
        const c = w.wusels.find(
          (x) => x.state === State.WALKING && x.y >= 316 && x.y <= 324 && x.x >= 640 && x.x <= 665,
        );
        if (c && w.assign(c.id, 'digger')) gra = true;
      }
    };
  },
  'w1-11': () => {
    let g1 = false;
    let bag = false;
    let ram = false;
    let g3 = false;
    return (w) => {
      if (!g1) {
        const c = w.wusels.find(
          (x) => x.state === State.WALKING && x.y >= 176 && x.y <= 184 && x.x >= 290 && x.x <= 315,
        );
        if (c && w.assign(c.id, 'digger')) g1 = true;
        return;
      }
      if (!bag) {
        const c = w.wusels.find(
          (x) =>
            x.state === State.WALKING &&
            x.y >= 248 &&
            x.y <= 256 &&
            x.x >= 330 &&
            x.x <= 339 &&
            x.dir === -1,
        );
        if (c && w.assign(c.id, 'miner')) bag = true;
        return;
      }
      if (!ram) {
        const c = w.wusels.find(
          (x) => x.state === State.WALKING && x.y >= 320 && x.y <= 328 && x.x >= 420 && x.x <= 428 && x.dir === 1,
        );
        if (c && w.assign(c.id, 'basher')) ram = true;
        return;
      }
      if (!g3) {
        const c = w.wusels.find(
          (x) => x.state === State.WALKING && x.y >= 320 && x.y <= 328 && x.x >= 510 && x.x <= 535,
        );
        if (c && w.assign(c.id, 'digger')) g3 = true;
      }
    };
  },
  'w1-12': () => {
    let ram = false;
    let bau: number | null = null;
    const rest = { n: 0 };
    let gra = false;
    return (w) => {
      if (!ram) {
        const c = w.wusels.find(
          (x) => x.state === State.WALKING && x.y >= 224 && x.y <= 232 && x.x >= 316 && x.x <= 326 && x.dir === 1,
        );
        if (c && w.assign(c.id, 'basher')) ram = true;
        return;
      }
      if (bau === null) {
        const c = w.wusels.find(
          (x) => x.state === State.WALKING && x.y >= 224 && x.y <= 232 && x.x >= 312 && x.x <= 338 && x.dir === 1,
        );
        if (c && w.assign(c.id, 'builder')) bau = c.id;
        return;
      }
      kette(w, bau, rest, 2);
      if (rest.n >= 2 && !gra) {
        const c = w.wusels.find(
          (x) => x.state === State.WALKING && x.y >= 296 && x.y <= 304 && x.x >= 550 && x.x <= 575,
        );
        if (c && w.assign(c.id, 'digger')) gra = true;
      }
    };
  },
  'w1-13': () => {
    let ram = false;
    let bau: number | null = null;
    const rest = { n: 0 };
    let gra = false;
    return (w) => {
      if (!ram) {
        const c = near(w, 396, 406, 1);
        if (c && w.assign(c.id, 'basher')) ram = true;
        return;
      }
      if (bau === null) {
        const c = near(w, 396, 418, 1);
        if (c && w.assign(c.id, 'builder')) bau = c.id;
        return;
      }
      kette(w, bau, rest, 2);
      for (const x of w.wusels) {
        if (
          x.state === State.WALKING &&
          !x.hasClimber &&
          x.x > 460 &&
          x.x < 480 &&
          w.skills.climber > 0
        ) {
          w.assign(x.id, 'climber');
        }
      }
      if (!gra) {
        const c = w.wusels.find(
          (x) => x.state === State.WALKING && x.y >= 340 && x.y <= 348 && x.x >= 492 && x.x <= 515,
        );
        if (c && w.assign(c.id, 'digger')) gra = true;
      }
    };
  },
  'w1-14': () => {
    let ram1 = false;
    let blo = false;
    let bau: number | null = null;
    const rest = { n: 0 };
    let bag = false;
    let ram2 = false;
    return (w) => {
      if (!ram1) {
        const c = near(w, 346, 352, -1);
        if (c && w.assign(c.id, 'basher')) ram1 = true;
        return;
      }
      if (!blo) {
        const c = near(w, 320, 340, -1);
        if (c && w.assign(c.id, 'blocker')) blo = true;
        return;
      }
      if (bau === null) {
        const c = near(w, 264, 288, -1);
        if (c && w.assign(c.id, 'builder')) bau = c.id;
        return;
      }
      kette(w, bau, rest, 2);
      if (rest.n >= 2 && !bag) {
        const c = w.wusels.find(
          (x) =>
            x.state === State.WALKING &&
            x.y >= 336 &&
            x.y <= 344 &&
            x.x >= 216 &&
            x.x <= 226 &&
            x.dir === -1,
        );
        if (c && w.assign(c.id, 'miner')) bag = true;
        return;
      }
      if (bag && !ram2) {
        const c = w.wusels.find(
          (x) => x.state === State.WALKING && x.y >= 400 && x.y <= 410 && x.dir === -1,
        );
        if (c && w.assign(c.id, 'basher')) ram2 = true;
      }
    };
  },
};
