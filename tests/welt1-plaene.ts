import { World } from '../src/core/world';
import { State } from '../src/core/types';
import type { LevelDef } from '../src/levels/types';

/**
 * Die Musterloesungen der Welt 1 — gemessen und abgenommen.
 *
 * Sie gehoeren zu `src/levels/welt1.ts` und werden von `levels.test.ts` in
 * die `PLANS`-Tabelle gespreizt. Warum sie in einer eigenen Datei stehen und
 * nicht bei den uebrigen Plaenen: Jeder dieser vierzehn Plaene traegt einen
 * gemessenen Befund als Kommentar — welches Fenster warum genau so eng ist,
 * welche Zuweisung warum in dieser Reihenfolge kommt. Zwischen den
 * Altplaenen der uebrigen Welten waeren diese Befunde nicht mehr zu finden.
 *
 * Ein Plan ist die einzige pruefbare Aussage darueber, dass ein Level
 * ueberhaupt loesbar ist. Wer die Geometrie eines Levels anfasst, faellt
 * hier durch — und das ist der Zweck.
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
        // Erst wenn der Bagger fertig ist. Gemessen: Wird der Rammer
        // vergeben, solange der Bagger noch zwei Bildpunkte vor ihm
        // schneidet, schlaegt er genau einen Streifen — dann nimmt ihm der
        // Bagger den Boden weg, er faellt, laeuft bis an die ungeschnittene
        // Westwand und dreht ab. Ein Zug ist verloren, und das Level steht.
        if (w.wusels.some((x) => x.state === State.MINING)) return;
        // Auf der flachen Sohle ansetzen, nicht auf der Schraege: Ein Rammer
        // verliert auf schraegem Grund nach jedem Zwei-Punkt-Versatz den
        // Boden. Der erste Messlauf setzte ihn auf der Rampe an, und der
        // ganze Pulk pendelte danach dreissig Sekunden lang auf und ab.
        const c = w.wusels.find(
          (x) => x.state === State.WALKING && x.y === 351 && x.dir === -1 && x.x <= 516,
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
        // Der Schacht wird AUF der Schraege angesetzt, nicht auf dem
        // Plateaudach: Die Kammer liegt unter dem Schraegband.
        //
        // Das Fenster beginnt bei x=626 und nicht frueher. Ein Schacht ist
        // neun Bildpunkte breit (DIG_HALF_W 4), die Kammer beginnt bei
        // x=620 — wer westlich davon graebt, bohrt an der Kammer vorbei. Im
        // Messlauf tat er das bei x=612, fiel unten aus der Welt, und der
        // ganze Pulk lief hinterher: zwanzig Tote.
        const c = w.wusels.find(
          (x) => x.state === State.WALKING && x.y >= 346 && x.y <= 360 && x.x >= 626 && x.x <= 642,
        );
        if (c && w.assign(c.id, 'digger')) gra = true;
      }
    };
  },
  'w1-10': () => {
    let ram1 = false;
    let ram2 = false;
    let gra = false;
    return (w) => {
      for (const x of w.wusels) {
        if (x.state === State.WALKING && !x.hasFloater && x.y < 240 && w.skills.floater > 0) {
          w.assign(x.id, 'floater');
        }
      }
      // Kein Blocker. Der erste Messlauf setzte einen bei x=330 — also
      // mitten auf dem einzigen Weg zur Lippe. Wer noch westlich von ihm
      // stand, kam nie mehr nach Osten; gerettet wurde eine einzige Figur.
      // Der Blocker gehoert hier zum Werkzeugueberschuss, nicht zur Loesung:
      // Par 13 sind zehn Schirme, zwei Rammer, ein Graeber.
      if (!ram1) {
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
        // Weit weg von der Falltuer bei x=300: Wer dort graebt, faengt seine
        // Nachzuegler mitten im Sturz auf und bringt sie auf 131 Bildpunkte
        // Fallweg. Der Stahlriegel unter der Tuer verbietet den Griff
        // ohnehin; hier steht die Absicht.
        const c = w.wusels.find(
          (x) => x.state === State.WALKING && x.y >= 176 && x.y <= 184 && x.x >= 200 && x.x <= 240,
        );
        if (c && w.assign(c.id, 'digger')) g1 = true;
        return;
      }
      if (!bag) {
        // Am Pfeiler, in Laufrichtung OSTEN. Die Schraege muss von der Kappe
        // weglaufen; nach Westen taucht sie in sie hinein und dreht ab.
        const c = w.wusels.find(
          (x) =>
            x.state === State.WALKING &&
            x.y >= 248 &&
            x.y <= 256 &&
            x.x >= 330 &&
            x.x <= 339 &&
            x.dir === 1,
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
    let ram: number | null = null;
    let bau: number | null = null;
    const rest = { n: 0 };
    let gra = false;
    return (w) => {
      if (ram === null) {
        // Das Fenster beginnt bei x=323 und keinen Bildpunkt frueher. Ein
        // Rammer, dem beim Auftrag keine Wand in Reichweite steht (BASH_LOOK
        // 5), wird nicht zum Rammer, sondern zum VORGEMERKTEN Rammer: Er
        // laeuft weiter und faengt an der naechstbesten Wand an — in
        // welcher Richtung er dann gerade schaut. Im Messlauf drehte er an
        // der Lippe um, lief 120 Bildpunkte nach Westen und rammte dort die
        // Stirn des ersten Absatzes auf: Der ganze Absatz stand offen, die
        // Lippe stand noch, und der Pulk pendelte 170 Sekunden lang.
        const c = w.wusels.find(
          (x) => x.state === State.WALKING && x.y >= 224 && x.y <= 232 && x.x >= 323 && x.x <= 327 && x.dir === 1,
        );
        if (c && w.assign(c.id, 'basher')) ram = c.id;
        return;
      }
      if (bau === null) {
        // Nicht derselbe! Der erste Messlauf gab Rammer und Bauer in zwei
        // aufeinanderfolgenden Ticks an dieselbe Figur: Der Bauauftrag
        // ueberschrieb den Rammer, die Vormerkung blieb liegen, und beide
        // Auftraege waren verloren.
        const c = w.wusels.find(
          (x) =>
            x.id !== ram &&
            x.state === State.WALKING &&
            x.y >= 224 &&
            x.y <= 232 &&
            x.x >= 330 &&
            x.x <= 338 &&
            x.dir === 1,
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
    let ram: number | null = null;
    let bau: number | null = null;
    const rest = { n: 0 };
    let gra = false;
    return (w) => {
      if (ram === null) {
        // Dicht an die Lippe (x=408), sonst wird daraus eine Vormerkung, die
        // irgendwo im Westen losgeht — dieselbe Falle wie in w1-12.
        const c = near(w, 403, 407, 1);
        if (c && w.assign(c.id, 'basher')) ram = c.id;
        return;
      }
      if (bau === null) {
        // Eine ANDERE Figur, und erst hinter der geoeffneten Lippe: Der
        // Bauauftrag wuerde den Rammer sonst ueberschreiben.
        const c = w.wusels.find(
          (x) =>
            x.id !== ram &&
            x.state === State.WALKING &&
            x.y >= 435 &&
            x.y <= 443 &&
            x.x >= 408 &&
            x.x <= 418 &&
            x.dir === 1,
        );
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
    let bau: number | null = null;
    const rest = { n: 0 };
    let bag = false;
    return (w) => {
      if (!ram1) {
        const c = near(w, 346, 352, -1);
        if (c && w.assign(c.id, 'basher')) ram1 = true;
        return;
      }
      // KEIN Blocker. Der erste Messlauf setzte einen in den Stollen von
      // Knoten 1 — also in den einzigen Gang, den das Level hat. Ein Blocker
      // steht in diesem Spiel fuer immer: Man kann ihn nicht freigraben, er
      // blockt auch nach einem Sturz weiter. Der Pulk pendelte danach vier
      // Minuten oestlich von ihm, und gerettet wurde niemand. Die beiden
      // Blocker im Kasten sind Werkzeugueberschuss, keine Loesung.
      if (bau === null) {
        // Drei Bauer legen 72 Bildpunkte. Der Ansatz muss so weit oestlich
        // liegen, dass die Bruecke westlich des Spalts aufsetzt (x<=223) —
        // und so weit westlich, dass sie ueberhaupt gebaut wird, ehe der
        // Pulk am Spalt steht.
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
      // Kein zweiter Rammer: Die Kammer ist offen, sobald die Schraege ihre
      // Decke durchstoesst. Der Entwurf hatte ihn eingeplant, gemessen
      // braucht ihn niemand.
    };
  },
};
