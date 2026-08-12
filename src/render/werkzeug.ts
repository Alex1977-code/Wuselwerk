/**
 * Das Werkzeug in der Hand der Murmel.
 *
 * ## Warum es ueberhaupt eines braucht
 *
 * Ohne Werkzeug trennen sich drei der vier Arbeitsposen nur ueber die
 * Koerperneigung: Rammen und Schraegbaggern sehen fast gleich aus, und Bauen
 * liest sich beinahe wie Gehen. Bei einer Figur von zwoelf logischen Pixeln
 * ist eine Neigung von zwanzig Grad kein Unterschied, den man im Pulk erkennt.
 *
 * ## Die eine Regel, aus der alles folgt
 *
 * **Der Spieler liest die Achse, nicht das Geraet.** Nicht die Form des Keils
 * sagt „hier wird waagerecht gerammt", sondern die Richtung, in die er zeigt.
 * Daraus folgen drei Dinge:
 *
 * 1. Die Winkel sind **weit auseinandergezogen**: waagerecht, 45 Grad,
 *    senkrecht. Nicht 20 und 40 Grad — der Unterschied muss auf einen Blick
 *    sitzen, nicht beim Hinsehen.
 * 2. Das Werkzeug **bricht die Silhouette nach aussen**. Nichts Dunkles ragt in
 *    die Koerperflaeche hinein; dort wuerde es als Gesichtszug gelesen, und die
 *    Murmel hat ausdruecklich keines.
 * 3. Es ist **laenger als noetig**. Ein Geraet, das gerade eben aus der Hand
 *    schaut, ist bei dieser Groesse ein Fleck.
 *
 * ## Warum gezeichnet und nicht gebacken
 *
 * Das Modell enthaelt kein Werkzeug — ein Bake haette bedeutet, erst eines zu
 * modellieren. Der Ansatzpunkt dagegen steht im Blatt: Der Backvorgang misst je
 * Einzelbild die vordere Hand aus dem Rig und schreibt sie ins Manifest. Damit
 * haengt das gezeichnete Geraet an derselben Bewegung wie der Koerper, ohne
 * dass ein zweites Bild noetig waere.
 */

/** Alles Werkzeug ist dunkel und einfarbig — es ist Silhouette, kein Gegenstand. */
const EISEN = '#3A3430';
const HOLZ = '#6B5A46';

/** Welche Pose welches Geraet fuehrt, und in welchem Winkel. */
type Geraet = 'keil' | 'spaten' | 'planke';

interface Fuehrung {
  geraet: Geraet;
  /** Winkel in Grad. 0 ist waagerecht nach vorn, 90 senkrecht nach unten. */
  winkel: number;
  /** Laenge in logischen Pixeln. */
  laenge: number;
}

const FUEHRT: Record<string, Fuehrung> = {
  // Waagerecht — der Rammer treibt einen Stollen geradeaus.
  bashing: { geraet: 'keil', winkel: 0, laenge: 6.4 },
  // Genau 45 Grad. Der Schraegbagger unterscheidet sich vom Rammer nur hierin.
  mining: { geraet: 'spaten', winkel: 45, laenge: 6.2 },
  // Senkrecht nach unten.
  digging: { geraet: 'spaten', winkel: 90, laenge: 6.0 },
  // Steigend: Die Planke zeigt dorthin, wo die naechste Stufe entsteht.
  building: { geraet: 'planke', winkel: -22, laenge: 7.0 },
};

/** Fuehrt diese Pose ein Werkzeug? */
export function fuehrtWerkzeug(pose: string): boolean {
  return pose in FUEHRT;
}

/**
 * Ein Keil: kurzer Stiel, breiter Kopf, der nach vorn spitz zulaeuft.
 *
 * Gezeichnet in einem System, in dem +x die Wirkungsrichtung ist und der
 * Ursprung in der Hand liegt.
 */
function keil(ctx: CanvasRenderingContext2D, l: number): void {
  const d = l * 0.17;
  ctx.fillStyle = HOLZ;
  ctx.fillRect(-l * 0.16, -d * 0.42, l * 0.62, d * 0.84);
  ctx.fillStyle = EISEN;
  ctx.beginPath();
  ctx.moveTo(l * 0.42, -d * 1.1);
  ctx.lineTo(l, -d * 0.28);
  ctx.lineTo(l, d * 0.28);
  ctx.lineTo(l * 0.42, d * 1.1);
  ctx.closePath();
  ctx.fill();
}

/** Ein Spaten: langer Stiel, flaches Blatt quer am Ende. */
function spaten(ctx: CanvasRenderingContext2D, l: number): void {
  const d = l * 0.13;
  ctx.fillStyle = HOLZ;
  ctx.fillRect(-l * 0.14, -d * 0.4, l * 0.78, d * 0.8);
  ctx.fillStyle = EISEN;
  ctx.beginPath();
  ctx.moveTo(l * 0.66, -d * 1.5);
  ctx.lineTo(l * 0.98, -d * 1.15);
  ctx.lineTo(l, 0);
  ctx.lineTo(l * 0.98, d * 1.15);
  ctx.lineTo(l * 0.66, d * 1.5);
  ctx.closePath();
  ctx.fill();
}

/** Eine Planke: gerader Balken, an beiden Enden gleich. */
function planke(ctx: CanvasRenderingContext2D, l: number): void {
  const d = l * 0.13;
  ctx.fillStyle = HOLZ;
  ctx.fillRect(-l * 0.18, -d * 0.5, l * 1.18, d);
  // Ein dunkler Streifen an der Oberkante gibt dem Balken Dicke. Ohne ihn ist
  // er ein Strich, und ein Strich hat keine Richtung, nur eine Lage.
  ctx.fillStyle = EISEN;
  ctx.fillRect(-l * 0.18, -d * 0.5, l * 1.18, d * 0.3);
}

/**
 * Wie weit das Werkzeug aus dem Koerper heraustreten muss.
 *
 * Der Ansatz aus dem Rig ist die **Hand**, und die liegt bei mehreren Posen
 * innerhalb der Silhouette — beim Graben zum Beispiel dicht am Bauch. Zeichnet
 * man von dort aus, steckt das dunkle Blatt mitten im hellen Koerper und wird
 * als Gesichtszug gelesen. Beim ersten Versuch sah der Graeber aus, als haette
 * er einen Mund; die Vorlage verbietet genau das.
 *
 * Der Koerper wird dafuer als Ellipse angenaehert, und der Ansatz entlang der
 * Werkzeugachse so weit nach aussen geschoben, bis er sie verlaesst. Das ist
 * eine quadratische Gleichung und kostet nichts — der Gewinn ist, dass es
 * **fuer jeden Winkel** stimmt und nicht je Pose von Hand nachgestellt werden
 * muss.
 */
function austritt(dx: number, dy: number, cx: number, cy: number, a: number, b: number): number {
  // Schnittpunkt des Strahls (d + t·c) mit der Ellipse, t >= 0. `d` ist der
  // Ansatz **relativ zum Ellipsenmittelpunkt**, `c` die Richtung.
  const A = (cx * cx) / (a * a) + (cy * cy) / (b * b);
  const B = 2 * ((dx * cx) / (a * a) + (dy * cy) / (b * b));
  const C = (dx * dx) / (a * a) + (dy * dy) / (b * b) - 1;
  if (A <= 0) return 0;
  const disk = B * B - 4 * A * C;
  if (disk < 0) return 0;
  const t = (-B + Math.sqrt(disk)) / (2 * A);
  return Math.max(0, t);
}

/**
 * Das Werkzeug zeichnen.
 *
 * @param hx Ansatz in logischen Pixeln, waagerecht vom Fusspunkt aus.
 * @param hy Ansatz in logischen Pixeln, senkrecht vom Fusspunkt aus (negativ = oben).
 * @param koerperH Hoehe des Koerpers in logischen Pixeln.
 * @param s Bildpunkte je logischem Pixel.
 */
export function drawWerkzeug(
  ctx: CanvasRenderingContext2D,
  pose: string,
  hx: number,
  hy: number,
  koerperH: number,
  s: number,
): void {
  const f = FUEHRT[pose];
  if (!f) return;
  const bog = (f.winkel * Math.PI) / 180;
  const cx = Math.cos(bog);
  const cy = Math.sin(bog);
  // Der Koerper als Ellipse. Ihr Mittelpunkt liegt auf halber Figurenhoehe
  // ueber dem Fusspunkt, deshalb wird der Ansatz vorher dorthin umgerechnet.
  const mitteY = -koerperH * 0.5;
  const t = austritt(hx, hy - mitteY, cx, cy, koerperH * 0.4, koerperH * 0.52);
  // Ein Achtel Koerperhoehe Luft obendrauf: Ein Geraet, das die Silhouette
  // genau beruehrt, sieht angeklebt aus statt gehalten.
  const ab = t + koerperH * 0.12;

  ctx.save();
  ctx.translate((hx + cx * ab) * s, (hy + cy * ab) * s);
  ctx.scale(s, s);
  ctx.rotate(bog);
  if (f.geraet === 'keil') keil(ctx, f.laenge);
  else if (f.geraet === 'spaten') spaten(ctx, f.laenge);
  else planke(ctx, f.laenge);
  ctx.restore();
}
