import {
  BOMB_FUSE_TICKS,
  FOCUS_DEN,
  FOCUS_NUM,
  MS_PER_TICK,
  RATE_MAX,
  RATE_MIN,
  TICK_HZ,
  WUSEL_H,
} from './core/constants';
import { isActive } from './core/skills';
import { State, type SkillId, type Wusel } from './core/types';
import type { World } from './core/world';
import { LEVELS } from './levels';
import { createWorld } from './levels/createWorld';
import type { LevelDef } from './levels/types';
import {
  fanPick,
  fanSlots,
  findCandidates,
  needsFan,
  FAN_MAX,
  type Candidate,
} from './input/targeting';
import { Camera, sx, sy, toLogical, ZOOM_MAX, ZOOM_MIN, type View } from './render/camera';
import { COL, drawControls, drawRecenter, drawRewind, drawTopBar, STERN_ABSTAND, STERN_EINSATZ } from './render/hud';
import { computeLayout, inBox, type Layout } from './render/layout';
import { drawMagnifier, magnifierCenter } from './render/magnifier';
import { drawIntro, drawPause, drawResult, type Button } from './render/overlays';
import { drawMinimap, minimapBox, minimapToLogical } from './render/minimap';
import { drawOffscreenMarkers } from './render/offscreen';
import { DEFAULT_MANIFEST, SpriteAtlas, loadImage } from './render/atlas';
import { renderTemplateAtlas } from './render/atlasTemplate';
import { findAtlasSource } from './art';
import { Scene } from './render/scene';
import { TerrainView } from './render/terrainView';
import { loadProgress, recordResult, starConditions, type Progress } from './storage';
import type { KartenPunkt } from './levels/welten';
import { wanderung, weltkarte, werkzeugeFuer, zeitlimitFuer } from './progression';
import { drawWeltkarte, type KarteTreffer } from './render/weltkarte';
import { GameAudio } from './audio';

/**
 * Wie weit ein Finger auf der Karte wandern darf, damit es noch ein Antippen
 * ist. Grosszuegiger als im Spielfeld, weil hier nichts Schlimmes passiert,
 * wenn man daneben trifft — ausser dass ein Level startet, das man nicht
 * wollte. Genau deshalb ist die Grenze nicht noch grosszuegiger.
 */
const KARTE_TIPP = 14;
/** Stationen je Sekunde bei der Wanderung. */
const KARTE_TEMPO = 1.6;

type Screen = 'menu' | 'play';
type Phase = 'intro' | 'running' | 'paused' | 'result';

/**
 * Ab wie vielen Bildschirmpixeln ein Ziehen als Schwenken zählt.
 *
 * Klein gehalten: Wer schieben will, merkt sofort, dass es geht. Wer zielt,
 * hat ohnehin eine Figur unter dem Finger und ist von dieser Grenze gar nicht
 * betroffen — sie greift nur über leerem Grund.
 */
const PAN_SCHWELLE = 10;
/**
 * Dieselbe Schwelle, wenn die Geste auf einer Figur begann.
 *
 * Deutlich grösser, damit das Nachzielen von einer Figur zur nächsten nicht
 * unterwegs zum Schwenken wird — dazwischen liegt regelmässig leerer Grund.
 */
const PAN_SCHWELLE_ZIEL = 44;

/**
 * Untergrenze des Nachspiels in Sekunden — auch ohne Partikel.
 *
 * Ein gewonnenes Level endet oft still: Die letzte Figur geht durch die Tuer,
 * und das war es. Faellt der Vorhang im selben Bild, wirkt es wie ein Abbruch.
 * Ein halber Atemzug reicht, damit man den letzten Zustand noch sieht.
 */
const NACHSPIEL_MIN = 0.5;
/**
 * Obergrenze des Nachspiels in Sekunden.
 *
 * Der Explosionsrauch steht 1,1 s (`PARTIKEL_MS.explosionRauch`), und bei einer
 * Selbstzerstoerung zuenden die Figuren nacheinander — der letzte Rauch kann
 * also spaet kommen. Zwei Sekunden reichen fuer den Feuerball und den Beginn
 * des Rauchs; darueber hinaus zu warten hiesse, jemanden vor stehendem Rauch
 * festzuhalten.
 */
const NACHSPIEL_MAX = 2;

interface PointerState {
  id: number;
  x: number;
  y: number;
  startX: number;
  startY: number;
  role: 'aim' | 'rate' | 'ui' | 'pinch' | 'map' | 'pan';
  /** Lag beim Aufsetzen eine gültige Figur im Fangradius? */
  traf?: boolean;
}

export class Game {
  private ctx: CanvasRenderingContext2D;
  private layout: Layout;
  private dpr = 1;

  private screen: Screen = 'menu';
  private phase: Phase = 'intro';
  private progress: Progress;

  private level!: LevelDef;
  private world!: World;
  private terrainView!: TerrainView;
  private scene!: Scene;
  private camera!: Camera;

  private audio = new GameAudio();
  private atlas: SpriteAtlas | null = null;
  private selected: SkillId | null = null;
  private conditions: boolean[] = [false, false, false];

  private pointers = new Map<number, PointerState>();
  private aim: PointerState | null = null;
  private fan: Candidate[] | null = null;
  private fanIndex = 0;
  private target: Wusel | null = null;
  private pinchDist = 0;
  private pinchZoom = 1;

  private buttons: Button[] = [];
  // --- Übersichtskarte ------------------------------------------------------
  /** Linke Kante des Kartenausschnitts, in Bildschirmbreiten. */
  private karteX = 0;
  /** Wohin die Karte gleiten soll. Sie folgt weich, statt zu springen. */
  private karteZiel = 0;
  private karteTreffer: KarteTreffer[] = [];
  /**
   * Die laufende Wanderung der Figur.
   *
   * Sie ist der Grund, warum der Kartenbildschirm einen eigenen Zustand
   * braucht: Nach einem gewonnenen Level soll man **sehen**, dass es
   * weitergeht — die Figur läuft zum nächsten Punkt, Laternen gehen an, ein Tor
   * öffnet sich. Ein Kartenbild, das nach dem Sieg einfach anders aussieht,
   * verschenkt genau diesen Moment.
   */
  private wanderWeg: KartenPunkt[] = [];
  private wanderT = 0;
  /** Stand vor dem letzten Levelende — Ausgangspunkt der Wanderung. */
  private standVorher: Progress = {};
  /**
   * Nachspiel: Sekunden, die zwischen dem Ende der Simulation und dem
   * Ergebnisbild noch vergehen. `-1` heisst „laeuft nicht".
   *
   * ## Warum es das gibt
   *
   * Ohne diese Uhr sah man die Selbstzerstoerung **nie**. Der Ablauf war:
   * letzte Figur zuendet, explodiert, ist tot — und im selben Bild steht
   * `activeCount` auf null, `World.checkEnd` setzt die Phase, und das
   * Ergebnisbild legt sich ueber den Feuerball. Das lauteste Ereignis des
   * Spiels fand hinter einem Vorhang statt, der genau in dem Moment fiel, in
   * dem es losging.
   *
   * Dass es niemandem auffiel, hat denselben Grund wie bei den zu kurzen
   * Partikeln (`render/schutt.ts`): Was gar nicht zu sehen ist, sieht nicht
   * falsch aus. Man haelt die Sprengung fuer wirkungslos.
   *
   * Die Uhr laeuft nicht fest ab, sondern **nach dem Bild**: Sie wartet, bis
   * keine Partikel mehr fliegen, mit einer Untergrenze (auch ein stiller Sieg
   * braucht einen Atemzug) und einer Obergrenze (Rauch, der lange steht, darf
   * niemanden festhalten).
   */
  private nachspiel = -1;
  /** Wo die Lupe hinsieht, in logischen Koordinaten — weich gefuehrt. */
  private lupeX: number | null = null;
  private lupeY = 0;
  /** Kurzlebige Leerringe an Fehltipp-Stellen. */
  private fehltipps: { x: number; y: number; bis: number }[] = [];
  /** Wann die aktuelle Phase begann — fuer Einblendungen und Sternauftritte. */
  private phaseSeitMs = 0;
  private zuletztGezeichnetePhase: Phase | null = null;
  /** Wie viele Sterne schon geklungen haben (je Ergebnisbild). */
  private sterneGeklungen = 0;
  private simAcc = 0;
  private anim = 0;
  /** Zuletzt hoerbar gemachte Raste des Reglers; -1 heisst "noch keine". */
  private rateStufe = -1;
  private lastMs = 0;

  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('2D-Kontext nicht verfügbar');
    this.ctx = ctx;
    this.progress = loadProgress();
    this.layout = computeLayout(1, 1);
    this.resize();

    window.addEventListener('resize', () => this.resize());
    canvas.addEventListener('pointerdown', (e) => this.onDown(e));
    canvas.addEventListener('pointermove', (e) => this.onMove(e));
    canvas.addEventListener('pointerup', (e) => this.onUp(e));
    canvas.addEventListener('pointercancel', (e) => this.onUp(e));
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    void this.initArt();
  }

  /**
   * Sucht ein Sprite-Blatt in src/art. Findet sich keines oder lädt es nicht,
   * bleibt `atlas` null und alles wird prozedural gezeichnet — das Spiel ist
   * nie auf Grafikdateien angewiesen.
   */
  private async initArt(): Promise<void> {
    const src = findAtlasSource();
    if (!src) return;
    const img = await loadImage(src.url);
    if (!img) return;
    this.atlas = new SpriteAtlas(img, src.manifest);
    if (this.scene) this.scene.atlas = this.atlas;
  }

  start(): void {
    this.lastMs = performance.now();
    const loop = (now: number) => {
      this.frame(now);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  // --- Aufbau --------------------------------------------------------------

  private resize(): void {
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.canvas.width = Math.round(w * this.dpr);
    this.canvas.height = Math.round(h * this.dpr);
    this.layout = computeLayout(w, h);
  }

  loadLevel(level: LevelDef): void {
    // Die Belohnungen wirken **beim Laden**, nicht in der Simulation. Das ist
    // die Trennung, an der der Determinismus haengt: Die Welt bekommt fertige
    // Zahlen und weiss nichts von Fortschritt.
    this.level = {
      ...level,
      skills: werkzeugeFuer(level, this.progress),
      timeLimitSec: zeitlimitFuer(level, this.progress),
    };
    level = this.level;
    this.world = createWorld(level);
    this.terrainView = new TerrainView(this.world.terrain, level.theme);
    this.scene = new Scene(level, this.terrainView);
    this.scene.atlas = this.atlas;
    this.camera = new Camera(level.width, level.height, level.entrance.x, level.entrance.y + 40);
    this.audio.setTheme(level.theme);
    // Die Musik laeuft aus der Karte weiter — im Vorspann in Kartenbesetzung,
    // mit dem Start kommt das volle Arrangement. Abgerissen wird nicht mehr.
    this.audio.setBesetzung('karte');
    this.selected = null;
    this.screen = 'play';
    this.phase = 'intro';
    this.simAcc = 0;
    this.nachspiel = -1;
    this.clearAim();
  }

  /**
   * Zur Übersichtskarte.
   *
   * Sie ist an die Stelle der alten Levelliste getreten. Der Ausschnitt springt
   * dabei nicht: Er wird auf die Figur gesetzt, wenn man von aussen kommt, und
   * bleibt stehen, wenn man schon dort war und nur zurückblättert.
   */
  /**
   * Zehn Sekunden zurueck — der Spielzug gegen den Fehltipp.
   *
   * Die Simulation stellt sich selbst wieder her (`World.zurueck`); hier steht
   * nur, was die **Darstellung** danach vergessen muss: die gemerkten Posen
   * der Figuren (sonst zuckt jede beim Sprung in ihre Vergangenheit) und die
   * Ereignisse des alten Zeitstrangs. Die Kamera bleibt, wo sie ist — wer
   * zurueckspult, will genau die Stelle noch einmal sehen, die er ansieht.
   */
  private zeitZurueck(): void {
    if (!this.world.zurueck()) return;
    // `klarstellen` vergisst auch die gemerkten Posen (ansicht.ts) — sonst
    // zuckt jede Figur beim Sprung in ihre eigene Vergangenheit.
    this.scene.klarstellen();
    this.audio.zurueckgespult();
  }

  private toMenu(zentrieren = true): void {
    // Zurueck auf der Karte: reduzierte Besetzung, und falls die Musik nach
    // einem Levelende steht (die Fanfare wollte Platz), faengt sie wieder an.
    this.audio.setBesetzung('karte');
    this.audio.startMusic();
    this.progress = loadProgress();
    this.screen = 'menu';
    if (zentrieren) {
      this.karteZiel = this.karteMitte();
      this.karteX = this.karteZiel;
    }
    this.clearAim();
  }

  /** Der Ausschnitt, in dem die Figur mittig steht — beschnitten aufs Band. */
  private karteMitte(): number {
    const k = weltkarte(this.progress);
    const ziel = k.figur ? k.figur.pos.x - 0.5 : 0;
    return this.karteGrenzen(ziel);
  }

  /** Hält den Ausschnitt auf dem Band. Rechts ist bei Bandbreite minus eins Schluss. */
  private karteGrenzen(x: number): number {
    const k = weltkarte(this.progress);
    return Math.max(0, Math.min(Math.max(0, k.bandBreite - 1), x));
  }

  /**
   * Ein Bild der Karte weiterdrehen.
   *
   * Zwei Dinge bewegen sich: die Figur auf ihrem Weg und der Ausschnitt, der
   * ihr folgt. Der Ausschnitt folgt **weich und nur, wenn er muss** — er zieht
   * erst nach, wenn die Figur aus der Mitte läuft. Eine Kamera, die dauernd
   * mitzieht, nimmt der Bewegung genau das Gefühl von Vorankommen, das sie
   * erzeugen soll.
   */
  private stepKarte(dt: number): void {
    if (this.wanderWeg.length >= 2) {
      this.wanderT += dt * KARTE_TEMPO;
      if (this.wanderT >= this.wanderWeg.length - 1) {
        this.wanderT = this.wanderWeg.length - 1;
        this.wanderWeg = [];
      }
      const f = this.figurAufDemWeg();
      if (f) {
        // Nachziehen erst ausserhalb des mittleren Drittels.
        const rel = f.x - this.karteX;
        if (rel > 0.66) this.karteZiel = this.karteGrenzen(f.x - 0.66);
        else if (rel < 0.34) this.karteZiel = this.karteGrenzen(f.x - 0.34);
      }
    }
    // Weich folgen. Der Faktor ist zeitbezogen, damit die Karte bei jedem
    // Bildtakt gleich schnell ankommt.
    const k = 1 - Math.pow(0.001, dt);
    this.karteX += (this.karteZiel - this.karteX) * k;
  }

  /** Wo die Figur gerade steht — auf dem Weg, sonst auf ihrem Punkt. */
  private figurAufDemWeg(): KartenPunkt | null {
    if (this.wanderWeg.length >= 2) {
      const i = Math.min(this.wanderWeg.length - 2, Math.floor(this.wanderT));
      const t = this.wanderT - i;
      const a = this.wanderWeg[i];
      const b = this.wanderWeg[i + 1];
      // Ein Bogen statt einer Geraden: Die Figur hüpft von Punkt zu Punkt,
      // statt zu gleiten. Das ist derselbe Grund wie bei allem anderen hier —
      // eine gerade Bewegung liest sich als Diagramm.
      const hoch = Math.sin(t * Math.PI) * 0.055;
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t - hoch };
    }
    const k = weltkarte(this.progress);
    return k.figur ? k.figur.pos : null;
  }

  /**
   * Die Wanderung starten, wenn sich durch das letzte Level etwas bewegt hat.
   *
   * Zwei Fälle sind ausdrücklich kein Anlass: ein verlorenes Level und ein
   * wiederholtes, das nichts Neues freischaltet. In beiden steht die Figur
   * schon dort, wo sie hingehört, und ein Weg von einem Punkt zu sich selbst
   * wäre eine Bewegung ohne Aussage.
   */
  private starteWanderung(): void {
    const w = wanderung(this.standVorher, this.progress);
    if (w.weg.length < 2) {
      this.wanderWeg = [];
      return;
    }
    this.wanderWeg = w.weg;
    this.wanderT = 0;
  }

  // --- Schleife ------------------------------------------------------------

  private frame(now: number): void {
    const dt = Math.min(0.05, (now - this.lastMs) / 1000);
    this.lastMs = now;
    this.anim += dt * 60;
    this.audio.beginFrame();

    if (this.screen === 'play') {
      if (this.phase === 'running') this.stepSim(dt);
      this.scene.update(dt);
      this.camera.update(dt, this.world);
      this.terrainView.sync();
      this.refreshTarget();
    } else {
      this.stepKarte(dt);
    }
    // Die Musik reagiert auf die Lage — knappe Zeit, alles gerettet, Pause.
    // Sie steht deshalb hier und nicht in der Tonschicht: Nur das Spiel weiss,
    // wie es gerade steht.
    if (this.screen === 'play') {
      // Der Ausgang klingt nur, solange er im Bild ist. Damit wird das
      // Schwenken hoerbar: Wer die Kamera zum Ziel fuehrt, hoert es kommen.
      // Bewusst ohne das Ruetteln aus `playView` — der Zufall dort gehoert zur
      // Darstellung und hat im Ton nichts zu suchen.
      const v = this.camera.view(this.layout.play);
      const ex = this.level.exit;
      this.audio.setAusgangHoerbar(
        ex.x + ex.w > v.ox &&
          ex.x < v.ox + v.box.w / v.scale &&
          ex.y + ex.h > v.oy &&
          ex.y < v.oy + v.box.h / v.scale,
      );

      // Die Schritte haengen an keinem Ereignis, sondern an der Anzahl: Das Ohr
      // trennt keine sechzig Fusspaare, es hoert eine Menge. Warum das die
      // bessere Loesung ist als ein Ereignis je Figur, steht bei `Sfx.schritte`.
      let laufende = 0;
      if (this.phase === 'running') {
        for (const w of this.world.wusels) {
          if (isActive(w) && w.state === State.WALKING) laufende++;
        }
      }
      this.audio.schritte(laufende, now);

      const grenze = this.level.timeLimitSec * TICK_HZ;
      const rest = this.world.timeLeftTicks;
      this.audio.update({
        restAnteil: grenze > 0 && isFinite(rest) ? rest / grenze : 1,
        restSekunden: isFinite(rest) ? rest / TICK_HZ : 999,
        alleGerettet: this.world.saved >= this.world.total && this.phase === 'running',
        pausiert: this.phase === 'paused',
        fokus: this.aim !== null && this.phase === 'running',
      });
    } else {
      this.audio.update();
    }
    this.render();
  }

  private stepSim(dt: number): void {
    // Fokuszeit (GDD §3.1): Finger auf dem Glas -> Viertelgeschwindigkeit.
    const focus = this.aim !== null;
    const speed = focus ? FOCUS_NUM / FOCUS_DEN : 1;
    this.simAcc += dt * 1000 * speed;
    let guard = 0;
    while (this.simAcc >= MS_PER_TICK && guard < 240) {
      this.world.tick();
      this.simAcc -= MS_PER_TICK;
      guard++;
    }
    this.dispatchEvents();
    if (this.world.phase !== 'running') this.nachspielen(dt);
  }

  /**
   * Der Vorhang faellt erst, wenn das Bild fertig ist.
   *
   * Die Simulation steht hier bereits — `World.tick` kehrt bei beendeter Phase
   * sofort zurueck. Was weiterlaeuft, ist allein die Darstellung: Partikel,
   * Ruettelbild, die letzten Toene. Genau die will man sehen.
   *
   * Gewartet wird nach dem, was noch fliegt, nicht nach einer festen Zahl. Bei
   * einer Selbstzerstoerung sind das gut zwei Sekunden Feuer und Rauch, bei
   * einem stillen Sieg ein halber Atemzug — und mehr braucht keiner von beiden.
   */
  private nachspielen(dt: number): void {
    if (this.nachspiel < 0) this.nachspiel = 0;
    this.nachspiel += dt;
    if (this.nachspiel < NACHSPIEL_MIN) return;
    const { anzahl } = this.scene.partikelStand;
    if (anzahl > 0 && this.nachspiel < NACHSPIEL_MAX) return;
    this.nachspiel = -1;
    this.finish();
  }

  /** Verteilt die Weltereignisse an Partikel, Ton und Haptik. */
  private dispatchEvents(): void {
    const events = this.world.drainEvents();
    if (events.length === 0) return;
    this.scene.spawnFromEvents(events);
    // Die Ortung: Bildschirmstelle des Ereignisses als Panorama, -1 bis 1.
    // Grabungen links klingen links (Kritik S3). Nur die Tonschicht sieht den
    // Wert — die Simulation kennt weiterhin keine Kamera.
    const v = this.camera.view(this.layout.play);
    const sichtbar = v.box.w / v.scale;
    const orten = (x: number) =>
      Math.max(-1, Math.min(1, (((x - v.ox) / sichtbar) * 2 - 1) * 0.9));
    this.audio.handle(events, performance.now(), orten);
  }

  private finish(): void {
    this.audio.stopMusic();
    this.conditions = starConditions(this.level, this.world);
    // Der Stand *vor* diesem Versuch, denn `recordResult` schreibt ihn gleich
    // fort. Danach waere jeder Durchgang ein neuer Bestwert.
    const vorher = this.progress[this.level.id];
    // Derselbe Stand als Ganzes — daraus errechnet die Karte, welchen Weg die
    // Figur zurueckzulegen hat und welche Tore dabei aufgehen.
    this.standVorher = JSON.parse(JSON.stringify(this.progress)) as Progress;
    recordResult(this.level, this.world);
    this.progress = loadProgress();
    const gewonnen = this.world.saved >= this.world.needed;
    const alle = gewonnen && this.world.saved === this.level.total;
    const bestwert = gewonnen && this.conditions.filter(Boolean).length > (vorher?.stars ?? 0);
    this.audio.levelEnde(gewonnen, alle, bestwert);
    this.phase = 'result';
    this.clearAim();
  }

  // --- Zielen (GDD §3.3) ---------------------------------------------------

  private clearAim(): void {
    this.lupeX = null;
    this.aim = null;
    this.fan = null;
    this.fanIndex = 0;
    this.target = null;
    this.pointers.clear();
  }

  private playView(): View {
    const v = this.camera.view(this.layout.play);
    if (this.scene && this.scene.shake > 0) {
      const s = this.scene.shake * 5;
      v.ox += (Math.random() - 0.5) * s;
      v.oy += (Math.random() - 0.5) * s;
    }
    return v;
  }

  /** Hält das Ziel unter dem Finger aktuell, während die Simulation weiterläuft. */
  private refreshTarget(): void {
    if (!this.aim || !this.selected) {
      this.target = null;
      return;
    }
    if (this.fan) {
      const dx = this.aim.x - this.aim.startX;
      const dy = this.aim.y - this.aim.startY;
      this.fanIndex = fanPick(dx, dy, this.fan.length);
      const c = this.fan[this.fanIndex];
      this.target = c && this.world.canAssignTo(c.w, this.selected) ? c.w : null;
      return;
    }
    const p = toLogical(this.camera.view(this.layout.play), this.aim.x, this.aim.y);
    const cands = findCandidates(this.world, this.selected, p.x, p.y);
    this.target = cands.length ? cands[0].w : null;
  }

  private beginAim(ps: PointerState): void {
    this.aim = ps;
    this.fan = null;
    this.fanIndex = 0;
    ps.traf = false;
    if (!this.selected) return;
    const p = toLogical(this.camera.view(this.layout.play), ps.x, ps.y);
    const cands = findCandidates(this.world, this.selected, p.x, p.y);
    ps.traf = cands.length > 0;
    // Zwei gültige Kandidaten dicht beieinander: Auswahl-Fächer.
    if (needsFan(cands)) this.fan = cands.slice(0, FAN_MAX);
    this.refreshTarget();
  }

  private commitAim(): void {
    if (this.target && this.selected) {
      this.world.assign(this.target.id, this.selected);
      this.dispatchEvents();
    } else if (this.selected && this.aim && this.phase === 'running') {
      // Der Fehltipp bekommt eine Quittung (Kritik F3b). Vorher verpuffte er
      // voellig stumm — man wusste nicht, ob man daneben lag oder der Beruf
      // ungueltig war. Jetzt: ein kurzer Leerring an der Stelle und ein sehr
      // leiser Holzblock. Kein Fehlerton — falsch gemacht hat niemand etwas,
      // es war nur niemand da.
      const p = toLogical(this.camera.view(this.layout.play), this.aim.x, this.aim.y);
      this.fehltipps.push({ x: p.x, y: p.y, bis: performance.now() + 420 });
      this.audio.daneben();
    }
    this.aim = null;
    this.fan = null;
    this.target = null;
  }

  // --- Eingabe -------------------------------------------------------------

  private pos(e: PointerEvent): { x: number; y: number } {
    const r = this.canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  private onDown(e: PointerEvent): void {
    e.preventDefault();
    // Browser lassen Ton erst nach einer Nutzergeste zu.
    this.audio.unlock();
    this.canvas.setPointerCapture?.(e.pointerId);
    const { x, y } = this.pos(e);

    if (this.screen === 'menu') {
      // Die Karte hat Musik (Kritik S1): das Stueck der Welt in reduzierter
      // Besetzung. Sie kann erst mit der ersten Geste beginnen — vorher laesst
      // kein Browser Ton zu; genau deshalb steht das hier und nicht beim
      // Kartenaufbau.
      if (!this.audio.musicPlaying) {
        this.audio.setBesetzung('karte');
        this.audio.startMusic();
      }
      // Auf der Karte ist jede Berührung erst einmal ein Schub. Ob daraus ein
      // Antippen wird, entscheidet sich beim Loslassen — genauso wie im Spiel
      // beim Schwenken. Wer eine Liste antippen will, darf dabei nicht schon
      // versehentlich gescrollt haben.
      this.pointers.set(e.pointerId, {
        id: e.pointerId,
        x,
        y,
        startX: x,
        startY: y,
        role: 'pan',
      });
      return;
    }

    if (this.phase !== 'running') {
      const hit = this.buttons.find((b) => inBox(b, x, y));
      if (hit) this.onOverlayButton(hit.id);
      return;
    }
    // Im Nachspiel steht die Simulation schon, das Bild laeuft nur noch aus.
    // Ein Auftrag waere von hier an wirkungslos — er wuerde stumm verpuffen und
    // dabei ein Werkzeug verbrauchen.
    if (this.nachspiel >= 0) return;

    const L = this.layout;

    if (inBox(L.pauseBtn, x, y)) {
      this.phase = 'paused';
      this.audio.pauseKlang(true);
      this.audio.stopMusic();
      this.clearAim();
      return;
    }
    if (inBox(L.soundBtn, x, y)) {
      this.audio.toggleMute();
      return;
    }
    if (inBox(L.nukeBtn, x, y)) {
      this.world.nuke();
      // Der Ruf gehoert zum Knopf, nicht zu einem Weltereignis: Er faellt
      // einmal, wenn der Spieler alles aufgibt — nicht je Figur.
      this.audio.ohNo();
      // Der Countdown laeuft ueber die Zuendschnur der ersten Figur. Danach
      // uebernehmen die Explosionen selbst; ein Countdown ueber die ganze
      // gestaffelte Kette waere ein Ticken ohne Ziel.
      this.audio.selbstzerstoerung(BOMB_FUSE_TICKS / TICK_HZ);
      return;
    }
    if (!this.camera.follow && inBox(L.recenterBtn, x, y)) {
      this.camera.recenter();
      return;
    }
    if (inBox(L.rewindBtn, x, y)) {
      this.zeitZurueck();
      return;
    }
    if (inBox(L.rateSlider, x, y)) {
      const ps: PointerState = { id: e.pointerId, x, y, startX: x, startY: y, role: 'rate' };
      this.pointers.set(e.pointerId, ps);
      this.applyRate(y);
      return;
    }
    for (const b of L.skillButtons) {
      if (inBox(b, x, y)) {
        if (this.world.skills[b.id] > 0) {
          this.selected = this.selected === b.id ? null : b.id;
          // Beim Abwaehlen der Knopfklang, beim Waehlen der Werkzeugton: Der
          // eine sagt "verstanden", der andere sagt zusaetzlich, *was*.
          if (this.selected) this.audio.werkzeugGewaehlt(b.id);
          else this.audio.knopf();
        } else {
          this.audio.werkzeugFehlt();
        }
        this.pointers.set(e.pointerId, {
          id: e.pointerId,
          x,
          y,
          startX: x,
          startY: y,
          role: 'ui',
        });
        return;
      }
    }

    if (inBox(L.play, x, y)) {
      // Übersichtskarte hat Vorrang: Sie ist zugleich der Schieber.
      const map = minimapBox(L, this.level);
      if (map && inBox(map, x, y)) {
        const p = minimapToLogical(map, this.level, x, y);
        this.camera.centerOn(p.x, p.y);
        this.pointers.set(e.pointerId, {
          id: e.pointerId,
          x,
          y,
          startX: x,
          startY: y,
          role: 'map',
        });
        return;
      }

      const others = [...this.pointers.values()].filter((p) => p.role === 'aim' || p.role === 'pinch');
      const ps: PointerState = { id: e.pointerId, x, y, startX: x, startY: y, role: 'aim' };
      if (others.length >= 1) {
        // Zweiter Finger: Pinch-Zoom statt Zielen.
        ps.role = 'pinch';
        others[0].role = 'pinch';
        this.aim = null;
        this.fan = null;
        this.target = null;
        this.pointers.set(e.pointerId, ps);
        this.pinchDist = Math.hypot(others[0].x - x, others[0].y - y);
        this.pinchZoom = this.camera.zoom;
        return;
      }
      this.pointers.set(e.pointerId, ps);
      this.beginAim(ps);
    }
  }

  private onMove(e: PointerEvent): void {
    const ps = this.pointers.get(e.pointerId);
    if (!ps) return;
    const { x, y } = this.pos(e);
    const prevX = ps.x;
    const prevY = ps.y;
    ps.x = x;
    ps.y = y;

    if (this.screen === 'menu') {
      // Die Karte hat Musik (Kritik S1): das Stueck der Welt in reduzierter
      // Besetzung. Sie kann erst mit der ersten Geste beginnen — vorher laesst
      // kein Browser Ton zu; genau deshalb steht das hier und nicht beim
      // Kartenaufbau.
      if (!this.audio.musicPlaying) {
        this.audio.setBesetzung('karte');
        this.audio.startMusic();
      }
      // Eins zu eins: Der Punkt unter dem Finger bleibt unter dem Finger. Jede
      // andere Übersetzung fühlt sich nach Gummiband an.
      this.karteZiel = this.karteGrenzen(this.karteZiel - (x - prevX) / this.layout.cssW);
      this.karteX = this.karteZiel;
      return;
    }

    if (ps.role === 'rate') {
      this.applyRate(y);
      return;
    }
    if (ps.role === 'pinch') {
      const pair = [...this.pointers.values()].filter((p) => p.role === 'pinch');
      if (pair.length === 2) {
        const d = Math.hypot(pair[0].x - pair[1].x, pair[0].y - pair[1].y);
        if (this.pinchDist > 4) {
          this.camera.setZoom(
            Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, (this.pinchZoom * d) / this.pinchDist)),
          );
        }
        // Schwenken mit dem Mittelpunkt.
        const scale = this.camera.scaleFor(this.layout.play);
        this.camera.panBy((x - prevX) / scale / 2, (y - prevY) / scale / 2);
      }
      return;
    }
    if (ps.role === 'map') {
      const map = minimapBox(this.layout, this.level);
      if (map) {
        const p = minimapToLogical(map, this.level, x, y);
        this.camera.centerOn(p.x, p.y);
      }
      return;
    }
    if (ps.role === 'pan') {
      const scale = this.camera.scaleFor(this.layout.play);
      this.camera.panBy((x - prevX) / scale, (y - prevY) / scale);
      return;
    }
    if (ps.role === 'aim') {
      this.refreshTarget();

      /**
       * Wann aus dem Zielen ein Schwenken wird.
       *
       * Vorher hing das am gewählten Beruf: Mit Beruf blieb jedes Ziehen ein
       * Zielversuch, und Schieben ging nur noch über die Übersichtskarte oder
       * mit zwei Fingern. Das ist genau der Zustand, in dem man die meiste
       * Zeit spielt — der Beruf ist ja gewählt, weil man ihn gleich vergeben
       * will. Schieben war damit praktisch nicht erreichbar.
       *
       * Die Frage ist nicht "ist ein Beruf gewählt", sondern **womit die
       * Geste angefangen hat**:
       *
       * - **Auf leerem Grund begonnen** — dort war niemand zu treffen, also
       *   ist es ein Schwenken, sobald der Finger sich bewegt.
       * - **Auf einer Figur begonnen** — dann bleibt es ein Zielen, auch wenn
       *   der Finger unterwegs über Leeres streicht. Genau das tut man beim
       *   Nachzielen von einer Figur zur nächsten; würde dabei umgeschaltet,
       *   verlöre man die Zuweisung mitten in der Bewegung.
       * - Erst ein **langer** Zug über Leeres wird auch dann zum Schwenken.
       *   Der Fangradius ist grosszügig; wer knapp neben einer Figur ansetzt
       *   und dann weit zieht, meint ersichtlich das Bild und nicht sie.
       *
       * Der Auswahl-Fächer ist ausgenommen: Dort zeigt der Finger absichtlich
       * ins Leere, weil er auf einen aufgefächerten Kandidaten deutet.
       */
      const strecke = Math.hypot(x - ps.startX, y - ps.startY);
      const weit = strecke > (ps.traf ? PAN_SCHWELLE_ZIEL : PAN_SCHWELLE);
      if (weit && !this.fan && !this.target) {
        ps.role = 'pan';
        this.aim = null;
        this.target = null;
        // Die bereits zurückgelegte Strecke nachholen, statt sie zu
        // verschlucken: Sonst bleibt das Bild die ersten Millimeter stehen und
        // springt dann — das ist das, was sich wie "schiebt schlecht" anfühlt.
        const scale = this.camera.scaleFor(this.layout.play);
        this.camera.panBy((x - ps.startX) / scale, (y - ps.startY) / scale);
      }
    }
  }

  private onUp(e: PointerEvent): void {
    const ps = this.pointers.get(e.pointerId);
    this.pointers.delete(e.pointerId);
    if (!ps) return;

    if (this.screen === 'menu') {
      // Die Karte hat Musik (Kritik S1): das Stueck der Welt in reduzierter
      // Besetzung. Sie kann erst mit der ersten Geste beginnen — vorher laesst
      // kein Browser Ton zu; genau deshalb steht das hier und nicht beim
      // Kartenaufbau.
      if (!this.audio.musicPlaying) {
        this.audio.setBesetzung('karte');
        this.audio.startMusic();
      }
      // Erst hier entscheidet sich, ob es ein Antippen war. Wer mehr als eine
      // Fingerbreite gezogen hat, wollte scrollen — und ein Level, das man
      // beim Scrollen aus Versehen startet, ist der schlimmste Fehlgriff, den
      // ein Kartenbildschirm machen kann.
      const strecke = Math.hypot(ps.x - ps.startX, ps.y - ps.startY);
      if (strecke <= KARTE_TIPP) {
        const hit = this.karteTreffer.find((t) => t.offen && inBox(t, ps.x, ps.y));
        if (hit) {
          const lv = LEVELS.find((l) => l.id === hit.id);
          if (lv) {
            this.audio.knopf();
            this.loadLevel(lv);
          }
        }
      }
      return;
    }

    if (ps.role === 'aim' && this.aim && this.aim.id === ps.id) this.commitAim();
    if (ps.role === 'pinch') {
      const rest = [...this.pointers.values()].filter((p) => p.role === 'pinch');
      for (const r of rest) this.pointers.delete(r.id);
    }
  }

  private applyRate(y: number): void {
    const b = this.layout.rateSlider;
    const top = b.y + 22;
    const bottom = b.y + b.h - 20;
    const t = 1 - (y - top) / (bottom - top);
    this.world.setReleaseRate(RATE_MIN + t * (RATE_MAX - RATE_MIN));
    // Ein Klang je Raste, nicht je Bildpunkt — sonst schnarrt der Regler beim
    // Ziehen. Der erste Aufruf setzt nur den Stand: Das blosse Antippen des
    // Reglers ist noch keine Aenderung.
    const stufe = this.world.releaseRate;
    if (stufe !== this.rateStufe) {
      if (this.rateStufe >= 0) this.audio.tempo(stufe > this.rateStufe);
      this.rateStufe = stufe;
    }
  }

  private onOverlayButton(id: string): void {
    // Jeder Knopf einer Einblendung bestaetigt sich selbst. Ausnahme ist
    // `resume`: Dort sagt der Filter-Sweep schon, was passiert, und beides
    // uebereinander waere doppelt gemoppelt.
    if (id !== 'resume') this.audio.knopf();
    switch (id) {
      case 'start':
      case 'resume':
        this.phase = 'running';
        this.lastMs = performance.now();
        if (id === 'resume') this.audio.pauseKlang(false);
        // Kein Neustart, wenn die Karte schon spielt: Die Schleife laeuft
        // durch, nur Schlagwerk und Lauffigur kommen dazu. Der Uebergang
        // Karte -> Level ist damit ein Aufblenden statt eines Abrisses.
        this.audio.setBesetzung('voll');
        this.audio.startMusic();
        break;
      case 'restart':
      case 'retry':
        this.loadLevel(this.level);
        this.phase = 'running';
        this.audio.setBesetzung('voll');
        this.audio.startMusic();
        break;
      case 'next': {
        const i = LEVELS.findIndex((l) => l.id === this.level.id);
        const nxt = LEVELS[i + 1];
        if (nxt) {
          this.loadLevel(nxt);
        } else {
          this.toMenu();
        }
        break;
      }
      case 'menu':
        // Auf die Karte zurueck heisst: den Weg sehen, den man gerade gemacht
        // hat. Der Ausschnitt wird deshalb auf den *alten* Stand gesetzt und
        // die Figur laeuft von dort los — nicht umgekehrt.
        this.toMenu(false);
        this.karteX = this.karteZiel = this.karteGrenzen(
          (wanderung(this.standVorher, this.progress).von?.pos.x ?? this.karteMitte() + 0.5) - 0.5,
        );
        this.starteWanderung();
        break;
    }
  }

  // --- Zeichnen ------------------------------------------------------------

  private render(): void {
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.fillStyle = '#05070c';
    ctx.fillRect(0, 0, this.layout.cssW, this.layout.cssH);

    if (this.screen === 'menu') {
      // Die Karte hat Musik (Kritik S1): das Stueck der Welt in reduzierter
      // Besetzung. Sie kann erst mit der ersten Geste beginnen — vorher laesst
      // kein Browser Ton zu; genau deshalb steht das hier und nicht beim
      // Kartenaufbau.
      if (!this.audio.musicPlaying) {
        this.audio.setBesetzung('karte');
        this.audio.startMusic();
      }
      const laeuft = this.wanderWeg.length >= 2;
      const stand = this.figurAufDemWeg();
      // Blickrichtung: dorthin, wo es weitergeht. Beim Stehen nach rechts —
      // das ist die Richtung, in die das Band verläuft.
      let richtung: 1 | -1 = 1;
      if (laeuft) {
        const i = Math.min(this.wanderWeg.length - 2, Math.floor(this.wanderT));
        richtung = this.wanderWeg[i + 1].x >= this.wanderWeg[i].x ? 1 : -1;
      }
      this.karteTreffer = drawWeltkarte(ctx, this.layout, {
        karte: weltkarte(this.progress),
        kamera: this.karteX,
        figur: stand,
        laeuft,
        richtung,
        anim: this.anim,
        atlas: this.atlas,
      });
      this.buttons = [];
      return;
    }

    const view = this.playView();
    this.scene.draw(ctx, view, this.world, this.anim);
    this.drawAimOverlay(ctx, view);

    drawOffscreenMarkers(ctx, this.layout.play, view, this.world);
    const map = minimapBox(this.layout, this.level);
    if (map) {
      const grabbed = [...this.pointers.values()].some((p) => p.role === 'map');
      drawMinimap(
        ctx,
        map,
        this.level,
        this.world,
        this.terrainView.canvas,
        this.camera.view(this.layout.play),
        grabbed,
        this.layout.cssW > this.layout.cssH,
      );
    }

    // Die Leerringe der Fehltipps: kurz aufblitzend, auslaufend.
    if (this.fehltipps.length > 0) {
      const jetzt = performance.now();
      const v2 = this.camera.view(this.layout.play);
      this.fehltipps = this.fehltipps.filter((f) => f.bis > jetzt);
      for (const f of this.fehltipps) {
        const t = (f.bis - jetzt) / 420;
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 * t})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(sx(v2, f.x), sy(v2, f.y), 8 + (1 - t) * 10, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    drawTopBar(ctx, this.layout, this.hudState());
    drawControls(ctx, this.layout, this.hudState());
    if (!this.camera.follow) drawRecenter(ctx, this.layout);
    drawRewind(ctx, this.layout, this.world.ruecklaufWeite);

    if (this.aim) {
      const c = magnifierCenter(this.aim.x, this.aim.y, this.layout.play);
      // Im Fächer ist die Zugbewegung eine Auswahl, kein Zielen: die Lupe bleibt
      // auf der Figur, die gerade gewählt ist, statt dem Finger in den Himmel zu folgen.
      //
      // Und mit gefangenem Ziel folgt sie **dem Ziel**, nicht dem Finger. Die
      // Kritik (F3a) zeigte eine Lupe voll leeren Grases bei gueltigem Ziel:
      // Der Finger stand still, die Figur lief aus dem Ausschnitt. Weich
      // gefuehrt, damit ein Zielwechsel ein Schwenk ist und kein Schnitt.
      const wunsch =
        this.target
          ? { x: this.target.x, y: this.target.y - WUSEL_H / 2 }
          : toLogical(this.camera.view(this.layout.play), this.aim.x, this.aim.y);
      if (this.lupeX === null) {
        this.lupeX = wunsch.x;
        this.lupeY = wunsch.y;
      } else {
        this.lupeX += (wunsch.x - this.lupeX) * 0.28;
        this.lupeY += (wunsch.y - this.lupeY) * 0.28;
      }
      const p = { x: this.lupeX, y: this.lupeY };
      drawMagnifier(
        ctx,
        this.scene,
        this.world,
        view,
        this.anim,
        p.x,
        p.y,
        c,
        this.target,
      );
    }

    this.buttons = [];
    // Tafeln erscheinen nicht, sie treten auf: kurz durchsichtig und ein paar
    // Punkte tiefer, dann stehen sie. Die Uhr dafuer beginnt mit dem
    // Phasenwechsel — hier gemessen statt an jedem Wechsel gesetzt, weil die
    // Phase an fuenf Stellen wechselt und keine davon vergessen werden darf.
    if (this.phase !== this.zuletztGezeichnetePhase) {
      this.zuletztGezeichnetePhase = this.phase;
      this.phaseSeitMs = performance.now();
      this.sterneGeklungen = 0;
    }
    const seit = (performance.now() - this.phaseSeitMs) / 1000;
    const auftritt = Math.min(1, seit / 0.26);
    if (this.phase !== 'running') {
      ctx.save();
      ctx.globalAlpha = auftritt;
      ctx.translate(0, (1 - auftritt) * 26);
    }
    if (this.phase === 'intro') this.buttons = drawIntro(ctx, this.layout, this.level);
    else if (this.phase === 'paused') this.buttons = drawPause(ctx, this.layout);
    else if (this.phase === 'result') {
      const parKnown = (this.progress[this.level.id]?.won ?? false) || this.world.saved >= this.world.needed;
      const i = LEVELS.findIndex((l) => l.id === this.level.id);
      this.buttons = drawResult(
        ctx,
        this.layout,
        this.level,
        this.world,
        this.conditions,
        parKnown,
        i + 1 < LEVELS.length,
        seit,
      );
      // Jeder Stern klingt in dem Moment, in dem er ploppt — dasselbe Pling
      // wie im Spiel, drei Stufen steigend (Kritik G8 und S4 in einem).
      const verdient = this.conditions.filter(Boolean).length;
      const faellig = Math.max(
        0,
        Math.min(verdient, Math.floor((seit - STERN_EINSATZ) / STERN_ABSTAND) + 1),
      );
      while (this.sterneGeklungen < faellig) {
        this.audio.stern(this.sterneGeklungen);
        this.sterneGeklungen++;
      }
    }
    if (this.phase !== 'running') ctx.restore();
  }

  private hudState() {
    return {
      level: this.level,
      world: this.world,
      selected: this.selected,
      showPar: this.progress[this.level.id]?.won ?? false,
      cameraFollow: this.camera.follow,
      muted: this.audio.muted,
    };
  }

  // --- Diagnose für die automatisierte Sichtprobe --------------------------

  debugStats() {
    return {
      screen: this.screen,
      phase: this.phase,
      level: this.level?.id ?? null,
      released: this.world?.released ?? 0,
      saved: this.world?.saved ?? 0,
      dead: this.world?.dead ?? 0,
      skillsUsed: this.world?.skillsUsed ?? 0,
      selected: this.selected,
      wusels: this.world?.activeCount ?? 0,
      diggerX:
        this.world?.wusels.find((w) => w.state === State.DIGGING)?.x ?? null,
    };
  }

  /** Bildschirmposition einer laufenden Figur im gewünschten Streifen. */
  debugWalkerScreenPos(loX = -Infinity, hiX = Infinity): { x: number; y: number } | null {
    if (this.screen !== 'play') return null;
    const v = this.camera.view(this.layout.play);
    const w = this.world.wusels.find(
      (x) => x.state === State.WALKING && x.x >= loX && x.x <= hiX,
    );
    if (!w) return null;
    return { x: sx(v, w.x), y: sy(v, w.y - WUSEL_H / 2) };
  }

  debugAudio() {
    return this.audio.debugState();
  }

  debugToggleSound(): boolean {
    return this.audio.toggleMute();
  }

  /**
   * Springt an eine Levelstelle — dasselbe, was ein Tipp auf die
   * Übersichtskarte tut. Die automatische Kamera bleibt dabei aus, sonst
   * gleitet das Bild sofort wieder zum Pulk zurück.
   */
  debugCenterOn(x: number, y: number): void {
    this.camera.centerOn(x, y);
  }

  debugRecenter(): void {
    this.camera.recenter();
  }

  debugArt(): { atlas: boolean; clips: number } {
    return {
      atlas: this.atlas !== null,
      clips: this.atlas ? Object.keys(this.atlas.manifest.clips).length : 0,
    };
  }

  /** Baut das Blatt aus dem prozeduralen Zeichner und schaltet darauf um. */
  debugUseTemplateAtlas(): boolean {
    const canvas = renderTemplateAtlas();
    this.atlas = new SpriteAtlas(canvas, DEFAULT_MANIFEST);
    if (this.scene) this.scene.atlas = this.atlas;
    return true;
  }

  /** Holt das ausgelieferte Blatt zurueck — Gegenstueck zu den beiden darueber. */
  async debugReloadAtlas(): Promise<boolean> {
    this.atlas = null;
    await this.initArt();
    if (this.scene) this.scene.atlas = this.atlas;
    return this.atlas !== null;
  }

  debugClearAtlas(): void {
    this.atlas = null;
    if (this.scene) this.scene.atlas = null;
  }

  /** Vorlage als Bilddaten — die Grundlage von `npm run atlas:template`. */
  debugTemplatePng(): { png: string; manifest: unknown } {
    return {
      png: renderTemplateAtlas().toDataURL('image/png'),
      manifest: DEFAULT_MANIFEST,
    };
  }

  /** Die aktuell gezeichneten Knopfflächen — für lageunabhängige Prüfungen. */
  /**
   * Die Fläche eines Berufsknopfs.
   *
   * Damit niemand die Layoutformel nachbaut: Die Rauchprobe hat die Lage der
   * Knöpfe zweimal selbst ausgerechnet, und beim ersten Umbau der Leiste
   * stimmte die Kopie nicht mehr — sie tippte ins Leere und meldete einen
   * Fehler, der keiner war.
   */
  debugSkillButton(id: SkillId): { x: number; y: number; w: number; h: number } | null {
    const b = this.layout.skillButtons.find((s) => s.id === id);
    return b ? { x: b.x, y: b.y, w: b.w, h: b.h } : null;
  }

  debugButtons(): Button[] {
    return this.buttons.map((b) => ({ ...b }));
  }

  /**
   * Der Kartenpunkt eines Levels, so wie er gerade auf dem Bildschirm liegt.
   *
   * Für die Sichtprobe. Sie hat vorher feste Bildschirmkoordinaten angetippt —
   * das ging genau so lange gut, bis die Levelliste einer Karte gewichen ist,
   * und dann startete kein Level mehr, ohne dass eine Prüfung sagen konnte,
   * warum. Wer den Punkt wissen will, fragt das Spiel danach.
   */
  debugKartePunkt(id: string): { x: number; y: number; offen: boolean } | null {
    const t = this.karteTreffer.find((k) => k.id === id);
    return t ? { x: t.x + t.w / 2, y: t.y + t.h / 2, offen: t.offen } : null;
  }

  /**
   * Einen Beruf unmittelbar vergeben, ohne Zielen.
   *
   * Nur fuer die Sichtprobe. Ueber die Bedienung sind manche Posen kaum
   * herzustellen — ein Schraegbagger braucht die richtige Figur an der
   * richtigen Wand —, und ohne diesen Weg bliebe ihr Aussehen ungeprueft.
   * Genau das ist bei drei von vier Werkzeugen passiert.
   *
   * @param n Der wievielte laufende Wusling, ab 0.
   */
  debugAssign(skill: SkillId, n = 0): { x: number; y: number } | null {
    const frei = this.world.wusels.filter((w) => isActive(w) && w.state === State.WALKING);
    const w = frei[Math.min(n, frei.length - 1)];
    if (!w) return null;
    if (!this.world.assign(w.id, skill)) return null;
    // Die Stelle zurueckgeben, damit die Sichtprobe die Kamera dorthin fuehren
    // kann. Ohne sie muesste sie raten, und eine Figur, die aus dem Bild
    // laeuft, ist keine Pruefung.
    return { x: w.x, y: w.y };
  }

  /**
   * Einer Figur dicht an einer Stelle den Beruf geben — fuer Nahaufnahmen.
   *
   * `debugAssign` nimmt die n-te laufende Figur, und welche das ist, haengt am
   * Zufall des Augenblicks. Wer einen Schacht ueber der Tuer braucht, muss die
   * Figur nach ihrem **Ort** aussuchen.
   */
  debugAssignAt(x: number, skill: SkillId = 'digger', toleranz = 2): { x: number; y: number } | null {
    const nah = this.world.wusels
      .filter((w) => isActive(w) && w.state === State.WALKING && Math.abs(w.x - x) <= toleranz)
      .sort((a, b) => Math.abs(a.x - x) - Math.abs(b.x - x))[0];
    if (!nah || !this.world.assign(nah.id, skill)) return null;
    return { x: nah.x, y: nah.y };
  }

  /**
   * Ein Level unmittelbar laden, an der Freischaltung vorbei.
   *
   * Nur fuer die Sichtprobe. Die Berufe eines Levels stehen in seinen Daten;
   * wer den Rammer sehen will, braucht ein Level, das einen hergibt — und das
   * ist auf der Karte gesperrt, solange man es nicht erspielt hat. Ohne diesen
   * Weg pruefte man immer nur das erste Level.
   */
  debugLoadLevel(id: string): boolean {
    const lv = LEVELS.find((l) => l.id === id);
    if (!lv) return false;
    this.loadLevel(lv);
    return true;
  }

  /** Massstab setzen — die Sichtprobe kann nicht mit zwei Fingern zoomen. */
  debugZoom(z: number): void {
    this.camera.setZoom(z);
  }

  /**
   * Wie viele Partikel gerade leben und wie lange der aelteste noch bleibt.
   *
   * Fuer die Sichtprobe. Partikel sind zu klein und zu kurz, um sie auf einem
   * Standbild zu beurteilen — man kann nur zaehlen. Genau daran ist aufgefallen,
   * dass die Explosion nach acht Bildern vorbei war.
   */
  debugPartikel(): { anzahl: number; restMs: number } {
    return this.scene ? this.scene.partikelStand : { anzahl: 0, restMs: 0 };
  }

  /**
   * Der Stand des Nachspiels — die Wartezeit zwischen Simulationsende und
   * Ergebnisbild.
   *
   * Fuer die Sichtprobe, und aus demselben Grund wie `debugPartikel`: Ob eine
   * Sprengung zu sehen war, laesst sich nicht fotografieren. Man kann nur
   * pruefen, ob der Vorhang noch oben war, waehrend noch etwas flog. Genau das
   * war der gemeldete Fehler — das Ergebnisbild legte sich ueber den Feuerball.
   */
  debugNachspiel(): { laeuft: boolean; sekunden: number; weltphase: string } {
    return {
      laeuft: this.nachspiel >= 0,
      sekunden: Math.max(0, this.nachspiel),
      weltphase: this.world?.phase ?? 'kein Level',
    };
  }

  /** Selbstzerstoerung ausloesen — die Sichtprobe kann den Knopf nicht treffen. */
  debugNuke(): void {
    this.world?.nuke();
  }

  /** Wo der Sprengmeister mit der kuerzesten Zuendschnur gerade steht. */
  debugZuender(): { x: number; y: number; fuse: number } | null {
    let z: Wusel | null = null;
    for (const w of this.world.wusels) {
      if (w.fuse > 0 && (!z || w.fuse < z.fuse)) z = w;
    }
    return z ? { x: z.x, y: z.y, fuse: z.fuse } : null;
  }

  debugCamera(): { follow: boolean; cx: number; cy: number } {
    return { follow: this.camera.follow, cx: this.camera.cx, cy: this.camera.cy };
  }

  debugMinimapBox() {
    return minimapBox(this.layout, this.level);
  }

  debugTicks(): number {
    return this.world?.tickCount ?? 0;
  }

  /** Was liegt gerade unter dem Finger? Für die Fehlersuche beim Zielen. */
  debugAim(): {
    aim: boolean;
    rolle: string | null;
    ziel: number | null;
    faecher: number;
    kandidaten: number;
  } {
    let kandidaten = 0;
    if (this.aim && this.selected) {
      const p = toLogical(this.camera.view(this.layout.play), this.aim.x, this.aim.y);
      kandidaten = findCandidates(this.world, this.selected, p.x, p.y).length;
    }
    return {
      aim: this.aim !== null,
      rolle: this.aim ? (this.pointers.get(this.aim.id)?.role ?? null) : null,
      ziel: this.target ? this.target.id : null,
      faecher: this.fan ? this.fan.length : 0,
      kandidaten,
    };
  }

  debugFanSize(): number {
    return this.fan?.length ?? 0;
  }

  debugSetRate(r: number): void {
    this.world?.setReleaseRate(r);
  }

  /** Stelle, an der zwei Figuren dicht beieinander stehen — testet den Fächer. */
  debugCrowdScreenPos(): { x: number; y: number } | null {
    if (this.screen !== 'play' || !this.selected) return null;
    const v = this.camera.view(this.layout.play);
    const live = this.world.wusels.filter((w) => this.world.canAssignTo(w, this.selected!));
    for (let i = 0; i < live.length; i++) {
      for (let j = i + 1; j < live.length; j++) {
        const a = live[i];
        const b = live[j];
        if (Math.abs(a.x - b.x) > 9 || Math.abs(a.y - b.y) > 9) continue;
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2 - WUSEL_H / 2;
        return { x: sx(v, mx), y: sy(v, my) };
      }
    }
    return null;
  }

  private drawAimOverlay(ctx: CanvasRenderingContext2D, v: View): void {
    if (!this.aim) return;

    // Markierung der aktuell getroffenen Figur
    if (this.target) {
      const tx = sx(v, this.target.x);
      const ty = sy(v, this.target.y - WUSEL_H / 2);
      ctx.strokeStyle = COL.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(tx, ty, 15 + Math.sin(this.anim / 6) * 1.5, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (!this.fan) return;

    // Auswahl-Fächer: zieht dicht beieinanderstehende Figuren auseinander.
    const slots = fanSlots(this.fan.length);
    const ax = this.aim.startX;
    const ay = this.aim.startY;
    for (let i = 0; i < this.fan.length; i++) {
      const c = this.fan[i];
      const fx = ax + slots[i].dx;
      const fy = ay + slots[i].dy;
      const wx = sx(v, c.w.x);
      const wy = sy(v, c.w.y - WUSEL_H / 2);
      const active = i === this.fanIndex;

      ctx.strokeStyle = active ? 'rgba(255,210,63,0.85)' : 'rgba(220,230,245,0.28)';
      ctx.lineWidth = active ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(wx, wy);
      ctx.stroke();

      ctx.fillStyle = active ? '#24405c' : '#131a26';
      ctx.beginPath();
      ctx.arc(fx, fy, active ? 21 : 17, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = active ? COL.accent : COL.line;
      ctx.lineWidth = active ? 2 : 1;
      ctx.stroke();

      ctx.fillStyle = COL.text;
      ctx.font = active ? '700 13px system-ui, sans-serif' : '600 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(i + 1), fx, fy + 1);
    }
  }
}

/** Kleiner Helfer für Tests der Zielauswahl ohne DOM. */
export function pickTargetForTest(
  world: World,
  skill: SkillId,
  lx: number,
  ly: number,
): Wusel | null {
  const c = findCandidates(world, skill, lx, ly);
  return c.length ? c[0].w : null;
}

export { State };
