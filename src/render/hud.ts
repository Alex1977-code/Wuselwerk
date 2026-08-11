import { RATE_MAX, RATE_MIN, TICK_HZ } from '../core/constants';
import { SKILL_SHORT, type SkillId } from '../core/types';
import type { World } from '../core/world';
import type { LevelDef } from '../levels/types';
import { drawSkillIcon } from './icons';
import type { Box, Layout } from './layout';

export const COL = {
  panel: '#0e131c',
  panelHi: '#18202e',
  line: '#27334a',
  text: '#dce6f5',
  dim: '#7b8ba3',
  accent: '#ffd23f',
  good: '#4fd18b',
  bad: '#e05a4a',
};

export interface HudState {
  level: LevelDef;
  world: World;
  selected: SkillId | null;
  showPar: boolean;
  cameraFollow: boolean;
  muted: boolean;
}

export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function fmtTime(ticks: number): string {
  if (!isFinite(ticks)) return '--:--';
  const s = Math.ceil(ticks / TICK_HZ);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function drawTopBar(ctx: CanvasRenderingContext2D, L: Layout, s: HudState): void {
  const b = L.topBar;
  ctx.fillStyle = COL.panel;
  ctx.fillRect(b.x, b.y, b.w, b.h);

  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  ctx.fillStyle = COL.dim;
  ctx.font = '600 10px system-ui, sans-serif';
  ctx.fillText(s.level.chapter.toUpperCase(), 10, 7);
  ctx.fillStyle = COL.text;
  ctx.font = '600 15px system-ui, sans-serif';
  ctx.fillText(s.level.name, 10, 20);

  const w = s.world;
  ctx.textAlign = 'right';
  // Rechter Rand ergibt sich aus den Knöpfen, nicht aus einem festen Abstand —
  // quer sind sie schmaler und rücken zusammen.
  const timeRight = L.soundBtn.x - 12;
  const timeLeft = w.timeLeftTicks;
  const urgent = timeLeft < 15 * TICK_HZ;
  ctx.fillStyle = urgent ? COL.bad : COL.text;
  ctx.font = '600 15px system-ui, sans-serif';
  ctx.fillText(fmtTime(timeLeft), timeRight, b.h > 48 ? 20 : 14);
  if (b.h > 48) {
    ctx.fillStyle = COL.dim;
    ctx.font = '600 10px system-ui, sans-serif';
    ctx.fillText('ZEIT', timeRight, 7);
  }

  ctx.textAlign = 'center';
  const midX = Math.min(b.w * 0.52, timeRight - 70);
  ctx.fillStyle = COL.dim;
  ctx.font = '600 10px system-ui, sans-serif';
  if (b.h > 48) ctx.fillText('GERETTET', midX, 7);
  ctx.fillStyle = w.saved >= w.needed ? COL.good : COL.text;
  ctx.font = '600 15px system-ui, sans-serif';
  ctx.fillText(`${w.saved}/${w.needed}`, midX, b.h > 48 ? 20 : 14);

  drawSoundButton(ctx, L.soundBtn, s.muted);
  drawIconButton(ctx, L.nukeBtn, '☢', false);
  drawIconButton(ctx, L.pauseBtn, '❚❚', false);

  // Rettungsquote-Balken (GDD §5)
  const bar: Box = { x: 0, y: b.h - 5, w: b.w, h: 5 };
  ctx.fillStyle = '#050810';
  ctx.fillRect(bar.x, bar.y, bar.w, bar.h);
  const per = bar.w / w.total;
  ctx.fillStyle = COL.good;
  ctx.fillRect(0, bar.y, w.saved * per, bar.h);
  ctx.fillStyle = COL.bad;
  ctx.fillRect(bar.w - w.dead * per, bar.y, w.dead * per, bar.h);
  ctx.fillStyle = COL.text;
  ctx.fillRect(w.needed * per - 1, bar.y - 1, 2, bar.h + 2);
}

function drawSoundButton(ctx: CanvasRenderingContext2D, b: Box, muted: boolean): void {
  ctx.fillStyle = '#161d29';
  roundRect(ctx, b.x, b.y, b.w, b.h, 9);
  ctx.fill();
  ctx.strokeStyle = COL.line;
  ctx.lineWidth = 1;
  ctx.stroke();

  const cx = b.x + b.w / 2;
  const cy = b.y + b.h / 2;
  ctx.save();
  ctx.translate(cx - 2, cy);
  ctx.fillStyle = muted ? '#4d5972' : COL.text;
  ctx.strokeStyle = muted ? '#4d5972' : COL.text;
  ctx.lineWidth = 1.4;
  ctx.lineCap = 'round';

  // Membran und Trichter
  ctx.beginPath();
  ctx.moveTo(-5, -2.5);
  ctx.lineTo(-2, -2.5);
  ctx.lineTo(2, -6);
  ctx.lineTo(2, 6);
  ctx.lineTo(-2, 2.5);
  ctx.lineTo(-5, 2.5);
  ctx.closePath();
  ctx.fill();

  if (muted) {
    ctx.beginPath();
    ctx.moveTo(4.5, -4.5);
    ctx.lineTo(9.5, 4.5);
    ctx.moveTo(9.5, -4.5);
    ctx.lineTo(4.5, 4.5);
    ctx.stroke();
  } else {
    for (let i = 0; i < 2; i++) {
      ctx.beginPath();
      ctx.arc(3, 0, 4 + i * 3, -0.85, 0.85);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawIconButton(
  ctx: CanvasRenderingContext2D,
  b: Box,
  glyph: string,
  active: boolean,
): void {
  ctx.fillStyle = active ? COL.panelHi : '#161d29';
  roundRect(ctx, b.x, b.y, b.w, b.h, 9);
  ctx.fill();
  ctx.strokeStyle = COL.line;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = COL.text;
  ctx.font = '600 14px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(glyph, b.x + b.w / 2, b.y + b.h / 2 + 1);
}

export function drawControls(ctx: CanvasRenderingContext2D, L: Layout, s: HudState): void {
  const c = L.controls;
  ctx.fillStyle = COL.panel;
  ctx.fillRect(c.x, c.y, c.w, c.h);
  ctx.strokeStyle = COL.line;
  ctx.beginPath();
  ctx.moveTo(0, c.y + 0.5);
  ctx.lineTo(c.w, c.y + 0.5);
  ctx.stroke();

  drawRateSlider(ctx, L, s.world);

  for (const b of L.skillButtons) {
    const count = s.world.skills[b.id];
    const selected = s.selected === b.id;
    const usable = count > 0;

    ctx.fillStyle = selected ? '#24405c' : usable ? '#18202e' : '#12161f';
    roundRect(ctx, b.x, b.y, b.w, b.h, 10);
    ctx.fill();
    ctx.strokeStyle = selected ? COL.accent : COL.line;
    ctx.lineWidth = selected ? 2 : 1;
    ctx.stroke();

    const col = usable ? (selected ? '#ffffff' : COL.text) : '#3f4a5c';
    drawSkillIcon(ctx, b.id, b.x + b.w / 2, b.y + b.h * 0.4, Math.min(b.w * 0.62, 26), col);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = usable ? COL.text : '#3f4a5c';
    ctx.font = '700 13px system-ui, sans-serif';
    ctx.fillText(String(count), b.x + b.w / 2, b.y + b.h - 4);

    ctx.fillStyle = usable ? COL.dim : '#333c4c';
    ctx.font = '600 8px system-ui, sans-serif';
    ctx.fillText(SKILL_SHORT[b.id], b.x + b.w / 2, b.y + b.h - 17);
  }

  // Hinweiszeile nur, wenn unter dem Bogen wirklich Platz ist. Quer ist die
  // Steuerung flach — dort liefe der Text mitten durch die Knöpfe.
  const lowestBtn = L.skillButtons.reduce((m, b) => Math.max(m, b.y + b.h), 0);
  const hintY = c.y + c.h - 8;
  if (hintY - 12 < lowestBtn + 2) return;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.font = '500 11px system-ui, sans-serif';
  ctx.fillStyle = COL.dim;
  const text = s.selected
    ? 'Halten zum Zielen — loslassen setzt den Beruf'
    : 'Erst Beruf wählen, dann Figur antippen';
  ctx.fillText(text, c.w / 2, hintY);
}

function drawRateSlider(ctx: CanvasRenderingContext2D, L: Layout, w: World): void {
  const b = L.rateSlider;
  ctx.fillStyle = '#141b26';
  roundRect(ctx, b.x, b.y, b.w, b.h, 10);
  ctx.fill();
  ctx.strokeStyle = COL.line;
  ctx.lineWidth = 1;
  ctx.stroke();

  const trackTop = b.y + 22;
  const trackBottom = b.y + b.h - 20;
  const th = trackBottom - trackTop;
  const t = (w.releaseRate - RATE_MIN) / (RATE_MAX - RATE_MIN);
  const minT = (w.minReleaseRate - RATE_MIN) / (RATE_MAX - RATE_MIN);

  ctx.fillStyle = '#0a0e16';
  roundRect(ctx, b.x + b.w / 2 - 4, trackTop, 8, th, 4);
  ctx.fill();

  // Gesperrter Bereich unterhalb der Mindestrate
  ctx.fillStyle = '#2a2027';
  roundRect(ctx, b.x + b.w / 2 - 4, trackBottom - minT * th, 8, minT * th, 4);
  ctx.fill();

  const ky = trackBottom - t * th;
  ctx.fillStyle = COL.accent;
  roundRect(ctx, b.x + 5, ky - 7, b.w - 10, 14, 6);
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = COL.dim;
  ctx.font = '600 8px system-ui, sans-serif';
  ctx.fillText('RATE', b.x + b.w / 2, b.y + 6);
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = COL.text;
  ctx.font = '700 11px system-ui, sans-serif';
  ctx.fillText(String(w.releaseRate), b.x + b.w / 2, b.y + b.h - 4);
}

/** `earned` als Anzahl (Menü) oder als drei Einzelbedingungen (Ergebnis). */
export function drawStars(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  earned: number | boolean[],
): void {
  const flags =
    typeof earned === 'number' ? [earned >= 1, earned >= 2, earned >= 3] : earned;
  const gap = size * 1.9;
  for (let i = 0; i < 3; i++) {
    star(ctx, cx + (i - 1) * gap, cy, size, flags[i] ? COL.accent : '#2a3244');
  }
}

function star(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string,
): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.45;
    const x = cx + Math.cos(a) * rad;
    const y = cy + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

export function drawRecenter(ctx: CanvasRenderingContext2D, L: Layout): void {
  drawIconButton(ctx, L.recenterBtn, '◎', true);
}
