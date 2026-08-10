import { WUSEL_H } from '../core/constants';
import type { Wusel } from '../core/types';
import type { World } from '../core/world';
import { sx, sy, type View } from './camera';
import type { Box } from './layout';
import type { Scene } from './scene';

export const MAG_RADIUS = 54;
export const MAG_ZOOM = 2.5;
/** Wie weit oberhalb des Fingers die Lupe sitzt. */
export const MAG_LIFT = 100;

/**
 * Lupe ueber dem Daumen (GDD §3.2): runder Ausschnitt oberhalb des Fingers,
 * 2,5-fach vergroessert. Der Daumen verdeckt nie sein eigenes Ziel.
 */
export function magnifierCenter(cssX: number, cssY: number, play: Box): { x: number; y: number } {
  const m = MAG_RADIUS + 6;
  let x = cssX;
  let y = cssY - MAG_LIFT;
  x = Math.max(play.x + m, Math.min(play.x + play.w - m, x));
  // Klebt der Finger oben am Rand, rutscht die Lupe unter ihn.
  if (y - MAG_RADIUS < play.y + 4) y = cssY + MAG_LIFT;
  y = Math.max(play.y + m, Math.min(play.y + play.h - m, y));
  return { x, y };
}

export function drawMagnifier(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  world: World,
  mainView: View,
  tick: number,
  aimX: number,
  aimY: number,
  center: { x: number; y: number },
  target: Wusel | null,
): void {
  const r = MAG_RADIUS;
  const scale = mainView.scale * MAG_ZOOM;
  const box: Box = { x: center.x - r, y: center.y - r, w: r * 2, h: r * 2 };
  const view: View = {
    ox: aimX - r / scale,
    oy: aimY - r / scale,
    scale,
    box,
  };

  ctx.save();
  ctx.beginPath();
  ctx.arc(center.x, center.y, r, 0, Math.PI * 2);
  ctx.clip();
  scene.draw(ctx, view, world, tick);

  // Fadenkreuz
  ctx.strokeStyle = 'rgba(255,255,255,0.28)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(center.x - 9, center.y);
  ctx.lineTo(center.x + 9, center.y);
  ctx.moveTo(center.x, center.y - 9);
  ctx.lineTo(center.x, center.y + 9);
  ctx.stroke();

  if (target) {
    ctx.strokeStyle = '#ffe066';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(sx(view, target.x), sy(view, target.y - WUSEL_H / 2), 14, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  ctx.strokeStyle = 'rgba(12,17,25,0.9)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(center.x, center.y, r + 1, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = target ? '#ffe066' : 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(center.x, center.y, r + 1, 0, Math.PI * 2);
  ctx.stroke();
}
