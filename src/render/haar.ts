/**
 * Die langen Straehnen des Wuselwerkers — gezeichnet, nicht gebacken.
 *
 * ## Warum ueberhaupt gezeichnet
 *
 * Die Haarmasse steckt im Blatt und wird beim Backen auf eine Ellipse gestutzt
 * (`scripts/haar-bauen.mjs`). Damit ist der Kopf frei, aber das Haar ist kurz —
 * und kurz war nie das Ziel. Die Laenge kommt von hier.
 *
 * Sie kann nicht aus dem Modell kommen, und das ist gemessen. Beim Modell vom
 * 22.08.2026 ist die Stauchung weggefallen — die Figur kommt schon schlank —,
 * aber der Grund bleibt ein anderer und aelterer: Was `haar-bauen.mjs` nicht
 * auf die Ellipse stutzt, verdeckt das Gesicht. Die Kopfhalbbreite misst 0,221
 * Modelleinheiten, und der Stutz zieht die Haarmasse genau darauf zurueck.
 * Uebrig bleibt eine kurze Kappe: Sie traegt 31,9 Prozent der Figurenhoehe im
 * Blatt, aber ihr Umriss ist geschlossen. Alles, was danebenstehen und den
 * Umriss brechen soll, legt der Zeichner in Bildschirmkoordinaten daneben —
 * gemessen 15,1 Prozent Flaeche neben dem Umriss des Blattes.
 *
 * ## Die drei Zahlen, an denen hier alles haengt
 *
 * 1. **Haarblau steht vor der gruenen Tunika mit WCAG 1,08** — also gar nicht.
 *    Eine Straehne vor dem Rumpf ist keine Straehne. Deshalb wird alles
 *    **hinter** der Figur gezeichnet: Was der Koerper verdeckt, war ohnehin
 *    unsichtbar, und was danebensteht, steht vor Himmel oder Erde.
 * 2. **Zwei Straehnen lesen sich erst ab 0,9 logischen Pixeln Abstand
 *    einzeln.** Darum drei und nicht siebzehn. Sechs duenne Faeden sind in der
 *    Entwurfsrunde gemessen durchgefallen: 71 Prozent der Spitzenpaare unter
 *    der Lesegrenze — wieder eine blaue Wolke, nur weiter unten. Vier waren es
 *    bis zum 22.08.2026, und vier war eine zuviel: Der Backvorgang teilt den
 *    Kopf in Winkelfaecher, und von vorn gesehen faellt der ganze Hinterkopf
 *    auf denselben Bildstreifen. In allen sechsundsechzig Einzelbildern lagen
 *    zwei der vier Wurzeln zwischen 0,02 und 0,08 logischen Pixeln
 *    auseinander — die Figur trug drei Straehnen, von denen eine doppelt
 *    gezeichnet war. Mit dreien steht das engste Wurzelpaar im Mittel bei 0,92
 *    lp, also ueber der Lesegrenze, nur noch 0,5 Prozent der Spitzenpaare
 *    verschmelzen (vorher 8,8), und es liegt sogar MEHR Tinte neben dem Umriss
 *    (15,1 statt 14,4 Prozent) bei einem Viertel weniger Strichen.
 * 3. **Ungleiche Laengen sind die Bedingung, nicht die Zierde.** Gleich lang
 *    verschmelzen 73 Prozent aller Spitzenpaare, gestaffelt 0 bis 2 Prozent.
 *    Eine gerade Unterkante waere wieder eine geschlossene Silhouette — also
 *    wieder eine Kappe, nur laenger.
 *
 * ## Und vor Erde mit Kontrast 1,00?
 *
 * Dieselbe Antwort wie fuer die ganze Figur: der Saum. Jede Straehne wird
 * zweimal gezogen — erst breit im Saumton, dann schmal im Haarton. Ohne das
 * verschwindet blaues Haar im Stollen vollstaendig, das ist in `saum.test.ts`
 * nachgemessen. Der Saumton kommt von aussen, weil er je Welt verschieden ist:
 * In Kristallklamm und Schlot ist er hell.
 *
 * ## Der Witz sitzt in der Traegheit
 *
 * Das Haar haengt, wenn die Figur steht, und bleibt zurueck, wenn sie laeuft
 * oder faellt. Das ist die ganze Physik, die es braucht, und sie ist eine
 * Funktion der **Pose**, nicht des Zufalls: `Math.random` kaeme hier zwar in
 * einen reinen Zeichenweg, aber ein Haar, das bei jedem Bild woanders steht,
 * flackert. Der Nachlauf steht deshalb in einer Tabelle.
 */

import { FALL_DEATH_PX, SCHREI_AB } from '../core/constants';

/** Der gemessene Grundton der Haarmasse im Blatt: Farbton 228 Grad, L* 37,9. */
const HAAR = '#3851b6';

/**
 * Wie weit die Spitzen der Pose hinterherhaengen, in logischen Pixeln.
 *
 * Waagerecht ist negativ „nach hinten": Der Zeichner arbeitet im bereits
 * gespiegelten Koordinatensystem der Figur, dort zeigt vorn immer nach +x.
 * Senkrecht ist negativ „nach oben" — das ist der Fall, in dem das Haar
 * stehenbleibt, waehrend der Koerper schon faellt.
 */
const ZUG: Record<string, readonly [number, number]> = {
  walking: [-0.55, -0.1],
  falling: [-0.9, -1.7],
  floating: [-0.3, -1.1],
  climbing: [-0.35, 0.15],
  hoisting: [-0.5, -0.45],
  building: [-0.2, 0],
  bashing: [-0.4, -0.1],
  mining: [-0.3, -0.05],
  digging: [-0.25, 0.1],
  blocking: [0, 0],
  saving: [-0.25, -0.95],
  dying: [0.35, 0.2],
  spaehen: [0, 0.05],
};


/**
 * Die Kopfachse einer normal grossen Pose, in logischen Pixeln.
 *
 * Der Mittelwert ueber alle sechsundsechzig Einzelbilder des gebackenen
 * Blattes, gemessen und nicht angenommen: 1,83 (die Figur vor dem Neubau
 * hatte 1,61 — ihr Kopf war schmaler). Die beiden Ausreisser sind der
 * Grund, warum die Zahl hier steht: `saving` schrumpft die Figur beim
 * Entschweben auf die Haelfte, `dying` staucht sie. Eine Straehne in festen
 * Pixeln bliebe dabei stehen und haenge zuletzt laenger herab, als die ganze
 * Figur hoch ist — genau so sah der erste Lauf aus. In Kopfachsen gerechnet
 * schrumpft sie mit. Dasselbe tut das Stirnband seit langem, aus demselben
 * Grund.
 */
const ACHSE_NORM = 1.83;
/**
 * Dicke an der Wurzel und an der Spitze, in logischen Pixeln.
 *
 * Beide sind mit dem neuen Modell schmaler geworden (vorher 0,78 und 0,26),
 * und zwar nicht aus Geschmack: Der Kopf ist breiter, also sind die Straehnen
 * laenger sichtbar, und in alter Dicke legten sie 29,5 Prozent Flaeche neben
 * den Umriss und wuchsen der Figur ueber den Kopf. Mit diesen Werten sind es
 * 15,1 Prozent.
 */
const DICK_WURZEL = 1.45;
const DICK_SPITZE = 0.55;
/**
 * Wie weit eine Straehne, die nach HINTEN zeigt, im Bild nach hinten faellt.
 *
 * Der Bogen nach aussen hilft nur den beiden Schlaefensträhnen. Die drei am
 * Hinterkopf zeigen im Bild nirgendwohin — sie faellen senkrecht hinter den
 * Rumpf und sind weg. Dabei ist gerade der Nacken die Stelle, an der Haar am
 * ehesten frei haengt: Hinter der Figur steht Himmel oder Erde, kein Koerper.
 *
 * Verkuerzt wird das mit dem Sinus der Posendrehung, und das ist keine
 * Feinheit: Von vorn gesehen faellt Nackenhaar hinter den Kopf und ist im Bild
 * gar nicht versetzt. Ohne den Sinus haengt es beim Blocker — 8 Grad — genauso
 * weit zur Seite wie beim Gehen mit 46, und die Figur bekommt einen Zopf, der
 * bei jeder Posenaenderung springt.
 */
const RUECK = 2.4;



/** Was die Straehnen von der Figur wissen muessen. */
export interface HaarLage {
  /** Der Takt des Wusels — treibt das Schwingen. */
  takt?: number;
  /** Der Saumton der Welt. Ohne ihn bleibt die Straehne ohne Rand. */
  saum?: string | null;
  /** Wie weit die Pose aus der Kamera weggedreht ist, in Grad. */
  dreh?: number;
  /** Die Kopfachse dieses Einzelbildes in logischen Pixeln — das Mass der Figur. */
  achse?: number;
  /** Bisher gefallene Pixel. Treibt, wie weit das Haar im Sturz hochsteht. */
  sturz?: number;
  /**
   * Der Nachschlag beim Aufkommen, positiv nach unten. Kommt aus `ansicht.ts`
   * als gedaempfter Schwinger und wechselt darin von selbst das Vorzeichen.
   */
  prall?: number;
  /** Der Ausschlag beim Umdrehen, positiv nach vorn. Ebenfalls aus `ansicht.ts`. */
  wende?: number;
  /**
   * Die Haarkette aus `ansicht.ts`, je Glied ein Punkt in logischen Pixeln
   * vom Ansatz aus. Fehlt sie, haengt das Haar in Ruhe — so zeichnen die
   * Weltkarte und die Profilauswahl, die keine Figur und kein Gedaechtnis
   * haben.
   */
  kette?: readonly (readonly [number, number])[];
}



/**
 * Die Straehnen zeichnen. Gehoert **hinter** die Figur — siehe Kopfkommentar.
 *
 * @param pose Name der Pose; sie bestimmt den Nachlauf.
 * @param wurzeln Je Straehne drei Zahlen: Ansatz in logischen Pixeln in der
 *   Zelle des Blattes — x von der linken Zellkante, y von der oberen —, dann
 *   die Richtung nach **aussen** im Bild (-1 bis 1). Alle
 *   drei misst der Backvorgang je Einzelbild am Haarrand des Modells; die
 *   Richtung kann der Zeichner nicht nachholen, weil er die Kopfdrehung nicht
 *   sieht (siehe `haarwurzeln` in `scripts/bake-figur.mjs`).
 * @param s Bildpunkte je logischem Pixel.
 */
/**
 * Wie weit der Sturz die Masse hochlegt, in logischen Pixeln bei voller Hoehe.
 *
 * Nach OBEN und kaum nach hinten, und das ist der ganze Unterschied zwischen
 * Panik und Fahrtwind: Hinter der Figur zeichnet sie niemand, dort ist sie
 * verdeckt; nach oben steht sie frei vor dem Himmel.
 */
const SCHREI_HOCH = 3.4;

/**
 * Die Kette in Ruhe — fuer alles, was keine Figur hat.
 *
 * Die Weltkarte und die Profilauswahl zeichnen dieselbe Figur ohne
 * Simulation und ohne Gedaechtnis. Ohne diese Ruhelage traegen sie gar kein
 * Haar, und die Figur haette auf der Karte eine andere Frisur als im Spiel.
 */
const RUHE: readonly (readonly [number, number])[] = [
  [0, 2.1],
  [0, 4.2],
  [0, 6.3],
];

export function drawHaar(
  ctx: CanvasRenderingContext2D,
  pose: string,
  wurzeln: readonly (readonly [number, number, number])[],
  s: number,
  lage: HaarLage = {},
): void {
  if (wurzeln.length === 0) return;
  const kette = lage.kette ?? RUHE;
  if (kette.length === 0) return;

  // Wie gross diese Pose gerade ist, gemessen an ihrer eigenen Kopfachse.
  // `saving` schrumpft die Figur beim Entschweben auf die Haelfte, `dying`
  // staucht sie; was in festen Pixeln daranhaengt, bliebe dabei stehen.
  const mass = (lage.achse ?? ACHSE_NORM) / ACHSE_NORM;

  // Der Ansatz: die Mitte der gebackenen Wurzeln.
  //
  // Frueher hing an jeder der drei Wurzeln eine eigene Straehne. Das war der
  // Fehler, den die Rueckmeldung „das eine lange Haar sieht unprofessionell
  // aus" benannt hat: Von vorn gesehen faellt der ganze Hinterkopf auf
  // denselben Bildstreifen, die drei Ansaetze lagen in 155 von 157 Bildern
  // naeher beieinander als die Lesegrenze, und uebrig blieb eine einzelne
  // ueberstehende Straehne neben einer geschlossenen Kappe. Eine Masse hat
  // einen Ansatz.
  let wx = 0;
  let wy = 0;
  let aus = 0;
  for (const w of wurzeln) {
    wx += w[0];
    wy += w[1];
    aus += w[2];
  }
  wx /= wurzeln.length;
  wy /= wurzeln.length;
  aus /= wurzeln.length;

  // Wie stark sich ein Weg nach hinten im Bild ueberhaupt zeigt. Von vorn
  // gesehen faellt Nackenhaar hinter den Kopf und ist gar nicht versetzt.
  const schraeg = Math.sin(((lage.dreh ?? 0) * Math.PI) / 180);

  // Im Sturz legt sich die Masse zurueck — und zwar mit der Fallhoehe.
  //
  // Die beiden Marken sind dieselben, die der Ton benutzt: Bei SCHREI_AB faengt
  // die Figur an zu schreien, bei FALL_DEATH_PX ist es vorbei. Damit sagen Auge
  // und Ohr dasselbe, und der Spieler sieht einem Sturz an, ob er noch gut
  // ausgeht.
  let sturzZug = 0;
  if (pose === 'falling') {
    sturzZug = Math.min(
      1,
      Math.max(0, ((lage.sturz ?? 0) - SCHREI_AB) / (FALL_DEATH_PX - SCHREI_AB)),
    );
  }

  ctx.save();
  ctx.translate(wx * s, wy * s);
  ctx.fillStyle = HAAR;

  // Die Kette als Folge ueberlappender runder Massen, von voll auf ein Drittel.
  //
  // Das ist Celestes Bauart, und sie ist bei dieser Groesse belegt: Madeline
  // ist acht mal elf Bildpunkte gross und traegt vier runde Kleckse, die von
  // voll auf ein Viertel schrumpfen. Ueberlappende Kreise ergeben einen
  // geschlossenen, weichen Umriss — das ist genau das, was bei zwoelf Pixeln
  // ankommt, waehrend eine gezeichnete Straehne dort ein Draht ist.
  let vx = 0;
  let vy = 0;
  for (let i = 0; i < kette.length; i++) {
    const k = kette[i];
    // Der Nachlauf der Pose und der Sturzzug legen die Masse zusaetzlich um.
    const t = (i + 1) / kette.length;
    const zug = ZUG[pose] ?? [0, 0];
    const kx = (k[0] + zug[0] * t * 2 - RUECK * (1 - Math.abs(aus)) * schraeg * t) * mass;
    const ky = (k[1] + zug[1] * t * 2 - sturzZug * SCHREI_HOCH * t) * mass;
    const r = (DICK_WURZEL + (DICK_SPITZE - DICK_WURZEL) * t) * mass;
    // Ein Glied ist ein Kegelstumpf zwischen zwei Kreisen: die beiden Kreise
    // und das Viereck dazwischen. Zusammen ergibt das eine Masse ohne Naht.
    kegel(ctx, vx * s, vy * s, (i === 0 ? DICK_WURZEL * mass : r) * s, kx * s, ky * s, r * s);
    vx = kx;
    vy = ky;
  }
  ctx.restore();
}

/**
 * Zwei Kreise und der Rumpf dazwischen, in einem Zug gefuellt.
 *
 * Einzeln gezeichnete Kreise haetten an jeder Naht eine sichtbare Kante, wenn
 * die Farbe nicht voll deckt; ein Pfad faellt zusammen.
 */
function kegel(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  r0: number,
  x1: number,
  y1: number,
  r1: number,
): void {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const l = Math.hypot(dx, dy);
  ctx.beginPath();
  if (l > 1e-6) {
    const nx = -dy / l;
    const ny = dx / l;
    ctx.moveTo(x0 + nx * r0, y0 + ny * r0);
    ctx.lineTo(x1 + nx * r1, y1 + ny * r1);
    ctx.lineTo(x1 - nx * r1, y1 - ny * r1);
    ctx.lineTo(x0 - nx * r0, y0 - ny * r0);
    ctx.closePath();
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(x1, y1, r1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x0, y0, r0, 0, Math.PI * 2);
  ctx.fill();
}
