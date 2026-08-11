import { WUSEL_H } from '../core/constants';
import { DeathCause, type WorldEvent } from '../core/types';
import type { World } from '../core/world';
import type { LevelDef } from '../levels/types';
import { mulberry32 } from '../levels/paint';
import { sx, sy, type View } from './camera';
import { paletteFor, type Palette } from './palette';
import { drawFuseOverlay, drawWusel } from './sprites';
import type { SpriteAtlas } from './atlas';
import type { TerrainView } from './terrainView';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
  gravity: number;
}

interface HillLayer {
  pts: number[];
  step: number;
  factor: number;
  color: string;
  /** Fusston des Verlaufs innerhalb der Schicht. */
  deep: string;
}

const MAX_PARTICLES = 320;

/** Alles, was im Spielfeld gezeichnet wird — Hintergrund, Terrain, Figuren, Partikel. */
export class Scene {
  readonly palette: Palette;
  private hills: HillLayer[] = [];
  private particles: Particle[] = [];
  /** Bildschirmschütteln, nur bei Sprengungen (GDD §6). */
  shake = 0;
  /** Liegt kein Blatt vor, zeichnet der prozedurale Weg weiter. */
  atlas: SpriteAtlas | null = null;

  constructor(
    private level: LevelDef,
    private terrainView: TerrainView,
  ) {
    this.palette = paletteFor(level.theme);
    this.buildHills();
  }

  private buildHills(): void {
    const rnd = mulberry32(this.level.seed ^ 0x5f3a);
    const base = this.level.height * 0.58;
    const specs = [
      { factor: 0.25, amp: 46, off: -70 },
      { factor: 0.45, amp: 34, off: -30 },
      { factor: 0.68, amp: 24, off: 10 },
    ];
    this.hills = specs.map((s, li) => {
      const step = 28;
      const n = Math.ceil(this.level.width / step) + 4;
      const pts: number[] = [];
      let y = base + s.off;
      for (let i = 0; i < n; i++) {
        y += (rnd() - 0.5) * s.amp;
        y = Math.max(this.level.height * 0.12, Math.min(this.level.height * 0.85, y));
        pts.push(y);
      }
      return {
        pts,
        step,
        factor: s.factor,
        color: this.palette.hills[li],
        deep: this.palette.hillsDeep[li],
      };
    });
  }

  // --- Partikel ------------------------------------------------------------

  spawnFromEvents(events: WorldEvent[]): void {
    for (const e of events) {
      switch (e.type) {
        case 'dig':
          this.burst(e.x, e.y, 3, '#8a6236', 26, 40);
          break;
        case 'brick':
          this.burst(e.x, e.y, 2, '#c98a52', 18, 30);
          break;
        case 'steel':
          this.burst(e.x, e.y, 7, '#ffe9a8', 90, 26);
          break;
        case 'explode':
          this.burst(e.x, e.y, 26, '#ff9a3c', 150, 90);
          this.burst(e.x, e.y, 12, '#5a5a5a', 70, 140);
          this.shake = Math.min(1, this.shake + 0.85);
          break;
        case 'saved':
          this.burst(e.x, e.y - 6, 8, '#ffe98a', 60, 60);
          break;
        case 'died':
          if (e.cause !== DeathCause.EXPLOSION) this.burst(e.x, e.y, 8, '#c8402f', 70, 60);
          break;
        default:
          break;
      }
    }
  }

  private burst(
    x: number,
    y: number,
    n: number,
    color: string,
    speed: number,
    lifeMs: number,
  ): void {
    for (let i = 0; i < n; i++) {
      if (this.particles.length >= MAX_PARTICLES) return;
      const a = Math.random() * Math.PI * 2;
      const s = speed * (0.35 + Math.random() * 0.65);
      const life = (lifeMs * (0.6 + Math.random() * 0.8)) / 1000;
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - speed * 0.3,
        life,
        max: life,
        size: 1 + Math.floor(Math.random() * 2),
        color,
        gravity: 190,
      });
    }
  }

  update(dtSec: number): void {
    this.shake = Math.max(0, this.shake - dtSec * 3.2);
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dtSec;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.vy += p.gravity * dtSec;
      p.x += p.vx * dtSec;
      p.y += p.vy * dtSec;
    }
  }

  // --- Zeichnen ------------------------------------------------------------

  draw(ctx: CanvasRenderingContext2D, v: View, world: World, tick: number): void {
    ctx.save();
    ctx.beginPath();
    ctx.rect(v.box.x, v.box.y, v.box.w, v.box.h);
    ctx.clip();

    this.drawSky(ctx, v);
    this.drawHills(ctx, v);

    // Das Terrain wird weich vergrössert, nicht hart.
    //
    // Die Maske bleibt pixelgenau — sie ist die Spielregel, jeder Spatenstich
    // schreibt einen Pixel. Aber sie hart zu vergrössern hiesse, jeden dieser
    // Pixel als Treppenstufe zu zeigen, und daneben stünden weich gemalte
    // Figuren. Weich vergrössert wird aus der Bruchkante eine Kante mit
    // Übergang; das Korn im Inneren wird dabei zur Textur statt zum Raster.
    // Wo genau der Boden aufhört, sieht man weiterhin — die Maske ist
    // unverändert, nur ihre Darstellung hat einen halben Pixel Weichzeichnung.
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(
      this.terrainView.canvas,
      sx(v, 0),
      sy(v, 0),
      this.level.width * v.scale,
      this.level.height * v.scale,
    );
    ctx.restore();

    this.drawExit(ctx, v, world, tick);
    this.drawHatch(ctx, v, world);

    for (const w of world.wusels) {
      // Je Figur entscheiden: Was das Blatt nicht bedienen kann, zeichnet der
      // prozedurale Weg. So bleibt auch halbfertige Grafik spielbar.
      if (this.atlas?.drawWusel(ctx, v, w)) {
        if (w.fuse > 0) drawFuseOverlay(ctx, v, w, tick);
      } else {
        drawWusel(ctx, v, w, tick);
      }
    }
    this.drawParticles(ctx, v);

    ctx.restore();
  }

  /**
   * Himmel mit drei Stützstellen statt zwei.
   *
   * Ein Verlauf zwischen zwei Farben ist eine Rampe und sieht auch so aus.
   * Der dritte Wert auf halber Höhe biegt ihn — oben bleibt es lange dunkel,
   * zum Horizont hin wird es schnell hell. Das ist, was ein Abendhimmel tut.
   */
  private drawSky(ctx: CanvasRenderingContext2D, v: View): void {
    const g = ctx.createLinearGradient(0, v.box.y, 0, v.box.y + v.box.h);
    g.addColorStop(0, this.palette.skyTop);
    g.addColorStop(0.62, this.palette.skyMid);
    g.addColorStop(1, this.palette.skyBottom);
    ctx.fillStyle = g;
    ctx.fillRect(v.box.x, v.box.y, v.box.w, v.box.h);
  }

  /**
   * Hügelzüge als weiche Kurven statt als Streckenzüge.
   *
   * Gezogen wird durch die Mittelpunkte je zweier Stützstellen, mit der
   * Stützstelle selbst als Kontrollpunkt. Das ist die übliche Glättung eines
   * Streckenzugs und kostet nichts — der Umriss bekommt dadurch Rundungen,
   * statt aus geraden Teilstücken zu bestehen.
   *
   * Dazu je Schicht ein senkrechter Verlauf: oben am Kamm heller, nach unten
   * dunkler. Eine Fläche in einem einzigen Ton liest als Papierschnitt; erst
   * der Verlauf macht daraus Luft zwischen den Schichten.
   */
  private drawHills(ctx: CanvasRenderingContext2D, v: View): void {
    for (const layer of this.hills) {
      const ox = v.ox * layer.factor;
      const oy = v.oy * layer.factor;

      const pts: { x: number; y: number }[] = [];
      for (let i = 0; i < layer.pts.length; i++) {
        const px = v.box.x + (i * layer.step - ox) * v.scale;
        const py = v.box.y + (layer.pts[i] - oy) * v.scale;
        if (px < v.box.x - layer.step * v.scale * 2) continue;
        if (px > v.box.x + v.box.w + layer.step * v.scale * 2) break;
        pts.push({ x: px, y: py });
      }
      if (pts.length < 2) continue;

      let kamm = Infinity;
      for (const p of pts) kamm = Math.min(kamm, p.y);
      const g = ctx.createLinearGradient(0, kamm, 0, v.box.y + v.box.h);
      g.addColorStop(0, layer.color);
      g.addColorStop(1, layer.deep);
      ctx.fillStyle = g;

      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length - 1; i++) {
        const mx = (pts[i].x + pts[i + 1].x) / 2;
        const my = (pts[i].y + pts[i + 1].y) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
      }
      const last = pts[pts.length - 1];
      ctx.lineTo(last.x, last.y);
      ctx.lineTo(v.box.x + v.box.w, v.box.y + v.box.h);
      ctx.lineTo(v.box.x, v.box.y + v.box.h);
      ctx.closePath();
      ctx.fill();
    }
  }

  private drawExit(
    ctx: CanvasRenderingContext2D,
    v: View,
    world: World,
    tick: number,
  ): void {
    const e = world.exit;
    const x = sx(v, e.x);
    const y = sy(v, e.y);
    const w = e.w * v.scale;
    const h = e.h * v.scale;
    const pulse = 0.55 + 0.45 * Math.sin(tick / 22);

    // Der Ausgang leuchtet auch durch Gestein — sonst findet ihn niemand.
    const cxp = x + w / 2;
    const cyp = y + h / 2;
    const rad = w * 1.6;
    const g = ctx.createRadialGradient(cxp, cyp, 0, cxp, cyp, rad);
    g.addColorStop(0, `rgba(255, 214, 130, ${0.5 * pulse})`);
    g.addColorStop(0.55, `rgba(255, 200, 110, ${0.16 * pulse})`);
    g.addColorStop(1, 'rgba(255, 200, 110, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cxp, cyp, rad, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1a1208';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = this.palette.glow;
    ctx.globalAlpha = 0.85;
    ctx.fillRect(x + w * 0.18, y + h * 0.16, w * 0.64, h * 0.84);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#fff6dd';
    ctx.fillRect(x + w * 0.34, y + h * 0.34, w * 0.32, h * 0.66);
  }

  private drawHatch(ctx: CanvasRenderingContext2D, v: View, world: World): void {
    const x = sx(v, world.entrance.x);
    const y = sy(v, world.entrance.y - 14);
    const w = 34 * v.scale;
    const h = 12 * v.scale;
    ctx.fillStyle = '#2b2f3a';
    ctx.fillRect(x - w / 2, y - h, w, h);
    ctx.fillStyle = '#565f73';
    ctx.fillRect(x - w / 2, y - h, w, Math.max(1, h * 0.28));
    const open = world.hatchOpen;
    ctx.fillStyle = open ? '#0b0d12' : '#3d4353';
    ctx.fillRect(x - w * 0.34, y - h * 0.2, w * 0.68, h * 0.3);
  }

  private drawParticles(ctx: CanvasRenderingContext2D, v: View): void {
    for (const p of this.particles) {
      const a = Math.max(0, Math.min(1, p.life / p.max));
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      const s = Math.max(1, p.size * v.scale);
      ctx.fillRect(sx(v, p.x), sy(v, p.y), s, s);
    }
    ctx.globalAlpha = 1;
  }
}

/** Mittelpunkt des Koerpers — Zielpunkt fuer Lupe und Auswahl. */
export function wuselCenterY(y: number): number {
  return y - WUSEL_H / 2;
}
