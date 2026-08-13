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
    // Alle acht Paare — die Quote fordert seit der Design-Runde den vollen
    // Vorrat, nicht sechs mit zwei Fehlern Luft.
    if (n >= 8) return;
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
function planRost13(anzahl = 9): Plan {
  let n = 0;
  let bombed = false;
  let gerammt = false;
  return (w) => {
    // Neun Kletterer seit der Design-Runde: Acht kommen durch, einer wird
    // am Riegel zum Sprengmeister — Marge 2 ueber der Quote von 6.
    if (n < anzahl) {
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


// --- Musterlösungen der Frostklamm ----------------------------------------
//
// Welt 4 ist senkrecht: Fast jeder Plan beschreibt einen Abstieg. Die
// y-Filter unterscheiden die Etagen — x allein sagt in einer schmalen
// Welt nichts mehr.

/** Die Kaskade trägt von selbst: null Zuweisungen. */
function planFrost1(): Plan {
  return () => {};
}

/** Pfercht aufgraben, dann jeden Fallenden schirmen — sechs Schirme. */
function planFrost2(): Plan {
  let auf = false;
  let given = 0;
  return (w) => {
    if (!auf) {
      const c = walkerNear(w, 230, 250);
      if (c && w.assign(c.id, 'digger')) auf = true;
      return;
    }
    if (given >= 6) return;
    for (const x of w.wusels) {
      if (x.state === State.FALLING && !x.hasFloater && x.y > 320 && w.skills.floater > 0) {
        if (w.assign(x.id, 'floater')) given++;
        if (given >= 6) return;
      }
    }
  };
}

/** Zweimal senkrecht: erst durch das Sims, dann durch die Zwischendecke. */
function planFrost3(): Plan {
  let erster = false;
  let zweiter = false;
  return (w) => {
    if (!erster) {
      // Nie unter der Falltuer graben: Nachruecker fielen sonst von der
      // Tuerhoehe durch den fertigen Schacht — weit ueber der Grenze.
      const c = walkerNear(w, 60, 100);
      if (c && w.assign(c.id, 'digger')) erster = true;
      return;
    }
    if (!zweiter) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.y > 280 && x.y < 330 && x.x >= 240 && x.x <= 280,
      );
      if (c && w.assign(c.id, 'digger')) zweiter = true;
    }
  };
}

/** Die Brücke über den Spalt, mit Nachschub. */
function planFrost4(): Plan {
  let builder: number | null = null;
  let kette = false;
  return (w) => {
    if (builder === null) {
      const c = walkerNear(w, 206, 214, 1);
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

/** Schacht auf die Terrasse, dann der Wächter an die Westkante. */
function planFrost5(): Plan {
  let erster = false;
  let gewacht = false;
  return (w) => {
    if (!erster) {
      const c = walkerNear(w, 150, 190);
      if (c && w.assign(c.id, 'digger')) erster = true;
      return;
    }
    if (!gewacht) {
      const c = w.wusels.find(
        (x) =>
          x.state === State.WALKING && x.dir === -1 && x.y > 280 && x.y < 300 &&
          x.x >= 128 && x.x <= 168,
      );
      if (c && w.assign(c.id, 'blocker')) gewacht = true;
    }
  };
}

/** Wie Schirmpflicht, nur mit Zwischenhalt — der eine Schirm gilt weiter. */
function planFrost6(): Plan {
  return planFrost2();
}

/** Die Kaskade hinab, dann sechs Kletterer auf den Türpfeiler. */
function planFrost7(): Plan {
  let n = 0;
  return (w) => {
    if (n >= 6) return;
    const c = w.wusels.find(
      (x) => x.state === State.WALKING && !x.hasClimber && x.y > 400 && x.x > 140,
    );
    if (c && w.assign(c.id, 'climber')) n++;
  };
}

/** Die Naht liegt bei 180 — hundert Bildpunkte Vorhalt im Rücklauf. */
function planFrost8(): Plan {
  let done = false;
  return (w) => {
    if (done) return;
    const c = walkerNear(w, 280, 283, -1);
    if (c && w.assign(c.id, 'bomber')) done = true;
  };
}

/** Zwei Schrägen im Zickzack, die zweite vom Kammerboden aus. */
function planFrost9(): Plan {
  let erste = false;
  let zweite = false;
  return (w) => {
    if (!erste) {
      const c = walkerNear(w, 300, 320, -1);
      if (c && w.assign(c.id, 'miner')) erste = true;
      return;
    }
    if (!zweite) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.dir === 1 && x.y > 330 && x.x >= 80 && x.x <= 100,
      );
      if (c && w.assign(c.id, 'miner')) zweite = true;
    }
  };
}

/** Zwei Wächter für zwei offene Kanten — die Tür liegt dazwischen. */
function planFrost10(): Plan {
  let erster = false;
  let rechts = false;
  let links = false;
  return (w) => {
    if (!erster) {
      const c = walkerNear(w, 150, 190);
      if (c && w.assign(c.id, 'digger')) erster = true;
      return;
    }
    // Der Westwaechter zuerst: Jeder Nachruecker erreicht den Schacht
    // westwaerts (nach dem Abprall an der Ostwand) und landet mit Blick
    // nach links — die Westkante ist zuerst dran.
    if (!links) {
      const c = w.wusels.find(
        (x) =>
          x.state === State.WALKING && x.dir === -1 && x.y > 280 && x.y < 300 &&
          x.x >= 136 && x.x <= 180,
      );
      if (c && w.assign(c.id, 'blocker')) links = true;
      return;
    }
    if (!rechts) {
      const c = w.wusels.find(
        (x) =>
          x.state === State.WALKING && x.dir === 1 && x.y > 280 && x.y < 300 &&
          x.x >= 300 && x.x <= 344,
      );
      if (c && w.assign(c.id, 'blocker')) rechts = true;
    }
  };
}

/** Drei Bauer in einer Kette über die Klamm. */
function planFrost11(): Plan {
  let builder: number | null = null;
  let ketten = 0;
  return (w) => {
    if (builder === null) {
      const c = walkerNear(w, 126, 136, 1);
      if (c && w.assign(c.id, 'builder')) builder = c.id;
      return;
    }
    if (ketten < 2) {
      const b = w.wuselById(builder);
      if (b && b.state === State.BUILDING && b.bricks <= 2 && w.assign(b.id, 'builder')) {
        ketten++;
      }
    }
  };
}

/** Sechs Kletterer die Treppe hinauf — jede Stufe zu hoch zum Steigen. */
function planFrost13(): Plan {
  let n = 0;
  return (w) => {
    if (n >= 6) return;
    const c = w.wusels.find((x) => x.state === State.WALKING && !x.hasClimber && x.x < 160);
    if (c && w.assign(c.id, 'climber')) n++;
  };
}

/** Schacht, Wächter, zweiter Schacht, Naht, Riegel — der ganze Abstieg. */
function planFrost14(): Plan {
  let erster = false;
  let gewacht = false;
  let zweiter = false;
  let bombed = false;
  let gerammt = false;
  return (w) => {
    if (!erster) {
      const c = walkerNear(w, 150, 190);
      if (c && w.assign(c.id, 'digger')) erster = true;
      return;
    }
    if (!gewacht) {
      const c = w.wusels.find(
        (x) =>
          x.state === State.WALKING && x.dir === -1 && x.y > 260 && x.y < 280 &&
          x.x >= 128 && x.x <= 168,
      );
      if (c && w.assign(c.id, 'blocker')) gewacht = true;
      return;
    }
    if (!zweiter) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.y > 260 && x.y < 280 && x.x >= 296 && x.x <= 316,
      );
      if (c && w.assign(c.id, 'digger')) zweiter = true;
      return;
    }
    if (!bombed) {
      // Die Zuendung westwaerts: Wer vom Schacht kommt, laeuft nach links —
      // hundert Bildpunkte vor der Naht bei 200 heisst also bei 300.
      const c = w.wusels.find(
        (x) =>
          x.state === State.WALKING && x.dir === -1 && x.y > 330 && x.y < 350 &&
          x.x >= 298 && x.x <= 301,
      );
      if (c && w.assign(c.id, 'bomber')) bombed = true;
      return;
    }
    if (!gerammt) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.dir === 1 && x.y > 390 && x.x > 200,
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
  'w3-13': () => planRost13(9),
  'w4-01': planFrost1,
  'w4-02': planFrost2,
  'w4-03': planFrost3,
  'w4-04': planFrost4,
  'w4-05': planFrost5,
  'w4-06': planFrost6,
  'w4-07': planFrost7,
  'w4-08': planFrost8,
  'w4-09': planFrost9,
  'w4-10': planFrost10,
  'w4-11': planFrost11,
  'w4-12': planFrost3,
  'w4-13': planFrost13,
  'w4-14': planFrost14,
  // Welt 5 beschleunigt bewiesene Geometrien — die Quellplaene gelten
  // woertlich weiter (die Koordinaten sind identisch).
  'w5-01': planFrost1,
  'w5-02': planLevel1,
  'w5-03': planLevel3,
  'w5-04': planLevel7,
  'w5-05': planLevel8,
  'w5-06': planKlamm11,
  'w5-07': planKlamm5,
  'w5-08': planLevel5,
  'w5-09': planLevel6,
  'w5-10': planLevel4,
  'w5-11': planRost6,
  'w5-12': planRost4,
  'w5-13': planRost11,
  'w5-14': planLevel10,
  'w5-15': () => planRost13(9),
};

function planFor(level: LevelDef): Plan {
  return PLANS[level.id](level);
}

/**
 * Rot-Test: Der geerbte Altplan darf dieses Level NICHT mehr loesen.
 *
 * Abnahmekriterium der Entklonung (Design-Runde, Leitsatz 3): Ein Level
 * gilt erst als eigenstaendig, wenn die Musterloesung seines Vorbilds
 * nachweislich scheitert. Gruen waere der Beweis, dass sich nur die Farbe
 * geaendert hat.
 */
function erwarteRot(levelId: string, altplan: (level: LevelDef) => Plan): void {
  const level = levelById(levelId);
  if (!level) throw new Error(`Level ${levelId} fehlt`);
  const w = play(level, altplan(level));
  expect(w.phase, `${levelId}: der Altplan muesste scheitern`).toBe('lost');
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

describe('Messlauf', () => {
  // "Kein Wert ohne Messung" (Design-Runde, Leitsatz 2): Der Bericht ist
  // die Quittung, an der Uhren (Faktor x Planzeit), Quoten (Rettungszahl
  // minus Marge) und Ueberschuss (Werkzeuge minus Par) kalibriert werden.
  // Er wird bei jedem Testlauf neu geschrieben und eingecheckt — wer eine
  // Zahl aendert, sieht im Diff, was sie wirklich bewirkt.
  it('schreibt docs/messlauf.json — die Quittung jeder Musterlösung', async () => {
    const { writeFileSync } = await import('node:fs');
    const bericht = LEVELS.map((level) => {
      // Wie `play`, aber mit Blick auf die Uhrkalibrierung: Viele Laeufe
      // enden erst mit der Uhr, weil ein Blocker stehen bleibt — fuer die
      // Uhr zaehlt die LETZTE RETTUNG, nicht das Laufende.
      const w = createWorld(level);
      const plan = planFor(level);
      const maxTicks = w.timeLimitTicks > 0 ? w.timeLimitTicks + 2 : 60 * 300;
      let letzteRettungTick = 0;
      let quoteTick = 0;
      while (w.phase === 'running' && w.tickCount < maxTicks) {
        plan(w);
        const vorher = w.saved;
        w.tick();
        if (w.saved > vorher) {
          letzteRettungTick = w.tickCount;
          if (vorher < level.needed && w.saved >= level.needed) quoteTick = w.tickCount;
        }
      }
      const werkzeuge = Object.values(level.skills).reduce((a, b) => a + b, 0);
      const benutzt: Record<string, number> = {};
      for (const [skill, anzahl] of Object.entries(level.skills)) {
        const rest = w.skills[skill as keyof typeof w.skills] ?? 0;
        if (anzahl - rest > 0) benutzt[skill] = anzahl - rest;
      }
      return {
        id: level.id,
        name: level.name,
        planTicks: w.tickCount,
        letzteRettungSek: Number((letzteRettungTick / 60).toFixed(1)),
        quoteSek: Number((quoteTick / 60).toFixed(1)),
        uhrSek: w.timeLimitTicks / 60,
        uhrFaktor:
          letzteRettungTick > 0 ? Number((w.timeLimitTicks / letzteRettungTick).toFixed(2)) : null,
        gerettet: w.saved,
        total: level.total,
        quote: level.needed,
        quotenMarge: w.saved - level.needed,
        par: level.par,
        vergaben: w.skillsUsed,
        benutzt,
        werkzeuge,
        ueberschuss: werkzeuge - level.par,
      };
    });
    writeFileSync('docs/messlauf.json', `${JSON.stringify(bericht, null, 1)}\n`);
    for (const b of bericht) expect(b.gerettet, b.id).toBeGreaterThanOrEqual(b.quote);
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
