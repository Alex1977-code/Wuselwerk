import * as C from './constants';
import { Terrain } from './terrain';
import { canAssign, isActive } from './skills';
import {
  DeathCause,
  SKILLS,
  State,
  type Rect,
  type SkillCounts,
  type SkillId,
  type WorldEvent,
  type WorldPhase,
  type Wusel,
} from './types';

export interface WorldConfig {
  terrain: Terrain;
  entrance: { x: number; y: number };
  exit: Rect;
  total: number;
  needed: number;
  timeLimitSec: number;
  releaseRate: number;
  minReleaseRate: number;
  skills: SkillCounts;
}

const MAX_EVENTS = 256;

/**
 * Die Simulation. Deterministisch, feste Tickrate, ausschliesslich
 * Ganzzahlpositionen — kein Zufall, kein Gleitkomma, keine Abhaengigkeit vom
 * Renderer (GDD §11). Derselbe Startzustand plus dieselbe Eingabefolge ergibt
 * immer denselben Verlauf; das ist die Voraussetzung fuer den Zeitruecklauf.
 */
export class World {
  readonly terrain: Terrain;
  readonly entrance: { x: number; y: number };
  readonly exit: Rect;
  readonly total: number;
  readonly needed: number;
  readonly timeLimitTicks: number;
  readonly minReleaseRate: number;

  wusels: Wusel[] = [];
  skills: SkillCounts;
  releaseRate: number;

  tickCount = 0;
  released = 0;
  saved = 0;
  dead = 0;
  skillsUsed = 0;
  phase: WorldPhase = 'running';

  hatchOpen = false;
  nuking = false;

  events: WorldEvent[] = [];

  private releaseCountdown = C.HATCH_OPEN_TICKS;
  private nukeCursor = 0;
  private nukeTimer = 0;
  private nextId = 1;

  constructor(cfg: WorldConfig) {
    this.terrain = cfg.terrain;
    this.entrance = cfg.entrance;
    this.exit = cfg.exit;
    this.total = cfg.total;
    this.needed = cfg.needed;
    this.timeLimitTicks = Math.round(cfg.timeLimitSec * C.TICK_HZ);
    this.minReleaseRate = cfg.minReleaseRate;
    this.releaseRate = cfg.releaseRate;
    this.skills = { ...cfg.skills };
  }

  // --- Abfragen ------------------------------------------------------------

  get activeCount(): number {
    let n = 0;
    for (const w of this.wusels) if (isActive(w)) n++;
    return n;
  }

  /** Noch nicht freigesetzte plus noch lebende Figuren. */
  get remaining(): number {
    return this.total - this.released + this.activeCount;
  }

  get timeLeftTicks(): number {
    if (this.timeLimitTicks <= 0) return Number.POSITIVE_INFINITY;
    return Math.max(0, this.timeLimitTicks - this.tickCount);
  }

  wuselById(id: number): Wusel | undefined {
    return this.wusels.find((w) => w.id === id);
  }

  // --- Spielereingaben -----------------------------------------------------

  setReleaseRate(rate: number): void {
    const r = Math.max(this.minReleaseRate, Math.min(C.RATE_MAX, Math.round(rate)));
    if (r === this.releaseRate) return;
    this.releaseRate = r;
    // Wird schneller freigesetzt, verkuerzt sich auch die laufende Wartezeit.
    const iv = C.releaseIntervalTicks(r);
    if (this.releaseCountdown > iv) this.releaseCountdown = iv;
  }

  canAssignTo(w: Wusel, skill: SkillId): boolean {
    return this.skills[skill] > 0 && canAssign(w, skill);
  }

  assign(id: number, skill: SkillId): boolean {
    const w = this.wuselById(id);
    if (!w || !this.canAssignTo(w, skill)) return false;
    this.skills[skill]--;
    this.skillsUsed++;
    this.applySkill(w, skill);
    this.emit({ type: 'assign', x: w.x, y: w.y, skill });
    return true;
  }

  /** Selbstzerstoerung (GDD §4) — die beste Kapitulationsgeste der Spielgeschichte. */
  nuke(): void {
    if (this.nuking) return;
    this.nuking = true;
    this.nukeCursor = 0;
    this.nukeTimer = 0;
    // Was noch in der Falltuer sitzt, kommt nicht mehr heraus.
    this.released = this.total;
  }

  private applySkill(w: Wusel, skill: SkillId): void {
    switch (skill) {
      case 'climber':
        w.hasClimber = true;
        break;
      case 'floater':
        w.hasFloater = true;
        break;
      case 'bomber':
        w.fuse = C.BOMB_FUSE_TICKS;
        break;
      case 'blocker':
        w.isBlocker = true;
        this.setState(w, State.BLOCKING);
        break;
      case 'builder':
        w.bricks = C.BUILD_BRICKS;
        this.setState(w, State.BUILDING);
        break;
      case 'basher':
        this.setState(w, State.BASHING);
        break;
      case 'miner':
        this.setState(w, State.MINING);
        break;
      case 'digger':
        this.setState(w, State.DIGGING);
        break;
    }
  }

  // --- Hauptschleife -------------------------------------------------------

  tick(): void {
    if (this.phase !== 'running') return;
    this.tickCount++;

    this.updateHatch();
    this.updateNuke();

    for (const w of this.wusels) this.updateWusel(w);

    this.checkEnd();
  }

  private updateHatch(): void {
    if (this.releaseCountdown > 0) {
      this.releaseCountdown--;
      if (this.releaseCountdown === 0) this.hatchOpen = true;
      return;
    }
    if (this.released >= this.total) return;
    this.spawn();
    this.releaseCountdown = C.releaseIntervalTicks(this.releaseRate);
  }

  private spawn(): void {
    const w: Wusel = {
      id: this.nextId++,
      x: this.entrance.x,
      y: this.entrance.y,
      dir: 1,
      state: State.FALLING,
      timer: 0,
      fallDist: 0,
      bricks: 0,
      hoist: 0,
      hasClimber: false,
      hasFloater: false,
      isBlocker: false,
      fuse: 0,
      cause: DeathCause.NONE,
      bornTick: this.tickCount,
    };
    this.wusels.push(w);
    this.released++;
    this.emit({ type: 'spawn', x: w.x, y: w.y });
  }

  private updateNuke(): void {
    if (!this.nuking) return;
    if (this.nukeTimer > 0) {
      this.nukeTimer--;
      return;
    }
    while (this.nukeCursor < this.wusels.length) {
      const w = this.wusels[this.nukeCursor++];
      if (isActive(w) && w.fuse === 0) {
        w.fuse = C.BOMB_FUSE_TICKS;
        this.nukeTimer = C.NUKE_STAGGER;
        return;
      }
    }
  }

  private checkEnd(): void {
    const timeUp = this.timeLimitTicks > 0 && this.tickCount >= this.timeLimitTicks;
    const allGone = this.released >= this.total && this.activeCount === 0;
    if (!timeUp && !allGone) return;
    this.phase = this.saved >= this.needed ? 'won' : 'lost';
  }

  // --- Figurenlogik --------------------------------------------------------

  private setState(w: Wusel, s: State): void {
    w.state = s;
    w.timer = 0;
    if (s !== State.FALLING) w.fallDist = 0;
    if (s === State.HOISTING) w.hoist = 0;
  }

  private updateWusel(w: Wusel): void {
    if (w.state === State.DEAD || w.state === State.SAVED) return;

    if (w.state === State.DYING) {
      if (++w.timer >= C.DYING_TICKS) w.state = State.DEAD;
      return;
    }
    if (w.state === State.SAVING) {
      if (++w.timer >= C.SAVING_TICKS) w.state = State.SAVED;
      return;
    }

    if (w.fuse > 0) {
      w.fuse--;
      if (w.fuse % C.TICK_HZ === 0 && w.fuse > 0) {
        this.emit({ type: 'fuse-tick', x: w.x, y: w.y, n: w.fuse / C.TICK_HZ });
      }
      if (w.fuse === 0) {
        this.explode(w);
        return;
      }
    }

    if (this.checkExit(w)) return;

    switch (w.state) {
      case State.WALKING:
        this.stepWalking(w);
        break;
      case State.FALLING:
        this.stepFalling(w);
        break;
      case State.CLIMBING:
        this.stepClimbing(w);
        break;
      case State.HOISTING:
        this.stepHoisting(w);
        break;
      case State.BUILDING:
        this.stepBuilding(w);
        break;
      case State.BASHING:
        this.stepBashing(w);
        break;
      case State.MINING:
        this.stepMining(w);
        break;
      case State.DIGGING:
        this.stepDigging(w);
        break;
      case State.BLOCKING:
        this.stepBlocking(w);
        break;
      default:
        break;
    }
  }

  private checkExit(w: Wusel): boolean {
    if (w.state === State.BLOCKING) return false;
    const e = this.exit;
    if (w.x < e.x || w.x >= e.x + e.w) return false;
    if (w.y < e.y || w.y >= e.y + e.h) return false;
    this.saved++;
    this.setState(w, State.SAVING);
    this.emit({ type: 'saved', x: w.x, y: w.y, n: this.saved });
    return true;
  }

  private die(w: Wusel, cause: DeathCause): void {
    w.cause = cause;
    this.dead++;
    this.setState(w, State.DYING);
    this.emit({ type: 'died', x: w.x, y: w.y, cause });
  }

  private explode(w: Wusel): void {
    this.terrain.clearCircle(w.x, w.y - Math.floor(C.WUSEL_H / 2), C.BOMB_RADIUS);
    this.emit({ type: 'explode', x: w.x, y: w.y - Math.floor(C.WUSEL_H / 2) });
    this.die(w, DeathCause.EXPLOSION);
  }

  /** Passt der Koerper (eine Spalte hoch WUSEL_H) an diese Stelle? */
  private bodyFits(x: number, y: number): boolean {
    for (let r = y - C.WUSEL_H + 1; r <= y; r++) {
      if (this.terrain.solid(x, r)) return false;
    }
    return true;
  }

  /** Linke Spalte eines Bereichs, der `from` Pixel vor der Figur beginnt. */
  private aheadX(w: Wusel, from: number, count: number): number {
    return w.dir > 0 ? w.x + from : w.x - from - count + 1;
  }

  /** Steht ein Blocker im Weg? Nur wer auf ihn zulaeuft, dreht um. */
  private blockedBy(w: Wusel): boolean {
    for (const b of this.wusels) {
      if (b.id === w.id || b.state !== State.BLOCKING) continue;
      if (Math.abs(w.x - b.x) > C.BLOCK_RADIUS) continue;
      if (Math.abs(w.y - b.y) >= C.WUSEL_H) continue;
      const toward = Math.sign(b.x - w.x);
      if (toward !== 0 && toward === w.dir) return true;
    }
    return false;
  }

  /** Steckt die Figur im Material (z. B. weil jemand darunter gebaut hat)? */
  private unstick(w: Wusel): boolean {
    if (!this.terrain.solid(w.x, w.y)) return true;
    for (let rise = 1; rise <= C.WUSEL_H; rise++) {
      if (!this.terrain.solid(w.x, w.y - rise)) {
        w.y -= rise;
        return true;
      }
    }
    this.die(w, DeathCause.CRUSHED);
    return false;
  }

  private due(w: Wusel, interval: number): boolean {
    return w.timer % interval === 0;
  }

  // --- Zustaende -----------------------------------------------------------

  private stepWalking(w: Wusel): void {
    w.timer++;
    if (!this.due(w, C.WALK_INTERVAL)) return;
    if (!this.unstick(w)) return;

    // Boden weg? Dann faellt sie.
    if (!this.terrain.solid(w.x, w.y + 1)) {
      this.setState(w, State.FALLING);
      return;
    }
    if (this.blockedBy(w)) {
      w.dir = (-w.dir) as -1 | 1;
      return;
    }

    const nx = w.x + w.dir;
    if (nx < 0 || nx >= this.terrain.width) {
      w.dir = (-w.dir) as -1 | 1;
      return;
    }

    if (this.terrain.solid(nx, w.y)) {
      // Stufe oder Wand.
      let ny = w.y;
      let rise = 0;
      while (rise < C.MAX_STEP && this.terrain.solid(nx, ny)) {
        ny--;
        rise++;
      }
      if (this.terrain.solid(nx, ny) || !this.bodyFits(nx, ny)) {
        this.hitWall(w);
        return;
      }
      w.x = nx;
      w.y = ny;
      return;
    }

    if (!this.bodyFits(nx, w.y)) {
      this.hitWall(w);
      return;
    }

    if (this.terrain.solid(nx, w.y + 1)) {
      w.x = nx;
      return;
    }

    // Absatz hinuntersteigen, sonst fallen.
    let ny = w.y;
    let drop = 0;
    while (drop < C.MAX_DROP && !this.terrain.solid(nx, ny + 1)) {
      ny++;
      drop++;
    }
    if (this.terrain.solid(nx, ny + 1)) {
      w.x = nx;
      w.y = ny;
      return;
    }
    w.x = nx;
    this.setState(w, State.FALLING);
  }

  private hitWall(w: Wusel): void {
    if (w.hasClimber) {
      this.setState(w, State.CLIMBING);
      return;
    }
    w.dir = (-w.dir) as -1 | 1;
  }

  private stepFalling(w: Wusel): void {
    w.timer++;
    const floating = w.hasFloater && w.fallDist >= C.FLOAT_DEPLOY;
    const iv = floating ? C.FLOAT_INTERVAL : C.FALL_INTERVAL;
    if (!this.due(w, iv)) return;

    if (this.terrain.solid(w.x, w.y + 1)) {
      if (!w.hasFloater && w.fallDist > C.FALL_DEATH_PX) {
        this.die(w, DeathCause.SPLAT);
        return;
      }
      this.setState(w, w.isBlocker ? State.BLOCKING : State.WALKING);
      return;
    }

    w.y++;
    w.fallDist++;
    // Genau der Bildpunkt, an dem der Schirm aufgeht — eine Zeile weiter oben
    // schaltet `floating` um. Das Ereignis traegt keinen Zustand, es meldet nur
    // den Umschlag an Ton und Bild.
    if (w.hasFloater && w.fallDist === C.FLOAT_DEPLOY) {
      this.emit({ type: 'float', x: w.x, y: w.y });
    }
    if (w.y - C.WUSEL_H > this.terrain.height) {
      this.die(w, DeathCause.ABYSS);
    }
  }

  private stepClimbing(w: Wusel): void {
    w.timer++;
    if (!this.due(w, C.CLIMB_INTERVAL)) return;

    const headY = w.y - C.WUSEL_H + 1;
    if (headY - 1 < 0) {
      // Deckenhoehe des Levels erreicht.
      w.dir = (-w.dir) as -1 | 1;
      this.setState(w, State.FALLING);
      return;
    }
    if (this.terrain.solid(w.x, headY - 1)) {
      // Ueberhang ueber dem eigenen Kopf — es geht nicht weiter.
      w.dir = (-w.dir) as -1 | 1;
      this.setState(w, State.FALLING);
      return;
    }
    if (this.terrain.solid(w.x + w.dir, headY - 1)) {
      w.y--;
      // Nicht jeder Bildpunkt: Ein Saugnapfgeraeusch je Pixel waere ein
      // Schnarren. Jeder dritte ergibt den Schlurfschritt, den man erwartet —
      // und die Hoehe entscheidet, nicht ein Zaehler, damit kein Feld dazukommt.
      if (w.y % 3 === 0) this.emit({ type: 'climb', x: w.x, y: w.y });
      return;
    }
    // Oberkante erreicht: hochziehen.
    this.setState(w, State.HOISTING);
  }

  private stepHoisting(w: Wusel): void {
    w.timer++;
    if (!this.due(w, C.CLIMB_INTERVAL)) return;

    if (w.hoist < C.WUSEL_H) {
      if (this.terrain.solid(w.x, w.y - C.WUSEL_H)) {
        w.dir = (-w.dir) as -1 | 1;
        this.setState(w, State.FALLING);
        return;
      }
      w.y--;
      w.hoist++;
      return;
    }
    const nx = w.x + w.dir;
    if (nx >= 0 && nx < this.terrain.width && this.bodyFits(nx, w.y)) w.x = nx;
    this.setState(w, State.WALKING);
  }

  private stepBuilding(w: Wusel): void {
    w.timer++;
    if (!this.due(w, C.BUILD_INTERVAL)) return;

    if (w.bricks <= 0) {
      this.setState(w, State.WALKING);
      return;
    }

    // Stufe legen.
    const bx = this.aheadX(w, 1, C.BRICK_LEN);
    this.terrain.fillRect(bx, w.y, C.BRICK_LEN, 1, 4 /* MAT.BRICK */);
    w.bricks--;
    this.emit({ type: 'brick', x: w.x, y: w.y, n: w.bricks });

    if (this.blockedBy(w)) {
      w.dir = (-w.dir) as -1 | 1;
      this.setState(w, State.WALKING);
      return;
    }

    const nx = w.x + w.dir * C.BUILD_ADVANCE;
    const ny = w.y - 1;
    if (nx < 0 || nx >= this.terrain.width) {
      w.dir = (-w.dir) as -1 | 1;
      this.setState(w, State.WALKING);
      return;
    }
    if (!this.bodyFits(nx, ny)) {
      // Kopf gestossen.
      w.dir = (-w.dir) as -1 | 1;
      this.setState(w, State.WALKING);
      return;
    }
    w.x = nx;
    w.y = ny;
  }

  private stepBashing(w: Wusel): void {
    w.timer++;
    if (!this.due(w, C.BASH_INTERVAL)) return;
    if (!this.unstick(w)) return;

    const sx = this.aheadX(w, 1, C.BASH_DEPTH);
    const sy = w.y - C.BASH_UP;
    const sh = C.BASH_UP + 1;

    if (this.terrain.hasSteel(sx, sy, C.BASH_DEPTH, sh)) {
      this.emit({ type: 'steel', x: w.x + w.dir * 2, y: w.y - 6 });
      w.dir = (-w.dir) as -1 | 1;
      this.setState(w, State.WALKING);
      return;
    }

    const removed = this.terrain.clearRect(sx, sy, C.BASH_DEPTH, sh);
    if (removed > 0)
      this.emit({ type: 'dig', x: w.x + w.dir * 2, y: w.y - 5, skill: 'basher', dir: w.dir });

    const nx = w.x + w.dir * C.BASH_DEPTH;
    if (nx < 0 || nx >= this.terrain.width) {
      w.dir = (-w.dir) as -1 | 1;
      this.setState(w, State.WALKING);
      return;
    }
    w.x = nx;

    if (!this.terrain.solid(w.x, w.y + 1)) {
      this.setState(w, State.FALLING);
      return;
    }
    // Durchgebrochen? Dann laeuft sie weiter.
    const lx = this.aheadX(w, 1, C.BASH_LOOK);
    if (!this.terrain.hasSolid(lx, w.y - C.WUSEL_H + 1, C.BASH_LOOK, C.WUSEL_H)) {
      this.setState(w, State.WALKING);
    }
  }

  private stepMining(w: Wusel): void {
    w.timer++;
    if (!this.due(w, C.MINE_INTERVAL)) return;
    if (!this.unstick(w)) return;

    const sx = this.aheadX(w, 1, C.MINE_REACH);
    const sy = w.y - C.WUSEL_H + 1;
    const sh = C.WUSEL_H + C.MINE_DY;

    if (this.terrain.hasSteel(sx, sy, C.MINE_REACH, sh)) {
      this.emit({ type: 'steel', x: w.x + w.dir * 2, y: w.y - 4 });
      w.dir = (-w.dir) as -1 | 1;
      this.setState(w, State.WALKING);
      return;
    }

    this.terrain.clearRect(sx, sy, C.MINE_REACH, sh);
    this.emit({ type: 'dig', x: w.x + w.dir * 2, y: w.y - 3, skill: 'miner', dir: w.dir });

    const nx = w.x + w.dir * C.MINE_DX;
    const ny = w.y + C.MINE_DY;
    if (nx < 0 || nx >= this.terrain.width) {
      w.dir = (-w.dir) as -1 | 1;
      this.setState(w, State.WALKING);
      return;
    }
    w.x = nx;
    w.y = ny;

    if (!this.terrain.solid(w.x, w.y + 1)) this.setState(w, State.FALLING);
  }

  private stepDigging(w: Wusel): void {
    w.timer++;
    if (!this.due(w, C.DIG_INTERVAL)) return;

    const sx = w.x - C.DIG_HALF_W;
    const sw = C.DIG_HALF_W * 2 + 1;
    const row = w.y + 1;

    if (this.terrain.hasSteel(sx, row, sw, 1)) {
      this.emit({ type: 'steel', x: w.x, y: row });
      this.setState(w, State.WALKING);
      return;
    }

    this.terrain.clearRect(sx, row, sw, 1);
    this.emit({ type: 'dig', x: w.x, y: row, skill: 'digger', dir: w.dir });
    w.y = row;

    if (w.y - C.WUSEL_H > this.terrain.height) {
      this.die(w, DeathCause.ABYSS);
      return;
    }
    if (!this.terrain.solid(w.x, w.y + 1)) this.setState(w, State.FALLING);
  }

  private stepBlocking(w: Wusel): void {
    w.timer++;
    if (!this.terrain.solid(w.x, w.y + 1)) {
      // Boden weggegraben — er faellt und blockt danach weiter.
      this.setState(w, State.FALLING);
    }
  }

  private emit(e: WorldEvent): void {
    if (this.events.length >= MAX_EVENTS) return;
    this.events.push(e);
  }

  drainEvents(): WorldEvent[] {
    const e = this.events;
    this.events = [];
    return e;
  }

  /** Kompakter Zustands-Hash — dient den Determinismus-Tests. */
  stateHash(): number {
    let h = 2166136261 >>> 0;
    const mix = (v: number) => {
      h ^= v & 0xffffffff;
      h = Math.imul(h, 16777619) >>> 0;
    };
    mix(this.tickCount);
    mix(this.released);
    mix(this.saved);
    mix(this.dead);
    for (const w of this.wusels) {
      mix(w.id);
      mix(w.x);
      mix(w.y);
      mix(w.dir);
      mix(w.state);
      mix(w.timer);
      mix(w.fallDist);
      mix(w.bricks);
      mix(w.fuse);
      mix((w.hasClimber ? 1 : 0) | (w.hasFloater ? 2 : 0) | (w.isBlocker ? 4 : 0));
    }
    for (const s of SKILLS) mix(this.skills[s]);
    const m = this.terrain.mat;
    for (let i = 0; i < m.length; i += 7) mix(m[i] * (i + 1));
    return h >>> 0;
  }
}
