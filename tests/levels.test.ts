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

/**
 * w2-05 v2 „Taktgeber" — der Rate-Regler ist das Loesungswerkzeug.
 *
 * Sofort drosseln (der Pulk bleibt klein, niemand verpendelt Wegzeit vor
 * der ungeoeffneten Kammer), den Bagger beim ersten Ankoemmling ansetzen,
 * nach dem Durchbruch voll aufdrehen — die Nachzuegler fallen direkt in
 * die fertige Schraege. Rate-Zuege kosten kein Par.
 */
function planKlamm5v2(): Plan {
  let miner: number | null = null;
  let offen = false;
  return (w) => {
    if (miner === null) {
      w.setReleaseRate(w.minReleaseRate);
      const c = walkerNear(w, 424, 436, -1);
      if (c && w.assign(c.id, 'miner')) miner = c.id;
      return;
    }
    if (!offen) {
      const m = w.wuselById(miner);
      // Durchbruch: Der Bagger ist in der Kammer angekommen (faellt oder
      // laeuft unterhalb der Kammerdecke) — jetzt voll aufdrehen.
      if (!m || m.y > 415 || m.state !== State.MINING) {
        w.setReleaseRate(99);
        offen = true;
      }
    }
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

/**
 * Blocker, zwei Brückenketten von derselben Hand, dann die Erlösung.
 *
 * Rate-Fenster-Fassung (Level-Konzept, Paket 2): sofort drosseln, nach
 * der Sprengung aufdrehen. Die Uhr ist an DIESER gedrosselten Messung
 * geeicht — die Pionier-Wartezeit steckt in der Messung. Wer nicht
 * drosselt, verliert bei Rate 70 Nachzuegler an die Spalte, und die
 * Marge-1-Pruefung verzeiht genau einen.
 */
function planRost4(): Plan {
  let builder: number | null = null;
  let blocker: number | null = null;
  let kette1 = false;
  let bruecke2 = false;
  let kette2 = false;
  let bombed = false;
  let gedrosselt = false;
  return (w) => {
    if (!gedrosselt) {
      w.setReleaseRate(30);
      gedrosselt = true;
    }
    if (bombed) w.setReleaseRate(99);
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
/**
 * w4-10 v2 „Vier Kanten" — die Ostwache.
 *
 * Alle spawnen ostwaerts; der Ost-Schacht ist der schnelle Weg. Der erste
 * Lander, der unten ostwaerts weiterlaeuft, wird SOFORT Waechter vor der
 * Kante — ohne ihn sterben fuenfzehn (gemessen). Westlaeufer faengt die
 * Tuer von selbst. Die Uhr laesst den langsamen West-Schacht nicht mehr
 * zu (Rot-Test mit `planFrost10Alt`).
 */
function planFrost10(): Plan {
  let schacht = false;
  let wache = false;
  return (w) => {
    if (!schacht) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.y < 260 && x.x >= 322 && x.x <= 335,
      );
      if (c && w.assign(c.id, 'digger')) schacht = true;
      return;
    }
    if (!wache) {
      const c = w.wusels.find(
        (x) =>
          x.state === State.WALKING && x.dir === 1 && x.y > 280 && x.y < 300 &&
          x.x >= 336 && x.x <= 354,
      );
      if (c && w.assign(c.id, 'blocker')) wache = true;
    }
  };
}

/** Die alte w4-10-Loesung: West-Schacht mit zwei Waechtern — zu langsam. */
function planFrost10Alt(): Plan {
  let erster = false;
  let rechts = false;
  let links = false;
  return (w) => {
    if (!erster) {
      const c = walkerNear(w, 150, 190);
      if (c && w.assign(c.id, 'digger')) erster = true;
      return;
    }
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

/**
 * w4-01 v2 „Die Kante" — die aktivierte Kaskade (Paket 3, Baustein B5).
 *
 * Ein Wusel macht beide Handgriffe: westwaerts durch den Riegel auf
 * Stufe 2, dann — nach Wandwende auf Stufe 3 — der Schacht auf das
 * Zwischenbord, bevor irgendwer die toedliche Ostkante erreicht. Der
 * Rammer ist immer der Erste auf Stufe 3; wer ihm folgt, faellt in den
 * fertigen oder wachsenden Schacht.
 */
function planKaskade(): Plan {
  let rammer: number | null = null;
  let schacht = false;
  return (w) => {
    if (rammer === null) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.dir === -1 && x.y > 240 && x.y < 260 &&
          x.x >= 190 && x.x <= 230,
      );
      if (c && w.assign(c.id, 'basher')) rammer = c.id;
      return;
    }
    if (!schacht) {
      const r = w.wuselById(rammer);
      if (r && r.state === State.WALKING && r.dir === 1 && r.y > 280 && r.x >= 116 && r.x <= 124) {
        if (w.assign(r.id, 'digger')) schacht = true;
      }
    }
  };
}

/**
 * w4-06 v2 „Das Doppeltor" — die Stollenroute (Paket 3, Baustein B6).
 *
 * Die Musterloesung nimmt den Weg, der das Par haelt: ein einziger Rammer
 * westwaerts vom Blankeis-Boden in die Kammer. Graeber, Waechter und
 * Sprengmeister im Vorrat sind die andere Route — `planDoppeltorOben`
 * beweist sie separat.
 */
function planDoppeltor(): Plan {
  let stollen = false;
  return (w) => {
    if (stollen) return;
    const c = w.wusels.find(
      (x) => x.state === State.WALKING && x.dir === -1 && x.y > 270 && x.x >= 241 && x.x <= 246,
    );
    if (c && w.assign(c.id, 'basher')) stollen = true;
  };
}

/**
 * w4-06 v2, Route zwei — der Firn-Spalt (bomber+digger debuetiert).
 *
 * Graben zwischen Eissaeule und Deckel (nur dort meldet der Boden keinen
 * Stahl), dann den Waechter an die Ostwand der Grube stellen und ihn
 * freisprengen: Der Krater oeffnet die Erdwand zur Kammer. Kostet zwei
 * Vergaben mehr und ein Leben — dafuer ist der Weg kurz.
 */
function planDoppeltorOben(): Plan {
  let graeber: number | null = null;
  let wache: number | null = null;
  let zuendung = false;
  return (w) => {
    if (graeber === null) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.dir === 1 && x.y < 220 && x.x >= 84 && x.x <= 87,
      );
      if (c && w.assign(c.id, 'digger')) graeber = c.id;
      return;
    }
    if (wache === null) {
      const g = w.wuselById(graeber);
      // Erst wenn der Schacht auf der Stahlsohle angekommen ist, steht in
      // der Grube jemand — der Waechter gehoert an ihre Ostwand.
      const c = w.wusels.find(
        (x) =>
          x.state === State.WALKING && x.dir === 1 && x.y > 278 &&
          g !== undefined && x.x >= g.x + 2 && x.x <= g.x + 5,
      );
      if (c && w.assign(c.id, 'blocker')) wache = c.id;
      return;
    }
    if (!zuendung) {
      if (w.assign(wache, 'bomber')) zuendung = true;
    }
  };
}

/**
 * w4-07 v2 „Gegenwind" — acht echte Kletterer (Paket 3, Reparatur).
 *
 * Der Pulk laeuft die Normraster-Kaskade sicher auf den Grund; dort
 * bekommen acht Wusel die Gabe und steigen die 96er-Ostwand des
 * Tuerpfeilers hinauf. Ohne Zuweisung rettet dieses Level niemanden
 * mehr — das haelt der Rot-Test gegen den alten Attrappen-Trick fest.
 */
function planPfeiler(): Plan {
  let n = 0;
  return (w) => {
    if (n >= 8) return;
    const c = w.wusels.find(
      (x) => x.state === State.WALKING && !x.hasClimber && x.y > 300 && w.skills.climber > 0,
    );
    if (c && w.assign(c.id, 'climber')) n++;
  };
}

/**
 * w4-10 v3 „Vier Kanten" — die Doppelfront (Paket 3).
 *
 * Der Schacht faellt in den Firn-Fleck, wenn die ersten Wandwender schon
 * westwaerts unterwegs sind: Die Fallrichtung teilt den Pulk in die
 * Westfront (laeuft zur Tuer durch) und die Ostfront (sitzt auf dem
 * Ostbord). Die Bergung ist der Sohlen-Stollen westwaerts unter der
 * Terrasse — die Bauer-Kette der Blaupause ist widerlegt, siehe den
 * Levelkommentar in `welt4.ts`.
 */
function planVierKanten(): Plan {
  let schacht = false;
  let stollen = false;
  return (w) => {
    if (!schacht) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.dir === -1 && x.y < 230 && x.x >= 324 && x.x <= 332,
      );
      if (c && w.assign(c.id, 'digger')) schacht = true;
      return;
    }
    if (!stollen) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.dir === -1 && x.y > 330 && x.x >= 361 && x.x <= 366,
      );
      if (c && w.assign(c.id, 'basher')) stollen = true;
    }
  };
}

/**
 * w2-09 v2 „Adern und Deckel" — die Sichtluecke (Muster Blaupause 5).
 *
 * Die Platte ist durchgehend, nur bei x 380 liegt eine 24 Punkte breite
 * Erdluecke. Graben in der Luecke, unten nach OSTEN rammen — der alte
 * w1-05-Plan (graben bei 690) endet auf Stahl, siehe Rot-Test.
 */
function planKlamm9(): Plan {
  let digger: number | null = null;
  let bashed = false;
  return (w) => {
    if (digger === null) {
      const c = walkerNear(w, 386, 396, 1);
      if (c && w.assign(c.id, 'digger')) digger = c.id;
      return;
    }
    if (!bashed) {
      const d = w.wuselById(digger);
      if (d && d.state === State.WALKING && d.dir === 1 && d.y > 400) {
        if (w.assign(d.id, 'basher')) bashed = true;
      }
    }
  };
}

/**
 * w2-13 „Unterm Deckel" (Blaupause 1) — acht Kletterer, sonst nichts.
 *
 * Die Brueckenbauer im Vorrat sind der Koeder; die Musterloesung fasst
 * sie nicht an. Acht Kletterer ueber die Stahlwand, ueber die Krone,
 * der kurze Fall nach Osten, Tuer.
 */
function planKlamm13(): Plan {
  let n = 0;
  return (w) => {
    if (n >= 8) return;
    const c = w.wusels.find(
      (x) => x.state === State.WALKING && !x.hasClimber && x.x < 590 && w.skills.climber > 0,
    );
    if (c && w.assign(c.id, 'climber')) n++;
  };
}

/**
 * w5-04 v2 „Heisse Naht" (Blaupause 4) — die richtige der zwei Naehte.
 *
 * Naht B liegt bei x 455; hundert Punkte Vorhalt fuer die Zuendschnur
 * heisst: Zuweisung im Fenster 353..356 nach Osten. Naht A waere die
 * attraktive Falsche — unter ihr liegt sichtbar Stahl.
 */
function planSchlot4(): Plan {
  let done = false;
  return (w) => {
    if (done) return;
    const c = walkerNear(w, 353, 356, 1);
    if (c && w.assign(c.id, 'bomber')) done = true;
  };
}

/**
 * w5-08 v2 „Doppelader" (Blaupause 5) — Rostluecke, dann nach Westen.
 *
 * Graben in der Luecke bei x 520, am Schachtgrund nach WESTEN zur
 * begrabenen Tuer rammen. Der Sprengmeister im Vorrat ist Koeder — die
 * Platte hat keine Naht.
 */
function planSchlot8(): Plan {
  let digger: number | null = null;
  let bashed = false;
  return (w) => {
    if (digger === null) {
      const c = walkerNear(w, 526, 536, 1);
      if (c && w.assign(c.id, 'digger')) digger = c.id;
      return;
    }
    if (!bashed) {
      const d = w.wuselById(digger);
      if (d && d.state === State.WALKING && d.dir === -1 && d.y > 400) {
        if (w.assign(d.id, 'basher')) bashed = true;
      }
    }
  };
}

/**
 * w5-10 „Glutregen" — Schirm plus Ostwache auf der Landeinsel.
 *
 * Zehn Schirme an die Faller, und der erste Gelandete, der ostwaerts
 * weiterlaeuft, wird Waechter vor der Kante. Westlaeufer faengt die Tuer.
 */
function planSchlot10(): Plan {
  let schirme = 0;
  let wache = false;
  return (w) => {
    if (schirme < 10) {
      for (const x of w.wusels) {
        if (x.state === State.FALLING && !x.hasFloater && x.y > 240 && w.skills.floater > 0) {
          if (w.assign(x.id, 'floater')) schirme++;
        }
      }
    }
    if (!wache) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.dir === 1 && x.y > 460 && x.x >= 430 && x.x <= 466,
      );
      if (c && w.assign(c.id, 'blocker')) wache = true;
    }
  };
}

/**
 * w5-13 „Der Kessel" — drosseln, Bruecke schlagen, aufdrehen.
 *
 * Die Luke steht auf Vollgas: Ohne sofortige Drossel kippen fast alle vom
 * halbfertigen Steg in die Fanggrube (Rot-Test `planSchlot13Vollgas`).
 */
function planSchlot13(): Plan {
  let gedrosselt = false;
  let builder: number | null = null;
  let kette = false;
  let auf = false;
  return (w) => {
    if (!gedrosselt) {
      w.setReleaseRate(w.minReleaseRate);
      gedrosselt = true;
    }
    if (builder === null) {
      const c = walkerNear(w, 356, 364, 1);
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
    if (!auf) {
      const b = w.wuselById(builder);
      // Der Schlussstein liegt: Der Bauer laeuft drueben weiter.
      if (b && b.state === State.WALKING && b.x > 410) {
        w.setReleaseRate(99);
        auf = true;
      }
    }
  };
}

/** Dieselbe Bruecke ohne Drossel — der Kessel schluckt die Quote. */
function planSchlot13Vollgas(): Plan {
  let builder: number | null = null;
  let kette = false;
  return (w) => {
    if (builder === null) {
      const c = walkerNear(w, 356, 364, 1);
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

/**
 * w5-14 „Kaskade und Steg" — Bauer, Waechter, Kette, Bombe.
 *
 * Der erste Westlaeufer auf der Ost-Etage baut den Steg ueber die Luecke,
 * der naechste dahinter haelt den Pulk. Die Kette schliesst den Steg,
 * die Bombe raeumt den Waechter, die Kaskade laeuft weiter.
 */
function planSchlot14(): Plan {
  let builder: number | null = null;
  let blocker: number | null = null;
  let kette = false;
  let bombed = false;
  return (w) => {
    if (builder === null) {
      const c = w.wusels.find(
        // Dicht an der Lueckenkante (344): Die Kette spannt 48 Punkte, und
        // jeder Punkt Anlauf geht von der Spannweite ab.
        (x) => x.state === State.WALKING && x.dir === -1 && x.y > 260 && x.y < 290 &&
          x.x >= 346 && x.x <= 352,
      );
      if (c && w.assign(c.id, 'builder')) builder = c.id;
      return;
    }
    if (blocker === null) {
      // Dicht hinter dem Bauer — jeder weiter oestlich gesetzte Waechter
      // laesst Durchrutscher in die Luecke (gemessen: sieben Tote). Und
      // weit genug vom Brueckenansatz (356), dass seine Sprengung den
      // Ansatz nicht mitreisst.
      const c = w.wusels.find(
        (x) => x.id !== builder && x.state === State.WALKING && x.dir === -1 &&
          x.y > 260 && x.y < 290 && x.x >= 378 && x.x <= 392,
      );
      if (c && w.assign(c.id, 'blocker')) blocker = c.id;
    }
    if (!kette) {
      const b = w.wuselById(builder);
      if (b && b.state === State.BUILDING && b.bricks <= 2 && w.assign(b.id, 'builder')) {
        kette = true;
      }
      return;
    }
    if (!bombed && blocker !== null) {
      const b = w.wuselById(builder);
      // Der Bauer ist drueben (westlich der Luecke) — der Steg steht.
      if (b && b.state === State.WALKING && b.x < 300) {
        const bl = w.wuselById(blocker);
        if (bl && w.assign(bl.id, 'bomber')) bombed = true;
      }
    }
  };
}

/**
 * w2-08 v2 „Gegenstrom" — der 44er-Spalt verlangt die Kette.
 */
function planKlamm8(): Plan {
  let builder: number | null = null;
  let kette = false;
  let geblockt = false;
  return (w) => {
    if (builder === null) {
      // 385..391, nicht breiter: Bei Start jenseits von 391 enden die 24
      // Kettensteine (2 Punkte je Stein) vor der Westkante 340 - ein
      // Todesfoerderband statt einer Bruecke (gemessen: 19 Tote).
      const c = walkerNear(w, 381, 385, -1);
      if (c && w.assign(c.id, 'builder')) builder = c.id;
    } else if (!kette) {
      const b = w.wuselById(builder);
      if (b && b.state === State.BUILDING && b.bricks <= 2 && w.assign(b.id, 'builder')) {
        kette = true;
      }
    }
    if (!geblockt) {
      const c = walkerNear(w, 500, 540, 1);
      if (c && w.assign(c.id, 'blocker')) geblockt = true;
    }
  };
}

/**
 * w2-12 v2 — die um 20 verschobene Schlucht verlangt die Kette am
 * richtigen Ansatz; Schacht und Stollen bleiben wie gelernt.
 */
function planKlamm12(): Plan {
  let builder: number | null = null;
  let kette = false;
  let graeber: number | null = null;
  let gerammt = false;
  return (w) => {
    if (builder === null) {
      const c = walkerNear(w, 435, 443, 1);
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

/**
 * w3-05 v2 „Fallwerk" — Schirme wie gehabt, dann die Ostwache unten.
 */
function planRost5(): Plan {
  let schirme = 0;
  let wache = false;
  return (w) => {
    if (schirme < 7) {
      for (const x of w.wusels) {
        if (x.state === State.FALLING && !x.hasFloater && x.y > 240 && w.skills.floater > 0) {
          if (w.assign(x.id, 'floater')) schirme++;
        }
      }
    }
    if (!wache) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.dir === 1 && x.y > 460 && x.x >= 330 && x.x <= 366,
      );
      if (c && w.assign(c.id, 'blocker')) wache = true;
    }
  };
}

/**
 * w1-08 „Die Weiche" (Mini-B8): Zwei Schirme fuer den Ost-Schnellweg,
 * dann der Blocker als Weiche — der Pulk nimmt die Weststufen.
 */
function planWeiche(): Plan {
  let schirme = 0;
  let weiche = false;
  return (w) => {
    if (schirme < 2) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.dir === 1 && !x.hasFloater && x.x >= 380 && x.x <= 460,
      );
      if (c && w.assign(c.id, 'floater')) schirme++;
      return;
    }
    if (!weiche) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.dir === 1 && !x.hasFloater && x.x >= 380 && x.x <= 440,
      );
      if (c && w.assign(c.id, 'blocker')) weiche = true;
    }
  };
}

/**
 * w2-03 „Der Kamin" (B7-Einfuehrung): Sechs Kletterer nehmen den Kamin,
 * einer von ihnen graebt oben auf der Platte die Kammer auf.
 */
function planKamin(): Plan {
  let kletterer = 0;
  let grab = false;
  return (w) => {
    if (kletterer < 6) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && !x.hasClimber && x.x < 400 && w.skills.climber > 0,
      );
      if (c && w.assign(c.id, 'climber')) kletterer++;
      return;
    }
    if (!grab) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.y > 180 && x.y < 240 && x.x >= 560 && x.x <= 620,
      );
      if (c && w.assign(c.id, 'digger')) grab = true;
    }
  };
}

/**
 * w2-04 „Die hohle Mauer" (B4-Schleife): Ein Kletterer, zwei Grabungen —
 * aussen die Schale (der Senkenstahl stoppt die Grabung auf Bodenhoehe),
 * dann klettert dieselbe Figur den Kern hinauf und graebt ihn bis zur
 * Galerie durch. Der Pulk faellt durch die geoeffnete Mauer zur Tuer.
 */
function planMauer(): Plan {
  let kletter = false;
  let grabA = false;
  let grabB = false;
  return (w) => {
    if (!kletter) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && !x.hasClimber && x.y > 380 && x.x > 320,
      );
      if (c && w.assign(c.id, 'climber')) kletter = true;
      return;
    }
    if (!grabA) {
      const c = w.wusels.find(
        (x) =>
          x.hasClimber && x.state === State.WALKING && x.y < 340 && x.x >= 560 && x.x <= 563,
      );
      if (c && w.assign(c.id, 'digger')) grabA = true;
      return;
    }
    if (!grabB) {
      // Direkt an Schacht A anschliessen: Bei 565..570 ueberlappt das
      // Grabfenster den ersten Schacht — kein Erdpfeiler bleibt stehen.
      const c = w.wusels.find(
        (x) =>
          x.hasClimber && x.state === State.WALKING && x.y < 340 && x.x >= 565 && x.x <= 570,
      );
      if (c && w.assign(c.id, 'digger')) grabB = true;
    }
  };
}

/**
 * w2-06 „Durch zwei Boeden" (B1 im Kleinen): Zwei Grabungen im Versatz —
 * die Stahlkappen beider Etagen erzwingen den Zickzack.
 */
function planZweiBoeden(): Plan {
  let loch1 = false;
  let loch2 = false;
  return (w) => {
    if (!loch1) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.dir === -1 && x.y < 310 && x.x >= 440 && x.x <= 480,
      );
      if (c && w.assign(c.id, 'digger')) loch1 = true;
      return;
    }
    if (!loch2) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.dir === 1 && x.y > 330 && x.y < 360 && x.x >= 530 && x.x <= 560,
      );
      if (c && w.assign(c.id, 'digger')) loch2 = true;
    }
  };
}

/**
 * w2-07 „Ueber den Deckel": Sechs Kletterer — die Krone liegt auf
 * Deckelhoehe, der Rest ist Laufen und der Lichtschacht.
 */
function planUeberDenDeckel(): Plan {
  let n = 0;
  return (w) => {
    if (n >= 6) return;
    const c = w.wusels.find(
      (x) => x.state === State.WALKING && !x.hasClimber && x.x < 150 && w.skills.climber > 0,
    );
    if (c && w.assign(c.id, 'climber')) n++;
  };
}

/**
 * w2-08 „Gegenstrom" (der Wender): Der Blocker dreht den Strom vor der
 * Ostsenke, ein Gewendeter rammt westwaerts durch den Riegel.
 */
function planGegenstrom(): Plan {
  let wender = false;
  let stollen = false;
  return (w) => {
    if (!wender) {
      const c = walkerNear(w, 500, 560, 1);
      if (c && w.assign(c.id, 'blocker')) wender = true;
      return;
    }
    if (!stollen) {
      // Der Rammer greift nur mit der Wand in Schlagweite (wie planLevel2):
      // hoechstens fuenf Punkte vor der Riegel-Ostflanke.
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.dir === -1 && x.y > 400 && x.x >= 105 && x.x <= 109,
      );
      if (c && w.assign(c.id, 'basher')) stollen = true;
    }
  };
}

/**
 * w3-05 „Die Galerie" (B2): Schirme fuer den Fall, und der erste
 * Gelandete sticht die Hallenmauer durch — der Schirm arbeitet nach
 * der Landung.
 */
function planGalerie(): Plan {
  let schirme = 0;
  let stollen = false;
  return (w) => {
    if (schirme < 6) {
      for (const x of w.wusels) {
        if (x.state === State.FALLING && !x.hasFloater && x.y > 240 && w.skills.floater > 0) {
          if (w.assign(x.id, 'floater')) schirme++;
          if (schirme >= 6) break;
        }
      }
      return;
    }
    if (!stollen) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.dir === 1 && x.y > 440 && x.x >= 554 && x.x <= 558,
      );
      if (c && w.assign(c.id, 'basher')) stollen = true;
    }
  };
}

/**
 * w3-14 „Unter dem Hinweg" (B3 Haarnadel): Riegel-Rammer auf dem Hinweg,
 * dann kehrt die Haarnadel am Weltrand — die Schraege faellt WESTWAERTS.
 * Nur so steht der Schraegbagger unten vor einer Wand statt vor seiner
 * eigenen offenen Rampe (die Messung hat die Ost-Fassung widerlegt: dort
 * lief der Kandidat die Schraege einfach wieder hinauf). Derselbe
 * Schraegbagger rammt unten den Stollen westwaerts unter den Hinweg.
 */
function planHinweg(): Plan {
  let riegel = false;
  let schraege: number | null = null;
  let stollen = false;
  let aufgedreht = false;
  return (w) => {
    // Volle Rate von Anfang an: Hier stirbt niemand, und ein gedraengter
    // Pulk wartet gemeinsam vor dem Stollen statt einzeln nachzutroepfeln.
    if (!aufgedreht) {
      w.setReleaseRate(99);
      aufgedreht = true;
    }
    if (!riegel) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.dir === 1 && x.y < 310 && x.x >= 492 && x.x <= 497,
      );
      if (c && w.assign(c.id, 'basher')) riegel = true;
      return;
    }
    if (schraege === null) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.dir === -1 && x.y < 310 && x.x >= 890 && x.x <= 904,
      );
      if (c && w.assign(c.id, 'miner')) schraege = c.id;
      return;
    }
    if (!stollen) {
      const m = w.wuselById(schraege);
      // Nur ganz unten auf der Stahlsohle (Stand 760/761, y 371): Auf der
      // abfallenden Rampe hinge der Rammer nach jedem 2er-Versatz einen
      // Punkt ueber dem Boden und fiele ins Laufen zurueck — gemessen.
      if (m && m.state === State.WALKING && m.dir === -1 && m.y >= 371 && m.x <= 762) {
        if (w.assign(m.id, 'basher')) stollen = true;
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
  // Paket 1 (Level-Konzept): w1-08 und die W2-Fruehspiel-Level haben neue
  // Geometrien und neue Plaene; die Altplaene bleiben stehen, weil Welt 5
  // die alten Geometrien als Kopien weiterbenutzt und die Rot-Tests sie
  // als Gegenprobe brauchen.
  'w1-08': planWeiche,
  'w1-09': planLevel9,
  'w1-10': planLevel10,
  'w2-01': planKlamm1,
  'w2-02': planKlamm2,
  'w2-03': planKamin,
  'w2-04': planMauer,
  'w2-05': planKlamm5v2,
  'w2-06': planZweiBoeden,
  'w2-07': planUeberDenDeckel,
  'w2-08': planGegenstrom,
  'w2-09': planKlamm9,
  'w2-10': planLevel9,
  'w2-11': planKlamm11,
  'w2-12': planKlamm12,
  'w2-13': planKlamm13,
  'w3-01': planRost1,
  'w3-02': planRost2,
  'w3-03': planRost3,
  'w3-04': planRost4,
  'w3-05': planGalerie,
  'w3-06': planRost6,
  'w3-07': planRost7,
  'w3-08': planRost8,
  'w3-09': planKlamm11,
  'w3-10': planRost10,
  'w3-11': planRost11,
  'w3-12': planRost12,
  'w3-13': () => planRost13(9),
  'w3-14': planHinweg,
  // Paket 3 (Level-Konzept): w4-01/06/07/10 haben neue Geometrien und neue
  // Plaene; die Altplaene bleiben als Rot-Test-Gegenprobe stehen (planFrost1
  // dient ausserdem w5-01 weiter).
  'w4-01': planKaskade,
  'w4-02': planFrost2,
  'w4-03': planFrost3,
  'w4-04': planFrost4,
  'w4-05': planFrost5,
  'w4-06': planDoppeltor,
  'w4-07': planPfeiler,
  'w4-08': planFrost8,
  'w4-09': planFrost9,
  'w4-10': planVierKanten,
  'w4-11': planFrost11,
  'w4-12': planFrost3,
  'w4-13': planFrost13,
  'w4-14': planFrost14,
  // Welt 5 beschleunigt bewiesene Geometrien — die Quellplaene gelten
  // woertlich weiter (die Koordinaten sind identisch).
  'w5-01': planFrost1,
  'w5-02': planLevel1,
  'w5-03': planLevel3,
  'w5-04': planSchlot4,
  'w5-05': planLevel8,
  'w5-06': planKlamm11,
  'w5-07': planKlamm5,
  'w5-08': planSchlot8,
  'w5-09': planLevel6,
  'w5-10': planSchlot10,
  'w5-11': planRost6,
  'w5-12': planRost4,
  'w5-13': planSchlot13,
  'w5-14': planSchlot14,
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

  it('w4-06: auch der Firn-Spalt löst das Doppeltor — teurer, mit einem Opfer', () => {
    // Der Beweis der Routenwahl (Baustein B6): Beide Zugaenge loesen, aber
    // nur der Stollen haelt das Par. Graeber + Waechter + Freisprengung
    // kosten drei Vergaben und ein Leben — die Quote laesst genau das zu.
    const level = levelById('w4-06')!;
    const w = play(level, planDoppeltorOben());
    expect(w.phase).toBe('won');
    expect(w.saved).toBeGreaterThanOrEqual(level.needed);
    expect(w.skillsUsed).toBe(3);
    expect(w.skillsUsed).toBeGreaterThan(level.par);
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

describe('Rot-Tests — der geerbte Altplan scheitert', () => {
  // Abnahmekriterium der Design-Runde (Leitsatz 3): Ein umgebautes Level
  // ist erst dann entklont, wenn die Musterloesung seines Vorbilds
  // nachweislich nicht mehr traegt.
  it('w2-09: der w1-05-Plan endet auf der durchgehenden Platte', () => {
    erwarteRot('w2-09', planLevel5);
  });
  it('w5-08: der w1-05-Plan endet auf der durchgehenden Platte', () => {
    erwarteRot('w5-08', planLevel5);
  });
  it('w5-04: der w1-07-Plan sprengt, wo keine Naht mehr ist', () => {
    erwarteRot('w5-04', planLevel7);
  });
  it('w2-05: ohne Rate-Zuege verpendelt der Pulk die Uhr', () => {
    erwarteRot('w2-05', planKlamm5);
  });
  // Paket 3 (Level-Konzept): Die W4-Umbauten gegen ihre Altplaene.
  it('w4-01: die Kaskade traegt nicht mehr von selbst', () => {
    // Der Altplan war null Zuweisungen — genau der Befund der Inventur
    // („der Pulk laeuft die Kaskade ohne eine einzige Zuweisung hinunter").
    erwarteRot('w4-01', planFrost1);
  });
  it('w4-06: der Schirmpflicht-Plan graebt neben die Kammer', () => {
    // planFrost6 war ein erklaerter Klon von planFrost2 — sein Schacht bei
    // x230..250 endet an der Kante oder auf der Stahlsohle, nie in der
    // Kammer, und seine Schirme finden keinen langen Fall mehr.
    erwarteRot('w4-06', planFrost6);
  });
  it('w4-07: der alte Trick ohne echten Kletterer muss scheitern', () => {
    // Die Rot-Pflicht aus dem Konzept (Paket 3): Die alte Fassung rettete
    // 12/12 mit null Zuweisungen, weil die Stufenkante ueber dem
    // Pfeilerkopf lag. Jetzt verliert, wer nichts zuweist — und auch der
    // alte Kletterplan greift ins Leere, denn sein Fenster (y > 400) liegt
    // unter dem neuen Grund.
    erwarteRot('w4-07', planFrost1);
    erwarteRot('w4-07', planFrost7);
  });
  it('w4-10: beide Ein-Front-Altplaene lassen die Ostfront sitzen', () => {
    // Die Rot-Pflicht aus dem Konzept (Paket 3): Der Ostwache-Plan (v2)
    // graebt zu frueh und findet keinen Waechter im Vorrat — fast der
    // ganze Pulk faellt ostwaerts und bleibt auf dem Ostbord; der alte
    // West-Schacht-Plan (v1) graebt ins Blankeis.
    erwarteRot('w4-10', planFrost10);
    erwarteRot('w4-10', planFrost10Alt);
  });
  it('w5-10: Schirme ohne Ostwache — die Kante holt die Quote', () => {
    erwarteRot('w5-10', planLevel4);
  });
  it('w5-13: dieselbe Bruecke ohne Drossel — der Kessel schluckt die Quote', () => {
    erwarteRot('w5-13', planSchlot13Vollgas);
  });
  it('w5-14: der geerbte Pruefungsplan greift ins Leere', () => {
    erwarteRot('w5-14', planLevel10);
  });
  it('w2-06: der alte Naht-Plan hat keine Bombe mehr und keine Naht', () => {
    erwarteRot('w2-06', planLevel7);
    erwarteRot('w2-06', planKlamm6);
  });
  it('w2-08: ohne Wender und Stollen bleibt der Brueckenplan stumm', () => {
    erwarteRot('w2-08', planLevel8);
    erwarteRot('w2-08', planKlamm8);
  });
  it('w2-12: die verschobene Schlucht laesst die alte Bruecke zu kurz', () => {
    erwarteRot('w2-12', planLevel10);
  });
  it('w3-05: die Schirmregen-Altplaene kennen den Stollen nicht', () => {
    // Paket 2: Die Galerie ersetzt den dritten Schirmregen. Beide
    // Altplaene bringen die Gelandeten hinunter — und keinen durch die
    // Mauer: der eine hat keinen Waechter mehr zu setzen, der andere
    // wartet vergebens auf einen Blocker im Vorrat.
    erwarteRot('w3-05', planLevel4);
    erwarteRot('w3-05', planRost5);
  });
  it('w3-14: kein einziger Altplan aus PLANS loest die Haarnadel', () => {
    // Die Abnahme des Konzepts woertlich: Rot-Test gegen ALLE Altplaene.
    // Ein neues Level ist erst dann ein neues Raetsel, wenn keine der 65
    // bestehenden Musterloesungen es aus Versehen mitloest.
    const level = levelById('w3-14')!;
    for (const [id, fabrik] of Object.entries(PLANS)) {
      if (id === 'w3-14') continue;
      const w = play(level, fabrik(level));
      expect(w.phase, `w3-14: Altplan von ${id} muesste scheitern`).toBe('lost');
    }
  });
  // Paket 1 (Level-Konzept): Die Fruehspiel-Umbauten gegen ihre Altplaene.
  it('w1-08: der alte Bruecken-Plan findet weder Schlucht noch Bauer', () => {
    erwarteRot('w1-08', planLevel8);
  });
  it('w2-03: Klettern allein endet auf der Platte — die Tuer liegt darunter', () => {
    erwarteRot('w2-03', planKlamm3);
  });
  it('w2-04: der geerbte Brueckenplan hat keine Bauer und keine Kante', () => {
    erwarteRot('w2-04', planLevel3);
  });
  it('w2-07: der alte Schirmregen hat keine Schirme mehr', () => {
    erwarteRot('w2-07', planLevel4);
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
      // Sechs Sekunden nach der Landung: Das prueft den Falltuerfall und
      // den Landeplatz. Nicht mehr zehn — seit der Weiche (w1-08) gibt es
      // Level, deren ferne Kanten absichtlich toedlich sind; die erreicht
      // ein Laeufer erst nach dieser Frist, und sie zu pruefen ist Sache
      // der Musterloesung, nicht dieses Spawntests.
      for (let i = 0; i < 60 * 6; i++) w.tick();
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
