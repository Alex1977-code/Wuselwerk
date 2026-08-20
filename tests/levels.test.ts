import { describe, expect, it } from 'vitest';
import { LEVELS, levelById } from '../src/levels';
import { createWorld } from '../src/levels/createWorld';
import { World } from '../src/core/world';
import { State } from '../src/core/types';
import type { LevelDef } from '../src/levels/types';
import { W1_PLAENE } from './welt1-plaene';

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

/**
 * w1-04 „Der lange Fall" — die volle Musterloesung (Paket 5).
 *
 * `planLevel4` schirmte nur bis zur Quote und stand damit auf Marge 0 —
 * ein Plan-Artefakt, kein Levelfehler. Die Musterloesung gibt alle
 * sechs Schirme des Pars; der Altplan bleibt fuer die Rot-Tests stehen.
 */
function planLangerFall(): Plan {
  let given = 0;
  return (w) => {
    if (given >= 6) return;
    for (const x of w.wusels) {
      if (x.state === State.FALLING && !x.hasFloater && x.y > 240 && w.skills.floater > 0) {
        if (w.assign(x.id, 'floater')) given++;
        if (given >= 6) return;
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
/**
 * w2-01 „Abstieg" — der Riegel auf der unteren Sohle.
 *
 * Das Level trug einmal `par: 0` und wurde durch Nichtstun gewonnen; der
 * Spieltest hat das beim Namen genannt. Jetzt sperrt ein sechsunddreissig
 * Punkte hoher Riegel den Weg zur Tuer, und ein Rammer oeffnet ihn.
 *
 * Angesetzt wird dicht davor: Ein Rammer, dem beim Auftrag keine Wand in
 * Reichweite steht (BASH_LOOK 5), wird nicht zum Rammer, sondern zum
 * VORGEMERKTEN Rammer und faengt an der naechstbesten Wand an — das hat in
 * Welt 1 zweimal die falsche Wand geoeffnet.
 */
function planKlamm1(): Plan {
  let done = false;
  return (w) => {
    if (done) return;
    const c = walkerNear(w, 514, 519, 1);
    if (c && w.assign(c.id, 'basher')) done = true;
  };
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

// --- Musterlösungen der Schlot-Ersatzbauten (Paket 4) ----------------------

/**
 * w5-01 v2 „Die Gabel im Krater" — B5 + B8 (Paket 4).
 *
 * Der erste Laeufer rammt den Riegel und oeffnet den sicheren Ost-Ast;
 * der erste Wandwender wird Waechter und haelt alle von der toedlichen
 * 96er-Westkante fern. Beide Aeste muenden vor der Tuer.
 */
function planGabel(): Plan {
  let riegel = false;
  let wache = false;
  return (w) => {
    if (!riegel) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.dir === 1 && x.y > 240 && x.y < 260 &&
          x.x >= 384 && x.x <= 391,
      );
      if (c && w.assign(c.id, 'basher')) riegel = true;
      return;
    }
    if (!wache) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.dir === -1 && x.y > 240 && x.y < 260 &&
          x.x >= 330 && x.x <= 370,
      );
      if (c && w.assign(c.id, 'blocker')) wache = true;
    }
  };
}

/**
 * w5-02 v2 „Unter der Kruste" — B1-Etagen + B3-Schraege (Paket 4).
 *
 * Etage 1: die Miner-Schraege taucht am Firn-Ostrand unter die
 * Stahlkruste und bricht als 1:2-Rampe durch den Block. Etage 2: der
 * Schacht am Westrand, wo die Kruste endet. miner+digger — das Paar,
 * das die Kombinationsmatrix dem Turm zuschreibt.
 */
function planKruste(): Plan {
  let schraege = false;
  let schacht = false;
  return (w) => {
    if (!schraege) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.dir === -1 && x.y < 220 && x.x >= 455 && x.x <= 470,
      );
      if (c && w.assign(c.id, 'miner')) schraege = true;
      return;
    }
    if (!schacht) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.dir === -1 && x.y > 330 && x.y < 355 &&
          x.x >= 30 && x.x <= 60,
      );
      if (c && w.assign(c.id, 'digger')) schacht = true;
    }
  };
}

/**
 * w5-03 v2 „Galerie in der Glut" — der Durchatmer: B2 gespiegelt.
 *
 * Die Familienloesung woertlich: jedem Laeufer noch auf dem Balkon den
 * Schirm geben (der Vorrat traegt einen fuer jeden), unten oeffnet ein
 * Rammer die Mauer. Niemand kann sterben.
 */
function planGlutGalerie(): Plan {
  let tor = false;
  let stollen = false;
  return (w) => {
    // Erst das Tor in der Lippe (Westkante des Balkons), dann die Schirme.
    if (!tor) {
      const b = w.wusels.find(
        (x) => x.state === State.WALKING && x.dir === -1 && x.y < 172,
      );
      if (b && w.assign(b.id, 'basher')) tor = true;
      return;
    }
    const c = w.wusels.find(
      (x) => x.state === State.WALKING && !x.hasFloater && x.y < 200 && w.skills.floater > 0,
    );
    if (c && w.assign(c.id, 'floater')) return;
    if (!stollen) {
      const b = w.wusels.find(
        (x) => x.state === State.WALKING && x.dir === -1 && x.y > 440 && x.x >= 165 && x.x <= 190,
      );
      if (b && w.assign(b.id, 'basher')) stollen = true;
    }
  };
}

/**
 * w5-05 v2 „Schacht und Stollen" — B6 in der Urfassung (Paket 4).
 *
 * Die Par-Route: Ostkaskade hinab, dann ein einziger Rammer westwaerts
 * durch den langen Stollen in die Kammer. Der Schirmschacht ist die
 * teure zweite Route — `planSchachtOben` beweist sie separat.
 */
function planSchachtStollen(): Plan {
  let stollen = false;
  return (w) => {
    if (stollen) return;
    const c = w.wusels.find(
      (x) => x.state === State.WALKING && x.dir === -1 && x.y > 340 && x.y < 365 &&
        x.x >= 416 && x.x <= 440,
    );
    if (c && w.assign(c.id, 'basher')) stollen = true;
  };
}

/**
 * w5-05 v2, Route zwei — der Schirmschacht („Schacht kostet Schirm").
 *
 * Jeder Laeufer bekommt den Schirm schon auf der Hochflaeche, dann
 * graebt einer den 168er-Schacht hinter der Falltuer: Der Vorraum auf
 * der Stahlsohle faengt jeden Schacht aus dem Firn-Streifen.
 */
function planSchachtOben(): Plan {
  let schacht = false;
  return (w) => {
    const c = w.wusels.find(
      (x) => x.state === State.WALKING && !x.hasFloater && x.y < 220 && w.skills.floater > 0,
    );
    if (c && w.assign(c.id, 'floater')) return;
    if (!schacht) {
      const g = w.wusels.find(
        (x) => x.state === State.WALKING && x.dir === 1 && x.y < 220 && x.x >= 70 && x.x <= 100,
      );
      if (g && w.assign(g.id, 'digger')) schacht = true;
    }
  };
}

/**
 * w5-06 v2 „Der Deckelpfad" — der Durchatmer: B7-Deckel (w2-07-Mechanik).
 *
 * Acht Kletterer die Wand hinauf, ueber die Krone auf den Deckel, durch
 * die Luecke in die Grotte. Wer nicht klettert, wartet sicher im Vorhof.
 */
function planDeckelpfad(): Plan {
  let n = 0;
  return (w) => {
    if (n >= 8) return;
    const c = w.wusels.find(
      (x) => x.state === State.WALKING && !x.hasClimber && x.x > 586 && w.skills.climber > 0,
    );
    if (c && w.assign(c.id, 'climber')) n++;
  };
}

/**
 * w5-07 v2 „Schleife und Steg" — Tripel 1: climber+digger+builder.
 *
 * Sofort drosseln, die Zweierkette ueber den Spalt, danach die bewiesene
 * w2-04-Schleife (Kletterer, Schalen- und Kerngrabung — Fenster
 * woertlich uebernommen). Wer vor fertigem Steg in den Spalt-Pfercht
 * fiel, wird per Kletterer geborgen; nach dem Steg dreht die Rate auf.
 */
function planSchleifeSteg(): Plan {
  let gedrosselt = false;
  let bauer: number | null = null;
  let ketten = 0;
  let steg = false;
  let kletterer = false;
  let grabA = false;
  let grabB = false;
  let bergungen = 0;
  return (w) => {
    if (!gedrosselt) {
      w.setReleaseRate(1);
      gedrosselt = true;
    }
    if (bauer === null) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.dir === 1 && x.y < 350 && x.x >= 226 && x.x <= 234,
      );
      if (c && w.assign(c.id, 'builder')) bauer = c.id;
      return;
    }
    const b = w.wuselById(bauer);
    if (ketten < 2 && b && b.state === State.BUILDING && b.bricks <= 2) {
      if (w.assign(b.id, 'builder')) ketten++;
      return;
    }
    if (!steg && ketten >= 2 && b && b.state === State.WALKING && b.x > 300) {
      w.setReleaseRate(99);
      steg = true;
    }
    if (!kletterer) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.y > 380 && x.x > 320 && !x.hasClimber,
      );
      if (c && w.assign(c.id, 'climber')) kletterer = true;
      return;
    }
    if (!grabA) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.hasClimber && x.y < 340 && x.x >= 560 && x.x <= 563,
      );
      if (c && w.assign(c.id, 'digger')) grabA = true;
      return;
    }
    if (!grabB) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.hasClimber && x.y < 340 && x.x >= 565 && x.x <= 570,
      );
      if (c && w.assign(c.id, 'digger')) grabB = true;
      return;
    }
    if (bergungen < 2) {
      // Pfercht-Grund liegt auf 380 (Fuss 379) — die Bergung greift dort.
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && !x.hasClimber && x.y > 360 && x.x >= 244 && x.x <= 276,
      );
      if (c && w.assign(c.id, 'climber')) bergungen++;
    }
  };
}

/**
 * w5-09 v2 „Kaminzug" — climber+bomber: der gesprengte Podestdeckel.
 *
 * Acht Kletterer in den Kamin; auf dem Podest wird einer zum Waechter
 * oestlich des Blankeisrands gestellt und freigesprengt — der Krater
 * reisst den Erddeckel auf, alle fallen zur Tuer.
 */
function planKaminSprengung(): Plan {
  let n = 0;
  let anker: number | null = null;
  let zuendung = false;
  return (w) => {
    if (n < 8) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && !x.hasClimber && x.x < 200 && w.skills.climber > 0,
      );
      if (c && w.assign(c.id, 'climber')) n++;
      return;
    }
    if (anker === null) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.y > 200 && x.y < 220 && x.x >= 255 && x.x <= 275,
      );
      if (c && w.assign(c.id, 'blocker')) anker = c.id;
      return;
    }
    if (!zuendung) {
      if (w.assign(anker, 'bomber')) zuendung = true;
    }
  };
}

/**
 * w5-11 v2 „Unter der Galerie" — Tripel 2: floater+miner+basher.
 *
 * Ein Schirm fuer jeden noch auf dem Balkon, die Ostschraege ab der
 * Haldenmitte, und am Tiefstpunkt auf der Stahlsohle der Stollen
 * ostwaerts in die Kammer (das w3-14-Fenster, gespiegelt).
 */
function planUnterDerGalerie(): Plan {
  let tor = false;
  let schraege = false;
  let stollen = false;
  return (w) => {
    if (!tor) {
      const b = w.wusels.find(
        (x) => x.state === State.WALKING && x.dir === 1 && x.y < 152,
      );
      if (b && w.assign(b.id, 'basher')) tor = true;
      return;
    }
    const c = w.wusels.find(
      (x) => x.state === State.WALKING && !x.hasFloater && x.y < 200 && w.skills.floater > 0,
    );
    if (c && w.assign(c.id, 'floater')) return;
    if (!schraege) {
      const m = w.wusels.find(
        (x) => x.state === State.WALKING && x.dir === 1 && x.y > 340 && x.y < 380 &&
          x.x >= 390 && x.x <= 410,
      );
      if (m && w.assign(m.id, 'miner')) schraege = true;
      return;
    }
    if (!stollen) {
      // Nur mit Fuss AUF der Stahlsohle (y 439, Stand 549..553): Einen
      // Punkt hoeher zuendet die Vormerkung ueber dem noch gefraesten
      // Boden, der Rammer faellt den einen Punkt, und der Auftrag ist
      // verbraucht — die w3-14-Messung, hier ostwaerts wiederholt.
      const m = w.wusels.find(
        (x) => x.state === State.WALKING && x.dir === 1 && x.y >= 439 && x.x >= 545,
      );
      if (m && w.assign(m.id, 'basher')) stollen = true;
    }
  };
}

/**
 * w5-12 v2 „Zwei Haende" — vom w3-04-Zwilling getrennt (Paket 4).
 *
 * Der Westspalt misst jetzt 44: erst die DREIERkette traegt hinueber
 * (die geerbte Zweierkette kippt in den Pfercht, K1-Rot-Test). Sonst
 * der bewiesene Ablauf: Waechter vor dem Spalt, zweite Bruecke ueber
 * den Ostspalt, Freisprengung nach dem Schlussstein.
 */
function planZweiHaende(): Plan {
  let gedrosselt = false;
  let bauer: number | null = null;
  let ketten1 = 0;
  let blocker: number | null = null;
  let bruecke2 = false;
  let kette2 = false;
  let bombed = false;
  return (w) => {
    if (!gedrosselt) {
      w.setReleaseRate(30);
      gedrosselt = true;
    }
    if (bombed) w.setReleaseRate(99);
    if (bauer === null) {
      // Ansatz ab 350: Von 340 endete die Dreierkette bei 410 — zwei vor
      // dem Gegenufer (412), und der Bauer kippte selbst in den Pfercht.
      const c = walkerNear(w, 350, 360, 1);
      if (c && w.assign(c.id, 'builder')) bauer = c.id;
      return;
    }
    const b = w.wuselById(bauer);
    if (ketten1 < 2 && b && b.state === State.BUILDING && !bruecke2 && b.bricks <= 2) {
      if (w.assign(b.id, 'builder')) ketten1++;
      return;
    }
    if (blocker === null) {
      const c = w.wusels.find(
        (x) => x.id !== bauer && x.state === State.WALKING && x.dir === 1 && x.x >= 296 && x.x <= 322,
      );
      if (c && w.assign(c.id, 'blocker')) blocker = c.id;
      return;
    }
    if (!bruecke2 && ketten1 >= 2 && b && b.state === State.WALKING && b.dir === 1 && b.x >= 636 && b.x <= 648) {
      if (w.assign(b.id, 'builder')) bruecke2 = true;
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

/**
 * w5-15 v2 „Pruefung im Schlot" — die Luken-Route (Paket 4, Par).
 *
 * Neun Kletterer ueber Grube und Berg auf den Westfluegel; dort oeffnet
 * ein Graeber die Firn-Luke im Blech, und der Schacht endet 72 tiefer
 * auf der Stahl-Tuersohle — mitten in der Tuer.
 */
function planPruefungB(): Plan {
  let n = 0;
  let luke = false;
  return (w) => {
    if (n < 9) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && !x.hasClimber && w.skills.climber > 0,
      );
      if (c && w.assign(c.id, 'climber')) n++;
      return;
    }
    if (!luke) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.y < 370 && x.x >= 193 && x.x <= 207,
      );
      if (c && w.assign(c.id, 'digger')) luke = true;
    }
  };
}

/**
 * w5-15 v2, Route zwei — Naht und Riegel (die alte Pruefung).
 *
 * Zuendung mit hundert Punkten Vorhalt westwaerts auf die Naht, dann
 * der Stollen ostwaerts durch den Riegel. Kostet eine Vergabe mehr als
 * die Luke und den Sprengmeister das Leben.
 */
function planPruefungA(): Plan {
  let n = 0;
  let bombed = false;
  let gerammt = false;
  return (w) => {
    if (n < 9) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && !x.hasClimber && w.skills.climber > 0,
      );
      if (c && w.assign(c.id, 'climber')) n++;
      return;
    }
    if (!bombed) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.dir === -1 && x.y < 370 && x.x >= 216 && x.x <= 222,
      );
      if (c && w.assign(c.id, 'bomber')) bombed = true;
      return;
    }
    if (!gerammt) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.dir === 1 && x.y > 400 && x.x >= 175 && x.x <= 179,
      );
      if (c && w.assign(c.id, 'basher')) gerammt = true;
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
  let tor = false;
  let schirme = 0;
  let wache = false;
  return (w) => {
    if (!tor) {
      const b = w.wusels.find(
        (x) => x.state === State.WALKING && x.dir === 1 && x.y < 172,
      );
      if (b && w.assign(b.id, 'basher')) tor = true;
      return;
    }
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
  let tor = false;
  let schirme = 0;
  let stollen = false;
  return (w) => {
    // Das Tor in der Balkonlippe (Spieltest-Runde): Bis es steht, pendelt
    // der Pulk sicher. Die Zuweisung darf frueh fallen — ohne Wand in
    // Reichweite wird sie vorgemerkt und greift an der Lippe von selbst.
    if (!tor) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.dir === 1 && x.y < 172,
      );
      if (c && w.assign(c.id, 'basher')) tor = true;
      return;
    }
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

// --- Musterlösungen des Sonnenhangs (Welt 6) -------------------------------
//
// Die Gruenwelt am Ende des Spiels: Jedes Level verbindet mindestens drei
// Hoehenebenen, und die Baggerschraege traegt als einzige Verbindung in
// beide Richtungen.

/** w6-01: Die Treppe faellt von selbst — nur die letzte Lippe muss fallen. */
function planVierWiesen(): Plan {
  let tor = false;
  return (w) => {
    if (tor) return;
    const c = w.wusels.find(
      (x) => x.state === State.WALKING && x.dir === 1 && x.y > 288 && x.y < 300,
    );
    if (c && w.assign(c.id, 'basher')) tor = true;
  };
}

/** w6-02: Drei Graeber, je einer im Erdfenster seiner Etage. */
function planVersetzterSchacht(): Plan {
  let a = false;
  let b = false;
  let c = false;
  return (w) => {
    if (!a) {
      const k = w.wusels.find(
        (x) => x.state === State.WALKING && x.y < 205 && x.x >= 100 && x.x <= 150,
      );
      if (k && w.assign(k.id, 'digger')) a = true;
      return;
    }
    if (!b) {
      const k = w.wusels.find(
        (x) => x.state === State.WALKING && x.y > 260 && x.y < 280 && x.x >= 334 && x.x <= 384,
      );
      if (k && w.assign(k.id, 'digger')) b = true;
      return;
    }
    if (!c) {
      const k = w.wusels.find(
        (x) => x.state === State.WALKING && x.y > 332 && x.y < 352 && x.x >= 564 && x.x <= 614,
      );
      if (k && w.assign(k.id, 'digger')) c = true;
    }
  };
}


/**
 * w6-03: Zwei Schraegen den Hang hinab — die zweite oestlich des Findlings.
 *
 * In der Messung nimmt DIESELBE Figur beide Auftraege: Sie faellt als erste
 * aus der Stirn von T1 und steht als erste am zweiten Ansatz. Der Plan sucht
 * trotzdem nach Ort und Blickrichtung statt nach der Kennung — das ist der
 * Griff, den ein Spieler tut.
 */
function planZuTief(): Plan {
  let obenGesetzt = false;
  let untenGesetzt = false;
  return (w) => {
    if (!obenGesetzt) {
      // Ansatzfenster ausgemessen: x136 bis x144 tragen alle. Weiter westlich
      // laeuft die Schraege in das Findlingsband auf T2-Hoehe und endet in
      // einer Sackgasse, weiter oestlich bricht sie zu frueh aus der Stirn.
      const c = walkerNear(w, 138, 142, 1);
      if (c && c.y < 185 && w.assign(c.id, 'miner')) obenGesetzt = true;
      return;
    }
    if (!untenGesetzt) {
      // Auf T2 erst oestlich von x392: Davor liegt der Findling, und der
      // Bagger dreht sichtbar ab, ohne einen Bildpunkt zu raeumen. Gemessen
      // tragen x394 bis x406.
      const c = w.wusels.find(
        (x) =>
          x.state === State.WALKING &&
          x.dir === 1 &&
          x.y > 270 &&
          x.y < 280 &&
          x.x >= 398 &&
          x.x <= 402,
      );
      if (c && w.assign(c.id, 'miner')) untenGesetzt = true;
    }
  };
}

/**
 * w6-04 „Die dritte Schräge": drei lose E96-Bloecke, drei Ansaetze.
 *
 * Der Unterschied zum Vorlevel steht in der Luft zwischen den Bloecken: Am
 * Blockfuss verliert der Bagger den Boden und faellt die 24 heil auf den
 * naechsten — also muss dieselbe Hand dort neu ansetzen, zweimal.
 */
function planDritteSchraege(): Plan {
  let miner: number | null = null;
  let stufen = 0;
  return (w) => {
    if (miner === null) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.dir === 1 && x.y < 185 && x.x >= 110 && x.x <= 160,
      );
      if (c && w.assign(c.id, 'miner')) miner = c.id;
      return;
    }
    if (stufen < 2) {
      const m = w.wuselById(miner);
      // Sobald er auf dem naechsten Block steht, setzt dieselbe Hand nach.
      // Nur solange er noch auf einem Block steht — auf der Sohle wuerde
      // dieselbe Hand den Boden aufschneiden und den Pulk hinterherziehen.
      if (m && m.state === State.WALKING && m.dir === 1 && m.y < 460) {
        if (w.assign(m.id, 'miner')) stufen++;
      }
    }
  };
}


/**
 * w6-05 „Die Rampe von oben" — der eine Aufstieg der Abwaertswelt.
 *
 * Ein Kletterer und zwei Schraegen, alle drei an derselben Figur. Der Kern
 * steht in Zug 2: Ein Bagger graebt, wohin er schaut, also muss der Spaeher
 * erst bis an den Weltrand laufen und dort umkehren — die Westschraege gibt
 * es nur auf dem Rueckweg. Unten wendet ihn die Findlingssohle, er steigt
 * seine eigene Rampe zurueck hinauf, und oben schneidet dieselbe Hand die
 * Ostschraege in die Tuerkammer.
 */
function planRampeVonOben(): Plan {
  let spaeher: number | null = null;
  let west = false;
  let ost = false;
  return (w) => {
    if (spaeher === null) {
      // Noch weit vor dem Erdkeil: Er hat den ganzen Anlauf, um an die
      // Flanke zu kommen, und der Rest des Pulks pendelt derweil sicher.
      const c = walkerNear(w, 60, 100, 1);
      if (c && c.y > 340 && w.assign(c.id, 'climber')) spaeher = c.id;
      return;
    }
    const k = w.wuselById(spaeher);
    // Nur oben auf der Krone (y 299). Am Hangfuss steht dieselbe Figur auf
    // der Findlingssohle — dort verpufft jeder Bagger sofort am Stahl.
    if (!k || k.state !== State.WALKING || k.y > 310) return;
    if (!west) {
      // Blick nach Westen, also nach der Kehre am Weltrand: Diese Schraege
      // holt den Pulk herauf. Gemessenes Fenster x256 bis x326.
      if (k.dir === -1 && k.x >= 285 && k.x <= 295 && w.assign(k.id, 'miner')) west = true;
      return;
    }
    if (!ost) {
      // Zurueck aus der eigenen Rampe, Blick wieder nach Osten: Jetzt die
      // Schraege in die Tuerkammer. Gemessenes Fenster x286 bis x328.
      if (k.dir === 1 && k.x >= 300 && k.x <= 310 && w.assign(k.id, 'miner')) ost = true;
    }
  };
}

/**
 * w6-06 „Der Sonnenhof" — die Westmauer, das Par.
 *
 * Ein einziger Zug. Das Fenster x115..119 ist Vorschrift und nicht
 * Zieluebung: Ein Rammer ohne Wand in Reichweite (BASH_LOOK 5) wird zum
 * VORGEMERKTEN Rammer. Gemessen traegt hier auch die Vormerkung von weit
 * westlich — auf der Hofsohle steht keine zweite Wand, an der sie falsch
 * anfangen koennte —, aber ein Plan, der sich darauf verlaesst, prueft die
 * Geometrie nicht mehr.
 *
 * Die Hoehenschranke y > 350 trennt die Hofsohle vom Zwischenband der
 * Aussentreppe: Dort laufen dieselben Spalten, nur zweiundsiebzig
 * Bildpunkte hoeher.
 */
function planSonnenhof(): Plan {
  let tor = false;
  return (w) => {
    if (tor) return;
    const c = w.wusels.find(
      (x) => x.state === State.WALKING && x.dir === 1 && x.y > 350 && x.x >= 115 && x.x <= 119,
    );
    if (c && w.assign(c.id, 'basher')) tor = true;
  };
}

/**
 * w6-06, Route zwei — der Schacht durchs Erddach (die Kuer).
 *
 * Der B6-Gegenbeweis wie bei w4-06 und w5-05: Auch das Dach loest das
 * Level, dreissig Sekunden schneller und zwoelf Vergaben teurer. Der
 * Graeber faellt aus seinem eigenen Schacht 96, jeder Nachlaeufer 120 —
 * darum bekommt JEDER einen Schirm, der Graeber eingeschlossen. Das
 * Dachfenster ist breit (gemessen loest jede Grabstelle von x184 bis x355);
 * ueber dem Mauerkopf meldet der Graeber Stein und das Level ist verloren,
 * ohne dass jemand stirbt.
 */
function planSonnenhofDach(): Plan {
  let schacht = false;
  return (w) => {
    if (!schacht) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.dir === 1 && x.y < 245 && x.x >= 240 && x.x <= 250,
      );
      if (c && w.assign(c.id, 'digger')) schacht = true;
      return;
    }
    if (w.skills.floater <= 0) return;
    const f = w.wusels.find((x) => !x.hasFloater && w.canAssignTo(x, 'floater'));
    if (f) w.assign(f.id, 'floater');
  };
}

/** w6-07: Ein Schacht in die Kammer, dann je ein Kletterer an der Ostwand. */
function planBrunnen(): Plan {
  let graeber = false;
  return (w) => {
    // Der erste Laeufer der Mittelterrasse sinkt den Brunnen. Die Stelle ist
    // frei waehlbar — gemessen traegt jede zwischen x304 und x551; nur auf
    // der Findlingsbank im Westen trifft sein Fenster auf Stein.
    if (!graeber) {
      const c = walkerNear(w, 512, 520, 1);
      if (c && w.assign(c.id, 'digger')) graeber = true;
      return;
    }
    // Und dann jedem in der Kammer seinen Kletterer: Die 48 an der Tuerbank
    // nimmt keiner ohne. `y > 340` heisst „steht auf der Kammersohle" — oben
    // auf der Terrasse waere derselbe Griff verschenkt und der Kletterer
    // kippte am Kragstein.
    const k = w.wusels.find(
      (x) => x.state === State.WALKING && !x.hasClimber && x.y > 340 && x.y < 352,
    );
    if (k) w.assign(k.id, 'climber');
  };
}

/**
 * w6-08 „Unter der Hecke" — die Haarnadel als Platzierungsraetsel.
 *
 * Drei Zuege in fester Reihenfolge, und nur der zweite ist schwer. Zug 1
 * oeffnet die Hecke (gemessenes Fenster: JEDE Stelle des Hinwegs von x100
 * bis x503 traegt — der Rammer laeuft als Vormerkung bis an die Lippe).
 * Zug 3 ist ebenso grosszuegig: 86 Bildpunkte Vorhalle (x460 bis x545), und
 * die Vormerkung traegt den Rammer bis an ihre Westwand.
 *
 * Zug 2 IST das Level. Der Bagger muss nach WESTEN schauen (er graebt,
 * wohin er schaut) und weit genug im Osten stehen, damit seine Bahn unter
 * dem Findlingsfuss der Grubensohle durchkommt. Gemessenes Fenster x600 bis
 * x692, keine Luecke; westlich davon dreht er am Stein ab, oestlich davon
 * kommt er neben der Vorhalle in einer blinden Tasche auf. Der Plan greift
 * bei x620..x640 — mitten im Fenster, mit zwanzig Bildpunkten Luft nach
 * beiden Seiten.
 *
 * Die Hoehenschranke 360 < y < 380 trennt die Grubensohle vom Hinweg: Dort
 * laufen dieselben Spalten, nur zweiundsiebzig Bildpunkte hoeher.
 */
function planUnterDerHecke(): Plan {
  let hecke = false;
  let bagger: number | null = null;
  let stollen = false;
  return (w) => {
    if (!hecke) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.dir === 1 && x.y < 310 && x.x >= 496 && x.x <= 502,
      );
      if (c && w.assign(c.id, 'basher')) hecke = true;
      return;
    }
    if (bagger === null) {
      // Nur auf dem Rueckweg vom Ostrand: Ein Bagger, der nach Osten
      // schaut, schneidet seine Schraege aus der Welt heraus.
      const c = w.wusels.find(
        (x) =>
          x.state === State.WALKING &&
          x.dir === -1 &&
          x.y > 360 &&
          x.y < 380 &&
          x.x >= 620 &&
          x.x <= 640,
      );
      if (c && w.assign(c.id, 'miner')) bagger = c.id;
      return;
    }
    if (!stollen) {
      // Erst unten auf dem Findlingsgrund der Vorhalle (y 443): Auf der
      // Rampe haengt der Rammer nach jedem Zwei-Punkt-Versatz einen Punkt
      // ueber dem Boden und faellt ins Laufen zurueck (die w3-14-Lehre).
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.dir === -1 && x.y >= 435 && x.y <= 443 && x.x <= 545,
      );
      if (c && w.assign(c.id, 'basher')) stollen = true;
    }
  };
}

/**
 * w6-09 „Die Doppelmauer" — die Zweierkette und der obere Stollen.
 *
 * Drei Zuege an zwei Figuren. Das Ansatzfenster x425..x429 ist die Mitte des
 * gemessenen Fensters x419..x434 (sechzehn Bildpunkte, im Level als
 * Findlingsschwelle in die Sohle eingelassen); `y === 335` heisst „steht auf
 * der Sohle" und trennt den Pulkraum von der Startterrasse, auf der dieselben
 * Spalten zweiundsiebzig Bildpunkte hoeher laufen.
 *
 * Nachgesetzt wird bei `bricks === 0`, also nahtlos im letzten Bauzustand:
 * gemessen tragen null bis drei Reststufen, ab vier ist die Rampe vier
 * Bildpunkte zu kurz und der Laeufer faellt am Ende in die Sohle statt auf
 * die Bank. Nicht die Hoehe entscheidet, sondern die Spannweite.
 *
 * Der Rammer geht an die erste Figur, die auf der Bankkrone (y311) nach Osten
 * laeuft — gemessen traegt jede Stelle der Krone von x472 bis x519. Steht die
 * Mauer noch nicht in BASH_LOOK-Reichweite, wird der Auftrag zur Vormerkung
 * und greift von selbst am Mauerfuss; auf der Bank steht nichts, woran sie
 * frueher anschlagen koennte.
 */
function planDoppelmauer(): Plan {
  let bauer: number | null = null;
  let kette = false;
  let stollen = false;
  return (w) => {
    if (bauer === null) {
      const c = walkerNear(w, 425, 429, 1);
      if (c && c.y === 335 && w.assign(c.id, 'builder')) bauer = c.id;
      return;
    }
    if (!kette) {
      const b = w.wuselById(bauer);
      if (b && b.state === State.BUILDING && b.bricks === 0 && w.assign(b.id, 'builder')) {
        kette = true;
      }
      return;
    }
    if (!stollen) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.dir === 1 && x.y === 311 && x.x >= 472 && x.x < 520,
      );
      if (c && w.assign(c.id, 'basher')) stollen = true;
    }
  };
}

/**
 * w6-10 „Der Waechter im Schacht" — vier Griffe, und der erste ist der Punkt
 * des Levels.
 *
 * 1. DER WAECHTER IN DEN SUMPF (x400, y317). Der Brunnen ist eine Einbahn:
 *    Jeder faellt von der Stufe x399 die sechs Bildpunkte in den Sumpf und
 *    kommt nicht zurueck (6 > MAX_STEP 5). Vor dem ersten Griff steht deshalb
 *    der ganze Pulk dort — gemessen 2154 von 2400 Ticks gegen 42 Ticks auf
 *    der Stufe. Der Plan wartet auf die Sumpfsohle, weil das der Ort ist, den
 *    ein Spieler sieht.
 * 2. DER GRAEBER AUF DIE STUFE (x399, y311). Ab jetzt geht das von selbst:
 *    Der Waechter wendet jeden Nachlaeufer schon auf der Stufe (|dy| 6 <
 *    WUSEL_H 12), die Stufe ist damit Dauerstandplatz, und das 9-px-Fenster
 *    x395..x403 raeumt die Sumpfsohle im siebten Schlag. Der Waechter faellt
 *    30 auf die Mittelterrasse und blockt dort weiter — `stepFalling` setzt
 *    beim Aufkommen `w.isBlocker ? BLOCKING : WALKING`.
 * 3. DER ZWEITE GRAEBER im Erdfenster der Mittelterrasse. Der Pulk faellt
 *    durch denselben Schacht 48 nach, landet WESTLICH des Waechters und wird
 *    von ihm nach Westen gewendet — sonst laeuft er in die Ostwanne. Die
 *    Stelle ist frei waehlbar: gemessen traegt jede zwischen x282 und x350.
 * 4. DER RAMMER auf der Tuersohle, westwaerts vor der Erdmauer. Auch das ist
 *    weit: gemessen traegt jeder Ansatz von x246 bis x414, weil ein Rammer
 *    ohne Wand in BASH_LOOK 5 zur Vormerkung wird und von selbst anfaengt,
 *    wenn die Mauer kommt.
 *
 * Gemessen: 13 von 14 gerettet, kein Toter, vier Zuege, letzte Rettung 40,1 s.
 */
function planWaechterImSchacht(): Plan {
  let wache: number | null = null;
  let graeber: number | null = null;
  let graeber2 = false;
  let rammer = false;
  return (w) => {
    if (wache === null) {
      const c = w.wusels.find((x) => x.state === State.WALKING && x.y === 317 && x.x === 400);
      if (c && w.assign(c.id, 'blocker')) wache = c.id;
      return;
    }
    if (graeber === null) {
      const c = w.wusels.find(
        (x) => x.id !== wache && x.state === State.WALKING && x.y === 311 && x.x === 399,
      );
      if (c && w.assign(c.id, 'digger')) graeber = c.id;
      return;
    }
    if (!graeber2) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.y === 347 && x.x >= 318 && x.x <= 322,
      );
      if (c && w.assign(c.id, 'digger')) graeber2 = true;
      return;
    }
    if (!rammer) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.y === 395 && x.dir === -1 && x.x >= 246 && x.x <= 252,
      );
      if (c && w.assign(c.id, 'basher')) rammer = true;
    }
  };
}


/**
 * Rot-Test zu w6-10: Ohne den Waechter strandet der ganze Pulk in der
 * Ostwanne — zwei Graeber allein loesen dieses Level nicht.
 *
 * Gemessen: 14 von 14 in der Wanne, null Tote, verloren. Genau so soll ein
 * vergessener Waechter sich anfuehlen: Man sieht sie stehen, man kommt nicht
 * mehr an sie heran, und gestorben ist niemand.
 */
function planW610OhneWaechter(): Plan {
  let graeber = false;
  let graeber2 = false;
  return (w) => {
    if (!graeber) {
      const c = w.wusels.find((x) => x.state === State.WALKING && x.y === 317 && x.x === 400);
      if (c && w.assign(c.id, 'digger')) graeber = true;
      return;
    }
    if (!graeber2) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.y === 347 && x.x >= 318 && x.x <= 322,
      );
      if (c && w.assign(c.id, 'digger')) graeber2 = true;
    }
  };
}

/**
 * w6-11 „Hangbruch" — der Riegel ist die Zielhilfe der Sprengung.
 *
 * Drei Zuege, und der erste ist keine Sperre, sondern ein Zielkreuz: Ein
 * Waechter steht still, und ein Sprengmeister zuendet dort, wo er steht — die
 * Zuendung am Waechter braucht deshalb keinen Vorhalt. Der Krater raeumt nur
 * Erde (`clearPixel` prueft `isDiggable`), also bleibt die Findlingsplatte
 * stehen und die vier Bildpunkte schmale Naht wird zum Loch. Gemessenes
 * Fenster: x333 bis x350 — achtzehn Bildpunkte, denn schon EINE durchgehende
 * Spalte laesst den ganzen Pulk hindurch.
 *
 * Der dritte Zug sitzt an der Findlingskante der Erdtasche: oestlich von x474
 * liegt die Erde offen, westlich davon dreht der Bagger sichtbar am Stein ab.
 * Gemessen tragen x474 bis x538.
 */
function planHangbruch(): Plan {
  let riegel: number | null = null;
  let gezuendet = false;
  let bagger = false;
  return (w) => {
    // Zug 1: Der Waechter auf die Naht. Sie liegt bei x340 bis x343; der
    // Riegel darf zwoelf Bildpunkte daneben stehen.
    if (riegel === null) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.dir === 1 && x.y === 299 && x.x >= 342 && x.x <= 344,
      );
      if (c && w.assign(c.id, 'blocker')) riegel = c.id;
      return;
    }
    // Zug 2: Derselbe Wusel bekommt den Zuender. Ein paar Ticks Abstand, weil
    // zwei Auftraege im selben Tick einander loeschen — der Waechter haelt
    // waehrend der fuenf Sekunden Zuendschnur den Pulk vor dem Loch.
    if (!gezuendet) {
      const b = w.wuselById(riegel);
      if (b && b.state === State.BLOCKING && b.timer > 6 && w.assign(b.id, 'bomber')) {
        gezuendet = true;
      }
      return;
    }
    // Zug 3: Die Schraege aus der Erdtasche, oestlich der Findlingskante.
    // `y === 347` heisst „steht auf der Taschensohle" — oben auf der Platte
    // verpufft jeder Bagger sofort am Stahl.
    if (!bagger) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.dir === 1 && x.y === 347 && x.x >= 474 && x.x <= 478,
      );
      if (c && w.assign(c.id, 'miner')) bagger = true;
    }
  };
}

/**
 * w6-11, die Kuer — der Vorhaltschuss von der Westterrasse.
 *
 * Zwei Zuege statt drei: Wer den Zuender im Laufen vergibt, spart den
 * Waechter. Die Zuendschnur brennt fuenf Sekunden, ein Laeufer macht darin
 * hundert Bildpunkte, dazwischen liegt der Sturz von der Terrasse — gemessen
 * traegt das Fenster x250 bis x259, zehn Bildpunkte am Rand der Kante. Der
 * Weg loest schneller (55,0 s gegen 60,3 s) und unterbietet das Par.
 */
function planHangbruchVorhalt(): Plan {
  let ab = false;
  let bagger = false;
  return (w) => {
    if (!ab) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.dir === 1 && x.y === 251 && x.x >= 252 && x.x <= 256,
      );
      if (c && w.assign(c.id, 'bomber')) ab = true;
      return;
    }
    if (!bagger) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.dir === 1 && x.y === 347 && x.x >= 474 && x.x <= 478,
      );
      if (c && w.assign(c.id, 'miner')) bagger = true;
    }
  };
}

/**
 * w6-12 „Das Storchennest" — fuenf Lippen, fuenf Rammer, und die Kante
 * wechselt auf jeder Etage die Seite.
 *
 * Der Plan braucht kein Ansatzfenster, und das ist der Befund des Levels:
 * Ein Rammer ohne Wand in Reichweite wird zur VORMERKUNG und schlaegt zu,
 * sobald die Wand kommt (`World.applySkill`) — gemessen traegt sie ihn von
 * jedem Punkt des Stockwerks bis an seine Lippe. Das Fenster je Etage ist
 * darum das ganze begehbare Band (228 Bildpunkte, 115 von 115 Proben im
 * Zwei-Punkte-Raster). Gesucht ist nicht der Ort, sondern die RICHTUNG: Wer
 * zur Findlingsflanke schaut statt zur Lippe, verliert seinen Rammer an
 * Stein — und nichts weiter.
 */
function planStorchennest(): Plan {
  // Fusshoehe und Rammrichtung je Etage. Die Lippen wechseln die Kante
  // (Ost, West, Ost, West, Ost), also wechselt auch die Blickrichtung.
  const etagen: { y: number; dir: -1 | 1 }[] = [
    { y: 151, dir: 1 },
    { y: 199, dir: -1 },
    { y: 247, dir: 1 },
    { y: 295, dir: -1 },
    { y: 343, dir: 1 },
  ];
  let i = 0;
  return (w) => {
    if (i >= etagen.length) return;
    const e = etagen[i];
    const c = w.wusels.find((x) => x.state === State.WALKING && x.y === e.y && x.dir === e.dir);
    if (c && w.assign(c.id, 'basher')) i++;
  };
}

/**
 * Rot-Probe zu w6-12: Fuenf Rammer auf einen Schlag auf der obersten Etage.
 *
 * Der naheliegende Griff eines Spielers, der das Muster erkannt hat — und er
 * traegt nicht. Die Vormerkung ueberlebt zwar den Sturz (`stepFalling` setzt
 * nur den Zustand, nicht `vormerk`), aber nicht die Landung: Jede Landung
 * liegt zwanzig Bildpunkte neben der Findlingsflanke, der Blick zeigt
 * dorthin, und an Stein ist die Vormerkung verbraucht. Gemessen faellt
 * genau EINE Lippe, fuenf Rammer sind weg, und es stirbt niemand.
 */
function planStorchennestVolley(): Plan {
  let n = 0;
  return (w) => {
    if (n >= 5) return;
    const c = w.wusels.find(
      (x) => x.state === State.WALKING && x.y === 151 && x.dir === 1 && !x.vormerk,
    );
    if (c && w.assign(c.id, 'basher')) n++;
  };
}

/**
 * w6-13 „Vier Etagen" — vier Griffe, und jeder Abstand nennt seinen eigenen.
 *
 * 1. DER SCHACHT DURCH DIE GRASSCHULTER (y179). Achtundvierzig hinab, also
 *    der Graeber. Gemessen traegt die ganze Schulter (x4 bis x338; x0..x3
 *    fallen aus, weil der Weltrand im Neun-Punkte-Fenster wie Stahl zaehlt).
 *    Der Plan setzt ihn zwischen Falltuer und Ansatzfenster, denn nur dort
 *    landet der Pulk WESTLICH der Schraege und laeuft ostwaerts in sie
 *    hinein: gemessenes Schnellfenster x38 bis x194, alle vierzehn in 76 bis
 *    82 s. Oestlich davon kostet dieselbe Loesung eine volle T2-Runde —
 *    13 von 14 und 105,8 s, ohne einen Toten.
 * 2. DIE SCHRAEGE IM ERDFENSTER VON T2 (y227, ostwaerts). Sechsundneunzig
 *    hinab, also der Bagger — und nur er: Ein Graeber sinkt hier
 *    zweiundsechzig auf die Findlingsbank und nimmt den ganzen Pulk mit in
 *    den Schacht (0 gerettet, 0 tot). Gemessenes Ansatzfenster x179 bis
 *    x241; `dir === 1` ist keine Zierde, sondern die Bedingung — ein Bagger
 *    graebt, wohin er schaut, und eine Westschraege kostet den Lauf.
 * 3. DER SCHACHT DURCH DIE GALERIESOHLE (y323). Wieder achtundvierzig,
 *    wieder der Graeber. Gemessenes Fenster x404 bis x515; westlich und
 *    oestlich davon liegt der Findlingsdeckel, und die Tuerkammer bleibt so
 *    von oben unerreichbar.
 * 4. DER STOLLEN DURCH DIE ERDMAUER (y371, ostwaerts). Gemessen traegt die
 *    ganze Sohle, x344 bis x555: Steht die Mauer noch nicht in BASH_LOOK 5,
 *    wird der Auftrag zur Vormerkung und greift von selbst am Mauerfuss.
 *
 * Gemessen: 14 von 14 gerettet, kein Toter, vier Zuege, letzte Rettung
 * 76,3 s bei einer Uhr von 107.
 */
function planVierEtagen(): Plan {
  let schacht1 = false;
  let schraege = false;
  let schacht2 = false;
  let stollen = false;
  return (w) => {
    if (!schacht1) {
      const c = walkerNear(w, 120, 123, 1);
      if (c && c.y === 179 && w.assign(c.id, 'digger')) schacht1 = true;
      return;
    }
    if (!schraege) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.dir === 1 && x.y === 227 && x.x >= 188 && x.x <= 191,
      );
      if (c && w.assign(c.id, 'miner')) schraege = true;
      return;
    }
    if (!schacht2) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.dir === 1 && x.y === 323 && x.x >= 408 && x.x <= 411,
      );
      if (c && w.assign(c.id, 'digger')) schacht2 = true;
      return;
    }
    if (!stollen) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.dir === 1 && x.y === 371 && x.x >= 460 && x.x <= 463,
      );
      if (c && w.assign(c.id, 'basher')) stollen = true;
    }
  };
}

/**
 * Rot-Test zu w6-13: Der Graeber nimmt die Sechsundneunzig nicht.
 *
 * Zweimal derselbe Griff, der auf T1 richtig ist: ein Schacht durch den
 * Boden. Auf T2 sinkt er zweiundsechzig auf die Findlingsbank, der Pulk
 * sackt ihm Bildpunkt fuer Bildpunkt nach, und am Ende steht er vollzaehlig
 * im Neun-Punkte-Schacht. Gemessen: 0 gerettet, 0 tot, tiefster Einzelfall
 * 60 bei einer Sturzgrenze von 78. Genau so soll sich das falsche Werkzeug
 * anfuehlen — man sieht sie stehen, man kommt nicht mehr an sie heran, und
 * gestorben ist niemand.
 */
function planW613NurGraeber(): Plan {
  let schacht1 = false;
  let schacht2 = false;
  return (w) => {
    if (!schacht1) {
      const c = walkerNear(w, 120, 123, 1);
      if (c && c.y === 179 && w.assign(c.id, 'digger')) schacht1 = true;
      return;
    }
    if (!schacht2) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.y === 227 && x.x >= 200 && x.x <= 203,
      );
      if (c && w.assign(c.id, 'digger')) schacht2 = true;
    }
  };
}

/**
 * w6-14 „Die Schleife am Hang" — die Rampe von oben unter Platzierungsdruck.
 *
 * Drei Zuege an zwei Figuren, und der mittlere ist der ganze Level. Anders als
 * in w6-05 muss der Spaeher hier nicht am Weltrand gewendet werden: Die
 * Geometrie dreht ihn selbst. Er faellt hinter der Krone E48 auf die
 * Ostterrasse, der Kragstein ueber der Erdrippe kippt ihn dort zurueck, an der
 * Mauerostflanke klettert er von allein wieder herauf — und steht dann als
 * Einziger mit Blick nach WESTEN auf der Krone. Gefragt ist nicht die Kehre,
 * sondern die STELLE: Nur zwischen den beiden Findlingsrippen ist der
 * Mauerkoerper frei, gemessenes Ansatzfenster x554 bis x618. Der Umlauf dauert
 * 31,7 s und wiederholt sich, solange die Uhr laeuft.
 */
function planSchleifeAmHang(): Plan {
  let spaeher: number | null = null;
  let rampe = false;
  let tor = false;
  return (w) => {
    if (spaeher === null) {
      // Der Kletterer braucht kein Fenster: Gemessen traegt jede Stelle der
      // Sohle von x20 bis x374 — der Keil fuehrt ihn ohnehin an die Flanke.
      const c = walkerNear(w, 100, 170, 1);
      if (c && c.y > 380 && w.assign(c.id, 'climber')) spaeher = c.id;
      return;
    }
    if (!rampe) {
      // Nur oben auf der Krone (y251) und nur auf dem RUECKWEG. Wer den Bagger
      // auf dem Hinweg vergibt, schneidet die Schraege nach Osten; westlich
      // von x524 meldet sie sofort Stein (Kronendeckel), oestlich davon kostet
      // sie den Lauf. Gemessenes Fenster x554 bis x618, hier mittig genommen.
      const k = w.wuselById(spaeher);
      if (
        k &&
        k.state === State.WALKING &&
        k.dir === -1 &&
        k.y < 260 &&
        k.x >= 580 &&
        k.x <= 590 &&
        w.assign(k.id, 'miner')
      ) {
        rampe = true;
      }
      return;
    }
    if (!tor) {
      // Zuletzt, und nur zuletzt: Wer die Erdrippe oeffnet, bevor die Rampe
      // steht, verliert den Spaeher an die Tuer. Nach Osten, auf der
      // Ostterrasse — gemessenes Fenster x622 bis x662, nach Westen loest
      // keine Stelle (Findlingsflanke).
      const c = w.wusels.find(
        (x) =>
          x.id !== spaeher &&
          x.state === State.WALKING &&
          x.dir === 1 &&
          x.y > 290 &&
          x.y < 305 &&
          x.x >= 630 &&
          x.x <= 655,
      );
      if (c && w.assign(c.id, 'basher')) tor = true;
    }
  };
}

// In PLANS eintragen:
//   'w6-14': planSchleifeAmHang,

// Und als Rot-Test (Abnahme der Entklonung gegen w6-05):
//   it('w6-14: der Plan der Rampe von oben findet hier keinen Ansatz', () => {
//     erwarteRot('w6-14', planRampeVonOben);
//   });

/**
 * w6-16 „Zwei Haende am Hang" — die Musterloesung: beide Fronten zugleich.
 *
 * Vier Griffe, und zwischen ihnen wird nicht gewartet:
 *
 * 1. RIEGEL auf die Kanzel (x368..392, ostwaerts), sobald zehn Figuren
 *    draussen sind. Er ist der erste Griff und nicht Zubehoer: Jede Figur
 *    startet mit dir +1, ohne ihn geht NIEMAND nach Westen und die
 *    Doppelfront ist nur behauptet (gemessen: ohne Riegel traegt die
 *    Ostschraege allein alle fuenfzehn). Er teilt den Pulk dauerhaft in neun
 *    oestliche und fuenf westliche Figuren und bleibt selbst stehen.
 * 2. BAGGER auf die erste WESTWAERTS laufende Figur im Ostarm (x624..640,
 *    y275). Ein Bagger graebt, wohin er schaut — nach Osten gaebe es keine
 *    Schraege. 68 Schritte, 13,6 s; die Muendung faellt bei x499 auf y343 in
 *    die Tuerkammer.
 * 3. GRAEBER im Westarm (x84..100). Der Schacht sinkt 54 Zeilen (6,3 s) und
 *    endet auf der Findlingsbank der Galerie; die Nachruecker fallen 72.
 * 4. RAMMER in der Galerie, ostwaerts (y347). Er darf sofort nach der Landung
 *    vergeben werden: Ohne Wand in BASH_LOOK 5 wird er zur Vormerkung und
 *    faengt von selbst an der Stirn bei x300 an (44 px, 3,3 s).
 *
 * Gemessen: 14 von 15, 0 Tote, 4 Zuege, Quote 52,0 s, letzte Rettung 54,6 s.
 */
function planZweiArme(): Plan {
  return planZweiArmeIntern(false);
}

/**
 * Derselbe Bau, seriell bedient — er MUSS verlieren.
 *
 * Einziger Unterschied zur Musterloesung: Die Ostfront wird erst angesetzt,
 * wenn die Westfront ihre erste Figur geliefert hat. Das ist die
 * grosszuegigste Lesart von „erst die eine, dann die andere" — und schon sie
 * scheitert. Gemessen an der Uhr von 76 s: 8 von 15, verloren, kein Toter.
 * Mit offener Uhr faellt die Quote (11) erst bei 85,3 s statt 52,0 s, die
 * letzte Rettung bei 88,5 s statt 54,6 s. Die umgekehrte Reihenfolge
 * (Westfront zuletzt) kommt auf 78,0 s und verliert ebenso.
 */
function planZweiArmeSeriell(): Plan {
  return planZweiArmeIntern(true);
}

function planZweiArmeIntern(seriell: boolean): Plan {
  let riegel: number | null = null;
  let bagger = false;
  let graeber = false;
  let rammer = false;
  return (w) => {
    if (riegel === null) {
      // Erst wenn genug Figuren oestlich der Kanzel stehen — sonst verhungert
      // die Ostfront an zu wenig Kundschaft.
      if (w.released < 10) return;
      const c = w.wusels.find(
        (x) =>
          x.state === State.WALKING &&
          x.dir === 1 &&
          x.y > 270 &&
          x.y < 280 &&
          x.x >= 368 &&
          x.x <= 392,
      );
      if (c && w.assign(c.id, 'blocker')) riegel = c.id;
      return;
    }
    if (!bagger && !(seriell && w.saved < 1)) {
      const c = w.wusels.find(
        (x) =>
          x.state === State.WALKING &&
          x.dir === -1 &&
          x.y > 270 &&
          x.y < 280 &&
          x.x >= 624 &&
          x.x <= 640,
      );
      if (c && w.assign(c.id, 'miner')) bagger = true;
    }
    if (!graeber) {
      const c = w.wusels.find(
        (x) => x.state === State.WALKING && x.y > 270 && x.y < 280 && x.x >= 84 && x.x <= 100,
      );
      if (c && w.assign(c.id, 'digger')) graeber = true;
    }
    if (graeber && !rammer) {
      const c = w.wusels.find(
        (x) =>
          x.state === State.WALKING &&
          x.dir === 1 &&
          x.y > 340 &&
          x.y < 350 &&
          x.x >= 76 &&
          x.x <= 292,
      );
      if (c && w.assign(c.id, 'basher')) rammer = true;
    }
  };
}

/**
 * w6-17 „Prüfung am Sonnenhang" — fünf Ebenen, fünf Griffe, achtzehn Vergaben.
 *
 * Vier Zuege plus vierzehn Schirme, und nur der zweite ist schwer. Der Spaeher
 * bekommt den Kletterer noch auf der Startsohle; er steigt die Mauerwestflanke
 * hinauf (der Erdkeil ist seine Leiter), laeuft die Krone ostwaerts, faellt
 * hinter ihr E48 auf die Mittelterrasse, wird dort vom Kragstein ueber der
 * Lippe zurueckgekippt und klettert die Mauerostflanke von selbst wieder
 * herauf — und steht dann als Einziger mit Blick nach WESTEN auf der Krone,
 * genau an ihrem Ostende. Dieser Umlauf IST das Zeitfenster des Levels; wer
 * ihn verpasst, bekommt ihn wieder, denn der Keil faengt den Spaeher am
 * Kronenwestende heil ab (gemessen 62 px) und die Schleife laeuft von vorn.
 *
 * Zug 2 ist die STELLE: gemessenes Ansatzfenster x424 bis x482, lueckenlos,
 * hier mittig genommen. Westlich davon meldet der Kronendeckel Stein
 * (Werkzeug weg, Umlauf weg, Lauf gerettet); ostwaerts gebaggert trennt die
 * Schraege die Krone und kostet den Lauf, aber keine Figur.
 *
 * Zug 3 und 4 sind grosszuegig und nur richtungsgebunden: Die Lippe loest
 * ostwaerts von jeder Stelle der Terrasse (x484..x626), westwaerts von keiner;
 * der Stollen loest westwaerts von x462 bis x667, ostwaerts von keiner. Beide
 * Male traegt die Vormerkung den Rammer bis an seine Wand. Die Reihenfolge ist
 * Pflicht: Wer die Lippe vor der Rampe oeffnet, verliert den Spaeher an den
 * Schacht (gemessen: 1 gerettet, verloren).
 *
 * Die Schirme laufen nebenher und gehen an JEDE Figur, auch an den Spaeher —
 * der Schacht misst sechsundneunzig und ist der einzige Toeter des Levels.
 */
function planPruefungAmSonnenhang(): Plan {
  let spaeher: number | null = null;
  let rampe = false;
  let lippe = false;
  let stollen = false;
  return (w) => {
    // Ein Schirm fuer jeden, sobald einer frei ist. Der Zustand ist egal —
    // `canAssign` laesst den Schirm auch im Fall zu, und je frueher er sitzt,
    // desto weniger haengt am Takt der Lippe.
    if (w.skills.floater > 0) {
      const f = w.wusels.find((x) => !x.hasFloater && w.canAssignTo(x, 'floater'));
      if (f) w.assign(f.id, 'floater');
    }
    if (spaeher === null) {
      // Gleich oestlich der Falltuer, noch auf der Sohle (y199). Die Stelle
      // ist frei waehlbar — der Keil fuehrt jeden Kletterer an die Flanke.
      const c = walkerNear(w, 250, 290, 1);
      if (c && c.y > 190 && w.assign(c.id, 'climber')) spaeher = c.id;
      return;
    }
    if (!rampe) {
      // Nur oben auf der Krone (y103) und nur auf dem RUECKWEG. Ein Bagger
      // graebt, wohin er schaut: Auf dem Hinweg schneidet er die Schraege in
      // die falsche Richtung und trennt die Krone.
      const k = w.wuselById(spaeher);
      if (
        k &&
        k.state === State.WALKING &&
        k.dir === -1 &&
        k.y < 110 &&
        k.x >= 450 &&
        k.x <= 465 &&
        w.assign(k.id, 'miner')
      ) {
        rampe = true;
      }
      return;
    }
    if (!lippe) {
      // Erst wenn die Rampe steht. Ostwaerts auf der Mittelterrasse (y151);
      // die Vormerkung traegt den Rammer von jeder Stelle bis an die Lippe.
      const c = w.wusels.find(
        (x) =>
          x.state === State.WALKING &&
          x.dir === 1 &&
          x.y > 145 &&
          x.y < 155 &&
          x.x >= 580 &&
          x.x <= 610,
      );
      if (c && w.assign(c.id, 'basher')) lippe = true;
      return;
    }
    if (!stollen) {
      // Unten auf dem Findlingsgrund der Halle (y247), nach WESTEN — also nach
      // der Kehre am Findlingspflock. Die Vormerkung traegt ihn bis an die
      // Hallenwestwand, und von dort laeuft der Stollen zweihundert
      // Bildpunkte zurueck unter den Hinweg in die Tuerkammer.
      const c = w.wusels.find(
        (x) =>
          x.state === State.WALKING &&
          x.dir === -1 &&
          x.y >= 241 &&
          x.y <= 247 &&
          x.x >= 500 &&
          x.x <= 640,
      );
      if (c && w.assign(c.id, 'basher')) stollen = true;
    }
  };
}

// In PLANS eintragen:
//   'w6-17': planPruefungAmSonnenhang,

/**
 * w6-15 „Das Rondell" — jedem seinen Kletterer, dann ein Rammer am Kern.
 *
 * Der Panzer auf den Aussenflanken laesst keinen Stollen hinein; der Weg
 * fuehrt ueber die Krone, und ueber eine Krone kommt nur, wer klettert —
 * also jeder einzeln. Drinnen genuegt EIN Rammer fuer alle: Er oeffnet den
 * Kern nach Osten, und die Tuerkammer dahinter ist vorgeschnitten.
 */
function planRondell(): Plan {
  let rammer = false;
  return (w) => {
    // Draussen: wer noch keinen Kletterer hat, bekommt einen.
    const k = w.wusels.find((x) => x.state === State.WALKING && !x.hasClimber && x.x < 240);
    if (k) {
      w.assign(k.id, 'climber');
      return;
    }
    // Drinnen: einer schlaegt den Kern auf. Die Hoehenschranke y > 330
    // trennt die Sohle von der Krone — oben liefe derselbe Griff ins Leere.
    if (!rammer) {
      const c = w.wusels.find(
        (x) =>
          x.state === State.WALKING && x.dir === 1 && x.x >= 380 && x.x <= 398 && x.y > 330,
      );
      if (c && w.assign(c.id, 'basher')) rammer = true;
    }
  };
}

/**
 * Rot-Test zu w6-15: Der Panzer haelt, was er verspricht.
 *
 * Drei Rammer an die Aussenflanke — mehr liegen gar nicht im Vorrat. Der
 * Findling nimmt jeden nach null Bildpunkten an, der Pulk steht danach
 * unverletzt davor, und im Level ist kein Werkzeug mehr. Genau so soll sich
 * eine Mauer anfuehlen, die keine Tuer hat.
 */
function planRondellVonAussen(): Plan {
  let n = 0;
  return (w) => {
    if (n >= 3) return;
    const c = w.wusels.find(
      (x) => x.state === State.WALKING && x.dir === 1 && x.x >= 200 && x.x <= 236,
    );
    if (c && w.assign(c.id, 'basher')) n++;
  };
}


// --- Musterloesung der Wipfelweide (Welt 7) --------------------------------

/**
 * w7-01 "Der hohle Stamm" — je ein Kletterer, sobald die Figur ueber die
 * Vordachkante auf die Waldsohle gefallen ist.
 *
 * Die Gabe faellt bewusst erst UNTEN (y > 460) und nur nach Osten (dir 1,
 * ab x 500): So bekommt sie eine Figur, die schon zum Stamm hin laeuft, und
 * keine, die oben auf dem Kernholz unterwegs ist oder unten nach Westen
 * unter das Vordach zieht. Eine zweite Zuweisung braucht das Level nicht —
 * ohne Kletterer kommt hier niemand die 264 Bildpunkte des Stammes hinauf,
 * mit ihm kommt jeder: hochziehen auf die Krone, ostwaerts, 48 frei auf den
 * Ostast, dann in die Tuer.
 */
function planHohlerStamm(): Plan {
  return (w) => {
    for (const x of w.wusels) {
      if (x.hasClimber || x.state !== State.WALKING) continue;
      if (x.dir === 1 && x.x >= 500 && x.y > 460) w.assign(x.id, 'climber');
    }
  };
}

/**
 * w7-02 „Der Zwillingsstamm" — zehn Figuren, zehn Griffe.
 *
 * Erst der Waechter am Fuss des falschen Stammes, dann je ein Kletterer auf
 * jede weitere Figur. Der Waechter kostet die erste Figur — ein Blocker wird
 * nie gerettet — und kauft dafuer, dass danach jeder Tipp richtig faellt: Wer
 * westwaerts laeuft, wird vor dem Kernholzhut gewendet. Solange er noch nicht
 * steht, wird nur getippt, wer ohnehin nach Osten schaut; das ist die
 * Lesefrage des Levels in einer Zeile Plan.
 *
 * Gemessen: 9 von 10 gerettet, kein Toter, 10 Zuege, letzte Rettung 45,6 s.
 */
function planW702(): Plan {
  let kandidat: number | null = null;
  let blocker: number | null = null;
  return (w) => {
    // Die erste Figur ist der Waechter. Sie laeuft einmal an den Oststamm,
    // prallt ab und wird auf dem Rueckweg am falschen Stamm gesetzt.
    if (kandidat === null && w.wusels.length > 0) kandidat = w.wusels[0].id;
    if (blocker === null && kandidat !== null) {
      const c = w.wuselById(kandidat);
      if (c && c.state === State.WALKING && c.x >= 348 && c.x <= 358) {
        if (w.assign(c.id, 'blocker')) blocker = c.id;
      }
    }
    for (const x of w.wusels) {
      if (x.state !== State.WALKING || x.hasClimber || x.isBlocker) continue;
      if (x.id === kandidat && blocker === null) continue;
      // Vor dem Waechter zaehlt die Laufrichtung, danach nicht mehr.
      if (blocker === null && !(x.dir === 1 && x.x >= 445)) continue;
      w.assign(x.id, 'climber');
    }
  };
}

  it('w7-02 „Der Zwillingsstamm" — ein Waechter, neun Kletterer', () => {
    const level = levelById('w7-02')!;
    const w = play(level, planW702());
    expect(w.phase).toBe('won');
    // Neun von zehn: Der Waechter bleibt am falschen Stamm stehen, und das
    // ist der Preis dafuer, dass danach kein Tipp mehr danebengehen kann.
    expect(w.saved).toBe(9);
    expect(w.saved - level.needed).toBeGreaterThanOrEqual(2);
    expect(w.dead).toBe(0);
    expect(w.skillsUsed).toBeLessThanOrEqual(level.par);
  });

  it('w7-02 — Nichtstun verliert, ohne jemanden zu toeten', () => {
    const level = levelById('w7-02')!;
    const w = play(level, () => {});
    expect(w.phase).toBe('lost');
    expect(w.saved).toBe(0);
    expect(w.dead).toBe(0);
  });

const PLANS: Record<string, (level: LevelDef) => Plan> = {
  // Welt 1 kommt geschlossen aus `welt1-plaene.ts`. Die alten W1-Plaene
  // (planLevel3, planLangerFall, planLevel5 …) bleiben in dieser Datei
  // stehen und werden weiter gebraucht: Welt 5 benutzt die alten Geometrien
  // als Kopien, und die Rot-Tests weiter unten beweisen mit ihnen, dass die
  // neuen Level wirklich neue Level sind.
  ...W1_PLAENE,
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
  // Paket 4 (Level-Konzept): Die W5-Klone weichen Zwei-Bausteine-
  // Ersatzbauten; die Quellplaene bleiben als Rot-Test-Gegenprobe (K1).
  'w5-01': planGabel,
  'w5-02': planKruste,
  'w5-03': planGlutGalerie,
  'w5-04': planSchlot4,
  'w5-05': planSchachtStollen,
  'w5-06': planDeckelpfad,
  'w5-07': planSchleifeSteg,
  'w5-08': planSchlot8,
  'w5-09': planKaminSprengung,
  'w5-10': planSchlot10,
  'w5-11': planUnterDerGalerie,
  'w5-12': planZweiHaende,
  'w5-13': planSchlot13,
  'w5-14': planSchlot14,
  'w5-15': planPruefungB,
  // Welt 6 — der Sonnenhang (Hundert-Level-Ausbau).
  'w6-01': planVierWiesen,
  'w6-02': planVersetzterSchacht,
  'w6-03': planZuTief,
  'w6-04': planDritteSchraege,
  'w6-05': planRampeVonOben,
  'w6-06': planSonnenhof,
  'w6-07': planBrunnen,
  'w6-08': planUnterDerHecke,
  'w6-09': planDoppelmauer,
  'w6-10': planWaechterImSchacht,
  'w6-11': planHangbruch,
  'w6-12': planStorchennest,
  'w6-13': planVierEtagen,
  'w6-14': planSchleifeAmHang,
  'w6-15': planRondell,
  'w6-16': planZweiArme,
  'w6-17': planPruefungAmSonnenhang,
  // Welt 7 — die Wipfelweide (Hundert-Level-Ausbau).
  'w7-01': planHohlerStamm,
  'w7-02': planW702,
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

  it('w5-05: auch der Schirmschacht löst Schacht und Stollen — teurer, ohne Opfer', () => {
    // Die B6-Urfassung des Konzepts: „Schacht kostet Schirm." Ein Schirm
    // fuer jeden plus der Graeber — dreizehn Vergaben gegen das Par von
    // eins, aber niemand stirbt.
    const level = levelById('w5-05')!;
    const w = play(level, planSchachtOben());
    expect(w.phase).toBe('won');
    expect(w.saved).toBeGreaterThanOrEqual(level.needed);
    expect(w.skillsUsed).toBeGreaterThan(level.par);
  });

  it('w5-15: auch Naht und Riegel lösen die Prüfung — die alte Route trägt weiter', () => {
    // Der B6-Zweitzugang des Finales: Die Luke haelt das Par, aber die
    // geerbte Pruefung (Vorhalt-Zuendung auf die Naht, Stollen durch den
    // Riegel) bleibt ein voller Loesungsweg — eine Vergabe teurer und um
    // den Sprengmeister aermer.
    const level = levelById('w5-15')!;
    const w = play(level, planPruefungA());
    expect(w.phase).toBe('won');
    expect(w.saved).toBeGreaterThanOrEqual(level.needed);
    expect(w.skillsUsed).toBeGreaterThan(level.par);
  });

  it('w6-06: auch der Schacht durchs Erddach löst den Sonnenhof — schneller, teurer', () => {
    // Das eine Doppeltor des Sonnenhangs (Konzept: B6 genau einmal je neuer
    // Welt), und die Preisfrage steht andersherum als bei w4-06 und w5-05:
    // Hier ist der TEURE Weg der schnelle. Der Rammer durch die Westmauer
    // kostet eine Vergabe und 68,0 s, der Schacht dreizehn Vergaben und
    // 36,6 s — dreissig Sekunden gegen zwoelf Schirme. Sterben tut auf
    // beiden Wegen niemand.
    const level = levelById('w6-06')!;
    const w = play(level, planSonnenhofDach());
    expect(w.phase).toBe('won');
    expect(w.saved).toBeGreaterThanOrEqual(level.needed);
    expect(w.skillsUsed).toBeGreaterThan(level.par);
  });

  it('w6-11: der Vorhaltschuss spart den Wächter — schneller und unter Par', () => {
    // Der einzige Zweitweg des Spiels, der BILLIGER ist als die
    // Musterloesung: Wer den Zuender im Laufen vergibt, statt ihn an einem
    // Waechter festzumachen, kommt mit zwei Vergaben aus. Das Par bleibt
    // trotzdem bei drei — die Musterloesung muss es halten, nicht die Kuer,
    // und wer den Vorhalt trifft, soll dafuer den dritten Stern bekommen.
    const level = levelById('w6-11')!;
    const w = play(level, planHangbruchVorhalt());
    expect(w.phase).toBe('won');
    expect(w.saved).toBeGreaterThanOrEqual(level.needed);
    expect(w.skillsUsed).toBeLessThan(level.par);
  });

  it('w6-12: der Fuenfer-Wurf oeffnet nur eine Lippe — und toetet niemanden', () => {
    // Der naheliegende Griff eines Spielers, der das Muster erkannt hat:
    // gleich alle fuenf Rammer auf die oberste Etage. Er traegt nicht. Die
    // Vormerkung ueberlebt zwar den Sturz, aber nicht die Landung — jede
    // liegt zwanzig Bildpunkte neben der Findlingsflanke, und an Stein ist
    // sie verbraucht. Wichtig ist die zweite Erwartung: Der Turm bestraft
    // auch den falschen Griff nicht mit einer Figur.
    const level = levelById('w6-12')!;
    const w = play(level, planStorchennestVolley());
    expect(w.phase).toBe('lost');
    expect(w.dead).toBe(0);
  });

  it('w6-16: nacheinander bedient reicht die Uhr nicht — und trotzdem stirbt niemand', () => {
    // Die Aussage der einzigen Doppelfront des Spiels, als Test. Dieselben
    // vier Griffe, nur in Reihe statt parallel: Die Quote faellt erst bei
    // 85,3 s statt 52,0 s, die Uhr steht bei 76. Hart ist hier die UHR und
    // nicht der Tod — deshalb die zweite Erwartung.
    const level = levelById('w6-16')!;
    const w = play(level, planZweiArmeSeriell());
    expect(w.phase).toBe('lost');
    expect(w.dead).toBe(0);
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

    // Die Messregeln als Abnahmegesetz (Paket 5): Wer eine Zahl aendert,
    // muss hier vorbei. Dokumentierte Ausnahme: w2-05 „Taktgeber" — die
    // Marge 0 und die enge Uhr SIND das Raetsel (Rate-Regler-Lehre), und
    // die Uhr-Niederlage kostet dank Herzschutz kein Leben.
    for (const b of bericht) {
      if (b.id === 'w2-05') continue;
      // Marge >= 2 ueberall; im Einfuehrungs-Drittel (Pos 1-3) >= 3 —
      // ausser im lebensfreien W1-Lehrgang, den das Konzept unantastbar
      // stellt.
      expect(b.quotenMarge, `${b.id}: Marge`).toBeGreaterThanOrEqual(2);
      const nr = Number(b.id.slice(3));
      if (nr <= 3 && !b.id.startsWith('w1')) {
        expect(b.quotenMarge, `${b.id}: Drittel-A-Marge`).toBeGreaterThanOrEqual(3);
      }
      // Uhr nie enger als Faktor 1,3 auf die Musterloesung.
      if (b.uhrFaktor !== null) {
        expect(b.uhrFaktor, `${b.id}: Uhrfaktor`).toBeGreaterThanOrEqual(1.3);
      }
      // Mindestens ein Werkzeug Reserve — ein Fehltipp verliert kein Level.
      expect(b.ueberschuss, `${b.id}: Ueberschuss`).toBeGreaterThanOrEqual(1);
    }
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
  // Paket 4 (Level-Konzept): Die K1-Abnahme — jedes W5-Level gegen seinen
  // geerbten Quellplan.
  it('w5-01: der geerbte Null-Plan verliert den Pulk an die Westkante', () => {
    erwarteRot('w5-01', planFrost1);
  });
  it('w5-02: der Aschen-Plan gräbt auf die Kruste', () => {
    erwarteRot('w5-02', planLevel1);
  });
  it('w5-03: der Brückenplan kennt weder Balkon noch Schirm', () => {
    erwarteRot('w5-03', planLevel3);
  });
  it('w5-05: der Abzweig-Plan greift ins Leere', () => {
    erwarteRot('w5-05', planLevel8);
  });
  it('w5-06: der Ader-Plan erreicht sein Grabfenster nie', () => {
    erwarteRot('w5-06', planKlamm11);
  });
  it('w5-07: die geerbte Schräge kennt weder Steg noch Mauer', () => {
    erwarteRot('w5-07', planKlamm5);
  });
  it('w5-09: Kletterer ohne Sprengung kreisen im Kamin', () => {
    erwarteRot('w5-09', planLevel6);
  });
  it('w5-11: der Kernbohrungs-Plan hat keinen Schirm für den Balkon', () => {
    erwarteRot('w5-11', planRost6);
  });
  it('w5-12: die geerbte Zweierkette kippt in den breiten Westspalt', () => {
    erwarteRot('w5-12', planRost4);
  });
  it('w5-15: der Zwillingsplan greift gespiegelt überall ins Leere', () => {
    erwarteRot('w5-15', () => planRost13(9));
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
  it('w6-15: drei Rammer an der Aussenflanke — der Findling nimmt jeden an', () => {
    // Die Behauptung des Rondells als Test: In dieses Bauwerk fuehrt kein
    // Stollen. Wer es mit Gewalt versucht, verbraucht den ganzen Vorrat und
    // steht immer noch davor — verloren, aber ohne einen Toten.
    const level = levelById('w6-15')!;
    const w = play(level, planRondellVonAussen());
    expect(w.phase).toBe('lost');
    expect(w.dead).toBe(0);
  });
  it('w6-13: zweimal der Gräber — die Sechsundneunzig nimmt er nicht', () => {
    // Die These der Welt im Gegenlicht: Jeder Abstand sagt ueber seine Zahl
    // selbst, welches Werkzeug er verlangt. Wer auf E96 denselben Griff tut
    // wie auf E48, sinkt zweiundsechzig auf die Findlingsbank und steht mit
    // dem ganzen Pulk im Neun-Punkte-Schacht. Verloren, kein Toter.
    const level = levelById('w6-13')!;
    const w = play(level, planW613NurGraeber());
    expect(w.phase).toBe('lost');
    expect(w.dead).toBe(0);
  });
  it('w6-14: der Rampen-Plan von w6-05 findet den Korridor nicht', () => {
    // Die Klonprobe der Welt: w6-05 und w6-14 tragen beide einen Kletterer
    // auf die Krone und eine Westschraege zurueck. Trennscharf sind sie
    // durch die PLATZIERUNG — hier traegt nur der eine freie Korridor
    // zwischen den Findlingsrippen, und das Ansatzfenster von w6-05
    // existiert auf dieser Krone gar nicht.
    erwarteRot('w6-14', planRampeVonOben);
  });
  it('w6-10: ohne Wächter strandet der Pulk unversehrt in der Ostwanne', () => {
    // Das Mechaniklevel der Welt, im Gegenlicht: Der fallende Waechter ist
    // die ganze Loesung, und ohne ihn tut ein zweiter Graeber gar nichts.
    // Wichtig ist der zweite Satz der Erwartung — es stirbt NIEMAND. Genau
    // so soll sich ein vergessener Waechter anfuehlen: Man sieht sie stehen,
    // man kommt nicht mehr an sie heran, und niemand ist gestorben.
    const level = levelById('w6-10')!;
    const w = play(level, planW610OhneWaechter());
    expect(w.phase).toBe('lost');
    expect(w.dead).toBe(0);
  });
  it('w6-03: der Bloecke-Plan des Nachbarn endet auf dem Findlingsband', () => {
    // Das E96-Paar der Welt: Beide Level lehren „sechsundneunzig traegt nur
    // die Schraege", und genau deshalb muessen sie sich als Raetsel
    // trennen. Der Nachsetz-Plan von w6-04 findet hier zwar seinen ersten
    // Ansatz, setzt die zweite Schraege aber westlich des Findlings — sie
    // dreht am Stein ab, und der Pulk bleibt auf der zweiten Terrasse.
    erwarteRot('w6-03', planDritteSchraege);
  });
  it('w6-04: die Zwei-Schraegen-Hand des Nachbarn laesst den dritten Block stehen', () => {
    erwarteRot('w6-04', planZuTief);
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
  /**
   * w2-01 „Abstieg": Nichtstun gewinnt nicht mehr.
   *
   * Das ist kein Rot-Test gegen einen Altplan, sondern gegen den LEEREN Plan
   * — und er steht hier, weil das Level einmal genau daran krankte. Es trug
   * `par: 0`, und im Kommentar stand der Satz „Reines Ankommen: Wer nur
   * laufen laesst, gewinnt mit null Zuweisungen." Der Spieltest hat es beim
   * Namen genannt: „um Level Abstieg muss der Spieler ueberhaupt nichts
   * machen."
   *
   * Ein Level, das sich von allein loest, ist kein Level. Wer die Geometrie
   * hier wieder aufmacht, faellt an dieser Stelle durch.
   */
  it('w2-01: Nichtstun gewinnt nicht mehr', () => {
    const level = levelById('w2-01')!;
    expect(level.par).toBeGreaterThanOrEqual(1);
    const w = play(level, () => {});
    expect(w.phase, 'ohne eine einzige Zuweisung').toBe('lost');
  });

  /**
   * Und der Graeber ist wirklich die falsche Antwort — nicht nur dem
   * Kommentar nach.
   *
   * Unter der Sohle liegt eine Stahlader; wer dort senkrecht graebt, steht
   * nach dreizehn Bildpunkten darauf. Das ist die Lehre der Kristallklamm,
   * und sie ist nur dann eine, wenn sie wirklich greift.
   */
  it('w2-01: der Graeber allein kommt nicht durch den Stahl', () => {
    const level = levelById('w2-01')!;
    const w = play(level, (() => {
      let done = false;
      return (welt: World) => {
        if (done) return;
        const c = walkerNear(welt, 450, 470);
        if (c && welt.assign(c.id, 'digger')) done = true;
      };
    })());
    expect(w.skillsUsed, 'der Graeber wurde vergeben').toBe(1);
    expect(w.phase, 'und half trotzdem nicht').toBe('lost');
  });

  // Paket 1 (Level-Konzept): Die Fruehspiel-Umbauten gegen ihre Altplaene.
  it('w1-08: der alte Bruecken-Plan findet weder Schlucht noch Bauer', () => {
    erwarteRot('w1-08', planLevel8);
  });
  // Der Neubau der ersten Welt (vierzehn statt zehn Level). Die Plaetze 3
  // bis 10 tragen seitdem andere Raetsel; hier steht der Beweis dafuer, dass
  // sie es wirklich tun. Die Plaetze 1 und 2 fehlen mit Absicht: „Grabe dich
  // durch" und „Die Wand" sind dieselben Level geblieben.
  it('w1-03: der alte Abgrund-Plan findet weder Schlucht noch Bauer', () => {
    erwarteRot('w1-03', planLevel3);
  });
  it('w1-04: der alte Schirmregen hat keine Schirme mehr', () => {
    erwarteRot('w1-04', planLangerFall);
  });
  it('w1-05: der alte Stahl-Plan zielt neben den Stollen', () => {
    erwarteRot('w1-05', planLevel5);
  });
  it('w1-06: der alte Kletterplan steht vor der falschen Wand', () => {
    erwarteRot('w1-06', planLevel6);
  });
  it('w1-07: die alte Sprengung findet keine Naht', () => {
    erwarteRot('w1-07', planLevel7);
  });
  it('w1-08: der Weichen-Plan hat hier keine Weiche', () => {
    erwarteRot('w1-08', planWeiche);
  });
  it('w1-09: der alte Doppelgaben-Plan trifft die Flanke nicht', () => {
    erwarteRot('w1-09', planLevel9);
  });
  it('w1-10: die alte Pruefung sucht Bruecke, Schacht und Stollen vergebens', () => {
    erwarteRot('w1-10', planLevel10);
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
