/**
 * Die langen Straehnen des Wuselwerkers — gezeichnet, nicht gebacken.
 *
 * ## Warum ueberhaupt gezeichnet
 *
 * Die Haarmasse steckt im Blatt und wird beim Backen auf eine Ellipse gestutzt
 * (`scripts/haar-bauen.mjs`). Damit ist der Kopf frei, aber das Haar ist kurz —
 * und kurz war nie das Ziel. Die Laenge kommt von hier.
 *
 * Sie kann nicht aus dem Modell kommen, und das ist gemessen: Die Figur wird
 * beim Backen waagerecht auf 0,64 gestaucht (`figur.json`), damit sie nicht
 * mehr zu dick ist. Diese Stauchung trifft das Haar mit. Eine Straehne, die im
 * Modell 0,22 Einheiten neben der Kopfachse haengt, landet danach bei 0,14 —
 * und die Kopfhalbbreite ist 0,151. Sie verschwindet also **hinter dem
 * eigenen Kopf**. Alles, was am Modell seitlich haengt, ist nach der Stauchung
 * unsichtbar; nur was der Zeichner in Bildschirmkoordinaten danebenlegt, steht
 * wirklich daneben.
 *
 * ## Die drei Zahlen, an denen hier alles haengt
 *
 * 1. **Haarblau steht vor der gruenen Tunika mit WCAG 1,08** — also gar nicht.
 *    Eine Straehne vor dem Rumpf ist keine Straehne. Deshalb wird alles
 *    **hinter** der Figur gezeichnet: Was der Koerper verdeckt, war ohnehin
 *    unsichtbar, und was danebensteht, steht vor Himmel oder Erde.
 * 2. **Zwei Straehnen lesen sich erst ab 0,9 logischen Pixeln Abstand
 *    einzeln.** Darum fuenf und nicht siebzehn. Sechs duenne Faeden sind in der
 *    Entwurfsrunde gemessen durchgefallen: 71 Prozent der Spitzenpaare unter
 *    der Lesegrenze — wieder eine blaue Wolke, nur weiter unten.
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

/** Die Staffelung der Laengen. Fuenf Werte, keiner davon gleich einem anderen. */
const STAFFEL = [1.0, 0.55, 0.85, 0.4, 0.72];

/** Laenge der laengsten Straehne in logischen Pixeln — die Figur misst 13. */
const LAENGE = 6.4;
/**
 * Die Kopfachse einer normal grossen Pose, in logischen Pixeln.
 *
 * Der Mittelwert ueber alle sechsundsechzig Einzelbilder des gebackenen
 * Blattes, gemessen und nicht angenommen: 1,61. Die beiden Ausreisser sind der
 * Grund, warum die Zahl hier steht: `saving` schrumpft die Figur beim
 * Entschweben auf die Haelfte, `dying` staucht sie. Eine Straehne in festen
 * Pixeln bliebe dabei stehen und haenge zuletzt laenger herab, als die ganze
 * Figur hoch ist — genau so sah der erste Lauf aus. In Kopfachsen gerechnet
 * schrumpft sie mit. Dasselbe tut das Stirnband seit langem, aus demselben
 * Grund.
 */
const ACHSE_NORM = 1.61;
/** Dicke an der Wurzel und an der Spitze. Duenner als 0,75 liest sich als Draht. */
const DICK_WURZEL = 0.58;
const DICK_SPITZE = 0.2;
/** Wie weit der Saum je Seite ueber die Straehne hinaussteht. */
const SAUM_BREIT = 0.16;
/**
 * Wie weit die Straehne nach aussen ausbaucht, in logischen Pixeln.
 *
 * Die Zahl entscheidet, ob man ueberhaupt etwas sieht, und sie ist an der
 * Figur gemessen: Der Rumpf ist rund sechs logische Pixel breit, die Wurzeln
 * liegen hoechstens 1,1 neben der Mitte. Eine Straehne, die senkrecht faellt,
 * landet also **hinter dem Rumpf** — bei 0,55 war von fuenf Straehnen ein
 * Splitter uebrig. Sichtbar wird sie erst jenseits von drei Pixeln.
 *
 * Aber nicht beliebig weit: Bei 0,72 Anteil der Laenge (bis 4,6 Pixel) rahmen
 * zwei Straehnen die Figur wie eine Klammer und haengen neben ihr statt an
 * ihr. Genommen ist ein fester Sockel plus ein Anteil der Laenge — damit
 * schwingt die lange Straehne weit aus und die kurze bleibt am Kopf, was
 * genau der Unterschied zwischen Seitenhaar und Ponysträhne ist.
 */
const BOGEN_FEST = 0.6;
const BOGEN_ANTEIL = 0.28;
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
}

/**
 * Eine Straehne als Punktzug: erst der Schaedelrundung folgend, dann fallend.
 *
 * Kubisch und nicht gerade, weil eine gerade Straehne ein Draht ist. Der erste
 * Griffpunkt liegt nach aussen und oben — das ist der Bogen ueber dem Ohr, an
 * dem man Haar von Faden unterscheidet.
 */
function bahn(
  x: number,
  y: number,
  aus: number,
  laenge: number,
  bogen: number,
  zx: number,
  zy: number,
  wobbel: number,
): [number, number][] {
  // Der Bogen nach aussen ist ein ABSOLUTES Mass und keines der Laenge.
  //
  // Erst stand hier ein Anteil der Laenge, und die lange Straehne wanderte
  // damit dreieinhalb logische Pixel zur Seite: Zwei davon rahmten die Figur
  // wie eine Klammer, und was hing, hing neben ihr statt an ihr. Haar faellt
  // senkrecht; die Schaedelrundung gibt ihm einen halben Pixel Bauch, mehr
  // nicht — und der bleibt gleich, ob die Straehne kurz oder lang ist.
  const p1x = x + aus * bogen * 0.62;
  const p1y = y + laenge * 0.16;
  const p2x = x + aus * bogen + zx * 0.45;
  const p2y = y + laenge * 0.6 + zy * 0.45;
  // Die Spitze schwingt wieder ein Stueck zurueck — sonst ist die Bahn ein
  // Bogen nach aussen und liest sich als Buegel statt als Straehne.
  const p3x = x + aus * bogen * 0.85 + zx + wobbel;
  const p3y = y + laenge + zy;
  const punkte: [number, number][] = [];
  const N = 12;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const m = 1 - t;
    punkte.push([
      m * m * m * x + 3 * m * m * t * p1x + 3 * m * t * t * p2x + t * t * t * p3x,
      m * m * m * y + 3 * m * m * t * p1y + 3 * m * t * t * p2y + t * t * t * p3y,
    ]);
  }
  return punkte;
}

/** Den Punktzug als Flaeche mit veraenderlicher Dicke fuellen. */
function strich(
  ctx: CanvasRenderingContext2D,
  punkte: readonly [number, number][],
  w0: number,
  w1: number,
  farbe: string,
): void {
  const links: [number, number][] = [];
  const rechts: [number, number][] = [];
  let lx = 0;
  let ly = 1;
  for (let i = 0; i < punkte.length; i++) {
    const t = i / (punkte.length - 1);
    const a = punkte[Math.max(0, i - 1)];
    const b = punkte[Math.min(punkte.length - 1, i + 1)];
    const tx = b[0] - a[0];
    const ty = b[1] - a[1];
    const n = Math.hypot(tx, ty);
    const w = (w0 * (1 - t) + w1 * t) / 2;
    // Steht die Bahn hier still, gilt die letzte brauchbare Richtung.
    //
    // Ohne diesen Griff kippt die Senkrechte an fast stehenden Stellen von
    // einem Bild zum naechsten um, das Vieleck schlaegt sich selbst, und man
    // sieht einen schwarzblauen Saegezahn statt einer Straehne. Genau so sah
    // es beim Fallen aus, wo die Bahn oben umkehrt.
    if (n > 1e-6) {
      lx = -ty / n;
      ly = tx / n;
    }
    links.push([punkte[i][0] + lx * w, punkte[i][1] + ly * w]);
    rechts.push([punkte[i][0] - lx * w, punkte[i][1] - ly * w]);
  }
  ctx.beginPath();
  ctx.moveTo(links[0][0], links[0][1]);
  for (let i = 1; i < links.length; i++) ctx.lineTo(links[i][0], links[i][1]);
  for (let i = rechts.length - 1; i >= 0; i--) ctx.lineTo(rechts[i][0], rechts[i][1]);
  ctx.closePath();
  ctx.fillStyle = farbe;
  ctx.fill();
}

/**
 * Die Straehnen zeichnen. Gehoert **hinter** die Figur — siehe Kopfkommentar.
 *
 * @param pose Name der Pose; sie bestimmt den Nachlauf.
 * @param wurzeln Je Straehne drei Zahlen: Ansatz in logischen Pixeln vom
 *   Fusspunkt aus, dann die Richtung nach **aussen** im Bild (-1 bis 1). Alle
 *   drei misst der Backvorgang je Einzelbild am Haarrand des Modells; die
 *   Richtung kann der Zeichner nicht nachholen, weil er die Kopfdrehung nicht
 *   sieht (siehe `haarwurzeln` in `scripts/bake-figur.mjs`).
 * @param s Bildpunkte je logischem Pixel.
 */
export function drawHaar(
  ctx: CanvasRenderingContext2D,
  pose: string,
  wurzeln: readonly (readonly [number, number, number])[],
  s: number,
  lage: HaarLage = {},
): void {
  if (wurzeln.length === 0) return;
  const [zx, zy] = ZUG[pose] ?? [0, 0];
  const saum = lage.saum ?? null;
  const takt = lage.takt ?? 0;
  // Wie stark sich ein Weg nach hinten ueberhaupt im Bild zeigt.
  const schraeg = Math.sin(((lage.dreh ?? 0) * Math.PI) / 180);
  // Wie gross diese Pose gerade ist, gemessen an ihrer eigenen Kopfachse.
  const mass = (lage.achse ?? ACHSE_NORM) / ACHSE_NORM;

  for (let i = 0; i < wurzeln.length; i++) {
    const [x, y, aus] = wurzeln[i];
    // Die aeusseren Straehnen sind die laengsten. Das ist keine Zierde: Nur
    // sie stehen ueberhaupt neben dem Rumpf, alle anderen faellt der Koerper
    // ab. Wer nach hinten zeigt, bekommt eine kurze — sie kostet nichts.
    const laenge = LAENGE * mass * STAFFEL[i % STAFFEL.length] * (0.5 + 0.5 * Math.abs(aus));
    const bogen = BOGEN_FEST + BOGEN_ANTEIL * laenge;
    // Nach hinten faellt, was nicht zur Seite faellt.
    const zurueck = -RUECK * (1 - Math.abs(aus)) * schraeg;
    // Der Nachlauf gilt der LAENGE nach, nicht als fester Weg.
    //
    // Sonst zieht eine kurze Straehne beim Fallen um 1,7 Pixel nach oben,
    // waehrend sie selbst nur 1,3 misst: Ihre Spitze steht dann hoeher als
    // ihre Wurzel, vier davon nebeneinander, und aus dem Haar wird ein Kamm.
    // Genau so sah der erste Fallversuch aus. Lange Straehnen haengen nach,
    // kurze kaum — das ist auch die Physik.
    const anteil = laenge / (LAENGE * mass);
    const wobbel = Math.sin(takt * 0.16 + i * 2.4) * 0.22;
    const punkte = bahn(
      x * s,
      y * s,
      aus,
      laenge * s,
      bogen * s,
      (zx * anteil + zurueck) * s,
      zy * anteil * s,
      wobbel * s,
    );
    if (saum) {
      strich(
        ctx,
        punkte,
        (DICK_WURZEL + 2 * SAUM_BREIT) * mass * s,
        (DICK_SPITZE + 2 * SAUM_BREIT) * mass * s,
        saum,
      );
    }
    strich(ctx, punkte, DICK_WURZEL * mass * s, DICK_SPITZE * mass * s, HAAR);
  }
}
