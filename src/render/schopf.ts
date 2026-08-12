import { TICK_HZ } from '../core/constants';
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

// ---------------------------------------------------------------------------
// Die Warnlampe
// ---------------------------------------------------------------------------

/**
 * Der Sprengcountdown — als **Warnlampe**, nicht als Ziffer und nicht als
 * Flackern.
 *
 * ## Was vorher falsch war
 *
 * Der Schopf sprang hart zwischen seiner Farbe und Weiss hin und her. Das war
 * die richtige Idee an der falschen Stelle: Der Schopf ist ein paar Bildpunkte
 * breit, und ein harter Wechsel an einem so kleinen Ding liest sich als
 * Flimmern, nicht als Warnung. Bei einem Pulk laufender Figuren sah man ihn
 * schlicht nicht.
 *
 * ## Was eine Warnlampe ausmacht
 *
 * Drei Dinge, und alle drei fehlten:
 *
 * 1. **Sie wechselt weich.** Eine Gluehwendel hat Traegheit. Ein harter
 *    Rechteckwechsel ist ein Stroboskop, und ein Stroboskop liest man als
 *    Stoerung, nicht als Ansage.
 * 2. **Sie leuchtet ihre Umgebung an.** Das ist der eigentliche Unterschied:
 *    Nicht die Lampe ist auffaellig, sondern der Lichtkegel um sie herum. Ein
 *    Schein, der ueber den Umriss hinausgeht, ist auch dann noch zu sehen, wenn
 *    die Figur selbst hinter etwas steht.
 * 3. **Sie hat einen Takt, den man mitzaehlen kann.** Gut ein Puls je Sekunde
 *    („nicht zu schnell"), und in den letzten zwei Sekunden der doppelte — das
 *    ist die Stelle, an der aus einer Anzeige eine Aufforderung wird.
 *
 * ## Warum die Phase **rueckwaerts** gezaehlt wird
 *
 * `fuse` zaehlt zum Knall hin herunter, und die Phase wird daraus von hinten
 * aufgebaut. Damit liegt der hellste Punkt jedes Pulses genau auf dem Knall,
 * und nicht irgendwo davor. Vorwaerts gezaehlt haengt es vom Zufall der
 * Zuendschnurlaenge ab, ob die Lampe im Dunkeln oder im Hellen explodiert —
 * und man sieht dem letzten Puls dann nicht an, dass er der letzte war.
 *
 * Getaktet wird an der Zuendschnur der **einzelnen Figur**, nicht an einer
 * Bilduhr. Zwei nacheinander gezuendete Sprengmeister pulsen dadurch
 * gegeneinander, und man sieht, wer zuerst hochgeht.
 */
/** Pulse je Sekunde, solange noch Zeit ist. Knapp ueber eins — mitzaehlbar. */
const LAMPE_HZ = 1.15;
/** Pulse je Sekunde in den letzten zwei Sekunden. Doppelt, nicht schneller. */
const LAMPE_HZ_ENDE = 2.3;
/** Wann der Takt umschaltet, in Ticks. */
const LAMPE_ENDSPURT = 2 * TICK_HZ;

/**
 * Helligkeit der Warnlampe, 0 bis 1. Rein aus `fuse` — also deterministisch und
 * fuer jede Figur ihre eigene.
 */
export function zuenderGlut(fuse: number): number {
  if (fuse <= 0) return 0;
  const nah = Math.min(fuse, LAMPE_ENDSPURT);
  const weit = Math.max(0, fuse - LAMPE_ENDSPURT);
  const phase = (nah * LAMPE_HZ_ENDE + weit * LAMPE_HZ) / TICK_HZ;
  // Kosinus statt Sinus: Bei fuse = 0 steht die Lampe auf hell.
  return 0.5 + 0.5 * Math.cos(2 * Math.PI * phase);
}

/** Farbmischung im sRGB-Raum. Fuer eine Lampe genau genug. */
function mische(a: string, b: string, t: number): string {
  const k = Math.max(0, Math.min(1, t));
  const zahl = (h: string, i: number) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  const teil = (i: number) => Math.round(zahl(a, i) + (zahl(b, i) - zahl(a, i)) * k);
  return `rgb(${teil(0)}, ${teil(1)}, ${teil(2)})`;
}

/** Das Signalorange der Lampe und ihr weissgluehender Kern. */
const WARN_ORANGE = '#FF5A22';
const WARN_KERN = '#FFF0C6';

/**
 * Die Schopffarbe waehrend der Zuendschnur.
 *
 * Zwei Stufen statt einer: erst von der Berufsfarbe ins Signalorange, dann im
 * obersten Drittel ins Weissgluehende. Eine einzige Rampe zwischen zwei Farben
 * sieht aus, als waere jemand am Regler; zwei Stufen sehen aus, als glühte
 * etwas auf.
 */
export function schopfPuls(basis: string, fuse: number): string {
  if (fuse <= 0) return basis;
  const glut = zuenderGlut(fuse);
  const heiss = mische(basis, WARN_ORANGE, Math.min(1, glut * 1.5));
  return mische(heiss, WARN_KERN, Math.max(0, (glut - 0.66) / 0.34));
}

/**
 * Der Schein **hinter** der Figur.
 *
 * Er ist das eigentliche Warnzeichen: Er reicht ueber den Umriss hinaus, faellt
 * also auch auf das Gelaende daneben, und ist damit noch zu erkennen, wenn die
 * Figur selbst im Gewuehl steckt. Gezeichnet wird er vor der Figur, damit er
 * hinter ihr liegt — ein Schein ueber dem Koerper waere Nebel.
 *
 * **Er pulst nicht mehr.** Frueher hing er an `zuenderGlut` und blinkte im
 * Lampentakt — zusammen mit dem Licht auf der Figur und dem pulsenden Band
 * war das „eine flackernde Figur", und genau so wurde es gemeldet. Seit die
 * Uhr ueber dem Kopf die Zeit ansagt (`drawZuendUhr`), muss der Schein nichts
 * mehr ansagen; er waechst nur noch ruhig mit der Naehe zum Knall.
 *
 * @param x Fusspunkt auf dem Bildschirm.
 * @param koerperH Figurenhoehe in logischen Pixeln.
 * @param s Bildpunkte je logischem Pixel.
 */
export function drawWarnschein(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  koerperH: number,
  s: number,
  fuse: number,
): void {
  if (fuse <= 0) return;
  // Ruhige Rampe statt Puls: von einem Drittel beim Zuenden auf voll am Knall.
  const nah = 1 - Math.min(1, fuse / (5 * TICK_HZ));
  const glut = 0.34 + 0.66 * nah;
  const my = y - koerperH * 0.55 * s;
  const r = koerperH * s * (0.9 + 0.55 * glut);
  const schein = ctx.createRadialGradient(x, my, 0, x, my, r);
  schein.addColorStop(0, `rgba(255, 122, 48, ${0.4 * glut})`);
  schein.addColorStop(0.45, `rgba(255, 90, 34, ${0.18 * glut})`);
  schein.addColorStop(1, 'rgba(255, 80, 30, 0)');
  ctx.save();
  ctx.fillStyle = schein;
  ctx.beginPath();
  ctx.arc(x, my, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Die Zuendschnur-Uhr ueber dem Kopf: die Sekunde als Ziffer, darum ein
 * Ring, der sich im Lauf der Sekunde leert.
 *
 * ## Warum eine Uhr und kein Blinken
 *
 * Die erste Fassung sagte die Restzeit ueber Licht an: pulsendes Band,
 * pulsender Schein, pulsendes Licht auf dem Koerper. Das war dreimal dieselbe
 * Aussage, und zusammen ergab es keine Lampe, sondern eine flackernde Figur —
 * so stand es in der Rueckmeldung. Eine Ziffer sagt dasselbe ohne ein
 * einziges Blinken, und sie sagt es genauer: „3" liest sich schneller als
 * drei Pulse zaehlen.
 *
 * Der Ring ist die stetige Haelfte der Aussage: Er leert sich im Uhrzeigersinn
 * einmal je Sekunde und macht sichtbar, dass die Zeit **laeuft** — eine nackte
 * Ziffer, die sekundenlang stillsteht, saehe angehalten aus. Beides ist rein
 * aus `fuse` gerechnet, also deterministisch und je Figur ihre eigene.
 *
 * @param x Fusspunkt auf dem Bildschirm.
 * @param y Fusspunkt auf dem Bildschirm (Unterkante der Figur).
 * @param koerperH Figurenhoehe in logischen Pixeln.
 * @param s Bildpunkte je logischem Pixel.
 */
export function drawZuendUhr(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  koerperH: number,
  s: number,
  fuse: number,
): void {
  if (fuse <= 0) return;
  const sek = Math.ceil(fuse / TICK_HZ);
  // Anteil der laufenden Sekunde, der noch uebrig ist: 1 direkt nach dem
  // Umspringen, gegen 0 kurz davor.
  const rest = (fuse - (sek - 1) * TICK_HZ) / TICK_HZ;
  // Ueber dem Scheitel, mit Luft — beim Wuselwerker ragt das Haar gut einen
  // Pixel ueber die Koerperhoehe hinaus. Die Uhr ist bewusst gross: gut halbe
  // Koerperhoehe im Durchmesser. Die erste Fassung mass zwei logische Pixel im
  // Radius und war damit kleiner als ein Kopf — „den erkennt man nicht", und
  // eine Uhr, die man suchen muss, warnt nicht.
  const mx = x;
  const my = y - (koerperH + 7.4) * s;
  const r = 3.4 * s;

  ctx.save();
  // Die letzte Sekunde wechselt von Signalorange auf Weissglut — dieselben
  // zwei Farben, mit denen vorher die Lampe endete. Ein Wechsel, kein Puls.
  const heiss = sek <= 1;
  const farbe = heiss ? WARN_KERN : WARN_ORANGE;

  // Dunkler Teller, damit die Ziffer auf jedem Untergrund steht. Leicht
  // durchscheinend: Die Uhr gehoert zur Szene, nicht zur Bedienoberflaeche.
  ctx.fillStyle = 'rgba(20, 22, 28, 0.78)';
  ctx.beginPath();
  ctx.arc(mx, my, r, 0, Math.PI * 2);
  ctx.fill();

  // Der Ring: beginnt oben und leert sich im Uhrzeigersinn.
  ctx.strokeStyle = farbe;
  ctx.lineWidth = Math.max(1.4, 0.62 * s);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(mx, my, r, -Math.PI / 2, -Math.PI / 2 + rest * Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = farbe;
  ctx.font = `700 ${(4.4 * s).toFixed(1)}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // Ein Hauch tiefer als die Mitte — Ziffern haengen optisch hoch.
  ctx.fillText(String(sek), mx, my + 0.2 * s);
  ctx.restore();
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

/** Der laengste Schopf ueberhaupt. Weiter muss keine Messung reichen. */
export const SCHOPF_MAX = FORM.reduce((m, f) => Math.max(m, f[0]), 0);

/**
 * Wie viel Platz der Schopf an dieser Stelle hat, in logischen Pixeln.
 *
 * ## Warum das noetig wurde
 *
 * Der Schopf ist sieben logische Pixel lang, der Koerper zwoelf. Er ragt also
 * ueber die Haelfte einer Figurenhoehe ueber den Kopf hinaus — und der
 * Kollisionskoerper der Simulation ist genau die zwoelf. Laeuft eine Murmel
 * dicht an einer Betonwand entlang, steckt ihr Schopf **in** der Wand. Das ist
 * kein Simulationsfehler (die Figur steht richtig), sondern ein Bildfehler, und
 * er ist der auffaelligste, den eine Figur haben kann: Etwas an ihr ist im
 * Stein.
 *
 * ## Warum nicht einfach kuerzen
 *
 * Weil der Schopf die halbe Figur ist. Er traegt Mimik, Beruf und Fallschirm;
 * ihn auf Wandstaerke zu stutzen hiesse, die Figur ueberall dort zu
 * verschlechtern, wo gar keine Wand ist. Ein Buschel Haare **weicht** einer
 * Wand ohnehin — es ist das einzige an dieser Figur, das das kann.
 *
 * ## Wie gemessen wird
 *
 * Ein Viertelkreis vom Senkrechten bis fast waagerecht nach vorn, in
 * Einserschritten nach aussen abgetastet. Zurueck kommt der erste Radius, an dem
 * irgendwo Gestein steht. Bewusst **richtungsunabhaengig**: Welchen Winkel der
 * Schopf im naechsten Einzelbild einnimmt, weiss der Zeichner nicht — und eine
 * Murmel dicht an der Wand soll auf allen Bildern ducken, nicht nur auf denen,
 * die zufaellig in die Wand zeigen.
 *
 * @param solid Gelaendeabfrage; die Renderschicht kennt das Terrain nicht selbst.
 * @param ax Ansatzpunkt in Weltkoordinaten.
 * @param dir Blickrichtung der Figur; „vorn" ist ihre Laufrichtung.
 */
export function schopfPlatz(
  solid: (x: number, y: number) => boolean,
  ax: number,
  ay: number,
  dir: -1 | 1,
): number {
  // Fuenf Winkel von senkrecht bis 80 Grad nach vorn. Weniger liesse Luecken,
  // mehr kostet nur.
  const winkel = [0, 0.35, 0.7, 1.05, 1.4];
  for (let r = 1; r <= SCHOPF_MAX; r++) {
    for (const wi of winkel) {
      const px = Math.round(ax + Math.sin(wi) * r * dir);
      const py = Math.round(ay - Math.cos(wi) * r);
      if (solid(px, py)) return r - 1;
    }
  }
  return SCHOPF_MAX;
}

/**
 * Den Schopf zeichnen.
 *
 * @param x Ansatzpunkt auf dem Bildschirm — der Anker aus dem Manifest.
 * @param s Bildpunkte je logischem Pixel.
 * @param spiegeln Blickt die Figur nach links? Dann kippt auch der Schopf mit.
 * @param platz Freier Raum in logischen Pixeln, aus `schopfPlatz`. Ist er
 *   kleiner als die natuerliche Laenge, duckt sich der Schopf: kuerzer, breiter
 *   und staerker gekruemmt — so, wie sich Haare unter einer Decke legen. Ein
 *   blosses Abschneiden saehe aus wie ein Zeichenfehler.
 */
export function drawSchopf(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  zustand: number,
  farbe: string,
  s: number,
  spiegeln = false,
  platz = Infinity,
): void {
  const i = Math.max(0, Math.min(FORM.length - 1, Math.round(zustand)));
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(spiegeln ? -s : s, s);
  ctx.fillStyle = farbe;
  if (i === 8) {
    // Auch der Schirm duckt sich. Ein Fallschirm, der in die Decke ragt, ist
    // derselbe Fehler wie eine Zacke, die es tut.
    schirm(ctx, Math.min(6.4, Math.max(2.2, platz)));
  } else {
    const [laenge, breite, winkel, biegung] = FORM[i];
    // Wie stark geduckt: 1 heisst freier Himmel.
    const k = Math.max(0.28, Math.min(1, platz / laenge));
    // Was an Laenge fehlt, geht in Breite und Kruemmung. Ein Buschel, das
    // anstoesst, wird stumpfer und rollt sich ein — es wird nicht kuerzer.
    zacke(ctx, laenge * k, breite * (1 + (1 - k) * 0.45), winkel, biegung + (1 - k) * 0.5);
  }
  ctx.restore();
}
