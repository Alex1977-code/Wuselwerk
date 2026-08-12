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
/** Alle Sekundenraster-Werte des Ruecklaufs, in Ticks. */
export const RUECKLAUF_RASTER = C.TICK_HZ;
export const RUECKLAUF_TIEFE = 13;
/** Wie weit der Knopf springt. */
export const RUECKLAUF_SPRUNG = 10 * C.TICK_HZ;

/** Eine vollstaendige Kopie des Simulationszustands zu einem Tick. */
interface Schnappschuss {
  tick: number;
  mat: Uint8Array;
  fresh: Uint8Array;
  wusels: Wusel[];
  skills: SkillCounts;
  released: number;
  saved: number;
  dead: number;
  skillsUsed: number;
  hatchOpen: boolean;
  nuking: boolean;
  releaseCountdown: number;
  nukeCursor: number;
  nukeTimer: number;
  nextId: number;
  releaseRate: number;
}

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

  /**
   * Der Ring der Schnappschuesse fuer den Zeitruecklauf.
   *
   * Jede Sekunde einer (`RUECKLAUF_RASTER`), hoechstens `RUECKLAUF_TIEFE`
   * Stueck — aelter als gut zwoelf Sekunden muss keiner sein, der Knopf
   * springt zehn. Ein Schnappschuss ist eine **vollstaendige** Kopie des
   * Simulationszustands: beide Terrainmasken, alle Figuren, alle Zaehler.
   * Bei 720 x 540 sind das gut 700 Kilobyte je Stueck; zwoelf davon sind
   * acht Megabyte, und das ist auf einem Handy in Ordnung.
   *
   * Er haengt an der Welt und nicht am Spiel, weil er **Zustand der
   * Simulation** ist: Nur hier ist sichergestellt, dass nichts vergessen
   * wird — der Determinismus-Test unten prueft genau das, per Hash.
   */
  private schnappschuesse: Schnappschuss[] = [];

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
        // Die Figur weiss, was sie da traegt. Nur beim einzeln gezuendeten
        // Sprengmeister — beim Weltuntergang ruft der Knopf selbst, einmal
        // (siehe game.ts): Zwanzig Rufe uebereinander sind keine Panik mehr,
        // sondern Brei.
        this.emit({ type: 'oh-no', x: w.x, y: w.y });
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
        // Keine Wand in Reichweite? Dann wird nicht gearbeitet, sondern
        // vorgemerkt: Die Figur laeuft und faengt von selbst an, wenn die
        // Wand kommt. Vorher verpuffte der Auftrag im ersten Arbeitstick
        // („durchgebrochen", ohne je zugeschlagen zu haben).
        //
        // Wer dabei gerade etwas anderes arbeitet, hoert damit auf — die
        // Umwidmung ist eine Entscheidung des Spielers, keine Empfehlung.
        if (this.wandInReichweite(w)) this.setState(w, State.BASHING);
        else {
          w.vormerk = 'basher';
          if (w.state !== State.WALKING) this.setState(w, State.WALKING);
        }
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
    // **Vor** dem Zaehlen und Arbeiten, damit der Schnappschuss den Zustand
    // „Anfang von Tick n" traegt: Wiederherstellen und weiterlaufen ist dann
    // bitgleich mit Nie-unterbrochen-worden-sein — das prueft ein Test.
    if (this.tickCount % RUECKLAUF_RASTER === 0) this.merken();
    this.tickCount++;

    this.updateHatch();
    this.updateNuke();

    for (const w of this.wusels) this.updateWusel(w);

    this.checkEnd();
  }

  private merken(): void {
    this.schnappschuesse.push({
      tick: this.tickCount,
      mat: this.terrain.mat.slice(),
      fresh: this.terrain.fresh.slice(),
      wusels: this.wusels.map((w) => ({ ...w })),
      skills: { ...this.skills },
      released: this.released,
      saved: this.saved,
      dead: this.dead,
      skillsUsed: this.skillsUsed,
      hatchOpen: this.hatchOpen,
      nuking: this.nuking,
      releaseCountdown: this.releaseCountdown,
      nukeCursor: this.nukeCursor,
      nukeTimer: this.nukeTimer,
      nextId: this.nextId,
      releaseRate: this.releaseRate,
    });
    if (this.schnappschuesse.length > RUECKLAUF_TIEFE) this.schnappschuesse.shift();
  }

  /**
   * Wie weit es zurueckgeht, wenn jetzt zurueckgespult wuerde — in Ticks.
   *
   * Null heisst: kein Schnappschuss, der Knopf ist tot. Der Zeichner braucht
   * das fuer den ausgegrauten Zustand, und er soll dafuer nicht selbst in den
   * Ring greifen.
   */
  get ruecklaufWeite(): number {
    const s = this.zielSchnappschuss();
    return s ? this.tickCount - s.tick : 0;
  }

  private zielSchnappschuss(): Schnappschuss | null {
    if (this.schnappschuesse.length === 0) return null;
    const zielTick = this.tickCount - RUECKLAUF_SPRUNG;
    // Den juengsten, der alt genug ist — sonst den aeltesten, den es gibt.
    for (let i = this.schnappschuesse.length - 1; i >= 0; i--) {
      if (this.schnappschuesse[i].tick <= zielTick) return this.schnappschuesse[i];
    }
    const aeltester = this.schnappschuesse[0];
    // Ein Sprung um nichts ist kein Sprung: Direkt nach einem Schnappschuss
    // waere „zurueck" sonst ein Standbild.
    return aeltester.tick < this.tickCount ? aeltester : null;
  }

  /**
   * Zehn Sekunden zurueck — oder so weit, wie es Schnappschuesse gibt.
   *
   * ## Warum das vollstaendig ist
   *
   * Alles, was `stateHash()` kennt, steht im Schnappschuss, und der
   * Determinismus-Test haelt beide aneinander fest: wiederherstellen und
   * weiterlaufen muss denselben Hash ergeben wie durchlaufen. Ereignisse
   * werden verworfen — sie sind Ausgabe, kein Zustand.
   *
   * Auch nach einer Niederlage erlaubt: Die Phase ist aus den Zaehlern
   * abgeleitet und wird schlicht wieder `running`. Wer den Fehler **gesehen**
   * hat, darf ihn zuruecknehmen — genau dafuer ist der Ruecklauf da.
   */
  zurueck(): boolean {
    const s = this.zielSchnappschuss();
    if (!s) return false;
    this.terrain.mat.set(s.mat);
    this.terrain.fresh.set(s.fresh);
    this.terrain.markAllDirty();
    this.wusels = s.wusels.map((w) => ({ ...w }));
    this.skills = { ...s.skills };
    this.tickCount = s.tick;
    this.released = s.released;
    this.saved = s.saved;
    this.dead = s.dead;
    this.skillsUsed = s.skillsUsed;
    this.hatchOpen = s.hatchOpen;
    this.nuking = s.nuking;
    this.releaseCountdown = s.releaseCountdown;
    this.nukeCursor = s.nukeCursor;
    this.nukeTimer = s.nukeTimer;
    this.nextId = s.nextId;
    this.releaseRate = s.releaseRate;
    this.phase = 'running';
    this.events = [];
    // Alles ab hier ist eine andere Zukunft: Schnappschuesse aus der alten
    // verwerfen, sonst spraenge der naechste Ruecklauf **vorwaerts**.
    this.schnappschuesse = this.schnappschuesse.filter((x) => x.tick < s.tick);
    return true;
  }

  private updateHatch(): void {
    if (this.releaseCountdown > 0) {
      this.releaseCountdown--;
      if (this.releaseCountdown === 0) {
        this.hatchOpen = true;
        // Das erste Ereignis jeder Runde, bisher stumm (Kritik S4).
        this.emit({ type: 'hatch', x: this.entrance.x, y: this.entrance.y });
      }
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
      vormerk: null,
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
    // Wer noch springt oder stirbt, darf zu Ende springen und sterben.
    //
    // Ohne diese Zeile fror die **letzte** Figur mitten in der Bewegung ein,
    // und zwar immer: Mit dem Sprung ins Tor ist sie nicht mehr aktiv, damit
    // war `activeCount` null, die Phase kippte im selben Tick — und `tick()`
    // kehrt bei gekippter Phase sofort zurueck. Der Zeitpunkt, an dem das
    // Ende feststeht, und der Zeitpunkt, an dem es eintritt, sind zweierlei:
    // Die Retterin stand den ganzen Vorhang lang reglos vor dem Tor, der
    // Sprengmeister hockte neben seinem eigenen Krater. Das Ende wartet jetzt
    // die knappe halbe Sekunde, die ein Abgang dauert — am Ausgang aendert
    // das nichts, nur am Bild.
    if (this.wusels.some((w) => w.state === State.SAVING || w.state === State.DYING)) return;
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

  /**
   * Gerettet wird, wer **ganz** in der Tuer steht.
   *
   * Vorher zaehlte jede Ueberdeckung mit dem Ausgangsrechteck. Das ist
   * rechnerisch bequem und sieht falsch aus: Die Simulation fuehrt eine Figur
   * als eine Spalte, gezeichnet wird sie neun Bildpunkte breit — beim ersten
   * beruehrten Bildpunkt der Oeffnung stand also fast der ganze Koerper noch
   * daneben. Man sah keine Figur hineingehen, sondern eine, die am Torpfosten
   * verschwindet.
   *
   * Der Rand ist deshalb ihre halbe Breite (`EXIT_RAND`) und keine feste Zahl
   * und kein Anteil der Torbreite. Ein Anteil waere hier der naheliegende und
   * falsche Weg: Er haette breite Tore streng gemacht und beim Fallen durch
   * einen gegrabenen Schacht die Tormitte erzwungen — ein Schacht darf aber
   * neben der Mitte liegen.
   *
   * Die Deckelung auf `(e.w - 1) / 2` haelt schmale Tore passierbar. Ohne sie
   * haette ein Tor von vier Bildpunkten Breite gar keinen Durchgang mehr, und
   * das Level waere unloesbar, ohne dass man saehe, warum.
   */
  private checkExit(w: Wusel): boolean {
    if (w.state === State.BLOCKING) return false;
    const e = this.exit;
    const rand = Math.min(C.EXIT_RAND, Math.floor((e.w - 1) / 2));
    if (w.x < e.x + rand || w.x >= e.x + e.w - rand) return false;
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

  /**
   * Steht in Blickrichtung eine Wand nah genug fuer den Rammer?
   *
   * Dieselbe Pruefung, mit der der Rammer sein Ende erkennt („durchgebrochen"),
   * nur andersherum gelesen: Was ihn aufhoeren laesst, laesst die Vormerkung
   * anfangen. Eine dritte, eigene Reichweite gaebe nur eine dritte Wahrheit.
   */
  private wandInReichweite(w: Wusel): boolean {
    const lx = this.aheadX(w, 1, C.BASH_LOOK);
    // Nur der obere Teil des Koerpers zaehlt: Eine Stufe, die man
    // hinaufsteigen kann (MAX_STEP), ist keine Wand. Ohne diese Grenze
    // meldete jeder Zwei-Punkte-Huckel des rauen Bodens „Wand in
    // Reichweite" — die direkte Zuweisung rammte den Huckel, die
    // Vormerkung verpuffte daran, und die eigentliche Wand blieb stehen.
    return this.terrain.hasSolid(
      lx,
      w.y - C.WUSEL_H + 1,
      C.BASH_LOOK,
      C.WUSEL_H - C.MAX_STEP - 1,
    );
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
      // Nur fuer den Ton: der haeufigste sichtbare Abprall des Spiels war
      // stumm (Kritik S4). Kein Zustand, nicht im Hash.
      this.emit({ type: 'bounce', x: w.x, y: w.y });
      return;
    }

    // Die Vormerkung greift, sobald ihre Gelegenheit da ist. Was als Wand
    // zaehlt, entscheidet `wandInReichweite` — und zwar streng: siehe dort.
    if (w.vormerk === 'basher' && this.wandInReichweite(w)) {
      w.vormerk = null;
      this.setState(w, State.BASHING);
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
      // Das Aufkommen. Erst ab ein paar Bildpunkten — das Absacken hinter
      // einem Graeber ist kein Sturz — und nicht am Schirm: Wer schwebt,
      // landet weich, und weich ist still. `n` traegt die Fallhoehe, damit
      // der Ton weiss, wie schwer er sein darf.
      if (!floating && w.fallDist >= C.LAND_LAUT) {
        this.emit({ type: 'land', x: w.x, y: w.y, n: w.fallDist });
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
    // Der Schrei im freien Fall. Die Schwelle liegt **hinter** dem Schirm
    // (`FLOAT_DEPLOY` ist 10): Ein Schirmspringer schreit nie, sein Schirm ist
    // schneller. Alle anderen wissen ab hier, dass das kein Absacken mehr ist.
    if (w.fallDist === C.SCHREI_AB && !w.hasFloater) {
      this.emit({ type: 'scream', x: w.x, y: w.y });
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
      mix(
        (w.hasClimber ? 1 : 0) |
          (w.hasFloater ? 2 : 0) |
          (w.isBlocker ? 4 : 0) |
          (w.vormerk ? 8 : 0),
      );
    }
    for (const s of SKILLS) mix(this.skills[s]);
    const m = this.terrain.mat;
    for (let i = 0; i < m.length; i += 7) mix(m[i] * (i + 1));
    return h >>> 0;
  }
}
