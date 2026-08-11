import { WUSEL_H } from '../core/constants';
import { State } from '../core/types';
import type { World } from '../core/world';
import { sx, sy, type View } from './camera';
import { COL } from './hud';
import type { Box } from './layout';

/**
 * Randmarken für alles, was gerade nicht im Bild ist.
 *
 * Die Übersichtskarte sagt, wo man ist. Diese Marken sagen, wohin man schauen
 * sollte — und zwar ohne den Blick vom Spielfeld zu nehmen. Zusammen ersetzen
 * sie das, was auf dem grossen Bildschirm einfach die Übersicht war.
 */

const PAD = 14;

export function drawOffscreenMarkers(
  ctx: CanvasRenderingContext2D,
  play: Box,
  v: View,
  world: World,
): void {
  drawExitMarker(ctx, play, v, world);
  drawCrowdCounts(ctx, play, v, world);
}

function drawExitMarker(
  ctx: CanvasRenderingContext2D,
  play: Box,
  v: View,
  world: World,
): void {
  const gx = sx(v, world.exit.x + world.exit.w / 2);
  const gy = sy(v, world.exit.y + world.exit.h / 2);
  const inside =
    gx >= play.x && gx <= play.x + play.w && gy >= play.y && gy <= play.y + play.h;
  if (inside) return;

  const cx = play.x + play.w / 2;
  const cy = play.y + play.h / 2;
  const px = Math.max(play.x + PAD, Math.min(play.x + play.w - PAD, gx));
  const py = Math.max(play.y + PAD, Math.min(play.y + play.h - PAD, gy));
  const a = Math.atan2(gy - cy, gx - cx);

  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(a);
  ctx.fillStyle = COL.accent;
  ctx.beginPath();
  ctx.moveTo(9, 0);
  ctx.lineTo(-5, -6);
  ctx.lineTo(-5, 6);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = 'rgba(255,214,130,0.28)';
  ctx.beginPath();
  ctx.arc(px, py, 13, 0, Math.PI * 2);
  ctx.fill();
}

/** Wie viele Figuren stehen links und rechts ausserhalb des Bildes? */
function drawCrowdCounts(
  ctx: CanvasRenderingContext2D,
  play: Box,
  v: View,
  world: World,
): void {
  let left = 0;
  let right = 0;
  for (const w of world.wusels) {
    if (w.state === State.DEAD || w.state === State.SAVED) continue;
    const px = sx(v, w.x);
    const py = sy(v, w.y - WUSEL_H / 2);
    if (py < play.y - 40 || py > play.y + play.h + 40) continue;
    if (px < play.x) left++;
    else if (px > play.x + play.w) right++;
  }
  if (left > 0) chip(ctx, play.x + 16, play.y + play.h * 0.42, -1, left);
  if (right > 0) chip(ctx, play.x + play.w - 16, play.y + play.h * 0.42, 1, right);
}

function chip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  dir: -1 | 1,
  n: number,
): void {
  ctx.save();
  ctx.fillStyle = 'rgba(10,14,22,0.78)';
  ctx.beginPath();
  ctx.arc(x, y, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(92,228,210,0.75)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#5ce4d2';
  ctx.beginPath();
  ctx.moveTo(x + dir * 7, y - 6);
  ctx.lineTo(x + dir * 7, y + 6);
  ctx.lineTo(x + dir * 12, y);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = COL.text;
  ctx.font = '700 11px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(n), x - dir * 3, y + 1);
  ctx.restore();
}
