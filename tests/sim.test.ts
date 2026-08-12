import { describe, expect, it } from 'vitest';
import { DeathCause, MAT, State } from '../src/core/types';
import * as C from '../src/core/constants';
import { place, run, testWorld } from './helpers';
import { isActive } from '../src/core/skills';

describe('Laufen und Fallen', () => {
  it('läuft mit 20 px/s stur geradeaus', () => {
    const w = testWorld();
    const a = place(w, 50, 79);
    run(w, 30);
    expect(a.x).toBe(50 + 10);
    expect(a.state).toBe(State.WALKING);
  });

  it('dreht an der Wand um — keine Wegfindung, nur Sturheit', () => {
    const w = testWorld();
    w.terrain.fillRect(70, 60, 6, 20, MAT.ROCK);
    const a = place(w, 50, 79);
    run(w, 90);
    expect(a.dir).toBe(-1);
    expect(a.x).toBeLessThan(70);
  });

  it('steigt kleine Stufen hoch und kleine Absätze hinunter', () => {
    const w = testWorld();
    w.terrain.fillRect(60, 76, 40, 4, MAT.EARTH); // 4 px hohe Stufe
    const a = place(w, 50, 79);
    run(w, 45);
    expect(a.y).toBe(75);
    expect(a.dir).toBe(1);
  });

  it('zerschellt über der Grenzfallhöhe, überlebt darunter', () => {
    const deadly = testWorld();
    const a = place(deadly, 50, 0, State.FALLING);
    run(deadly, 200);
    expect(a.state === State.DYING || a.state === State.DEAD).toBe(true);
    expect(a.cause).toBe(DeathCause.SPLAT);

    const safe = testWorld();
    const b = place(safe, 50, 79 - C.FALL_DEATH_PX + 1, State.FALLING);
    run(safe, 200);
    expect(b.state).toBe(State.WALKING);
  });

  it('fällt aus dem Level und stirbt', () => {
    const w = testWorld(200, 120, 80);
    w.terrain.fillRect(0, 0, 200, 120, MAT.EMPTY);
    const a = place(w, 50, 10, State.FALLING);
    run(w, 400);
    expect(a.cause).toBe(DeathCause.ABYSS);
  });
});

describe('Schirmspringer', () => {
  it('überlebt jeden Sturz und sinkt langsamer', () => {
    const w = testWorld();
    const a = place(w, 50, 0, State.FALLING, 1, { hasFloater: true });
    run(w, 400);
    expect(a.state).toBe(State.WALKING);
    expect(a.y).toBe(79);
  });
});

describe('Gräber', () => {
  it('gräbt senkrecht abwärts und stoppt am Stahl', () => {
    const w = testWorld();
    w.terrain.fillRect(0, 90, 200, 3, MAT.STEEL);
    const a = place(w, 50, 79, State.DIGGING);
    run(w, 300);
    expect(a.y).toBe(89);
    expect(a.state).toBe(State.WALKING);
    expect(w.terrain.solid(50, 85)).toBe(false);
    expect(w.terrain.solid(50, 91)).toBe(true);
  });

  it('hinterlässt einen 9 px breiten Schacht', () => {
    const w = testWorld();
    const a = place(w, 50, 79, State.DIGGING);
    run(w, 60);
    expect(w.terrain.solid(50 - C.DIG_HALF_W, 82)).toBe(false);
    expect(w.terrain.solid(50 + C.DIG_HALF_W, 82)).toBe(false);
    expect(w.terrain.solid(50 - C.DIG_HALF_W - 1, 82)).toBe(true);
    expect(a.y).toBeGreaterThan(79);
  });

  it('fällt, wenn er in einen Hohlraum durchbricht', () => {
    const w = testWorld();
    w.terrain.fillRect(0, 90, 200, 20, MAT.EMPTY);
    const a = place(w, 50, 79, State.DIGGING);
    run(w, 200);
    expect(a.y).toBe(109);
    expect(a.state).toBe(State.WALKING);
  });
});

describe('Rammer', () => {
  it('gräbt sich waagerecht durch eine Wand', () => {
    const w = testWorld();
    w.terrain.fillRect(100, 60, 20, 20, MAT.ROCK);
    const a = place(w, 99, 79, State.BASHING);
    run(w, 200);
    expect(a.x).toBeGreaterThan(120);
    expect(a.state).toBe(State.WALKING);
    expect(w.terrain.solid(110, 74)).toBe(false);
  });

  it('ohne Wand vor der Nase läuft er einfach weiter — der Skill ist futsch', () => {
    const w = testWorld();
    const a = place(w, 50, 79, State.BASHING);
    run(w, C.BASH_INTERVAL + 1);
    expect(a.state).toBe(State.WALKING);
  });

  it('prallt am Stahl ab und dreht um', () => {
    const w = testWorld();
    w.terrain.fillRect(100, 60, 20, 20, MAT.STEEL);
    const a = place(w, 99, 79, State.BASHING);
    run(w, 200);
    expect(a.state).toBe(State.WALKING);
    expect(a.dir).toBe(-1);
    expect(w.terrain.solid(110, 70)).toBe(true);
  });
});

describe('Schrägbagger', () => {
  it('gräbt diagonal abwärts', () => {
    const w = testWorld(200, 200, 80);
    const a = place(w, 50, 79, State.MINING);
    run(w, 300);
    expect(a.x).toBeGreaterThan(80);
    expect(a.y).toBeGreaterThan(90);
    // Der Schacht fällt nach rechts unten ab.
    expect(a.y - 79).toBeCloseTo((a.x - 50) / 2, 0);
  });

  it('stoppt am Stahl', () => {
    const w = testWorld(200, 200, 80);
    w.terrain.fillRect(70, 80, 10, 60, MAT.STEEL);
    const a = place(w, 50, 79, State.MINING);
    run(w, 300);
    expect(a.state).toBe(State.WALKING);
    expect(a.dir).toBe(-1);
  });
});

describe('Brückenbauer', () => {
  it('legt 12 Stufen schräg aufwärts', () => {
    const w = testWorld();
    const a = place(w, 50, 79, State.BUILDING, 1, { bricks: C.BUILD_BRICKS });
    run(w, C.BUILD_INTERVAL * C.BUILD_BRICKS + 2);
    expect(a.bricks).toBe(0);
    expect(a.x).toBe(50 + C.BUILD_ADVANCE * C.BUILD_BRICKS);
    expect(a.y).toBe(79 - C.BUILD_BRICKS);
    expect(w.terrain.matAt(55, 79)).toBe(MAT.BRICK);
  });

  it('überbrückt eine Lücke, die Läufer danach überqueren', () => {
    const w = testWorld();
    w.terrain.fillRect(64, 80, 24, 40, MAT.EMPTY); // 24 px Abgrund
    const builder = place(w, 60, 79, State.BUILDING, 1, { bricks: C.BUILD_BRICKS });
    run(w, 400);
    expect(builder.x).toBeGreaterThan(88);

    const follower = place(w, 40, 79);
    run(w, 600);
    expect(follower.x).toBeGreaterThan(90);
    expect(follower.state).not.toBe(State.DEAD);
  });
});

describe('Blocker', () => {
  it('dreht alle anderen um', () => {
    const w = testWorld();
    place(w, 80, 79, State.BLOCKING, 1, { isBlocker: true });
    const runner = place(w, 60, 79);
    run(w, 120);
    expect(runner.dir).toBe(-1);
    expect(runner.x).toBeLessThan(80);
  });

  it('blockt nach dem Fall weiter', () => {
    const w = testWorld();
    const b = place(w, 80, 60, State.FALLING, 1, { isBlocker: true });
    run(w, 60);
    expect(b.state).toBe(State.BLOCKING);
    expect(b.y).toBe(79);
  });
});

describe('Kletterer', () => {
  it('läuft senkrechte Wände hoch und zieht sich oben hinauf', () => {
    const w = testWorld(200, 200, 80);
    w.terrain.fillRect(100, 20, 40, 60, MAT.ROCK);
    const a = place(w, 99, 79, State.WALKING, 1, { hasClimber: true });
    // 48 px Wand à 4 Ticks plus 12 px Hochziehen — nach ~250 Ticks steht er oben.
    run(w, 270);
    expect(a.state).toBe(State.WALKING);
    expect(a.y).toBe(19);
    expect(a.x).toBeGreaterThanOrEqual(100);
  });

  it('fällt zurück, wenn ein Überhang den Kopf stoppt', () => {
    const w = testWorld(200, 200, 80);
    w.terrain.fillRect(100, 20, 40, 60, MAT.ROCK);
    w.terrain.fillRect(90, 40, 12, 4, MAT.ROCK); // Vorsprung über dem Kletterer
    const a = place(w, 99, 79, State.WALKING, 1, { hasClimber: true });
    run(w, 300);
    expect(a.dir).toBe(-1);
  });
});

describe('Sprengmeister', () => {
  it('zündet nach 5 Sekunden und hinterlässt einen Krater', () => {
    const w = testWorld();
    const a = place(w, 50, 79, State.BLOCKING, 1, { isBlocker: true });
    w.assign(a.id, 'bomber');
    expect(a.fuse).toBe(C.BOMB_FUSE_TICKS);
    run(w, C.BOMB_FUSE_TICKS + 1);
    expect(a.state).toBe(State.DYING);
    expect(a.cause).toBe(DeathCause.EXPLOSION);
    expect(w.terrain.solid(50, 82)).toBe(false);
  });

  it('läuft während des Countdowns weiter — der Krater entsteht dort, wo er steht', () => {
    const w = testWorld();
    const a = place(w, 50, 79);
    w.assign(a.id, 'bomber');
    run(w, C.BOMB_FUSE_TICKS + 1);
    // Im Zündtick läuft er nicht mehr — daher ein Schritt weniger.
    expect(a.x).toBe(50 + C.BOMB_FUSE_TICKS / C.WALK_INTERVAL - 1);
    expect(w.terrain.solid(a.x, 82)).toBe(false);
    expect(w.terrain.solid(50, 82)).toBe(true);
  });

  it('sprengt keinen Stahl weg', () => {
    const w = testWorld();
    w.terrain.fillRect(40, 82, 20, 6, MAT.STEEL);
    const a = place(w, 50, 79, State.BLOCKING, 1, { isBlocker: true });
    w.assign(a.id, 'bomber');
    run(w, C.BOMB_FUSE_TICKS + 2);
    expect(w.terrain.matAt(50, 84)).toBe(MAT.STEEL);
  });
});

describe('Skill-Gültigkeit (Grundlage des intelligenten Zielens)', () => {
  it('bietet den Kletterer nicht doppelt an', () => {
    const w = testWorld();
    const a = place(w, 50, 79);
    expect(w.canAssignTo(a, 'climber')).toBe(true);
    w.assign(a.id, 'climber');
    expect(w.canAssignTo(a, 'climber')).toBe(false);
  });

  it('setzt keinen zweiten Blocker auf dieselbe Figur', () => {
    const w = testWorld();
    const a = place(w, 50, 79);
    w.assign(a.id, 'blocker');
    expect(a.state).toBe(State.BLOCKING);
    expect(w.canAssignTo(a, 'blocker')).toBe(false);
    // Ein Blocker lässt sich auch nicht wegbefördern — nur wegsprengen.
    expect(w.canAssignTo(a, 'builder')).toBe(false);
    expect(w.canAssignTo(a, 'bomber')).toBe(true);
  });

  it('erlaubt den Wechsel zwischen arbeitenden Berufen', () => {
    const w = testWorld();
    const a = place(w, 50, 79, State.DIGGING);
    expect(w.canAssignTo(a, 'basher')).toBe(true);
    w.assign(a.id, 'basher');
    // Ohne Wand in Reichweite hoert sie mit dem Graben auf und traegt den
    // Rammer als Vormerkung — siehe „Rammer-Vormerkung" unten. Mit Wand
    // begaenne sie sofort.
    expect(a.state).toBe(State.WALKING);
    expect(a.vormerk).toBe('basher');
  });

  it('verweigert alles, was das Kontingent nicht hergibt', () => {
    const w = testWorld();
    const a = place(w, 50, 79);
    w.skills.digger = 0;
    expect(w.canAssignTo(a, 'digger')).toBe(false);
    expect(w.assign(a.id, 'digger')).toBe(false);
  });

  it('spricht tote Figuren nicht mehr an', () => {
    const w = testWorld();
    const a = place(w, 50, 0, State.FALLING);
    run(w, 200);
    expect(w.canAssignTo(a, 'floater')).toBe(false);
  });
});

describe('Falltür, Ausgang und Quote', () => {
  it('setzt Figuren im Takt der Freisetzungsrate frei', () => {
    const w = testWorld();
    w.setReleaseRate(99);
    run(w, C.HATCH_OPEN_TICKS + 1);
    expect(w.released).toBe(1);
    run(w, C.releaseIntervalTicks(99));
    expect(w.released).toBe(1); // total = 1
  });

  it('rettet Figuren in der Türöffnung und zählt sie', () => {
    const w = testWorld();
    // Zehn breit, Rand vier (gedeckelt auf (10-1)/2) — offen ist [192, 194).
    const a = place(w, 193, 79);
    w.exit.x = 188;
    w.exit.y = 70;
    w.exit.w = 10;
    w.exit.h = 20;
    run(w, 2);
    expect(w.saved).toBe(1);
    run(w, C.SAVING_TICKS + 2);
    expect(a.state).toBe(State.SAVED);
  });

  /**
   * Der Rand des Tors ist **nicht** der Ausgang.
   *
   * Vorher zaehlte jede Ueberdeckung mit dem Ausgangsrechteck. Die Figur
   * verschwand damit an seinem aeussersten Bildpunkt — und dort steht im Bild
   * der gemalte Steinrahmen. Das sah nicht nach Hineingehen aus, sondern nach
   * Verschlucktwerden an der Mauer.
   *
   * Geprueft wird auf **einem** Tick: Die Figur laeuft danach weiter und kommt
   * gleich darauf an der Schwelle an, wo sie richtig gerettet wird. Der Punkt
   * ist nicht, dass sie nie ankommt, sondern dass sie es nicht am Rand tut.
   */
  it('rettet nicht schon am Rand des Tors', () => {
    const w = testWorld();
    place(w, 188, 79);
    w.exit.x = 188;
    w.exit.y = 70;
    w.exit.w = 10;
    w.exit.h = 20;
    run(w, 1);
    expect(w.saved).toBe(0);
  });

  /**
   * Auch ein sehr schmales Tor muss zu treffen sein.
   *
   * Der Rand ist die halbe Figurenbreite, also fünf Bildpunkte. Bei einem vier
   * Bildpunkte breiten Tor bliebe davon nichts übrig, und dort käme nie jemand
   * an — ein Level, das sich nicht gewinnen lässt, ohne dass man sähe, warum.
   * Deshalb ist der Rand in `checkExit` gedeckelt, und deshalb steht diese
   * Prüfung hier.
   */
  it('lässt auch ein sehr schmales Tor passierbar', () => {
    const w = testWorld();
    w.exit.x = 100;
    w.exit.y = 70;
    w.exit.w = 4;
    w.exit.h = 20;
    place(w, 102, 79);
    run(w, 1);
    expect(w.saved).toBe(1);
  });

  /**
   * Der Fall durch einen Schacht neben der Mitte muss weiter ankommen.
   *
   * Das ist der Grund, warum der Rand eine feste Länge ist und kein Anteil der
   * Torbreite: Wer über der Tür gräbt, trifft sie selten mittig. Ein Anteil
   * hätte breite Tore auf ihr mittleres Drittel verengt und damit eine ganz
   * normale Spielweise stillgelegt — der Schacht wäre richtig gewesen und die
   * Figuren wären trotzdem vorbeigefallen.
   */
  it('rettet auch abseits der Mitte, solange der Körper drinsteht', () => {
    const w = testWorld();
    // Vierzig breit wie in Level 1, Rand fünf — offen ist [225, 255).
    w.exit.x = 220;
    w.exit.y = 70;
    w.exit.w = 40;
    w.exit.h = 20;
    place(w, 251, 79);
    run(w, 1);
    expect(w.saved).toBe(1);
  });
});

describe('Selbstzerstörung', () => {
  it('zündet alle der Reihe nach', () => {
    const w = testWorld();
    const a = place(w, 40, 79);
    const b = place(w, 60, 79);
    w.nuke();
    run(w, C.NUKE_STAGGER + 2);
    expect(a.fuse).toBeGreaterThan(0);
    expect(b.fuse).toBeGreaterThan(0);
    run(w, C.BOMB_FUSE_TICKS + C.NUKE_STAGGER + 4);
    expect(a.state).toBe(State.DYING);
    expect(b.state).toBe(State.DYING);
  });
});

/**
 * Der letzte Abgang wird zu Ende gespielt.
 *
 * Mit dem Sprung ins Tor ist eine Figur „nicht mehr aktiv", und wenn sie die
 * letzte war, kippte die Phase **im selben Tick** — `tick()` kehrt bei
 * gekippter Phase sofort zurück, und die Sprunganimation blieb auf Bild null
 * stehen. Im Spiel stand die letzte Retterin den ganzen Vorhang lang reglos
 * vor dem Tor, der letzte Sprengmeister hockte neben seinem Krater. Der
 * Zeitpunkt, an dem das Ende feststeht, und der Zeitpunkt, an dem es
 * eintritt, sind zweierlei.
 */
describe('Das Ende wartet auf den Abgang', () => {
  it('lässt die letzte Gerettete zu Ende springen', () => {
    const w = testWorld();
    // Die Falltür bleibt zu — sonst fällt mittendrin noch jemand heraus, und
    // „die letzte" stimmt nicht mehr.
    w.released = w.total;
    const a = place(w, 193, 79);
    w.exit.x = 188;
    w.exit.y = 70;
    w.exit.w = 10;
    w.exit.h = 20;
    run(w, 2);
    expect(w.saved).toBe(1);
    // Ab hier ist niemand mehr aktiv — aber sie springt noch.
    expect(a.state).toBe(State.SAVING);
    expect(w.phase).toBe('running');
    run(w, C.SAVING_TICKS + 2);
    expect(a.state).toBe(State.SAVED);
    expect(w.phase).toBe('won');
  });

  it('lässt den letzten Sterbenden zu Ende sterben', () => {
    const w = testWorld();
    w.released = w.total;
    const a = place(w, 50, 0, State.FALLING);
    // Zerschellen: Fallhöhe jenseits der Grenze.
    run(w, C.FALL_DEATH_PX + 5);
    expect(a.state === State.DYING || a.state === State.DEAD).toBe(true);
    if (a.state === State.DYING) {
      expect(w.phase).toBe('running');
      run(w, C.DYING_TICKS + 2);
    }
    expect(a.state).toBe(State.DEAD);
    expect(w.phase).toBe('lost');
  });
});

/**
 * Die drei neuen Laute der Figuren — als Weltereignisse.
 *
 * Alle drei sind reine Ton-und-Bild-Ereignisse: Sie ändern keinen Zustand und
 * gehen nicht in `hash()` ein. Geprüft wird, **wann** sie fallen — die
 * Schwellen tragen die Aussage: Der Schrei kommt erst hinter dem Schirm
 * (`SCHREI_AB` > `FLOAT_DEPLOY`, ein Schirmspringer schreit nie), das
 * Aufkommen erst ab `LAND_LAUT` (das Absacken hinter einem Gräber ist kein
 * Sturz).
 */
describe('Rufe und Aufkommen', () => {
  it('schreit im freien Fall genau einmal, ab der Schwelle', () => {
    const w = testWorld();
    w.released = w.total;
    place(w, 50, 20, State.FALLING);
    run(w, 60);
    const schreie = w.drainEvents().filter((e) => e.type === 'scream');
    expect(schreie.length).toBe(1);
  });

  it('schreit nicht mit Schirm — der öffnet früher', () => {
    expect(C.SCHREI_AB).toBeGreaterThan(C.FLOAT_DEPLOY);
    const w = testWorld();
    w.released = w.total;
    place(w, 50, 20, State.FALLING, 1, { hasFloater: true });
    run(w, 200);
    expect(w.drainEvents().some((e) => e.type === 'scream')).toBe(false);
  });

  it('meldet das Aufkommen mit der Fallhöhe', () => {
    const w = testWorld();
    w.released = w.total;
    place(w, 50, 40, State.FALLING);
    run(w, 60);
    const land = w.drainEvents().filter((e) => e.type === 'land');
    expect(land.length).toBe(1);
    // Von y=40 bis zur Standhöhe 79 sind es 39 Fallpixel.
    expect(land[0].n).toBe(39);
  });

  it('bleibt beim Absacken um wenige Pixel still', () => {
    const w = testWorld();
    w.released = w.total;
    place(w, 50, 76, State.FALLING);
    run(w, 30);
    expect(w.drainEvents().some((e) => e.type === 'land')).toBe(false);
  });

  it('ruft oh-no, wenn ein Sprengmeister einzeln gezündet wird', () => {
    const w = testWorld();
    w.released = w.total;
    const a = place(w, 50, 79);
    run(w, 1);
    w.drainEvents();
    w.assign(a.id, 'bomber');
    expect(w.drainEvents().some((e) => e.type === 'oh-no')).toBe(true);
  });
});

/**
 * Der Zeitrücklauf — Kritikpunkt F1, und sein prüfbares Soll.
 *
 * Ein Schnappschuss ist nur dann einer, wenn er **vollständig** ist: Fehlt ein
 * einziges Feld, läuft die wiederhergestellte Welt anders weiter als die nie
 * unterbrochene — und zwar still, denn im Bild sieht ein fast richtiger
 * Zustand genau richtig aus. Deshalb hängt dieser Test beide an den Hash.
 */
describe('Zeitrücklauf', () => {
  const aufbau = () => {
    // Hoch genug, dass der Graeber innerhalb des Laufs nicht aus der Welt
    // faellt, und ein Laeufer zwischen zwei Waenden, der sie am Leben haelt —
    // eine beendete Welt tickt nicht mehr und macht keine Schnappschuesse.
    const w = testWorld(400, 400, 160);
    w.released = w.total;
    w.terrain.fillRect(40, 100, 4, 60, MAT.ROCK);
    w.terrain.fillRect(300, 100, 4, 60, MAT.ROCK);
    // Feste Nummern: `place` zaehlt global weiter, und die Nummer steht im
    // Hash — zwei Aufbauten waeren sonst nie gleich, Ruecklauf hin oder her.
    const laeufer = place(w, 100, 159, State.WALKING, 1, { id: 71 });
    const graeber = place(w, 200, 159, State.WALKING, 1, { id: 72 });
    run(w, 30);
    w.assign(graeber.id, 'digger');
    expect(laeufer.state).toBe(State.WALKING);
    return w;
  };

  it('läuft nach dem Rücklauf bitgleich weiter', () => {
    // Der ununterbrochene Lauf.
    const a = aufbau();
    run(a, 1270);
    const soll = a.stateHash();

    // Derselbe Lauf, aber mit Sprung: vor bis 1300, zurück (~10 s), wieder vor.
    const b = aufbau();
    run(b, 1270);
    const vorher = b.tickCount;
    expect(b.zurueck()).toBe(true);
    const zurueck = vorher - b.tickCount;
    expect(zurueck).toBeGreaterThan(0);
    run(b, zurueck);
    expect(b.tickCount).toBe(a.tickCount);
    expect(b.stateHash()).toBe(soll);
  });

  it('springt rund zehn Sekunden, nie vorwärts', () => {
    const w = aufbau();
    run(w, 1270);
    const vorher = w.tickCount;
    w.zurueck();
    const weite = vorher - w.tickCount;
    expect(weite).toBeGreaterThanOrEqual(600);
    expect(weite).toBeLessThanOrEqual(660);
  });

  it('meldet am Anfang keine Rücklaufweite', () => {
    const w = testWorld();
    expect(w.ruecklaufWeite).toBe(0);
    expect(w.zurueck()).toBe(false);
  });

  /**
   * Auch die Niederlage ist rückholbar. Die Phase ist aus den Zählern
   * abgeleitet — wer den Fehler **gesehen** hat, darf ihn zurücknehmen.
   */
  it('holt eine verlorene Welt zurück ins Laufen', () => {
    const w = testWorld(400, 200, 160);
    w.released = w.total;
    const a = place(w, 60, 159);
    run(w, 700);
    w.assign(a.id, 'bomber');
    run(w, C.BOMB_FUSE_TICKS + C.DYING_TICKS + 5);
    expect(w.phase).toBe('lost');
    expect(w.zurueck()).toBe(true);
    expect(w.phase).toBe('running');
    expect(w.wusels.some((x) => isActive(x))).toBe(true);
  });
});

/**
 * Die Vormerkung des Rammers — Kritikpunkt F3c und sein prüfbares Soll:
 * „Tipp 20 Pixel vor der Wand führt zum Durchbruch."
 *
 * Vorher verpuffte der Auftrag im ersten Arbeitstick: keine Wand in
 * Reichweite, „durchgebrochen", zurück ins Laufen — Werkzeug weg, nichts
 * passiert. Jetzt trägt die Figur den Auftrag als Vormerkung und beginnt von
 * selbst, sobald die Wand kommt.
 */
describe('Rammer-Vormerkung', () => {
  it('führt einen Tipp 20 Pixel vor der Wand zum Durchbruch', () => {
    const w = testWorld();
    w.released = w.total;
    w.terrain.fillRect(80, 60, 8, 20, MAT.EARTH);
    const a = place(w, 60, 79);
    run(w, 2);
    expect(w.assign(a.id, 'basher')).toBe(true);
    // Er läuft erst — vorgemerkt, nicht arbeitend.
    expect(a.state).toBe(State.WALKING);
    expect(a.vormerk).toBe('basher');
    run(w, 500);
    // Durchgebrochen und auf der anderen Seite weitergelaufen.
    expect(a.x).toBeGreaterThan(88);
    expect(a.vormerk).toBeNull();
  });

  it('beginnt sofort, wenn die Wand schon in Reichweite steht', () => {
    const w = testWorld();
    w.released = w.total;
    w.terrain.fillRect(66, 60, 8, 20, MAT.EARTH);
    const a = place(w, 62, 79);
    run(w, 2);
    w.assign(a.id, 'basher');
    expect(a.state).toBe(State.BASHING);
    expect(a.vormerk).toBeNull();
  });
});
