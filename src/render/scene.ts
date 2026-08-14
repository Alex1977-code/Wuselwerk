import { SAVING_TICKS, WUSEL_H } from '../core/constants';
import { DeathCause, State, type Wusel, type WorldEvent } from '../core/types';
import type { World } from '../core/world';
import type { LevelDef } from '../levels/types';
import { mulberry32 } from '../levels/paint';
import { standY, sx, sy, type View } from './camera';
import { paletteFor, type Palette } from './palette';
import { drawWusel } from './sprites';
import { drawWarnschein, drawZuendUhr, schopfFarbe, schopfPlatz } from './schopf';
import { clipForWusel, type SpriteAtlas } from './atlas';
import { Kulisse } from './kulisse';
import { SPAEHEN, ansicht, ansichtVergessen } from './ansicht';
import type { TerrainView } from './terrainView';
import { PARTIKEL_MS, SCHUTT_MS, schuttWuerfe } from './schutt';

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
  /**
   * Wie das Teilchen gezeichnet wird. `quadrat` ist das alte harte Korn und
   * bleibt fuer Schutt richtig — ein Erdkruemel hat Ecken. `weich` ist ein
   * Kreis mit weichem Rand fuer Feuer und Rauch, der ueber die Lebenszeit
   * waechst. `brocken` ist ein gedrehtes Viereck mit Drall — der Erdbrocken,
   * der aus dem Krater fliegt.
   */
  form?: 'quadrat' | 'weich' | 'brocken';
  winkel?: number;
  drall?: number;
}

/** Der Weissblitz einer Sprengung — zwei, drei Bilder, nicht mehr. */
interface Blitz {
  x: number;
  y: number;
  life: number;
  max: number;
}

/** Die Brandspur am Krater. Sie dunkelt kurz nach und verweht. */
interface Brandspur {
  x: number;
  y: number;
  r: number;
  life: number;
  max: number;
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

/**
 * Welcher Anteil der Rettungsdauer der Sprung dauert.
 *
 * Das letzte Drittel der gebackenen Rettung zeigt eine Figur, die schon fast
 * verschwunden ist. Eine Bewegung, die erst dort ankommt, sieht niemand — also
 * ist der Bogen vorher fertig.
 */
const BOGEN_ANTEIL = 0.62;

/**
 * Wie weit unter der Figur nach Boden gesucht wird, in logischen Pixeln.
 *
 * Weiter zu suchen kostet nichts und bringt nichts: Ab etwa zwei Figurenhoehen
 * ist der Schatten ohnehin verblasst.
 */
const SCHATTEN_REICHWEITE = 26;

/** Alles, was im Spielfeld gezeichnet wird — Hintergrund, Terrain, Figuren, Partikel. */
export class Scene {
  readonly palette: Palette;
  private hills: HillLayer[] = [];
  /** Silhouetten auf dem vordersten Hügelzug — sie geben ihm Massstab. */
  private baeume: { x: number; y: number; h: number; breit: number; form: number }[] = [];
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
  private blitze: Blitz[] = [];
  private brandspuren: Brandspur[] = [];
  /** Bildschirmschütteln, nur bei Sprengungen (GDD §6). */
  shake = 0;
  /** Stellung der Lukenklappen, 0 zu bis 1 offen. */
  private klappe = 0;
  private klappeZiel = 0;
  /** Liegt kein Blatt vor, zeichnet der prozedurale Weg weiter. */
  atlas: SpriteAtlas | null = null;
  /** Die gemalten Kulissenbaender; solange sie fehlen, malen die Huegel. */
  private kulisse: Kulisse;

  // --- Vorgebackene Kulissen-Malmittel --------------------------------------
  //
  // Alles Weiche an der Kulisse (Sonnenschein, Nebel, Korn, Vignette,
  // Lichtbahnen) wird **einmal je Level** in Offscreen-Flaechen gemalt und je
  // Bild nur noch mit `drawImage` gestempelt. Per-Frame-Gradients waeren fuer
  // Himmel und Dunst vertretbar (zwei Stueck), aber `ctx.filter`/`shadowBlur`
  // oder Pixelschleifen je Bild sind auf Mittelklasse-Handys unkalkulierbar.
  /** Der Himmelskoerper mit Bloom — Sonne, Glutball oder Lichtschacht. */
  private sonneSprite: HTMLCanvasElement | null = null;
  /** Weltposition der Sonne; `null` heisst Lichtschacht am oberen Rand (Höhle). */
  private sonnePos: { x: number; y: number } | null = null;
  /** Eine weiche Nebelellipse, beim Zeichnen gestreckt und gestapelt. */
  private nebelSprite: HTMLCanvasElement | null = null;
  private nebelBaenke: { x: number; y: number; w: number; h: number; deckung: number }[] = [];
  /** Feines Korn gegen Banding in den grossen Verlaeufen. */
  private korn: CanvasPattern | null = null;
  /** Die Buehnen-Vignette, auf Spielfenstergroesse gebacken. */
  private vignette: HTMLCanvasElement | null = null;
  private vignetteW = 0;
  private vignetteH = 0;
  /** Statische Lichtbahnen von der Sonne — nur dort, wo Luft und Licht sind. */
  private raysSprite: HTMLCanvasElement | null = null;

  constructor(
    private level: LevelDef,
    private terrainView: TerrainView,
  ) {
    this.palette = paletteFor(level.theme);
    this.kulisse = new Kulisse(this.palette, level.theme, level.width, level.height);
    this.buildHills();
    this.bakeKulisse();
    // Der gezeichnete Blick ist Ansichtszustand je Figurennummer. Ein neues
    // Level bringt neue Figuren mit denselben Nummern — ohne dieses Vergessen
    // erbten sie die Blickrichtung ihrer Vorgaenger.
    ansichtVergessen();
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
        // Drei Silhouetten statt einer. „Alle aus derselben Form" stand in
        // der Kritik, und es stimmte: Ein Kamm aus lauter gleichen Lollis
        // liest sich als Stempelmuster, nicht als Wald.
        form: Math.floor(bewuchs() * 3),
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

  /**
   * Die Offscreen-Malmittel der Kulisse backen — einmal je Level.
   *
   * ## Warum eine sichtbare Lichtquelle (Kritikpunkt „dreidimensionaler")
   *
   * Die Kulisse hatte Lichtsaeume auf den Kaemmen, Kontaktschatten unter den
   * Figuren und eine `glow`-Farbe je Welt — aber keine Quelle, aus der das
   * alles kommt. Ohne sie ist jede Beleuchtung Behauptung. Ein Himmelskoerper
   * mit weichem Bloom erklaert sie alle auf einmal, und weil die Wolken **vor**
   * ihm gezeichnet werden, ziehen sie vor der Sonne vorbei: Das ist Tiefe, die
   * man nicht erklaeren muss.
   *
   * Je Welt sitzt er anders: Im Grasland hoch und warm, in der Frostklamm
   * tief (Winterlicht), im Rostwerk und im Schlot als Glutball knapp ueber dem
   * Horizont. Die Kristallhoehle hat keinen Himmelskoerper — dort faellt ein
   * breiter Lichtschacht von oben ein, dieselbe Backform, nur gestreckt.
   */
  private bakeKulisse(): void {
    const rgb = (hex: string): [number, number, number] => [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16),
    ];
    const [gr, gg, gb] = rgb(this.palette.glow);

    // Der Himmelskoerper: fast weisser Kern, in der Leuchtfarbe der Welt
    // auslaufend. Gezeichnet wird er mit 'screen' — er hellt auf, statt zu
    // decken, und bleibt damit auch vor hellen Himmeln ein Licht.
    const sonne = document.createElement('canvas');
    sonne.width = sonne.height = 256;
    const sg = sonne.getContext('2d')!;
    const grad = sg.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, `rgba(255, 253, 245, 0.85)`);
    grad.addColorStop(0.15, `rgba(${gr}, ${gg}, ${gb}, 0.65)`);
    grad.addColorStop(0.3, `rgba(${gr}, ${gg}, ${gb}, 0.3)`);
    grad.addColorStop(1, `rgba(${gr}, ${gg}, ${gb}, 0)`);
    sg.fillStyle = grad;
    sg.fillRect(0, 0, 256, 256);
    this.sonneSprite = sonne;

    const refY = this.level.height * 0.42;
    const W = this.level.width;
    switch (this.level.theme) {
      case 'crystal':
        this.sonnePos = null;
        break;
      case 'frost':
        this.sonnePos = { x: W * 0.3, y: refY - 64 };
        break;
      case 'rust':
        this.sonnePos = { x: W * 0.62, y: refY - 22 };
        break;
      case 'magma':
        this.sonnePos = { x: W * 0.5, y: refY - 6 };
        break;
      default:
        this.sonnePos = { x: W * 0.72, y: refY - 78 };
    }

    // Eine Nebelellipse, weich in alle Richtungen. Die Baenke am Hügelfuss
    // sind gestreckte Stempel davon — Nebel, der den Fuss der Kulisse
    // verschluckt, trennt sie schaerfer vom Spielfeld als der Dunst allein.
    const [sr, sg2, sb] = rgb(this.palette.skyBottom);
    const nebel = document.createElement('canvas');
    nebel.width = 256;
    nebel.height = 64;
    const ng = nebel.getContext('2d')!;
    ng.save();
    ng.scale(4, 1);
    const nGrad = ng.createRadialGradient(32, 32, 0, 32, 32, 32);
    nGrad.addColorStop(0, `rgba(${sr}, ${sg2}, ${sb}, 0.9)`);
    nGrad.addColorStop(0.6, `rgba(${sr}, ${sg2}, ${sb}, 0.5)`);
    nGrad.addColorStop(1, `rgba(${sr}, ${sg2}, ${sb}, 0)`);
    ng.fillStyle = nGrad;
    ng.fillRect(0, 0, 64, 64);
    ng.restore();
    this.nebelSprite = nebel;

    // Die Baenke liegen am Kamm der vordersten Schicht, aber auf einer
    // **eigenen** Parallaxe-Ebene (0.85) zwischen Hügel (0.68) und Terrain
    // (1.0) — genau diese Zwischenschicht fehlte der Staffelung.
    const rnd = mulberry32(this.level.seed ^ 0x77e1);
    const nah = this.hills[this.hills.length - 1];
    this.nebelBaenke = [];
    for (let i = 0; i < 3; i++) {
      const xLog = rnd() * W;
      const idx = Math.min(nah.pts.length - 2, Math.floor(xLog / nah.step));
      const rest = xLog / nah.step - idx;
      const yKamm = nah.pts[idx] + (nah.pts[idx + 1] - nah.pts[idx]) * rest;
      this.nebelBaenke.push({
        x: xLog,
        y: yKamm + 4 + rnd() * 10,
        w: 160 + rnd() * 140,
        h: 22 + rnd() * 12,
        deckung: 0.08 + rnd() * 0.06,
      });
    }

    // Feines Korn: Auf Handy-Bildschirmen zerfallen grosse Verlaeufe in
    // Streifen. Ein Hauch zufaelliges Hell-Dunkel-Korn (5–8/255) bricht die
    // Streifen — und laesst den Himmel gemalt aussehen statt errechnet.
    const kornC = document.createElement('canvas');
    kornC.width = kornC.height = 160;
    const kg = kornC.getContext('2d')!;
    const bild = kg.createImageData(160, 160);
    const kornRnd = mulberry32(this.level.seed ^ 0x1cf5);
    for (let i = 0; i < bild.data.length; i += 4) {
      const hell = kornRnd() < 0.5 ? 255 : 0;
      bild.data[i] = bild.data[i + 1] = bild.data[i + 2] = hell;
      bild.data[i + 3] = 5 + Math.floor(kornRnd() * 4);
    }
    kg.putImageData(bild, 0, 0);
    this.korn = kg.createPattern(kornC, 'repeat');

    // Lichtbahnen nur dort, wo offener Himmel und tiefstehende Sonne
    // zusammenkommen: Grasland und Frostklamm. In der Hoehle gibt es keine
    // Sonne, ueber Rost und Glut staende ein Strahlenkranz als Kitsch.
    if (this.level.theme === 'grass' || this.level.theme === 'frost') {
      const rays = document.createElement('canvas');
      rays.width = rays.height = 512;
      const rg = rays.getContext('2d')!;
      rg.save();
      rg.translate(256, -40);
      rg.rotate(this.level.theme === 'frost' ? 0.5 : -0.42);
      for (const [off, breit, kraft] of [
        [-70, 52, 0.1],
        [24, 30, 0.07],
        [96, 64, 0.09],
      ] as const) {
        const bahn = rg.createLinearGradient(off, 0, off + breit, 0);
        bahn.addColorStop(0, 'rgba(255, 255, 255, 0)');
        bahn.addColorStop(0.5, `rgba(255, 255, 255, ${kraft})`);
        bahn.addColorStop(1, 'rgba(255, 255, 255, 0)');
        rg.fillStyle = bahn;
        rg.fillRect(off - 10, 0, breit + 20, 900);
      }
      rg.restore();
      // Die Bahnen laufen weich aus statt an einer Kante zu enden — nach
      // unten **und** zu den Seiten. Ohne den Seiten-Fade schnitte der Rand
      // der Backflaeche die gedrehten Streifen hart ab, und aus Licht wuerde
      // ein Keil mit Kante.
      rg.globalCompositeOperation = 'destination-in';
      const fade = rg.createLinearGradient(0, 0, 0, 512);
      fade.addColorStop(0, 'rgba(0, 0, 0, 1)');
      fade.addColorStop(0.75, 'rgba(0, 0, 0, 0.4)');
      fade.addColorStop(1, 'rgba(0, 0, 0, 0)');
      rg.fillStyle = fade;
      rg.fillRect(0, 0, 512, 512);
      const seiten = rg.createLinearGradient(0, 0, 512, 0);
      seiten.addColorStop(0, 'rgba(0, 0, 0, 0)');
      seiten.addColorStop(0.25, 'rgba(0, 0, 0, 1)');
      seiten.addColorStop(0.75, 'rgba(0, 0, 0, 1)');
      seiten.addColorStop(1, 'rgba(0, 0, 0, 0)');
      rg.fillStyle = seiten;
      rg.fillRect(0, 0, 512, 512);
      this.raysSprite = rays;
    }
  }

  /** Diagnose fuer die Sichtprobe — siehe `Game.debugPartikel`. */
  /**
   * Alles Fluechtige verwerfen — fuer den Zeitruecklauf.
   *
   * Partikel sind Vergangenheit eines Zeitstrangs, den es nicht mehr gibt.
   * Eine Explosion, deren Funken nach dem Ruecklauf weiterfliegen, waere ein
   * Gespenst: Sie ist jetzt naemlich noch gar nicht passiert.
   */
  klarstellen(): void {
    this.particles = [];
    this.blitze = [];
    this.brandspuren = [];
    ansichtVergessen();
  }

  get partikelStand(): { anzahl: number; restMs: number } {
    let rest = 0;
    for (const p of this.particles) rest = Math.max(rest, p.life);
    return { anzahl: this.particles.length, restMs: Math.round(rest * 1000) };
  }

  // --- Partikel ------------------------------------------------------------

  spawnFromEvents(events: WorldEvent[]): void {
    for (const e of events) {
      switch (e.type) {
        case 'assign':
          // Die Vergabe quittiert im Bild (Kritik F4): ein kleiner Hauch in
          // der Berufsfarbe steigt von der Figur auf. Der Klang kommt aus der
          // Tonschicht; das hier ist die sichtbare Haelfte derselben Antwort.
          this.burst(e.x, e.y - 9, 7, schopfFarbe(e.skill ?? null), 22, 520, 1.6, -46, 'weich');
          break;
        case 'dig':
          this.schutt(e);
          break;
        case 'brick':
          this.burst(e.x, e.y, 3, '#c98a52', 22, PARTIKEL_MS.bruecke);
          break;
        case 'steel':
          this.burst(e.x, e.y, 7, '#ffe9a8', 90, PARTIKEL_MS.stahl);
          break;
        case 'explode':
          // Drei Wolken statt zweier, und alle drei **langsam**.
          //
          // Der erste Versuch flog mit 150 logischen Pixeln je Sekunde
          // auseinander — bei einer halben Sekunde Lebensdauer sind das
          // fuenfundsiebzig Pixel, ein Drittel des Bildschirms. Uebrig blieb
          // eine duenne Sprenkelwolke statt eines Balls. Ein Zeichentrick-Bumms
          // ist **kompakt und dick**: Er bleibt beisammen, und man sieht ihn
          // als eine Sache.
          //
          // Der helle Kern zuerst und sehr kurz — das ist der Blitz. Dann der
          // Feuerball. Der Rauch zuletzt, langsam, gross und fast schwerelos:
          // Er ist die Erinnerung an das Ereignis, nicht das Ereignis.
          // **Reihenfolge ist Zeichenreihenfolge.** Der Rauch zuerst, damit er
          // hinter dem Feuer liegt: Im ersten Versuch kam er zuletzt und deckte
          // als grosser grauer Klumpen genau den Feuerball zu, den er umgeben
          // soll. Rauch gehoert um ein Feuer herum, nicht davor.
          this.burst(e.x, e.y, 12, '#7d7368', 26, PARTIKEL_MS.explosionRauch, 3.2, 12, 'weich');
          this.burst(e.x, e.y, 22, '#ff9a3c', 62, PARTIKEL_MS.explosionFeuer, 2.6, 150, 'weich');
          this.burst(e.x, e.y, 9, '#fff0c2', 46, PARTIKEL_MS.explosionFeuer * 0.4, 3.4, 40, 'weich');
          // Erdbrocken mit Drall: eckig, schwer, schnell unten. Sie sind der
          // Beleg, dass hier **Boden** geflogen ist und nicht Konfetti.
          this.burst(e.x, e.y, 10, '#5a4430', 78, PARTIKEL_MS.explosionFeuer * 1.4, 1.9, 300, 'brocken');
          this.blitze.push({ x: e.x, y: e.y, life: 0.09, max: 0.09 });
          this.brandspuren.push({ x: e.x, y: e.y, r: 15, life: 4.5, max: 4.5 });
          this.shake = Math.min(1, this.shake + 0.85);
          break;
        case 'saved':
          this.burst(e.x, e.y - 6, 9, '#ffe98a', 34, PARTIKEL_MS.rettung, 1.8, 60);
          break;
        case 'died':
          if (e.cause !== DeathCause.EXPLOSION) this.burst(e.x, e.y, 8, '#c8402f', 44, PARTIKEL_MS.tod, 2.2, 150);
          break;
        default:
          break;
      }
    }
  }

  /**
   * Schutt streuen. Die Richtungen kommen aus `schutt.ts` und werden dort
   * geprueft — hier wird nur noch gezeichnet.
   */
  private schutt(e: WorldEvent): void {
    for (const w of schuttWuerfe(e.skill, e.dir === -1 ? -1 : 1)) {
      for (let i = 0; i < w.anzahl; i++) {
        if (this.particles.length >= MAX_PARTICLES) return;
        const a = (Math.random() - 0.5) * w.streu;
        const v = w.tempo * (0.45 + Math.random() * 0.55);
        const life = (SCHUTT_MS * (0.6 + Math.random() * 0.8)) / 1000;
        this.particles.push({
          x: e.x + w.dx,
          y: e.y + w.dy,
          vx: w.seite * Math.cos(a) * v,
          vy: Math.sin(a) * v + w.tempo * w.hoch,
          life,
          max: life,
          size: 1 + Math.floor(Math.random() * 2),
          color: w.farbe,
          gravity: 210,
        });
      }
    }
  }

  /**
   * Eine Wolke in alle Richtungen.
   *
   * @param groesse Korngroesse in logischen Pixeln.
   * @param gravity Fallbeschleunigung. Rauch braucht fast keine.
   */
  private burst(
    x: number,
    y: number,
    n: number,
    color: string,
    speed: number,
    lifeMs: number,
    groesse = 2,
    gravity = 190,
    form: Particle['form'] = 'quadrat',
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
        size: Math.max(1, Math.round(groesse * (0.6 + Math.random() * 0.8))),
        color,
        gravity,
        form,
        winkel: Math.random() * Math.PI,
        drall: (Math.random() - 0.5) * 9,
      });
    }
  }

  update(dtSec: number): void {
    this.shake = Math.max(0, this.shake - dtSec * 3.2);
    // Die Klappen der Luke fahren, statt umzuspringen. Ein Schalter, der von
    // zu auf offen springt, liest sich als Zeichenfehler; eine Bewegung liest
    // sich als Mechanik. Das Oeffnen ist deutlich langsamer als das
    // Schliessen — es traegt das Knarren (~0,65 s, `Sfx.knarren`), und eine
    // alte Holztuer schwingt auf, sie schnappt nicht.
    const ziel = this.klappeZiel;
    const schritt = dtSec * (ziel > this.klappe ? 1.55 : 3.4);
    this.klappe += Math.max(-schritt, Math.min(schritt, ziel - this.klappe));
    for (let i = this.blitze.length - 1; i >= 0; i--) {
      this.blitze[i].life -= dtSec;
      if (this.blitze[i].life <= 0) this.blitze.splice(i, 1);
    }
    for (let i = this.brandspuren.length - 1; i >= 0; i--) {
      this.brandspuren[i].life -= dtSec;
      if (this.brandspuren[i].life <= 0) this.brandspuren.splice(i, 1);
    }
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dtSec;
      if (p.winkel !== undefined && p.drall) p.winkel += p.drall * dtSec;
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
    this.drawHills(ctx, v, tick);

    // Die Lichtbahnen liegen auf der Kulisse und **unter** Dunst und Terrain:
    // So verkaufen sie die Luft als Volumen, ohne je eine Figur oder die
    // Spielflaeche zu ueberstrahlen. Sie haengen an der Sonne und stehen
    // still — flackernde Strahlen wuerden mit Warnschein und Zuendblitz
    // konkurrieren, die Helligkeit als Bedeutung nutzen.
    if (this.raysSprite && this.sonnePos) {
      const f = 0.12;
      const refX = this.level.width / 2;
      const refY = this.level.height * 0.42;
      const px = v.box.x + (this.sonnePos.x - (v.ox * f + refX * (1 - f))) * v.scale;
      const py = v.box.y + (this.sonnePos.y - (v.oy * f + refY * (1 - f))) * v.scale;
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const rw = v.box.w * 1.25;
      ctx.drawImage(this.raysSprite, px - rw / 2, py - rw * 0.12, rw, rw);
      ctx.restore();
    }

    // Der Dunstschleier — die eine Schicht, die Kulisse und Spielflaeche
    // trennt.
    //
    // Die Kritik unter G2: Der vorderste Huegel „sieht begehbarer aus als
    // mancher echte Boden." Die Antwort ist Luftperspektive, konsequent bis
    // zur vordersten Schicht: Ueber **alles**, was hinter dem Terrain liegt,
    // legt sich ein Schleier in der Himmelsfarbe. Das Terrain und die Figuren
    // werden danach in voller Saettigung darueber gezeichnet — was klar ist,
    // ist nah und begehbar; was verdunstet, ist Kulisse.
    //
    // Der Schleier ist ein **Hoehenverlauf**, keine Deckfarbe: Dunst sammelt
    // sich zum Horizont, oben bleibt die Luft klar. Dieselbe Flaeche, aber
    // das staerkste Tiefensignal, das sie hergeben kann — und der Himmel
    // behaelt oben seine Saettigung.
    const dunst = this.palette.dunst;
    const dOben = sy(v, 0);
    const dUnten = sy(v, this.level.height * 0.66);
    const dg = ctx.createLinearGradient(0, dOben, 0, Math.max(dUnten, dOben + 1));
    dg.addColorStop(0, `rgba(${dunst.rgb}, ${dunst.oben})`);
    dg.addColorStop(1, `rgba(${dunst.rgb}, ${dunst.unten})`);
    ctx.fillStyle = dg;
    ctx.fillRect(v.box.x, v.box.y, v.box.w, v.box.h);

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

    this.drawSeitenwaende(ctx, v);

    // Die Brandspuren: ein dunkler Hauch am Kraterrand, der ueber ein paar
    // Sekunden verweht. Er liegt auf dem Terrain und unter den Figuren — wie
    // Russ. Ohne ihn sah der Krater aus, als haette ihn jemand ausgestochen
    // statt gesprengt.
    for (const b of this.brandspuren) {
      const t = Math.max(0, b.life / b.max);
      const bx = sx(v, b.x);
      const by = sy(v, b.y);
      const br = b.r * v.scale;
      const g = ctx.createRadialGradient(bx, by, br * 0.4, bx, by, br * 1.25);
      g.addColorStop(0, `rgba(30, 20, 12, ${0.34 * t})`);
      g.addColorStop(0.7, `rgba(24, 16, 10, ${0.2 * t})`);
      g.addColorStop(1, 'rgba(24, 16, 10, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(bx, by, br * 1.25, 0, Math.PI * 2);
      ctx.fill();
    }

    this.drawExit(ctx, v, world, tick);
    this.drawHatch(ctx, v, world);

    for (const w of world.wusels) {
      if (w.state === State.DEAD || w.state === State.SAVED) continue;

      // Wie viel Raum der Schopf an dieser Stelle hat. Er ist laenger als der
      // halbe Koerper und steckte deshalb in jeder Wand, an der eine Murmel
      // entlanglief — die Simulation kennt nur die zwoelf Pixel Koerperhoehe.
      // Siehe `schopfPlatz`.
      // Was **gezeichnet** wird, nicht was die Simulation gerade meint. Siehe
      // `ansicht.ts`: In einer Grube kippt beides zwanzig Mal je Sekunde.
      const sicht = ansicht(w, clipForWusel(w) ?? '', !!this.atlas?.has(SPAEHEN), tick);
      const blick = sicht.dir;
      const platz = schopfPlatz(
        (px, py) => world.terrain.solid(px, py),
        w.x,
        w.y - WUSEL_H,
        blick,
      );

      const fx = sx(v, w.x);
      const fy = standY(v, w.y);

      // Der Kontaktschatten. Er kommt vor allem anderen, weil er unter allem
      // liegt.
      this.drawBodenschatten(ctx, v, w, world, sicht.pose);

      ctx.save();
      // Der Sprung ins Tor sitzt als Bildschirmversatz **um** den Zeichner
      // herum: Beide Wege (Blatt und prozedural) rechnen ihre Stelle aus der
      // Weltkoordinate aus, also gilt eine aeussere Verschiebung fuer beide.
      const sprung = this.rettungsSprung(w, world);
      if (sprung) ctx.translate(sprung.dx * v.scale, sprung.dy * v.scale);

      // Der Kletterer haengt **an** der Wand, nicht in ihr: Die Simulation
      // steht in der freien Spalte neben dem Fels, aber die Figur ist
      // breiter als ihre Spalte — mittig gezeichnet steckte die halbe
      // Silhouette im Stein. Drei Pixel von der Wand weg sitzt der Koerper
      // draussen und nur die Griffhand am Fels. Dazu die Zug-Treppe, siehe
      // `kletterZug`.
      const zug = sicht.pose === 'climbing' ? this.kletterZug(w.y) : null;
      if (zug) ctx.translate(-blick * 3 * v.scale, zug.dy * v.scale);

      // Die Warnung des Sprengmeisters: ruhiger Schein dahinter, die Uhr
      // darueber. Das fruehere Licht **auf** der Figur ist ersatzlos weg — es
      // pulste, und eine pulsend beleuchtete Figur ist eine flackernde Figur.
      // Die Restzeit sagt jetzt die Ziffer an, nicht die Helligkeit.
      if (w.fuse > 0) drawWarnschein(ctx, fx, fy, WUSEL_H, v.scale, w.fuse);
      // Je Figur entscheiden: Was das Blatt nicht bedienen kann, zeichnet der
      // prozedurale Weg. So bleibt auch halbfertige Grafik spielbar.
      // Der Phasenversatz des Pulks: Jede Figur laeuft ihren Gangzyklus an
      // einer anderen Stelle, gesaet aus der Figurennummer. Nur beim Gehen —
      // die Arbeitsposen muessen auf Bild eins zuschlagen, wenn die Simulation
      // zuschlaegt (Wirkungsbild), und duerfen keinen Versatz tragen. Acht
      // Phasen auf 24 Ticks Zyklus: Aus der Marschkolonne wird ein Gewusel,
      // ohne dass die Simulation davon weiss.
      const takt =
        sicht.pose === 'walking' ? sicht.takt + (w.id % 8) * 3 : zug ? zug.takt : sicht.takt;
      if (!this.atlas?.drawWusel(ctx, v, w, blick, platz, sicht.pose, takt)) {
        drawWusel(ctx, v, w, tick, blick, platz);
      }
      if (w.fuse > 0) drawZuendUhr(ctx, fx, fy, WUSEL_H, v.scale, w.fuse);
      ctx.restore();
    }
    this.drawParticles(ctx, v);

    // Die Vignette zuletzt, ueber allem im Spielfenster: Dunklere Ecken
    // machen aus dem Rechteck eine beleuchtete Buehne und ziehen den Blick
    // zur Mitte, wo das Gewusel ist. In dunklem Blau statt Schwarz — sie
    // soll rahmen, nicht trauern. Gebacken bei Groessenwechsel, gestempelt
    // je Bild; ein Per-Frame-Radialverlauf ueber das ganze Fenster waere
    // der teuerste Gradient des Spiels.
    if (this.vignetteW !== v.box.w || this.vignetteH !== v.box.h) {
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(v.box.w));
      c.height = Math.max(1, Math.round(v.box.h));
      const g = c.getContext('2d')!;
      g.translate(c.width / 2, c.height / 2);
      g.scale(c.width / 2, c.height / 2);
      const grad = g.createRadialGradient(0, 0, 0, 0, 0, 1.42);
      grad.addColorStop(0, 'rgba(8, 12, 24, 0)');
      grad.addColorStop(0.7, 'rgba(8, 12, 24, 0)');
      grad.addColorStop(1, 'rgba(8, 12, 24, 0.14)');
      g.fillStyle = grad;
      g.fillRect(-1, -1, 2, 2);
      this.vignette = c;
      this.vignetteW = v.box.w;
      this.vignetteH = v.box.h;
    }
    if (this.vignette) ctx.drawImage(this.vignette, v.box.x, v.box.y, v.box.w, v.box.h);

    ctx.restore();
  }

  /**
   * Der Kontaktschatten unter einer Figur.
   *
   * ## Warum er das Wichtigste an dieser Stelle ist
   *
   * „Die Figur muss eins sein mit dem Boden." Ohne Schatten steht eine Figur
   * **auf** dem Bild, nicht **in** ihm — das Auge hat nichts, was sie mit dem
   * Grund verbindet, und liest sie deshalb als aufgeklebt. Das ist kein
   * Feinschliff: Ein Kontaktschatten ist der billigste und wirksamste Griff, den
   * es in einem zweidimensionalen Bild gibt.
   *
   * ## Er misst, statt zu behaupten
   *
   * Gesucht wird der Boden **unter** der Figur. Steht sie darauf, ist der
   * Schatten klein, dunkel und scharf; faellt sie, wandert er nach unten, wird
   * breiter und blasser. Damit sagt er zwei Dinge auf einmal, die man sonst
   * nirgends sieht: wo der Boden ist und wie hoch die Figur darueber steht.
   *
   * Genau deshalb ist er auch spielerisch nuetzlich — bei einem Sturz sieht man
   * am Schatten, wo die Figur aufkommen wird.
   *
   * ## Warum er weich ist und nicht schwarz
   *
   * Ein harter schwarzer Fleck ist ein Loch im Boden. Was hier gebraucht wird,
   * ist die Verdunklung, die ein Koerper auf eine diffus beleuchtete Flaeche
   * wirft: in der Mitte am dichtesten, nach aussen auslaufend, und nie ganz
   * deckend.
   */
  private drawBodenschatten(
    ctx: CanvasRenderingContext2D,
    v: View,
    w: Wusel,
    world: World,
    pose?: string,
  ): void {
    // Wie weit ist der Boden? `w.y` ist die unterste Koerperzeile, also liegt
    // der Boden bei stehenden Figuren unmittelbar darunter.
    let tiefe = -1;
    for (let d = 0; d <= SCHATTEN_REICHWEITE; d++) {
      if (world.terrain.solid(w.x, w.y + d)) {
        tiefe = d;
        break;
      }
    }
    if (tiefe < 0) return;

    const hoehe = tiefe / SCHATTEN_REICHWEITE;
    // Die Standflaeche kommt aus dem Blatt, nicht aus einer Zahl hier.
    //
    // Vorher stand hier ein fester Anteil der Figurenhoehe. Der passte fuer
    // eine aufrecht stehende Figur und fuer sonst nichts: Der Rammer steht auf
    // vier logischen Pixeln, der Graeber auf acht, und auf allen vieren sind es
    // zehn. Ein Schatten, der das nicht weiss, ist beim einen ein Nebel und
    // beim anderen ein Fleck neben den Pfoten. Der Backvorgang misst es je Pose
    // und schreibt es ins Blatt; fehlt die Angabe, gilt der alte Wert.
    const clipName = pose ?? clipForWusel(w);
    const gemessen = clipName ? this.atlas?.manifest.clips[clipName]?.fuss : undefined;
    const stand = gemessen && gemessen > 0 ? gemessen : WUSEL_H * 0.5;
    // Je hoeher die Figur, desto breiter und blasser — so verhaelt sich ein
    // Schatten unter einer weichen Lichtquelle.
    // Enger und dunkler als der erste Versuch. Gemessen lag der bei gut acht
    // logischen Pixeln Breite — fast doppelt so breit wie die Figur — und bei
    // sechs Prozent Verdunklung. Ein Schatten, der breiter ist als sein
    // Koerper, liest sich als Dunst; einer mit sechs Prozent liest sich gar
    // nicht. Ein stehendes Tier wirft einen Fleck von etwa seiner eigenen
    // Breite, und zwar einen deutlichen.
    const breit = (stand * 0.48 + WUSEL_H * hoehe * 0.45) * v.scale;
    const flach = breit * 0.34;
    const deckung = 0.62 * (1 - hoehe) ** 1.6;
    if (deckung < 0.02) return;

    const x = sx(v, w.x);
    const y = sy(v, w.y + tiefe);
    const g = ctx.createRadialGradient(x, y, 0, x, y, breit);
    g.addColorStop(0, `rgba(20, 14, 9, ${deckung})`);
    g.addColorStop(0.5, `rgba(20, 14, 9, ${deckung * 0.55})`);
    g.addColorStop(1, 'rgba(24, 18, 12, 0)');
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, flach / breit);
    ctx.translate(-x, -y);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, breit, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /**
   * Der Kletterzug — Ansichtssache, keine Simulation.
   *
   * Die Simulation klettert einen Bildpunkt je vier Ticks, gleichmaessig wie
   * ein Aufzug — und genau so sah es aus („eher ruckartig stueck fuer stueck
   * nach oben"). Ein Kletterer zieht sich aber in **Zuegen** hoch: greifen,
   * halten, hochreissen. Gezeichnet wird deshalb eine Treppe ueber der
   * glatten Bewegung: Waehrend der ersten Haelfte eines Sechs-Pixel-Zugs
   * bleibt die Figur am Absatz haengen (der Zeichenversatz waechst mit der
   * Simulation mit), dann reisst sie in einem schnellen, abklingenden Ruck
   * nach oben zum naechsten Griff.
   *
   * Drei Dinge haengen an derselben Phase:
   * - `dy`: der Versatz der Treppe (in logischen Pixeln, nach unten).
   * - `takt`: die Gliedmassen frieren waehrend des Haltens auf Bild 0 ein
   *   und spielen den 16-Tick-Zyklus des Blatts im Ruck ab — Zug fuer Zug,
   *   statt eines Radfahrens neben der Bewegung.
   *
   * Das Haar schwingt **mit**, aber nicht mehr von hier aus: Es haengt seit
   * dem Haar-Umbau am Knochen `HaarSchwung` und ist damit in die vier
   * Kletterbilder gebacken — Bild 0 Ruhe, Bild 1 Nachschleppen, Bild 2
   * Ueberschwung, Bild 3 Einpendeln. Vorher drehte der Zeichner dafuer den
   * Stirnvektor und malte Zacken darauf; das war Farbe auf einer Kappe und
   * konnte die Silhouette gar nicht erreichen. Die Zuordnung der Bilder haengt
   * an `ZUG_TAKT` weiter unten: Wer daran dreht, verschiebt die Haarphasen
   * mit.
   *
   * Alles rechnet allein aus `w.y`: deterministisch, zustandslos, und beim
   * Zeitruecklauf von selbst richtig.
   */
  private kletterZug(y: number): { dy: number; takt: number } {
    const HUB = 6;
    const HALT = 3;
    const hoch = -y;
    const c = ((hoch % HUB) + HUB) % HUB;
    const zuege = Math.floor(hoch / HUB);
    const ZUG_TAKT = [0, 0, 0, 4, 9, 14];
    if (c < HALT) return { dy: c, takt: zuege * 16 + ZUG_TAKT[c] };
    const rest = (c - HALT) / (HUB - HALT);
    const e = 1 - (1 - rest) * (1 - rest);
    return { dy: c * (1 - e), takt: zuege * 16 + ZUG_TAKT[c] };
  }

  /**
   * Der Sprung ins Tor.
   *
   * ## Was vorher passierte
   *
   * Die Figur schrumpfte auf der Stelle und wurde durchsichtig — wo auch immer
   * sie den Ausgang zum ersten Mal beruehrte. Das war am **Rand** des Tors, weil
   * die Simulation jede Ueberdeckung mit dem Ausgangsrechteck zaehlte (das ist
   * jetzt anders, siehe `EXIT_SCHWELLE`), und es sah nach Verschwinden aus, nicht
   * nach Ankommen. Ein Ausgang, in den niemand hineingeht, ist kein Ausgang,
   * sondern eine Falle mit gutem Licht.
   *
   * ## Was jetzt passiert
   *
   * Ein Bogen zur Mitte des Tors: Die Figur setzt ab, steigt, kommt auf der
   * Schwelle an und geht dort erst ins Licht. Zwei Teile:
   *
   * - **Der Weg** wird weich ein- und ausgeblendet (`smoothstep`), damit der
   *   Absprung kein Ruck ist.
   * - **Der Bogen** ist ein halber Sinus. Eine gerade Linie zum Tor waere ein
   *   Gleiten; erst die Hoehe macht daraus einen Sprung.
   *
   * ## Warum hier **nicht** geschrumpft wird
   *
   * Weil das Blatt es schon tut. Die sechs gebackenen Bilder der Rettung zeigen
   * eine Figur, die kleiner wird und verschwindet — das kommt aus dem Modell.
   * Ein zweites Schrumpfen darueber waere quadratisch: Die Figur waere nach
   * einem Drittel des Sprungs weg, und man saehe von dem Bogen genau nichts.
   * Genau dieser Fehler stand hier, bis der Blattabzug ihn gezeigt hat.
   *
   * Der Bogen ist deshalb frueher fertig als der Zustand (`BOGEN_ANTEIL`): Was
   * das Blatt im letzten Drittel zeigt, ist schon fast nichts mehr, und eine
   * Bewegung, die dort noch laeuft, sieht niemand.
   *
   * Zurueck kommen logische Pixel, kein Bildschirmmass — der Aufrufer
   * multipliziert mit dem Massstab. Das haelt die Rechnung von der Kamera frei.
   */
  private rettungsSprung(w: Wusel, world: World): { dx: number; dy: number } | null {
    if (w.state !== State.SAVING) return null;
    const t = Math.min(1, w.timer / (SAVING_TICKS * BOGEN_ANTEIL));
    const weich = t * t * (3 - 2 * t);
    const e = world.exit;
    // Ziel ist die Schwelle in der Tormitte, nicht der Mittelpunkt des Rechtecks:
    // Man geht in eine Tuer hinein, man schwebt nicht in ihrer Mitte.
    const zielX = e.x + e.w / 2;
    const zielY = e.y + e.h * 0.86;
    const bogen = Math.sin(t * Math.PI) * WUSEL_H * 0.6;
    return { dx: (zielX - w.x) * weich, dy: (zielY - w.y) * weich - bogen };
  }

  /**
   * Himmel mit drei Stützstellen statt zwei.
   *
   * Ein Verlauf zwischen zwei Farben ist eine Rampe und sieht auch so aus.
   * Der dritte Wert auf halber Höhe biegt ihn — oben bleibt es lange dunkel,
   * zum Horizont hin wird es schnell hell. Das ist, was ein Abendhimmel tut.
   */
  /**
   * Die Seitenwaende der Welt — der sichtbare Grund, warum am Rand Schluss ist.
   *
   * Die Simulation behandelt den Weltrand seit jeher als Wand: Eine Figur
   * dreht dort um wie an Fels. Gezeichnet wurde dort aber Himmel, und so sah
   * es aus, als drehte der Wusel **am Abgrund einfach um** — genau so kam es
   * als Rueckmeldung. Die Wand, die die Simulation meint, muss man sehen.
   *
   * Jenseits der Weltgrenzen steht deshalb massives Gestein: eine dunkle
   * Felsflaeche im Ton der Welt, zur Spielflaeche hin beleuchtet (dort ist
   * das Licht), nach aussen absinkend, mit ein paar senkrechten Schattenfugen
   * als Massstab. Unten bleibt der Abgrund offen — der ist echt.
   */
  private drawSeitenwaende(ctx: CanvasRenderingContext2D, v: View): void {
    const linksS = sx(v, 0);
    const rechtsS = sx(v, this.level.width);
    const box = v.box;
    if (linksS <= box.x && rechtsS >= box.x + box.w) return;

    const ton = this.palette.rock >>> 0;
    const dunkel = (f: number): string => {
      const r = Math.round(((ton >> 16) & 255) * f);
      const g = Math.round(((ton >> 8) & 255) * f);
      const b = Math.round((ton & 255) * f);
      return `rgb(${r}, ${g}, ${b})`;
    };

    const wand = (vonX: number, bisX: number, kante: number, richtung: 1 | -1): void => {
      const breite = bisX - vonX;
      if (breite <= 0) return;
      // Beleuchtet an der Kante zur Spielflaeche, dunkler in der Tiefe.
      const g = ctx.createLinearGradient(kante, 0, kante - richtung * Math.max(140, breite), 0);
      g.addColorStop(0, dunkel(0.62));
      g.addColorStop(1, dunkel(0.34));
      ctx.fillStyle = g;
      ctx.fillRect(vonX, box.y, breite, box.h);
      // Senkrechte Schattenfugen geben der Flaeche Massstab — eine glatte
      // Wand in einem Verlauf laese sich wieder als Himmel, nur dunkler.
      ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
      const schritt = Math.max(18, 26 * v.scale);
      const start = Math.floor((vonX - box.x) / schritt) * schritt + box.x;
      for (let x = start; x < bisX; x += schritt) {
        const w = 2 + ((x * 7919) % 5);
        if (x + w > vonX && x < bisX) {
          ctx.fillRect(Math.max(vonX, x), box.y, Math.min(w, bisX - x), box.h);
        }
      }
      // Die Lichtkante: der eine helle Strich, der sagt, wo die Wand beginnt.
      ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
      ctx.fillRect(kante - (richtung < 0 ? 2 : 0), box.y, 2, box.h);
    };

    if (linksS > box.x) wand(box.x, Math.min(linksS, box.x + box.w), linksS, -1);
    if (rechtsS < box.x + box.w) {
      wand(Math.max(rechtsS, box.x), box.x + box.w, rechtsS, 1);
    }
  }

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

    // Das Korn direkt auf den Verlauf. Es steht mit der Kamera still — bei
    // fuenf bis acht von 255 Deckung merkt das Auge davon nichts, es sieht
    // nur, dass die Streifen des Verlaufs weg sind.
    if (this.korn) {
      ctx.fillStyle = this.korn;
      ctx.fillRect(v.box.x, v.box.y, v.box.w, v.box.h);
    }

    // Der Himmelskoerper kommt **vor** den Wolken: Sie ziehen vor ihm vorbei,
    // und genau dieses Davor-und-Dahinter macht den Himmel zum Raum.
    this.drawSonne(ctx, v);
    // Das gemalte Wolkenband, wo es eines gibt — die Hoehle behaelt ihre
    // Lichtinseln, und ohne Bild bleiben die prozeduralen Ballen.
    if (!this.kulisse.drawWolken(ctx, v)) this.drawWolken(ctx, v);
  }

  /**
   * Sonne, Glutball oder Lichtschacht — die eine Lichtquelle der Welt.
   *
   * Weltverankert mit sehr traeger Parallaxe (0.06): Sie steht noch weiter
   * hinten als die Wolken und bewegt sich beim Schwenken fast gar nicht.
   * `'screen'` statt Deckung, damit sie auch vor hellem Himmel Licht bleibt.
   */
  private drawSonne(ctx: CanvasRenderingContext2D, v: View): void {
    if (!this.sonneSprite) return;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    if (!this.sonnePos) {
      // Die Hoehle: kein Ball, sondern ein breiter Schein von oben — Licht,
      // das durch einen Schacht einfaellt. Dieselbe Backform, flach gestreckt
      // und an den oberen Rand gelegt.
      const w = v.box.w * 1.3;
      const h = v.box.h * 0.55;
      ctx.drawImage(this.sonneSprite, v.box.x + v.box.w / 2 - w / 2, v.box.y - h * 0.55, w, h);
    } else {
      const f = 0.06;
      const refX = this.level.width / 2;
      const refY = this.level.height * 0.42;
      const px = v.box.x + (this.sonnePos.x - (v.ox * f + refX * (1 - f))) * v.scale;
      const py = v.box.y + (this.sonnePos.y - (v.oy * f + refY * (1 - f))) * v.scale;
      const d = v.box.w * 0.32;
      ctx.drawImage(this.sonneSprite, px - d / 2, py - d / 2, d, d);
    }
    ctx.restore();
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
    const hoehle = this.level.theme === 'crystal';
    for (const w of this.wolken) {
      const cx = v.box.x + (w.x - ox) * v.scale;
      const cy = v.box.y + (w.y - oy) * v.scale;
      const r = w.r * v.scale;
      if (cx < v.box.x - r * 3 || cx > v.box.x + v.box.w + r * 3) continue;
      if (hoehle) {
        // Unter Tage gibt es keine Wolken. An ihrer Stelle schimmern ferne
        // Lichtinseln — der Widerschein der Kristalle in der Höhlenluft. Sie
        // nutzen dieselben gespeicherten Orte, damit der Raumeindruck (weit
        // hinten, fast unbewegt) erhalten bleibt.
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.5);
        g.addColorStop(0, `rgba(191, 230, 255, ${w.deckung * 0.3})`);
        g.addColorStop(1, 'rgba(191, 230, 255, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 1.5, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }
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
  private drawHills(ctx: CanvasRenderingContext2D, v: View, tick = 0): void {
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
    // Die gemalten Baender uebernehmen, sobald sie entschluesselt sind —
    // Bewuchs, Wiesenflecken und Lichtsaum gehoeren zur prozeduralen
    // Zeichnung und entfallen mit ihr; die Nebelbaenke darunter bleiben,
    // sie sind eine eigene Schicht der Staffelung.
    const gemalt = this.kulisse.drawBerge(ctx, v);
    for (const layer of gemalt ? [] : this.hills) {
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
        // Der Schattenton folgt der Welt: Wiesengrün im Grasland, Tiefblau in
        // der Klamm — ein grüner Schatten auf blauem Fels läse sich als Moos.
        const schatten = this.level.theme === 'crystal' ? '10, 14, 40' : '12, 34, 20';
        for (const f of this.flecken) {
          const fx = v.box.x + (f.x - ox) * v.scale;
          const fy = v.box.y + (f.y - oy) * v.scale;
          const fr = f.r * v.scale;
          const gg = ctx.createRadialGradient(fx, fy, 0, fx, fy, fr);
          gg.addColorStop(0, `rgba(${schatten}, ${f.tiefe})`);
          gg.addColorStop(1, `rgba(${schatten}, 0)`);
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

    // Die Nebelbaenke nach allen Schichten: Sie verschlucken den Fuss des
    // vordersten Huegels. Ihre Parallaxe (0.85) liegt zwischen Huegel (0.68)
    // und Terrain (1.0) — die Zwischenschicht, die der Staffelung fehlte.
    // Der Drift ist reine Ansicht (Sekundenmass aus dem Tick, kein
    // Simulationszustand) und so langsam, dass man ihn nur beim Vergleichen
    // zweier Standbilder saehe — Nebel schleicht.
    if (this.nebelSprite) {
      const f = 0.85;
      const refX = this.level.width / 2;
      const refY = this.level.height * 0.42;
      const ox = v.ox * f + refX * (1 - f);
      const oy = v.oy * f + refY * (1 - f);
      const t = tick / 60;
      ctx.save();
      for (let i = 0; i < this.nebelBaenke.length; i++) {
        const b = this.nebelBaenke[i];
        const drift = Math.sin(t * 0.05 + i * 2.1) * 8;
        const bx = v.box.x + (b.x + drift - ox) * v.scale;
        const by = v.box.y + (b.y - oy) * v.scale;
        const bw = b.w * v.scale;
        const bh = b.h * v.scale;
        if (bx + bw < v.box.x || bx - bw > v.box.x + v.box.w) continue;
        ctx.globalAlpha = b.deckung;
        ctx.drawImage(this.nebelSprite, bx - bw / 2, by - bh / 2, bw, bh);
      }
      ctx.restore();
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
    const hoehle = this.level.theme === 'crystal';
    const halde = this.level.theme === 'rust';
    for (const b of this.baeume) {
      const px = v.box.x + (b.x - ox) * v.scale;
      if (px < v.box.x - 20 || px > v.box.x + v.box.w + 20) continue;
      const py = v.box.y + (b.y - oy) * v.scale;
      const h = b.h * v.scale;
      const br = h * 0.34 * b.breit;
      if (halde) {
        // Auf der Halde waechst nichts: Der Massstab kommt von dem, was
        // stehen geblieben ist — Schlote, Masten, ein gekippter Traeger.
        // Dieselben Orte und Groessen wie die Baeume, andere Silhouette.
        if (b.form === 1) {
          // Der Schlot, mit Krone.
          ctx.fillRect(px - br * 0.3, py - h * 1.1, br * 0.6, h * 1.1);
          ctx.fillRect(px - br * 0.45, py - h * 1.2, br * 0.9, h * 0.14);
        } else if (b.form === 2) {
          // Der gekippte Traeger.
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(-0.28);
          ctx.fillRect(-br * 0.16, -h * 1.05, br * 0.32, h * 1.05);
          ctx.restore();
        } else {
          // Der Gittermast: Stamm und zwei Querstreben.
          ctx.fillRect(px - br * 0.14, py - h, br * 0.28, h);
          ctx.fillRect(px - br * 0.75, py - h * 0.82, br * 1.5, h * 0.09);
          ctx.fillRect(px - br * 0.5, py - h * 0.5, br, h * 0.09);
        }
        continue;
      }
      if (hoehle) {
        // In der Klamm wachsen keine Bäume: Der Massstab auf dem Grat kommt
        // von Kristallzacken — dieselben Orte und Grössen, andere Silhouette.
        ctx.beginPath();
        if (b.form === 1) {
          // Die hohe Nadel mit kleinem Seitzacken.
          ctx.moveTo(px - br * 0.5, py + 1);
          ctx.lineTo(px - br * 0.08, py - h * 1.05);
          ctx.lineTo(px + br * 0.34, py + 1);
          ctx.moveTo(px + br * 0.3, py + 1);
          ctx.lineTo(px + br * 0.72, py - h * 0.4);
          ctx.lineTo(px + br * 1.05, py + 1);
        } else if (b.form === 2) {
          // Der gekippte Zacken — gewachsen, wie die Ader ihn schob.
          ctx.moveTo(px - br * 0.9, py + 1);
          ctx.lineTo(px + br * 0.25, py - h * 0.72);
          ctx.lineTo(px + br * 0.85, py + 1);
        } else {
          // Die Doppelspitze.
          ctx.moveTo(px - br * 0.85, py + 1);
          ctx.lineTo(px - br * 0.3, py - h * 0.62);
          ctx.lineTo(px + br * 0.05, py + 1);
          ctx.moveTo(px - br * 0.12, py + 1);
          ctx.lineTo(px + br * 0.32, py - h * 0.88);
          ctx.lineTo(px + br * 0.95, py + 1);
        }
        ctx.closePath();
        ctx.fill();
        // Eine Flanke fängt das Licht aus der Wand — daran erkennt das Auge
        // Kristall statt Fels.
        ctx.save();
        ctx.strokeStyle = 'rgba(191, 230, 255, 0.22)';
        ctx.lineWidth = Math.max(0.7, v.scale * 0.4);
        ctx.beginPath();
        if (b.form === 2) {
          ctx.moveTo(px - br * 0.9, py + 1);
          ctx.lineTo(px + br * 0.25, py - h * 0.72);
        } else if (b.form === 1) {
          ctx.moveTo(px - br * 0.5, py + 1);
          ctx.lineTo(px - br * 0.08, py - h * 1.05);
        } else {
          ctx.moveTo(px - br * 0.12, py + 1);
          ctx.lineTo(px + br * 0.32, py - h * 0.88);
        }
        ctx.stroke();
        ctx.restore();
        continue;
      }
      // Stamm zuerst, dann die Krone — drei Silhouetten im Wechsel:
      // die runde Laubkrone, die hohe schmale Pappel, der flache Schirm.
      ctx.fillRect(px - Math.max(0.6, br * 0.16), py - h * 0.45, Math.max(1.2, br * 0.32), h * 0.5);
      ctx.beginPath();
      if (b.form === 1) {
        // Pappel: zwei gestapelte, schmale Ovale.
        ctx.ellipse(px, py - h * 0.55, br * 0.55, h * 0.34, 0, 0, Math.PI * 2);
        ctx.ellipse(px, py - h * 0.86, br * 0.38, h * 0.2, 0, 0, Math.PI * 2);
      } else if (b.form === 2) {
        // Schirm: eine breite, flache Haube mit gerader Unterkante.
        ctx.ellipse(px, py - h * 0.52, br * 1.35, h * 0.26, 0, Math.PI, 0);
        ctx.closePath();
      } else {
        // Laubkrone: drei ueberlappende Kreise.
        ctx.arc(px, py - h * 0.62, br, 0, Math.PI * 2);
        ctx.arc(px - br * 0.62, py - h * 0.44, br * 0.72, 0, Math.PI * 2);
        ctx.arc(px + br * 0.62, py - h * 0.44, br * 0.72, 0, Math.PI * 2);
      }
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

    // Fugen im Rahmen: kurze Querstriche, die aus dem Band einzelne
    // Bogensteine machen. Ohne sie ist der Rahmen bei Zoom 3 ein
    // strukturloser Streifen — genau die Stelle, die die Kritik meinte.
    ctx.strokeStyle = 'rgba(58, 44, 30, 0.5)';
    ctx.lineWidth = Math.max(0.8, v.scale * 0.4);
    ctx.beginPath();
    for (const t of [0.22, 0.5, 0.78]) {
      // Seitliche Fugen, waagerecht.
      ctx.moveTo(x - rand, y + h * t);
      ctx.lineTo(x, y + h * t);
      ctx.moveTo(x + w, y + h * t);
      ctx.lineTo(x + w + rand, y + h * t);
    }
    // Fugen im Bogen, radial zum Scheitel.
    for (const seite of [-1, 1]) {
      const fx = mx + seite * w * 0.3;
      ctx.moveTo(fx, y - rand);
      ctx.lineTo(fx + seite * rand * 0.4, y + rand * 0.6);
    }
    ctx.stroke();

    // Schlussstein im Scheitel und Schwelle am Fuss. Zwei kleine Teile, die
    // aus einem Loch mit Rahmen ein gebautes Tor machen.
    ctx.fillStyle = '#cbb89c';
    ctx.fillRect(mx - rand * 0.7, y - rand * 1.5, rand * 1.4, rand * 1.1);
    ctx.fillStyle = '#6d5c46';
    ctx.fillRect(x - rand * 1.4, y + h - rand * 0.5, w + rand * 2.8, rand * 0.9);

    // Zwei Lampen am Rahmen. Sie sind das Erkennungszeichen aus der
    // Entfernung: Auch zu zwei Dritteln verdeckt liest sich ein Paar warmer
    // Lichter neben einem Bogen als „das Ziel". Sie pulsen gegeneinander
    // versetzt — zwei Flammen brennen nie im Takt.
    for (const seite of [-1, 1]) {
      const lx = mx + seite * (w / 2 + rand * 0.55);
      const ly = y + h * 0.3;
      const lp = 0.6 + 0.4 * Math.sin(tick / 17 + (seite < 0 ? 0 : 1.9));
      const lr = Math.max(1.4, rand * 0.62);
      // Halterung.
      ctx.fillStyle = '#4a3c2c';
      ctx.fillRect(lx - lr * 0.28, ly - lr * 1.7, lr * 0.56, lr * 1.2);
      // Schein.
      const lschein = ctx.createRadialGradient(lx, ly, 0, lx, ly, lr * 4.2);
      lschein.addColorStop(0, `rgba(255, 214, 130, ${0.4 * lp})`);
      lschein.addColorStop(1, 'rgba(255, 214, 130, 0)');
      ctx.fillStyle = lschein;
      ctx.beginPath();
      ctx.arc(lx, ly, lr * 4.2, 0, Math.PI * 2);
      ctx.fill();
      // Der Leuchtkoerper selbst.
      ctx.fillStyle = `rgba(255, 236, 178, ${0.75 + 0.25 * lp})`;
      ctx.beginPath();
      ctx.arc(lx, ly, lr, 0, Math.PI * 2);
      ctx.fill();
    }
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
    // Die Klappen schwingen schon im Vorlauf auf — knapp 0,7 s vor dem
    // ersten Spawn, zusammen mit dem Knarren. Vorher standen Oeffnen und
    // erster Fall im selben Augenblick, und die Tuer war nie zu sehen zu.
    this.klappeZiel =
      world.hatchOpen || (world.released === 0 && world.lukeVorlauf > 0 && world.lukeVorlauf <= 40)
        ? 1
        : 0;
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
      // Weiter herunter als vorher: „offen und geschlossen unterscheiden sich
      // kaum" stand in der Kritik, und der Winkel war der Grund — die Klappen
      // kippten um ein Drittel und blieben im Umriss des Kastens. Jetzt
      // haengen sie offen sichtbar **unter** ihm.
      const spitzeY = y + h * 0.66 + auf * tief * 2.6;
      ctx.beginPath();
      ctx.moveTo(anschlag, y + h * 0.66);
      ctx.lineTo(spitzeX, spitzeY);
      ctx.lineTo(spitzeX, spitzeY + tief * (1 - auf * 0.45));
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

    // Die Warnlampe am Gehaeuse. Sie ist der Unterschied aus dem Augenwinkel:
    // Zu heisst dunkel, offen heisst Blinklicht — das erste Ereignis jeder
    // Runde bekommt damit ein Signal, das man nicht uebersehen kann.
    const lx = mx;
    const ly = y + h * 0.2;
    const lr = Math.max(1.2, h * 0.14);
    if (world.hatchOpen) {
      const blink = 0.5 + 0.5 * Math.sin(world.tickCount / 9);
      const bs = ctx.createRadialGradient(lx, ly, 0, lx, ly, lr * 5);
      bs.addColorStop(0, `rgba(255, 176, 64, ${0.5 * blink})`);
      bs.addColorStop(1, 'rgba(255, 176, 64, 0)');
      ctx.fillStyle = bs;
      ctx.beginPath();
      ctx.arc(lx, ly, lr * 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255, ${170 + Math.round(70 * blink)}, 70, ${0.6 + 0.4 * blink})`;
    } else {
      ctx.fillStyle = '#5a4736';
    }
    ctx.beginPath();
    ctx.arc(lx, ly, lr, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawParticles(ctx: CanvasRenderingContext2D, v: View): void {
    for (const p of this.particles) {
      const a = Math.max(0, Math.min(1, p.life / p.max));
      const px = sx(v, p.x);
      const py = sy(v, p.y);
      ctx.fillStyle = p.color;
      if (p.form === 'weich') {
        // Feuer und Rauch: ein weicher Kreis, der ueber die Lebenszeit
        // waechst und verblasst. Zwei Scheiben statt eines Verlaufs — ein
        // createRadialGradient je Teilchen und Bild waere zu teuer.
        const r = Math.max(1, p.size * v.scale * (1.5 - a * 0.8));
        ctx.globalAlpha = a * 0.55;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = a * 0.7;
        ctx.beginPath();
        ctx.arc(px, py, r * 0.55, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.form === 'brocken') {
        // Der Erdbrocken: ein gedrehtes Viereck. Der Drall ist der
        // Unterschied zwischen Konfetti und Wurfgut.
        const s = Math.max(1.4, p.size * v.scale);
        ctx.globalAlpha = a;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(p.winkel ?? 0);
        ctx.fillRect(-s / 2, -s / 2, s, s * 0.8);
        ctx.restore();
      } else {
        ctx.globalAlpha = a;
        const s = Math.max(1, p.size * v.scale);
        ctx.fillRect(px, py, s, s);
      }
    }
    // Der Weissblitz zuletzt, ueber allem: die zwei Bilder, in denen die
    // Sprengung das Bild besitzt.
    for (const b of this.blitze) {
      const t = Math.max(0, b.life / b.max);
      const r = (18 + (1 - t) * 26) * v.scale;
      const g = ctx.createRadialGradient(sx(v, b.x), sy(v, b.y), 0, sx(v, b.x), sy(v, b.y), r);
      g.addColorStop(0, `rgba(255, 252, 240, ${0.9 * t})`);
      g.addColorStop(0.55, `rgba(255, 235, 190, ${0.5 * t})`);
      g.addColorStop(1, 'rgba(255, 235, 190, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(sx(v, b.x), sy(v, b.y), r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

/** Mittelpunkt des Koerpers — Zielpunkt fuer Lupe und Auswahl. */
export function wuselCenterY(y: number): number {
  return y - WUSEL_H / 2;
}
