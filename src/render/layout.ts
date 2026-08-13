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

/**
 * Ab dieser Knopfbreite steht der Berufsname unter dem Symbol.
 *
 * Gemessen, nicht geschaetzt: Die laengste Knopfbeschriftung ist „Kletterer"
 * und misst in 600er system-ui bei neuneinhalb Punkt achtundvierzig
 * Bildpunkte. Mit acht Punkten Rand sind das sechsundfuenfzig; achtundfuenfzig
 * geben etwas Luft.
 *
 * Die Zahl steht hier und nicht in `hud.ts`, weil das **Layout** sie braucht:
 * Es muss die Knoepfe so legen, dass die Bedingung erfuellt IST. Wer sie nur
 * beim Zeichnen kennt, baut eine Leiste, in der der Name dann eben wegbleibt —
 * genau der Zustand, den der Spieltest mit „nicht selbsterklaerend"
 * beschrieben hat.
 */
export const NAME_BREITE = 58;

/**
 * Ab dieser Knopfbreite lohnt eine einzige Reihe aus acht Knoepfen.
 *
 * Sie liegt deutlich ueber `NAME_BREITE`, und das ist Absicht: Ein Knopf, auf
 * dem der Name gerade so Platz hat, ist noch lange kein guter Knopf. Erst ab
 * etwa achtundsiebzig Punkten trifft ihn ein Daumen ohne Zielen. Darunter
 * gewinnt das Raster aus vier mal zwei — es macht jeden Knopf mehr als doppelt
 * so breit und kostet dafuer rund vierzig Punkte Spielfeldhoehe.
 */
const EINREIHIG_BREITE = 78;

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

  const pad = 10;
  const rateW = 38;
  const areaX = pad + rateW + 12;
  const areaW = cssW - areaX - pad;
  const gap = 6;

  /**
   * Eine Reihe oder zwei? Das entscheidet die Breite, nicht der Geschmack.
   *
   * Acht Knöpfe nebeneinander sind auf einem 390 Punkte breiten Telefon
   * fünfunddreissig Punkte breit. Darauf passt ein Symbol und sonst nichts —
   * kein Name, keine Richtungsmarke. Der Spieltest hat das mit einem Satz
   * erledigt: „die Grafiken der Berufsleiste sind nicht selbsterklärend."
   *
   * Vier mal zwei löst es: Bei denselben 390 Punkten wird jeder Knopf
   * fünfundsiebzig breit — Platz für Symbol, Richtungsmarke **und** Name. Der
   * Preis sind rund vierzig Punkte Spielfeldhöhe. Das ist der bessere Handel:
   * Ein Spielfeld, in dem man scrollen kann, ist verschmerzbar; ein Werkzeug,
   * das man nicht benennen kann, nicht.
   *
   * Quer und auf dem Tablett bleibt es bei einer Reihe — dort sind die Knöpfe
   * von selbst breit genug, und die Höhe ist das Knappe.
   */
  const einreihig =
    (areaW - gap * (SKILLS.length - 1)) / SKILLS.length >= EINREIHIG_BREITE;
  const spalten = einreihig ? SKILLS.length : 4;
  const reihen = einreihig ? 1 : 2;
  const btnW = (areaW - gap * (spalten - 1)) / spalten;
  // Die Fläche ist das, was ein Daumen trifft. Einreihig war 66 hoch (72 waren
  // eine Obergrenze aus der Zeit, als unter den Knöpfen noch eine Zeile Kürzel
  // stand); zweireihig ist der einzelne Knopf flacher, aber seine FLÄCHE
  // wächst trotzdem deutlich — aus 35 x 66 werden 75 x 52.
  //
  // Zweireihig bindet die Höhe an denselben Anteil, den die einreihige Leiste
  // beansprucht hätte, geteilt durch zwei. Ein fester Anteil je Reihe (0,075)
  // war die erste Fassung und lieferte quer auf einem kleinen Gerät Knöpfe von
  // vierundzwanzig Punkten — flacher als ein Fingernagel.
  const reihenGap = 6;
  const btnH = einreihig
    ? Math.min(landscape ? 78 : 66, Math.round(cssH * 0.22))
    : Math.min(52, Math.max(34, Math.round((cssH * 0.26 - reihenGap) / 2)));

  // Flacher Bogen. Er soll dem Daumen entgegenkommen, aber die Reihe muss als
  // Reihe lesen — bei dreizehn Punkten Hub sah sie aus wie eine Girlande.
  // Zweireihig entfällt er: Zwei gebogene Reihen übereinander lesen als Welle,
  // nicht als Raster, und ein Raster ist genau das, was hier gebraucht wird.
  const arc = !einreihig ? 0 : landscape ? 3 : 8;
  // Der Bogen senkt die äusseren Knöpfe um `arc` — er gehört also in die Höhe
  // des Blocks. Vorher fehlte er dort, und die unterste Knopfkante ragte um
  // genau diese acht Punkte in den unteren Rand der Leiste.
  const blockH = btnH * reihen + reihenGap * (reihen - 1) + arc;

  const controlsH = blockH + 12 + hintH + 10;
  const topBar: Box = { x: 0, y: 0, w: cssW, h: TOP_H };
  const controls: Box = { x: 0, y: cssH - controlsH, w: cssW, h: controlsH };
  const play: Box = { x: 0, y: TOP_H, w: cssW, h: cssH - TOP_H - controlsH };

  const skillButtons: SkillButton[] = SKILLS.map((id, i) => {
    const spalte = i % spalten;
    const reihe = Math.floor(i / spalten);
    const t = (spalte - (spalten - 1) / 2) / ((spalten - 1) / 2);
    const lift = (1 - t * t) * arc;
    return {
      id,
      x: areaX + spalte * (btnW + gap),
      y: controls.y + 12 + reihe * (btnH + reihenGap) + (arc - lift),
      w: btnW,
      h: btnH,
    };
  });

  // Der Schieber steht auf derselben Linie wie die Knöpfe und ist genauso hoch
  // wie der ganze Knopfblock. Vorher lief er über die ganze Leistenhöhe und
  // hatte oben und unten je eine Beschriftung — drei Elemente für eine Zahl.
  const rateSlider: Box = {
    x: pad,
    y: controls.y + 12,
    w: rateW,
    h: blockH,
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
