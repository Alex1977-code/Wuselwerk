import type { World } from '../core/world';
import { minimapBox } from './minimap';
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
  parBekannt = false,
  lesemodus = false,
): Button[] {
  // Die Startklappe (Level-Konzept, Paket 0): Ab der Weltmitte gibt es
  // keinen dunklen Vorhang mehr — die Aufgabe IST das Bild. Oben eine
  // schmale Zeile mit Name, Quote und Hinweis, unten der Los-Knopf; die
  // Karte dazwischen gehoert dem Spieler zum Schauen. Denken ist gratis,
  // und die offene Buehne sagt es, bevor irgendeine Regel es erklaeren muss.
  if (lesemodus) {
    const bw = Math.min(368, L.cssW - 20);
    const bx = L.cssW / 2 - bw / 2;
    const by = L.play.y + 8;
    ctx.save();
    ctx.fillStyle = 'rgba(10, 14, 22, 0.86)';
    // Hoch genug fuer drei Hinweiszeilen — die langen Hinweise der
    // Umbau-Level liefen sonst unter der Bannerkante weiter.
    roundRect(ctx, bx, by, bw, 78, 12);
    ctx.fill();
    ctx.strokeStyle = COL.line;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = COL.text;
    ctx.font = '700 14px system-ui, sans-serif';
    const kopf = parBekannt
      ? `${level.name} · rette ${level.needed} von ${level.total} · Par ${level.par}`
      : `${level.name} · rette ${level.needed} von ${level.total}`;
    ctx.fillText(kopf, bx + bw / 2, by + 9);
    ctx.fillStyle = COL.dim;
    ctx.font = '400 11px system-ui, sans-serif';
    wrap(ctx, level.hint, bx + bw / 2, by + 30, bw - 26, 14);
    ctx.restore();

    // Der Knopf raeumt der Uebersichtskarte das Feld (Spieltest-Runde: er
    // ueberdeckte ihren linken Rand, ein Kartentipp startete das Level).
    // Er sitzt jetzt mittig im freien Band WESTLICH der Karte.
    const karte = minimapBox(L, level);
    const frei = karte ? karte.x - L.play.x - 12 : L.play.w;
    const bw2 = Math.max(150, Math.min(220, frei - 16));
    const btn: Button = {
      id: 'start',
      x: L.play.x + Math.max(0, (frei - bw2) / 2),
      y: L.play.y + L.play.h - 60,
      w: bw2,
      h: 46,
    };
    button(ctx, btn, 'Los — Falltür öffnen', true);
    return [btn];
  }

  // Der Meisterschlüssel (Belohnung von Welt 4) legt die Musterlösungszahl
  // schon vor dem ersten Versuch offen — die Tafel wächst um eine Zeile.
  const b = panel(ctx, L, parBekannt ? 272 : 250);
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

  let hintY = b.y + 108;
  if (parBekannt) {
    // Bewusst im Akzentton, aber kleiner als die Rettungszeile: eine
    // Auskunft, kein Auftrag. Der Schlüssel davor sagt, woher sie kommt —
    // gezeichnet statt als Schriftzeichen, weil ⚿ auf vielen Geräten fehlt.
    ctx.fillStyle = COL.accent;
    ctx.font = '600 12px system-ui, sans-serif';
    const n = level.par;
    const text = `Musterlösung: ${n} ${n === 1 ? 'Beruf' : 'Berufe'}`;
    const tw = ctx.measureText(text).width;
    const kx = b.x + b.w / 2 - tw / 2 - 7;
    const ky = b.y + 106;
    ctx.fillText(text, b.x + b.w / 2 + 6, b.y + 100);
    ctx.save();
    ctx.strokeStyle = COL.accent;
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(kx - 4, ky - 3, 2.6, 0, Math.PI * 2);
    ctx.moveTo(kx - 1.6, ky - 1.4);
    ctx.lineTo(kx + 5, ky + 3);
    ctx.moveTo(kx + 2.4, ky + 1.3);
    ctx.lineTo(kx + 1, ky + 3.4);
    ctx.stroke();
    ctx.restore();
    hintY = b.y + 130;
  }

  ctx.fillStyle = COL.dim;
  ctx.font = '400 13px system-ui, sans-serif';
  wrap(ctx, level.hint, b.x + b.w / 2, hintY, b.w - 44, 18);

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
  lebenNotiz: string | null = null,
  verlustAnsage: string | null = null,
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

  // Die Fortschritts-Ansage (Level-Konzept, Paket 0): Wie weit war man,
  // woran lag es. Aus einer Niederlage mit Grund wird ein Plan — und ein
  // Plan ist ein Grund, es gleich noch einmal zu versuchen.
  if (!won && verlustAnsage) {
    ctx.fillStyle = COL.dim;
    ctx.font = '500 12px system-ui, sans-serif';
    ctx.fillText(verlustAnsage, b.x + b.w / 2, b.y + 114);
  }

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
    ctx.fillText('Die Par-Zahl erscheint nach dem ersten Sieg.', b.x + b.w / 2, b.y + 202);
  }
  // Die Herzschutzregel sagt es dazu — eine stille Gnade waere keine:
  // Wer nicht erfaehrt, dass die Uhr-Niederlage nichts gekostet hat,
  // spielt beim naechsten Mal genauso aengstlich.
  if (lebenNotiz) {
    ctx.fillStyle = COL.good;
    ctx.font = '600 12px system-ui, sans-serif';
    ctx.fillText(lebenNotiz, b.x + b.w / 2, b.y + 216);
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
