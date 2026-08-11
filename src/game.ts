import { FOCUS_DEN, FOCUS_NUM, MS_PER_TICK, RATE_MAX, RATE_MIN, WUSEL_H } from './core/constants';
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
import { COL, drawControls, drawRecenter, drawTopBar } from './render/hud';
import { computeLayout, inBox, type Layout } from './render/layout';
import { drawMagnifier, magnifierCenter } from './render/magnifier';
import { drawIntro, drawMenu, drawPause, drawResult, type Button } from './render/overlays';
import { drawMinimap, minimapBox, minimapToLogical } from './render/minimap';
import { drawOffscreenMarkers } from './render/offscreen';
import { DEFAULT_MANIFEST, SpriteAtlas, loadImage } from './render/atlas';
import { renderTemplateAtlas } from './render/atlasTemplate';
import { findAtlasSource } from './art';
import { Scene } from './render/scene';
import { TerrainView } from './render/terrainView';
import { loadProgress, recordResult, starConditions, type Progress } from './storage';
import { GameAudio } from './audio';

type Screen = 'menu' | 'play';
type Phase = 'intro' | 'running' | 'paused' | 'result';

interface PointerState {
  id: number;
  x: number;
  y: number;
  startX: number;
  startY: number;
  role: 'aim' | 'rate' | 'ui' | 'pinch' | 'map' | 'pan';
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
  private simAcc = 0;
  private anim = 0;
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
    this.level = level;
    this.world = createWorld(level);
    this.terrainView = new TerrainView(this.world.terrain, level.theme);
    this.scene = new Scene(level, this.terrainView);
    this.scene.atlas = this.atlas;
    this.camera = new Camera(level.width, level.height, level.entrance.x, level.entrance.y + 40);
    this.audio.setTheme(level.theme);
    this.audio.stopMusic();
    this.selected = null;
    this.screen = 'play';
    this.phase = 'intro';
    this.simAcc = 0;
    this.clearAim();
  }

  private toMenu(): void {
    this.audio.stopMusic();
    this.progress = loadProgress();
    this.screen = 'menu';
    this.clearAim();
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
    }
    this.audio.update();
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
    if (this.world.phase !== 'running') this.finish();
  }

  /** Verteilt die Weltereignisse an Partikel, Ton und Haptik. */
  private dispatchEvents(): void {
    const events = this.world.drainEvents();
    if (events.length === 0) return;
    this.scene.spawnFromEvents(events);
    this.audio.handle(events, performance.now());
  }

  private finish(): void {
    this.audio.stopMusic();
    this.conditions = starConditions(this.level, this.world);
    recordResult(this.level, this.world);
    this.progress = loadProgress();
    this.phase = 'result';
    this.clearAim();
  }

  // --- Zielen (GDD §3.3) ---------------------------------------------------

  private clearAim(): void {
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
    if (!this.selected) return;
    const p = toLogical(this.camera.view(this.layout.play), ps.x, ps.y);
    const cands = findCandidates(this.world, this.selected, p.x, p.y);
    // Zwei gültige Kandidaten dicht beieinander: Auswahl-Fächer.
    if (needsFan(cands)) this.fan = cands.slice(0, FAN_MAX);
    this.refreshTarget();
  }

  private commitAim(): void {
    if (this.target && this.selected) {
      this.world.assign(this.target.id, this.selected);
      this.dispatchEvents();
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
      const hit = this.buttons.find((b) => inBox(b, x, y));
      if (hit) {
        const lv = LEVELS.find((l) => l.id === hit.id);
        if (lv) this.loadLevel(lv);
      }
      return;
    }

    if (this.phase !== 'running') {
      const hit = this.buttons.find((b) => inBox(b, x, y));
      if (hit) this.onOverlayButton(hit.id);
      return;
    }

    const L = this.layout;

    if (inBox(L.pauseBtn, x, y)) {
      this.phase = 'paused';
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
      return;
    }
    if (!this.camera.follow && inBox(L.recenterBtn, x, y)) {
      this.camera.recenter();
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
      // Ohne gewählten Beruf gibt es nichts zu vergeben — dann wird aus dem
      // Ziehen ein Schwenken. Ein Finger genügt, wie §3.5 es verlangt.
      if (!this.selected && Math.hypot(x - ps.startX, y - ps.startY) > 14) {
        ps.role = 'pan';
        this.aim = null;
        this.target = null;
        return;
      }
      this.refreshTarget();
    }
  }

  private onUp(e: PointerEvent): void {
    const ps = this.pointers.get(e.pointerId);
    this.pointers.delete(e.pointerId);
    if (!ps) return;
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
  }

  private onOverlayButton(id: string): void {
    switch (id) {
      case 'start':
      case 'resume':
        this.phase = 'running';
        this.lastMs = performance.now();
        this.audio.startMusic();
        break;
      case 'restart':
      case 'retry':
        this.loadLevel(this.level);
        this.phase = 'running';
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
        this.toMenu();
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
      this.buttons = drawMenu(ctx, this.layout, LEVELS, this.progress);
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
      );
    }

    drawTopBar(ctx, this.layout, this.hudState());
    drawControls(ctx, this.layout, this.hudState());
    if (!this.camera.follow) drawRecenter(ctx, this.layout);

    if (this.aim) {
      const c = magnifierCenter(this.aim.x, this.aim.y, this.layout.play);
      // Im Fächer ist die Zugbewegung eine Auswahl, kein Zielen: die Lupe bleibt
      // auf der Figur, die gerade gewählt ist, statt dem Finger in den Himmel zu folgen.
      const p =
        this.fan && this.target
          ? { x: this.target.x, y: this.target.y - WUSEL_H / 2 }
          : toLogical(this.camera.view(this.layout.play), this.aim.x, this.aim.y);
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
      );
    }
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
  debugButtons(): Button[] {
    return this.buttons.map((b) => ({ ...b }));
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
