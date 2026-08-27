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

import { ketteRuhe } from './haarkette';

/** Der gemessene Grundton der Haarmasse im Blatt: Farbton 228 Grad, L* 37,9. */
const HAAR = '#3851b6';

/**
 * Der Nachlauf steht nicht mehr hier.
 *
 * Bis zum 27.08.2026 stand an dieser Stelle eine Tabelle mit dreizehn festen
 * Versaetzen — je Pose ein Ort, an den der Zeichner die Straehnen schob. Sie
 * ist nach `haarkette.ts` gewandert und dort zu etwas anderem geworden: zu
 * einer LUFT, in der die Kette haengt. Der Unterschied ist der zwischen einem
 * Ort und einer Kraft. Ein Versatz sprang beim Posenwechsel, eine Kraft zieht
 * — und die Kette laeuft ihr nach, in ihrer eigenen Zeit und ueber jeden
 * Zwischenzustand, den niemand vorher eingetragen hat.
 *
 * Der Zeichner rechnet seit dem gar nichts mehr an der Lage: Er bekommt die
 * Kette fertig und setzt sie an die Wurzel.
 */

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
 * Sie haengen an der Laenge und muessen mit ihr wandern — aber nicht so weit,
 * wie der erste Versuch annahm. Bei 1,45 und einer Kette von 3,6 lp waere die
 * Masse 2,9 breit zu 3,6 lang, also eine Kugel. Bei 1,0 war sie 2,0 zu 3,6 —
 * und die Musterkarte zeigte statt einer Masse eine KLINGE: ein schmales
 * spitzes Dreieck neben dem Kopf, genau die einzelne herabhaengende Straehne,
 * die schon einmal abgelehnt wurde. 1,3 zu 0,55 steht bei 2,6 zu 3,6 und liest
 * sich als Schopf.
 */
const DICK_WURZEL = 1.15;
const DICK_SPITZE = 0.5;
/**
 * Wie weit eine Straehne, die nach HINTEN zeigt, im Bild nach hinten faellt.
 *
 * Der Bogen nach aussen hilft nur den beiden Schlaefensträhnen. Die drei am
 * Hinterkopf zeigen im Bild nirgendwohin — sie faellen senkrecht hinter den
 * Rumpf und sind weg. Dabei ist gerade der Nacken die Stelle, an der Haar am
 * ehesten frei haengt: Hinter der Figur steht Himmel oder Erde, kein Koerper.
 *
 * Er haengt NICHT an der Kettenlaenge — das war ein Fehlschluss beim Kuerzen
 * der Kette. Die Musterkarte hat ihn gezeigt: von 2,4 auf 1,4 gesetzt lag fast
 * die ganze Masse hinter dem Rumpf. Diese Zahl beschreibt den KOPF, nicht das
 * Haar: wie weit der Nacken hinter der Kopfmitte liegt.
 *
 * Verkuerzt wird das mit dem Sinus der Posendrehung, und das ist keine
 * Feinheit: Von vorn gesehen faellt Nackenhaar hinter den Kopf und ist im Bild
 * gar nicht versetzt. Ohne den Sinus haengt es beim Blocker — 8 Grad — genauso
 * weit zur Seite wie beim Gehen mit 46, und die Figur bekommt einen Zopf, der
 * bei jeder Posenaenderung springt.
 */
const RUECK = 2.0;

/**
 * Wie weit hinter der gebackenen Wurzelmitte das Haar wirklich ansetzt, in
 * logischen Pixeln bei voller Figurgroesse.
 *
 * **Ohne das haengt der Schopf im Ruhestand hinter dem Rumpf und ist weg, und
 * das ist gemessen.** Im Gangbild spannt der Rumpf von -1,52 bis +2,43 lp um
 * die Figurmitte, die Kappe von -0,91 bis +2,43 — die Mitte der drei
 * gebackenen Wurzeln liegt aber bei +0,36, also VOR der Rueckenkante. Eine
 * Kette, die von dort senkrecht herunterhaengt, faellt vollstaendig hinter den
 * Rumpf. Im Spiel faellt das nicht auf, weil die Laufbewegung die Masse
 * zuruecklegt — aber ein Sperrer steht still, und ein stehender Sperrer hatte
 * dann keine Haare.
 *
 * Der Grund liegt im Backvorgang: Er verteilt die drei Wurzeln um den Kopfrand,
 * und von schraeg vorn gesehen ziehen die vorderen den Mittelwert nach vorn.
 * Langes Haar waechst aber aus dem NACKEN. 1,3 lp ist der gemessene Abstand von
 * dieser Mitte zur hinteren Kappenkante.
 *
 * Wie `RUECK` mit dem Sinus der Posendrehung verkuerzt: Von vorn gesehen liegt
 * der Nacken hinter dem Kopf und im Bild gar nicht daneben. Ohne den Sinus
 * rutschte der Schopf des Sperrers — 8 Grad Drehung — seitlich aus dem Kopf.
 */
const NACKEN = 1.3;

/**
 * Halber Abstand der beiden Schlaefenmassen, in logischen Pixeln.
 *
 * **Der Grund steht in der Musterkarte.** Von der Seite gesehen faellt Haar
 * hinter den Kopf, und eine Masse genuegt. Von VORN gesehen gibt es kein
 * Hinten: Der Sperrer steht mit 8 Grad Drehung fast frontal, `NACKEN` und
 * `RUECK` verkuerzen sich beide mit dem Sinus auf fast nichts, und die Masse
 * fiel senkrecht hinter den Kopf. Uebrig blieben zwei Zipfel links und rechts
 * am Schaedel — die Figur sah aus, als traege sie Ohrenschuetzer. Dasselbe bei
 * Spaehen, Retten und Sterben, also bei genau den vier Posen, in denen der
 * Spieler der Figur ins Gesicht sieht.
 *
 * Von vorn rahmt langes Haar das Gesicht — links und rechts, nicht dahinter.
 * Gezeichnet wird die Kette darum ZWEIMAL, um diesen Betrag nach beiden
 * Seiten versetzt.
 *
 * Der Versatz geht mit dem KOSINUS der Posendrehung, waehrend `NACKEN` mit dem
 * Sinus geht — zusammen wandert der Ansatz auf einem Kreis um den Schaedel.
 * Von vorn stehen die beiden Massen voll auseinander, im Profil schieben sie
 * sich ineinander und ergeben wieder eine. Das ist keine Kunst, sondern die
 * Form eines Kopfes.
 *
 * 1,3 ist gemessen: Beim Sperrer spannt die Kappe von -2,28 bis +2,13 lp um
 * die Figurmitte, ist also 4,40 breit. Zwei Massen von 1,3 Halbdicke bei
 * Versatz 1,3 reichen bis 1,95 — knapp innerhalb des Kopfrandes.
 */
const SPREIZ = 1.3;



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
export function drawHaar(
  ctx: CanvasRenderingContext2D,
  pose: string,
  wurzeln: readonly (readonly [number, number, number])[],
  s: number,
  lage: HaarLage = {},
): void {
  if (wurzeln.length === 0) return;
  // Ohne Figur keine Kette: Die Weltkarte und die Profilauswahl zeichnen
  // dieselbe Frisur ohne Simulation und ohne Gedaechtnis. Sie bekommen die
  // ausgependelte Kette DERSELBEN Physik — frueher stand dafuer eine von Hand
  // abgeschriebene Zahlenreihe hier, und die war schon beim ersten Nachziehen
  // falsch.
  const kette = lage.kette ?? ketteRuhe(pose);
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

  // Wie stark die beiden Schlaefenmassen im Bild auseinanderstehen.
  //
  // Das QUADRAT des Kosinus, nicht der Kosinus. Der reine Kosinus waere die
  // ehrliche Projektion — bei 46 Grad Drehung stehen zwei Schlaefen wirklich
  // 2,3 lp auseinander —, aber er unterschlaegt, dass die hintere der beiden
  // dann hinter dem KOPF liegt und von ihm verdeckt waere. Verdeckt wird sie
  // hier nicht: Gezeichnet wird alles hinter der Figur, und der Kopf deckt nur,
  // was in seinem eigenen Umriss liegt. In der Musterkarte stand die Figur
  // deshalb im Profil unter einer Masse, die breiter war als ihr Kopf. Das
  // Quadrat laesst die beiden im Profil ineinanderfallen und haelt sie von
  // vorn auseinander.
  const kos = Math.cos(((lage.dreh ?? 0) * Math.PI) / 180);
  const breit = kos * kos;

  ctx.save();
  // Der Ansatz wandert in den Nacken — siehe NACKEN.
  ctx.translate((wx - NACKEN * schraeg * mass) * s, wy * s);
  ctx.fillStyle = HAAR;

  // Die Kette als Folge ueberlappender runder Massen, von voll auf ein Drittel.
  //
  // Das ist Celestes Bauart, und sie ist bei dieser Groesse belegt: Madeline
  // ist acht mal elf Bildpunkte gross und traegt vier runde Kleckse, die von
  // voll auf ein Viertel schrumpfen. Ueberlappende Kreise ergeben einen
  // geschlossenen, weichen Umriss — das ist genau das, was bei zwoelf Pixeln
  // ankommt, waehrend eine gezeichnete Straehne dort ein Draht ist.
  //
  // Gezeichnet wird sie ZWEIMAL, nach links und nach rechts versetzt — siehe
  // SPREIZ. Im Profil schieben sich die beiden Massen ineinander und ergeben
  // wieder eine; von vorn rahmen sie das Gesicht.
  for (const seite of [-1, 1]) {
    const quer = seite * SPREIZ * breit * mass;
    let vx = quer;
    let vy = 0;
    for (let i = 0; i < kette.length; i++) {
      const k = kette[i];
      // Die Kette bringt die Lage schon mit. Hier kommt nur noch dazu, was der
      // Zeichner allein weiss: wie schraeg die Pose steht und wie gross sie ist.
      const t = (i + 1) / kette.length;
      const kx = quer + (k[0] - RUECK * (1 - Math.abs(aus)) * schraeg * t) * mass;
      const ky = k[1] * mass;
      const r = (DICK_WURZEL + (DICK_SPITZE - DICK_WURZEL) * t) * mass;
      // Ein Glied ist ein Kegelstumpf zwischen zwei Kreisen: die beiden Kreise
      // und das Viereck dazwischen. Zusammen ergibt das eine Masse ohne Naht.
      kegel(ctx, vx * s, vy * s, (i === 0 ? DICK_WURZEL * mass : r) * s, kx * s, ky * s, r * s);
      vx = kx;
      vy = ky;
    }
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
