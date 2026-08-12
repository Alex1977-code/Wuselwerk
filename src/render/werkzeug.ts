/**
 * Das Werkzeug in der Hand der Figur.
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
 * Der Koerper einer Figur, so grob wie das Werkzeug ihn braucht.
 *
 * Alle Masse als Anteil der Koerperhoehe, damit die Zellgeometrie sie nicht
 * beruehrt.
 *
 * **Warum das je Figur verschieden ist, und zwar wesentlich.** Beim Blatt der
 * Murmel ist der Handpunkt eine **Schaetzung** — dieses Modell hat keine
 * Handknochen, die Armspitze wurde gerechnet, und sie landet mitten im Koerper.
 * Der ganze Apparat darunter, die Ellipse und der Versatz nach unten, ist die
 * Berichtigung dieser Schaetzung.
 *
 * Das Erdmaennchen hat **echte Handknochen**. Sein Handpunkt ist die Pfote, an
 * der Stelle, an der sie im Bild steht. Dieselbe Berichtigung noch einmal
 * anzuwenden hiess, eine Schaetzung auszugleichen, die es nicht gibt: Das Gerat
 * sackte anderthalb Pixel unter die Pfote und stand zweieinhalb Pixel neben dem
 * Tier in der Luft. Genau so sah es im Spiel aus.
 */
interface Koerperform {
  /** Halbe Breite des Rumpfes. */
  breit: number;
  /** Halbe Hoehe des Rumpfes. */
  hoch: number;
  /** Mitte des Rumpfes ueber dem Fusspunkt (negativ = oben). */
  mitte: number;
  /** Wie weit der Ansatz unter den gemeldeten Handpunkt rutscht. */
  handab: number;
  /** Luft zwischen Silhouette und Geraet. */
  luft: number;
}

const KOERPER: Record<string, Koerperform> = {
  // Die Murmel: ein Ei, und der Handpunkt ist geschaetzt.
  //
  // `handab` ist hier kein Feinschliff, sondern eine Notwendigkeit: Der Knochen
  // sitzt auf Schulterhoehe, und die ist bei dieser Figur genau die Hoehe der
  // Augen. Ohne den Versatz wuchs der Keil dem Rammer aus dem Gesicht wie ein
  // Schnabel — im Bild sofort zu sehen, in den Zahlen nicht.
  murmel: { breit: 0.4, hoch: 0.52, mitte: -0.5, handab: 0.14, luft: 0.12 },
  // Das Erdmaennchen: schmaler Rumpf, echte Pfote.
  //
  // `breit` ist gemessen und nicht geraten. Frontal — der Blocker — ist die
  // Figur 5,5 logische Pixel breit, also knapp 0,23 Koerperhoehen je Seite. Im
  // Arbeitswinkel kommt die Schnauze dazu; die aber ist Kopf und liegt ueber
  // dem Geraet, nicht dahinter. Ein Rumpf von 0,26 laesst das Werkzeug am
  // Brustkorb austreten und trotzdem an der Pfote haengen.
  erdmaennchen: { breit: 0.26, hoch: 0.44, mitte: -0.52, handab: 0, luft: 0.05 },
};

/**
 * Wie weit das Werkzeug aus dem Koerper heraustreten muss.
 *
 * Der Koerper wird als Ellipse angenaehert, und der Ansatz entlang der
 * Werkzeugachse so weit nach aussen geschoben, bis er sie verlaesst. Das ist
 * eine quadratische Gleichung und kostet nichts — der Gewinn ist, dass es
 * **fuer jeden Winkel** stimmt und nicht je Pose von Hand nachgestellt werden
 * muss.
 *
 * Liegt der Ansatz schon ausserhalb der Ellipse, kommt null heraus, und das ist
 * richtig so: Dann haelt die Figur das Geraet bereits neben sich.
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
 * Wo das Werkzeug ansetzt und in welche Richtung es zeigt.
 *
 * Getrennt vom Zeichnen, damit sich diese Rechnung **pruefen** laesst. Sie ist
 * die Stelle, an der eine Figur mit gemessenen Pfoten und eine Figur mit
 * geschaetzten Armspitzen auseinandergehen — und der Fehler dabei sieht auf dem
 * Blatt nach nichts aus: Das Blatt ist richtig, nur das Geraet steht daneben.
 */
export function werkzeugAnsatz(
  pose: string,
  hx: number,
  hy: number,
  koerperH: number,
  figur = 'murmel',
): { x: number; y: number; bogen: number } | null {
  const f = FUEHRT[pose];
  if (!f) return null;
  const k = KOERPER[figur] ?? KOERPER.murmel;
  const bogen = (f.winkel * Math.PI) / 180;
  const cx = Math.cos(bogen);
  const cy = Math.sin(bogen);
  const hy2 = hy + koerperH * k.handab;
  // Der Koerper als Ellipse. Ihr Mittelpunkt liegt ueber dem Fusspunkt,
  // deshalb wird der Ansatz vorher dorthin umgerechnet.
  const t = austritt(hx, hy2 - koerperH * k.mitte, cx, cy, koerperH * k.breit, koerperH * k.hoch);
  // Ein Geraet, das die Silhouette genau beruehrt, sieht angeklebt aus statt
  // gehalten — ein wenig Luft obendrauf.
  const ab = t + koerperH * k.luft;
  return { x: hx + cx * ab, y: hy2 + cy * ab, bogen };
}

/**
 * Das Werkzeug zeichnen.
 *
 * @param hx Ansatz in logischen Pixeln, waagerecht vom Fusspunkt aus.
 * @param hy Ansatz in logischen Pixeln, senkrecht vom Fusspunkt aus (negativ = oben).
 * @param koerperH Hoehe des Koerpers in logischen Pixeln.
 * @param s Bildpunkte je logischem Pixel.
 * @param figur Welche Figur — sie entscheidet ueber die Koerperform.
 */
export function drawWerkzeug(
  ctx: CanvasRenderingContext2D,
  pose: string,
  hx: number,
  hy: number,
  koerperH: number,
  s: number,
  figur = 'murmel',
): void {
  const a = werkzeugAnsatz(pose, hx, hy, koerperH, figur);
  if (!a) return;
  const f = FUEHRT[pose];

  ctx.save();
  ctx.translate(a.x * s, a.y * s);
  ctx.scale(s, s);
  ctx.rotate(a.bogen);
  if (f.geraet === 'keil') keil(ctx, f.laenge);
  else if (f.geraet === 'spaten') spaten(ctx, f.laenge);
  else planke(ctx, f.laenge);
  ctx.restore();
}
