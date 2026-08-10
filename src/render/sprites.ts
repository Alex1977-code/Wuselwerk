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

  // Grundsilhouette: dunkler Umriss, damit die Figur auf jedem Untergrund liest.
  R(-3, -WUSEL_H - 1, 6, WUSEL_H + 1, OUTLINE);
  R(-2, -WUSEL_H, 4, 4, SKIN);
  R(-2, -8, 4, 6, BODY);
  R(-2, -2, 4, 2, BODY_DARK);

  if (w.hasClimber) R(-3, -WUSEL_H - 2, 6, 2, TOOL);
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
      // Arme weit auseinander — die breiteste Silhouette im Spiel.
      R(-6, -9, 12, 2, BLOCK);
      R(-5, -7, 2, 2, BLOCK);
      R(3, -7, 2, 2, BLOCK);
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

  if (w.fuse > 0) drawFuse(ctx, v, w, tick);
}

function drawFuse(
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
