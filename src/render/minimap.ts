import { State } from '../core/types';
import type { World } from '../core/world';
import type { LevelDef } from '../levels/types';
import type { View } from './camera';
import { COL, roundRect } from './hud';
import type { Box, Layout } from './layout';

/**
 * Übersichtskarte mit Sichtfenster.
 *
 * Sie beantwortet zwei Fragen auf einmal: "Wo geht das Level noch weiter?" und
 * "Wie komme ich dorthin?" — denn sie ist zugleich der Schieber. Das ist der
 * Grund, warum sie unten rechts sitzt: in der Daumenzone, weil das Spiel laut
 * §3.5 einhändig bedienbar sein muss.
 *
 * Der Geländeschnitt entsteht durch schlichtes Herunterskalieren der
 * Terrain-Leinwand. Damit zeigt die Karte gegrabene Stollen sofort mit — man
 * sieht seine eigene Arbeit auch in der Übersicht.
 */

/**
 * Die Karte wird in diesen Rahmen eingepasst, statt eine feste Breite zu
 * bekommen. Sonst wuerde ein hohes Level eine hohe Karte ergeben, die einen
 * guten Teil des Spielfelds verdeckt.
 */
const MAP_MAX_W = 128;
const MAP_MAX_H = 78;
const MARGIN = 8;

export function minimapBox(L: Layout, level: LevelDef): Box | null {
  const k = Math.min(MAP_MAX_W / level.width, MAP_MAX_H / level.height);
  const w = Math.round(level.width * k);
  const h = Math.round(level.height * k);
  if (w < 40 || h < 24) return null;
  return {
    x: L.play.x + L.play.w - w - MARGIN,
    y: L.play.y + L.play.h - h - MARGIN,
    w,
    h,
  };
}

export function drawMinimap(
  ctx: CanvasRenderingContext2D,
  b: Box,
  level: LevelDef,
  world: World,
  terrain: HTMLCanvasElement,
  v: View,
  grabbed: boolean,
): void {
  const kx = b.w / level.width;
  const ky = b.h / level.height;

  ctx.save();
  ctx.globalAlpha = grabbed ? 1 : 0.82;

  ctx.fillStyle = '#080b12';
  roundRect(ctx, b.x, b.y, b.w, b.h, 6);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  roundRect(ctx, b.x, b.y, b.w, b.h, 6);
  ctx.clip();
  ctx.globalAlpha = grabbed ? 0.95 : 0.72;
  ctx.drawImage(terrain, b.x, b.y, b.w, b.h);
  ctx.globalAlpha = 1;

  // Ausgang und Falltür — die beiden Fixpunkte jedes Levels.
  const ex = b.x + (world.exit.x + world.exit.w / 2) * kx;
  const ey = b.y + (world.exit.y + world.exit.h / 2) * ky;
  ctx.fillStyle = COL.accent;
  ctx.beginPath();
  ctx.arc(ex, ey, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8fa4bd';
  ctx.fillRect(b.x + world.entrance.x * kx - 2, b.y + world.entrance.y * ky - 1, 4, 2);

  // Lebende Figuren
  ctx.fillStyle = '#5ce4d2';
  for (const w of world.wusels) {
    if (w.state === State.DEAD || w.state === State.SAVED) continue;
    ctx.fillRect(b.x + w.x * kx - 0.75, b.y + w.y * ky - 1.5, 1.5, 2.5);
  }

  // Sichtfenster
  const vw = (v.box.w / v.scale) * kx;
  const vh = (v.box.h / v.scale) * ky;
  const vx = b.x + v.ox * kx;
  const vy = b.y + v.oy * ky;
  ctx.strokeStyle = grabbed ? COL.accent : 'rgba(255,255,255,0.85)';
  ctx.lineWidth = grabbed ? 2 : 1.25;
  ctx.strokeRect(
    Math.max(b.x + 0.5, vx),
    Math.max(b.y + 0.5, vy),
    Math.min(vw, b.w - 1),
    Math.min(vh, b.h - 1),
  );
  ctx.restore();

  ctx.strokeStyle = grabbed ? COL.accent : COL.line;
  ctx.lineWidth = 1;
  roundRect(ctx, b.x, b.y, b.w, b.h, 6);
  ctx.stroke();
  ctx.restore();
}

/** Kartenpunkt in Levelkoordinaten. */
export function minimapToLogical(
  b: Box,
  level: LevelDef,
  x: number,
  y: number,
): { x: number; y: number } {
  return {
    x: ((x - b.x) / b.w) * level.width,
    y: ((y - b.y) / b.h) * level.height,
  };
}
