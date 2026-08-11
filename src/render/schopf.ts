import type { SkillId } from '../core/types';

/**
 * Der Schopf — das einzige bewegliche Element der Figur.
 *
 * ## Warum er alles traegt
 *
 * Die Murmel ist ein gesichtsloser Kiesel. Ihr Koerper wird **nie** eingefaerbt;
 * Farbe ist Information und gehoert dem Schopf. Damit ist er zugleich Mimik,
 * Berufsanzeige und Fallschirm — und der Grund, warum die Figur mit acht Berufen
 * auskommt, ohne acht Kostueme zu brauchen.
 *
 * ## Warum er gezeichnet und nicht gebacken wird
 *
 * Neun Formen auf einem Blatt von 600 x 600 Bildpunkten waeren rund zehn
 * Kilobyte in der Einzeldatei — fuer neun Kurven. Gezeichnet kosten sie nichts,
 * lassen sich in jeder Groesse scharf ausgeben und **zur Laufzeit einfaerben**,
 * ohne dass ein zweites Blatt je Beruf noetig waere. Das passt zum Rest des
 * Projekts: Auch Gelaende, Himmel und Bedienleiste entstehen im Code.
 *
 * ## Die eine Regel, die ihn lebendig macht
 *
 * Der Schopf zeigt den Zustand des **vorherigen** Koerperbildes — ein Bild
 * Nachlauf, nicht mehr. Das ist die gesamte Physik, die er braucht: Er haengt
 * dem Koerper hinterher wie etwas, das Masse hat. Ohne den Nachlauf wirkt er
 * angeklebt, mit mehr als einem Bild wirkt er lose.
 */

/** Die neun Zustaende, in der Reihenfolge der Ankertabelle. */
export const SCHOPF_ZUSTAND = [
  'ruhe',
  'lauf_a',
  'lauf_b',
  'zurueck',
  'vor',
  'hoch',
  'geknickt',
  'flach',
  'schirm',
] as const;

/**
 * Die Akzentfarbe je Beruf.
 *
 * `null` heisst: kein Beruf, die Figur geht nur. Der Ton dafuer liegt dicht am
 * Koerper — eine Murmel ohne Auftrag soll unauffaellig sein, damit die
 * arbeitenden im Pulk sofort herausstechen.
 */
const FARBE: Record<SkillId, string> = {
  basher: '#E8674F',
  digger: '#E2B044',
  miner: '#E2B044',
  builder: '#569CB2',
  blocker: '#80A86C',
  climber: '#A87EBE',
  floater: '#EE9EB0',
  bomber: '#5C5C68',
};
const OHNE_AUFTRAG = '#D8D0C4';

/**
 * Welche Farbe der Schopf traegt.
 *
 * Bei mehreren Auftraegen auf derselben Figur — Kletterer *und* Schirmspringer
 * sind zusammen erlaubt — gewinnt der, der gerade **wirkt**. Ein Kletterer, der
 * faellt, ist in diesem Moment ein Schirmspringer, und der Schopf sagt das.
 */
export function schopfFarbe(skill: SkillId | null): string {
  return skill ? FARBE[skill] : OHNE_AUFTRAG;
}

/**
 * Eine Zacke: die Grundform von acht der neun Zustaende.
 *
 * Gezeichnet wird vom Ansatz aus nach oben, in logischen Pixeln. Zwei
 * Kurvenzuege bilden die beiden Flanken; der Kontrollpunkt liegt auf halber
 * Hoehe und wird quer zur Achse verschoben — daraus entsteht die Biegung. Eine
 * Zacke aus geraden Linien saehe aus wie ein Dreieck, und ein Dreieck hat kein
 * Gewicht.
 *
 * @param winkel Neigung in Bogenmass. 0 ist senkrecht, positiv nach vorn.
 * @param biegung Wie weit die Mittellinie quer ausschlaegt, als Anteil der Laenge.
 */
function zacke(
  ctx: CanvasRenderingContext2D,
  laenge: number,
  breite: number,
  winkel: number,
  biegung: number,
): void {
  const s = Math.sin(winkel);
  const c = Math.cos(winkel);
  const tx = s * laenge;
  const ty = -c * laenge;
  // Mitte der Achse, quer verschoben.
  const mx = s * laenge * 0.5 + c * biegung * laenge;
  const my = -c * laenge * 0.5 + s * biegung * laenge;
  // Der Ansatz steht quer zur Achse.
  const bx = c * breite;
  const by = s * breite;
  ctx.beginPath();
  ctx.moveTo(-bx, -by);
  ctx.quadraticCurveTo(mx - bx * 0.8, my - by * 0.8, tx, ty);
  ctx.quadraticCurveTo(mx + bx * 1.1, my + by * 1.1, bx, by);
  ctx.closePath();
  ctx.fill();
}

/**
 * Der geoeffnete Schirm — der einzige Zustand, der keine Zacke ist.
 *
 * Beim Schweben gibt es kein zweites Objekt: **Der Schopf selbst oeffnet sich.**
 * Das spart ein Requisit und ist zugleich die staerkste Aussage des Entwurfs —
 * die Figur hat nichts dabei, sie kann es einfach.
 */
function schirm(ctx: CanvasRenderingContext2D, spanne: number): void {
  const r = spanne;
  ctx.beginPath();
  ctx.arc(0, -r * 0.34, r, Math.PI * 1.08, Math.PI * 1.92);
  ctx.quadraticCurveTo(0, -r * 0.34 + r * 0.42, -r * 0.96, -r * 0.34 - r * 0.28);
  ctx.closePath();
  ctx.fill();
}

/**
 * Die neun Zustaende als Zahlen.
 *
 * Laenge, Ansatzbreite, Neigung, Biegung — in logischen Pixeln beziehungsweise
 * Bogenmass. Die Reihenfolge ist die von `SCHOPF_ZUSTAND` und damit die der
 * Ankertabelle; sie darf nicht umsortiert werden.
 */
const FORM: readonly (readonly [number, number, number, number])[] = [
  [7.2, 1.5, 0.14, 0.1], // 0 ruhe — aufrecht, kaum geneigt
  [6.9, 1.4, 0.03, 0.07], // 1 lauf_a
  [7.1, 1.4, 0.32, 0.13], // 2 lauf_b — nach vorn gekippt
  [7.0, 1.6, -0.9, 0.3], // 3 zurueck — nach hinten gerissen
  [6.6, 0.72, 1.24, 0.2], // 4 vor — flach nach vorn gestreckt, duenn
  [8.6, 1.7, 0.04, 0.04], // 5 hoch — steil und lang, Kraft nach unten
  [4.6, 1.9, -0.6, 0.46], // 6 geknickt — kurz, an die Wand gepresst
  [6.2, 0.6, 1.48, 0.06], // 7 flach — liegt fast waagerecht
  [0, 0, 0, 0], // 8 schirm — eigene Form, siehe unten
];

/**
 * Den Schopf zeichnen.
 *
 * @param x Ansatzpunkt auf dem Bildschirm — der Anker aus dem Manifest.
 * @param s Bildpunkte je logischem Pixel.
 * @param spiegeln Blickt die Figur nach links? Dann kippt auch der Schopf mit.
 */
export function drawSchopf(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  zustand: number,
  farbe: string,
  s: number,
  spiegeln = false,
): void {
  const i = Math.max(0, Math.min(FORM.length - 1, Math.round(zustand)));
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(spiegeln ? -s : s, s);
  ctx.fillStyle = farbe;
  if (i === 8) schirm(ctx, 6.4);
  else zacke(ctx, ...FORM[i]);
  ctx.restore();
}
