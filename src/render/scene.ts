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
  /** Silhouetten auf dem vordersten Hügelzug — sie geben ihm Massstab. */
  private baeume: { x: number; y: number; h: number; breit: number }[] = [];
  private wolken: {
    x: number;
    y: number;
    r: number;
    deckung: number;
    ballen: number;
    wurf: number;
  }[] = [];
  /** Weiche Senken auf dem vordersten Hügel — gegen die glatte Fläche. */
  private flecken: { x: number; y: number; r: number; tiefe: number }[] = [];
  private particles: Particle[] = [];
  /** Bildschirmschütteln, nur bei Sprengungen (GDD §6). */
  shake = 0;
  /** Stellung der Lukenklappen, 0 zu bis 1 offen. */
  private klappe = 0;
  private klappeZiel = 0;
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
      { factor: 0.25, amp: 46, off: -86 },
      { factor: 0.45, amp: 34, off: -46 },
      { factor: 0.68, amp: 24, off: 2 },
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

    // Bewuchs auf dem naechsten Hügelzug.
    //
    // Eine Hügelflaeche in einem Farbverlauf ist eine Flaeche in einem
    // Farbverlauf, egal wie schoen der Verlauf ist. Was ihr fehlt, ist
    // **Massstab**: Erst wenn etwas Bekanntes darauf steht, weiss das Auge, ob
    // der Hügel gross und weit oder klein und nah ist. Baeume sind dafuer das
    // billigste Mittel — sie brauchen keine Form, nur eine Silhouette.
    //
    // Sie stehen nur auf der vordersten Schicht. Auf allen dreien waere es ein
    // Wald, und ein Wald nimmt der Luftperspektive genau die Staffelung, die
    // sie herstellen soll.
    const bewuchs = mulberry32(this.level.seed ^ 0x2b71);
    const nah = this.hills[this.hills.length - 1];
    this.baeume = [];
    for (let i = 0; i < 26; i++) {
      const t = bewuchs();
      const xLog = t * (nah.pts.length - 1) * nah.step;
      const idx = Math.min(nah.pts.length - 2, Math.floor(xLog / nah.step));
      const rest = xLog / nah.step - idx;
      const yLog = nah.pts[idx] + (nah.pts[idx + 1] - nah.pts[idx]) * rest;
      this.baeume.push({
        x: xLog,
        y: yLog,
        h: 9 + bewuchs() * 9,
        breit: 0.55 + bewuchs() * 0.5,
      });
    }
    this.baeume.sort((a, b) => a.h - b.h);

    // Wolken. Sie stehen noch weiter hinten als der fernste Hügel und bewegen
    // sich entsprechend kaum — dadurch wird der Himmel zu einem Raum statt zu
    // einer Wand.
    // Ihre Hoehe wird am **Bezugspunkt der Parallaxe** ausgerichtet, nicht am
    // Dach der Welt. Der erste Versuch setzte sie auf die oberen Prozente der
    // Levelhoehe — bei einem Ausschnitt von 120 logischen Pixeln lagen sie
    // damit durchweg oberhalb des Bildes und waren schlicht nie zu sehen. Eine
    // langsam mitlaufende Schicht muss dort liegen, wo diese Schicht bei
    // ruhender Kamera erscheint, und das ist der Bezugspunkt.
    const himmel = mulberry32(this.level.seed ^ 0x9d17);
    const refY = this.level.height * 0.42;
    this.wolken = [];
    for (let i = 0; i < 8; i++) {
      this.wolken.push({
        x: himmel() * this.level.width * 1.4 - this.level.width * 0.2,
        y: refY - 62 + himmel() * 74,
        r: 15 + himmel() * 24,
        deckung: 0.16 + himmel() * 0.22,
        ballen: 3 + Math.floor(himmel() * 3),
        wurf: himmel() * 1000,
      });
    }

    // Wiesenschatten auf dem vordersten Hügel.
    //
    // Der Hügel bedeckt ein Viertel des Bildes und war eine einzige Flaeche mit
    // Verlauf. Das Auge liest so etwas als Papier, nicht als Landschaft, weil
    // eine Wiese nie gleichmaessig ist: Es gibt Senken, Schattenhaenge und
    // Flecken, wo anderes waechst. Ein paar sehr weiche, sehr grosse dunkle
    // Flecken reichen dafuer — sie duerfen nicht als Formen erkennbar werden,
    // sondern sollen die Flaeche nur davon abhalten, glatt zu sein.
    const wiese = mulberry32(this.level.seed ^ 0x64c3);
    this.flecken = [];
    for (let i = 0; i < 9; i++) {
      this.flecken.push({
        x: wiese() * this.level.width,
        y: this.level.height * (0.55 + wiese() * 0.4),
        r: 40 + wiese() * 80,
        tiefe: 0.05 + wiese() * 0.09,
      });
    }
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
    // Die Klappen der Luke fahren, statt umzuspringen. Ein Schalter, der von
    // zu auf offen springt, liest sich als Zeichenfehler; eine Bewegung von
    // einem Drittel Sekunde liest sich als Mechanik.
    const ziel = this.klappeZiel;
    const schritt = dtSec * 3.4;
    this.klappe += Math.max(-schritt, Math.min(schritt, ziel - this.klappe));
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
    // Der Verlauf hängt an der *Welt*, nicht am Bildschirm.
    //
    // Vorher lief er über die Höhe des Spielfensters: Egal wie hoch die Kamera
    // stand, oben war dunkel und unten hell — der Himmel sah überall gleich
    // aus und wirkte wie eine gestrichene Wand. Jetzt liegt er zwischen dem
    // Dach der Welt und dem Boden, also schwenkt man beim Hochziehen wirklich
    // in die Höhe. Bei engem Ausschnitt sieht man davon nur einen Streifen —
    // genau das gibt ihm Tiefe.
    const oben = sy(v, 0);
    const unten = sy(v, this.level.height * 0.66);
    const g = ctx.createLinearGradient(0, oben, 0, Math.max(unten, oben + 1));
    g.addColorStop(0, this.palette.skyTop);
    g.addColorStop(0.6, this.palette.skyMid);
    g.addColorStop(1, this.palette.skyBottom);
    ctx.fillStyle = g;
    ctx.fillRect(v.box.x, v.box.y, v.box.w, v.box.h);
    this.drawWolken(ctx, v);
  }

  /**
   * Wolken aus ueberlappenden Kreisen mit weichem Rand.
   *
   * Ein Himmel aus einem reinen Verlauf ist eine Wand — es gibt nichts darin,
   * woran das Auge Entfernung ablesen koennte. Wolken sind das billigste
   * Gegenmittel: Sie brauchen keine Form, nur eine Haeufung, und weil sie noch
   * weiter hinten stehen als der fernste Hügel, bewegen sie sich beim Schwenken
   * fast nicht. Genau diese Traegheit macht aus der Wand einen Raum.
   *
   * Gezeichnet wird jede als drei bis fuenf Ballen mit weichem Verlauf nach
   * aussen. Harte Kreise saehen aus wie Seifenblasen; die Weichheit ist hier
   * kein Schmuck, sondern das, was eine Wolke ausmacht.
   */
  private drawWolken(ctx: CanvasRenderingContext2D, v: View): void {
    const faktor = 0.12;
    const refX = this.level.width / 2;
    const refY = this.level.height * 0.42;
    const ox = v.ox * faktor + refX * (1 - faktor);
    const oy = v.oy * faktor + refY * (1 - faktor);
    for (const w of this.wolken) {
      const cx = v.box.x + (w.x - ox) * v.scale;
      const cy = v.box.y + (w.y - oy) * v.scale;
      const r = w.r * v.scale;
      if (cx < v.box.x - r * 3 || cx > v.box.x + v.box.w + r * 3) continue;
      for (let i = 0; i < w.ballen; i++) {
        // Aus der gespeicherten Zahl gestreute Ballen — dieselbe Wolke sieht
        // dadurch bei jedem Bild gleich aus, ohne dass sie gespeichert waere.
        const s = Math.sin(w.wurf + i * 2.399);
        const c = Math.cos(w.wurf + i * 3.717);
        const bx = cx + s * r * 1.05;
        const by = cy + c * r * 0.3;
        const br = r * (0.55 + Math.abs(c) * 0.5);
        const g = ctx.createRadialGradient(bx, by - br * 0.2, br * 0.15, bx, by, br);
        g.addColorStop(0, `rgba(255, 255, 255, ${w.deckung})`);
        g.addColorStop(0.6, `rgba(255, 255, 255, ${w.deckung * 0.5})`);
        g.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fill();
      }
    }
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
    // Bezugspunkt der Parallaxe: die Mitte der Welt, nicht ihr Ursprung.
    //
    // Vorher stand dort schlicht `v.ox * factor`. Das verschiebt eine Schicht
    // proportional zur *absoluten* Kameraposition — bei einem Ausschnitt von
    // 300 logischen Pixeln fiel das kaum auf, bei 180 sind die Hügel dadurch
    // unter den Bildrand gewandert und waren schlicht weg. Mit Bezugspunkt
    // bleibt jede Schicht dort, wo sie hingehört, und bewegt sich nur *relativ
    // dazu* langsamer als der Vordergrund.
    const refX = this.level.width / 2;
    const refY = this.level.height * 0.42;
    for (const layer of this.hills) {
      const ox = v.ox * layer.factor + refX * (1 - layer.factor);
      const oy = v.oy * layer.factor + refY * (1 - layer.factor);

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

      // Die Senken liegen innerhalb des Hügels — deshalb wird auf den eben
      // gefuellten Pfad beschnitten, statt sie frei zu zeichnen. Ein Fleck, der
      // ueber den Kamm hinausragt, waere sofort als Kreis erkennbar und damit
      // genau das Gegenteil dessen, was er soll.
      if (layer === this.hills[this.hills.length - 1]) {
        ctx.save();
        ctx.clip();
        for (const f of this.flecken) {
          const fx = v.box.x + (f.x - ox) * v.scale;
          const fy = v.box.y + (f.y - oy) * v.scale;
          const fr = f.r * v.scale;
          const gg = ctx.createRadialGradient(fx, fy, 0, fx, fy, fr);
          gg.addColorStop(0, `rgba(12, 34, 20, ${f.tiefe})`);
          gg.addColorStop(1, 'rgba(12, 34, 20, 0)');
          ctx.fillStyle = gg;
          ctx.beginPath();
          ctx.arc(fx, fy, fr, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Lichtsaum auf dem Kamm. Er trennt zwei Schichten besser als jeder
      // Farbunterschied, weil er dort sitzt, wo das Auge ohnehin hinsieht: an
      // der Kante. Nur ein Haar breit — er soll die Kante betonen, nicht selbst
      // zu einer werden.
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = Math.max(0.8, v.scale * 0.55);
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length - 1; i++) {
        const mx = (pts[i].x + pts[i + 1].x) / 2;
        const my = (pts[i].y + pts[i + 1].y) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
      }
      ctx.stroke();
      ctx.restore();

      if (layer === this.hills[this.hills.length - 1]) this.drawBewuchs(ctx, v, layer);
    }
  }

  /**
   * Baumsilhouetten auf dem vordersten Hügelzug.
   *
   * Sie haben mit Botanik nichts zu tun und sollen es auch nicht: Auf dieser
   * Entfernung sieht man von einem Baum nur einen dunklen Umriss. Ihr Zweck ist
   * **Massstab** — erst wenn etwas Bekanntes auf dem Hügel steht, weiss das
   * Auge, wie gross er ist. Ohne sie ist er eine abstrakte Form.
   *
   * Sie sind dunkler als der Hügel, nicht heller: Gegen den hellen Himmel
   * gesehen ist alles auf einem Kamm eine Silhouette.
   */
  private drawBewuchs(ctx: CanvasRenderingContext2D, v: View, layer: HillLayer): void {
    const refX = this.level.width / 2;
    const refY = this.level.height * 0.42;
    const ox = v.ox * layer.factor + refX * (1 - layer.factor);
    const oy = v.oy * layer.factor + refY * (1 - layer.factor);
    ctx.fillStyle = layer.deep;
    for (const b of this.baeume) {
      const px = v.box.x + (b.x - ox) * v.scale;
      if (px < v.box.x - 20 || px > v.box.x + v.box.w + 20) continue;
      const py = v.box.y + (b.y - oy) * v.scale;
      const h = b.h * v.scale;
      const br = h * 0.34 * b.breit;
      // Stamm und Krone in einem Zug: ein schmales Rechteck, darauf drei
      // ueberlappende Kreise. Mehr braucht eine Silhouette nicht.
      ctx.fillRect(px - Math.max(0.6, br * 0.16), py - h * 0.45, Math.max(1.2, br * 0.32), h * 0.5);
      ctx.beginPath();
      ctx.arc(px, py - h * 0.62, br, 0, Math.PI * 2);
      ctx.arc(px - br * 0.62, py - h * 0.44, br * 0.72, 0, Math.PI * 2);
      ctx.arc(px + br * 0.62, py - h * 0.44, br * 0.72, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Die Ausgangstuer — ein Torbogen, kein Rechteck.
   *
   * Vorher standen hier drei ineinandergeschachtelte Rechtecke. Sie waren
   * sichtbar und erfuellten damit ihren Zweck, sahen aber aus wie ein
   * Platzhalter, weil ihnen drei Dinge fehlten, die ein Bauwerk ausmachen:
   *
   * 1. **Eine Form, die nicht rechteckig ist.** Ein Bogen ist die aelteste
   *    Bauform fuer eine Oeffnung, und das Auge erkennt sie sofort als Tuer.
   * 2. **Eine Kante mit Licht und Schatten.** Ein Rahmen, der oben hell und
   *    unten dunkel ist, hat Dicke. Ohne das ist er ein aufgemalter Strich.
   * 3. **Wirkung auf die Umgebung.** Etwas, das leuchtet, wirft Licht auf den
   *    Boden davor. Fehlt der Lichtfleck, klebt die Tuer auf dem Bild, statt
   *    darin zu stehen.
   */
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
    const mx = x + w / 2;
    const puls = 0.55 + 0.45 * Math.sin(tick / 22);
    const rand = Math.max(1.2, w * 0.11);

    // Schein, der auch durch Gestein dringt — sonst findet ihn niemand.
    const rad = w * 1.7;
    const schein = ctx.createRadialGradient(mx, y + h * 0.55, 0, mx, y + h * 0.55, rad);
    schein.addColorStop(0, `rgba(255, 216, 138, ${0.5 * puls})`);
    schein.addColorStop(0.55, `rgba(255, 198, 108, ${0.15 * puls})`);
    schein.addColorStop(1, 'rgba(255, 198, 108, 0)');
    ctx.fillStyle = schein;
    ctx.beginPath();
    ctx.arc(mx, y + h * 0.55, rad, 0, Math.PI * 2);
    ctx.fill();

    // Lichtfleck auf dem Boden davor. Er ist breiter als die Tuer und laeuft
    // nach aussen aus — so faellt Licht aus einer Oeffnung.
    const fleck = ctx.createRadialGradient(mx, y + h, 0, mx, y + h, w * 1.1);
    fleck.addColorStop(0, `rgba(255, 226, 160, ${0.4 * puls})`);
    fleck.addColorStop(1, 'rgba(255, 226, 160, 0)');
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(mx, y + h, w * 1.1, h * 0.3, 0, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = fleck;
    ctx.fillRect(mx - w * 1.2, y + h - h * 0.35, w * 2.4, h * 0.7);
    ctx.restore();

    // Der Bogen: Rechteck mit rundem Abschluss.
    //
    // Der Radius ist **gedeckelt**, und daran haengt alles. Ein Halbkreis ueber
    // der vollen Breite frisst bei einem breiten, flachen Ausgang die ganze
    // Hoehe auf — dann steht dort keine Tuer mehr, sondern eine Kuppel. Genau
    // so sah der erste Versuch aus. Mit dem Deckel bleiben immer gerade
    // Seitenwaende stehen, und erst die machen aus einem Bogen einen Eingang.
    const bogen = (px: number, py: number, pw: number, ph: number): void => {
      const r = Math.min(pw / 2, ph * 0.5);
      ctx.beginPath();
      ctx.moveTo(px, py + ph);
      ctx.lineTo(px, py + r);
      ctx.quadraticCurveTo(px, py, px + Math.min(r, pw / 2), py);
      ctx.lineTo(px + pw - Math.min(r, pw / 2), py);
      ctx.quadraticCurveTo(px + pw, py, px + pw, py + r);
      ctx.lineTo(px + pw, py + ph);
      ctx.closePath();
    };

    // Rahmen aus Stein. Der Verlauf von oben hell nach unten dunkel ist die
    // ganze Dicke — Licht faellt in diesem Spiel immer von oben.
    const stein = ctx.createLinearGradient(0, y - rand, 0, y + h);
    stein.addColorStop(0, '#b9a68c');
    stein.addColorStop(0.45, '#8a705e');
    stein.addColorStop(1, '#544636');
    ctx.fillStyle = stein;
    bogen(x - rand, y - rand, w + rand * 2, h + rand);
    ctx.fill();

    // Die Oeffnung. Dunkel oben, hell unten: Das Licht kommt von drinnen und
    // von unten, und dieser Verlauf ist der Grund, warum man in die Tuer
    // hineinsieht statt auf sie drauf.
    const innen = ctx.createLinearGradient(0, y, 0, y + h);
    innen.addColorStop(0, '#2a1c0c');
    innen.addColorStop(0.45, `rgba(196, 138, 58, ${0.55 + 0.2 * puls})`);
    innen.addColorStop(1, this.palette.glow);
    ctx.fillStyle = innen;
    bogen(x, y, w, h);
    ctx.fill();

    // Der helle Kern, der pulst. Schmal und unten — dort ist der Ausgang.
    ctx.save();
    bogen(x, y, w, h);
    ctx.clip();
    const kern = ctx.createLinearGradient(0, y + h * 0.3, 0, y + h);
    kern.addColorStop(0, 'rgba(255, 246, 221, 0)');
    kern.addColorStop(1, `rgba(255, 250, 235, ${0.55 + 0.35 * puls})`);
    ctx.fillStyle = kern;
    ctx.fillRect(x + w * 0.2, y + h * 0.3, w * 0.6, h * 0.7);
    ctx.restore();

    // Schlussstein im Scheitel und Schwelle am Fuss. Zwei kleine Teile, die
    // aus einem Loch mit Rahmen ein gebautes Tor machen.
    ctx.fillStyle = '#cbb89c';
    ctx.fillRect(mx - rand * 0.7, y - rand * 1.5, rand * 1.4, rand * 1.1);
    ctx.fillStyle = '#6d5c46';
    ctx.fillRect(x - rand * 1.4, y + h - rand * 0.5, w + rand * 2.8, rand * 0.9);
  }

  /**
   * Die Eingangsluke — eine Maschine, die aufgeht.
   *
   * Sie haengt in der Luft und hat keine Erklaerung, solange sie ein graues
   * Rechteck ist. Drei Zutaten machen daraus ein Geraet: eine **Aufhaengung**,
   * damit klar ist, warum sie oben bleibt; **Nieten und eine Fase**, damit sie
   * aus Blech besteht und nicht aus Farbe; und **zwei Klappen, die sich
   * wirklich oeffnen** — die Bewegung erklaert das Bauteil besser als jedes
   * Detail. Der Warnstreifen sagt, dass hier gleich etwas herausfaellt.
   */
  private drawHatch(ctx: CanvasRenderingContext2D, v: View, world: World): void {
    this.klappeZiel = world.hatchOpen ? 1 : 0;
    const auf = this.klappe;
    const mx = sx(v, world.entrance.x);
    const uk = sy(v, world.entrance.y - 12);
    const w = 36 * v.scale;
    const h = 13 * v.scale;
    const x = mx - w / 2;
    const y = uk - h;

    // Aufhaengung: zwei Streben nach oben, die nach oben hin ausblenden. Sie
    // muessen nirgends ankommen — sie beantworten nur die Frage, warum das
    // Ding nicht faellt.
    const strebe = ctx.createLinearGradient(0, y - h * 1.9, 0, y);
    strebe.addColorStop(0, 'rgba(70, 78, 96, 0)');
    strebe.addColorStop(1, 'rgba(70, 78, 96, 0.9)');
    ctx.fillStyle = strebe;
    ctx.fillRect(x + w * 0.2, y - h * 1.9, Math.max(1, w * 0.055), h * 1.9);
    ctx.fillRect(x + w * 0.75, y - h * 1.9, Math.max(1, w * 0.055), h * 1.9);

    // Gehaeuse mit Fase: heller Deckel, Koerper im Verlauf, dunkle Unterkante.
    const blech = ctx.createLinearGradient(0, y, 0, y + h);
    blech.addColorStop(0, '#79839b');
    blech.addColorStop(0.5, '#4e5668');
    blech.addColorStop(1, '#2a2f3c');
    ctx.fillStyle = blech;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#98a3ba';
    ctx.fillRect(x, y, w, Math.max(1, h * 0.16));

    // Nieten entlang der Oberkante.
    ctx.fillStyle = '#b9c3d6';
    const niete = Math.max(1, w * 0.035);
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(x + w * (0.1 + i * 0.2) - niete / 2, y + h * 0.26, niete, niete);
    }

    // Warnstreifen. Schraeg, weil das die einzige Streifenrichtung ist, die
    // ueberall als Warnung gelesen wird.
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y + h * 0.42, w, h * 0.22);
    ctx.clip();
    ctx.fillStyle = '#e8b53c';
    ctx.fillRect(x, y + h * 0.42, w, h * 0.22);
    ctx.fillStyle = '#22262f';
    const breit = w * 0.1;
    for (let sx0 = -h; sx0 < w + h; sx0 += breit * 2) {
      ctx.beginPath();
      ctx.moveTo(x + sx0, y + h * 0.64);
      ctx.lineTo(x + sx0 + breit, y + h * 0.64);
      ctx.lineTo(x + sx0 + breit + h * 0.22, y + h * 0.42);
      ctx.lineTo(x + sx0 + h * 0.22, y + h * 0.42);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Der Schacht dahinter — nur zu sehen, wenn die Klappen offen sind.
    ctx.fillStyle = '#090b10';
    ctx.fillRect(x + w * 0.16, y + h * 0.66, w * 0.68, h * 0.34);

    // Die beiden Klappen, aussen angeschlagen. Sie kippen nach unten weg;
    // gezeichnet wird die perspektivische Verkuerzung als schmaler werdendes
    // Viereck, nicht als gedrehtes Rechteck — von der Seite gesehen ist das
    // dasselbe und kostet keine Drehung.
    const kl = w * 0.34;
    const tief = h * 0.34;
    const fall = auf * kl * 0.92;
    ctx.fillStyle = '#39404f';
    for (const seite of [-1, 1]) {
      const anschlag = mx + seite * w * 0.16;
      const spitzeX = anschlag + seite * (kl - fall);
      const spitzeY = y + h * 0.66 + auf * tief * 1.5;
      ctx.beginPath();
      ctx.moveTo(anschlag, y + h * 0.66);
      ctx.lineTo(spitzeX, spitzeY);
      ctx.lineTo(spitzeX, spitzeY + tief * (1 - auf * 0.55));
      ctx.lineTo(anschlag, y + h * 0.66 + tief);
      ctx.closePath();
      ctx.fill();
    }
    // Kante der Klappen, damit sie sich vom Schacht abheben.
    ctx.strokeStyle = '#6d7789';
    ctx.lineWidth = Math.max(0.8, v.scale * 0.5);
    ctx.beginPath();
    ctx.moveTo(x + w * 0.16, y + h * 0.66);
    ctx.lineTo(x + w * 0.84, y + h * 0.66);
    ctx.stroke();
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
