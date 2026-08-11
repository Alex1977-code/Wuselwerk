import { WUSEL_H } from '../core/constants';
import { State, type Wusel } from '../core/types';
import { sx, sy, type View } from './camera';

const OUTLINE = '#0c1119';
const BODY = '#2fc9b8';
const BODY_DARK = '#1d8f85';
const SKIN = '#f4d7ac';
const TOOL = '#ffd23f';
const BLOCK = '#ff7a45';
const BOMB = '#ff4d4d';
/**
 * Haarrampe: Glanz oben, Grundton, Schatten unten.
 *
 * Violett und nicht mehr Rot. Der Grund steht in `grafik-katalog.md` §3.1 und
 * ist im Kern einer: Die Figur läuft die meiste Zeit auf brauner Erde, und
 * Braun liegt auf dem Farbkreis bei rund 30 Grad. Rotes Haar stand dort 24
 * Grad daneben — fast derselbe Farbton, getragen nur vom Helligkeitssprung.
 * Violett steht 113 Grad entfernt, also nahezu gegenüber. Dazu löst es die
 * engste Paarung der ganzen Palette: Haar und Gefahrenrot lagen 4 Grad
 * auseinander, jetzt sind es 275.
 */
const HAIR = '#9d4edd';
const HAIR_LIGHT = '#c98bff';
const HAIR_DARK = '#67219c';

/**
 * Die Mähne — das Erkennungsmerkmal der Figur (GDD §6, Ankerbild A0).
 *
 * Je Eintrag eine Zeile: `[y, x0, breite]` im Vorwärtsrahmen der Figur, also
 * +x nach vorn und y negativ nach oben, gemessen vom Fusspunkt. Die Tabellen
 * sind von oben nach unten sortiert — daraus ergibt sich die Färbung: die
 * obersten Zeilen bekommen den Glanz, die untersten den Schatten.
 *
 * Drei Lagen statt einer, weil Haar der Bewegung entgegensteht: Wer läuft,
 * zieht es nach hinten; wer fällt, dem steht es senkrecht nach oben; wer
 * steht und arbeitet, bei dem hängt es. Das ist derselbe Gedanke wie beim
 * Blockersignal — die Lage der Masse erzählt den Zustand, nicht die Farbe.
 */
type ManeRow = readonly [y: number, x0: number, w: number];

/**
 * Laufend: ein liegender Komet, kein Aufbau über dem Kopf.
 *
 * Die hintere Kante ist bewusst eine Linse — am weitesten hinten auf
 * Kopfhöhe, nach oben und unten kürzer. Eine senkrechte Hinterkante liest bei
 * dieser Grösse als Kappe; erst die Spitze macht daraus Haar. Und die Masse
 * liegt eher hinter als über dem Kopf, sonst erdrückt sie den 6 × 4 grossen
 * Kopf, der die zweite tragende Fläche der Figur ist.
 */
const MANE_BACK: readonly ManeRow[] = [
  [-16, -6, 3],
  [-15, -8, 5],
  [-14, -10, 8],
  [-13, -11, 10],
  [-12, -11, 9],
  [-11, -10, 7],
  [-10, -9, 6],
  [-9, -7, 4],
];

const MANE_UP: readonly ManeRow[] = [
  [-19, -3, 4],
  [-18, -4, 6],
  [-17, -5, 8],
  [-16, -6, 9],
  [-15, -6, 10],
  [-14, -7, 11],
  [-13, -7, 11],
  [-12, -6, 12],
  [-11, -6, 3],
  [-10, -6, 3],
  [-9, -5, 2],
];

const MANE_HANG: readonly ManeRow[] = [
  [-14, -5, 2],
  [-13, -7, 5],
  [-12, -8, 6],
  [-11, -9, 6],
  [-10, -9, 6],
  [-9, -9, 6],
  // Ende auf Schulterhöhe: Haar und Oberteil stehen nur 22 Helligkeitsstufen
  // auseinander, und bei 12 Pixeln verschmelzen zwei grosse Flächen mit so
  // wenig Abstand zu einer.
  [-8, -8, 5],
  [-7, -7, 4],
];

/**
 * Blocker: dieselbe Lage, aber nur bis Schulterhöhe.
 *
 * Die Blockerarme liegen auf `y−9` bis `y−7` und sind orange; die hängende
 * Mähne läge genau darauf. Zwei grosse Flächen ähnlicher Helligkeit werden bei
 * 12 Pixeln eine — und das kostet dem Blocker sein Signal. Deshalb endet das
 * Haar hier über den Armen.
 */
const MANE_BLOCK: readonly ManeRow[] = MANE_HANG.slice(0, 4);

function maneFor(w: Wusel): readonly ManeRow[] {
  switch (w.state) {
    case State.WALKING:
      return MANE_BACK;
    case State.FALLING:
      return w.hasFloater && w.fallDist >= 10 ? MANE_HANG : MANE_UP;
    case State.BLOCKING:
      return MANE_BLOCK;
    default:
      return MANE_HANG;
  }
}

/** Rechteck in logischen Pixeln, auf ganze Bildschirmpixel gerundet. */
function rect(
  ctx: CanvasRenderingContext2D,
  v: View,
  lx: number,
  ly: number,
  lw: number,
  lh: number,
  color: string,
): void {
  const x = Math.round(sx(v, lx));
  const y = Math.round(sy(v, ly));
  const x2 = Math.round(sx(v, lx + lw));
  const y2 = Math.round(sy(v, ly + lh));
  ctx.fillStyle = color;
  ctx.fillRect(x, y, Math.max(1, x2 - x), Math.max(1, y2 - y));
}

/** Rechteck im Vorwärtsrahmen der Figur, bereits gespiegelt. */
type RectFn = (ox: number, oy: number, ow: number, oh: number, c: string) => void;

/**
 * Zeichnet die Mähne mit geschlossenem Umriss.
 *
 * Der Umriss entsteht, ohne die Kante zu verfolgen: Jede Zeile wird einmal um
 * einen Pixel aufgebläht in Dunkel gezeichnet, danach in Farbe. Die Vereinigung
 * der aufgeblähten Zeilen ist genau die um einen Pixel gewachsene Fläche —
 * also die Kontur.
 *
 * `sway` verschiebt nur das nachlaufende Ende: Die Mähne wächst nach hinten
 * und bleibt am Kopf verankert, statt als Ganzes zu rutschen.
 */
function drawMane(R: RectFn, rows: readonly ManeRow[], sway: number): void {
  for (const [y, x0, w] of rows) R(x0 - sway - 1, y - 1, w + sway + 2, 3, OUTLINE);
  // Drei Stufen: Glanz oben, Grundton, Schatten unten. Bei kurzen Tabellen
  // nur je eine Zeile, sonst bliebe vom Grundton nichts übrig.
  const edge = rows.length >= 6 ? 2 : 1;
  rows.forEach(([y, x0, w], i) => {
    const col = i < edge ? HAIR_LIGHT : i >= rows.length - edge ? HAIR_DARK : HAIR;
    R(x0 - sway, y, w + sway, 1, col);
  });
}

/**
 * Jeder Beruf ist an der Silhouette erkennbar, nicht an der Farbe (GDD §6) —
 * wichtig auf sechs Zoll und bei Farbfehlsichtigkeit.
 */
export function drawWusel(
  ctx: CanvasRenderingContext2D,
  v: View,
  w: Wusel,
  tick: number,
): void {
  if (w.state === State.DEAD || w.state === State.SAVED) return;

  const bx = w.x;
  const by = w.y;
  const d = w.dir;
  /** Spiegelt einen Versatz an der Blickrichtung. */
  const m = (off: number, width: number) => (d > 0 ? off : -(off + width));
  const R = (ox: number, oy: number, ow: number, oh: number, c: string) =>
    rect(ctx, v, bx + m(ox, ow), by + oy, ow, oh, c);

  if (w.state === State.DYING) {
    drawDying(ctx, v, w, tick);
    return;
  }
  if (w.state === State.SAVING) {
    const t = w.timer / 18;
    ctx.globalAlpha = Math.max(0, 1 - t);
    R(-2, -12 - t * 6, 4, 12, BODY);
    ctx.globalAlpha = 1;
    return;
  }

  // Reihenfolge: Umriss, Mähne, Körperflächen.
  //
  // Die Mähne liegt bewusst *über* dem Umriss und *unter* den Körperflächen.
  // Läge sie darunter, frässe der Kopfumriss die Haarzeile über dem Scheitel
  // weg und das Haar sässe wie eine Kappe auf statt daraus zu wachsen; läge
  // sie darüber, verdeckte sie das Gesicht. Nebeneffekt, der so gewollt ist:
  // zwischen Haar und Haut steht kein dunkler Innenumriss.
  R(-4, -WUSEL_H - 1, 8, 6, OUTLINE);
  R(-3, -8, 6, 8, OUTLINE);
  drawMane(R, maneFor(w), w.state === State.WALKING ? Math.floor(tick / 6) % 2 : 0);
  R(-3, -WUSEL_H, 6, 4, SKIN);
  R(-2, -8, 4, 6, BODY);
  R(-2, -2, 4, 2, BODY_DARK);
  // Ein Auge, tief im Gesicht — bei dieser Grösse der einzige Gesichtszug.
  R(1, -11, 1, 2, OUTLINE);

  if (w.hasClimber) R(-4, -WUSEL_H - 2, 8, 2, TOOL);
  if (w.hasFloater && w.state !== State.FALLING) R(2, -9, 2, 4, TOOL);

  switch (w.state) {
    case State.WALKING: {
      const step = Math.floor(tick / 6) % 2;
      R(step ? -2 : 0, -2, 2, 2, OUTLINE);
      break;
    }
    case State.FALLING:
      if (w.hasFloater && w.fallDist >= 10) {
        // Schirm — die Silhouette wird doppelt so breit.
        R(-6, -WUSEL_H - 6, 12, 2, TOOL);
        R(-4, -WUSEL_H - 4, 1, 4, OUTLINE);
        R(3, -WUSEL_H - 4, 1, 4, OUTLINE);
      } else {
        R(-4, -9, 2, 2, BODY);
        R(2, -9, 2, 2, BODY);
      }
      break;
    case State.CLIMBING:
    case State.HOISTING:
      R(1, -WUSEL_H - 2, 2, 4, BODY);
      R(-1, -WUSEL_H - 1, 2, 3, BODY);
      break;
    case State.BLOCKING:
      // Arme weit auseinander — die breiteste Silhouette im Spiel. Sie muss
      // die hängende Mähne (12 breit) übertreffen, sonst verliert das Signal
      // seinen Vorsprung; deshalb 14 statt der früheren 12.
      R(-7, -9, 14, 2, BLOCK);
      R(-6, -7, 2, 2, BLOCK);
      R(4, -7, 2, 2, BLOCK);
      break;
    case State.BUILDING: {
      const blink = w.bricks <= 3 && Math.floor(tick / 8) % 2 === 0;
      R(1, -4, 7, 1, blink ? '#ffffff' : TOOL);
      R(1, -6, 3, 2, TOOL);
      break;
    }
    case State.BASHING: {
      const swing = Math.floor(tick / 5) % 2;
      R(2, swing ? -8 : -6, 5, 2, TOOL);
      break;
    }
    case State.MINING:
      R(2, -6, 3, 2, TOOL);
      R(4, -4, 3, 2, TOOL);
      break;
    case State.DIGGING: {
      const swing = Math.floor(tick / 5) % 2;
      R(-4, swing ? -1 : 0, 8, 2, TOOL);
      break;
    }
    default:
      break;
  }

  if (w.fuse > 0) drawFuseOverlay(ctx, v, w, tick);
}

export function drawFuseOverlay(
  ctx: CanvasRenderingContext2D,
  v: View,
  w: Wusel,
  tick: number,
): void {
  const seconds = Math.ceil(w.fuse / 60);
  const fast = w.fuse < 120;
  if (Math.floor(tick / (fast ? 4 : 8)) % 2 === 0) {
    rect(ctx, v, w.x - 3, w.y - WUSEL_H - 1, 6, WUSEL_H + 1, BOMB);
  }
  const px = sx(v, w.x);
  const py = sy(v, w.y - WUSEL_H - 4);
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = '#000';
  ctx.fillText(String(seconds), px + 1, py + 1);
  ctx.fillStyle = '#ffdf5e';
  ctx.fillText(String(seconds), px, py);
}

function drawDying(
  ctx: CanvasRenderingContext2D,
  v: View,
  w: Wusel,
  _tick: number,
): void {
  const t = w.timer / 26;
  ctx.globalAlpha = Math.max(0, 1 - t);
  // Zerquetschte Silhouette — der Tod darf ruhig ein bisschen wehtun.
  const h = Math.max(1, 12 * (1 - t));
  rect(ctx, v, w.x - 3 - t * 3, w.y - h, 6 + t * 6, h, '#c8402f');
  ctx.globalAlpha = 1;
}
