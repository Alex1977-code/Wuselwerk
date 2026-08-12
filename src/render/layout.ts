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
  rewindBtn: Box;
  soundBtn: Box;
  recenterBtn: Box;
}

export function inBox(b: Box, x: number, y: number): boolean {
  return x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
}

/**
 * Daumen-Layout (GDD §3.5): die Steuerung liegt unten, die acht Berufe im
 * Bogen, die Freisetzungsrate als senkrechter Schieber links.
 *
 * Das Dokument legt Hochformat fest. Das Querformat kommt hinzu, weil ein
 * Seitenscroller davon sichtbar profitiert — es kostet aber die einhändige
 * Bedienung, weil man das Gerät quer mit beiden Händen hält. Deshalb sind
 * beide Lagen gebaut und nicht eine gegen die andere getauscht: Die
 * Entscheidung gehört an den Daumen, nicht an den Schreibtisch.
 *
 * Quer ist die Höhe knapp. Kopfzeile und Steuerung schrumpfen deshalb, und
 * der Bogen wird flacher — über die ganze Breite gespannt sähe eine Kuppel
 * albern aus.
 */
export function computeLayout(cssW: number, cssH: number): Layout {
  const landscape = cssW > cssH;
  const TOP_H = landscape ? 42 : 54;

  /**
   * Die Leiste ist so hoch wie ihr Inhalt, nicht so hoch wie ein Anteil des
   * Bildschirms.
   *
   * Vorher waren es 26 Prozent der Höhe — ein Mass aus der Zeit, als unter
   * jedem Symbol noch eine Zeile Kürzel stand. Ohne sie blieb hoch ein
   * handbreiter leerer Streifen zwischen den Knöpfen und der Hinweiszeile
   * stehen. Jetzt ergibt sich die Höhe aus Knopfhöhe, Rand und der
   * Hinweiszeile, die es nur im Hochformat gibt.
   */
  const hintH = landscape ? 0 : 26;
  const btnH = Math.min(landscape ? 78 : 66, Math.round(cssH * 0.22));
  const controlsH = btnH + 12 + hintH + 10;
  const topBar: Box = { x: 0, y: 0, w: cssW, h: TOP_H };
  const controls: Box = { x: 0, y: cssH - controlsH, w: cssW, h: controlsH };
  const play: Box = { x: 0, y: TOP_H, w: cssW, h: cssH - TOP_H - controlsH };

  const pad = 10;
  const rateW = 38;
  const areaX = pad + rateW + 12;
  const areaW = cssW - areaX - pad;
  const gap = 6;
  const btnW = (areaW - gap * (SKILLS.length - 1)) / SKILLS.length;
  // Höher als vorher. Die Fläche ist das, was ein Daumen trifft; 72 Punkte
  // waren eine Obergrenze aus der Zeit, als unter den Knöpfen noch eine Zeile
  // Kürzel stand.
  // Flacher Bogen. Er soll dem Daumen entgegenkommen, aber die Reihe muss als
  // Reihe lesen — bei dreizehn Punkten Hub sah sie aus wie eine Girlande.
  const arc = landscape ? 3 : 8;

  const skillButtons: SkillButton[] = SKILLS.map((id, i) => {
    const t = (i - (SKILLS.length - 1) / 2) / ((SKILLS.length - 1) / 2);
    const lift = (1 - t * t) * arc;
    return {
      id,
      x: areaX + i * (btnW + gap),
      y: controls.y + 12 + (arc - lift),
      w: btnW,
      h: btnH,
    };
  });

  // Der Schieber steht auf derselben Linie wie die Knöpfe und ist genauso hoch.
  // Vorher lief er über die ganze Leistenhöhe und hatte oben und unten je eine
  // Beschriftung — drei Elemente für eine Zahl.
  const rateSlider: Box = {
    x: pad,
    y: skillButtons[0].y,
    w: rateW,
    h: btnH,
  };

  const btn = landscape ? 34 : 38;
  const btnY = Math.round((TOP_H - btn) / 2);
  const pauseBtn: Box = { x: cssW - pad - btn, y: btnY, w: btn, h: btn };
  const nukeBtn: Box = { x: cssW - pad - btn * 2 - 6, y: btnY, w: btn, h: btn };
  const soundBtn: Box = { x: cssW - pad - btn * 3 - 12, y: btnY, w: btn, h: btn };
  // Unten links: unten rechts sitzt die Übersichtskarte.
  const recenterBtn: Box = {
    x: pad,
    y: play.y + play.h - btn - 8,
    w: btn,
    h: btn,
  };
  // Darüber der Zeitrücklauf. Er wohnt bewusst am Spielfeldrand und nicht in
  // der Kopfzeile: Er ist keine Verwaltung, er ist ein Spielzug — und er muss
  // in dem Moment erreichbar sein, in dem der Daumen ohnehin unten ist.
  const rewindBtn: Box = {
    x: pad,
    y: play.y + play.h - btn * 2 - 16,
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
    rewindBtn,
    soundBtn,
    recenterBtn,
  };
}
