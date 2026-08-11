import { SKILLS, type SkillId } from '../core/types';

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SkillButton extends Box {
  id: SkillId;
}

export interface Layout {
  cssW: number;
  cssH: number;
  topBar: Box;
  play: Box;
  controls: Box;
  rateSlider: Box;
  skillButtons: SkillButton[];
  pauseBtn: Box;
  nukeBtn: Box;
  soundBtn: Box;
  recenterBtn: Box;
}

export function inBox(b: Box, x: number, y: number): boolean {
  return x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
}

const TOP_H = 54;

/**
 * Daumen-Layout (GDD §3.5): untere rund 25 % gehoeren der Steuerung, die acht
 * Berufe liegen im Bogen, die Freisetzungsrate als senkrechter Schieber links.
 */
export function computeLayout(cssW: number, cssH: number): Layout {
  const controlsH = Math.max(148, Math.min(214, Math.round(cssH * 0.26)));
  const topBar: Box = { x: 0, y: 0, w: cssW, h: TOP_H };
  const controls: Box = { x: 0, y: cssH - controlsH, w: cssW, h: controlsH };
  const play: Box = { x: 0, y: TOP_H, w: cssW, h: cssH - TOP_H - controlsH };

  const pad = 8;
  const rateW = 44;
  const rateSlider: Box = {
    x: pad,
    y: controls.y + 12,
    w: rateW,
    h: controls.h - 24,
  };

  const areaX = rateSlider.x + rateW + 10;
  const areaW = cssW - areaX - pad;
  const gap = 4;
  const btnW = (areaW - gap * (SKILLS.length - 1)) / SKILLS.length;
  const btnH = Math.min(72, controls.h - 44);
  const arc = 13;

  const skillButtons: SkillButton[] = SKILLS.map((id, i) => {
    const t = (i - (SKILLS.length - 1) / 2) / ((SKILLS.length - 1) / 2);
    const lift = (1 - t * t) * arc;
    return {
      id,
      x: areaX + i * (btnW + gap),
      y: controls.y + 16 + (arc - lift),
      w: btnW,
      h: btnH,
    };
  });

  const btn = 38;
  const pauseBtn: Box = { x: cssW - pad - btn, y: 8, w: btn, h: btn };
  const nukeBtn: Box = { x: cssW - pad - btn * 2 - 6, y: 8, w: btn, h: btn };
  const soundBtn: Box = { x: cssW - pad - btn * 3 - 12, y: 8, w: btn, h: btn };
  // Unten links: unten rechts sitzt die Übersichtskarte.
  const recenterBtn: Box = {
    x: pad,
    y: play.y + play.h - btn - 8,
    w: btn,
    h: btn,
  };

  return {
    cssW,
    cssH,
    topBar,
    play,
    controls,
    rateSlider,
    skillButtons,
    pauseBtn,
    nukeBtn,
    soundBtn,
    recenterBtn,
  };
}
