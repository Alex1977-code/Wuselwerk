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
 * Das gilt fuer die **Murmel**. Beim Erdmaennchen hat sich die Lage geaendert,
 * und weiter unten bei `FUEHRT_TIER` steht, woran das gemessen wurde.
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
type Geraet = 'keil' | 'spaten' | 'planke' | 'krallen' | 'schirm';

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
  // Senkrecht nach oben — und als einziges Geraet **nicht** an der Hand.
  // Warum, steht bei `SCHIRM_HOCH`.
  floating: { geraet: 'schirm', winkel: -90, laenge: 7.4 },
};

/**
 * Womit das Erdmaennchen arbeitet: mit dem, was es hat.
 *
 * ## Warum die drei Geraete hier verschwinden
 *
 * Weil sie eine Luecke fuellten, die es nicht mehr gibt — und das ist gemessen,
 * nicht behauptet. Als Mass dient die Ueberdeckung der Silhouetten der drei
 * grabenden Berufe: Je hoeher, desto aehnlicher sehen sie sich.
 *
 * | | Ueberdeckung |
 * |---|---|
 * | alte Posen, ohne jedes Geraet | 69,2 % |
 * | alte Posen mit Keil und Spaten | 50,3 % |
 * | neue Posen, ohne jedes Geraet | 53,7 % |
 *
 * Neunundsechzig Prozent — die alten Posen waren fast dasselbe Bild, und das
 * Geraet trug den Unterschied allein. Es war die richtige Antwort auf die
 * Lage. Inzwischen stehen die drei bei 14, 40 und 60 Grad Rumpfneigung und
 * unterscheiden sich in der Haltung des ganzen Tieres; die nackte Silhouette
 * liegt damit fast dort, wo frueher nur das Geraet hinkam.
 *
 * ## Was die Krallen leisten — und was nicht
 *
 * **Nicht** die Unterscheidbarkeit. Mit ihnen misst dieselbe Ueberdeckung 54,3
 * statt 53,7 Prozent; dafuer sind sie zu klein. Wer sie fuer den Ersatz des
 * Spatens haelt, taeuscht sich, und ich habe genau das zuerst geglaubt.
 *
 * Sie bleiben aus einem anderen Grund: Diese Figur ist sandbraun auf sandbraun,
 * und „Farbe fehlt" stand schon einmal im Rueckmeldebogen. Ein dunkler Fleck an
 * der arbeitenden Pfote ist der Akzent, den ihr fehlt — und er ist kein
 * Fremdkoerper, sondern das, was ein Erdmaennchen zum Graben tatsaechlich
 * benutzt.
 *
 * Die **Planke** bleibt. Sie ist kein Werkzeug, sondern das Material: Aus ihr
 * wird die Stufe, die gleich im Gelaende liegt. Sie wegzunehmen hiesse, den
 * Brueckenbauer beim Bauen von nichts zu zeigen.
 */
const KRALLE = '#33251a';

/**
 * Die Abweichungen des Erdmaennchens. Die Winkel bleiben, nur das Mittel wechselt
 * — der Spieler liest weiterhin die Achse, sie kommt jetzt nur aus der Pfote.
 */
const FUEHRT_TIER: Record<string, Fuehrung> = {
  bashing: { geraet: 'krallen', winkel: 0, laenge: 3.1 },
  mining: { geraet: 'krallen', winkel: 45, laenge: 3.0 },
  digging: { geraet: 'krallen', winkel: 90, laenge: 2.8 },
};

function fuehrung(pose: string, figur: string): Fuehrung | undefined {
  if (figur === 'erdmaennchen' && FUEHRT_TIER[pose]) return FUEHRT_TIER[pose];
  return FUEHRT[pose];
}

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

/**
 * Grabkrallen: drei gespreizte Spitzen, die aus der Pfote in Wirkungsrichtung
 * zeigen.
 *
 * Gespreizt und nicht parallel — drei parallele Striche sind bei dieser Groesse
 * ein Balken, und ein Balken ist wieder ein Geraet. Der Faecher liest sich als
 * Hand, und weil er in der Mitte am laengsten ist, hat er trotzdem eine
 * eindeutige Achse.
 */
function krallen(ctx: CanvasRenderingContext2D, l: number): void {
  ctx.fillStyle = KRALLE;
  for (const [winkel, anteil] of [
    [-22, 0.82],
    [0, 1],
    [22, 0.86],
  ] as const) {
    const b = (winkel * Math.PI) / 180;
    const cx = Math.cos(b);
    const cy = Math.sin(b);
    const len = l * anteil;
    // Ein Keil vom Pfotenballen zur Spitze, leicht nach aussen gebogen.
    const d = l * 0.15;
    ctx.beginPath();
    ctx.moveTo(-cy * d - cx * l * 0.35, cx * d - cy * l * 0.35);
    ctx.quadraticCurveTo(cx * len * 0.6 - cy * d * 0.7, cy * len * 0.6 + cx * d * 0.7, cx * len, cy * len);
    ctx.quadraticCurveTo(cx * len * 0.55 + cy * d * 0.5, cy * len * 0.55 - cx * d * 0.5, cy * d - cx * l * 0.35, -cx * d - cy * l * 0.35);
    ctx.closePath();
    ctx.fill();
  }
}

/**
 * Der Schirm des Schirmspringers.
 *
 * ## Warum er als einziges Geraet nicht an der Hand haengt
 *
 * Weil er nicht gefuehrt wird, sondern **traegt**. Ein Keil zeigt dorthin, wo
 * die Hand hinzeigt; ein Schirm steht ueber der Figur, ganz gleich wie sie die
 * Arme haelt. Gemessen wurde das an beiden Figuren: Beim Wuselwerker meldet das
 * Rig die vordere Hand bei x +3,15, beim Erdmaennchen bei x −4,65 — beide
 * greifen mit beiden Haenden nach oben, und welche davon „vorn" ist, entscheidet
 * der Zufall der Drehung. Ein Schirm an dieser Stelle stuende einmal rechts und
 * einmal links neben der Figur.
 *
 * Sein Ansatz ist deshalb die **Mittellinie ueber dem Kopf**, und das braucht
 * keine Messung: Dort haengt ein Schirm per Begriff.
 *
 * ## Warum es ihn ueberhaupt gibt
 *
 * Der Schirmspringer war der einzige Beruf ohne Gegenstand. Seine Pose — beide
 * Arme senkrecht hoch — ist ohne Schirm die Pose eines Fallenden mit erhobenen
 * Armen, und genau so hat sie sich auch gemessen: `falling` und `floating`
 * ueberdecken sich zu 81 Prozent. Der Schirm ist der Unterschied, und zwar ein
 * grosser: Er ist das breiteste Element, das eine dieser Figuren traegt.
 */
const TUCH = '#D8CBB4';
const TUCH_SCHATTEN = '#A2937C';
const LEINE = '#4A4238';

/** Wie weit ueber dem Fusspunkt die Schirmkuppel sitzt, als Anteil der Koerperhoehe. */
const SCHIRM_HOCH = 1.42;

function schirm(ctx: CanvasRenderingContext2D, l: number): void {
  const b = l * 0.5;
  const h = l * 0.34;
  // Die Kuppel: ein flacher Bogen, unten offen. Sie liegt im gedrehten System
  // mit +x nach oben, deshalb wird hier in y gerechnet, als waere sie waagerecht.
  ctx.fillStyle = TUCH;
  ctx.beginPath();
  ctx.moveTo(0, -b);
  ctx.quadraticCurveTo(h * 2.1, 0, 0, b);
  ctx.quadraticCurveTo(h * 0.55, 0, 0, -b);
  ctx.closePath();
  ctx.fill();
  // Ein Schattenstreifen an der Unterkante gibt dem Tuch Woelbung. Ohne ihn ist
  // die Kuppel ein heller Fleck, und ein Fleck ueber einer Figur ist kein Schirm.
  ctx.fillStyle = TUCH_SCHATTEN;
  ctx.beginPath();
  ctx.moveTo(0, -b);
  ctx.quadraticCurveTo(h * 0.55, 0, 0, b);
  ctx.quadraticCurveTo(h * 0.2, 0, 0, -b);
  ctx.closePath();
  ctx.fill();
  // Die Leinen: von beiden Kuppelraendern zusammenlaufend zur Figur.
  ctx.strokeStyle = LEINE;
  ctx.lineWidth = l * 0.055;
  ctx.beginPath();
  ctx.moveTo(0, -b * 0.94);
  ctx.lineTo(-l * 0.62, -b * 0.16);
  ctx.moveTo(0, b * 0.94);
  ctx.lineTo(-l * 0.62, b * 0.16);
  ctx.stroke();
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
  // Der Wuselwerker: echte Handknochen wie das Erdmaennchen, aber ein Chibi.
  //
  // **Gemessen, und die Zahl ist die eigentliche Aussage.** In allen sechs
  // Posen, in denen eine Hand etwas fuehrt, liegt der gemeldete Handpunkt
  // zwischen 0,54 und 0,82 logischen Pixeln **innerhalb** der Silhouette — und
  // zwar ueberall gleich viel. Das ist keine Schaetzung, die danebenliegt, das
  // ist die Dicke des Aermels: Der Knochen sitzt im Handgelenk, der Handschuh
  // steht darum herum. Ein Ausgleich, der diese acht Zehntel wieder aufhebt,
  // ist damit alles, was noetig ist — deshalb `luft` 0,06 (0,72 Pixel bei einer
  // Koerperhoehe von zwoelf) und `handab` null.
  //
  // Die Ellipse traegt hier bewusst nichts bei: `breit` 0,22 sind 2,6 Pixel je
  // Seite und damit der blosse Rumpf ohne Arme. Jede Hand, die etwas fuehrt,
  // liegt weiter aussen, `austritt` liefert null, und der Ansatz bleibt an der
  // Hand. Genau das war beim Erdmaennchen die Lehre: Wer echte Haende hat, darf
  // sich die Berichtigung fuer geschaetzte nicht ein zweites Mal aufhalsen.
  //
  // Der Kopf steht dabei aussen vor. Er ist bei dieser Figur mit Haar acht
  // Pixel breit und damit breiter als jedes Werkzeug lang aus der Hand ragt —
  // aber er sitzt oben, und die Haende arbeiten auf Brust- bis Huefthoehe.
  // Eine Ellipse, die das Haar einschloesse, schoebe den Spaten quer durch die
  // Figur hinaus.
  wuselwerker: { breit: 0.22, hoch: 0.4, mitte: -0.5, handab: 0, luft: 0.06 },
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
  const f = fuehrung(pose, figur);
  if (!f) return null;
  const k = KOERPER[figur] ?? KOERPER.murmel;
  const bogen = (f.winkel * Math.PI) / 180;
  const cx = Math.cos(bogen);
  const cy = Math.sin(bogen);
  // Krallen wachsen aus der Pfote und werden nicht aus dem Koerper geschoben.
  //
  // Der Austritt berichtigt einen **geschaetzten** Ansatz, der im Bauch landet.
  // Eine Kralle sitzt dort, wo die Pfote ist — auch wenn die gerade unter dem
  // Bauch durchzieht und man sie halb nicht sieht. Genau das soll man sehen.
  if (f.geraet === 'krallen') return { x: hx, y: hy, bogen };
  // Der Schirm haengt ueber der Mittellinie und nicht an der Hand. Die
  // gemeldete Handstelle geht hier absichtlich nicht ein — warum, steht bei
  // `SCHIRM_HOCH`.
  if (f.geraet === 'schirm') return { x: 0, y: -koerperH * SCHIRM_HOCH, bogen };
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
  const f = fuehrung(pose, figur)!;

  ctx.save();
  ctx.translate(a.x * s, a.y * s);
  ctx.scale(s, s);
  ctx.rotate(a.bogen);
  if (f.geraet === 'keil') keil(ctx, f.laenge);
  else if (f.geraet === 'spaten') spaten(ctx, f.laenge);
  else if (f.geraet === 'krallen') krallen(ctx, f.laenge);
  else if (f.geraet === 'schirm') schirm(ctx, f.laenge);
  else planke(ctx, f.laenge);
  ctx.restore();
}
