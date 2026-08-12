import type { World } from '../core/world';
import type { LevelDef } from '../levels/types';
import type { Progress } from '../storage';
import { COL, drawStars, roundRect } from './hud';
import type { Box, Layout } from './layout';

export interface Button extends Box {
  id: string;
}

function panel(ctx: CanvasRenderingContext2D, L: Layout, h: number): Box {
  ctx.fillStyle = 'rgba(5, 8, 14, 0.72)';
  ctx.fillRect(0, 0, L.cssW, L.cssH);
  const w = Math.min(340, L.cssW - 32);
  // Quer ist die Höhe knapp — die Tafel darf nie über den Rand hinauswachsen.
  h = Math.min(h, L.cssH - 16);
  const b: Box = { x: (L.cssW - w) / 2, y: (L.cssH - h) / 2, w, h };
  ctx.fillStyle = COL.panel;
  roundRect(ctx, b.x, b.y, b.w, b.h, 16);
  ctx.fill();
  ctx.strokeStyle = COL.line;
  ctx.lineWidth = 1;
  ctx.stroke();
  return b;
}

function button(
  ctx: CanvasRenderingContext2D,
  b: Box,
  label: string,
  primary = false,
): void {
  ctx.fillStyle = primary ? '#2b6cb0' : '#1b2331';
  roundRect(ctx, b.x, b.y, b.w, b.h, 10);
  ctx.fill();
  ctx.strokeStyle = primary ? '#4c9fe0' : COL.line;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = COL.text;
  ctx.font = '600 14px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, b.x + b.w / 2, b.y + b.h / 2 + 1);
}

function wrap(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  lh: number,
): number {
  const words = text.split(' ');
  let line = '';
  let cy = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, cy);
      cy += lh;
      line = word;
    } else {
      line = test;
    }
  }
  if (line) {
    ctx.fillText(line, x, cy);
    cy += lh;
  }
  return cy;
}

export function drawIntro(
  ctx: CanvasRenderingContext2D,
  L: Layout,
  level: LevelDef,
): Button[] {
  const b = panel(ctx, L, 250);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = COL.dim;
  ctx.font = '700 11px system-ui, sans-serif';
  ctx.fillText(level.chapter.toUpperCase(), b.x + b.w / 2, b.y + 22);
  ctx.fillStyle = COL.text;
  ctx.font = '700 22px system-ui, sans-serif';
  ctx.fillText(level.name, b.x + b.w / 2, b.y + 42);

  ctx.fillStyle = COL.accent;
  ctx.font = '600 15px system-ui, sans-serif';
  ctx.fillText(
    `Rette ${level.needed} von ${level.total}`,
    b.x + b.w / 2,
    b.y + 78,
  );

  ctx.fillStyle = COL.dim;
  ctx.font = '400 13px system-ui, sans-serif';
  wrap(ctx, level.hint, b.x + b.w / 2, b.y + 108, b.w - 44, 18);

  const btn: Button = {
    id: 'start',
    x: b.x + 30,
    y: b.y + b.h - 62,
    w: b.w - 60,
    h: 44,
  };
  button(ctx, btn, 'Falltür öffnen', true);
  return [btn];
}

export function drawPause(ctx: CanvasRenderingContext2D, L: Layout): Button[] {
  const b = panel(ctx, L, 236);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = COL.text;
  ctx.font = '700 20px system-ui, sans-serif';
  ctx.fillText('Pause', b.x + b.w / 2, b.y + 24);

  const bs: Button[] = ['resume', 'restart', 'menu'].map((id, i) => ({
    id,
    x: b.x + 30,
    y: b.y + 66 + i * 52,
    w: b.w - 60,
    h: 44,
  }));
  button(ctx, bs[0], 'Weiter', true);
  button(ctx, bs[1], 'Neu starten');
  button(ctx, bs[2], 'Levelauswahl');
  return bs;
}

export function drawResult(
  ctx: CanvasRenderingContext2D,
  L: Layout,
  level: LevelDef,
  world: World,
  conditions: boolean[],
  parKnown: boolean,
  hasNext: boolean,
  zeit = Infinity,
): Button[] {
  const won = world.saved >= world.needed;
  const b = panel(ctx, L, 356);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = won ? COL.good : COL.bad;
  ctx.font = '700 22px system-ui, sans-serif';
  ctx.fillText(won ? 'Geschafft!' : 'Nicht genug', b.x + b.w / 2, b.y + 20);

  drawStars(ctx, b.x + b.w / 2, b.y + 72, 15, conditions, zeit);

  ctx.fillStyle = COL.text;
  ctx.font = '600 15px system-ui, sans-serif';
  ctx.fillText(`${world.saved} von ${world.total} gerettet`, b.x + b.w / 2, b.y + 98);

  // Die drei Sternbedingungen einzeln — sonst rät man, welcher fehlt.
  const parLabel = parKnown ? `Unter Par (${level.par})` : 'Unter Par (?)';
  const rows = ['Quote erreicht', 'Alle gerettet', parLabel];
  ctx.textAlign = 'left';
  ctx.font = '500 12px system-ui, sans-serif';
  rows.forEach((label, i) => {
    const y = b.y + 128 + i * 19;
    ctx.fillStyle = conditions[i] ? COL.accent : '#414c60';
    ctx.fillText(conditions[i] ? '★' : '☆', b.x + 34, y);
    ctx.fillStyle = conditions[i] ? COL.text : COL.dim;
    ctx.fillText(label, b.x + 54, y);
  });

  ctx.textAlign = 'center';
  ctx.fillStyle = COL.dim;
  ctx.font = '400 12px system-ui, sans-serif';
  const n = world.skillsUsed;
  ctx.fillText(
    `${n} ${n === 1 ? 'Beruf' : 'Berufe'} vergeben`,
    b.x + b.w / 2,
    b.y + 192,
  );
  if (!parKnown) {
    ctx.fillText('Die Par-Zahl erscheint nach dem ersten Sieg.', b.x + b.w / 2, b.y + 208);
  }

  const ids = won && hasNext ? ['next', 'retry', 'menu'] : ['retry', 'menu'];
  const labels =
    won && hasNext
      ? ['Nächstes Level', 'Nochmal', 'Levelauswahl']
      : ['Nochmal', 'Levelauswahl'];
  const bs: Button[] = ids.map((id, i) => ({
    id,
    x: b.x + 30,
    y: b.y + 232 + i * 42,
    w: b.w - 60,
    h: 36,
  }));
  bs.forEach((bt, i) => button(ctx, bt, labels[i], i === 0));
  return bs;
}

export function drawMenu(
  ctx: CanvasRenderingContext2D,
  L: Layout,
  levels: LevelDef[],
  progress: Progress,
): Button[] {
  ctx.fillStyle = '#0a0e16';
  ctx.fillRect(0, 0, L.cssW, L.cssH);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const wide = L.cssW > L.cssH;
  ctx.fillStyle = COL.accent;
  ctx.font = `800 ${wide ? 24 : 30}px system-ui, sans-serif`;
  ctx.fillText('WUSELWERK', L.cssW / 2, wide ? 22 : 46);
  ctx.fillStyle = COL.dim;
  ctx.font = '500 12px system-ui, sans-serif';
  ctx.fillText('Welt 1 — Grasland · MVP-Prototyp', L.cssW / 2, wide ? 52 : 82);

  // Quer stehen die Karten in zwei Spalten: fünf untereinander bräuchten mehr
  // Höhe, als ein quer gehaltenes Handy überhaupt hat.
  const landscape = L.cssW > L.cssH;
  const cols = landscape ? 2 : 1;
  const gap = 10;
  const cardH = landscape ? 56 : 62;
  const cardW = Math.min(340, (L.cssW - 32 - (cols - 1) * gap) / cols);
  const blockW = cardW * cols + gap * (cols - 1);
  const left = (L.cssW - blockW) / 2;
  const top = landscape ? 84 : 116;

  const out: Button[] = [];
  levels.forEach((lv, i) => {
    const x = left + (i % cols) * (cardW + gap);
    const y = top + Math.floor(i / cols) * (cardH + gap);
    const r: Button = { id: lv.id, x, y, w: cardW, h: cardH };
    const res = progress[lv.id];
    ctx.fillStyle = res?.won ? '#152233' : '#141a24';
    roundRect(ctx, r.x, r.y, r.w, r.h, 12);
    ctx.fill();
    ctx.strokeStyle = COL.line;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = COL.dim;
    ctx.font = '700 9px system-ui, sans-serif';
    ctx.fillText(`${i + 1} · ${lv.chapter.toUpperCase()}`, r.x + 14, r.y + 12);
    ctx.fillStyle = COL.text;
    ctx.font = '600 16px system-ui, sans-serif';
    ctx.fillText(lv.name, r.x + 14, r.y + 26);
    ctx.fillStyle = COL.dim;
    ctx.font = '400 11px system-ui, sans-serif';
    ctx.fillText(`Rette ${lv.needed} von ${lv.total}`, r.x + 14, r.y + 46);

    drawStars(ctx, r.x + r.w - 46, r.y + r.h / 2, 8, res?.stars ?? 0);
    out.push(r);
  });

  ctx.textAlign = 'center';
  ctx.fillStyle = COL.dim;
  ctx.font = '400 11px system-ui, sans-serif';
  ctx.fillText(
    'Finger halten = Fokuszeit (25 %). Erst Beruf, dann Figur.',
    L.cssW / 2,
    top + Math.ceil(levels.length / cols) * (cardH + gap) + 12,
  );
  return out;
}
